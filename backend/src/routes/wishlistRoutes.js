'use strict';

const express = require('express');
const wishlistController = require('../modules/wishlist/wishlistController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/wishlist
 * @desc    Get the current user's wishlist
 * @access  Private
 */
router.get('/', wishlistController.getWishlist);

/**
 * @route   POST /api/wishlist/:productId
 * @desc    Add a product to the wishlist
 * @access  Private
 */
router.post('/:productId', wishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove a product from the wishlist
 * @access  Private
 */
router.delete('/:productId', wishlistController.removeFromWishlist);

/**
 * @route   POST /api/wishlist/:productId/move-to-cart
 * @desc    Move a product from the wishlist to the cart
 * @access  Private
 */
router.post('/:productId/move-to-cart', wishlistController.moveToCart);

module.exports = router;
