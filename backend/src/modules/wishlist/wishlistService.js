'use strict';

const Wishlist = require('../../models/Wishlist');
const logger = require('../../utils/logger');

/**
 * Add a product to the user's wishlist.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Updated wishlist
 */
async function addToWishlist(userId, productId) {
  try {
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if product already in wishlist
    const alreadyPresent = wishlist.products.some(
      (item) => item.productId.toString() === productId.toString()
    );

    if (!alreadyPresent) {
      wishlist.products.push({ productId, addedAt: new Date() });
      await wishlist.save();
    }

    logger.info(`Product added to wishlist: userId=${userId}, productId=${productId}`);
    return wishlist;
  } catch (error) {
    logger.error('Error adding to wishlist:', error);
    throw error;
  }
}

/**
 * Remove a product from the user's wishlist.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Updated wishlist
 */
async function removeFromWishlist(userId, productId) {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return { products: [] };
    }

    wishlist.products.pull({ productId });
    await wishlist.save();

    logger.info(`Product removed from wishlist: userId=${userId}, productId=${productId}`);
    return wishlist;
  } catch (error) {
    logger.error('Error removing from wishlist:', error);
    throw error;
  }
}

/**
 * Get the user's wishlist with populated product details.
 *
 * @param {string} userId - User ID
 * @returns {Promise<object>} Populated wishlist
 */
async function getWishlist(userId) {
  try {
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name price images isAvailable stock',
    });

    if (!wishlist) {
      return { products: [] };
    }

    return wishlist;
  } catch (error) {
    logger.error('Error getting wishlist:', error);
    throw error;
  }
}

/**
 * Move a product from the wishlist to the cart.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<{cart: object, wishlist: object}>}
 */
async function moveToCart(userId, productId) {
  try {
    // Import cartService here to avoid circular dependency issues
    const cartService = require('../cart/cartService');

    // Add to cart
    const cart = await cartService.addToCart(userId, productId, 1);

    // Remove from wishlist
    const wishlist = await removeFromWishlist(userId, productId);

    logger.info(`Product moved to cart: userId=${userId}, productId=${productId}`);
    return { cart, wishlist };
  } catch (error) {
    logger.error('Error moving to cart:', error);
    throw error;
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  moveToCart,
};
