// __tests__/authController.test.ts
import { Request, Response } from 'express';
import { register, login } from '../../controllers/authController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';

// Mock the dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

const mockUser = {
  _id: 'userId',
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: 'hashedpassword',
  role: 'Free User',
  save: jest.fn(),
};

const mockToken = 'mockToken';

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Setup
      (User.findOne as jest.Mock).mockResolvedValue(null); // User does not exist
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (User as any).mockImplementation(() => mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password',
          role: 'Free User',
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: 'johndoe@example.com',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword',
        role: 'Free User',
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created' });
    });

    it('should return an error if the user already exists', async () => {
      // Setup
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password',
          role: 'Free User',
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: 'johndoe@example.com',
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already exists',
      });
    });

    it('should handle server errors', async () => {
      // Setup
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password',
          role: 'Free User',
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('login', () => {
    it('should login an existing user and return a token', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const req = {
        body: {
          email: 'johndoe@example.com',
          password: 'password',
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: 'johndoe@example.com',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'userId', name: 'John Doe', role: 'Free User' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: mockToken });
    });

    it('should return an error if credentials are invalid', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const req = {
        body: {
          email: 'johndoe@example.com',
          password: 'wrongpassword',
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: 'johndoe@example.com',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpassword',
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should handle server errors', async () => {
      // Setup
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const req = {
        body: {
          email: 'johndoe@example.com',
          password: 'password',
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
});
