import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Registration from '.';
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

describe('Registration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear(); // Clear localStorage between tests
  });

  test('shows success message and navigates on successful registration', async () => {
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
        <Registration />
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input' }), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(
      screen.getByLabelText('Confirm Password', { selector: 'input' }),
      { target: { value: 'Password123!' } },
    );
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'Free User' },
    });

    // Click the register button
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Assertions
    await waitFor(() => {
      expect(mockMessage.success).toHaveBeenCalledWith(
        'Registration successful',
      );
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error message on failed registration', async () => {
    // Mock axios response with error
    mockAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Registration failed' } },
    });

    // Mock message functions
    mockMessage.success = jest.fn();
    mockMessage.error = jest.fn();

    render(
      <MemoryRouter>
        <Registration />
      </MemoryRouter>,
    );

    // Act
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('Password', { selector: 'input' }),
        { target: { value: 'Password123!' } },
      );
      fireEvent.change(
        screen.getByLabelText('Confirm Password', { selector: 'input' }),
        { target: { value: 'Password123!' } },
      );
      fireEvent.change(screen.getByLabelText(/role/i), {
        target: { value: 'Free User' },
      });

      // Click the register button
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });

    // Assertions
    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('Registration failed');
    });
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <MemoryRouter>
        <Registration />
      </MemoryRouter>,
    );

    // Act
    await act(async () => {
      // Click the register button without filling in the form
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });

    // Assertions
    await waitFor(() => {
      expect(screen.getByText(/name is required!/i)).toBeInTheDocument();
      expect(
        screen.getByText(/please enter a valid email address!/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be at least 12 characters long/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Password must contain at least one special character/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please confirm your password!/i),
      ).toBeInTheDocument();
    });
  });
});
