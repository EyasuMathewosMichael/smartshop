'use strict';

const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');
const logger = require('../../utils/logger');

/**
 * Build a date range query object.
 *
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {object} MongoDB date range query
 */
function buildDateRangeQuery(dateRange = {}) {
  const query = {};
  if (dateRange.startDate || dateRange.endDate) {
    query.createdAt = {};
    if (dateRange.startDate) {
      query.createdAt.$gte = new Date(dateRange.startDate);
    }
    if (dateRange.endDate) {
      query.createdAt.$lte = new Date(dateRange.endDate);
    }
  }
  return query;
}

/**
 * Get total revenue from completed orders.
 *
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {Promise<{totalRevenue: number, orderCount: number}>}
 */
async function getTotalRevenue(dateRange = {}) {
  try {
    const dateQuery = buildDateRangeQuery(dateRange);

    const result = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          ...dateQuery,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalRevenue: 0, orderCount: 0 };
    }

    return {
      totalRevenue: result[0].totalRevenue,
      orderCount: result[0].orderCount,
    };
  } catch (error) {
    logger.error('Error getting total revenue:', error);
    throw error;
  }
}

/**
 * Get order statistics grouped by status.
 *
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {Promise<Array<{status: string, count: number}>>}
 */
async function getOrderStats(dateRange = {}) {
  try {
    const dateQuery = buildDateRangeQuery(dateRange);

    const result = await Order.aggregate([
      {
        $match: dateQuery,
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting order stats:', error);
    throw error;
  }
}

/**
 * Get revenue trends over a period.
 *
 * @param {'day'|'week'|'month'} period - Grouping period
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {Promise<Array<{date: string, revenue: number}>>}
 */
async function getRevenueTrends(period = 'day', dateRange = {}) {
  try {
    const dateQuery = buildDateRangeQuery(dateRange);

    // Determine date format based on period
    const formatMap = {
      day: '%Y-%m-%d',
      week: '%Y-%U',
      month: '%Y-%m',
    };
    const dateFormat = formatMap[period] || '%Y-%m-%d';

    const result = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          ...dateQuery,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting revenue trends:', error);
    throw error;
  }
}

/**
 * Get top-selling products.
 *
 * @param {number} limit - Number of products to return
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {Promise<Array<{productId: string, name: string, totalSold: number}>>}
 */
async function getTopProducts(limit = 10, dateRange = {}) {
  try {
    const dateQuery = buildDateRangeQuery(dateRange);

    const result = await Order.aggregate([
      {
        $match: dateQuery,
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: { $arrayElemAt: ['$product.name', 0] },
          totalSold: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting top products:', error);
    throw error;
  }
}

/**
 * Get average order value.
 *
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {Promise<number>} Average order value
 */
async function getAverageOrderValue(dateRange = {}) {
  try {
    const { totalRevenue, orderCount } = await getTotalRevenue(dateRange);
    if (orderCount === 0) {
      return 0;
    }
    return totalRevenue / orderCount;
  } catch (error) {
    logger.error('Error getting average order value:', error);
    throw error;
  }
}

/**
 * Get customer metrics.
 *
 * @param {{startDate?: string, endDate?: string}} dateRange
 * @returns {Promise<{newCustomers: number}>}
 */
async function getCustomerMetrics(dateRange = {}) {
  try {
    const dateQuery = buildDateRangeQuery(dateRange);

    const newCustomers = await User.countDocuments(dateQuery);

    return { newCustomers };
  } catch (error) {
    logger.error('Error getting customer metrics:', error);
    throw error;
  }
}

module.exports = {
  getTotalRevenue,
  getOrderStats,
  getRevenueTrends,
  getTopProducts,
  getAverageOrderValue,
  getCustomerMetrics,
};
