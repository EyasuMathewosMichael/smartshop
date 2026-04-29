'use strict';

const express = require('express');
const orderController = require('../modules/orders/orderController');
const userController = require('../modules/users/userController');
const analyticsController = require('../modules/analytics/analyticsController');
const authenticate = require('../middleware/authenticate');
const { authorizeAdmin } = require('../middleware/authorize');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with optional filters (admin)
 * @access  Admin
 */
router.get('/orders', orderController.getAllOrders);

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order status (admin)
 * @access  Admin
 */
router.put('/orders/:id', orderController.updateOrderStatus);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with optional filters (admin)
 * @access  Admin
 */
router.get('/users', userController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a user by ID (admin)
 * @access  Admin
 */
router.get('/users/:id', userController.getUserById);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update a user's role (admin)
 * @access  Admin
 */
router.put('/users/:id/role', userController.updateUserRole);

/**
 * @route   PUT /api/admin/users/:id/deactivate
 * @desc    Deactivate a user account (admin)
 * @access  Admin
 */
router.put('/users/:id/deactivate', userController.deactivateUser);

/**
 * @route   PUT /api/admin/users/:id/reactivate
 * @desc    Reactivate a user account (admin)
 * @access  Admin
 */
router.put('/users/:id/reactivate', userController.reactivateUser);

/**
 * @route   GET /api/admin/analytics/revenue
 * @desc    Get total revenue analytics
 * @access  Admin
 */
router.get('/analytics/revenue', analyticsController.getRevenue);

/**
 * @route   GET /api/admin/analytics/orders
 * @desc    Get order statistics
 * @access  Admin
 */
router.get('/analytics/orders', analyticsController.getOrderStats);

/**
 * @route   GET /api/admin/analytics/trends
 * @desc    Get revenue trends
 * @access  Admin
 */
router.get('/analytics/trends', analyticsController.getRevenueTrends);

/**
 * @route   GET /api/admin/analytics/top-products
 * @desc    Get top-selling products
 * @access  Admin
 */
router.get('/analytics/top-products', analyticsController.getTopProducts);

/**
 * @route   GET /api/admin/analytics/customers
 * @desc    Get customer metrics
 * @access  Admin
 */
router.get('/analytics/customers', analyticsController.getCustomerMetrics);

module.exports = router;
