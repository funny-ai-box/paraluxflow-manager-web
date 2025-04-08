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
  Empty,
  Avatar,
  Tooltip,
  Divider,
  Badge,
  Segmented,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  RobotOutlined, 
  SyncOutlined,
  BookOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  BuildOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { fetchLlmProviders, fetchLlmProviderModels } from '@/services/llm';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const LlmModelsPage = () => {
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');

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
      title: '模型信息',
      key: 'modelInfo',
      width: 300,
      render: (_, record) => (
        <Space align="start">
          <Avatar 
            style={{ 
              backgroundColor: getModelTypeColor(record.type).bg,
              color: getModelTypeColor(record.type).text,
              fontSize: 20
            }} 
            icon={getModelTypeIcon(record.type)} 
            size={40}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Space>
              <Text strong>{record.name}</Text>
              {record.is_default && <Tag color="blue">默认</Tag>}
            </Space>
            <Text type="secondary" ellipsis style={{ maxWidth: 220 }}>
              {record.description || '暂无描述'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '上下文窗口',
      dataIndex: 'context_window',
      key: 'context_window',
      width: 150,
      render: (value) => value ? (
        <Statistic 
          value={value} 
          suffix="令牌" 
          valueStyle={{ fontSize: 14 }}
          formatter={(value) => Number(value).toLocaleString()}
        />
      ) : '-',
    },
    {
      title: '模型类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const modelType = getModelTypeInfo(type);
        return (
          <Tag 
            color={modelType.color} 
            icon={modelType.icon}
            style={{ padding: '4px 8px' }}
          >
            {modelType.text}
          </Tag>
        );
      },
      filters: [
        { text: '文本', value: 'text' },
        { text: '嵌入', value: 'embedding' },
        { text: '图像', value: 'image' },
        { text: '音频', value: 'audio' },
        { text: '多模态', value: 'multimodal' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          1: { color: 'success', text: '可用' },
          0: { color: 'default', text: '不可用' },
        };
        
        const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
        
        return <Badge status={color} text={text} />;
      },
      filters: [
        { text: '可用', value: 1 },
        { text: '不可用', value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => date || '-',
      sorter: (a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(a.created_at) - new Date(b.created_at);
      }
    },
  ];

  const getModelTypeColor = (type) => {
    const typeColors = {
      'text': { bg: '#d9f7be', text: '#389e0d' },
      'embedding': { bg: '#d6e4ff', text: '#1d39c4' },
      'image': { bg: '#fff0f6', text: '#c41d7f' },
      'audio': { bg: '#fff7e6', text: '#d46b08' },
      'multimodal': { bg: '#f9f0ff', text: '#722ed1' },
    };
    
    return typeColors[type] || { bg: '#f5f5f5', text: '#666666' };
  };

  const getModelTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FileTextOutlined />;
      case 'embedding': return <DatabaseOutlined />;
      case 'image': return <FileImageOutlined />;
      case 'audio': return <AudioOutlined />;
      case 'multimodal': return <AppstoreOutlined />;
      default: return <RobotOutlined />;
    }
  };

  const getModelTypeInfo = (type) => {
    const modelTypeMap = {
      'text': { color: 'green', text: '文本', icon: <FileTextOutlined /> },
      'embedding': { color: 'blue', text: '嵌入', icon: <DatabaseOutlined /> },
      'image': { color: 'purple', text: '图像', icon: <FileImageOutlined /> },
      'audio': { color: 'orange', text: '音频', icon: <AudioOutlined /> },
      'multimodal': { color: 'magenta', text: '多模态', icon: <AppstoreOutlined /> },
    };
    
    return modelTypeMap[type] || { color: 'default', text: type || '未知', icon: <RobotOutlined /> };
  };

  const renderProviderSelector = () => (
    <div style={{ marginBottom: 24, padding: '16px 24px', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Text strong>选择提供商:</Text>
          <Select
            placeholder="请选择一个提供商"
            style={{ width: 300 }}
            value={selectedProvider}
            onChange={handleProviderChange}
            loading={!providers.length}
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
        </Space>
        
        <Space>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                value: 'table',
                icon: <BarsOutlined />,
                label: '表格视图',
              },
              {
                value: 'cards',
                icon: <AppstoreOutlined />,
                label: '卡片视图',
              },
            ]}
          />
          
          <Button 
            type="primary" 
            icon={<SyncOutlined />} 
            onClick={() => selectedProvider && fetchModels(selectedProvider)}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </Space>
    </div>
  );

  const renderModelCards = () => {
    if (!models.length) {
      return (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description={
            selectedProvider 
              ? "该提供商没有可用的模型" 
              : "请选择一个提供商以查看模型"
          }
        />
      );
    }
    
    return (
      <Row gutter={[16, 16]}>
        {models.map(model => (
          <Col xs={24} sm={12} md={8} lg={6} key={model.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, height: '100%' }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Avatar 
                  style={{ 
                    backgroundColor: getModelTypeColor(model.type).bg,
                    color: getModelTypeColor(model.type).text,
                    marginRight: 12
                  }} 
                  icon={getModelTypeIcon(model.type)} 
                  size={40}
                />
                <div style={{ overflow: 'hidden' }}>
                  <Text 
                    strong 
                    ellipsis={{ tooltip: model.name }}
                    style={{ display: 'block', fontSize: 16 }}
                  >
                    {model.name}
                  </Text>
                  <Space>
                    {getModelTypeInfo(model.type).icon}
                    <Text type="secondary">{getModelTypeInfo(model.type).text}</Text>
                    {model.is_default && <Tag color="blue">默认</Tag>}
                  </Space>
                </div>
              </div>
              
              <Paragraph 
                type="secondary" 
                ellipsis={{ rows: 2, tooltip: model.description }}
                style={{ marginBottom: 12, height: 42 }}
              >
                {model.description || '暂无描述'}
              </Paragraph>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>上下文窗口</Text>
                  <div>
                    <Text strong>
                      {model.context_window 
                        ? `${Number(model.context_window).toLocaleString()} 令牌` 
                        : '未知'}
                    </Text>
                  </div>
                </div>
                
                <Badge 
                  status={model.status === 1 ? 'success' : 'default'} 
                  text={model.status === 1 ? '可用' : '不可用'}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <PageContainer
      title="LLM 模型"
      subTitle="来自不同 LLM 提供商的可用模型"
    >
      {renderProviderSelector()}
      
      <Card
        bordered={false}
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: viewMode === 'table' ? 0 : 24 }}
      >
        {providers.length === 0 ? (
          <Empty 
            description="没有可用的提供商" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          viewMode === 'table' ? (
            <Table 
              columns={columns} 
              dataSource={models} 
              rowKey="id" 
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 个模型`
              }}
              locale={{
                emptyText: selectedProvider 
                  ? "该提供商没有可用的模型"
                  : "请选择一个提供商以查看模型"
              }}
            />
          ) : (
            renderModelCards()
          )
        )}
      </Card>
      
      <div style={{ marginTop: 16, background: '#fff', padding: 24, borderRadius: 8 }}>
        <Text type="secondary">
          <BookOutlined style={{ marginRight: 8 }} />
          注意: 模型的可用性取决于提供商的配置和 API 访问权限。请确保您有相应的权限使用这些模型。
        </Text>
      </div>
    </PageContainer>
  );
};

// 添加缺少的图标定义
const FileImageOutlined = () => <RobotOutlined />;
const AudioOutlined = () => <RobotOutlined />;

export default LlmModelsPage;