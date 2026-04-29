'use strict';

const express = require('express');
const cartController = require('../modules/cart/cartController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Get the current user's cart
 * @access  Private
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add an item to the cart
 * @access  Private
 */
router.post('/items', cartController.addToCart);

/**
 * @route   PUT /api/cart/items/:productId
 * @desc    Update the quantity of a cart item
 * @access  Private
 */
router.put('/items/:productId', cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove an item from the cart
 * @access  Private
 */
router.delete('/items/:productId', cartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear all items from the cart
 * @access  Private
 */
router.delete('/', cartController.clearCart);

module.exports = router;
