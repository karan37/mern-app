import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  role: 'Free User' | 'Paid User';
  iat: number;
  exp: number;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      const decodedToken = jwtDecode(localToken) as User;
      const expiry = (decodedToken.exp || 0) * 1000;
      if (Date.now() > expiry) {
        // If token expired
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      } else {
        setUser(decodedToken);
      }
    } else {
      setUser(null);
    }
  }, []);

  const authenticate = (token: string) => {
    localStorage.setItem('token', token);
    setUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return {
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    authenticate,
    logout,
    user,
    isPaidUser: user?.role === 'Paid User',
  };
};

export default useAuth;
