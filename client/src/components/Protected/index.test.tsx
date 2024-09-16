import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthWrapper from './';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('AuthWrapper component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test('should render children if user is authenticated', () => {
    // Mock the useAuth hook to return authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    const ChildComponent = () => (
      <div data-testid="protected-content">Protected Content</div>
    );

    render(<MemoryRouter>{AuthWrapper(<ChildComponent />)}</MemoryRouter>);

    // Assert the child component is rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('should redirect to login if user is not authenticated', () => {
    // Mock the useAuth hook to return non-authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    const ChildComponent = () => (
      <div data-testid="protected-content">Protected Content</div>
    );

    render(<MemoryRouter>{AuthWrapper(<ChildComponent />)}</MemoryRouter>);

    // Assert the user is redirected to login
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should not navigate again if already authenticated', () => {
    // Mock the useAuth hook to return authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    const ChildComponent = () => (
      <div data-testid="protected-content">Protected Content</div>
    );

    render(<MemoryRouter>{AuthWrapper(<ChildComponent />)}</MemoryRouter>);

    // Assert that `navigate` is not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
