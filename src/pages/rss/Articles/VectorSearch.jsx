import React, { useState, useRef } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Table, 
  Space, 
  Typography, 
  message, 
  Form, 
  Select, 
  Divider, 
  Row, 
  Col, 
  Tag, 
  Tooltip, 
  Alert,
  Tabs,
  Badge, 
  Empty,
  Spin,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  RocketOutlined, 
  FileTextOutlined,
  LinkOutlined,
  SyncOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { searchArticles, fetchSimilarArticles, fetchVectorStoreInfo } from '@/services/vectorization';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const VectorSearch = () => {
  const [loading, setLoading] = useState(false);
  const [storeInfoLoading, setStoreInfoLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [similarForm] = Form.useForm();
  const [searchResults, setSearchResults] = useState([]);
  const [similarResults, setSimiarResults] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  // 获取向量存储信息
  const fetchStoreInfo = async () => {
    setStoreInfoLoading(true);
    try {
      const result = await fetchVectorStoreInfo('rss_articles');
      if (result.code === 200) {
        setStoreInfo(result.data);
      } else {
        message.error(result.message || '获取向量存储信息失败');
      }
    } catch (error) {
      console.error('Error fetching vector store info:', error);
      message.error('获取向量存储信息时发生错误');
    } finally {
      setStoreInfoLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStoreInfo();
  }, []);

  // 执行语义搜索
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      const result = await searchArticles({
        query: values.query,
        limit: values.limit || 10,
        provider_type: values.provider_type,
        model: values.model
      });
      
      if (result.code === 200) {
        setSearchResults(result.data.results || []);
        if (result.data.results === 0) {
          message.info('未找到相关文章');
        }
      } else {
        message.error(result.message || '搜索失败');
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      message.error('搜索文章时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 查找相似文章
  const handleFindSimilar = async (values) => {
    setLoading(true);
    try {
      const result = await fetchSimilarArticles({
        article_id: values.article_id,
        limit: values.limit || 10,
        provider_type: values.provider_type,
        model: values.model
      });
      
      if (result.code === 200) {
        setSimiarResults(result.data || []);
        if (result.data.length === 0) {
          message.info('未找到相似文章');
        }
      } else {
        message.error(result.message || '查找相似文章失败');
      }
    } catch (error) {
      console.error('Error finding similar articles:', error);
      message.error('查找相似文章时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 文章列表列定义
  const columns = [
    {
      title: '相关度',
      dataIndex: 'similarity',
      key: 'similarity',
      width: 100,
      render: (score) => (
        <Tag color="blue">{(score * 100).toFixed(1)}%</Tag>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: '文章信息',
      key: 'info',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong ellipsis={{ tooltip: record.title }}>
            {record.title}
          </Text>
          <Text type="secondary" ellipsis={{ tooltip: record.summary }}>
            {record.summary || '暂无摘要'}
          </Text>
          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <LinkOutlined style={{ marginRight: 4 }} />
              {record.feed_title || '未知来源'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {record.published_date ? dayjs(record.published_date).format('YYYY-MM-DD') : '未知时间'}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.link && (
            <Button 
              type="primary" 
              size="small" 
              icon={<LinkOutlined />}
              href={record.link}
              target="_blank"
            >
              查看
            </Button>
          )}
          <Button
            size="small"
            icon={<RocketOutlined />}
            onClick={() => {
              similarForm.setFieldsValue({
                article_id: record.id,
                limit: 10
              });
              handleFindSimilar(similarForm.getFieldsValue());
              setActiveTab('similar');
            }}
          >
            相似文章
          </Button>
        </Space>
      ),
    },
  ];

  // 渲染向量存储信息
  const renderStoreInfo = () => {
    if (!storeInfo) return null;
    
    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card loading={storeInfoLoading}>
            <Statistic
              title="向量总数"
              value={storeInfo.total_vectors || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={storeInfoLoading}>
            <Statistic
              title="向量维度"
              value={storeInfo.dimension || 0}
              valueStyle={{ color: '#3f8600' }}
              suffix="维"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={storeInfoLoading}>
            <Statistic
              title="索引类型"
              value={storeInfo.index_type || '-'}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={storeInfoLoading}>
            <Statistic
              title="存储状态"
              value={storeInfo.status || '-'}
              valueStyle={{ color: storeInfo.status === 'healthy' ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Card 
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              向量语义搜索
            </Title>
            <Button 
              type="primary" 
              icon={<SyncOutlined />} 
              onClick={fetchStoreInfo}
              loading={storeInfoLoading}
            >
              刷新
            </Button>
          </div>
        }
      >
        {/* 向量存储信息 */}
        {renderStoreInfo()}

        {/* 操作提示信息 */}
        <Alert
          message="向量搜索说明"
          description={
            <div>
              <p>
                向量搜索基于文本的语义相似度，而不是传统的关键词匹配。例如，搜索"人工智能应用"可能会找到与"机器学习实践"相关的文章，即使它们没有共同的关键词。
              </p>
              <p>
                您还可以通过文章ID查找相似文章，系统会基于文章内容的语义向量找到最相似的其他文章。
              </p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        {/* 切换标签页 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
        >
          <Tabs.TabPane 
            tab={
              <span>
                <SearchOutlined /> 语义搜索
              </span>
            }
            key="search"
          >
            <Form
              form={searchForm}
              layout="vertical"
              onFinish={handleSearch}
              initialValues={{ limit: 10 }}
            >
              <Row gutter={16}>
                <Col span={18}>
                  <Form.Item
                    name="query"
                    label="搜索内容"
                    rules={[{ required: true, message: '请输入搜索内容' }]}
                  >
                    <TextArea 
                      placeholder="请输入您要搜索的内容..." 
                      rows={4}
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="limit" label="返回数量">
                    <Select>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={20}>20</Option>
                      <Option value={50}>50</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="model" label="嵌入模型">
                    <Select placeholder="默认" allowClear>
                      <Option value="doubao-embedding-large-text-240915">大文本嵌入模型</Option>
                      <Option value="mini-text-embedding">轻量嵌入模型</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  搜索
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <Spin spinning={loading}>
              {searchResults.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={searchResults}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条结果`,
                  }}
                />
              ) : (
                <Empty description="输入搜索内容并点击搜索按钮开始查询" />
              )}
            </Spin>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <FileTextOutlined /> 相似文章
              </span>
            }
            key="similar"
          >
            <Form
              form={similarForm}
              layout="vertical"
              onFinish={handleFindSimilar}
              initialValues={{ limit: 10 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="article_id"
                    label="文章ID"
                    rules={[{ required: true, message: '请输入文章ID' }]}
                  >
                    <Input placeholder="请输入文章ID" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="limit" label="返回数量">
                    <Select>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={20}>20</Option>
                      <Option value={50}>50</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="model" label="嵌入模型">
                    <Select placeholder="默认" allowClear>
                      <Option value="doubao-embedding-large-text-240915">大文本嵌入模型</Option>
                      <Option value="mini-text-embedding">轻量嵌入模型</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<RocketOutlined />}
                  loading={loading}
                >
                  查找相似文章
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <Spin spinning={loading}>
              {similarResults.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={similarResults}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条结果`,
                  }}
                />
              ) : (
                <Empty description="输入文章ID并点击按钮查找相似文章" />
              )}
            </Spin>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default VectorSearch;