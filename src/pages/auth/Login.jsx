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
  LoginOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { login, getPublicKey, setToken, isAuthenticated } from '@/services/auth';
import JSEncrypt from 'jsencrypt';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
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
      
      const loginData = {
        phone: values.phone,
        password: encryptedPassword
      };
      
      const response = await login(loginData);
      
      if (response.code === 200) {
        // Save auth token
        setToken(response.data.token);
        
        message.success('Login successful');
        navigate('/');
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('An error occurred during login');
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
              ParaluxFlow
            </Title>
            <Text type="secondary">管理后台登录</Text>
          </div>
          
          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
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
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<LoginOutlined />}
                size="large"
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          
          <Divider plain>
            <Text type="secondary">还没有账号?</Text>
          </Divider>
          
          <div style={{ textAlign: 'center' }}>
            <Space>
              <Link to="/auth/register">
                <Button type="link">注册新账号</Button>
              </Link>
              <Link to="/auth/forgot-password">
                <Button type="link">忘记密码</Button>
              </Link>
            </Space>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;