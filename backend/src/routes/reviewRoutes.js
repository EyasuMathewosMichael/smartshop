'use strict';

const express = require('express');
const reviewController = require('../modules/reviews/reviewController');
const authenticate = require('../middleware/authenticate');

const router = express.Router({ mergeParams: true });

/**
 * @route   GET /api/products/:id/reviews
 * @desc    Get all reviews for a product
 * @access  Public
 */
router.get('/products/:id/reviews', reviewController.getProductReviews);

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Create a review for a product
 * @access  Private
 */
router.post('/products/:id/reviews', authenticate, reviewController.createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private
 */
router.put('/reviews/:id', authenticate, reviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

module.exports = router;
