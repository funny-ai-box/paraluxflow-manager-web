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
        
        // 自动选择第一个可用的提供商
        const activeProvider = response.data.find(p => p.status === 1);
        if (activeProvider) {
          setSelectedProvider(activeProvider.id);
        }
      } else {
        message.error(response.message || '获取 LLM 提供商失败');
      }
    } catch (error) {
      console.error('获取 LLM 提供商时出错:', error);
      message.error('获取 LLM 提供商时发生错误');
    }
  };

  const fetchModels = async (providerId) => {
    setLoading(true);
    try {
      const response = await fetchLlmProviderModels(providerId);
      if (response.code === 200) {
        setModels(response.data || []);
      } else {
        message.error(response.message || '获取提供商模型失败');
        setModels([]);
      }
    } catch (error) {
      console.error('获取提供商模型时出错:', error);
      message.error('获取提供商模型时发生错误');
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
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <RobotOutlined />
          <Text strong>{text}</Text>
          {record.is_default && <Tag color="blue">默认</Tag>}
        </Space>
      ),
    },
    {
      title: '上下文窗口',
      dataIndex: 'context_window',
      key: 'context_window',
      render: (value) => value ? `${value.toLocaleString()} 令牌` : '-',
    },
    {
      title: '模型类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const modelTypeMap = {
          'text': { color: 'green', text: '文本' },
          'embedding': { color: 'blue', text: '嵌入' },
          'image': { color: 'purple', text: '图像' },
          'audio': { color: 'orange', text: '音频' },
          'multimodal': { color: 'magenta', text: '多模态' },
        };
        
        const { color, text } = modelTypeMap[type] || { color: 'default', text: type || '未知' };
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          1: { color: 'success', text: '可用' },
          0: { color: 'default', text: '不可用' },
        };
        
        const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date || '-',
    },
  ];

  const renderProviderSelector = () => (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
      <Text strong style={{ marginRight: 16 }}>选择提供商:</Text>
      <Select
        placeholder="请选择一个提供商"
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
              {provider.status === 0 && <Tag color="warning">未激活</Tag>}
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
        刷新
      </Button>
    </div>
  );

  return (
    <PageContainer
      title="LLM 模型"
      subTitle="来自不同 LLM 提供商的可用模型"
    >
      <Card>
        {renderProviderSelector()}
        
        {providers.length === 0 ? (
          <Empty 
            description="没有可用的提供商" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : models.length === 0 ? (
          <Empty 
            description={
              selectedProvider 
                ? "该提供商没有可用的模型" 
                : "请选择一个提供商以查看模型"
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
            注意: 模型的可用性取决于提供商的配置和 API 访问权限。
          </Text>
        </div>
      </Card>
    </PageContainer>
  );
};

export default LlmModelsPage;