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
      message.error(result.message || 'Failed to fetch feed details');
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
        message.error(result.message || 'Failed to fetch feed articles');
      }
    } catch (error) {
      console.error('Error fetching feed articles:', error);
      message.error('An error occurred while fetching feed articles');
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
        message.success('Feed articles synced successfully');
        fetchFeedArticles({
          page: 1,
          pageSize: tableParams.pageSize,
        });
      } else {
        message.error(result.message || 'Failed to sync feed articles');
      }
    } catch (error) {
      console.error('Error syncing feed articles:', error);
      message.error('An error occurred while syncing feed articles');
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
        message.success('Content processed successfully');
      } else {
        message.error(result.message || 'Failed to process content');
      }
    } catch (error) {
      console.error('Error processing content:', error);
      message.error('An error occurred while processing the content');
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
        message.error(result.message || 'Failed to fetch HTML content');
      }
    } catch (error) {
      console.error('Error fetching HTML content:', error);
      message.error('An error occurred while fetching HTML content');
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
      title: 'Thumbnail',
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
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Link',
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
      title: 'Summary', 
      dataIndex: 'summary', 
      key: 'summary',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Published',
      dataIndex: 'published_date',
      key: 'published_date',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
    },
    {
      title: 'Actions',
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
          <Title level={4}>{feedDetail.title || 'Feed Details'}</Title>
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
            label="Description"
          >
            {feedDetail.description || 'No description available'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="Logo" valueType="image">
            {feedDetail.logo || '-'}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="URL" valueType="url">
            {feedDetail.url || '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="Active Status">
            {feedDetail.is_active ? (
              <Tag color="green">Active</Tag>
            ) : (
              <Tag color="red">Inactive</Tag>
            )}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="Category">
            {feedDetail.category_id ? `${feedDetail.category_id}` : '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="Created At" valueType="dateTime">
            {feedDetail.created_at ? dayjs(feedDetail.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="Updated At" valueType="dateTime">
            {feedDetail.updated_at ? dayjs(feedDetail.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </ProDescriptions.Item>
          
          <ProDescriptions.Item label="Crawler Script">
            {feedDetail.group_id ? (
              <Button type="primary" onClick={() => setShowGroupEditor(true)}>
                Open Group Editor
              </Button>
            ) : (
              <Button type="primary" onClick={() => setShowEditor(true)}>
                Open Feed Editor
              </Button>
            )}
          </ProDescriptions.Item>
        </ProDescriptions>
      </Card>
      
      <Card 
        title="Articles" 
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
                View JSON Data
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
            showTotal: (total) => `Total ${total} items`,
          }} 
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Drawer
        title="Article Data (JSON)"
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
        title="HTML Content"
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
              <Title level={5}>Processed Results</Title>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>HTML Content:</Text>
                <div className="mt-2">
                  {processedResults.html_content ? (
                    <HtmlContentViewer htmlContent={processedResults.html_content} />
                  ) : (
                    <Text type="secondary">No HTML content processed yet</Text>
                  )}
                </div>
              </div>
              <div>
                <Text strong>Text Content:</Text>
                <div style={{ marginTop: 8, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4, background: '#fafafa', maxHeight: '50vh', overflow: 'auto' }}>
                  {processedResults.text_content || <Text type="secondary">No text content processed yet</Text>}
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