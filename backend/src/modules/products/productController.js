'use strict';

const productService = require('./productService');
const logger = require('../../utils/logger');

/**
 * Get products with filtering, sorting, and pagination.
 *
 * @route GET /api/products
 */
async function getProducts(req, res, next) {
  try {
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await productService.getProducts(filters, pagination);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get products error:', error);
    next(error);
  }
}

/**
 * Get a single product by ID.
 *
 * @route GET /api/products/:id
 */
async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error('Get product by ID error:', error);
    next(error);
  }
}

/**
 * Search products using text search.
 *
 * @route GET /api/products/search
 */
async function searchProducts(req, res, next) {
  try {
    const query = req.query.q;
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    const products = await productService.searchProducts(query, filters);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    logger.error('Search products error:', error);
    next(error);
  }
}

/**
 * Create a new product.
 *
 * @route POST /api/products
 */
async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body, req.files);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
}

/**
 * Update an existing product.
 *
 * @route PUT /api/products/:id
 */
async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.files);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error('Update product error:', error);
    next(error);
  }
}

/**
 * Delete a product.
 *
 * @route DELETE /api/products/:id
 */
async function deleteProduct(req, res, next) {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    next(error);
  }
}

/**
 * Reorder product images.
 *
 * @route PUT /api/products/:id/images/reorder
 */
async function reorderImages(req, res, next) {
  try {
    const product = await productService.reorderImages(req.params.id, req.body.imageOrder);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error('Reorder images error:', error);
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderImages,
};
