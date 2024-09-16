import axios, { AxiosResponse } from 'axios';
import { getCacheInstance } from '../config/redisClient';

// Define types for the job listings
export interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  jobType: string[];
  jobLevel: string;
  jobGeo?: string;
  jobIndustry?: string[];
  salaryCurrency?: string;
}

export interface JobListingsResponse {
  jobs: Job[];
}

const JOBS_CACHE_KEY = 'job_listings';
const JOBS_CACHE_DURATION = 86400; // 24 hours in seconds

export const fetchAndCacheJobListings = async (): Promise<Job[]> => {
  try {
    const response: AxiosResponse<JobListingsResponse> = await axios.get(
      'https://jobicy.com/api/v2/remote-jobs?count=50',
    );
    const jobListings = response.data.jobs;

    if (process.env.NODE_ENV === 'production') {
      // Store job listings in Redis with a 24-hour expiration
      const cacheInstance = await getCacheInstance();
      await cacheInstance.setEx(
        JOBS_CACHE_KEY,
        JOBS_CACHE_DURATION,
        JSON.stringify(jobListings),
      );
    }

    return jobListings;
  } catch (error) {
    console.error('Error fetching job listings:', error);
    throw error;
  }
};

// Get job listings from cache or fetch them if not cached
export const getJobListings = async (): Promise<Job[]> => {
  if (process.env.NODE_ENV === 'production') {
    const cacheInstance = await getCacheInstance();
    const cachedJobs = await cacheInstance.get(JOBS_CACHE_KEY);
    if (cachedJobs) {
      return JSON.parse(cachedJobs);
    }
  }

  return await fetchAndCacheJobListings();
};
