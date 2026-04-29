'use strict';

const express = require('express');
const orderController = require('../modules/orders/orderController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Create a new order from cart
 * @access  Private
 */
router.post('/', orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the current user
 * @access  Private
 */
router.get('/', orderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Private
 */
router.get('/:id', orderController.getOrderById);

module.exports = router;
