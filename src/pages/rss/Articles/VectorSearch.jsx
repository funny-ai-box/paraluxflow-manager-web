import React, { useState, useEffect } from 'react';
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
  Statistic,
  Descriptions, // Import Descriptions
  Image,        // Import Image
  Progress      // Import Progress
} from 'antd';
import {
  SearchOutlined,
  RocketOutlined,
  FileTextOutlined,
  LinkOutlined,
  SyncOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { searchArticles, fetchSimilarArticles, fetchVectorStoreInfo } from '@/services/vectorization';
import { fetchArticleDetail } from '@/services/article'; // Import fetchArticleDetail
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs; // Corrected import for Tabs.TabPane

const VectorSearch = () => {
  const [loading, setLoading] = useState(false);
  const [storeInfoLoading, setStoreInfoLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [similarForm] = Form.useForm();
  const [searchResults, setSearchResults] = useState([]);
  const [similarResults, setSimilarResults] = useState([]); // Corrected typo: setSimiarResults -> setSimilarResults
  const [originalArticle, setOriginalArticle] = useState(null); // State for original article
  const [storeInfo, setStoreInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  // Get vector store info
  const fetchStoreInfo = async () => {
    setStoreInfoLoading(true);
    try {
      const result = await fetchVectorStoreInfo('rss_articles'); // Assuming collection name is 'rss_articles'
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

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  // Perform semantic search
  const handleSearch = async (values) => {
    setLoading(true);
    setSearchResults([]); // Clear previous results
    try {
      const result = await searchArticles({
        query: values.query,
        limit: values.limit || 10,
        provider_type: values.provider_type,
        model: values.model
      });

      if (result.code === 200 && result.data) { // Check if result.data exists
        setSearchResults(result.data.results || []);
        if (!result.data.results || result.data.results.length === 0) {
          message.info('未找到相关文章');
        }
      } else {
        message.error(result.message || '搜索失败');
        setSearchResults([]); // Ensure results are cleared on error
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      message.error('搜索文章时发生错误');
      setSearchResults([]); // Ensure results are cleared on error
    } finally {
      setLoading(false);
    }
  };

  // Find similar articles
  const handleFindSimilar = async (values) => {
    setLoading(true);
    setOriginalArticle(null); // Clear previous original article
    setSimilarResults([]); // Clear previous similar results
    try {
      // 1. Fetch similar articles
      const similarResult = await fetchSimilarArticles({
        article_id: values.article_id,
        limit: values.limit || 10,
        provider_type: values.provider_type,
        model: values.model
      });

      // Correctly access similar_articles from the nested structure
      if (similarResult.code === 200 && similarResult.data) {
        const similarArticles = similarResult.data.similar_articles || []; // Access nested array
        setSimilarResults(similarArticles);
        if (similarArticles.length === 0) {
          message.info('未找到相似文章');
        }

        // 2. Fetch the original article detail if similar articles were found (or even if not, to show what was searched for)
        if (values.article_id) {
            const originalResult = await fetchArticleDetail(values.article_id);
            if (originalResult.code === 200 && originalResult.data) {
                setOriginalArticle(originalResult.data);
            } else {
                message.warning(`无法加载原始文章 (ID: ${values.article_id}) 的详细信息`);
            }
        }

      } else {
        message.error(similarResult.message || '查找相似文章失败');
        setSimilarResults([]); // Ensure results are cleared on error
      }
    } catch (error) {
      console.error('Error finding similar articles:', error);
      message.error('查找相似文章时发生错误');
      setSimilarResults([]); // Ensure results are cleared on error
      setOriginalArticle(null);
    } finally {
      setLoading(false);
    }
  };

  // Article list column definition (used for both search and similar)
  const columns = [
    {
      title: '相关度',
      dataIndex: 'similarity',
      key: 'similarity',
      width: 120, // Increased width for Progress
      render: (score) => (
        <Progress
            percent={parseFloat((score * 100).toFixed(1))}
            size="small"
            status="active"
            format={percent => `${percent}%`}
         />
      ),
      sorter: (a, b) => b.similarity - a.similarity, // Sort descending by default
      defaultSortOrder: 'descend',
    },
    {
      title: '文章信息',
      key: 'info',
      render: (_, record) => (
        <Space align="start">
           {record.thumbnail_url && (
            <Image
              src={record.thumbnail_url}
              alt="Thumbnail"
              width={80}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              fallback="/default-thumbnail.png" // Optional: add a fallback image
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
              <Tooltip title={record.title}>
                  <Text strong ellipsis style={{ marginBottom: 4 }}>
                      {record.title}
                  </Text>
              </Tooltip>
              <Tooltip title={record.summary || '暂无摘要'}>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 8, fontSize: 12 }}>
                      {record.summary || '暂无摘要'}
                  </Paragraph>
              </Tooltip>
              <Space size="middle" wrap style={{ fontSize: 12 }}>
                  <Text type="secondary">
                      <DatabaseOutlined style={{ marginRight: 4 }} />
                      {record.feed_title || '未知来源'}
                  </Text>
                  <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {record.published_date ? dayjs(record.published_date).format('YYYY-MM-DD') : '未知时间'}
                  </Text>
              </Space>
          </div>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180, // Adjusted width for potentially two buttons
      render: (_, record) => (
        <Space>
          {record.link && (
            <Button
              type="default" // Changed to default for less emphasis
              size="small"
              icon={<LinkOutlined />}
              href={record.link}
              target="_blank"
              rel="noopener noreferrer" // Added for security
            >
              查看
            </Button>
          )}
          {/* Show 'Find Similar' only in search results tab */}
          {activeTab === 'search' && (
             <Tooltip title="查找与此文章相似的其他文章">
                 <Button
                    type="primary" // Primary action for similarity search
                    size="small"
                    icon={<RocketOutlined />}
                    onClick={() => {
                    similarForm.setFieldsValue({
                        article_id: record.id, // Use record.id which should be the article_id
                        limit: 10
                    });
                    setActiveTab('similar'); // Switch tab first
                    // Ensure handleFindSimilar is called after state update or use effect
                    handleFindSimilar({ article_id: record.id, limit: 10 });
                    }}
                >
                    找相似
                </Button>
             </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Render vector store info
    const renderStoreInfo = () => {
        if (storeInfoLoading) {
            return <Spin tip="加载向量存储信息..."><Card style={{ marginBottom: 16 }} /></Spin>;
        }
        if (!storeInfo) return null;

        return (
        <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '16px 24px' }}>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                    <Statistic
                    title="向量总数"
                    value={storeInfo.total_vectors || 0}
                    prefix={<DatabaseOutlined />}
                    valueStyle={{ color: '#1677ff' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Statistic
                    title="向量维度"
                    value={storeInfo.dimension || 0}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="维"
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Statistic
                    title="索引类型"
                    value={storeInfo.index_type || '-'}
                    valueStyle={{ color: '#722ed1' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Statistic
                    title="存储状态"
                    value={storeInfo.status || '-'}
                    valueStyle={{ color: storeInfo.status === 'healthy' ? '#52c41a' : '#f5222d' }}
                    prefix={storeInfo.status === 'healthy' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    />
                </Col>
            </Row>
         </Card>
        );
  };

  // Render original article card for similar search tab
  const renderOriginalArticleCard = () => {
      if (activeTab !== 'similar' || !originalArticle) return null;

      return (
          <Card title="原始文章" style={{ marginBottom: 16 }}>
               <Space align="start">
                    {originalArticle.thumbnail_url && (
                        <Image
                            src={originalArticle.thumbnail_url}
                            alt="Thumbnail"
                            width={100}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                            fallback="/default-thumbnail.png" // Optional: add a fallback image
                        />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                        <Tooltip title={originalArticle.title}>
                            <Text strong ellipsis style={{ marginBottom: 4, fontSize: 16 }}>
                                {originalArticle.title}
                            </Text>
                        </Tooltip>
                         <Tooltip title={originalArticle.summary || '暂无摘要'}>
                            <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ marginBottom: 8, fontSize: 13 }}>
                                {originalArticle.summary || '暂无摘要'}
                            </Paragraph>
                        </Tooltip>
                         <Space size="large" wrap style={{ fontSize: 12 }}>
                            <Text type="secondary">
                                <DatabaseOutlined style={{ marginRight: 4 }} />
                                {originalArticle.feed_title || '未知来源'}
                            </Text>
                            <Text type="secondary">
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {originalArticle.published_date ? dayjs(originalArticle.published_date).format('YYYY-MM-DD HH:mm') : '未知时间'}
                            </Text>
                            {originalArticle.link && (
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<LinkOutlined />}
                                    href={originalArticle.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ padding: 0, height: 'auto', fontSize: 12}}
                                >
                                    查看原文
                                </Button>
                            )}
                        </Space>
                    </div>
               </Space>
          </Card>
      );
  }

  return (
    <div style={{ padding: 16 }}>
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                向量语义搜索
              </Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={fetchStoreInfo}
                loading={storeInfoLoading}
              >
                刷新存储信息
              </Button>
            </Col>
          </Row>
        }
      >
        {/* Vector Store Info */}
        {renderStoreInfo()}

        {/* Usage Info */}
        <Alert
          message="向量搜索说明"
          description={
            <div>
              <Paragraph>
                - 语义搜索：输入文本内容，系统将查找语义最相关的文章。
              </Paragraph>
              <Paragraph>
                - 相似文章：输入文章ID，系统将查找内容最相似的其他文章。
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ marginBottom: 0 }} // Remove extra space below tabs
        >
          <TabPane
            tab={
              <span>
                <SearchOutlined /> 语义搜索
              </span>
            }
            key="search"
          >
            <Card bordered={false} style={{ marginTop: -1 }}> {/* Negative margin to remove space */}
                 <Form
                    form={searchForm}
                    layout="vertical"
                    onFinish={handleSearch}
                    initialValues={{ limit: 10 }}
                    >
                    <Row gutter={16}>
                        <Col xs={24} md={18}>
                        <Form.Item
                            name="query"
                            label="搜索内容"
                            rules={[{ required: true, message: '请输入搜索内容' }]}
                        >
                            <TextArea
                            placeholder="输入文本进行语义搜索..."
                            rows={3}
                            showCount
                            maxLength={1000}
                            />
                        </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                        <Form.Item name="limit" label="返回数量">
                            <Select>
                            <Option value={5}>5</Option>
                            <Option value={10}>10</Option>
                            <Option value={20}>20</Option>
                            <Option value={50}>50</Option>
                            </Select>
                        </Form.Item>
                        {/* Optional: Model Selection
                        <Form.Item name="model" label="嵌入模型">
                            <Select placeholder="默认" allowClear>
                                <Option value="doubao-embedding-large-text-240915">大文本模型</Option>
                                <Option value="mini-text-embedding">轻量模型</Option>
                            </Select>
                        </Form.Item>
                        */}
                        <Form.Item label=" "> {/* Placeholder for alignment */}
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SearchOutlined />}
                                loading={loading}
                                block // Make button full width in its column
                            >
                                搜索
                            </Button>
                        </Form.Item>
                        </Col>
                    </Row>
                 </Form>

                <Divider />

                <Spin spinning={loading}>
                  {searchResults.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={searchResults}
                      rowKey="id" // Use article ID as key
                      pagination={{
                        pageSize: 10,
                        showTotal: (total) => `共 ${total} 条结果`,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50']
                      }}
                      scroll={{ x: 'max-content' }} // Ensure table scrolls horizontally if needed
                    />
                  ) : (
                    <Empty description="输入搜索内容并点击搜索按钮开始查询" />
                  )}
                </Spin>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <RocketOutlined /> 相似文章
              </span>
            }
            key="similar"
          >
            <Card bordered={false} style={{ marginTop: -1 }}>
                 <Form
                    form={similarForm}
                    layout="vertical"
                    onFinish={handleFindSimilar}
                    initialValues={{ limit: 10 }}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={18}>
                            <Form.Item
                                name="article_id"
                                label="文章ID"
                                rules={[{ required: true, message: '请输入文章ID' }, { pattern: /^\d+$/, message: '文章ID必须是数字' }]}
                            >
                                <Input placeholder="输入文章ID查找相似文章" />
                            </Form.Item>
                        </Col>
                         <Col xs={24} md={6}>
                            <Form.Item name="limit" label="返回数量">
                                <Select>
                                    <Option value={5}>5</Option>
                                    <Option value={10}>10</Option>
                                    <Option value={20}>20</Option>
                                    <Option value={50}>50</Option>
                                </Select>
                            </Form.Item>
                             {/* Optional: Model Selection
                            <Form.Item name="model" label="嵌入模型">
                                <Select placeholder="默认" allowClear>
                                    <Option value="doubao-embedding-large-text-240915">大文本模型</Option>
                                    <Option value="mini-text-embedding">轻量模型</Option>
                                </Select>
                            </Form.Item>
                            */}
                             <Form.Item label=" "> {/* Placeholder for alignment */}
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<RocketOutlined />}
                                    loading={loading}
                                    block
                                >
                                    查找相似
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                 </Form>

                <Divider />

                {/* Display Original Article */}
                {renderOriginalArticleCard()}

                {/* Display Similar Articles */}
                <Spin spinning={loading}>
                    {similarResults.length > 0 ? (
                        <>
                            <Title level={5} style={{ marginBottom: 16 }}>相似文章列表</Title>
                            <Table
                                columns={columns}
                                dataSource={similarResults}
                                rowKey="id" // Use article ID as key
                                pagination={{
                                pageSize: 10,
                                showTotal: (total) => `共 ${total} 条结果`,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50']
                                }}
                                scroll={{ x: 'max-content' }}
                            />
                        </>
                    ) : !originalArticle ? ( // Show prompt only if no original article is loaded yet
                        <Empty description="输入文章ID并点击按钮查找相似文章" />
                    ): ( // Show if original article is loaded but no similar found
                         <Empty description="未找到与该文章相似的其他文章" />
                    )}
                </Spin>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default VectorSearch;