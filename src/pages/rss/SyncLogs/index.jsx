import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  message, 
  Tooltip, 
  Badge, 
  Statistic, 
  Row, 
  Col,
  Form,
  DatePicker,
  Select,
  Divider,
  Alert,
  Progress,
  Empty
} from 'antd';
import { 
  SyncOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  LineChartOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSyncLogs, fetchSyncStats, triggerSync } from '@/services/sync';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SyncLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [filterForm] = Form.useForm();
  const navigate = useNavigate();
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showQuickJumper: true,
    showSizeChanger: true,
  });

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    try {
      const result = await fetchSyncLogs({
        page: params.current || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        status: params.status,
        triggered_by: params.triggered_by,
        start_date: params.date_range?.[0]?.format('YYYY-MM-DD'),
        end_date: params.date_range?.[1]?.format('YYYY-MM-DD'),
      });
      
      if (result.code === 200) {
        setLogs(result.data.list || []);
        setPagination({
          ...pagination,
          current: params.current || pagination.current,
          total: result.data.total,
        });
      } else {
        message.error(result.message || '获取同步日志失败');
      }
    } catch (error) {
      console.error('获取同步日志出错:', error);
      message.error('获取同步日志时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const result = await fetchSyncStats();
      if (result.code === 200) {
        setStats(result.data || {});
      } else {
        message.error(result.message || '获取同步统计数据失败');
      }
    } catch (error) {
      console.error('获取同步统计数据出错:', error);
      message.error('获取同步统计数据时发生错误');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, []);

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchLogs({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      ...filterForm.getFieldsValue(),
    });
  };

  const handleSearch = (values) => {
    fetchLogs({
      current: 1,
      pageSize: pagination.pageSize,
      ...values,
    });
  };

  const handleReset = () => {
    filterForm.resetFields();
    fetchLogs({
      current: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleTriggerSync = async () => {
    setTriggering(true);
    try {
      const result = await triggerSync();
      if (result.code === 200) {
        message.success('同步任务已触发');
        // 短暂延迟后刷新列表
        setTimeout(() => {
          fetchLogs();
          fetchStatistics();
        }, 1000);
      } else {
        message.error(result.message || '触发同步失败');
      }
    } catch (error) {
      console.error('触发同步出错:', error);
      message.error('触发同步时发生错误');
    } finally {
      setTriggering(false);
    }
  };

  const getStatusTag = (status) => {
    if (status === 0) {
      return <Badge status="processing" text="进行中" />;
    } else if (status === 1) {
      return <Badge status="success" text="成功" />;
    } else if (status === 2) {
      return <Badge status="error" text="失败" />;
    }
    return <Badge status="default" text="未知" />;
  };

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

  // 显示触发方式
  const getTriggeredByTag = (type) => {
    if (type === 'manual') {
      return <Tag color="blue">手动触发</Tag>;
    } else if (type === 'schedule') {
      return <Tag color="green">定时触发</Tag>;
    }
    return <Tag>未知</Tag>;
  };

  const columns = [
    {
      title: '同步ID',
      dataIndex: 'sync_id',
      key: 'sync_id',
      width: 100,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Link to={`/rss-manager/sync-logs/detail/${text}`}>
            {text.substring(0, 8)}...
          </Link>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '订阅源数量',
      key: 'feeds',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Space>
            <Text>共 {record.total_feeds} 个订阅源</Text>
          </Space>
          <Space>
            <Text type="success">成功: {record.synced_feeds}</Text>
            <Text type="danger">失败: {record.failed_feeds}</Text>
          </Space>
          {record.total_feeds > 0 && (
            <Progress 
              percent={Math.round((record.synced_feeds / record.total_feeds) * 100)} 
              size="small" 
              status={record.status === 2 ? "exception" : "normal"}
              style={{ marginTop: 4 }}
            />
          )}
        </Space>
      ),
    },
    {
      title: '文章数量',
      dataIndex: 'total_articles',
      key: 'total_articles',
      width: 100,
      render: (text) => text || 0,
    },
    {
      title: '耗时',
      dataIndex: 'total_time',
      key: 'total_time',
      width: 150,
      render: (time) => formatDuration(time),
    },
    {
      title: '触发方式',
      dataIndex: 'triggered_by',
      key: 'triggered_by',
      width: 120,
      render: (type) => getTriggeredByTag(type),
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '完成时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => navigate(`/rss-manager/sync-logs/detail/${record.sync_id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  // 渲染统计卡片
  const renderStatsCards = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card loading={statsLoading}>
          <Statistic
            title="同步总次数"
            value={stats.total_syncs || 0}
            prefix={<SyncOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={statsLoading}>
          <Statistic
            title="成功次数"
            value={stats.successful_syncs || 0}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={statsLoading}>
          <Statistic
            title="平均文章数"
            value={stats.avg_articles_per_sync || 0}
            precision={1}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={statsLoading}>
          <Statistic
            title="平均耗时(秒)"
            value={stats.avg_time_per_sync || 0}
            precision={1}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

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
            <Form.Item name="status" label="状态">
              <Select placeholder="选择状态" allowClear>
                <Option value={0}>进行中</Option>
                <Option value={1}>成功</Option>
                <Option value={2}>失败</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="triggered_by" label="触发方式">
              <Select placeholder="选择触发方式" allowClear>
                <Option value="manual">手动触发</Option>
                <Option value="schedule">定时触发</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8} lg={12}>
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

  // 渲染最近同步活动
  const renderRecentActivity = () => {
    const recentLogs = stats.recent_logs || [];
    
    return (
      <Card 
        title="最近同步活动" 
        style={{ marginBottom: 16 }}
        loading={statsLoading}
       
      >
        {stats.ongoing_syncs > 0 && (
          <Alert
            message={`当前有 ${stats.ongoing_syncs} 个同步任务正在进行`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {recentLogs.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {recentLogs.map((log, index) => (
              <li key={log.sync_id} style={{ 
                padding: '8px 0', 
                borderBottom: index === recentLogs.length - 1 ? 'none' : '1px solid #f0f0f0' 
              }}>
                <Space>
                  {getStatusTag(log.status)}
                  <Text>
                    {log.triggered_by === 'manual' ? '手动' : '定时'}同步
                  </Text>
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {dayjs(log.start_time).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                  <Text>共 {log.total_feeds} 个订阅源</Text>
                  <Text>
                    文章: {log.total_articles || 0} 篇
                  </Text>
                  <Link to={`/rss-manager/sync-logs/detail/${log.sync_id}`}>
                    查看详情
                  </Link>
                </Space>
              </li>
            ))}
          </ul>
        ) : (
          <Empty description="暂无同步记录" />
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>同步日志</Title>
            <Space>
       
              <Button 
                type="primary" 
                icon={<SyncOutlined />} 
                onClick={handleTriggerSync} 
                loading={triggering}
              >
                触发同步
              </Button>
            </Space>
          </div>
        }
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        {/* 统计数据卡片 */}
        {renderStatsCards()}
        
        {/* 最近活动 */}
        {renderRecentActivity()}
        
        {/* 过滤表单 */}
        {renderFilterForm()}
        
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="sync_id"
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 1300 }}
        />
      </Card>
    </div>
  );
};

export default SyncLogs;