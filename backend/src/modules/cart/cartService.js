'use strict';

const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const {
  calculateCartTotal,
  validateProductAvailability,
  validateCartAvailability,
} = require('../../utils/cartCalculations');
const logger = require('../../utils/logger');

/**
 * Add a product to the user's cart.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<object>} Updated cart
 */
async function addToCart(userId, productId, quantity) {
  try {
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate availability
    if (!validateProductAvailability(product, quantity)) {
      const error = new Error('Product is not available in the requested quantity');
      error.statusCode = 400;
      throw error;
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Validate new quantity
      if (!validateProductAvailability(product, newQuantity)) {
        const error = new Error('Product is not available in the requested quantity');
        error.statusCode = 400;
        throw error;
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item with current price snapshot
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate('items.productId');
    logger.info(`Product added to cart: userId=${userId}, productId=${productId}`);
    return cart;
  } catch (error) {
    logger.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update the quantity of a cart item.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<object>} Updated cart
 */
async function updateCartItem(userId, productId, quantity) {
  try {
    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    // Find item
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      const error = new Error('Item not found in cart');
      error.statusCode = 404;
      throw error;
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate availability for new quantity
    if (!validateProductAvailability(product, quantity)) {
      const error = new Error('Product is not available in the requested quantity');
      error.statusCode = 400;
      throw error;
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate('items.productId');
    logger.info(`Cart item updated: userId=${userId}, productId=${productId}`);
    return cart;
  } catch (error) {
    logger.error('Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove a product from the cart.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Updated cart
 */
async function removeFromCart(userId, productId) {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    // Remove item
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId');
    logger.info(`Item removed from cart: userId=${userId}, productId=${productId}`);
    return cart;
  } catch (error) {
    logger.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Get the user's cart with populated product details and recalculated totals.
 *
 * @param {string} userId - User ID
 * @returns {Promise<{items: Array, subtotal: number, total: number, itemCount: number}>}
 */
async function getCart(userId) {
  try {
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price images stock isAvailable',
    });

    if (!cart) {
      // Return empty cart
      return {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
      };
    }

    // Recalculate totals
    const { subtotal, total } = calculateCartTotal(cart.items);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cart.items,
      subtotal,
      total,
      itemCount,
    };
  } catch (error) {
    logger.error('Error getting cart:', error);
    throw error;
  }
}

/**
 * Clear all items from the user's cart.
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function clearCart(userId) {
  try {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
      logger.info(`Cart cleared: userId=${userId}`);
    }
  } catch (error) {
    logger.error('Error clearing cart:', error);
    throw error;
  }
}

/**
 * Validate all items in the user's cart for availability.
 *
 * @param {string} userId - User ID
 * @returns {Promise<{valid: boolean, unavailableItems: Array}>}
 */
async function validateCart(userId) {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return { valid: true, unavailableItems: [] };
    }

    // Fetch all products
    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Create product map
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    // Validate cart
    const unavailableItems = validateCartAvailability(cart.items, productMap);

    return {
      valid: unavailableItems.length === 0,
      unavailableItems,
    };
  } catch (error) {
    logger.error('Error validating cart:', error);
    throw error;
  }
}

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  clearCart,
  validateCart,
};
