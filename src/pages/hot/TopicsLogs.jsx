import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  message, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Badge,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DesktopOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { fetchHotTopicsLogs } from '@/services/hotTopics';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HotTopicsLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showQuickJumper: true,
  });
  const [form] = Form.useForm();

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    try {
      const result = await fetchHotTopicsLogs({
        page: params.current || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        ...params.filters
      });
      
      if (result.code === 200) {
        setLogs(result.data.list || []);
        setPagination({
          ...pagination,
          current: result.data.current_page,
          total: result.data.total,
        });
      } else {
        message.error(result.message || '获取热点爬取日志失败');
      }
    } catch (error) {
      console.error('获取热点爬取日志时出错:', error);
      message.error('获取热点爬取日志时发生错误');
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
      filters,
      sorter
    });
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    // 处理日期范围
    const searchParams = { ...values };
    if (values.date_range) {
      searchParams.start_date = values.date_range[0].format('YYYY-MM-DD');
      searchParams.end_date = values.date_range[1].format('YYYY-MM-DD');
      delete searchParams.date_range;
    }
    
    fetchLogs({
      current: 1,
      filters: searchParams
    });
  };

  const handleReset = () => {
    form.resetFields();
    fetchLogs({
      current: 1,
      filters: {}
    });
  };

  // 获取平台名称
  const getPlatformName = (platform) => {
    const platformMap = {
      'weibo': '微博热搜',
      'zhihu': '知乎热榜',
      'baidu': '百度热搜',
      'toutiao': '头条热榜',
      'douyin': '抖音热榜'
    };
    return platformMap[platform] || platform;
  };

  // 获取状态标签
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <Badge status="warning" text="处理中" />;
      case 1:
        return <Badge status="success" text="成功" />;
      case 2:
        return <Badge status="error" text="失败" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  // 格式化处理时间
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '-';
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    } else {
      return `${seconds.toFixed(2)}秒`;
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
      title: '任务信息',
      key: 'task_info',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            任务ID: 
            <Tooltip title={record.task_id}>
              <Button 
                type="link" 
                href={`/hot-topics/tasks/${record.task_id}`} 
                style={{ padding: '0 5px' }}
              >
                {record.task_id ? record.task_id.substring(0, 8) + '...' : '-'}
              </Button>
            </Tooltip>
          </Text>
          <Text>
            批次ID: 
            <Tooltip title={record.batch_id}>
              <Text style={{ paddingLeft: 5 }}>
                {record.batch_id ? record.batch_id.substring(0, 8) + '...' : '-'}
              </Text>
            </Tooltip>
          </Text>
        </Space>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: platform => (
        <Tag color="blue">{getPlatformName(platform)}</Tag>
      ),
      filters: [
        { text: '微博热搜', value: 'weibo' },
        { text: '知乎热榜', value: 'zhihu' },
        { text: '百度热搜', value: 'baidu' },
        { text: '头条热榜', value: 'toutiao' },
        { text: '抖音热榜', value: 'douyin' },
      ],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => getStatusBadge(status),
      filters: [
        { text: '处理中', value: 0 },
        { text: '成功', value: 1 },
        { text: '失败', value: 2 },
      ],
    },
    {
      title: '话题数量',
      dataIndex: 'topic_count',
      key: 'topic_count',
      width: 100,
      sorter: (a, b) => a.topic_count - b.topic_count,
    },
    {
      title: '处理时间',
      key: 'processing_time',
      width: 130,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>请求: {formatDuration(record.request_duration)}</Text>
          <Text>处理: {formatDuration(record.processing_time)}</Text>
        </Space>
      ),
      sorter: (a, b) => a.request_duration - b.request_duration,
    },
    {
      title: '资源使用',
      key: 'resource_usage',
      width: 130,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>内存: {record.memory_usage?.toFixed(1) || '-'}%</Text>
          <Text>CPU: {record.cpu_usage?.toFixed(1) || '-'}%</Text>
        </Space>
      ),
    },
    {
      title: '爬虫信息',
      key: 'crawler_info',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>ID: {record.crawler_id || '-'}</Text>
          <Text>{record.crawler_host || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'error_message',
      key: 'error_message',
      width: 200,
      ellipsis: true,
      render: (text, ) => {
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
      title: '执行时间',
      key: 'execution_time',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>开始: {record.request_started_at ? dayjs(record.request_started_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</Text>
          <Text>结束: {record.request_ended_at ? dayjs(record.request_ended_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.request_started_at) - new Date(b.request_started_at),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>热点爬取日志</Title>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchLogs()}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        }
        bordered={false}
        style={{ borderRadius: '8px', marginBottom: '16px' }}
      >
        <Paragraph style={{ marginBottom: 16 }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          爬取日志记录了每次热点爬取任务的详细执行信息，包括处理耗时、资源使用情况和错误信息等。
        </Paragraph>
        
        <Card
          style={{ borderRadius: '8px', marginBottom: '16px' }}
          size="small"
        >
          <Form 
            form={form}
            layout="inline"
            onFinish={handleSearch}
          >
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="task_id" label="任务ID">
                  <Input placeholder="请输入任务ID" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="platform" label="平台">
                  <Select placeholder="请选择平台" allowClear>
                    <Option value="weibo">微博热搜</Option>
                    <Option value="zhihu">知乎热榜</Option>
                    <Option value="baidu">百度热搜</Option>
                    <Option value="toutiao">头条热榜</Option>
                    <Option value="douyin">抖音热榜</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态" allowClear>
                    <Option value={0}>处理中</Option>
                    <Option value={1}>成功</Option>
                    <Option value={2}>失败</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
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
        
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default HotTopicsLogs;