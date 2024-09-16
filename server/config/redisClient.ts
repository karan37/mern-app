import { createClient, RedisClientType } from 'redis';

const redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: RedisClientType | null = null;

export const initializeCache = async (): Promise<void> => {
  console.log('Initializing Redis Cache');
  redisClient = createClient({ url: redisUrl }) as RedisClientType;
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (err) {
    console.error('Error connecting to Redis:', (err as Error).message);
  }
};

export const disconnectCache = async (): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.quit();
    console.log('Redis client closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error closing Redis client:', (err as Error).message);
    process.exit(1);
  }
};

export const getCacheInstance = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    await initializeCache();
  }
  return redisClient as RedisClientType;
};
