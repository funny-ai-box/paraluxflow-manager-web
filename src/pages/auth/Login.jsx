import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 

  Space, 
  Divider,
  Layout,
  Checkbox,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MobileOutlined,
  LoginOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { App as AntApp } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { login, getPublicKey, setToken, isAuthenticated } from '@/services/auth';

import JSEncrypt from 'jsencrypt';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message, notification } = AntApp.useApp();
  
  const [publicKey, setPublicKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否已登录
    if (isAuthenticated()) {
      navigate('/');
    }
    
    // 获取公钥用于密码加密
    fetchPublicKey();
  }, [navigate]);

  const fetchPublicKey = async () => {
    try {
      const response = await getPublicKey();
      if (response.code === 200) {
        setPublicKey(response.data.public_key);
      } else {
        message.error(response.message || '获取公钥失败');
      }
    } catch (error) {
      message.error('获取公钥时发生错误');
    }
  };

  const encryptPassword = (password) => {
    if (!publicKey) return password;
    
    try {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      return encrypt.encrypt(password);
    } catch (error) {
      console.error('加密错误:', error);
      return password;
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // 如果公钥可用，则加密密码
      const encryptedPassword = encryptPassword(values.password);
      
      const loginData = {
        phone: values.phone,
        password: encryptedPassword
      };
      
      const response = await login(loginData);

      if (response.code === 200) {
        // 保存认证令牌
        setToken(response.data.token);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      
      message.error('登录时发生错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to right, #1677ff, #4096ff)'
    }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '50px 0' 
      }}>
        <Row justify="center" align="middle" style={{ width: '500px' }}>
      
            <Card 
              style={{ 
                width: '100%', 
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderRadius: 12,
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: 36 }}
              bordered={false}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#1677ff' }}>
                  ParaluxFlow
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>管理后台登录</Text>
              </div>
              
              <Form
                form={form}
                name="login"
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                size="large"
                requiredMark={false}
              >
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号码' },
                    { pattern: /^1\d{10}$/, message: '请输入有效的手机号码' }
                  ]}
                >
                  <Input 
                    prefix={<MobileOutlined className="site-form-item-icon" />} 
                    placeholder="手机号码" 
                    size="large"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="site-form-item-icon" />} 
                    placeholder="密码" 
                    size="large"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
                
                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>自动登录</Checkbox>
                    </Form.Item>
                    <Link to="/auth/forgot-password" style={{ fontSize: 14 }}>
                      忘记密码?
                    </Link>
                  </div>
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<LoginOutlined />}
                    size="large"
                    block
                    style={{ 
                      height: 46, 
                      borderRadius: 6,
                      fontWeight: 500,
                      fontSize: 16
                    }}
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
{/*               
              <Divider plain>
                <Text type="secondary">还没有账号?</Text>
              </Divider>
              
              <div style={{ textAlign: 'center' }}>
                <Link to="/auth/register">
                  <Button type="default" size="large" icon={<UserOutlined />} style={{ borderRadius: 6 }}>
                    注册新账号
                  </Button>
                </Link>
              </div>
               */}
              <div style={{ marginTop: 48, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <SafetyOutlined style={{ marginRight: 4 }} />
                  登录即代表您同意用户协议和隐私政策
                </Text>
              </div>
            </Card>
       
        </Row>
      </Content>
    </Layout>
  );
};

export default Login;