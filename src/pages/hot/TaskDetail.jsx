import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  message, 
  Descriptions, 
  Spin, 
  Tag, 
  Divider, 
  Badge,
  Table,
  Tooltip,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SyncOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchHotTaskDetail, fetchHotTopicsList } from '@/services/hotTopics';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const HotTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskDetail, setTaskDetail] = useState({});
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchTaskDetail = async () => {
    setLoading(true);
    try {
      const result = await fetchHotTaskDetail(id);
      if (result.code === 0) {
        setTaskDetail(result.data || {});
      } else {
        message.error(result.message || '获取任务详情失败');
      }
    } catch (error) {
      console.error('获取任务详情时出错:', error);
      message.error('获取任务详情时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTopics = async (params = {}) => {
    setTopicsLoading(true);
    try {
      const result = await fetchHotTopicsList({
        page: params.page || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        task_id: id
      });
      
      if (result.code === 0) {
        setTopics(result.data.list || []);
        setPagination({
          ...pagination,
          current: result.data.current_page,
          total: result.data.total,
        });
      } else {
        message.error(result.message || '获取任务话题列表失败');
      }
    } catch (error) {
      console.error('获取任务话题列表时出错:', error);
      message.error('获取任务话题列表时发生错误');
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetail();
      fetchTaskTopics();
    }
  }, [id]);

  const handleTableChange = (newPagination) => {
    fetchTaskTopics({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // 获取状态标签
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <Badge status="warning" text="待爬取" />;
      case 1:
        return <Badge status="processing" text="爬取中" />;
      case 2:
        return <Badge status="success" text="已完成" />;
      case 3:
        return <Badge status="error" text="失败" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };
  
  // 获取触发类型标签
  const getTriggerTypeTag = (type) => {
    switch (type) {
      case 'manual':
        return <Tag color="blue">手动触发</Tag>;
      case 'scheduled':
        return <Tag color="green">定时触发</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  // 获取平台标签
  const getPlatformTags = (platforms) => {
    if (!platforms || platforms.length === 0) return null;
    
    const platformMap = {
      'weibo': '微博热搜',
      'zhihu': '知乎热榜',
      'baidu': '百度热搜',
      'toutiao': '头条热榜',
      'douyin': '抖音热榜'
    };
    
    return (
      <Space wrap>
        {platforms.map(platform => (
          <Tag key={platform} color="blue">
            {platformMap[platform] || platform}
          </Tag>
        ))}
      </Space>
    );
  };

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
    },
    {
      title: '话题标题',
      dataIndex: 'topic_title',
      key: 'topic_title',
      width: 350,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong ellipsis={{ tooltip: text }}>{text}</Text>
          {record.topic_description && (
            <Text type="secondary" ellipsis={{ tooltip: record.topic_description }}>
              {record.topic_description}
            </Text>
          )}
          <Space>
            {record.is_hot && <Tag color="red">热</Tag>}
            {record.is_new && <Tag color="green">新</Tag>}
            <Text type="secondary" style={{ fontSize: 12 }}>
              热度值: {record.hot_value || '-'}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: platform => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '热度等级',
      dataIndex: 'heat_level',
      key: 'heat_level',
      width: 100,
      render: level => {
        const colors = ['', 'green', 'blue', 'orange', 'red', 'volcano'];
        return <Tag color={colors[level] || 'default'}>热度 {level}</Tag>;
      },
    },
    {
      title: '爬取时间',
      dataIndex: 'crawl_time',
      key: 'crawl_time',
      width: 170,
      render: time => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '链接',
      key: 'link',
      width: 100,
      render: (_, record) => record.topic_url ? (
        <a href={record.topic_url} target="_blank" rel="noopener noreferrer">
          查看原文
        </a>
      ) : '-',
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        loading={loading}
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
        title={
          <Space>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/hot-topics/tasks')}
              style={{ marginLeft: -12 }}
            >
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              热点爬取任务详情
            </Title>
          </Space>
        }
      >
        {taskDetail.id ? (
          <>
            <Descriptions 
              title="任务信息" 
              bordered 
              column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="任务ID" span={2}>
                <Text copyable>{taskDetail.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusBadge(taskDetail.status)}
              </Descriptions.Item>
              
              <Descriptions.Item label="平台" span={2}>
                {getPlatformTags(taskDetail.platforms)}
              </Descriptions.Item>
              <Descriptions.Item label="触发类型">
                {getTriggerTypeTag(taskDetail.trigger_type)}
              </Descriptions.Item>
              
              <Descriptions.Item label="计划时间">
                {taskDetail.scheduled_time ? (
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 5 }} />
                    {dayjs(taskDetail.scheduled_time).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {taskDetail.created_at ? dayjs(taskDetail.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {taskDetail.updated_at ? dayjs(taskDetail.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="爬虫ID" span={2}>
                {taskDetail.crawler_id || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="触发者">
                {taskDetail.triggered_by ? (
                  <Space>
                    <UserOutlined />
                    {taskDetail.triggered_by}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">
              <Space>
                <FileTextOutlined />
                <span>爬取的热点话题</span>
                <Button 
                  type="link" 
                  icon={<SyncOutlined />} 
                  onClick={() => fetchTaskTopics()}
                  loading={topicsLoading}
                  size="small"
                >
                  刷新
                </Button>
              </Space>
            </Divider>
            
            <Table
              columns={columns}
              dataSource={topics}
              rowKey="id"
              loading={topicsLoading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1100 }}
              size="middle"
              locale={{
                emptyText: (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={
                      taskDetail.status === 0 
                        ? "任务尚未开始爬取" 
                        : taskDetail.status === 1 
                          ? "任务正在爬取中" 
                          : "未爬取到热点话题"
                    } 
                  />
                )
              }}
            />
          </>
        ) : (
          !loading && <Empty description="未找到任务详情" />
        )}
      </Card>
    </div>
  );
};

export default HotTaskDetail;