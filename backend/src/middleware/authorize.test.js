'use strict';

const { authorizeAdmin, authorizeCustomer } = require('./authorize');

function makeReqResNext() {
  const req = { user: null };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authorizeAdmin middleware', () => {
  it('calls next() when user has admin role', () => {
    const { req, res, next } = makeReqResNext();
    req.user = { userId: 'admin1', role: 'admin', email: 'admin@example.com', name: 'Admin' };

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user has customer role', () => {
    const { req, res, next } = makeReqResNext();
    req.user = { userId: 'user1', role: 'customer', email: 'user@example.com', name: 'User' };

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when req.user is not set', () => {
    const { req, res, next } = makeReqResNext();
    req.user = null;

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when req.user is undefined', () => {
    const { req, res, next } = makeReqResNext();
    delete req.user;

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authorizeCustomer middleware', () => {
  it('calls next() when user has customer role', () => {
    const { req, res, next } = makeReqResNext();
    req.user = { userId: 'user1', role: 'customer', email: 'user@example.com', name: 'User' };

    authorizeCustomer(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user has admin role', () => {
    const { req, res, next } = makeReqResNext();
    req.user = { userId: 'admin1', role: 'admin', email: 'admin@example.com', name: 'Admin' };

    authorizeCustomer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Customer access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when req.user is not set', () => {
    const { req, res, next } = makeReqResNext();
    req.user = null;

    authorizeCustomer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Customer access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when req.user is undefined', () => {
    const { req, res, next } = makeReqResNext();
    delete req.user;

    authorizeCustomer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Customer access required' });
    expect(next).not.toHaveBeenCalled();
  });
});
