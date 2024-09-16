import axios from 'axios';
import { getCacheInstance } from '../../config/redisClient';
import {
  fetchAndCacheJobListings,
  getJobListings,
} from '../jobsCacheController';

// Mock axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock Redis
jest.mock('../../config/redisClient');
const mockGetCacheInstance = getCacheInstance as jest.MockedFunction<
  typeof getCacheInstance
>;

describe('Job Listings Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(process.env, 'NODE_ENV', 'production');
  });

  describe('fetchAndCacheJobListings', () => {
    it('should fetch job listings from API and cache them', async () => {
      const mockJobListings = {
        jobs: [
          {
            id: '1',
            jobTitle: 'Software Engineer',
            companyName: 'Company A',
            jobType: ['Full-Time'],
            jobLevel: 'Mid',
          },
        ],
      };

      // Mock axios response
      mockAxios.get.mockResolvedValue({ data: mockJobListings });

      // Mock Redis cache
      const mockCacheInstance = {
        setEx: jest.fn().mockResolvedValue('OK'),
      };
      mockGetCacheInstance.mockResolvedValue(mockCacheInstance as any);

      const jobs = await fetchAndCacheJobListings();

      expect(jobs).toEqual(mockJobListings.jobs);
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://jobicy.com/api/v2/remote-jobs?count=50',
      );
      expect(mockCacheInstance.setEx).toHaveBeenCalledWith(
        'job_listings',
        86400,
        JSON.stringify(mockJobListings.jobs),
      );
    });

    it('should throw an error if fetching from API fails', async () => {
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(fetchAndCacheJobListings()).rejects.toThrow('API Error');
    });
  });

  describe('getJobListings', () => {
    it('should return cached job listings if available', async () => {
      const cachedJobListings = JSON.stringify([
        {
          id: '1',
          jobTitle: 'Software Engineer',
          companyName: 'Company A',
          jobType: ['Full-Time'],
          jobLevel: 'Mid',
        },
      ]);

      // Mock Redis cache
      const mockCacheInstance = {
        get: jest.fn().mockResolvedValue(cachedJobListings),
      };
      mockGetCacheInstance.mockResolvedValue(mockCacheInstance as any);

      const jobs = await getJobListings();

      expect(jobs).toEqual(JSON.parse(cachedJobListings));
      expect(mockCacheInstance.get).toHaveBeenCalledWith('job_listings');
    });

    it('should fetch and cache job listings if not available in cache', async () => {
      // Mock Redis cache
      const mockCacheInstance = {
        get: jest.fn().mockResolvedValue(null),
        setEx: jest.fn().mockResolvedValue('OK'),
      };
      mockGetCacheInstance.mockResolvedValue(mockCacheInstance as any);

      const mockJobListings = {
        jobs: [
          {
            id: '1',
            jobTitle: 'Software Engineer',
            companyName: 'Company A',
            jobType: ['Full-Time'],
            jobLevel: 'Mid',
          },
        ],
      };

      // Mock axios response
      mockAxios.get.mockResolvedValue({ data: mockJobListings });

      const jobs = await getJobListings();

      expect(jobs).toEqual(mockJobListings.jobs);
      expect(mockCacheInstance.get).toHaveBeenCalledWith('job_listings');
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://jobicy.com/api/v2/remote-jobs?count=50',
      );
      expect(mockCacheInstance.setEx).toHaveBeenCalledWith(
        'job_listings',
        86400,
        JSON.stringify(mockJobListings.jobs),
      );
    });

    it('should throw an error if fetching job listings from cache and API fails', async () => {
      // Mock Redis cache
      const mockCacheInstance = {
        get: jest.fn().mockResolvedValue(null),
      };
      mockGetCacheInstance.mockResolvedValue(mockCacheInstance as any);

      // Mock axios response
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(getJobListings()).rejects.toThrow('API Error');
    });
  });
});
