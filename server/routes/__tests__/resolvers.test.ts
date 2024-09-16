import { jobListingResolver } from '../graphql';
import { getJobListings, Job } from '../../controllers/jobsCacheController';

jest.mock('../../controllers/jobsCacheController', () => ({
  getJobListings: jest.fn(),
}));

describe('jobListingResolver', () => {
  const mockJobListings: Job[] = [
    {
      id: '1',
      jobTitle: 'Software Engineer',
      companyName: 'Tech Corp',
      jobType: ['Full-Time'],
      jobLevel: 'Mid',
      jobGeo: 'Remote',
      jobIndustry: ['Tech'],
      salaryCurrency: 'USD',
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      companyName: 'Biz Inc',
      jobType: ['Part-Time'],
      jobLevel: 'Senior',
      jobGeo: 'On-Site',
      jobIndustry: ['Business'],
      salaryCurrency: 'USD',
    },
  ];

  beforeEach(() => {
    (getJobListings as jest.Mock).mockResolvedValue(mockJobListings);
  });

  it('should return all job listings for Paid User role', async () => {
    const context = { user: { role: 'Paid User' } };
    const result = await jobListingResolver(null, null, context as any);
    expect(result).toEqual(mockJobListings);
  });

  it('should return limited job listings for Free User role', async () => {
    const context = { user: { role: 'Free User' } };
    const result = await jobListingResolver(null, null, context as any);
    const expectedResult = mockJobListings.map(
      ({ jobTitle, companyName, jobType, jobLevel }) => ({
        jobTitle,
        companyName,
        jobType,
        jobLevel,
      }),
    );
    expect(result).toEqual(expectedResult);
  });

  it('should return an empty array if getJobListings returns an empty array', async () => {
    (getJobListings as jest.Mock).mockResolvedValue([]);
    const context = { user: { role: 'Paid User' } };
    const result = await jobListingResolver(null, null, context as any);
    expect(result).toEqual([]);
  });
});
