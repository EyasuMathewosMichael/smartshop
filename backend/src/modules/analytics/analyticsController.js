'use strict';

const analyticsService = require('./analyticsService');
const logger = require('../../utils/logger');

/**
 * Get total revenue.
 *
 * @route GET /api/admin/analytics/revenue
 */
async function getRevenue(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const result = await analyticsService.getTotalRevenue({ startDate, endDate });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get revenue error:', error);
    next(error);
  }
}

/**
 * Get order statistics.
 *
 * @route GET /api/admin/analytics/orders
 */
async function getOrderStats(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analyticsService.getOrderStats({ startDate, endDate });
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Get order stats error:', error);
    next(error);
  }
}

/**
 * Get revenue trends.
 *
 * @route GET /api/admin/analytics/trends
 */
async function getRevenueTrends(req, res, next) {
  try {
    const { period, startDate, endDate } = req.query;
    const trends = await analyticsService.getRevenueTrends(period, { startDate, endDate });
    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    logger.error('Get revenue trends error:', error);
    next(error);
  }
}

/**
 * Get top-selling products.
 *
 * @route GET /api/admin/analytics/top-products
 */
async function getTopProducts(req, res, next) {
  try {
    const { limit, startDate, endDate } = req.query;
    const products = await analyticsService.getTopProducts(limit, { startDate, endDate });
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    logger.error('Get top products error:', error);
    next(error);
  }
}

/**
 * Get customer metrics.
 *
 * @route GET /api/admin/analytics/customers
 */
async function getCustomerMetrics(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const metrics = await analyticsService.getCustomerMetrics({ startDate, endDate });
    res.status(200).json({
      success: true,
      ...metrics,
    });
  } catch (error) {
    logger.error('Get customer metrics error:', error);
    next(error);
  }
}

module.exports = {
  getRevenue,
  getOrderStats,
  getRevenueTrends,
  getTopProducts,
  getCustomerMetrics,
};
