'use strict';

const userService = require('./userService');
const logger = require('../../utils/logger');

/**
 * Get all users (admin).
 *
 * @route GET /api/admin/users
 */
async function getAllUsers(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await userService.getAllUsers({ search }, { page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
}

/**
 * Get a user by ID (admin).
 *
 * @route GET /api/admin/users/:id
 */
async function getUserById(req, res, next) {
  try {
    const result = await userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
}

/**
 * Update a user's role (admin).
 *
 * @route PUT /api/admin/users/:id/role
 */
async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const user = await userService.updateUserRole(
      req.user.userId,
      req.params.id,
      role
    );
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    next(error);
  }
}

/**
 * Deactivate a user account (admin).
 *
 * @route PUT /api/admin/users/:id/deactivate
 */
async function deactivateUser(req, res, next) {
  try {
    const user = await userService.deactivateUser(req.user.userId, req.params.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    next(error);
  }
}

/**
 * Reactivate a user account (admin).
 *
 * @route PUT /api/admin/users/:id/reactivate
 */
async function reactivateUser(req, res, next) {
  try {
    const user = await userService.reactivateUser(req.user.userId, req.params.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('Reactivate user error:', error);
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  reactivateUser,
};
