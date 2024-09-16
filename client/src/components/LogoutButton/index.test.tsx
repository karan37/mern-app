import { render, screen, fireEvent } from '@testing-library/react';
import Logout from '.';
import useAuth from '../../hooks/useAuth';

// Mock dependencies
jest.mock('../../hooks/useAuth');

describe('Logout component', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
  });

  test('should render Logout button with provided className', () => {
    const className = 'custom-logout-class';

    render(<Logout className={className} />);

    const buttonElement = screen.getByRole('button', { name: /logout/i });

    // Check if the button is rendered
    expect(buttonElement).toBeInTheDocument();

    // Check if the button has the correct className
    expect(buttonElement).toHaveClass(className);
  });

  test('should call logout when button is clicked', () => {
    render(<Logout />);

    const buttonElement = screen.getByRole('button', { name: /logout/i });

    // Simulate click event
    fireEvent.click(buttonElement);

    // Check if the logout function is called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
