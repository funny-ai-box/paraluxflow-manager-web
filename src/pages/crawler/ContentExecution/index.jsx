import { fetchArticleDetail, fetchArticleList } from '@/services/article';
import {
  createArticleContentExecution,
  fetchCrwalArticleContentExcutions,
} from '@/services/crawler';
import { ReloadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Col, Drawer, Row, Tag, message } from 'antd';
import { useEffect, useState } from 'react';

const StatusTag = ({ status }) => {
  const statusMap = {
    0: { color: 'orange', text: 'Pending' }, // 未爬取
    1: { color: 'green', text: 'Fetched' }, // 已爬取
    2: { color: 'green', text: 'Success' }, // 爬取失败
    3: { color: 'red', text: 'Failed' }, // 爬取成功
  };
  const { color, text } = statusMap[status] || { color: 'grey', text: 'Unknown' }; // For any undefined status
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
  const [crawlLogsVisible, setCrawlLogsVisible] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState([]);
  const [crawlLogsLoading, setCrawlLogsLoading] = useState(false);
  const [crawlLogsCurrent, setCrawlLogsCurrent] = useState(1);
  const [crawlLogsPageSize, setCrawlLogsPageSize] = useState(10);
  const [crawlLogsTotal, setCrawlLogsTotal] = useState(0);

  const fetchArticles = async (page, pageSize) => {
    setLoading(true);
    const response = await fetchArticleList({ page, per_page: pageSize });
    if (response.code === 200) {
      setArticles(response.data.list); // Adjust according to actual API response structure
      setTotal(response.data.total); // Total number of items for pagination
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles(current, pageSize);
  }, [current, pageSize]);

  const handleTableChange = (pagination) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
    fetchArticles(pagination.current, pagination.pageSize);
  };

  const fetchCrawlLogs = async (page, pageSize) => {
    setCrawlLogsLoading(true);
    const response = await fetchCrwalArticleContentExcutions({ page, per_page: pageSize });
    if (response.code === 200) {
      setCrawlLogs(response.data.list); // Adjust according to actual API response structure
      setCrawlLogsTotal(response.data.total); // Total number of items for pagination
    }
    setCrawlLogsLoading(false);
  };

  const handleCrawlLogsTableChange = (pagination) => {
    setCrawlLogsCurrent(pagination.current);
    setCrawlLogsPageSize(pagination.pageSize);
    fetchCrawlLogs(pagination.current, pagination.pageSize);
  };

  const onCustomButtonClick = () => {
    setCrawlLogsVisible(true);
    fetchCrawlLogs(1, crawlLogsPageSize);
  };

  const handleCrawlContent = async (record) => {
    const result = await createArticleContentExecution({
      article_id: record.id,
    });
    if (result.code === 200) {
      message.success('Crawling content successfully');
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

  const closeCrawlLogsDrawer = () => {
    setCrawlLogsVisible(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: 'Feed Title',
      dataIndex: 'feed_title',
      width: 200,
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
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: 'Published At',
      dataIndex: 'published_date',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: 'Options',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <Button key="edit" type="primary" size="small" onClick={() => handleCrawlContent(record)}>
          {record.status === 1 ? 'Re-Crawl' : 'Crawl'}
        </Button>,
        record.status === 1 && (
          <Button key="view" type="primary" size="small" onClick={() => handleViewContent(record)}>
            View Content
          </Button>
        ),
      ],
    },
  ];

  const crawlLogsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Article ID',
      dataIndex: 'article_id',
      width: 120,
    },
    {
      title: 'Content ID',
      dataIndex: 'content_id',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      width: 200,
    },
    {
      title: 'Task Start Time',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: 'Task End Time',
      dataIndex: 'finished_at',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: 'Duration (seconds)',
      dataIndex: 'duration',
      render: (_, record) => {
        if (record.finished_at) {
          const start = new Date(record.created_at);
          const end = new Date(record.finished_at);
          const duration = (end.getTime() - start.getTime()) / 1000; // Duration in seconds
          return duration + 's';
        } else {
          return '-';
        }
      },
      width: 150,
    },
  ];

  return (
    <>
      <ProTable
        columns={columns}
        dataSource={articles}
        loading={loading}
        rowKey="id"
        pagination={{
          current,
          pageSize,
          total,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
        search={false}
        dateFormatter="string"
        headerTitle="Article List"
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={onCustomButtonClick}>
            Crawl Logs
          </Button>,
        ]}
      />
      <Drawer
        title={currentArticle?.title}
        width={1440}
        onClose={closeDrawer}
        visible={drawerVisible}
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
                height: 'auto',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap', // Ensures content does not wrap and can be scrolled horizontally
              }}
              dangerouslySetInnerHTML={{ __html: articleContent.html_content }}
            />
          </Col>
          <Col span={12}>
            <h3>Text Content</h3>
            <div>{articleContent.text_content}</div>
          </Col>
        </Row>
      </Drawer>
      <Drawer
        title="Crawl Logs"
        width={1000}
        onClose={closeCrawlLogsDrawer}
        visible={crawlLogsVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <ProTable
          columns={crawlLogsColumns}
          dataSource={crawlLogs}
          loading={crawlLogsLoading}
          rowKey="id"
          pagination={{
            current: crawlLogsCurrent,
            pageSize: crawlLogsPageSize,
            total: crawlLogsTotal,
            showQuickJumper: true,
          }}
          onChange={handleCrawlLogsTableChange}
          search={false}
          dateFormatter="string"
          toolBarRender={() => [
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={() => fetchCrawlLogs(1, crawlLogsPageSize)}
            >
              Refresh
            </Button>,
          ]}
        />
      </Drawer>
    </>
  );
};

export default ArticleTable;
