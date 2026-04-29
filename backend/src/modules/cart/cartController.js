'use strict';

const cartService = require('./cartService');
const logger = require('../../utils/logger');

/**
 * Get the current user's cart.
 *
 * @route GET /api/cart
 */
async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.userId);
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    logger.error('Get cart error:', error);
    next(error);
  }
}

/**
 * Add an item to the cart.
 *
 * @route POST /api/cart/items
 */
async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user.userId, productId, quantity);
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    next(error);
  }
}

/**
 * Update the quantity of a cart item.
 *
 * @route PUT /api/cart/items/:productId
 */
async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user.userId, req.params.productId, quantity);
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    logger.error('Update cart item error:', error);
    next(error);
  }
}

/**
 * Remove an item from the cart.
 *
 * @route DELETE /api/cart/items/:productId
 */
async function removeFromCart(req, res, next) {
  try {
    const cart = await cartService.removeFromCart(req.user.userId, req.params.productId);
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    next(error);
  }
}

/**
 * Clear all items from the cart.
 *
 * @route DELETE /api/cart
 */
async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    logger.error('Clear cart error:', error);
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
