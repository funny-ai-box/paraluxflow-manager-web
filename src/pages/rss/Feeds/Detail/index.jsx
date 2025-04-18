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
  Empty,
  Switch
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
  ExperimentOutlined,
  GlobalOutlined,
  PoweroffOutlined,
  SettingOutlined
} from '@ant-design/icons';

import { 
  fetchRssFeedDetail, 
  testFeedLinkCrawlerScript,
  updateFeed
} from '@/services/rss';
import { fetchRssFeedArticles } from '@/services/rss';
import { syncFeedArticles } from '@/services/sync';
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
  const [proxyLoading, setProxyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
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
        message.success('订阅源文章同步任务已触发');
        // 短暂延迟后刷新文章列表
        setTimeout(() => {
          fetchFeedArticles({
            page: 1,
            pageSize: tableParams.pageSize,
          });
        }, 1000);
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
  
  const handleChangeFeedStatus = async (checked) => {
    setStatusLoading(true);
    try {
      const response = await updateFeed({
        feed_id: id,
        is_active: checked ? 1 : 0,
      });
      
      if (response.code === 200) {
        message.success('订阅源状态更新成功');
        // 更新本地状态
        setFeedDetail({
          ...feedDetail,
          is_active: checked ? 1 : 0
        });
      } else {
        message.error(response.message || '更新状态失败');
      }
    } catch (error) {
      console.error('更新订阅源状态时出错:', error);
      message.error('更新状态失败');
    } finally {
      setStatusLoading(false);
    }
  };
  
  const handleChangeProxyStatus = async (checked) => {
    setProxyLoading(true);
    try {
      const response = await updateFeed({
        feed_id: id,
        use_proxy: checked ? 1 : 0,
      });
      
      if (response.code === 200) {
        message.success('代理设置更新成功');
        // 更新本地状态
        setFeedDetail({
          ...feedDetail,
          use_proxy: checked ? 1 : 0
        });
      } else {
        message.error(response.message || '更新代理设置失败');
      }
    } catch (error) {
      console.error('更新代理设置时出错:', error);
      message.error('更新代理设置失败');
    } finally {
      setProxyLoading(false);
    }
  };

  const handleImageError = (e, url) => {
    if (!url) return;
    const img = e.currentTarget;
    if (!img.src.includes('/api/admin/v1/rss/article/proxy-image')) {
      img.src = `/api/admin/v1/rss/article/proxy-image?url=${encodeURIComponent(url)}`;
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
            
            <Card 
              size="small" 
              title={
                <Space>
                  <SettingOutlined />
                  <span>订阅源设置</span>
                </Space>
              }
              style={{ borderRadius: 4, marginBottom: 16 }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <Space>
                      <GlobalOutlined />
                      <span>使用代理访问</span>
                      <Tooltip title="启用后，系统将通过代理服务器访问订阅源内容">
                        <InfoCircleOutlined style={{ color: '#999' }} />
                      </Tooltip>
                    </Space>
                    <Switch 
                      checked={!!feedDetail.use_proxy} 
                      onChange={handleChangeProxyStatus}
                      loading={proxyLoading}
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <Space>
                      <PoweroffOutlined />
                      <span>订阅源状态</span>
                    </Space>
                    <Switch 
                      checked={!!feedDetail.is_active}
                      onChange={handleChangeFeedStatus}
                      loading={statusLoading}
                      checkedChildren="启用"
                      unCheckedChildren="禁用"
                    />
                  </div>
                </Col>
              </Row>
            </Card>
              
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