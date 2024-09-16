import { render, screen, fireEvent, act, within } from '@testing-library/react';
import ListingPage from '.';
import { message } from 'antd';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';

jest.mock('../../hooks/useAuth');

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('@apollo/client', () => ({
  gql: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseQuery = useQuery as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

describe('ListingPage Component', () => {
  const jobListingsMock = [
    {
      id: '1',
      jobTitle: 'Software Engineer',
      companyName: 'Tech Corp',
      jobType: 'Full-time',
      jobLevel: 'Senior',
      jobGeo: 'New York',
      salaryCurrency: 'USD',
      jobIndustry: ['Engineering'],
    },
  ];

  it('renders job listings and allows row click to show modal for Paid User', async () => {
    mockUseAuth.mockReturnValue({
      isPaidUser: true,
      token: 'mockToken',
    });
    mockUseQuery.mockReturnValue({
      data: {
        jobListings: jobListingsMock,
      },
      loading: false,
      error: null,
    });

    render(<ListingPage />);

    // Check if the table is populated
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();

    // Simulate a row click to show modal
    await act(() => {
      fireEvent.click(screen.getByText('Software Engineer'));
    });

    // Check if the modal appears with full job details for Paid User
    expect(screen.getByText(/New York/i)).toBeInTheDocument;
    expect(screen.getByText(/USD/i)).toBeInTheDocument;
    expect(screen.getByText(/Engineering/i)).toBeInTheDocument;
  });

  it('renders error message on query error', async () => {
    mockUseAuth.mockReturnValue({
      isPaidUser: false,
      token: 'mockToken',
    });
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('GraphQL error'),
    });
    render(<ListingPage />);

    // Check if error message is displayed
    expect(message.error).toHaveBeenCalledWith('Failed to fetch job listings');
  });

  it('restricts Paid User features for Free User', async () => {
    mockUseAuth.mockReturnValue({
      isPaidUser: false,
      token: 'mockToken',
    });
    mockUseQuery.mockReturnValue({
      data: {
        jobListings: jobListingsMock,
      },
      loading: false,
      error: null,
    });

    render(<ListingPage />);

    // Check if the table is populated
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();

    // Simulate a row click to show modal
    await act(async () => {
      fireEvent.click(screen.getByText('Software Engineer'));
    });

    // Check if the modal appears with restricted details for Free User
    const jobGEo = screen.getByText(/Job Geo/i).closest('p');
    expect(within(jobGEo!).getByText('?????')).toBeInTheDocument;
    const salaryCurrency = screen.getByText(/Salary Currency/i).closest('p');
    expect(within(salaryCurrency!).getByText('?????')).toBeInTheDocument;
    const jobIndustry = screen.getByText(/Job Industry/i).closest('p');
    expect(within(jobIndustry!).getByText('?????')).toBeInTheDocument;
    expect(screen.getByText(/Feature Not Available For Free Users/i))
      .toBeInTheDocument;
    expect(salaryCurrency).toMatchSnapshot();
    expect(jobGEo).toMatchSnapshot();
    expect(jobIndustry).toMatchSnapshot();
  });

  it('logs out and redirects to login page on Logout button click', async () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({
      isPaidUser: 'Free User',
      logout: mockLogout,
    });
    mockUseQuery.mockReturnValue({
      data: {
        jobListings: jobListingsMock,
      },
      loading: false,
      error: null,
    });

    const navigate = jest.fn();
    mockNavigate.mockReturnValue(navigate);

    render(<ListingPage />);

    const logoutButton = screen.getByText('Logout');

    // Click Logout
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});
