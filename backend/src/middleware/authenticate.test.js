'use strict';

const jwt = require('jsonwebtoken');

// Mock dependencies before requiring the middleware
jest.mock('../models/User');
jest.mock('../utils/auth');

const User = require('../models/User');
const { validateToken } = require('../utils/auth');
const authenticate = require('./authenticate');

function makeReqResNext() {
  const req = { headers: {}, cookies: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

const MOCK_USER = {
  _id: 'user123',
  email: 'test@example.com',
  role: 'customer',
  name: 'Test User',
  isActive: true,
};

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('token extraction', () => {
    it('returns 401 when no token is provided', async () => {
      const { req, res, next } = makeReqResNext();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('extracts token from Authorization Bearer header', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer valid.token.here';
      validateToken.mockReturnValue({ userId: 'user123' });
      User.findById = jest.fn().mockResolvedValue(MOCK_USER);

      await authenticate(req, res, next);

      expect(validateToken).toHaveBeenCalledWith('valid.token.here');
      expect(next).toHaveBeenCalledWith(); // called with no args = success
    });

    it('extracts token from req.cookies.token', async () => {
      const { req, res, next } = makeReqResNext();
      req.cookies.token = 'cookie.token.here';
      validateToken.mockReturnValue({ userId: 'user123' });
      User.findById = jest.fn().mockResolvedValue(MOCK_USER);

      await authenticate(req, res, next);

      expect(validateToken).toHaveBeenCalledWith('cookie.token.here');
      expect(next).toHaveBeenCalledWith();
    });

    it('prefers Authorization header over cookie when both present', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer header.token';
      req.cookies.token = 'cookie.token';
      validateToken.mockReturnValue({ userId: 'user123' });
      User.findById = jest.fn().mockResolvedValue(MOCK_USER);

      await authenticate(req, res, next);

      expect(validateToken).toHaveBeenCalledWith('header.token');
    });
  });

  describe('token validation errors', () => {
    it('returns 401 with "Token expired" for TokenExpiredError', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer expired.token';
      const expiredError = new jwt.TokenExpiredError('jwt expired', new Date());
      validateToken.mockImplementation(() => { throw expiredError; });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Token expired' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 with "Invalid token" for JsonWebTokenError', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer bad.token';
      const jwtError = new jwt.JsonWebTokenError('invalid signature');
      validateToken.mockImplementation(() => { throw jwtError; });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('user lookup', () => {
    it('returns 401 with "Invalid token" when user not found in DB', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer valid.token';
      validateToken.mockReturnValue({ userId: 'nonexistent' });
      User.findById = jest.fn().mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 with "Account is inactive" when user.isActive is false', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer valid.token';
      validateToken.mockReturnValue({ userId: 'user123' });
      User.findById = jest.fn().mockResolvedValue({ ...MOCK_USER, isActive: false });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Account is inactive' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('success path', () => {
    it('attaches user info to req.user and calls next() on success', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer valid.token';
      validateToken.mockReturnValue({ userId: 'user123' });
      User.findById = jest.fn().mockResolvedValue(MOCK_USER);

      await authenticate(req, res, next);

      expect(req.user).toEqual({
        userId: MOCK_USER._id,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        name: MOCK_USER.name,
      });
      expect(next).toHaveBeenCalledWith(); // no error argument
      expect(res.status).not.toHaveBeenCalled();
    });

    it('attaches correct role for admin user', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer admin.token';
      validateToken.mockReturnValue({ userId: 'admin1' });
      User.findById = jest.fn().mockResolvedValue({
        _id: 'admin1',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
        isActive: true,
      });

      await authenticate(req, res, next);

      expect(req.user.role).toBe('admin');
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('unexpected errors', () => {
    it('calls next(error) for unexpected DB errors', async () => {
      const { req, res, next } = makeReqResNext();
      req.headers.authorization = 'Bearer valid.token';
      validateToken.mockReturnValue({ userId: 'user123' });
      const dbError = new Error('DB connection failed');
      User.findById = jest.fn().mockRejectedValue(dbError);

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
