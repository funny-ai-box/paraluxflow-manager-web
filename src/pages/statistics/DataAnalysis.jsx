// src/pages/statistics/DataAnalysis.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Select,
  DatePicker,
  Tabs,
  Tag,
  Radio,
  Statistic,
  List,
  Tooltip,
  Input,
  Divider,
  Spin,
  Badge
} from 'antd';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  DownloadOutlined,
  SyncOutlined,
  RiseOutlined,
  FallOutlined,
  FilterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  FileExcelOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  fetchCrawlStats, 
  fetchSubscriptionStats, 
  fetchSourceStats,
  exportStatisticsData
} from '@/services/statistics';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

// Helper function to generate colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DataAnalysis = () => {
  const [crawlStats, setCrawlStats] = useState({
    overall: {
      total_crawls: 0,
      success_rate: 0,
      articles_crawled: 0,
      avg_crawl_time: 0
    },
    by_date: [],
    by_source: [],
    by_content_type: []
  });
  
  const [subscriptionStats, setSubscriptionStats] = useState({
    overall: {
      total_subscriptions: 0,
      active_subscriptions: 0,
      new_subscriptions: 0,
      churn_rate: 0
    },
    by_date: [],
    by_source: [],
    by_category: []
  });
  
  const [sourceStats, setSourceStats] = useState({
    overall: {
      total_sources: 0,
      active_sources: 0,
      avg_articles_per_day: 0,
      avg_quality_score: 0
    },
    by_date: [],
    by_category: [],
    source_rankings: []
  });
  
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState('1');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [dateRange, filterCategory]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Prepare params
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        category_id: filterCategory !== 'all' ? filterCategory : undefined,
        keyword: searchText || undefined
      };
      
      // Fetch all data in parallel
      const [crawlResponse, subscriptionResponse, sourceResponse] = await Promise.all([
        fetchCrawlStats(params),
        fetchSubscriptionStats(params),
        fetchSourceStats(params)
      ]);
      
      if (crawlResponse.code === 200) {
        setCrawlStats(crawlResponse.data);
      }
      
      if (subscriptionResponse.code === 200) {
        setSubscriptionStats(subscriptionResponse.data);
      }
      
      if (sourceResponse.code === 200) {
        setSourceStats(sourceResponse.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to load statistics data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        category_id: filterCategory !== 'all' ? filterCategory : undefined,
        tab: activeTab,
      };
      
      const response = await exportStatisticsData(params);
      if (response.code === 200) {
        // In a real app, this would trigger a file download
        message.success('Data exported successfully');
      } else {
        message.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('An error occurred while exporting data');
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
        value={filterCategory} 
        onChange={setFilterCategory}
        placeholder="Filter by Category"
      >
        <Option value="all">All Categories</Option>
        <Option value="1">Technology</Option>
        <Option value="2">Business</Option>
        <Option value="3">Science</Option>
        <Option value="4">Health</Option>
        <Option value="5">Entertainment</Option>
      </Select>
      <Search
        placeholder="Search sources"
        onSearch={value => {
          setSearchText(value);
          fetchData();
        }}
        style={{ width: 200 }}
        allowClear
      />
      <Button 
        icon={<SyncOutlined />} 
        onClick={fetchData}
        loading={loading}
      >
        Refresh
      </Button>
      <Button 
        icon={<FileExcelOutlined />} 
        onClick={handleExport}
        loading={exportLoading}
      >
        Export Data
      </Button>
    </Space>
  );
  
  const renderChartControls = () => (
    <Radio.Group 
      value={chartType} 
      onChange={e => setChartType(e.target.value)}
      style={{ marginBottom: 16 }}
      buttonStyle="solid"
    >
      <Radio.Button value="bar"><BarChartOutlined /> Bar</Radio.Button>
      <Radio.Button value="line"><AreaChartOutlined /> Line</Radio.Button>
      <Radio.Button value="pie"><PieChartOutlined /> Pie</Radio.Button>
    </Radio.Group>
  );
  
  const renderCrawlStatsTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Crawls"
              value={crawlStats.overall.total_crawls}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={crawlStats.overall.success_rate}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Articles Crawled"
              value={crawlStats.overall.articles_crawled}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Crawl Time"
              value={crawlStats.overall.avg_crawl_time}
              precision={2}
              suffix="s"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Crawl Statistics Over Time" style={{ marginBottom: 16 }}>
        {renderChartControls()}
        
        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={crawlStats.by_date}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="success_count" name="Successful Crawls" fill="#52c41a" />
              <Bar dataKey="failed_count" name="Failed Crawls" fill="#f5222d" />
              <Bar dataKey="articles_count" name="Articles Crawled" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={crawlStats.by_date}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="success_count" name="Successful Crawls" stroke="#52c41a" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="failed_count" name="Failed Crawls" stroke="#f5222d" />
              <Line type="monotone" dataKey="articles_count" name="Articles Crawled" stroke="#1890ff" />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'pie' && (
          <Row gutter={16}>
            <Col span={8}>
              <Title level={5} style={{ textAlign: 'center' }}>Crawls by Status</Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Successful', value: crawlStats.overall.success_count },
                      { name: 'Failed', value: crawlStats.overall.failed_count },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    <Cell fill="#52c41a" />
                    <Cell fill="#f5222d" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col span={16}>
              <Title level={5} style={{ textAlign: 'center' }}>Crawls by Source</Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={crawlStats.by_source}
                    dataKey="count"
                    nameKey="source_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {crawlStats.by_source.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        )}
      </Card>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Crawl Performance by Source">
            <Table
              dataSource={crawlStats.by_source}
              rowKey="source_id"
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: 'Source',
                  dataIndex: 'source_name',
                  key: 'source_name',
                },
                {
                  title: 'Crawls',
                  dataIndex: 'count',
                  key: 'count',
                  sorter: (a, b) => a.count - b.count,
                },
                {
                  title: 'Success Rate',
                  dataIndex: 'success_rate',
                  key: 'success_rate',
                  render: (rate) => `${rate.toFixed(2)}%`,
                  sorter: (a, b) => a.success_rate - b.success_rate,
                },
                {
                  title: 'Avg. Time',
                  dataIndex: 'avg_time',
                  key: 'avg_time',
                  render: (time) => `${time.toFixed(2)}s`,
                  sorter: (a, b) => a.avg_time - b.avg_time,
                },
                {
                  title: 'Articles',
                  dataIndex: 'articles_count',
                  key: 'articles_count',
                  sorter: (a, b) => a.articles_count - b.articles_count,
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Crawl Performance by Content Type">
            <Table
              dataSource={crawlStats.by_content_type}
              rowKey="content_type_id"
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: 'Content Type',
                  dataIndex: 'content_type_name',
                  key: 'content_type_name',
                },
                {
                  title: 'Crawls',
                  dataIndex: 'count',
                  key: 'count',
                  sorter: (a, b) => a.count - b.count,
                },
                {
                  title: 'Success Rate',
                  dataIndex: 'success_rate',
                  key: 'success_rate',
                  render: (rate) => `${rate.toFixed(2)}%`,
                  sorter: (a, b) => a.success_rate - b.success_rate,
                },
                {
                  title: 'Avg. Time',
                  dataIndex: 'avg_time',
                  key: 'avg_time',
                  render: (time) => `${time.toFixed(2)}s`,
                  sorter: (a, b) => a.avg_time - b.avg_time,
                },
                {
                  title: 'Articles',
                  dataIndex: 'articles_count',
                  key: 'articles_count',
                  sorter: (a, b) => a.articles_count - b.articles_count,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderSubscriptionStatsTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Subscriptions"
              value={subscriptionStats.overall.total_subscriptions}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={subscriptionStats.overall.active_subscriptions}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="New Subscriptions"
              value={subscriptionStats.overall.new_subscriptions}
              valueStyle={{ color: '#722ed1' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Churn Rate"
              value={subscriptionStats.overall.churn_rate}
              precision={2}
              valueStyle={{ color: subscriptionStats.overall.churn_rate > 5 ? '#f5222d' : '#52c41a' }}
              suffix="%"
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Subscription Trends" style={{ marginBottom: 16 }}>
        {renderChartControls()}
        
        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={subscriptionStats.by_date}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="new_count" name="New Subscriptions" fill="#722ed1" />
              <Bar dataKey="canceled_count" name="Canceled Subscriptions" fill="#f5222d" />
              <Bar dataKey="total_count" name="Total Subscriptions" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={subscriptionStats.by_date}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="total_count" name="Total Subscriptions" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
              <Area type="monotone" dataKey="new_count" name="New Subscriptions" stroke="#722ed1" fill="#722ed1" fillOpacity={0.3} />
              // src/pages/statistics/DataAnalysis.jsx (Continued)

<Area type="monotone" dataKey="canceled_count" name="Canceled Subscriptions" stroke="#f5222d" fill="#f5222d" fillOpacity={0.3} />
</AreaChart>
</ResponsiveContainer>
)}

{chartType === 'pie' && (
<Row gutter={16}>
<Col span={12}>
<Title level={5} style={{ textAlign: 'center' }}>Subscriptions by Category</Title>
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={subscriptionStats.by_category}
      dataKey="count"
      nameKey="category_name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#8884d8"
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {subscriptionStats.by_category.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <RechartsTooltip />
  </PieChart>
</ResponsiveContainer>
</Col>
<Col span={12}>
<Title level={5} style={{ textAlign: 'center' }}>Subscriptions by Source</Title>
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={subscriptionStats.by_source.slice(0, 5)} // Top 5 sources
      dataKey="count"
      nameKey="source_name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#8884d8"
      label
    >
      {subscriptionStats.by_source.slice(0, 5).map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <RechartsTooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
</Col>
</Row>
)}
</Card>

<Row gutter={16}>
<Col span={12}>
<Card title="Top Sources by Subscriptions">
<Table
dataSource={subscriptionStats.by_source}
rowKey="source_id"
size="small"
pagination={{ pageSize: 5 }}
columns={[
  {
    title: 'Source',
    dataIndex: 'source_name',
    key: 'source_name',
  },
  {
    title: 'Subscriptions',
    dataIndex: 'count',
    key: 'count',
    sorter: (a, b) => a.count - b.count,
    defaultSortOrder: 'descend',
  },
  {
    title: 'Active %',
    dataIndex: 'active_percentage',
    key: 'active_percentage',
    render: (value) => `${value.toFixed(1)}%`,
    sorter: (a, b) => a.active_percentage - b.active_percentage,
  },
  {
    title: 'New (Last 30d)',
    dataIndex: 'new_count',
    key: 'new_count',
    sorter: (a, b) => a.new_count - b.new_count,
  },
  {
    title: 'Trend',
    dataIndex: 'trend',
    key: 'trend',
    render: (trend) => {
      if (trend > 0) {
        return <Badge status="success" text={`+${trend.toFixed(1)}%`} />;
      } else if (trend < 0) {
        return <Badge status="error" text={`${trend.toFixed(1)}%`} />;
      } else {
        return <Badge status="default" text="0%" />;
      }
    },
    sorter: (a, b) => a.trend - b.trend,
  },
]}
/>
</Card>
</Col>
<Col span={12}>
<Card title="Subscription Growth by Category">
<Table
dataSource={subscriptionStats.by_category}
rowKey="category_id"
size="small"
pagination={{ pageSize: 5 }}
columns={[
  {
    title: 'Category',
    dataIndex: 'category_name',
    key: 'category_name',
  },
  {
    title: 'Subscriptions',
    dataIndex: 'count',
    key: 'count',
    sorter: (a, b) => a.count - b.count,
    defaultSortOrder: 'descend',
  },
  {
    title: 'Growth (Last 30d)',
    dataIndex: 'growth_rate',
    key: 'growth_rate',
    render: (value) => {
      if (value > 0) {
        return <Badge status="success" text={`+${value.toFixed(1)}%`} />;
      } else if (value < 0) {
        return <Badge status="error" text={`${value.toFixed(1)}%`} />;
      } else {
        return <Badge status="default" text="0%" />;
      }
    },
    sorter: (a, b) => a.growth_rate - b.growth_rate,
  },
  {
    title: 'Active %',
    dataIndex: 'active_percentage',
    key: 'active_percentage',
    render: (value) => `${value.toFixed(1)}%`,
    sorter: (a, b) => a.active_percentage - b.active_percentage,
  },
  {
    title: 'Churn Rate',
    dataIndex: 'churn_rate',
    key: 'churn_rate',
    render: (value) => `${value.toFixed(1)}%`,
    sorter: (a, b) => a.churn_rate - b.churn_rate,
  },
]}
/>
</Card>
</Col>
</Row>
</div>
);

const renderSourceStatsTab = () => (
<div>
<Row gutter={16} style={{ marginBottom: 16 }}>
<Col span={6}>
<Card>
<Statistic
title="Total Sources"
value={sourceStats.overall.total_sources}
valueStyle={{ color: '#1890ff' }}
/>
</Card>
</Col>
<Col span={6}>
<Card>
<Statistic
title="Active Sources"
value={sourceStats.overall.active_sources}
valueStyle={{ color: '#52c41a' }}
/>
</Card>
</Col>
<Col span={6}>
<Card>
<Statistic
title="Avg. Articles/Day"
value={sourceStats.overall.avg_articles_per_day}
precision={1}
valueStyle={{ color: '#722ed1' }}
/>
</Card>
</Col>
<Col span={6}>
<Card>
<Statistic
title="Avg. Quality Score"
value={sourceStats.overall.avg_quality_score}
precision={1}
valueStyle={{ color: '#faad14' }}
suffix="/10"
/>
</Card>
</Col>
</Row>

<Card title="Source Activity" style={{ marginBottom: 16 }}>
{renderChartControls()}

{chartType === 'bar' && (
<ResponsiveContainer width="100%" height={400}>
<BarChart
data={sourceStats.by_date}
margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="date" />
<YAxis />
<RechartsTooltip />
<Legend />
<Bar dataKey="active_sources" name="Active Sources" fill="#52c41a" />
<Bar dataKey="articles_count" name="Articles Published" fill="#1890ff" />
<Bar dataKey="avg_quality_score" name="Avg. Quality Score" fill="#faad14" />
</BarChart>
</ResponsiveContainer>
)}

{chartType === 'line' && (
<ResponsiveContainer width="100%" height={400}>
<LineChart
data={sourceStats.by_date}
margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="date" />
<YAxis yAxisId="left" />
<YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
<RechartsTooltip />
<Legend />
<Line yAxisId="left" type="monotone" dataKey="active_sources" name="Active Sources" stroke="#52c41a" activeDot={{ r: 8 }} />
<Line yAxisId="left" type="monotone" dataKey="articles_count" name="Articles Published" stroke="#1890ff" />
<Line yAxisId="right" type="monotone" dataKey="avg_quality_score" name="Avg. Quality Score" stroke="#faad14" />
</LineChart>
</ResponsiveContainer>
)}

{chartType === 'pie' && (
<Row gutter={16}>
<Col span={12}>
<Title level={5} style={{ textAlign: 'center' }}>Sources by Category</Title>
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={sourceStats.by_category}
      dataKey="count"
      nameKey="category_name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#8884d8"
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {sourceStats.by_category.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <RechartsTooltip />
  </PieChart>
</ResponsiveContainer>
</Col>
<Col span={12}>
<Title level={5} style={{ textAlign: 'center' }}>Articles by Category</Title>
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={sourceStats.by_category}
      dataKey="articles_count"
      nameKey="category_name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#8884d8"
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {sourceStats.by_category.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <RechartsTooltip />
  </PieChart>
</ResponsiveContainer>
</Col>
</Row>
)}
</Card>

<Card title="Source Rankings" style={{ marginBottom: 16 }}>
<Table
dataSource={sourceStats.source_rankings}
rowKey="source_id"
pagination={{ pageSize: 10 }}
columns={[
{
title: 'Source',
dataIndex: 'source_name',
key: 'source_name',
fixed: 'left',
width: 200,
},
{
title: 'Category',
dataIndex: 'category_name',
key: 'category_name',
width: 150,
filters: sourceStats.by_category.map(cat => ({
  text: cat.category_name,
  value: cat.category_name,
})),
onFilter: (value, record) => record.category_name === value,
},
{
title: 'Activity Score',
dataIndex: 'activity_score',
key: 'activity_score',
width: 150,
render: (score) => (
  <Progress 
    percent={score * 10} 
    size="small" 
    format={() => score.toFixed(1)}
  />
),
sorter: (a, b) => a.activity_score - b.activity_score,
defaultSortOrder: 'descend',
},
{
title: 'Articles/Day',
dataIndex: 'articles_per_day',
key: 'articles_per_day',
width: 150,
render: (value) => value.toFixed(1),
sorter: (a, b) => a.articles_per_day - b.articles_per_day,
},
{
title: 'Quality Score',
dataIndex: 'quality_score',
key: 'quality_score',
width: 150,
render: (score) => (
  <Progress 
    percent={score * 10} 
    size="small" 
    format={() => score.toFixed(1)}
    strokeColor={score >= 8 ? '#52c41a' : (score >= 6 ? '#faad14' : '#f5222d')}
  />
),
sorter: (a, b) => a.quality_score - b.quality_score,
},
{
title: 'Subscriber Count',
dataIndex: 'subscriber_count',
key: 'subscriber_count',
width: 150,
sorter: (a, b) => a.subscriber_count - b.subscriber_count,
},
{
title: 'Status',
dataIndex: 'status',
key: 'status',
width: 120,
render: (status) => {
  switch (status) {
    case 'active':
      return <Badge status="success" text="Active" />;
    case 'inactive':
      return <Badge status="default" text="Inactive" />;
    case 'error':
      return <Badge status="error" text="Error" />;
    default:
      return <Badge status="default" text={status} />;
  }
},
filters: [
  { text: 'Active', value: 'active' },
  { text: 'Inactive', value: 'inactive' },
  { text: 'Error', value: 'error' },
],
onFilter: (value, record) => record.status === value,
},
{
title: 'Last Update',
dataIndex: 'last_update',
key: 'last_update',
width: 180,
sorter: (a, b) => new Date(a.last_update) - new Date(b.last_update),
},
]}
scroll={{ x: 1200 }}
/>
</Card>
</div>
);

return (
<Card title="Data Statistics & Analysis" bordered={false}>
{renderFilters()}

<Tabs activeKey={activeTab} onChange={setActiveTab}>
<TabPane 
tab={
<span>
<BarChartOutlined />
Article Crawling Stats
</span>
} 
key="1"
>
{renderCrawlStatsTab()}
</TabPane>

<TabPane 
tab={
<span>
<RiseOutlined />
User Subscription Analysis
</span>
} 
key="2"
>
{renderSubscriptionStatsTab()}
</TabPane>

<TabPane 
tab={
<span>
<PieChartOutlined />
Source Activity Evaluation
</span>
} 
key="3"
>
{renderSourceStatsTab()}
</TabPane>
</Tabs>
</Card>
);
};

// Missing imports
import { Progress, message } from 'antd';

export default DataAnalysis;