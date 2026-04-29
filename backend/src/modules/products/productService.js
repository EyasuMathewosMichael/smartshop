'use strict';

const Product = require('../../models/Product');
const { uploadImages, deleteImage } = require('../../utils/cloudStorage');
const logger = require('../../utils/logger');
const cacheService = require('../../utils/cacheService');

/**
 * Create a new product with optional image uploads.
 *
 * @param {object} productData - Product data (name, price, category, description, stock, etc.)
 * @param {Array<{buffer: Buffer, mimetype: string}>} files - Optional array of image files
 * @returns {Promise<object>} Created product
 */
async function createProduct(productData, files) {
  try {
    // Validate required fields
    if (!productData.name || !productData.price || !productData.category || !productData.description) {
      throw new Error('Missing required fields: name, price, category, and description are required');
    }

    // Upload images if provided
    let images = [];
    if (files && files.length > 0) {
      if (files.length > 5) {
        throw new Error('Maximum 5 images allowed');
      }
      const uploadedImages = await uploadImages(files);
      images = uploadedImages.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: index === 0, // First image is primary
      }));
    }

    // Create product document
    const product = await Product.create({
      ...productData,
      images,
    });

    logger.info(`Product created successfully: ${product._id}`);
    await cacheService.delPattern('*/api/products*');
    return product;
  } catch (error) {
    logger.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Update an existing product with optional new image uploads.
 *
 * @param {string} productId - Product ID
 * @param {object} updates - Fields to update
 * @param {Array<{buffer: Buffer, mimetype: string}>} files - Optional array of new image files
 * @returns {Promise<object>} Updated product
 */
async function updateProduct(productId, updates, files) {
  try {
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Merge updates
    Object.assign(product, updates);

    // Handle new image uploads
    if (files && files.length > 0) {
      const currentImageCount = product.images.length;
      const newImageCount = files.length;
      const totalImages = currentImageCount + newImageCount;

      if (totalImages > 5) {
        throw new Error(`Cannot add ${newImageCount} images. Maximum 5 images allowed (current: ${currentImageCount})`);
      }

      const uploadedImages = await uploadImages(files);
      const newImages = uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: false,
      }));

      product.images.push(...newImages);
    }

    await product.save();
    logger.info(`Product updated successfully: ${productId}`);
    await cacheService.delPattern('*/api/products*');
    return product;
  } catch (error) {
    logger.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete a product (soft delete by setting isAvailable to false).
 * Deletes all associated cloud images.
 *
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Deleted product
 */
async function deleteProduct(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete all cloud images
    for (const image of product.images) {
      if (image.publicId) {
        try {
          await deleteImage(image.publicId);
        } catch (err) {
          logger.warn(`Failed to delete image ${image.publicId}:`, err);
        }
      }
    }

    // Soft delete
    product.isAvailable = false;
    await product.save();

    logger.info(`Product deleted successfully: ${productId}`);
    await cacheService.delPattern('*/api/products*');
    return product;
  } catch (error) {
    logger.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Get products with filtering, sorting, and pagination.
 *
 * @param {object} filters - {category, minPrice, maxPrice, search, sortBy, sortOrder}
 * @param {object} pagination - {page, limit}
 * @returns {Promise<{products: Array, total: number, pages: number, page: number}>}
 */
async function getProducts(filters = {}, pagination = {}) {
  try {
    const { category, minPrice, maxPrice, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 10 } = pagination;

    // Build query
    const query = { isAvailable: true };

    if (category) {
      query.category = category.toLowerCase();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return {
      products,
      total,
      pages,
      page: Number(page),
    };
  } catch (error) {
    logger.error('Error getting products:', error);
    throw error;
  }
}

/**
 * Search products using MongoDB text search.
 *
 * @param {string} query - Search query string
 * @param {object} filters - Optional {category, minPrice, maxPrice}
 * @returns {Promise<Array>} Array of products sorted by relevance
 */
async function searchProducts(query, filters = {}) {
  try {
    const { category, minPrice, maxPrice } = filters;

    // Build search query
    const searchQuery = {
      $text: { $search: query },
      isAvailable: true,
    };

    if (category) {
      searchQuery.category = category.toLowerCase();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.price = {};
      if (minPrice !== undefined) {
        searchQuery.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        searchQuery.price.$lte = Number(maxPrice);
      }
    }

    // Execute search with text score
    const products = await Product.find(searchQuery, {
      score: { $meta: 'textScore' },
    }).sort({ score: { $meta: 'textScore' } });

    return products;
  } catch (error) {
    logger.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get a single product by ID.
 *
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Product
 */
async function getProductById(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  } catch (error) {
    logger.error('Error getting product by ID:', error);
    throw error;
  }
}

/**
 * Reorder product images.
 *
 * @param {string} productId - Product ID
 * @param {Array<string>} imageOrder - Array of publicIds in desired order
 * @returns {Promise<object>} Updated product
 */
async function reorderImages(productId, imageOrder) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Create a map of publicId to image object
    const imageMap = new Map();
    product.images.forEach(img => {
      imageMap.set(img.publicId, img);
    });

    // Reorder images based on imageOrder array
    const reorderedImages = [];
    for (const publicId of imageOrder) {
      const image = imageMap.get(publicId);
      if (image) {
        reorderedImages.push(image);
      }
    }

    // Set first image as primary
    reorderedImages.forEach((img, index) => {
      img.isPrimary = index === 0;
    });

    product.images = reorderedImages;
    await product.save();

    logger.info(`Product images reordered successfully: ${productId}`);
    return product;
  } catch (error) {
    logger.error('Error reordering images:', error);
    throw error;
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  searchProducts,
  getProductById,
  reorderImages,
};
