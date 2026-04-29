'use strict';

const crypto = require('crypto');
const User = require('../../models/User');
const { generateToken } = require('../../utils/auth');
const logger = require('../../utils/logger');
const emailService = require('../email/emailService');

/**
 * Register a new user.
 *
 * @route POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user (password will be hashed by User model pre-save hook)
    const user = await User.create({
      email,
      password,
      name,
    });

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.info(`User registered successfully: ${user.email}`);

    // Send welcome email (non-blocking)
    emailService
      .sendWelcomeEmail(user.email, user.name)
      .catch((err) => logger.error('Welcome email failed:', err));

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
}

/**
 * Login an existing user.
 *
 * @route POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
    }

    // Verify password using User model instance method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.info(`User logged in successfully: ${user.email}`);

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
}

/**
 * Logout the current user.
 *
 * @route POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    // Clear the token cookie
    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logged out',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
}

/**
 * Get current authenticated user.
 *
 * @route GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    // req.user is attached by authenticate middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
}

/**
 * Request password reset.
 *
 * @route POST /api/auth/forgot-password
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiry to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send email with reset token (stub for now)
    logger.info(`Password reset requested for: ${user.email}`);
    logger.debug(`Reset token (for development): ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
}

/**
 * Reset password using token.
 *
 * @route POST /api/auth/reset-password/:token
 */
async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and check expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password reset successfully for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
