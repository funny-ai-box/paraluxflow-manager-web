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
  Tag 
} from 'antd';
import dayjs from 'dayjs';
import { ProDescriptions } from '@ant-design/pro-components';
import { SyncOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons';

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
import HtmlContentViewer from '../components/HtmlContentViewer';

const { Title, Text } = Typography;

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
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const { id } = useParams();

  const getFeedDetail = async () => {
    const result = await fetchRssFeedDetail(id);
    if (result.code === 200) {
      setFeedDetail(result.data);
    } else {
      message.error(result.message || '获取订阅源详情失败');
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
      img.onerror = null; // Prevent infinite loop
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
      title: '缩略图',
      dataIndex: 'thumbnail_url',
      key: 'thumbnail_url',
      width: 120,
      render: (url) => (
        url ? (
          <div className="relative group cursor-pointer">
            <div className="overflow-hidden rounded-lg bg-gray-100" style={{ width: 80, height: 60 }}>
              <img
                src={url}
                alt="Thumbnail"
                className="object-cover w-full h-full"
                onError={(e) => handleImageError(e, url)}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        ) : null
      ),
    },
    { 
      title: '标题', 
      dataIndex: 'title', 
      key: 'title',
      width: 250,
      ellipsis: true,
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      width: 180,
      ellipsis: true,
      render: (link) => (
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> Open Link
          </a>
        ) : 'N/A'
      ),
    },
    { 
      title: '摘要', 
      dataIndex: 'summary', 
      key: 'summary',
      width: 300,
      ellipsis: true,
    },
    {
      title: '发布时间',
      dataIndex: 'published_date',
      key: 'published_date',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<FileTextOutlined />} 
          onClick={() => handleFetchHtmlContent(record.link)}
        >
          View Content
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card 
        title={
          <Title level={4}>{feedDetail.title || '订阅源详情'}</Title>
        } 
        bordered={false} 
        style={{ marginBottom: 20 }}
        loading={!feedDetail.id}
      >
        <ProDescriptions column={2}>
          <ProDescriptions.Item
            span={2}
            valueType="text"
            contentStyle={{ maxWidth: '100%' }}
            ellipsis
            label="描述"
          >
            {feedDetail.description || '暂无描述'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="Logo" valueType="image">
            {feedDetail.logo || '-'}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="URL" valueType="url">
            {feedDetail.url || '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="激活状态">
            {feedDetail.is_active ? (
              <Tag color="green">已激活</Tag>
            ) : (
              <Tag color="red">未激活</Tag>
            )}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="分类">
            {feedDetail.category_id ? `${feedDetail.category_id}` : '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="创建时间" valueType="dateTime">
            {feedDetail.created_at ? dayjs(feedDetail.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="更新时间" valueType="dateTime">
            {feedDetail.updated_at ? dayjs(feedDetail.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="爬虫脚本">
            {feedDetail.group_id ? (
              <Button type="primary" onClick={() => setShowGroupEditor(true)}>
                打开分组编辑器
              </Button>
            ) : (
              <Button type="primary" onClick={() => setShowEditor(true)}>
                打开订阅源编辑器
              </Button>
            )}
          </ProDescriptions.Item>
        </ProDescriptions>
      </Card>
      
      <Card 
        title="文章列表" 
        bordered={false} 
        extra={
          <div>
            <Button 
              type="primary" 
              icon={<SyncOutlined />} 
              onClick={handleSyncArticles} 
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Sync Articles
            </Button>
            {testData.length > 0 && (
              <Button onClick={() => setShowDrawer(true)}>
                查看JSON数据
              </Button>
            )}
          </div>
        }
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
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Drawer
        title="文章数据 (JSON)"
        placement="right"
        closable={true}
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
        width={720}
      >
        <JsonViewer 
          src={testData} 
          theme="light" 
          collapsed={2} 
          enableClipboard={true}
          displayDataTypes={true}
        />
      </Drawer>

      <Drawer
        title="HTML内容"
        placement="right"
        closable={true}
        onClose={() => {
          setShowHtmlDrawer(false);
          setProcessedResults({ html_content: '', text_content: '' });
          setHtmlContent('');
        }}
        open={showHtmlDrawer}
        width={'95%'}
        extra={
          <Button type="primary" onClick={handleTestProcessing} disabled={!htmlContent}>
            Test Crawl Script
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={16} style={{ position: 'relative', height: 'calc(100vh - 150px)', overflow: 'auto' }}>
            {htmlLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip="Loading content..." />
              </div>
            ) : (
              <HtmlContentViewer htmlContent={htmlContent} />
            )}
          </Col>
          <Col span={8} style={{ borderLeft: '1px solid #e8e8e8', height: 'calc(100vh - 150px)', overflow: 'auto' }}>
            <div style={{ padding: '0 16px' }}>
              <Title level={5}>处理结果</Title>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>HTML内容:</Text>
                <div className="mt-2">
                  {processedResults.html_content ? (
                    <HtmlContentViewer htmlContent={processedResults.html_content} />
                  ) : (
                    <Text type="secondary">尚未处理HTML内容</Text>
                  )}
                </div>
              </div>
              <div>
                <Text strong>文本内容:</Text>
                <div style={{ marginTop: 8, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4, background: '#fafafa', maxHeight: '50vh', overflow: 'auto' }}>
                  {processedResults.text_content || <Text type="secondary">尚未处理文本内容</Text>}
                </div>
              </div>
            </div>
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
    </>
  );
}