'use strict';

const mongoose = require('mongoose');
const Review = require('../../models/Review');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const logger = require('../../utils/logger');

/**
 * Verify if a user has purchased a product.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>} True if user has purchased the product
 */
async function verifyPurchase(userId, productId) {
  try {
    const order = await Order.findOne({
      userId,
      orderStatus: { $in: ['paid', 'shipped', 'delivered'] },
      'items.productId': new mongoose.Types.ObjectId(productId),
    });

    return !!order;
  } catch (error) {
    logger.error('Error verifying purchase:', error);
    throw error;
  }
}

/**
 * Create a new review for a product.
 *
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Review comment
 * @returns {Promise<object>} Created review
 */
async function createReview(userId, productId, rating, comment) {
  try {
    // Verify purchase
    const hasPurchased = await verifyPurchase(userId, productId);
    if (!hasPurchased) {
      const error = new Error('You must purchase this product before reviewing it');
      error.statusCode = 403;
      throw error;
    }

    // Check for existing review
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      const error = new Error('You have already reviewed this product');
      error.statusCode = 409;
      throw error;
    }

    // Create review
    const review = await Review.create({
      userId,
      productId,
      rating,
      comment,
    });

    // Recalculate average rating
    await recalculateAverageRating(productId);

    logger.info(`Review created: userId=${userId}, productId=${productId}`);
    return review;
  } catch (error) {
    logger.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Update an existing review.
 *
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @param {object} updates - Updates object with rating and/or comment
 * @returns {Promise<object>} Updated review
 */
async function updateReview(reviewId, userId, updates) {
  try {
    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify ownership
    if (review.userId.toString() !== userId.toString()) {
      const error = new Error('You can only update your own reviews');
      error.statusCode = 403;
      throw error;
    }

    // Update fields
    if (updates.rating !== undefined) {
      review.rating = updates.rating;
    }
    if (updates.comment !== undefined) {
      review.comment = updates.comment;
    }

    await review.save();

    // Recalculate average rating
    await recalculateAverageRating(review.productId);

    logger.info(`Review updated: reviewId=${reviewId}`);
    return review;
  } catch (error) {
    logger.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review.
 *
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteReview(reviewId, userId) {
  try {
    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify ownership
    if (review.userId.toString() !== userId.toString()) {
      const error = new Error('You can only delete your own reviews');
      error.statusCode = 403;
      throw error;
    }

    const productId = review.productId;

    // Delete review
    await Review.deleteOne({ _id: reviewId });

    // Recalculate average rating
    await recalculateAverageRating(productId);

    logger.info(`Review deleted: reviewId=${reviewId}`);
    return true;
  } catch (error) {
    logger.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Get all reviews for a product with pagination.
 *
 * @param {string} productId - Product ID
 * @param {{page: number, limit: number}} pagination - Pagination options
 * @returns {Promise<{reviews: Array, total: number, pages: number, page: number}>}
 */
async function getProductReviews(productId, pagination = {}) {
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name'),
      Review.countDocuments({ productId }),
    ]);

    return {
      reviews,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    logger.error('Error getting product reviews:', error);
    throw error;
  }
}

/**
 * Recalculate and update the average rating for a product.
 *
 * @param {string} productId - Product ID
 * @returns {Promise<{averageRating: number, reviewCount: number}>}
 */
async function recalculateAverageRating(productId) {
  try {
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    let averageRating = 0;
    let reviewCount = 0;

    if (result.length > 0) {
      averageRating = Math.round(result[0].averageRating * 10) / 10; // Round to 1 decimal
      reviewCount = result[0].reviewCount;
    }

    // Update product
    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount,
    });

    logger.info(
      `Average rating recalculated for productId=${productId}: ${averageRating} (${reviewCount} reviews)`
    );

    return { averageRating, reviewCount };
  } catch (error) {
    logger.error('Error recalculating average rating:', error);
    throw error;
  }
}

module.exports = {
  verifyPurchase,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  recalculateAverageRating,
};
