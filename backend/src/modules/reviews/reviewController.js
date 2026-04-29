'use strict';

const reviewService = require('./reviewService');
const logger = require('../../utils/logger');

/**
 * Get all reviews for a product.
 *
 * @route GET /api/products/:id/reviews
 */
async function getProductReviews(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await reviewService.getProductReviews(req.params.id, { page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get product reviews error:', error);
    next(error);
  }
}

/**
 * Create a review for a product.
 *
 * @route POST /api/products/:id/reviews
 */
async function createReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const review = await reviewService.createReview(
      req.user.userId,
      req.params.id,
      rating,
      comment
    );
    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    logger.error('Create review error:', error);
    next(error);
  }
}

/**
 * Update a review.
 *
 * @route PUT /api/reviews/:id
 */
async function updateReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const review = await reviewService.updateReview(
      req.params.id,
      req.user.userId,
      { rating, comment }
    );
    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    logger.error('Update review error:', error);
    next(error);
  }
}

/**
 * Delete a review.
 *
 * @route DELETE /api/reviews/:id
 */
async function deleteReview(req, res, next) {
  try {
    await reviewService.deleteReview(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    logger.error('Delete review error:', error);
    next(error);
  }
}

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};
