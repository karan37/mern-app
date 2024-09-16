import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import '@testing-library/jest-dom/extend-expect';

// Mock components
jest.mock('./components/RegisterPage', () => () => (
  <div>Registration Page</div>
));
jest.mock('./components/LoginPage', () => () => <div>Login Page</div>);
jest.mock('./components/ListingPage', () => () => <div>Listing Page</div>);
jest.mock('./components/Protected', () => (input: any) => input);
jest.mock('./components/NotFoundPage', () => () => <div>Page Not Found</div>);

describe('App Routing and Rendering', () => {
  it('renders the Registration page by default', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByText('Registration Page')).toBeInTheDocument();
  });

  it('renders the Registration page when navigating to /register', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByText('Registration Page')).toBeInTheDocument();
  });

  it('renders the Login page when navigating to /login', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the Listing page when navigating to /listings with AuthWrapper', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/listings']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByText('Listing Page')).toBeInTheDocument();
  });

  // Test case for rendering the "Page Not Found" component for unknown routes
  it('renders the Page Not Found component when navigating to an unknown route', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
