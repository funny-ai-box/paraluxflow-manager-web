// src/pages/tasks/MonitoringDashboard.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Table,
  Button,
  Progress,
  Badge,
  Space,
  Select,
  DatePicker,
  Tabs,
  Tag,
  List,
  Timeline,
  Tooltip,
  Empty,
  Spin,
  Alert,
  message
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  fetchTasksStats, 
  fetchActiveRuns, 
  fetchRecentTasks, 
  fetchTasksPerformance,
  exportTasksReport
} from '@/services/tasks';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Helper function to generate colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MonitoringDashboard = () => {
  const [stats, setStats] = useState({
    total_tasks: 0,
    active_tasks: 0,
    successful_tasks: 0,
    failed_tasks: 0,
    success_rate: 0,
    avg_duration: 0,
    items_processed_today: 0,
    tasks_by_type: [],
    daily_executions: []
  });
  
  const [activeRuns, setActiveRuns] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [performance, setPerformance] = useState({
    task_durations: [],
    hourly_distribution: [],
    items_processed: []
  });
  
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [taskType, setTaskType] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, dateRange, taskType]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Prepare params
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        task_type: taskType !== 'all' ? taskType : undefined,
      };
      
      // Fetch all data in parallel
      const [statsResponse, activeRunsResponse, recentTasksResponse, performanceResponse] = await Promise.all([
        fetchTasksStats(params),
        fetchActiveRuns(),
        fetchRecentTasks(params),
        fetchTasksPerformance(params)
      ]);
      
      if (statsResponse.code === 200) {
        setStats(statsResponse.data);
      }
      
      if (activeRunsResponse.code === 200) {
        setActiveRuns(activeRunsResponse.data);
      }
      
      if (recentTasksResponse.code === 200) {
        setRecentTasks(recentTasksResponse.data);
      }
      
      if (performanceResponse.code === 200) {
        setPerformance(performanceResponse.data);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        task_type: taskType !== 'all' ? taskType : undefined,
      };
      
      const response = await exportTasksReport(params);
      if (response.code === 200) {
        // In a real app, this would trigger a file download
        message.success('Report exported successfully');
      } else {
        message.error('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('An error occurred while exporting the report');
    } finally {
      setExportLoading(false);
    }
  };
  
  const renderFilters = () => (
    <Space style={{ marginBottom: 16 }}>
      <RangePicker 
        value={dateRange} 
        onChange={setDateRange} 
        allowClear 
      />
      <Select 
        style={{ width: 180 }} 
        value={taskType} 
        onChange={setTaskType}
      >
        <Option value="all">All Task Types</Option>
        <Option value="source_crawl">Source Crawling</Option>
        <Option value="content_process">Content Processing</Option>
        <Option value="summary_generation">Summary Generation</Option>
        <Option value="data_cleanup">Data Cleanup</Option>
        <Option value="report_generation">Report Generation</Option>
      </Select>
      <Select 
        style={{ width: 180 }} 
        value={refreshInterval} 
        onChange={setRefreshInterval}
      >
        <Option value={30}>Refresh every 30s</Option>
        <Option value={60}>Refresh every 1m</Option>
        <Option value={300}>Refresh every 5m</Option>
        <Option value={0}>Manual refresh</Option>
      </Select>
      <Button 
        icon={<SyncOutlined />} 
        onClick={fetchDashboardData}
        loading={loading}
      >
        Refresh
      </Button>
      <Button 
        icon={<FileExcelOutlined />} 
        onClick={handleExportReport}
        loading={exportLoading}
      >
        Export Report
      </Button>
    </Space>
  );
  
  const renderStats = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="Total Tasks"
            value={stats.total_tasks}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Active Tasks"
            value={stats.active_tasks}
            valueStyle={{ color: '#52c41a' }}
            prefix={<SyncOutlined spin={stats.active_tasks > 0} />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Success Rate"
            value={stats.success_rate}
            precision={2}
            valueStyle={{ color: '#52c41a' }}
            suffix="%"
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Avg. Duration"
            value={stats.avg_duration}
            suffix="s"
            precision={1}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Successful Tasks"
            value={stats.successful_tasks}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="Failed Tasks"
            value={stats.failed_tasks}
            valueStyle={{ color: '#f5222d' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderCharts = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={12}>
        <Card title={<span><LineChartOutlined /> Task Executions Over Time</span>}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={stats.daily_executions}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="success_count" name="Successful" stroke="#52c41a" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="failed_count" name="Failed" stroke="#f5222d" />
              <Line type="monotone" dataKey="total_count" name="Total" stroke="#1890ff" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Col>
      <Col span={6}>
        <Card title={<span><PieChartOutlined /> Tasks by Type</span>}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.tasks_by_type}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {stats.tasks_by_type.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
      <Col span={6}>
        <Card title={<span><BarChartOutlined /> Hourly Distribution</span>}>
          <ResponsiveContainer width="100%" height={300}>
          // src/pages/tasks/MonitoringDashboard.jsx (Continued)

<BarChart
  data={performance.hourly_distribution}
  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="hour" />
  <YAxis />
  <RechartsTooltip />
  <Bar dataKey="count" name="Task Count" fill="#8884d8" />
</BarChart>
</ResponsiveContainer>
</Card>
</Col>
</Row>
);

const activeRunsColumns = [
{
title: 'Task',
dataIndex: 'task_name',
key: 'task_name',
},
{
title: 'Type',
dataIndex: 'task_type',
key: 'task_type',
width: 150,
render: (type) => {
const typeMap = {
'source_crawl': { color: 'blue', text: 'Source Crawling' },
'content_process': { color: 'green', text: 'Content Processing' },
'summary_generation': { color: 'purple', text: 'Summary Generation' },
'data_cleanup': { color: 'orange', text: 'Data Cleanup' },
'report_generation': { color: 'cyan', text: 'Report Generation' },
};

const { color, text } = typeMap[type] || { color: 'default', text: type };
return <Tag color={color}>{text}</Tag>;
},
},
{
title: 'Started',
dataIndex: 'start_time',
key: 'start_time',
width: 180,
},
{
title: 'Duration',
key: 'duration',
width: 120,
render: (_, record) => {
const start = new Date(record.start_time);
const now = new Date();
const durationMs = now - start;

// Format as mm:ss or hh:mm:ss
const seconds = Math.floor(durationMs / 1000) % 60;
const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
const hours = Math.floor(durationMs / (1000 * 60 * 60));

return hours > 0
? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
},
},
{
title: 'Progress',
dataIndex: 'progress',
key: 'progress',
width: 180,
render: (progress) => (
<Progress percent={progress} status="active" size="small" />
),
},
{
title: 'Items Processed',
key: 'items',
width: 150,
render: (_, record) => `${record.items_processed} / ${record.total_items || '?'}`,
},
];

const recentTasksColumns = [
{
title: 'Task',
dataIndex: 'task_name',
key: 'task_name',
},
{
title: 'Type',
dataIndex: 'task_type',
key: 'task_type',
width: 150,
render: (type) => {
const typeMap = {
'source_crawl': { color: 'blue', text: 'Source Crawling' },
'content_process': { color: 'green', text: 'Content Processing' },
'summary_generation': { color: 'purple', text: 'Summary Generation' },
'data_cleanup': { color: 'orange', text: 'Data Cleanup' },
'report_generation': { color: 'cyan', text: 'Report Generation' },
};

const { color, text } = typeMap[type] || { color: 'default', text: type };
return <Tag color={color}>{text}</Tag>;
},
},
{
title: 'Status',
dataIndex: 'status',
key: 'status',
width: 120,
render: (status) => {
switch (status) {
case 'success':
return <Badge status="success" text="Success" />;
case 'failed':
return <Badge status="error" text="Failed" />;
case 'running':
return <Badge status="processing" text="Running" />;
default:
return <Badge status="default" text={status} />;
}
},
},
{
title: 'Start Time',
dataIndex: 'start_time',
key: 'start_time',
width: 180,
},
{
title: 'Duration',
dataIndex: 'duration',
key: 'duration',
width: 120,
render: (duration) => `${duration} s`,
},
{
title: 'Items Processed',
dataIndex: 'items_processed',
key: 'items_processed',
width: 150,
},
{
title: 'Error',
dataIndex: 'error',
key: 'error',
ellipsis: true,
render: (text) => text || '-',
},
];

const renderTabsContent = () => (
<Tabs defaultActiveKey="1">
<TabPane 
tab={
<span>
<SyncOutlined spin={activeRuns.length > 0} />
Active Runs ({activeRuns.length})
</span>
} 
key="1"
>
{activeRuns.length > 0 ? (
<Table
columns={activeRunsColumns}
dataSource={activeRuns}
rowKey="id"
pagination={false}
/>
) : (
<Empty description="No active task runs" />
)}
</TabPane>

<TabPane 
tab={
<span>
<ClockCircleOutlined />
Recent Tasks
</span>
} 
key="2"
>
<Table
columns={recentTasksColumns}
dataSource={recentTasks}
rowKey="id"
pagination={{ pageSize: 10 }}
/>
</TabPane>

<TabPane 
tab={
<span>
<BarChartOutlined />
Performance Metrics
</span>
} 
key="3"
>
<Row gutter={16}>
<Col span={12}>
<Card title="Task Durations by Type">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={performance.task_durations}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="task_type" />
      <YAxis />
      <RechartsTooltip />
      <Legend />
      <Bar dataKey="avg_duration" name="Avg. Duration (s)" fill="#8884d8" />
      <Bar dataKey="max_duration" name="Max Duration (s)" fill="#82ca9d" />
    </BarChart>
  </ResponsiveContainer>
</Card>
</Col>
<Col span={12}>
<Card title="Items Processed by Task Type">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={performance.items_processed}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="task_type" />
      <YAxis />
      <RechartsTooltip />
      <Bar dataKey="count" name="Items Processed" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
</Card>
</Col>
</Row>
<Row style={{ marginTop: 16 }}>
<Col span={24}>
<Card title="Performance Summary">
  <Table
    dataSource={performance.task_durations}
    rowKey="task_type"
    pagination={false}
    columns={[
      {
        title: 'Task Type',
        dataIndex: 'task_type',
        key: 'task_type',
        render: (type) => {
          const typeMap = {
            'source_crawl': { color: 'blue', text: 'Source Crawling' },
            'content_process': { color: 'green', text: 'Content Processing' },
            'summary_generation': { color: 'purple', text: 'Summary Generation' },
            'data_cleanup': { color: 'orange', text: 'Data Cleanup' },
            'report_generation': { color: 'cyan', text: 'Report Generation' },
          };
          
          const { color, text } = typeMap[type] || { color: 'default', text: type };
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: 'Total Executions',
        dataIndex: 'executions',
        key: 'executions',
      },
      {
        title: 'Success Rate',
        dataIndex: 'success_rate',
        key: 'success_rate',
        render: (rate) => `${rate.toFixed(2)}%`,
      },
      {
        title: 'Avg. Duration',
        dataIndex: 'avg_duration',
        key: 'avg_duration',
        render: (duration) => `${duration.toFixed(2)}s`,
      },
      {
        title: 'Max Duration',
        dataIndex: 'max_duration',
        key: 'max_duration',
        render: (duration) => `${duration.toFixed(2)}s`,
      },
      {
        title: 'Items Processed',
        dataIndex: 'items_processed',
        key: 'items_processed',
      },
    ]}
  />
</Card>
</Col>
</Row>
</TabPane>
</Tabs>
);

return (
<Card title="Task Monitoring Dashboard" bordered={false}>
{renderFilters()}

<div style={{ marginBottom: 8, textAlign: 'right' }}>
<Text type="secondary">
Last updated: {lastUpdated.toLocaleTimeString()}
</Text>
</div>

{renderStats()}

{renderCharts()}

{renderTabsContent()}
</Card>
);
};

export default MonitoringDashboard;