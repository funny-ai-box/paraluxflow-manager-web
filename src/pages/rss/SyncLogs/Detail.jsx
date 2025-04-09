import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Badge, 
  Space, 
  Typography, 
  message, 
  Button, 
  Table, 
  Timeline,
  Divider,
  Tag,
  Progress,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchSyncLogDetail } from '@/services/sync';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text, Paragraph } = Typography;

const SyncLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncLog, setSyncLog] = useState({});
  
  useEffect(() => {
    const fetchLogDetail = async () => {
      setLoading(true);
      try {
        const result = await fetchSyncLogDetail(id);
        if (result.code === 200) {
          setSyncLog(result.data || {});
        } else {
          message.error(result.message || '获取同步日志详情失败');
        }
      } catch (error) {
        console.error('获取同步日志详情出错:', error);
        message.error('获取同步日志详情时发生错误');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchLogDetail();
    }
  }, [id]);
  
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '-';
    const duration = dayjs.duration(seconds, 'seconds');
    if (seconds < 60) {
      return `${seconds.toFixed(2)}秒`;
    } else if (seconds < 3600) {
      return `${Math.floor(duration.asMinutes())}分${duration.seconds()}秒`;
    } else {
      return `${Math.floor(duration.asHours())}时${duration.minutes()}分${duration.seconds()}秒`;
    }
  };
  
  const getStatusBadge = (status) => {
    if (status === 0) {
      return <Badge status="processing" text="进行中" />;
    } else if (status === 1) {
      return <Badge status="success" text="成功" />;
    } else if (status === 2) {
      return <Badge status="error" text="失败" />;
    }
    return <Badge status="default" text="未知" />;
  };
  
  const getTriggeredByTag = (triggeredBy) => {
    if (triggeredBy === 'manual') {
      return <Tag color="blue">手动触发</Tag>;
    } else if (triggeredBy === 'schedule') {
      return <Tag color="green">定时触发</Tag>;
    }
    return <Tag>未知</Tag>;
  };
  
  const columns = [
    {
      title: '订阅源',
      dataIndex: 'feed_title',
      key: 'feed_title',
      width: 200,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text || '未知订阅源'}</Text>
          <Text type="secondary">ID: {record.feed_id}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (status === 'success') {
          return <Badge status="success" text="成功" />;
        } else if (status === 'failed') {
          return <Badge status="error" text="失败" />;
        } else if (status === 'pending') {
          return <Badge status="processing" text="进行中" />;
        }
        return <Badge status="default" text={status || '未知'} />;
      },
    },
    {
      title: '文章数量',
      dataIndex: 'articles_count',
      key: 'articles_count',
      width: 100,
      render: (text) => text || 0,
    },
    {
      title: '同步耗时',
      dataIndex: 'sync_time',
      key: 'sync_time',
      width: 150,
      render: (time) => formatDuration(time),
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      width: 250,
      ellipsis: true,
      render: (text) => text ? (
        <Paragraph ellipsis={{ rows: 2, expandable: true }} type="danger">
          {text}
        </Paragraph>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Link to={`/rss-manager/feeds/detail/${record.feed_id}`}>
          <Button size="small" type="default">查看订阅源</Button>
        </Link>
      ),
    },
  ];
  
  const renderDetailSection = () => {
    if (!syncLog.sync_id) {
      return (
        <Empty description="未找到同步日志" />
      );
    }
    
    const { 
      sync_id, status, total_feeds, synced_feeds, failed_feeds, 
      total_articles, total_time, triggered_by, start_time, end_time,
      error_message
    } = syncLog;
    
    return (
      <Descriptions 
        title="同步详情" 
        bordered 
        column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="同步ID" span={2}>
          <Text copyable>{sync_id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {getStatusBadge(status)}
        </Descriptions.Item>
        <Descriptions.Item label="触发方式">
          {getTriggeredByTag(triggered_by)}
        </Descriptions.Item>
        
        <Descriptions.Item label="开始时间">
          {start_time ? dayjs(start_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="完成时间">
          {end_time ? dayjs(end_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="总耗时" span={2}>
          {formatDuration(total_time)}
        </Descriptions.Item>
        
        <Descriptions.Item label="订阅源数量" span={2}>
          <Space>
            <Text>总计: {total_feeds}</Text>
            <Divider type="vertical" />
            <Text type="success">成功: {synced_feeds}</Text>
            <Divider type="vertical" />
            <Text type="danger">失败: {failed_feeds}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="文章数量" span={2}>
          {total_articles || 0} 篇
        </Descriptions.Item>
        
        {error_message && (
          <Descriptions.Item label="错误信息" span={4}>
            <Alert
              message="同步过程中发生错误"
              description={error_message}
              type="error"
              showIcon
            />
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };
  
  const renderStatsCards = () => {
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="订阅源总数"
              value={syncLog.total_feeds || 0}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="同步成功订阅源"
              value={syncLog.synced_feeds || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="更新文章数"
              value={syncLog.total_articles || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总耗时"
              value={formatDuration(syncLog.total_time)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };
  
  const renderProgressBar = () => {
    const { total_feeds, synced_feeds, failed_feeds, status } = syncLog;
    if (!total_feeds) return null;
    
    const successPercent = Math.round((synced_feeds / total_feeds) * 100);
    const failedPercent = Math.round((failed_feeds / total_feeds) * 100);
    
    return (
      <Card title="同步进度" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <Text>总进度: {successPercent}%</Text>
        </div>
        <Progress 
          percent={successPercent} 
          status={status === 2 ? "exception" : (status === 0 ? "active" : "normal")}
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <Text type="success">成功: {synced_feeds}/{total_feeds}</Text>
            </div>
            <Progress 
              percent={successPercent}
              status="success"
              size="small"
            />
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <Text type="danger">失败: {failed_feeds}/{total_feeds}</Text>
            </div>
            <Progress 
              percent={failedPercent}
              status="exception"
              size="small"
            />
          </Col>
        </Row>
      </Card>
    );
  };
  
  const renderFeedsTable = () => {
    const details = syncLog.details || {};
    const feeds = details.feeds || [];
    
    return (
      <Card title="订阅源同步详情" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={feeds}
          rowKey={(record) => record.feed_id}
          pagination={feeds.length > 10 ? { pageSize: 10 } : false}
          scroll={{ x: 1000 }}
        />
      </Card>
    );
  };
  
  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <Space>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/rss-manager/sync-logs')}
              style={{ marginLeft: -12 }}
            >
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>同步日志详情</Title>
          </Space>
        }
        extra={
          <Space>
            {syncLog.status === 1 && (
              <Button type="primary" icon={<CheckCircleOutlined />}>
                同步成功
              </Button>
            )}
            {syncLog.status === 2 && (
              <Button type="primary" danger icon={<CloseCircleOutlined />}>
                同步失败
              </Button>
            )}
            {syncLog.status === 0 && (
              <Button type="primary" icon={<SyncOutlined spin />}>
                同步进行中
              </Button>
            )}
          </Space>
        }
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
        loading={loading}
      >
        {/* 统计卡片 */}
        {renderStatsCards()}
        
        {/* 进度条 */}
        {renderProgressBar()}
        
        {/* 详情描述 */}
        {renderDetailSection()}
        
        {/* 订阅源表格 */}
        {renderFeedsTable()}
      </Card>
    </div>
  );
};

export default SyncLogDetail;