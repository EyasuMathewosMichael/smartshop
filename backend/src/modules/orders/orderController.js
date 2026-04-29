'use strict';

const orderService = require('./orderService');
const logger = require('../../utils/logger');

/**
 * Create a new order from the user's cart.
 *
 * @route POST /api/orders
 */
async function createOrder(req, res, next) {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await orderService.createOrder(
      req.user.userId,
      shippingAddress,
      paymentMethod
    );
    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
}

/**
 * Get all orders for the current user.
 *
 * @route GET /api/orders
 */
async function getUserOrders(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await orderService.getUserOrders(req.user.userId, { page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get user orders error:', error);
    next(error);
  }
}

/**
 * Get a single order by ID for the current user.
 *
 * @route GET /api/orders/:id
 */
async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.userId,
      false
    );
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Get order by ID error:', error);
    next(error);
  }
}

/**
 * Get all orders (admin).
 *
 * @route GET /api/admin/orders
 */
async function getAllOrders(req, res, next) {
  try {
    const { orderStatus, paymentStatus, startDate, endDate, page, limit } = req.query;
    const filters = { orderStatus, paymentStatus, startDate, endDate };
    const result = await orderService.getAllOrders(filters, { page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get all orders error:', error);
    next(error);
  }
}

/**
 * Update order status (admin).
 *
 * @route PUT /api/admin/orders/:id
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status, trackingInfo, note } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      trackingInfo,
      note
    );
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    next(error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
