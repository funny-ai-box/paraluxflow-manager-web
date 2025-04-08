import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Tabs, 
  message, 
  Space, 
  Select,
  InputNumber,
  Spin,
  Divider,
  Typography,
  Alert
} from 'antd';
import { 
  SaveOutlined, 
  ApiOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { 
  fetchLlmProviderDetail, 
  fetchLlmProviderModels,
  updateLlmProviderConfig,
  testLlmProvider
} from '@/services/llm';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

const ProviderDetailDrawer = ({ visible, provider, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('config');
  const [providerDetail, setProviderDetail] = useState(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (visible && provider?.id) {
      fetchProviderDetail(provider.id);
      fetchProviderModels(provider.id);
    }
  }, [visible, provider]);

  const fetchProviderDetail = async (providerId) => {
    setLoading(true);
    try {
      const response = await fetchLlmProviderDetail(providerId);
      if (response.code === 200) {
        setProviderDetail(response.data);
        form.setFieldsValue(response.data.config || {});
      } else {
        message.error(response.message || '获取提供商详情失败');
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
      message.error('获取提供商详情时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderModels = async (providerId) => {
    try {
      const response = await fetchLlmProviderModels(providerId);
      if (response.code === 200) {
        setModels(response.data || []);
      } else {
        message.error(response.message || '获取提供商模型失败');
      }
    } catch (error) {
      console.error('Error fetching provider models:', error);
      message.error('获取提供商模型时发生错误');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const configData = {
        id: provider.id,
        ...values
      };
      
      const response = await updateLlmProviderConfig(configData);
      
      if (response.code === 200) {
        message.success('提供商配置更新成功');
        if (onSuccess) onSuccess();
      } else {
        message.error(response.message || '更新提供商配置失败');
      }
    } catch (error) {
      console.error('Error updating provider configuration:', error);
      message.error('更新提供商配置时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields();
      setTestLoading(true);
      setTestResult(null);
      
      const testData = {
        id: provider.id,
        ...values
      };
      
      const response = await testLlmProvider(testData);
      
      if (response.code === 200) {
        setTestResult({
          success: true,
          message: response.message || 'API 测试成功',
          data: response.data
        });
      } else {
        setTestResult({
          success: false,
          message: response.message || 'API 测试失败'
        });
      }
    } catch (error) {
      console.error('Error testing provider API:', error);
      setTestResult({
        success: false,
        message: '测试 API 时发生错误'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const renderTestResult = () => {
    if (!testResult) return null;
    
    return (
      <div style={{ marginTop: 16 }}>
        {testResult.success ? (
          <Alert
            message="API 测试成功"
            description={
              <div>
                <p>{testResult.message}</p>
                {testResult.data && (
                  <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        ) : (
          <Alert
            message="API 测试失败"
            description={testResult.message}
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
          />
        )}
      </div>
    );
  };

  return (
    <Drawer
      title={`配置 ${provider?.name || '提供商'}`}
      width={720}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleSave} 
            loading={loading}
            icon={<SaveOutlined />}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="配置" key="config">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                request_timeout: 60,
                max_retries: 3
              }}
            >
              <Form.Item
                name="api_key"
                label="API 密钥"
                rules={[{ required: true, message: '请输入 API 密钥' }]}
              >
                <Input.Password placeholder="Enter API key" />
              </Form.Item>
              
              {provider?.requires_api_secret && (
                <Form.Item
                  name="api_secret"
                  label="API 密钥"
                >
                  <Input.Password placeholder="Enter API secret" />
                </Form.Item>
              )}
              
              {provider?.requires_app_id && (
                <Form.Item
                  name="app_id"
                  label="应用 ID"
                >
                  <Input placeholder="Enter application ID" />
                </Form.Item>
              )}
              
              <Form.Item
                name="api_base_url"
                label="API 基础 URL"
              >
                <Input placeholder="Enter API base URL" />
              </Form.Item>
              
              <Form.Item
                name="api_version"
                label="API 版本"
              >
                <Input placeholder="Enter API version" />
              </Form.Item>
              
              <Form.Item
                name="region"
                label="区域"
              >
                <Input placeholder="Enter region" />
              </Form.Item>
              
              <Form.Item
                name="request_timeout"
                label="请求超时时间（秒）"
              >
                <InputNumber min={1} max={300} />
              </Form.Item>
              
              <Form.Item
                name="max_retries"
                label="最大重试次数"
              >
                <InputNumber min={0} max={10} />
              </Form.Item>
              
              <Form.Item
                name="default_model"
                label="默认模型"
              >
                <Select
                  placeholder="Select default model"
                  loading={loading}
                  showSearch
                  optionFilterProp="children"
                >
                  {models.map(model => (
                    <Select.Option key={model.id} value={model.id}>
                      {model.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="API 测试" key="test">
            <Alert
              message="API 测试"
              description="通过向 API 发送请求测试您的配置。这将使用您输入的配置值，但不会保存它们。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Button 
              type="primary" 
              onClick={handleTest} 
              loading={testLoading}
              icon={<ApiOutlined />}
            >
              测试 API 连接
            </Button>
            
            {renderTestResult()}
          </TabPane>
          
          <TabPane tab="模型" key="models">
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>可用模型</Title>
              <Text type="secondary">
                这些是此提供商可用的模型。默认模型可以在“配置”选项卡中选择。
              </Text>
            </div>
            
            <Divider />
            
            {models.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {models.map(model => (
                  <li key={model.id} style={{ marginBottom: 8 }}>
                    <Text strong>{model.name}</Text>
                    {model.description && (
                      <div>
                        <Text type="secondary">{model.description}</Text>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">没有可用的模型，或者您需要先配置并测试 API。</Text>
            )}
          </TabPane>
        </Tabs>
      </Spin>
    </Drawer>
  );
};

export default ProviderDetailDrawer;