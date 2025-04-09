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
  Layout,
  Row,
  Col,
  Steps
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MobileOutlined,
  UserAddOutlined,
  SafetyOutlined,
  MailOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { register, getPublicKey, isAuthenticated } from '@/services/auth';
import JSEncrypt from 'jsencrypt';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { Step } = Steps;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
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
      console.error('获取公钥时出错:', error);
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
      
      const registerData = {
        username: values.username,
        phone: values.phone,
        password: encryptedPassword
      };
      
      const response = await register(registerData);
      
      if (response.code === 200) {
        setCurrentStep(1); // 进入注册成功步骤
        message.success('注册成功! 请登录。');
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error) {
      console.error('注册错误:', error);
      message.error('注册时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterForm = () => (
    <Form
      form={form}
      name="register"
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      size="large"
      requiredMark={false}
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
          style={{ borderRadius: 6 }}
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
          style={{ borderRadius: 6 }}
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
          style={{ borderRadius: 6 }}
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
          style={{ borderRadius: 6 }}
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
          style={{ 
            height: 46, 
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 16
          }}
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  const renderSuccessStep = () => (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
      
      <Title level={3}>注册成功!</Title>
      
      <Paragraph style={{ fontSize: 16, marginBottom: 32 }}>
        您的账号已成功创建，现在可以登录使用系统。
      </Paragraph>
      
      <Button 
        type="primary" 
        size="large" 
        style={{ borderRadius: 6 }}
        onClick={() => navigate('/auth/login')}
      >
        前往登录
      </Button>
    </div>
  );

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
                  创建账号
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>注册 ParaluxFlow 管理后台</Text>
              </div>
              
              <Steps 
                current={currentStep}
                items={[
                  { title: '填写信息', icon: <UserAddOutlined /> },
                  { title: '注册成功', icon: <CheckCircleOutlined /> }
                ]}
                style={{ marginBottom: 36 }}
              />
              
              {currentStep === 0 ? renderRegisterForm() : renderSuccessStep()}
              
              {currentStep === 0 && (
                <>
                  <Divider plain>
                    <Text type="secondary">已有账号?</Text>
                  </Divider>
                  
                  <div style={{ textAlign: 'center' }}>
                    <Link to="/auth/login">
                      <Button type="default" size="large" style={{ borderRadius: 6 }}>
                        登录现有账号
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              
              <div style={{ marginTop: 48, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <SafetyOutlined style={{ marginRight: 4 }} />
                  注册即代表您同意用户协议和隐私政策
                </Text>
              </div>
            </Card>
    
        </Row>
      </Content>
    </Layout>
  );
};

export default Register;