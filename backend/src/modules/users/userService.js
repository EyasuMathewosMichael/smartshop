'use strict';

const User = require('../../models/User');
const Order = require('../../models/Order');
const logger = require('../../utils/logger');

/**
 * Get all users with optional filters and pagination (admin).
 *
 * @param {{search?: string}} filters - Filter options
 * @param {{page: number, limit: number}} pagination - Pagination options
 * @returns {Promise<{users: Array, total: number, pages: number, page: number}>}
 */
async function getAllUsers(filters = {}, pagination = {}) {
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (filters.search) {
      query.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    logger.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Get a user by ID with their order count.
 *
 * @param {string} userId - User ID
 * @returns {Promise<{user: object, orderCount: number}>}
 */
async function getUserById(userId) {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const orderCount = await Order.countDocuments({ userId });

    return { user, orderCount };
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Update a user's role (admin only).
 *
 * @param {string} adminId - Admin user ID
 * @param {string} targetUserId - Target user ID
 * @param {string} newRole - New role
 * @returns {Promise<object>} Updated user
 */
async function updateUserRole(adminId, targetUserId, newRole) {
  try {
    // Prevent admin from modifying own role
    if (adminId.toString() === targetUserId.toString()) {
      const error = new Error('Cannot modify your own role');
      error.statusCode = 400;
      throw error;
    }

    // Find user
    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Update role
    user.role = newRole;
    await user.save();

    logger.info(`User role updated: userId=${targetUserId}, newRole=${newRole}`);
    return user;
  } catch (error) {
    logger.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Deactivate a user account (admin only).
 *
 * @param {string} adminId - Admin user ID
 * @param {string} targetUserId - Target user ID
 * @returns {Promise<object>} Updated user
 */
async function deactivateUser(adminId, targetUserId) {
  try {
    if (adminId.toString() === targetUserId.toString()) {
      const error = new Error('Cannot deactivate your own account');
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user.isActive = false;
    await user.save();
    logger.info(`User deactivated: userId=${targetUserId}`);
    return user;
  } catch (error) {
    logger.error('Error deactivating user:', error);
    throw error;
  }
}

/**
 * Reactivate a user account (admin only).
 *
 * @param {string} adminId - Admin user ID
 * @param {string} targetUserId - Target user ID
 * @returns {Promise<object>} Updated user
 */
async function reactivateUser(adminId, targetUserId) {
  try {
    if (adminId.toString() === targetUserId.toString()) {
      const error = new Error('Cannot reactivate your own account');
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user.isActive = true;
    await user.save();
    logger.info(`User reactivated: userId=${targetUserId}`);
    return user;
  } catch (error) {
    logger.error('Error reactivating user:', error);
    throw error;
  }
}

/**
 * Get all orders for a user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Orders array
 */
async function getUserOrderHistory(userId) {
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders;
  } catch (error) {
    logger.error('Error getting user order history:', error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getUserOrderHistory,
};
