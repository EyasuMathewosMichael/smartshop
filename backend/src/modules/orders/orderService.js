'use strict';

const Order = require('../../models/Order');
const User = require('../../models/User');
const cartService = require('../cart/cartService');
const exchangeRateService = require('../../utils/exchangeRateService');
const emailService = require('../email/emailService');
const {
  generateOrderNumber,
  calculateOrderTotal,
  isValidStatusTransition,
} = require('../../utils/orderUtils');
const logger = require('../../utils/logger');

/**
 * Create a new order from the user's cart.
 *
 * @param {string} userId - User ID
 * @param {object} shippingAddress - Shipping address details
 * @param {string} paymentMethod - Payment method ('stripe' or 'chapa')
 * @returns {Promise<object>} Created order
 */
async function createOrder(userId, shippingAddress, paymentMethod) {
  try {
    // Get cart
    const cart = await cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    // Validate cart
    const validation = await cartService.validateCart(userId);
    if (!validation.valid) {
      const error = new Error('Some items in your cart are unavailable');
      error.statusCode = 400;
      error.unavailableItems = validation.unavailableItems;
      throw error;
    }

    // Get exchange rate
    const exchangeRate = await exchangeRateService.getLatestRate();

    // Determine currency
    const currency = paymentMethod === 'chapa' ? 'ETB' : 'USD';

    // Calculate order total
    const { subtotal, tax, shippingCost, total } = calculateOrderTotal(
      cart.items,
      currency,
      exchangeRate
    );

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Snapshot items from cart — convert prices to ETB if needed
    const items = cart.items.map((item) => {
      const product = item.productId; // populated product
      const price = currency === 'ETB' ? parseFloat((item.price * exchangeRate).toFixed(2)) : item.price;
      return {
        productId: product._id || product,
        name: product.name || item.name,
        price,
        quantity: item.quantity,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
      };
    });

    // Create order
    const order = new Order({
      orderNumber,
      userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created',
        },
      ],
      subtotal,
      tax,
      shippingCost,
      total,
      currency,
    });

    await order.save();

    // Clear cart
    await cartService.clearCart(userId);

    logger.info(`Order created: ${orderNumber} for userId=${userId}`);
    return order;
  } catch (error) {
    logger.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update the status of an order.
 *
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status
 * @param {object|null} trackingInfo - Tracking information (required for 'shipped')
 * @param {string} note - Status history note
 * @returns {Promise<object>} Updated order
 */
async function updateOrderStatus(orderId, newStatus, trackingInfo, note) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate status transition
    if (!isValidStatusTransition(order.orderStatus, newStatus)) {
      const error = new Error(
        `Invalid status transition from '${order.orderStatus}' to '${newStatus}'`
      );
      error.statusCode = 400;
      throw error;
    }

    // Require tracking number when shipping
    if (newStatus === 'shipped') {
      if (!trackingInfo || !trackingInfo.trackingNumber) {
        const error = new Error('Tracking number is required when shipping an order');
        error.statusCode = 400;
        throw error;
      }
    }

    // Update status
    order.orderStatus = newStatus;

    // Append to status history
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: note || '',
    });

    // Set tracking info when shipped
    if (newStatus === 'shipped') {
      order.trackingInfo = trackingInfo;
    }

    // Set estimated delivery when delivered
    if (newStatus === 'delivered') {
      if (!order.trackingInfo) {
        order.trackingInfo = {};
      }
      order.trackingInfo.estimatedDelivery = new Date();
    }

    await order.save();
    logger.info(`Order ${orderId} status updated to '${newStatus}'`);

    // Send email notifications (non-blocking)
    try {
      const user = await User.findById(order.userId);
      if (user) {
        if (newStatus === 'shipped') {
          emailService
            .sendShippingNotification(user.email, order, order.trackingInfo || {})
            .catch((err) => logger.error('Shipping notification email failed:', err));
        } else if (newStatus === 'delivered') {
          emailService
            .sendDeliveryConfirmation(user.email, order)
            .catch((err) => logger.error('Delivery confirmation email failed:', err));
        }
      }
    } catch (emailErr) {
      logger.error('Error sending status email:', emailErr);
    }

    return order;
  } catch (error) {
    logger.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get all orders for a user with pagination.
 *
 * @param {string} userId - User ID
 * @param {{page: number, limit: number}} pagination - Pagination options
 * @returns {Promise<{orders: Array, total: number, pages: number, page: number}>}
 */
async function getUserOrders(userId, pagination = {}) {
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId }),
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    logger.error('Error getting user orders:', error);
    throw error;
  }
}

/**
 * Get all orders with optional filters and pagination (admin).
 *
 * @param {{orderStatus?: string, paymentStatus?: string, startDate?: string, endDate?: string}} filters
 * @param {{page: number, limit: number}} pagination
 * @returns {Promise<{orders: Array, total: number, pages: number, page: number}>}
 */
async function getAllOrders(filters = {}, pagination = {}) {
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (filters.orderStatus) {
      query.orderStatus = filters.orderStatus;
    }
    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    logger.error('Error getting all orders:', error);
    throw error;
  }
}

/**
 * Get a single order by ID.
 *
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for ownership check)
 * @param {boolean} isAdmin - Whether the requester is an admin
 * @returns {Promise<object>} Order
 */
async function getOrderById(orderId, userId, isAdmin) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership if not admin
    if (!isAdmin && order.userId.toString() !== userId.toString()) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    return order;
  } catch (error) {
    logger.error('Error getting order by ID:', error);
    throw error;
  }
}

module.exports = {
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getAllOrders,
  getOrderById,
};
