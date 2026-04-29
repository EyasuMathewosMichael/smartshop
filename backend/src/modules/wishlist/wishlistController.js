'use strict';

const wishlistService = require('./wishlistService');
const logger = require('../../utils/logger');

/**
 * Get the current user's wishlist.
 *
 * @route GET /api/wishlist
 */
async function getWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.userId);
    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    logger.error('Get wishlist error:', error);
    next(error);
  }
}

/**
 * Add a product to the wishlist.
 *
 * @route POST /api/wishlist/:productId
 */
async function addToWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.addToWishlist(
      req.user.userId,
      req.params.productId
    );
    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    logger.error('Add to wishlist error:', error);
    next(error);
  }
}

/**
 * Remove a product from the wishlist.
 *
 * @route DELETE /api/wishlist/:productId
 */
async function removeFromWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.removeFromWishlist(
      req.user.userId,
      req.params.productId
    );
    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    next(error);
  }
}

/**
 * Move a product from the wishlist to the cart.
 *
 * @route POST /api/wishlist/:productId/move-to-cart
 */
async function moveToCart(req, res, next) {
  try {
    const result = await wishlistService.moveToCart(
      req.user.userId,
      req.params.productId
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Move to cart error:', error);
    next(error);
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
