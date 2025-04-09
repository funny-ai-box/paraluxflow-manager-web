import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  message, 
  Statistic, 
  Row, 
  Col,
  DatePicker,
  Select,
  Spin,
  Empty,
  Divider,
  Tabs,
  Alert,
  Table
} from 'antd';
import { 
  LineChartOutlined, 
  ArrowLeftOutlined,
  PieChartOutlined,
  SyncOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchSyncLogs, fetchSyncStats } from '@/services/sync';
import dayjs from 'dayjs';

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
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
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SyncAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'), 
    dayjs()
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    setStatsLoading(true);
    
    try {
      // 获取统计数据
      const statsResult = await fetchSyncStats();
      if (statsResult.code === 200) {
        setStats(statsResult.data || {});
      } else {
        message.error(statsResult.message || '获取同步统计数据失败');
      }
      
      // 获取日志列表数据（最近100条）
      const logsResult = await fetchSyncLogs({
        page: 1,
        per_page: 100,
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD')
      });
      
      if (logsResult.code === 200) {
        setLogs(logsResult.data?.list || []);
      } else {
        message.error(logsResult.message || '获取同步日志列表失败');
      }
    } catch (error) {
      console.error('获取同步分析数据出错:', error);
      message.error('获取同步分析数据时发生错误');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };
  
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // 重新获取数据
      fetchFilteredData(dates);
    }
  };
  
  const fetchFilteredData = async (dates) => {
    setLoading(true);
    
    try {
      const result = await fetchSyncLogs({
        page: 1,
        per_page: 100,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD')
      });
      
      if (result.code === 200) {
        setLogs(result.data?.list || []);
      } else {
        message.error(result.message || '获取同步日志列表失败');
      }
    } catch (error) {
      console.error('获取同步日志数据出错:', error);
      message.error('获取同步日志数据时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  // 准备图表数据
  const prepareChartData = () => {
    if (!logs.length) return [];
    
    // 按日期分组
    const dailyData = {};
    logs.forEach(log => {
      const date = dayjs(log.start_time).format('YYYY-MM-DD');
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          total: 0,
          successful: 0,
          failed: 0,
          articles: 0,
          avgTime: 0,
          totalTime: 0
        };
      }
      
      dailyData[date].total += 1;
      if (log.status === 1) {
        dailyData[date].successful += 1;
        dailyData[date].articles += (log.total_articles || 0);
      } else if (log.status === 2) {
        dailyData[date].failed += 1;
      }
      
      dailyData[date].totalTime += (log.total_time || 0);
    });
    
    // 计算平均时间
    Object.keys(dailyData).forEach(date => {
      const data = dailyData[date];
      data.avgTime = data.total > 0 ? data.totalTime / data.total : 0;
    });
    
    // 转换为数组并排序
    return Object.values(dailyData).sort((a, b) => {
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    });
  };
  
  // 计算成功率
  const calculateSuccessRate = () => {
    if (!logs.length) return 0;
    
    const successfulSyncs = logs.filter(log => log.status === 1).length;
    return Math.round((successfulSyncs / logs.length) * 100);
  };
  
  // 准备状态分布数据
  const prepareStatusData = () => {
    if (!logs.length) return [];
    
    const statusCounts = {
      success: 0,
      failed: 0,
      ongoing: 0
    };
    
    logs.forEach(log => {
      if (log.status === 0) statusCounts.ongoing += 1;
      else if (log.status === 1) statusCounts.success += 1;
      else if (log.status === 2) statusCounts.failed += 1;
    });
    
    return [
      { name: '成功', value: statusCounts.success },
      { name: '失败', value: statusCounts.failed },
      { name: '进行中', value: statusCounts.ongoing }
    ].filter(item => item.value > 0);
  };
  
  // 准备触发方式分布数据
  const prepareTriggerData = () => {
    if (!logs.length) return [];
    
    const triggerCounts = {
      manual: 0,
      schedule: 0,
      other: 0
    };
    
    logs.forEach(log => {
      if (log.triggered_by === 'manual') triggerCounts.manual += 1;
      else if (log.triggered_by === 'schedule') triggerCounts.schedule += 1;
      else triggerCounts.other += 1;
    });
    
    return [
      { name: '手动触发', value: triggerCounts.manual },
      { name: '定时触发', value: triggerCounts.schedule },
      { name: '其他方式', value: triggerCounts.other }
    ].filter(item => item.value > 0);
  };
  
  // 渲染统计卡片
  const renderStatsCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
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
            title="成功率"
            value={calculateSuccessRate()}
            suffix="%"
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={statsLoading}>
          <Statistic
            title="平均文章数/次"
            value={stats.avg_articles_per_sync || 0}
            precision={1}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={statsLoading}>
          <Statistic
            title="平均耗时/次"
            value={stats.avg_time_per_sync || 0}
            precision={1}
            suffix="秒"
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
  
  // 渲染同步频率图表
  const renderSyncFrequencyChart = () => {
    const chartData = prepareChartData();
    
    if (chartData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    return (
      <div style={{ height: 300, marginTop: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === '成功') return [value, '成功同步次数'];
                if (name === '失败') return [value, '失败同步次数'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar name="成功" dataKey="successful" stackId="a" fill="#52c41a" />
            <Bar name="失败" dataKey="failed" stackId="a" fill="#f5222d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // 渲染文章数量趋势图
  const renderArticlesChart = () => {
    const chartData = prepareChartData();
    
    if (chartData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    return (
      <div style={{ height: 300, marginTop: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [value, '文章数量']} />
            <Legend />
            <Line 
              name="同步文章数" 
              type="monotone" 
              dataKey="articles" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // 渲染同步时间趋势图
  const renderTimeChart = () => {
    const chartData = prepareChartData();
    
    if (chartData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    return (
      <div style={{ height: 300, marginTop: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toFixed(2), '平均耗时(秒)']} />
            <Legend />
            <Line 
              name="平均同步时间" 
              type="monotone" 
              dataKey="avgTime" 
              stroke="#f5222d" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // 渲染状态分布图
  const renderStatusDistribution = () => {
    const statusData = prepareStatusData();
    
    if (statusData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    return (
      <div style={{ height: 300, marginTop: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // 渲染触发方式分布图
  const renderTriggerDistribution = () => {
    const triggerData = prepareTriggerData();
    
    if (triggerData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    
    return (
      <div style={{ height: 300, marginTop: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={triggerData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {triggerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // 渲染失败原因分析
  const renderFailureAnalysis = () => {
    // 获取失败的同步记录
    const failedLogs = logs.filter(log => log.status === 2);
    
    if (failedLogs.length === 0) {
      return (
        <Alert
          message="无失败记录"
          description="在选定时间范围内，没有发现失败的同步任务。"
          type="success"
          showIcon
        />
      );
    }
    
    // 提取失败原因并分类
    const failureReasons = {};
    failedLogs.forEach(log => {
      const reason = log.error_message || '未知原因';
      // 简化错误信息，只取前30个字符
      const simplifiedReason = reason.substring(0, 30) + (reason.length > 30 ? '...' : '');
      
      if (!failureReasons[simplifiedReason]) {
        failureReasons[simplifiedReason] = 1;
      } else {
        failureReasons[simplifiedReason] += 1;
      }
    });
    
    // 转换为数组并排序
    const failureData = Object.entries(failureReasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 只取前5个常见原因
    
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        key: 'reason',
        ellipsis: true,
      },
      {
        title: '出现次数',
        dataIndex: 'count',
        key: 'count',
      },
      {
        title: '占比',
        key: 'percentage',
        render: (_, record) => `${((record.count / failedLogs.length) * 100).toFixed(1)}%`,
      },
    ];
    
    return (
      <>
        <Alert
          message={`共有 ${failedLogs.length} 次同步失败`}
          description="以下是最常见的失败原因分析"
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
        
        <Table
          columns={columns}
          dataSource={failureData}
          rowKey="reason"
          pagination={false}
        />
      </>
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
            <Title level={4} style={{ margin: 0 }}>同步分析</Title>
          </Space>
        }
        extra={
          <Space>
            <Text>选择时间范围:</Text>
            <RangePicker 
              value={dateRange}
              onChange={handleDateRangeChange}
              allowClear={false}
            />
            <Button 
              type="primary" 
              icon={<SyncOutlined />} 
              onClick={() => fetchData()}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        {/* 统计卡片 */}
        {renderStatsCards()}
        
        {logs.length === 0 && !loading ? (
          <Empty 
            description="选定时间范围内没有同步数据" 
            style={{ margin: '40px 0' }}
          />
        ) : (
          <Spin spinning={loading}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane 
                tab={
                  <span>
                    <LineChartOutlined />
                    总览
                  </span>
                } 
                key="overview"
              >
                <Card title="同步频率" size="small">
                  {renderSyncFrequencyChart()}
                </Card>
                
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Card title="同步状态分布" size="small">
                      {renderStatusDistribution()}
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="触发方式分布" size="small">
                      {renderTriggerDistribution()}
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <FileTextOutlined />
                    文章趋势
                  </span>
                } 
                key="articles"
              >
                <Card title="每日同步文章数量趋势" size="small">
                  {renderArticlesChart()}
                </Card>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined />
                    耗时分析
                  </span>
                } 
                key="time"
              >
                <Card title="同步平均耗时趋势" size="small">
                  {renderTimeChart()}
                </Card>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <ExclamationCircleOutlined />
                    失败分析
                  </span>
                } 
                key="failures"
              >
                <Card title="同步失败原因分析" size="small">
                  {renderFailureAnalysis()}
                </Card>
              </TabPane>
            </Tabs>
          </Spin>
        )}
      </Card>
    </div>
  );
};

export default SyncAnalysis;