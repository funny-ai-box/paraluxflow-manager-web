import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space, 
  Divider,
  Layout
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MobileOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { register, getPublicKey, isAuthenticated } from '@/services/auth';
import JSEncrypt from 'jsencrypt';

const { Title, Text } = Typography;
const { Content } = Layout;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate('/');
    }
    
    // Fetch public key for password encryption
    fetchPublicKey();
  }, [navigate]);

  const fetchPublicKey = async () => {
    try {
      const response = await getPublicKey();
      if (response.code === 200) {
        setPublicKey(response.data.public_key);
      } else {
        message.error(response.message || 'Failed to fetch public key');
      }
    } catch (error) {
      console.error('Error fetching public key:', error);
      message.error('An error occurred while fetching the public key');
    }
  };

  const encryptPassword = (password) => {
    if (!publicKey) return password;
    
    try {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      return encrypt.encrypt(password);
    } catch (error) {
      console.error('Encryption error:', error);
      return password;
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Encrypt password if public key is available
      const encryptedPassword = encryptPassword(values.password);
      
      const registerData = {
        username: values.username,
        phone: values.phone,
        password: encryptedPassword
      };
      
      const response = await register(registerData);
      
      if (response.code === 200) {
        message.success('Registration successful! Please log in.');
        navigate('/auth/login');
      } else {
        message.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '50px 0' 
      }}>
        <Card 
          style={{ 
            width: 400, 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: 8
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              创建账号
            </Title>
            <Text type="secondary">注册 ParaluxFlow 管理后台</Text>
          </div>
          
          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少需要3个字符' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号码' },
                { pattern: /^1\d{10}$/, message: '请输入有效的手机号码' }
              ]}
            >
              <Input 
                prefix={<MobileOutlined />} 
                placeholder="手机号码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少需要6个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不匹配'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="确认密码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<UserAddOutlined />}
                size="large"
                block
              >
                注册
              </Button>
            </Form.Item>
          </Form>
          
          <Divider plain>
            <Text type="secondary">已有账号?</Text>
          </Divider>
          
          <div style={{ textAlign: 'center' }}>
            <Link to="/auth/login">
              <Button type="link">登录现有账号</Button>
            </Link>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Register;