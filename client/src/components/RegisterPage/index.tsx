import React from 'react';
import { Form, Input, Button, Typography, Select, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface RegistrationFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: 'Free User' | 'Paid User';
}

const Registration: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: RegistrationFormValues) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, values);
      message.success('Registration successful');
      navigate('/login');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
    },
    string: {
      min: '${label} must be at least ${min} characters',
    },
    pattern: {
      mismatch: '${label} does not match the required pattern',
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <Title level={2}>Register</Title>
      <Form
        name="registration"
        onFinish={onFinish}
        validateMessages={validateMessages}
        layout="vertical"
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

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
          rules={[
            {
              required: true,
              min: 12,
              message: 'Password must be at least 12 characters long',
            },
            {
              required: true,
              pattern: /[A-Z]/,
              message: 'Password must contain at least one uppercase letter',
            },
            {
              required: true,
              pattern: /[0-9]/,
              message: 'Password must contain at least one number',
            },
            {
              required: true,
              pattern: /[!@#$%^&*(),.?":{}|<>]/,
              message: 'Password must contain at least one special character',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="passwordConfirmation"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          initialValue="Free User"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="Free User">Free User</Option>
            <Option value="Paid User">Paid User</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="mt-4">
            Register
          </Button>
        </Form.Item>

        <Typography>
          Already have an account?{' '}
          <Link className="text-blue-500" to="/login">
            Login here
          </Link>
        </Typography>
      </Form>
    </div>
  );
};

export default Registration;
