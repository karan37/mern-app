import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../middleware/authMiddleware'; // Adjust the import path as necessary

jest.mock('jsonwebtoken');

const mockVerify = jwt.verify as jest.Mock;

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    (req as Request).headers = {};
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    (req as Request).headers = { authorization: 'Bearer invalidToken' };
    mockVerify.mockImplementation(() => {
      throw new Error();
    });

    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', () => {
    const token = { id: 'userId', name: 'John Doe' };
    (req as Request).headers = { authorization: 'Bearer validToken' };
    mockVerify.mockReturnValue(token);

    authMiddleware(req as Request, res as Response, next);
    expect((req as any).user).toEqual(token);
    expect(next).toHaveBeenCalled();
  });
});
