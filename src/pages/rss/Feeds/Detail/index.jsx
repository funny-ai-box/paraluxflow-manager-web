import {
  fetchRssFeedDetail,
  syncFeedArticles,
  fetchRssFeedArticles,
  testFeedLinkCrawlerScript,
  fetchArtcileHtmlByUrl
} from '@/services/rss'; // Make sure to create or update the fetchTestData function in your services
import { Button, Card, Col, Drawer, Row, Spin, Table, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import JsonViewer from '@/components/JsonViewer';
import { useParams } from 'react-router-dom';

import { ProDescriptions } from '@ant-design/pro-components';

import CodeEditorDrawer from '../../components/CodeEditorDrawer';
import CodeGroupEditorDrawer from '../../components/CodeGroupEditorDrawer';
import HtmlContentViewer from '../components/HtmlContentViewer';



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
  const { id } = useParams(); // Get the id from the URL

  const getFeedDetail = async () => {
    const result = await fetchRssFeedDetail(id);
    if (result['code'] === 200) {
      setFeedDetail(result['data']);
    } else {
      message.error(result['message']);
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
      
      if (result['code'] === 200) {
        setTestData(result['data']['items']);
        setTableParams({
          page: params.page,
          pageSize: params.pageSize,
          total: result['data']['total'],
        });
      } else {
        message.error(result['message']);
      }
    } catch (error) {
      console.error('Error fetching feed articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setTableParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
      total: tableParams.total,
    });
    
    fetchFeedArticles({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  useEffect(() => {
    getFeedDetail();
    fetchFeedArticles(tableParams);
  }, [id]); 

  const handleTestButtonClick = async () => {
    setLoading(true);
    const result = await syncFeedArticles(id); 
    setLoading(false);
    if (result['code'] === 200) {
      fetchFeedArticles({
        page: 1,
        pageSize: tableParams.pageSize,});
    } else {
      message.error('Failed to fetch test data');
    }
  };

  const handleTestProcessing = async () => {
    const result = await testFeedLinkCrawlerScript({
      feed_id: feedDetail.id,
      html: htmlContent,
    });
    if (result['code'] === 200) {
      setProcessedResults(result['data']);
    } else {
      message.error(result['message']);
    }
  };

  const handleFetchHtmlContent = async (link) => {
    setHtmlLoading(true);
    setShowHtmlDrawer(true);
    const result = await fetchArtcileHtmlByUrl(link);
    console.log('=============================result');
    console.log(result);
    console.log('=============================')
    
    setHtmlLoading(false);
    if (result['code'] === 200) {
      setHtmlContent(result['data']);
    } else {
      message.error('Failed to fetch HTML content');
    }
  };
  const handleImageError = (e, url) => {
    const img = e.currentTarget;
    // 尝试使用代理
    if (!img.src.includes('/api/feed/proxy-image')) {
      img.src = `/api/feed/proxy-image?url=${encodeURIComponent(url)}`;
    } else {
      // 如果代理也失败，使用默认图片
      img.src = '/default-thumbnail.png';
      img.onerror = null; // 防止循环
    }
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',

    },
    {
      title: 'Thumbnail',
      dataIndex:'thumbnail_url',
      key: 'thumbnail_url',
      render: (_, record) => (
        <div className="relative group cursor-pointer">
          <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={record.thumbnail_url}

              width={100}
              height={100}
              className="object-cover w-full h-full transform transition duration-200 group-hover:scale-105"
              onError={(e) => handleImageError(e, record.thumbnail_url || '')}
         
            />
          </div>
         
        </div>
      ),
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      render: (_, record) =>
        record.link ? (
          <a href={record.link} target="_blank" rel="noopener noreferrer">
            {record.link}
          </a>
        ) : (
          'N/A'
        ),
    },
    { title: 'Summary', dataIndex: 'summary', key: 'summary' , ellipsis: true},
    {
      title: 'Published',
      dataIndex: 'published_date',
      key: 'published_date',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleFetchHtmlContent(record.link)}>
            Html Content
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Card title={feedDetail.title} bordered={false} style={{ marginBottom: 20 }}>
        <ProDescriptions column={2}>
          {/* Existing ProDescriptions Items */}
          <ProDescriptions.Item
            span={2}
            valueType="text"
            contentStyle={{ maxWidth: '80%' }}
            ellipsis
            label="Description"
          >
            {feedDetail.description || 'No description available'}
          </ProDescriptions.Item>
          {/* Add your other items here */}
          <ProDescriptions.Item label="Logo" valueType="image">
            {feedDetail.logo}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="URL" valueType="url">
            {feedDetail.url}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Active Status" valueType="boolean">
            {feedDetail.is_active}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="Category ID" valueType="text">
            {feedDetail.category_id}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Collection ID" valueType="text">
            {feedDetail.collection_id}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Created At" valueType="dateTime">
            {dayjs(feedDetail.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Updated At" valueType="dateTime">
            {dayjs(feedDetail.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Script" valueType="text">
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
      <Card title="Articles" bordered={false} extra={
        <>
          <Button type="primary" onClick={handleTestButtonClick} loading={loading}>
            Test Parser Crawler
          </Button>
          {testData.length > 0 && (
            <Button style={{ marginLeft: 8 }} onClick={() => setShowDrawer(true)}>
              Show JSON Data
            </Button>
          )}
        </>
      }>
        
        <Table dataSource={testData} columns={columns} rowKey="link" pagination={{
            current: tableParams.page,
            pageSize: tableParams.pageSize,
            total: tableParams.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
          }} loading={loading}
          onChange={handleTableChange} />
       <Drawer
  title="XML to JSON Data"
  placement="right"
  closable={false}
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
            setHtmlContent(''); // Resetting data state
          }}
          height={'90vh'}
          visible={showHtmlDrawer}
          extra={
            <div>
              <Button type="primary" onClick={handleTestProcessing} style={{ marginRight: 8 }}>
                Test Crawl Script
              </Button>
              {/* <Button onClick={() => setShowEditor(true)}>Edit Script</Button> */}
            </div>
          }
          width={'95%'}
        >
          <Row>
            <Col span={16} style={{ position: 'relative', maxHeight: '100vh', overflow: 'auto' }}>
              {htmlLoading ? (
                <Spin
                  size="large"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ) : null}

              <div id="htmlContentContainer" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </Col>
            <Col span={8} style={{ borderLeft: '1px solid #e8e8e8', height: '90vh' }}>
  <div style={{ marginBottom: '16px' }}>
    <strong>HTML Content:</strong>
    <HtmlContentViewer htmlContent={processedResults.html_content} />
  </div>
  <div>
    <strong>Text Content:</strong>
    <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
      {processedResults.text_content}
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
          feedId={feedDetail.id}
          groupId={feedDetail.group_id}
        />
      </Card>
    </>
  );
}
