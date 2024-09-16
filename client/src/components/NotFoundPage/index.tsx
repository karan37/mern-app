import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Result
        status="404"
        title="404"
        subTitle={
          <div>
            <p>Sorry, the page you visited does not exist.</p>
            <p>Please choose from below pages to be redirected</p>
          </div>
        }
        extra={
          <div>
            <Button type="primary" onClick={() => navigate('/register')}>
              Register
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/login')}
              className="mx-6"
            >
              Login
            </Button>
            <Button type="primary" onClick={() => navigate('/listings')}>
              Listings
            </Button>
          </div>
        }
        className="p-6 bg-white shadow-lg rounded-lg"
      />
    </div>
  );
};

export default NotFound;
