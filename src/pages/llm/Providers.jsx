import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  message,
  Tooltip
} from 'antd';
import { 
  ApiOutlined, 
  SettingOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { fetchLlmProviders } from '@/services/llm';
import ProviderDetailDrawer from './components/ProviderDetailDrawer';

const { Title, Text } = Typography;

const LlmProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await fetchLlmProviders();
      if (response.code === 200) {
        setProviders(response.data || []);
      } else {
        message.error(response.message || 'Failed to fetch LLM providers');
      }
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      message.error('An error occurred while fetching LLM providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleViewDetail = (provider) => {
    setSelectedProvider(provider);
    setDetailDrawerVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Provider',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.logo && (
            <img 
              src={record.logo} 
              alt={text} 
              style={{ height: 24, width: 'auto', marginRight: 8 }} 
            />
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = 'Unknown';
        let icon = null;
        
        if (status === 1) {
          color = 'success';
          text = 'Active';
          icon = <CheckCircleOutlined />;
        } else if (status === 0) {
          color = 'warning';
          text = 'Inactive';
          icon = <ExclamationCircleOutlined />;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'API Configured',
      dataIndex: 'is_configured',
      key: 'is_configured',
      render: (configured) => (
        <Tag color={configured ? 'green' : 'orange'}>
          {configured ? 'Configured' : 'Not Configured'}
        </Tag>
      ),
    },
    {
      title: 'Default Model',
      dataIndex: 'default_model',
      key: 'default_model',
      render: (model) => model || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<SettingOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            Configure
          </Button>
          <Button 
            icon={<ApiOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Test API
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="LLM Providers"
      subTitle="Manage and configure large language model providers"
    >
      <Card>
        <Table 
          columns={columns} 
          dataSource={providers} 
          rowKey="id" 
          loading={loading}
          pagination={false}
        />
      </Card>

      {selectedProvider && (
        <ProviderDetailDrawer
          visible={detailDrawerVisible}
          provider={selectedProvider}
          onClose={() => {
            setDetailDrawerVisible(false);
            setSelectedProvider(null);
          }}
          onSuccess={fetchProviders}
        />
      )}
    </PageContainer>
  );
};

export default LlmProvidersPage;