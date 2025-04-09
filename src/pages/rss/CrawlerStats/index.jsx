import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Select, 
  Button, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Divider,
  Table,
  Tag,
  message,
  Spin,
  Empty,
  Progress
} from 'antd';
import { 
  ReloadOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PieChartOutlined,
  BarChartOutlined,
  BugOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { fetchCrawlerStats } from '@/services/crawler';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 饼图颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CrawlerStats = () => {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [timeRange, setTimeRange] = useState('today');

  const fetchStats = async (range = timeRange) => {
    setLoading(true);
    try {
      const response = await fetchCrawlerStats({ time_range: range });
      if (response.code === 200) {
        setStatsData(response.data);
      } else {
        message.error(response.message || '获取爬虫统计信息失败');
      }
    } catch (error) {
      console.error('获取爬虫统计信息时出错:', error);
      message.error('获取爬虫统计信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    fetchStats(value);
  };

  // 渲染爬虫分布图表
  const renderCrawlerDistributionChart = () => {
    if (!statsData || !statsData.crawler_distribution || statsData.crawler_distribution.length === 0) {
      return <Empty description="暂无爬虫分布数据" />;
    }

    return (
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={statsData.crawler_distribution}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crawler_id" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === '批次数量') return [value, name];
                if (name === '平均处理时间') return [value.toFixed(2) + '秒', name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="batch_count" name="批次数量" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="avg_processing_time" name="平均处理时间" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染错误分布图表
  const renderErrorDistributionChart = () => {
    if (!statsData || !statsData.error_distribution || statsData.error_distribution.length === 0) {
      return <Empty description="暂无错误分布数据" />;
    }

    return (
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statsData.error_distribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="count"
              nameKey="error_type"
              label={(entry) => `${entry.error_type}: ${entry.count}`}
            >
              {statsData.error_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, entry) => [value, entry.payload.error_type]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染统计卡片
  const renderStatsCards = () => {
    if (!statsData) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总批次数"
              value={statsData.total_batches || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="成功率"
              value={statsData.success_rate || 0}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均处理时间"
              value={statsData.avg_processing_time || 0}
              precision={2}
              suffix="秒"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="失败批次数"
              value={statsData.failed_batches || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染成功率进度条
  const renderSuccessRateProgress = () => {
    if (!statsData) return null;

    return (
      <Card title="爬取成功率" style={{ marginBottom: 16 }}>
        <Row align="middle" gutter={16}>
          <Col span={18}>
            <Progress 
              percent={statsData.success_rate || 0} 
              status={statsData.success_rate >= 90 ? "success" : "active"}
              strokeWidth={16}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Tag color="success">成功: {statsData.success_batches || 0}</Tag>
              <Tag color="error">失败: {statsData.failed_batches || 0}</Tag>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  // 渲染爬虫分布表格
  const renderCrawlerTable = () => {
    if (!statsData || !statsData.crawler_distribution) return null;

    const columns = [
      {
        title: '爬虫ID',
        dataIndex: 'crawler_id',
        key: 'crawler_id',
      },
      {
        title: '批次数量',
        dataIndex: 'batch_count',
        key: 'batch_count',
        sorter: (a, b) => a.batch_count - b.batch_count,
      },
      {
        title: '平均处理时间',
        dataIndex: 'avg_processing_time',
        key: 'avg_processing_time',
        render: (text) => `${text.toFixed(2)}秒`,
        sorter: (a, b) => a.avg_processing_time - b.avg_processing_time,
      },
    ];

    return (
      <Card title="爬虫性能详情" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={statsData.crawler_distribution} 
          rowKey="crawler_id"
          pagination={false}
        />
      </Card>
    );
  };

  // 渲染错误分布表格
  const renderErrorTable = () => {
    if (!statsData || !statsData.error_distribution) return null;

    const columns = [
      {
        title: '错误类型',
        dataIndex: 'error_type',
        key: 'error_type',
      },
      {
        title: '出现次数',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
      },
      {
        title: '占比',
        key: 'percentage',
        render: (_, record) => {
          const total = statsData.failed_batches || 1;
          const percentage = (record.count / total * 100).toFixed(2);
          return `${percentage}%`;
        },
      },
    ];

    return (
      <Card title="错误类型分布" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={statsData.error_distribution} 
          rowKey="error_type"
          pagination={false}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>爬虫统计数据</Title>
            <Space>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                style={{ width: 150 }}
              >
                <Option value="today">今天</Option>
                <Option value="yesterday">昨天</Option>
                <Option value="last7days">最近7天</Option>
                <Option value="last30days">最近30天</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => fetchStats(timeRange)}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </div>
        }
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Spin spinning={loading}>
          {statsData ? (
            <>
              <Row>
                <Col span={24}>
                  <Paragraph>
                    <Text strong>
                      统计时间范围: {statsData.time_range?.start_date ? new Date(statsData.time_range.start_date).toLocaleString() : '-'} 至 {statsData.time_range?.end_date ? new Date(statsData.time_range.end_date).toLocaleString() : '-'}
                    </Text>
                  </Paragraph>
                </Col>
              </Row>
              
              {/* 统计卡片 */}
              {renderStatsCards()}
              
              {/* 成功率进度条 */}
              {renderSuccessRateProgress()}
              
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title={<><RobotOutlined /> 爬虫分布</>} style={{ marginBottom: 16 }}>
                    {renderCrawlerDistributionChart()}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title={<><BugOutlined /> 错误分布</>} style={{ marginBottom: 16 }}>
                    {renderErrorDistributionChart()}
                  </Card>
                </Col>
              </Row>
              
              {/* 爬虫详情表 */}
              {renderCrawlerTable()}
              
              {/* 错误详情表 */}
              {renderErrorTable()}
            </>
          ) : (
            <Empty description="暂无统计数据" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default CrawlerStats;