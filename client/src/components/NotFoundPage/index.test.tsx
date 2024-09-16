import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import NotFound from './';
import '@testing-library/jest-dom/extend-expect';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('NotFound Component', () => {
  let mockNavigate: jest.Mock = jest.fn();
  let mockUseNavigate: jest.Mock;
  beforeEach(() => {
    // Reset the mock for each test
    mockUseNavigate = useNavigate as jest.Mock;
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
  });

  it('renders the 404 page with the correct elements', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    // Check for the title "404"
    expect(screen.getByText('404')).toBeInTheDocument();
    // Check for the subtitle
    expect(
      screen.getByText('Sorry, the page you visited does not exist.'),
    ).toBeInTheDocument();
    // Check for the redirection message
    expect(
      screen.getByText('Please choose from below pages to be redirected'),
    ).toBeInTheDocument();
    // Check that the buttons are rendered
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Listings')).toBeInTheDocument();
  });

  it('navigates to the Register page when Register button is clicked', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    // Simulate click on the Register button
    fireEvent.click(screen.getByText('Register'));

    // Ensure the navigation happens to /register
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('navigates to the Login page when Login button is clicked', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    // Simulate click on the Login button
    fireEvent.click(screen.getByText('Login'));

    // Ensure the navigation happens to /login
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to the Listings page when Listings button is clicked', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    // Simulate click on the Listings button
    fireEvent.click(screen.getByText('Listings'));

    // Ensure the navigation happens to /listings
    expect(mockNavigate).toHaveBeenCalledWith('/listings');
  });
});
