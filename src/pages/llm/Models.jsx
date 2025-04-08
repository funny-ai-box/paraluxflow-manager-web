import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Select, 
  message, 
  Space, 
  Tag,
  Button,
  Empty
} from 'antd';
import { 
  RobotOutlined, 
  SyncOutlined,
  BookOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { fetchLlmProviders, fetchLlmProviderModels } from '@/services/llm';

const { Title, Text } = Typography;
const { Option } = Select;

const LlmModelsPage = () => {
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchModels(selectedProvider);
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    try {
      const response = await fetchLlmProviders();
      if (response.code === 200) {
        setProviders(response.data || []);
        
        // Auto-select the first active provider
        const activeProvider = response.data.find(p => p.status === 1);
        if (activeProvider) {
          setSelectedProvider(activeProvider.id);
        }
      } else {
        message.error(response.message || 'Failed to fetch LLM providers');
      }
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      message.error('An error occurred while fetching LLM providers');
    }
  };

  const fetchModels = async (providerId) => {
    setLoading(true);
    try {
      const response = await fetchLlmProviderModels(providerId);
      if (response.code === 200) {
        setModels(response.data || []);
      } else {
        message.error(response.message || 'Failed to fetch provider models');
        setModels([]);
      }
    } catch (error) {
      console.error('Error fetching provider models:', error);
      message.error('An error occurred while fetching provider models');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value) => {
    setSelectedProvider(value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <RobotOutlined />
          <Text strong>{text}</Text>
          {record.is_default && <Tag color="blue">Default</Tag>}
        </Space>
      ),
    },
    {
      title: 'Context Window',
      dataIndex: 'context_window',
      key: 'context_window',
      render: (value) => value ? `${value.toLocaleString()} tokens` : '-',
    },
    {
      title: 'Model Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const modelTypeMap = {
          'text': { color: 'green', text: 'Text' },
          'embedding': { color: 'blue', text: 'Embedding' },
          'image': { color: 'purple', text: 'Image' },
          'audio': { color: 'orange', text: 'Audio' },
          'multimodal': { color: 'magenta', text: 'Multimodal' },
        };
        
        const { color, text } = modelTypeMap[type] || { color: 'default', text: type || 'Unknown' };
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {const statusMap = {
            1: { color: 'success', text: 'Available' },
            0: { color: 'default', text: 'Unavailable' },
          };
          
          const { color, text } = statusMap[status] || { color: 'default', text: 'Unknown' };
          
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => date || '-',
      },
    ];
  
    const renderProviderSelector = () => (
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ marginRight: 16 }}>Select Provider:</Text>
        <Select
          placeholder="Select a provider"
          style={{ width: 300 }}
          value={selectedProvider}
          onChange={handleProviderChange}
        >
          {providers.map(provider => (
            <Option key={provider.id} value={provider.id}>
              <Space>
                {provider.logo && (
                  <img src={provider.logo} alt={provider.name} style={{ height: 20, width: 'auto' }} />
                )}
                {provider.name}
                {provider.status === 0 && <Tag color="warning">Inactive</Tag>}
              </Space>
            </Option>
          ))}
        </Select>
        <Button 
          type="text" 
          icon={<SyncOutlined />} 
          onClick={() => selectedProvider && fetchModels(selectedProvider)}
          loading={loading}
          style={{ marginLeft: 8 }}
        >
          Refresh
        </Button>
      </div>
    );
  
    return (
      <PageContainer
        title="LLM Models"
        subTitle="Available models from different LLM providers"
      >
        <Card>
          {renderProviderSelector()}
          
          {providers.length === 0 ? (
            <Empty 
              description="No providers available" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          ) : models.length === 0 ? (
            <Empty 
              description={
                selectedProvider 
                  ? "No models available for this provider" 
                  : "Please select a provider to view models"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table 
              columns={columns} 
              dataSource={models} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          )}
          
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              <BookOutlined style={{ marginRight: 8 }} />
              Note: Model availability depends on provider configuration and API access.
            </Text>
          </div>
        </Card>
      </PageContainer>
    );
  };
  
  export default LlmModelsPage;