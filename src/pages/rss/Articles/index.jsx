import { fetchArticleDetail, fetchArticleList } from '@/services/article';
import { createArticleContentExecution } from '@/services/crawler';
import { ProTable } from '@ant-design/pro-components';
import { Button, Col, Drawer, Row, Tag, message, Image, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

const StatusTag = ({ status }) => {
  const statusMap = {
    0: { color: 'orange', text: '等待' },
    1: { color: 'green', text: '成功' },
    2: { color: 'red', text: '失败' },

  };
  const { color, text } = statusMap[status] || { color: 'grey', text: 'Unknown' };
  return <Tag color={color}>{text}</Tag>;
};

const ArticleTable = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState({});
  const [articleContent, setArticleContent] = useState({ html_content: '', text_content: '' });
  const [searchParams, setSearchParams] = useState({
    title: '',
    feed_title: '',
    status: undefined,
    date_range: [],
  });

  const fetchArticles = async (params = {}) => {
    setLoading(true);
    try {
      // Format date range if it exists
      const formattedParams = {
        ...params,
        start_date: params.date_range?.[0]?.format('YYYY-MM-DD'),
        end_date: params.date_range?.[1]?.format('YYYY-MM-DD'),
      };
      
      // Remove the original date_range parameter
      delete formattedParams.date_range;
      
      const response = await fetchArticleList(formattedParams);
      if (response.code === 200) {
        setArticles(response.data.list);
        setTotal(response.data.total);
      } else {
        message.error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('An error occurred while fetching articles');
    }
    setLoading(false);
  };



  useEffect(() => {
    fetchArticles(current, pageSize, searchParams);
  }, [current, pageSize]);

 

  const handleCrawlContent = async (record) => {
    const result = await createArticleContentExecution({
      article_id: record.id,
    });
    if (result.code === 200) {
      message.success('Crawling content successfully');
      fetchArticles(current, pageSize, searchParams);
    } else {
      message.error(result.message);
    }
  };

  const handleViewContent = async (record) => {
    setCurrentArticle(record);
    setDrawerVisible(true);
    const response = await fetchArticleDetail(record.id);

    if (response.code === 200) {
      if (response.data.content) {
        setArticleContent(response.data.content);
      }
    } else {
      message.error('Failed to fetch article content');
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setArticleContent({ html_content: '', text_content: '' });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail_url',
      width: 120,
      render: (url) => url ? (
        <Image
          src={url}
          alt="thumbnail"
          width={100}
          height={60}
          style={{ objectFit: 'cover' }}
        />
      ) : null,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
      search: true,
    },
  
    {
      title: 'Summary',
      dataIndex: 'summary',
      width: 300,
      ellipsis: true,
      
    },
    {
      title: 'Link',
      dataIndex: 'link',
      width: 180,
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Feed',
      dataIndex: 'feed_id',
      width: 180,
      search: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      valueEnum: {
        0: { text: '等待拉取', status: 'warning' },
        1: { text: '成功拉取', status: 'success' },
        2: { text: '失败', status: 'error' },
  
      },
      render: (_, record) => (
        <div>
         
            <StatusTag status={record.status} />
          { record.status===2&&record.error_message && (
             <span style={{ marginLeft: 8, color: 'red', cursor: 'pointer' }}>{record.error_message}</span>
          )}
         
          
        </div>
      ),
    },

    {
      title: 'Published At',
      dataIndex: 'published_date',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
    },
    
    {
      title: 'Options',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <Button 
          key="crawl"
          type="primary"
          size="small"
          disabled={record.is_locked}
          onClick={() => handleCrawlContent(record)}
        >
          {record.status === 1 ? 'Re-Crawl' : 'Crawl'}
        </Button>,
        record.status === 1 && (
          <Button 
            key="view" 
            type="link" 
            size="small" 
            onClick={() => handleViewContent(record)}
          >
            View
          </Button>
        ),
      ],
    },
  ];

  const totalWidth = columns.reduce((total, col) => total + (col.width || 0), 0);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ProTable
        scroll={{ x: totalWidth }}
        columns={columns}
        dataSource={articles}
        loading={loading}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          total,
        }}
        request={async (params) => {
          // 这里将 ProTable 的请求参数转换为后端接口所需的格式
          const { current, pageSize, ...restParams } = params;
          await fetchArticles({
            page: current,
            per_page: pageSize,
            ...restParams,
          });
          return {
            data: articles,
            total,
            success: true,
          };
        }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        dateFormatter="string"
        headerTitle="Article List"
        toolBarRender={() => [
          <Button 
            key="refresh" 
            type="primary"
            onClick={() => {
              const actionRef = ProTable.useActionRef();
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }}
          >
            Refresh
          </Button>
        ]}
      />
      <Drawer
        title={currentArticle?.title}
        width={1440}
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <h3>HTML Content</h3>
            <div
              style={{
                maxWidth: '100%',
                overflowX: 'auto',
                overflowY: 'auto',
                height: 'calc(100vh - 200px)',
                boxSizing: 'border-box',
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '4px',
              }}
              dangerouslySetInnerHTML={{ __html: articleContent.html_content }}
            />
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
              {articleContent.text_content}
            </div>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default ArticleTable;