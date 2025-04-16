import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  message, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Badge,
  Tooltip,
  Row,
  Col,
  Avatar
} from 'antd';
import { 
  SearchOutlined, 
  SyncOutlined, 
  RiseOutlined, 
  FallOutlined, 
  FireOutlined,
  LinkOutlined,
  CalendarOutlined,
  EyeOutlined,
  ReloadOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { fetchHotTopicsList, fetchLatestHotTopics } from '@/services/hotTopics';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HotTopicsList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showQuickJumper: true,
  });
  const [form] = Form.useForm();

  const fetchLatestTopics = async () => {
    setRefreshing(true);
    try {
      const result = await fetchLatestHotTopics();
      if (result.code === 200) {
        message.success('热点话题数据已更新');
        setTopics(result.data || []);
      } else {
        message.error(result.message || '获取最新热点话题失败');
      }
    } catch (error) {
      console.error('获取最新热点话题时出错:', error);
      message.error('获取最新热点话题时发生错误');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTopicsList = async (params = {}) => {
    setLoading(true);
    try {
      const result = await fetchHotTopicsList({
        page: params.current || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        ...params.filters
      });
      
      if (result.code === 200) {
        setTopics(result.data.list || []);
        setPagination({
          ...pagination,
          current: result.data.current_page,
          total: result.data.total,
        });
      } else {
        message.error(result.message || '获取热点话题列表失败');
      }
    } catch (error) {
      console.error('获取热点话题列表时出错:', error);
      message.error('获取热点话题列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestTopics();
  }, []);

  const handleTableChange = (pag, filters, sorter) => {
    fetchTopicsList({
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
    
    fetchTopicsList({
      current: 1,
      filters: searchParams
    });
  };

  const handleReset = () => {
    form.resetFields();
    fetchLatestTopics();
  };

  // 获取平台图标
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'weibo':
        return <Avatar src="/icons/weibo.png" size="small" style={{ marginRight: 8 }} />;
      case 'zhihu':
        return <Avatar src="/icons/zhihu.png" size="small" style={{ marginRight: 8 }} />;
      case 'baidu':
        return <Avatar src="/icons/baidu.png" size="small" style={{ marginRight: 8 }} />;
      case 'toutiao':
        return <Avatar src="/icons/toutiao.png" size="small" style={{ marginRight: 8 }} />;
      case 'douyin':
        return <Avatar src="/icons/douyin.png" size="small" style={{ marginRight: 8 }} />;
      default:
        return <FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />;
    }
  };

  // 获取排名变化图标
  const getRankChangeIcon = (change) => {
    if (change > 0) {
      return <RiseOutlined style={{ color: '#52c41a' }} />;
    } else if (change < 0) {
      return <FallOutlined style={{ color: '#ff4d4f' }} />;
    }
    return null;
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

  // 获取热度等级标签
  const getHeatLevelTag = (level) => {
    const colors = ['', 'green', 'blue', 'orange', 'red', 'volcano'];
    return <Tag color={colors[level] || 'default'}>热度 {level}</Tag>;
  };

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank, record) => (
        <Space>
          <span>{rank}</span>
          {record.rank_change !== 0 && (
            <span style={{ fontSize: 12 }}>
              {getRankChangeIcon(record.rank_change)}
              {Math.abs(record.rank_change)}
            </span>
          )}
        </Space>
      ),
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: '话题信息',
      dataIndex: 'topic_title',
      key: 'topic_title',
      width: 350,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            {getPlatformIcon(record.platform)}
            <Text strong>{text}</Text>
            {record.is_hot && <Tag color="red">热</Tag>}
            {record.is_new && <Tag color="green">新</Tag>}
            {getHeatLevelTag(record.heat_level)}
          </Space>
          {record.topic_description && (
            <Text type="secondary" ellipsis={{ tooltip: record.topic_description }}>
              {record.topic_description}
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            热度值: {record.hot_value || '-'}
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
      render: status => {
        const statusMap = {
          0: { status: 'default', text: '未处理' },
          1: { status: 'success', text: '已处理' },
          2: { status: 'processing', text: '处理中' },
        };
        const { status: badgeStatus, text } = statusMap[status] || { status: 'default', text: '未知' };
        return <Badge status={badgeStatus} text={text} />;
      },
      filters: [
        { text: '未处理', value: 0 },
        { text: '已处理', value: 1 },
        { text: '处理中', value: 2 },
      ],
    },
    {
      title: '爬取时间',
      dataIndex: 'crawl_time',
      key: 'crawl_time',
      width: 170,
      render: time => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
      sorter: (a, b) => new Date(a.crawl_time) - new Date(b.crawl_time),
    },
    {
      title: '链接',
      key: 'link',
      width: 100,
      render: (_, record) => record.topic_url ? (
        <a href={record.topic_url} target="_blank" rel="noopener noreferrer">
          <LinkOutlined /> 查看
        </a>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => window.open(record.topic_url, '_blank')}
          disabled={!record.topic_url}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>热点话题列表</Title>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchLatestTopics}
                loading={refreshing}
              >
                刷新
              </Button>
              <Link to="/hot-topics/stats">
                <Button type="primary" icon={<LineChartOutlined />}>
                  统计分析
                </Button>
              </Link>
            </Space>
          </div>
        }
        bordered={false}
        style={{ borderRadius: '8px', marginBottom: '16px' }}
      >
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
                <Form.Item name="keyword" label="关键词">
                  <Input 
                    placeholder="请输入标题关键词"
                    allowClear
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  />
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
                <Form.Item name="batch_id" label="批次ID">
                  <Input placeholder="请输入批次ID" allowClear />
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
          dataSource={topics}
          rowKey="id"
          loading={loading || refreshing}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default HotTopicsList;