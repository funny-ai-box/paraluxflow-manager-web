import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  message, 
  Badge,
  Tooltip,
  Divider,
  Row,
  Col,
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { fetchCrawlerLogs } from '@/services/crawler';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CrawlerLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filterForm] = Form.useForm();

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize, ...restParams } = params;
      const response = await fetchCrawlerLogs({
        page: current || pagination.current,
        per_page: pageSize || pagination.pageSize,
        ...restParams
      });
      
      if (response.code === 200) {
        setLogs(response.data.list || []);
        setPagination({
          ...pagination,
          current: response.data.current_page,
          total: response.data.total,
          pageSize: response.data.per_page,
        });
      } else {
        message.error(response.message || '获取爬取日志失败');
      }
    } catch (error) {
      console.error('获取爬取日志时出错:', error);
      message.error('获取爬取日志时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTableChange = (pag, filters, sorter) => {
    fetchLogs({
      current: pag.current,
      pageSize: pag.pageSize,
      ...filterForm.getFieldsValue(),
    });
  };

  const handleSearch = (values) => {
    // 处理日期范围
    const searchParams = { ...values };
    if (values.date_range) {
      searchParams.start_date = values.date_range[0].format('YYYY-MM-DD');
      searchParams.end_date = values.date_range[1].format('YYYY-MM-DD');
      delete searchParams.date_range;
    }
    
    fetchLogs({
      current: 1,
      ...searchParams,
    });
  };

  const handleReset = () => {
    filterForm.resetFields();
    fetchLogs({ current: 1 });
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '-';
    return seconds.toFixed(2) + '秒';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '批次ID',
      dataIndex: 'batch_id',
      key: 'batch_id',
      width: 120,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text ? text.substring(0, 8) + '...' : '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '文章信息',
      key: 'article_info',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            ID: {record.article_id}
          </Text>
          <Text type="secondary" ellipsis style={{ width: 230 }} copyable>
            {record.article_url}
          </Text>
          <Text type="secondary">
            Feed ID: {record.feed_id}
          </Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (status === 1) {
          return <Badge status="success" text="成功" />;
        } else if (status === 2) {
          return <Badge status="error" text="失败" />;
        }
        return <Badge status="default" text="未知" />;
      },
      filters: [
        { text: '成功', value: 1 },
        { text: '失败', value: 2 },
      ],
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 120,
      render: (stage) => {
        const stageMap = {
          'html_fetch': { color: 'blue', text: '获取HTML' },
          'content_parse': { color: 'purple', text: '解析内容' },
          'script_fetch': { color: 'cyan', text: '获取脚本' },
        };
        
        const { color, text } = stageMap[stage] || { color: 'default', text: stage || '未知' };
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'HTTP状态',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 100,
      render: (code) => {
        if (!code) return '-';
        
        let color = 'default';
        if (code >= 200 && code < 300) {
          color = 'green';
        } else if (code >= 400 && code < 500) {
          color = 'orange';
        } else if (code >= 500) {
          color = 'red';
        }
        
        return <Tag color={color}>{code}</Tag>;
      },
    },
    {
      title: '处理耗时',
      dataIndex: 'request_duration',
      key: 'request_duration',
      width: 100,
      render: (duration) => formatDuration(duration),
      sorter: (a, b) => a.request_duration - b.request_duration,
    },
    {
      title: '处理结果',
      key: 'processing_result',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>原始长度: {record.original_html_length || 0}</Text>
          <Text>处理后HTML: {record.processed_html_length || 0}</Text>
          <Text>处理后文本: {record.processed_text_length || 0}</Text>
        </Space>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'error_message',
      key: 'error_message',
      width: 200,
      ellipsis: true,
      render: (text) => {
        if (!text) return '-';
        return (
          <Tooltip title={text}>
            <Text type="danger" ellipsis style={{ maxWidth: 180 }}>
              {text}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
  ];

  // 渲染过滤表单
  const renderFilterForm = () => (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={filterForm}
        layout="horizontal"
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="article_id" label="文章ID">
              <Input placeholder="请输入文章ID" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="batch_id" label="批次ID">
              <Input placeholder="请输入批次ID" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态" allowClear>
                <Option value={1}>成功</Option>
                <Option value={2}>失败</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="stage" label="阶段">
              <Select placeholder="请选择阶段" allowClear>
                <Option value="html_fetch">获取HTML</Option>
                <Option value="content_parse">解析内容</Option>
                <Option value="script_fetch">获取脚本</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="crawler_id" label="爬虫ID">
              <Input placeholder="请输入爬虫ID" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={16} lg={18}>
            <Form.Item name="date_range" label="时间范围">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} style={{ textAlign: 'right' }}>
            <Form.Item>
              <Space>
                <Button onClick={handleReset}>
                  重置
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
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>爬取日志</Title>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => fetchLogs(pagination)}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        }
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Paragraph style={{ marginBottom: 16 }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          爬取日志记录了每个文章内容获取和处理的详细信息，包括处理耗时、HTTP状态码和错误信息等。
        </Paragraph>
        
        {renderFilterForm()}
        
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          pagination={{
            ...pagination,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 1400 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default CrawlerLogs;