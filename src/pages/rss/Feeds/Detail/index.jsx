import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Col, 
  Drawer, 
  Row, 
  Spin, 
  Table, 
  message,
  Typography,
  Tag,
  Space,
  Avatar,
  Divider,
  Tabs,
  Badge,
  Descriptions,
  Tooltip,
  Empty
} from 'antd';
import dayjs from 'dayjs';
import { 
  SyncOutlined, 
  FileTextOutlined, 
  LinkOutlined, 
  InfoCircleOutlined, 
  CalendarOutlined,
  CodeOutlined,
  FileImageOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

import { 
  fetchRssFeedDetail, 
  syncFeedArticles, 
  fetchRssFeedArticles, 
  testFeedLinkCrawlerScript 
} from '@/services/rss';
import { getContentFromUrl } from '@/services/article';
import JsonViewer from '@/components/JsonViewer';
import CodeEditorDrawer from '../../components/CodeEditorDrawer';
import CodeGroupEditorDrawer from '../../components/CodeGroupEditorDrawer';
import HtmlContentViewer from '@/components/HtmlContentViewer';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function FeedDetail() {
  const [feedDetail, setFeedDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showHtmlDrawer, setShowHtmlDrawer] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [processedResults, setProcessedResults] = useState({ html_content: '', text_content: '' });
  const [currentTab, setCurrentTab] = useState('articles');
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const { id } = useParams();

  const getFeedDetail = async () => {
    setLoading(true);
    try {
      const result = await fetchRssFeedDetail(id);
      setLoading(false);
      if (result.code === 200) {
        setFeedDetail(result.data);
      } else {
        message.error(result.message || '获取订阅源详情失败');
      }
    } catch (error) {
      setLoading(false);
      console.error('获取订阅源详情时出错:', error);
      message.error('获取订阅源详情时发生错误');
    }
  };

  const fetchFeedArticles = async (params = { page: 1, pageSize: 10 }) => {
    try {
      setLoading(true);
      const result = await fetchRssFeedArticles({
        id,
        page: params.page,
        pageSize: params.pageSize
      });
      
      if (result.code === 200) {
        setTestData(result.data.list || []);
        setTableParams({
          ...params,
          total: result.data.total || 0,
        });
      } else {
        message.error(result.message || '获取订阅源文章失败');
      }
    } catch (error) {
      console.error('获取订阅源文章时出错:', error);
      message.error('获取订阅源文章时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    setTableParams(params);
    fetchFeedArticles(params);
  };

  useEffect(() => {
    if (id) {
      getFeedDetail();
      fetchFeedArticles(tableParams);
    }
  }, [id]); 

  const handleSyncArticles = async () => {
    setLoading(true);
    try {
      const result = await syncFeedArticles(id);
      if (result.code === 200) {
        message.success('订阅源文章同步成功');
        fetchFeedArticles({
          page: 1,
          pageSize: tableParams.pageSize,
        });
      } else {
        message.error(result.message || '同步订阅源文章失败');
      }
    } catch (error) {
      console.error('同步订阅源文章时出错:', error);
      message.error('同步订阅源文章时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTestProcessing = async () => {
    try {
      const result = await testFeedLinkCrawlerScript({
        feed_id: feedDetail.id,
        html: htmlContent,
      });
      if (result.code === 200) {
        setProcessedResults(result.data);
        message.success('内容处理成功');
      } else {
        message.error(result.message || '处理内容失败');
      }
    } catch (error) {
      console.error('处理内容时出错:', error);
      message.error('处理内容时发生错误');
    }
  };

  const handleFetchHtmlContent = async (link) => {
    setHtmlLoading(true);
    setShowHtmlDrawer(true);
    try {
      const result = await getContentFromUrl(link);
      setHtmlLoading(false);
      if (result.code === 200) {
        setHtmlContent(result.data);
      } else {
        message.error(result.message || '获取HTML内容失败');
      }
    } catch (error) {
      console.error('获取HTML内容时出错:', error);
      message.error('获取HTML内容时发生错误');
      setHtmlLoading(false);
    }
  };

  const handleImageError = (e, url) => {
    if (!url) return;
    const img = e.currentTarget;
    if (!img.src.includes('/api/v1/article/proxy-image')) {
      img.src = `/api/v1/article/proxy-image?url=${encodeURIComponent(url)}`;
    } else {
      img.src = '/default-thumbnail.png';
      img.onerror = null; // 防止无限循环
    }
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '文章信息',
      dataIndex: 'title',
      key: 'title',
      width: 350,
      render: (text, record) => (
        <Space align="start">
          {record.thumbnail_url && (
            <div style={{ width: 80, height: 60, overflow: 'hidden', borderRadius: 4 }}>
              <img
                src={record.thumbnail_url}
                alt="缩略图"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => handleImageError(e, record.thumbnail_url)}
              />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong ellipsis={{ tooltip: text }}>
              {text}
            </Text>
            <Text type="secondary" ellipsis={{ tooltip: record.summary }}>
              {record.summary || '暂无摘要'}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {record.published_date 
                  ? dayjs(record.published_date).format('YYYY-MM-DD HH:mm') 
                  : '未知时间'}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      width: 100,
      render: (link) => (
        link ? (
          <Tooltip title={link}>
            <Button 
              type="link" 
              icon={<LinkOutlined />} 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              原文
            </Button>
          </Tooltip>
        ) : '无链接'
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />} 
          onClick={() => handleFetchHtmlContent(record.link)}
        >
          查看内容
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        loading={loading && !feedDetail.id}
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
        title={
          <Space>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => window.history.back()}
              style={{ marginLeft: -12 }}
            >
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {feedDetail.title || '订阅源详情'}
            </Title>
          </Space>
        }
      >
        <Row gutter={24}>
          <Col span={6}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '20px', 
              background: '#f9f9f9', 
              borderRadius: 8,
              height: '100%',
              minHeight: 200,
              justifyContent: 'center'
            }}>
              <Avatar 
                src={feedDetail.logo} 
                size={100} 
                style={{ marginBottom: 16 }}
                shape="square"
              >
                {feedDetail.title ? feedDetail.title.charAt(0).toUpperCase() : '?'}
              </Avatar>
              
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{feedDetail.title}</Text>
                <div style={{ marginTop: 8 }}>
                  {feedDetail.is_active ? (
                    <Badge status="success" text="已启用" />
                  ) : (
                    <Badge status="error" text="已禁用" />
                  )}
                </div>
              </div>
            </div>
          </Col>
          
          <Col span={18}>
            <Descriptions 
              title="基本信息" 
              column={2} 
              bordered 
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="订阅源 URL" span={2}>
                <Text ellipsis style={{ maxWidth: '100%' }} copyable>
                  {feedDetail.url || '-'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="描述" span={2}>
                {feedDetail.description || '暂无描述'}
              </Descriptions.Item>
              
              <Descriptions.Item label="分类">
                {feedDetail.category_id ? (
                  <Tag color="blue">{feedDetail.category?.name || feedDetail.category_id}</Tag>
                ) : '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="创建时间">
                {feedDetail.created_at || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="更新时间">
                {feedDetail.updated_at || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="抓取状态">
                {feedDetail.last_fetch_status === 1 ? (
                  <Badge status="success" text="成功" />
                ) : feedDetail.last_fetch_status === 2 ? (
                  <Badge status="error" text="失败" />
                ) : (
                  <Badge status="default" text="未知" />
                )}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <Row gutter={16}>
              <Col span={12}>
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <CodeOutlined />
                      <span>爬虫脚本</span>
                    </Space>
                  }
                  style={{ borderRadius: 4 }}
                >
                  <p>
                    订阅源的内容处理由爬虫脚本负责，您可以根据需要定制爬虫脚本来提取文章内容。
                  </p>
                  {feedDetail.group_id ? (
                    <Button type="primary" onClick={() => setShowGroupEditor(true)}>
                      编辑分组脚本
                    </Button>
                  ) : (
                    <Button type="primary" onClick={() => setShowEditor(true)}>
                      编辑订阅源脚本
                    </Button>
                  )}
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <ExperimentOutlined />
                      <span>测试与同步</span>
                    </Space>
                  }
                  style={{ borderRadius: 4 }}
                >
                  <p>
                    您可以测试抓取脚本或手动同步订阅源中的文章。
                  </p>
                  <Button 
                    type="primary" 
                    icon={<SyncOutlined />} 
                    onClick={handleSyncArticles}
                    loading={loading}
                  >
                    同步文章
                  </Button>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      
      <Card
        bordered={false}
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs 
          activeKey={currentTab} 
          onChange={setCurrentTab}
          tabBarStyle={{ 
            marginBottom: 0, 
            paddingLeft: 16,
            borderBottom: '1px solid #f0f0f0'
          }}
          tabBarExtraContent={
            <Space style={{ padding: '0 16px' }}>
              <Button 
                type="primary" 
                icon={<SyncOutlined />} 
                onClick={handleSyncArticles} 
                loading={loading}
              >
                同步文章
              </Button>
              {testData.length > 0 && (
                <Button onClick={() => setShowDrawer(true)}>
                  查看JSON数据
                </Button>
              )}
            </Space>
          }
        >
          <TabPane 
            tab={
              <Space>
                <FileTextOutlined />
                <span>文章列表</span>
              </Space>
            } 
            key="articles"
          >
            <Table 
              dataSource={testData} 
              columns={columns} 
              rowKey="id" 
              pagination={{
                current: tableParams.page,
                pageSize: tableParams.pageSize,
                total: tableParams.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条数据`,
              }} 
              loading={loading}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="暂无文章" 
                  />
                )
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Drawer
        title="文章数据 (JSON)"
        placement="right"
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
        width={720}
        destroyOnClose
      >
        <JsonViewer 
          src={testData} 
          theme="light" 
          collapsed={2} 
          enableClipboard={true}
          displayDataTypes={true}
          title="文章数据"
          emptyText="暂无文章数据"
        />
      </Drawer>

      <Drawer
        title="文章内容查看器"
        placement="right"
        onClose={() => {
          setShowHtmlDrawer(false);
          setProcessedResults({ html_content: '', text_content: '' });
          setHtmlContent('');
        }}
        open={showHtmlDrawer}
        width={'90%'}
        extra={
          <Button 
            type="primary" 
            onClick={handleTestProcessing} 
            disabled={!htmlContent}
            icon={<ExperimentOutlined />}
          >
            测试爬虫脚本
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={16} style={{ height: 'calc(100vh - 150px)', overflow: 'auto' }}>
            {htmlLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip="正在加载内容..." />
              </div>
            ) : (
              <Card 
                title="原始HTML内容" 
                bordered={false} 
                style={{ height: '100%' }}
                bodyStyle={{ padding: 0, height: 'calc(100% - 50px)' }}
              >
                <HtmlContentViewer htmlContent={htmlContent} />
              </Card>
            )}
          </Col>
          
          <Col span={8} style={{ height: 'calc(100vh - 150px)', overflow: 'auto' }}>
            <Card 
              title="处理结果" 
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <Tabs defaultActiveKey="html">
                <TabPane 
                  tab={
                    <Space>
                      <FileImageOutlined />
                      <span>HTML内容</span>
                    </Space>
                  } 
                  key="html"
                >
                  {processedResults.html_content ? (
                    <HtmlContentViewer htmlContent={processedResults.html_content} />
                  ) : (
                    <Empty description="尚未处理HTML内容" />
                  )}
                </TabPane>
                
                <TabPane 
                  tab={
                    <Space>
                      <FileTextOutlined />
                      <span>文本内容</span>
                    </Space>
                  } 
                  key="text"
                >
                  <div style={{ 
                    padding: 16, 
                    border: '1px solid #f0f0f0', 
                    borderRadius: 4, 
                    background: '#fafafa', 
                    maxHeight: '50vh', 
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {processedResults.text_content || <Empty description="尚未处理文本内容" />}
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Drawer>

      <CodeEditorDrawer
        isVisible={showEditor}
        onClose={() => setShowEditor(false)}
        feedId={feedDetail.id}
      />

      <CodeGroupEditorDrawer
        isVisible={showGroupEditor}
        onClose={() => setShowGroupEditor(false)}
        groupId={feedDetail.group_id}
      />
    </div>
  );
}