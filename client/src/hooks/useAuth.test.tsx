import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Named import
import useAuth from './useAuth';

// Mock dependencies
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

interface User {
  id: string;
  name: string;
  role: 'Free User' | 'Paid User';
  iat: number;
  exp: number;
}

// Helper component to test the hook
const TestComponent = () => {
  const { user, isAuthenticated, authenticate, logout, isPaidUser, token } =
    useAuth();

  return (
    <div>
      <div data-testid="isAuthenticated">
        {isAuthenticated ? 'true' : 'false'}
      </div>
      <div data-testid="user-role">{user ? user.role : 'none'}</div>
      <div data-testid="isPaidUser">{isPaidUser ? 'true' : 'false'}</div>
      <div data-testid="token">{token ? token : 'none'}</div>

      <button onClick={() => authenticate('mock-token')}>Authenticate</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('useAuth hook', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test('should initialize with no user if no token is present in localStorage', () => {
    render(<TestComponent />, { wrapper: MemoryRouter });

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-role').textContent).toBe('none');
  });

  test('should set user if valid token exists in localStorage', () => {
    const mockToken = 'mock-token';
    const mockDecodedToken: User = {
      id: '123',
      name: 'John Doe',
      role: 'Paid User',
      iat: Date.now(),
      exp: Date.now() / 1000 + 1000, // valid token expiry
    };

    localStorage.setItem('token', mockToken);
    (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);

    render(<TestComponent />, { wrapper: MemoryRouter });

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-role').textContent).toBe('Paid User');
    expect(screen.getByTestId('isPaidUser').textContent).toBe('true');
  });

  test('should remove user if token is expired', () => {
    const mockToken = 'mock-token';
    const mockExpiredToken: User = {
      id: '123',
      name: 'John Doe',
      role: 'Free User',
      iat: Date.now(),
      exp: Date.now() / 1000 - 1000, // expired token
    };

    localStorage.setItem('token', mockToken);
    (jwtDecode as jest.Mock).mockReturnValue(mockExpiredToken);

    render(<TestComponent />, { wrapper: MemoryRouter });

    expect(screen.getByTestId('user-role').textContent).toBe('none');
    expect(localStorage.getItem('token')).toBe(null);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('should authenticate and store token', () => {
    const mockToken = 'mock-token';
    const mockDecodedToken: User = {
      id: '123',
      name: 'John Doe',
      role: 'Free User',
      iat: Date.now(),
      exp: Date.now() / 1000 + 1000, // valid token expiry
    };

    (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);

    render(<TestComponent />, { wrapper: MemoryRouter });

    // Simulate authenticate
    act(() => {
      screen.getByText('Authenticate').click();
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-role').textContent).toBe('Free User');
  });

  test('should logout and navigate to login page', () => {
    const mockToken = 'mock-token';
    const mockDecodedToken: User = {
      id: '123',
      name: 'John Doe',
      role: 'Paid User',
      iat: Date.now(),
      exp: Date.now() / 1000 + 1000, // valid token expiry
    };

    localStorage.setItem('token', mockToken);
    (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);

    render(<TestComponent />, { wrapper: MemoryRouter });

    // Simulate logout
    act(() => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('token')).toBe(null);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-role').textContent).toBe('none');
  });
});
