import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  ApolloProvider,
  InMemoryCache,
  ApolloClient,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Registration from './components/RegisterPage';
import Login from './components/LoginPage';
import ListingPage from './components/ListingPage';
import Protected from './components/Protected';
import NotFound from './components/NotFoundPage';
import useAuth from './hooks/useAuth';

const App: React.FC = () => {
  const { token } = useAuth();

  const httpLink = createHttpLink({
    uri: `${process.env.REACT_APP_API_URL}/graphql`,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
  return (
    <ApolloProvider client={client}>
      <div className="container mx-auto p-6">
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/listings" element={Protected(<ListingPage />)} />
          <Route path="/" element={<Registration />} />
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ApolloProvider>
  );
};

export default App;
