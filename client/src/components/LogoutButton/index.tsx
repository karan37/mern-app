import React from 'react';
import { Button } from 'antd';
import useAuth from '../../hooks/useAuth';

interface WithClassName {
  className?: string; // Add className to the props interface
}

const Logout: React.FC<WithClassName> = ({ className }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button type="primary" className={className} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default Logout;
