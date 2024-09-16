import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Define the structure of the form values
interface LoginFormValues {
  email: string;
  password: string;
}

const { Title } = Typography;

const Login: React.FC = () => {
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        values,
      );
      const token = response.data.token;
      authenticate(token);
      navigate('/listings');
      message.success('Login successful');
    } catch {
      message.error('Incorrect email or password');
    }
  };

  // validation rules
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <Title level={2} className="text-center">
        Login
      </Title>
      <Form
        name="login"
        onFinish={onFinish}
        validateMessages={validateMessages}
        layout="vertical"
        className="lg:max-w-sm mx-auto"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: 'email',
              message: 'Please enter a valid email address!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full mt-6">
            Login
          </Button>
        </Form.Item>

        <Form.Item className="text-center">
          <Typography>
            Don't have an account? <Link to="/register">Register here</Link>
          </Typography>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
