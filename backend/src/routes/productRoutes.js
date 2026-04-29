'use strict';

const express = require('express');
const productController = require('../modules/products/productController');
const authenticate = require('../middleware/authenticate');
const { authorizeAdmin } = require('../middleware/authorize');
const { uploadMultiple } = require('../middleware/upload');
const cacheService = require('../utils/cacheService');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get('/', cacheService.cacheMiddleware(300), productController.getProducts);

/**
 * @route   GET /api/products/search
 * @desc    Search products using text search
 * @access  Public
 */
router.get('/search', productController.searchProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorizeAdmin, uploadMultiple, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, authorizeAdmin, uploadMultiple, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct);

/**
 * @route   PUT /api/products/:id/images/reorder
 * @desc    Reorder product images
 * @access  Private (Admin only)
 */
router.put('/:id/images/reorder', authenticate, authorizeAdmin, productController.reorderImages);

module.exports = router;
