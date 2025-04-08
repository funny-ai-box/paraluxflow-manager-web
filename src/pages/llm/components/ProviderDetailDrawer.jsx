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
        message.error(response.message || 'Failed to fetch provider details');
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
      message.error('An error occurred while fetching provider details');
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
        message.error(response.message || 'Failed to fetch provider models');
      }
    } catch (error) {
      console.error('Error fetching provider models:', error);
      message.error('An error occurred while fetching provider models');
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
        message.success('Provider configuration updated successfully');
        if (onSuccess) onSuccess();
      } else {
        message.error(response.message || 'Failed to update provider configuration');
      }
    } catch (error) {
      console.error('Error updating provider configuration:', error);
      message.error('An error occurred while updating provider configuration');
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
          message: response.message || 'API test successful',
          data: response.data
        });
      } else {
        setTestResult({
          success: false,
          message: response.message || 'API test failed'
        });
      }
    } catch (error) {
      console.error('Error testing provider API:', error);
      setTestResult({
        success: false,
        message: 'An error occurred while testing the API'
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
            message="API Test Successful"
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
            message="API Test Failed"
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
      title={`Configure ${provider?.name || 'Provider'}`}
      width={720}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="primary" 
            onClick={handleSave} 
            loading={loading}
            icon={<SaveOutlined />}
          >
            Save
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Configuration" key="config">
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
                label="API Key"
                rules={[{ required: true, message: 'Please enter API key' }]}
              >
                <Input.Password placeholder="Enter API key" />
              </Form.Item>
              
              {provider?.requires_api_secret && (
                <Form.Item
                  name="api_secret"
                  label="API Secret"
                >
                  <Input.Password placeholder="Enter API secret" />
                </Form.Item>
              )}
              
              {provider?.requires_app_id && (
                <Form.Item
                  name="app_id"
                  label="Application ID"
                >
                  <Input placeholder="Enter application ID" />
                </Form.Item>
              )}
              
              <Form.Item
                name="api_base_url"
                label="API Base URL"
              >
                <Input placeholder="Enter API base URL" />
              </Form.Item>
              
              <Form.Item
                name="api_version"
                label="API Version"
              >
                <Input placeholder="Enter API version" />
              </Form.Item>
              
              <Form.Item
                name="region"
                label="Region"
              >
                <Input placeholder="Enter region" />
              </Form.Item>
              
              <Form.Item
                name="request_timeout"
                label="Request Timeout (seconds)"
              >
                <InputNumber min={1} max={300} />
              </Form.Item>
              
              <Form.Item
                name="max_retries"
                label="Max Retries"
              >
                <InputNumber min={0} max={10} />
              </Form.Item>
              
              <Form.Item
                name="default_model"
                label="Default Model"
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
          
          <TabPane tab="API Test" key="test">
            <Alert
              message="API Test"
              description="Test your configuration by sending a request to the API. This will use the configuration values you've entered but will not save them."
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
              Test API Connection
            </Button>
            
            {renderTestResult()}
          </TabPane>
          
          <TabPane tab="Models" key="models">
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Available Models</Title>
              <Text type="secondary">
                These are the models available for this provider. The default model can be selected in the Configuration tab.
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
              <Text type="secondary">No models available or you need to configure and test the API first.</Text>
            )}
          </TabPane>
        </Tabs>
      </Spin>
    </Drawer>
  );
};

export default ProviderDetailDrawer;