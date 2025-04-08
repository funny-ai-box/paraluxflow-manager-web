import React, { useState } from 'react';
import { 
  Button,
  Col, 
  Drawer, 
  Row, 
  Tag, 
  message, 
  Image, 
  Tooltip, 
  Space 
} from 'antd';
import { SyncOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';

import { fetchArticleDetail, fetchArticleList, resetArticle } from '@/services/article';

import HtmlContentViewer from '../Feeds/components/HtmlContentViewer';

const ArticleTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState({});
  const [articleContent, setArticleContent] = useState({ html_content: '', text_content: '' });
  const [loading, setLoading] = useState(false);



  const handleResetArticle = async (record) => {
    try {
      const result = await resetArticle(record.id);
      if (result.code === 200) {
        message.success('Article reset successfully');
        return true;
      } else {
        message.error(result.message || 'Failed to reset article');
        return false;
      }
    } catch (error) {
      console.error('Error resetting article:', error);
      message.error('An error occurred while resetting the article');
      return false;
    }
  };

  const handleViewContent = async (record) => {
    setCurrentArticle(record);
    setDrawerVisible(true);
    setLoading(true);
    
    try {
      const response = await fetchArticleDetail(record.id);
      setLoading(false);
      
      if (response.code === 200) {
        if (response.data.content) {
          setArticleContent(response.data.content);
        } else {
          setArticleContent({ html_content: '', text_content: '' });
          message.info('No content available for this article');
        }
      } else {
        message.error(response.message || 'Failed to fetch article content');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching article content:', error);
      message.error('An error occurred while fetching article content');
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setArticleContent({ html_content: '', text_content: '' });
  };

  const StatusTag = ({ status, errorMessage }) => {
    const statusMap = {
      0: { color: 'orange', text: 'Pending' },
      1: { color: 'green', text: 'Success' },
      2: { color: 'red', text: 'Failed' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: 'Unknown' };
    
    return (
      <Space>
        <Tag color={color}>{text}</Tag>
        {status === 2 && errorMessage && (
          <Tooltip title={errorMessage}>
            <Tag color="red">Error</Tag>
          </Tooltip>
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail_url',
      width: 120,
      search: false,
      render: (url) => url ? (
        <Image
          src={url}
          alt="thumbnail"
          width={100}
          height={60}
          fallback="/default-thumbnail.png"
          style={{ objectFit: 'cover' }}
        />
      ) : null,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      search: true,
    },
    {
      title: 'Feed',
      dataIndex: 'feed_title',
      width: 150,
      ellipsis: true,
      search: true,
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      width: 300,
      ellipsis: true,
      search: false,
    },
    {
      title: 'Link',
      dataIndex: 'link',
      width: 100,
      ellipsis: true,
      search: false,
      render: (text) => text ? (
        <a href={text} target="_blank" rel="noopener noreferrer">
          Open Link
        </a>
      ) : null,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      valueEnum: {
        0: { text: 'Pending', status: 'warning' },
        1: { text: 'Success', status: 'success' },
        2: { text: 'Failed', status: 'error' },
      },
      render: (_, record) => (
        <StatusTag 
          status={record.status} 
          errorMessage={record.error_message} 
        />
      ),
    },
    {
      title: 'Published At',
      dataIndex: 'published_date',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
      search: false,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
      search: false,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
       
        record.status === 2 && (
          <Button
            key="reset"
            type="default"
            size="small"
            danger
            icon={<ReloadOutlined />}
            onClick={() => handleResetArticle(record)}
            style={{ marginRight: 8 }}
          >
            Reset
          </Button>
        ),
        record.status === 1 && (
          <Button
            key="view"
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewContent(record)}
          >
            View
          </Button>
        ),
      ],
    },
  ];

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ProTable
        columns={columns}
        request={async (params, sort, filter) => {
          // Format params for the API
          const { current, pageSize, ...restParams } = params;
          
          // Convert ProTable params to API params
          const apiParams = {
            page: current,
            per_page: pageSize,
            ...restParams,
          };
          
          try {
            const response = await fetchArticleList(apiParams);
            
            if (response.code === 200) {
              return {
                data: response.data.list,
                success: true,
                total: response.data.total,
              };
            } else {
              message.error(response.message || 'Failed to fetch articles');
              return {
                data: [],
                success: false,
              };
            }
          } catch (error) {
            console.error('Error fetching articles:', error);
            message.error('An error occurred while fetching articles');
            return {
              data: [],
              success: false,
            };
          }
        }}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        dateFormatter="string"
        headerTitle="Article List"
        toolbar={{
          actions: [
            <Button 
              key="refresh" 
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                // Refresh the table
                const actionRef = ProTable.useActionRef();
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }}
            >
              Refresh
            </Button>
          ],
        }}
        scroll={{ x: 'max-content' }}
      />
      
      <Drawer
        title={currentArticle?.title}
        width={1200}
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <h3>HTML Content</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <SyncOutlined spin style={{ fontSize: 24 }} />
                <p>Loading content...</p>
              </div>
            ) : (
              <HtmlContentViewer htmlContent={articleContent.html_content} />
            )}
          </Col>
          <Col span={12}>
            <h3>Text Content</h3>
            <div
              style={{
                maxWidth: '100%',
                overflowY: 'auto',
                height: 'calc(100vh - 200px)',
                boxSizing: 'border-box',
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <SyncOutlined spin style={{ fontSize: 24 }} />
                  <p>Loading content...</p>
                </div>
              ) : (
                articleContent.text_content || 'No text content available'
              )}
            </div>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default ArticleTable;