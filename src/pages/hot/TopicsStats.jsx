import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Spin, 
  Row, 
  Col, 
  Statistic, 
  Space,
  Divider,
  Table,
  message,
  Empty,
  Button,
  Progress,
} from 'antd';
import { 
  FireOutlined, 
  SyncOutlined, 
  BarChartOutlined,
  TrophyOutlined,
  RocketOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { fetchHotTopicsStats } from '@/services/hotTopics';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

const { Title, Text, Paragraph } = Typography;

// 图表颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const HotTopicsStats = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await fetchHotTopicsStats();
      if (result.code === 200) {
        setStatsData(result.data);
      } else {
        message.error(result.message || '获取热点话题统计信息失败');
      }
    } catch (error) {
      console.error('获取热点话题统计信息时出错:', error);
      message.error('获取热点话题统计信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 准备平台统计数据
  const preparePlatformData = () => {
    if (!statsData || !statsData.platform_stats) return [];
    
    return Object.entries(statsData.platform_stats).map(([platform, data]) => ({
      name: getPlatformName(platform),
      value: data.topic_count,
      platform: platform,
      latest_update: data.latest_update
    }));
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

  // 渲染平台分布饼图
  const renderPlatformDistribution = () => {
    const data = preparePlatformData();
    
    if (data.length === 0) {
      return <Empty description="暂无平台分布数据" />;
    }
    
    return (
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value, name) => [
                `${value} 个话题 (${((value / statsData.total_topics) * 100).toFixed(1)}%)`, 
                name
              ]} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染平台统计表格
  const renderPlatformStatsTable = () => {
    const data = preparePlatformData();
    
    if (data.length === 0) {
      return <Empty description="暂无平台统计数据" />;
    }
    
    const columns = [
      {
        title: '平台',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '话题数量',
        dataIndex: 'value',
        key: 'value',
        sorter: (a, b) => a.value - b.value,
      },
      {
        title: '占比',
        key: 'percentage',
        render: (_, record) => `${((record.value / statsData.total_topics) * 100).toFixed(1)}%`,
        sorter: (a, b) => a.value - b.value,
      },
      {
        title: '最后更新时间',
        dataIndex: 'latest_update',
        key: 'latest_update',
        sorter: (a, b) => new Date(a.latest_update) - new Date(b.latest_update),
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Link to={`/hot-topics/list?platform=${record.platform}`}>
            <Button size="small" type="primary">查看话题</Button>
          </Link>
        ),
      },
    ];
    
    return (
      <Table
        columns={columns}
        dataSource={data}
        rowKey="platform"
        pagination={false}
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>热点话题统计分析</Title>
            <Button 
              icon={<SyncOutlined />} 
              onClick={() => fetchStats()}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        }
        bordered={false}
        style={{ borderRadius: '8px', marginBottom: '16px' }}
      >
        <Spin spinning={loading}>
          {statsData ? (
            <>
              {/* 统计数据卡片 */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="总任务数"
                      value={statsData.total_tasks || 0}
                      prefix={<BarChartOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="总话题数"
                      value={statsData.total_topics || 0}
                      prefix={<FireOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="平台数量"
                      value={Object.keys(statsData.platform_stats || {}).length}
                      prefix={<RocketOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
              
              {/* 平台分布图表 */}
              <Card 
                title={
                  <Space>
                    <TrophyOutlined />
                    <span>平台话题分布</span>
                  </Space>
                } 
                style={{ marginBottom: 16 }}
              >
                {renderPlatformDistribution()}
              </Card>
              
              {/* 平台统计表格 */}
              <Card 
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>平台统计详情</span>
                  </Space>
                }
              >
                {renderPlatformStatsTable()}
              </Card>
            </>
          ) : (
            !loading && <Empty description="暂无统计数据" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default HotTopicsStats;