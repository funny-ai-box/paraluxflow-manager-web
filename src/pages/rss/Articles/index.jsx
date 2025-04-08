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
        message.success('文章重置成功');
        return true;
      } else {
        message.error(result.message || '文章重置失败');
        return false;
      }
    } catch (error) {
      console.error('Error resetting article:', error);
      message.error('重置文章时发生错误');
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
          message.info('该文章暂无内容');
        }
      } else {
        message.error(response.message || '获取文章内容失败');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching article content:', error);
      message.error('获取文章内容时发生错误');
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setArticleContent({ html_content: '', text_content: '' });
  };

  const StatusTag = ({ status, errorMessage }) => {
    const statusMap = {
      0: { color: 'orange', text: '待处理' },
      1: { color: 'green', text: '成功' },
      2: { color: 'red', text: '失败' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: 'Unknown' };
    
    return (
      <Space>
        <Tag color={color}>{text}</Tag>
        {status === 2 && errorMessage && (
          <Tooltip title={errorMessage}>
            <Tag color="red">错误</Tag>
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
      title: '缩略图',
      dataIndex: 'thumbnail_url',
      width: 120,
      search: false,
      render: (url) => url ? (
        <Image
          src={url}
          alt="缩略图"
          width={100}
          height={60}
          fallback="/default-thumbnail.png"
          style={{ objectFit: 'cover' }}
        />
      ) : null,
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      search: true,
    },
    {
      title: '订阅源',
      dataIndex: 'feed_title',
      width: 150,
      ellipsis: true,
      search: true,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      width: 300,
      ellipsis: true,
      search: false,
    },
    {
      title: '链接',
      dataIndex: 'link',
      width: 100,
      ellipsis: true,
      search: false,
      render: (text) => text ? (
        text
      ) : null,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      valueEnum: {
        0: { text: '待处理', status: 'warning' },
        1: { text: '成功', status: 'success' },
        2: { text: '失败', status: 'error' },
      },
      render: (_, record) => (
        <StatusTag 
          status={record.status} 
          errorMessage={record.error_message} 
        />
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'published_date',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
      search: false,
    },
    {
      title: '操作',
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
              message.error(response.message || '获取文章列表失败');
              return {
                data: [],
                success: false,
              };
            }
          } catch (error) {
            console.error('Error fetching articles:', error);
            message.error('获取文章列表时发生错误');
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
        headerTitle="文章列表"
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
            <h3>HTML 内容</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <SyncOutlined spin style={{ fontSize: 24 }} />
                <p>正在加载内容...</p>
              </div>
            ) : (
              <HtmlContentViewer htmlContent={articleContent.html_content} />
            )}
          </Col>
          <Col span={12}>
            <h3>文本内容</h3>
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
                  <p>正在加载内容...</p>
                </div>
              ) : (
                articleContent.text_content || '暂无文本内容'
              )}
            </div>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default ArticleTable;