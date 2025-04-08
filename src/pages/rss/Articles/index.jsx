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
  Space,
  Card,
  Typography,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
  Badge,
  Empty,
  Tabs
} from 'antd';
import { 
  SyncOutlined, 
  EyeOutlined, 
  ReloadOutlined, 
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LinkOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import dayjs from 'dayjs';

import { fetchArticleDetail, fetchArticleList, resetArticle } from '@/services/article';
import HtmlContentViewer from '@/components/HtmlContentViewer';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const ArticleTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState({});
  const [articleContent, setArticleContent] = useState({ html_content: '', text_content: '' });
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState('html');

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
      1: { color: 'success', text: '成功' },
      2: { color: 'error', text: '失败' },
    };
    
    return (
      <Space>
        <Badge 
          status={statusMap[status]?.color || 'default'} 
          text={statusMap[status]?.text || '未知'}
        />
        {status === 2 && errorMessage && (
          <Tooltip title={errorMessage}>
            <Tag color="red">错误详情</Tag>
          </Tooltip>
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: '文章信息',
      key: 'info',
      width: 400,
      render: (_, record) => (
        <Space align="start">
          {record.thumbnail_url && (
            <Image
              src={record.thumbnail_url}
              alt="缩略图"
              width={100}
              height={60}
              style={{
                objectFit: 'cover',
                borderRadius: 4,
                border: '1px solid #f0f0f0'
              }}
              fallback="/default-thumbnail.png"
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text 
              strong 
              ellipsis={{ tooltip: record.title }} 
              style={{ maxWidth: 250 }}
            >
              {record.title}
            </Text>
            
            <Text 
              type="secondary" 
              ellipsis={{ tooltip: record.summary }}
              style={{ fontSize: 12, maxWidth: 250 }}
            >
              {record.summary || '暂无摘要'}
            </Text>
            
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <LinkOutlined style={{ marginRight: 4 }} />
                {record.feed_title || '未知来源'}
              </Text>
              
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {record.published_date ? dayjs(record.published_date).format('YYYY-MM-DD') : '未知时间'}
              </Text>
            </Space>
          </div>
        </Space>
      ),
      search: false,
    },
    {
      title: '来源',
      dataIndex: 'feed_title',
      width: 150,
      ellipsis: true,
      search: true,
    },
    {
      title: '链接',
      dataIndex: 'link',
      width: 100,
      ellipsis: true,
      render: (text) => text ? (
        <Button 
          type="link" 
          size="small" 
          href={text} 
          target="_blank" 
          icon={<LinkOutlined />}
        >
          原文
        </Button>
      ) : null,
      search: false,
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
      filters: [
        { text: '待处理', value: 0 },
        { text: '成功', value: 1 },
        { text: '失败', value: 2 },
      ],
    },
    {
      title: '发布时间',
      dataIndex: 'published_date',
      valueType: 'date',
      width: 120,
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        record.status === 2 && (
          <Button
            key="reset"
            type="primary"
            size="small"
            danger
            icon={<ReloadOutlined />}
            onClick={() => handleResetArticle(record)}
            style={{ marginRight: 8 }}
          >
            重置
          </Button>
        ),
        record.status === 1 && (
          <Button
            key="view"
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewContent(record)}
          >
            查看
          </Button>
        ),
      ],
    },
  ];
  
  // 自定义搜索表单
  const renderSearchForm = () => (
    <Card 
      bordered={false} 
      style={{ marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <Form
        form={searchForm}
        layout="horizontal"
        onFinish={(values) => {
          // 这里可以处理搜索表单提交
          console.log('搜索条件:', values);
        }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name="title" label="标题">
              <Input placeholder="请输入文章标题" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="feed_title" label="来源">
              <Input placeholder="请输入来源" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态" allowClear>
                <Option value={0}>待处理</Option>
                <Option value={1}>成功</Option>
                <Option value={2}>失败</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="date_range" label="时间范围">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Form.Item>
              <Space>
                <Button htmlType="button" onClick={() => searchForm.resetFields()}>
                  清空
                </Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  return (
    <div style={{ padding: 16 }}>
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>文章管理</Title>
            <Space>
              <Button
                icon={<FilterOutlined />}
              >
                筛选
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
              >
                刷新
              </Button>
            </Space>
          </div>
        }
      >
        {renderSearchForm()}
        
        <ProTable
          columns={columns}
          request={async (params, sort, filter) => {
            // 转换参数格式
            const { current, pageSize, ...restParams } = params;
            
            // 转换为API参数
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
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          search={false}
          dateFormatter="string"
          headerTitle={null}
          options={false}
          cardProps={{
            bodyStyle: { padding: 0 },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      
      <Drawer
        title={
          <div>
            <Text strong style={{ fontSize: 16 }}>{currentArticle?.title}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {currentArticle?.feed_title} · {currentArticle?.published_date}
              </Text>
            </div>
          </div>
        }
        width={1200}
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        <Tabs 
          activeKey={activeTabKey} 
          onChange={setActiveTabKey}
          style={{ padding: '0 24px' }}
          tabBarStyle={{ marginBottom: 0 }}
        >
          <TabPane 
            tab={
              <Space>
                <FileTextOutlined />
                <span>HTML内容</span>
              </Space>
            } 
            key="html"
          />
          <TabPane 
            tab={
              <Space>
                <FileTextOutlined />
                <span>纯文本</span>
              </Space>
            } 
            key="text"
          />
        </Tabs>
        
        <Divider style={{ margin: '0 0 16px 0' }} />
        
        <div style={{ padding: '0 24px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <SyncOutlined spin style={{ fontSize: 24 }} />
              <p>正在加载内容...</p>
            </div>
          ) : activeTabKey === 'html' ? (
            articleContent.html_content ? (
              <HtmlContentViewer htmlContent={articleContent.html_content} />
            ) : (
              <Empty description="暂无HTML内容" />
            )
          ) : (
            <div
              style={{
                maxWidth: '100%',
                overflowY: 'auto',
                height: 'calc(100vh - 250px)',
                boxSizing: 'border-box',
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                background: '#fafafa',
                whiteSpace: 'pre-wrap',
              }}
            >
              {articleContent.text_content || <Empty description="暂无文本内容" />}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default ArticleTable;