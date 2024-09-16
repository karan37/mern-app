import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '.';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd';
import { MemoryRouter } from 'react-router-dom';

// Mock the necessary modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('axios');
jest.mock('jwt-decode');
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;
const mockMessage = message as jest.Mocked<typeof message>;

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear(); // Clear localStorage between tests
  });

  test('shows success message and navigates on successful login', async () => {
    const mockToken = 'mocked_token';
    const mockDecodedToken = { userId: '123' };

    // Mock axios response
    mockAxios.post.mockResolvedValueOnce({ data: { token: mockToken } });

    // Mock jwtDecode
    mockJwtDecode.mockReturnValue(mockDecodedToken);

    // Mock navigate function
    const navigate = jest.fn();
    mockNavigate.mockReturnValue(navigate);

    // Mock message functions
    mockMessage.success = jest.fn();
    mockMessage.error = jest.fn();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assertions
    await waitFor(() => {
      expect(mockMessage.success).toHaveBeenCalledWith('Login successful');
      expect(navigate).toHaveBeenCalledWith('/listings');
    });

    // Check localStorage
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  test('shows error message on failed login', async () => {
    // Mock axios response with error
    mockAxios.post.mockRejectedValueOnce(new Error('Network error'));

    // Mock message functions
    mockMessage.success = jest.fn();
    mockMessage.error = jest.fn();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assertions
    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith(
        'Incorrect email or password',
      );
    });
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Click the login button without filling in the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assertions
    await waitFor(async () => {
      expect(
        await screen.findByText(/please enter a valid email address!/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/password is required!/i),
      ).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    // Fill in an invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assertions
    expect(
      await screen.findByText(/please enter a valid email address!/i),
    ).toBeInTheDocument();
  });
});
