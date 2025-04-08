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
        message.error(response.message || '获取 LLM 提供商失败');
      }
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      message.error('获取 LLM 提供商时发生错误');
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
      title: '提供商',
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
      title: '描述',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = '未知';
        let icon = null;
        
        if (status === 1) {
          color = 'success';
          text = '活跃';
          icon = <CheckCircleOutlined />;
        } else if (status === 0) {
          color = 'warning';
          text = '未激活';
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
      title: 'API 配置状态',
      dataIndex: 'is_configured',
      key: 'is_configured',
      render: (configured) => (
        <Tag color={configured ? 'green' : 'orange'}>
          {configured ? '已配置' : '未配置'}
        </Tag>
      ),
    },
    {
      title: '默认模型',
      dataIndex: 'default_model',
      key: 'default_model',
      render: (model) => model || '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<SettingOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            配置
          </Button>
          <Button 
            icon={<ApiOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            测试 API
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="LLM 提供商"
      subTitle="管理和配置大型语言模型提供商"
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