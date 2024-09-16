import { createClient, RedisClientType } from 'redis';
import {
  initializeCache,
  disconnectCache,
  getCacheInstance,
} from '../redisClient';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

let mockRedisClient: jest.Mocked<RedisClientType>;

describe('Redis Client Tests', () => {
  beforeEach(() => {
    // Mock the Redis client
    mockRedisClient = {
      connect: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
      get: jest.fn(),
      setEx: jest.fn(),
    } as unknown as jest.Mocked<RedisClientType>;

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
      throw new Error('process.exit');
    });

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCacheInstance', () => {
    it('should initialize and return the Redis client when not already initialized', async () => {
      mockRedisClient.connect.mockClear();

      const instance = await getCacheInstance();

      expect(createClient).toHaveBeenCalled();
      expect(mockRedisClient.connect).toHaveBeenCalled();
      expect(instance).toBe(mockRedisClient);
    });

    it('should return the existing Redis client when already initialized', async () => {
      await initializeCache();

      const instance = await getCacheInstance();

      expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
      expect(instance).toBe(mockRedisClient);
    });
  });

  describe('initializeCache', () => {
    it('should create a Redis client and connect successfully', async () => {
      await initializeCache();

      expect(createClient).toHaveBeenCalledWith({
        url: 'redis://localhost:6379',
      });
      expect(mockRedisClient.connect).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Redis connected successfully');
    });

    it('should log an error and exit when Redis connection fails', async () => {
      (mockRedisClient.connect as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed'),
      );

      await initializeCache();

      expect(createClient).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Error connecting to Redis:',
        'Connection failed',
      );
    });
  });

  describe('disconnectCache', () => {
    it('should quit the Redis client successfully', async () => {
      await initializeCache(); // Ensure cache is initialized first
      await disconnectCache();

      expect(mockRedisClient.quit).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Redis client closed gracefully',
      );
    });

    it('should log an error and exit when Redis client fails to quit', async () => {
      (mockRedisClient.quit as jest.Mock).mockRejectedValueOnce(
        new Error('Quit failed'),
      );

      await initializeCache();
      await disconnectCache();

      expect(console.error).toHaveBeenCalledWith(
        'Error closing Redis client:',
        'Quit failed',
      );
    });
  });
});
