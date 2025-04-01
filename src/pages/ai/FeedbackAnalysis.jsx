// src/pages/ai/FeedbackAnalysis.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Table,
  Select,
  Space,
  Tag,
  Typography,
  Input,
  Tooltip,
  List,
  Divider,
  Badge,
  Statistic,
  Tabs,
  Empty
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
  Cell
} from 'recharts';
import {
  SyncOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons';
import { fetchFeedbackAnalytics, fetchFeedbackDetails, exportFeedbackData } from '@/services/ai';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

// Helper function to generate colors
const getRandomColor = (index) => {
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
  return colors[index % colors.length];
};

const POSITIVE_COLOR = '#52c41a';
const NEGATIVE_COLOR = '#f5222d';
const NEUTRAL_COLOR = '#faad14';

const FeedbackAnalysis = () => {
  const [analytics, setAnalytics] = useState({
    summary: {
      total_feedback: 0,
      positive_count: 0,
      negative_count: 0,
      neutral_count: 0,
      average_rating: 0,
    },
    by_template: [],
    by_content_type: [],
    by_date: [],
    common_terms: {
      positive: [],
      negative: [],
    },
    improvements: []
  });
  
  const [feedbackDetails, setFeedbackDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    fetchAnalytics();
    fetchDetails();
  }, [dateRange, selectedContentType, selectedTemplate]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        content_type_id: selectedContentType !== 'all' ? selectedContentType : undefined,
        template_id: selectedTemplate !== 'all' ? selectedTemplate : undefined,
      };
      
      const response = await fetchFeedbackAnalytics(params);
      if (response.code === 200) {
        setAnalytics(response.data);
      } else {
        message.error('Failed to fetch feedback analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      message.error('An error occurred while loading analytics');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDetails = async (page = 1, pageSize = 10) => {
    try {
      const params = {
        page,
        per_page: pageSize,
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        content_type_id: selectedContentType !== 'all' ? selectedContentType : undefined,
        template_id: selectedTemplate !== 'all' ? selectedTemplate : undefined,
        keyword: searchText || undefined,
      };
      
      const response = await fetchFeedbackDetails(params);
      if (response.code === 200) {
        setFeedbackDetails(response.data.items);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: response.data.total,
        });
      } else {
        message.error('Failed to fetch feedback details');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      message.error('An error occurred while loading feedback details');
    }
  };
  
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        content_type_id: selectedContentType !== 'all' ? selectedContentType : undefined,
        template_id: selectedTemplate !== 'all' ? selectedTemplate : undefined,
      };
      
      const response = await exportFeedbackData(params);
      if (response.code === 200) {
        // In a real application, this would trigger a file download
        // Here we just simulate success
        message.success('Export successful! File downloaded.');
      } else {
        message.error('Failed to export feedback data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('An error occurred while exporting data');
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleTableChange = (pagination) => {
    fetchDetails(pagination.current, pagination.pageSize);
  };
  
  const handleSearch = (value) => {
    setSearchText(value);
    fetchDetails(1, pagination.pageSize);
  };
  
  const handleReset = () => {
    setDateRange([null, null]);
    setSelectedContentType('all');
    setSelectedTemplate('all');
    setSearchText('');
    fetchAnalytics();
    fetchDetails(1, pagination.pageSize);
  };
  
  const renderFilters = () => (
    <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
      <Space wrap>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          allowClear
        />
        <Select
          placeholder="Content Type"
          style={{ width: 180 }}
          value={selectedContentType}
          onChange={setSelectedContentType}
        >
          <Option value="all">All Content Types</Option>
          {analytics.by_content_type.map(type => (
            <Option key={type.content_type_id} value={type.content_type_id}>
              {type.content_type_name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Template"
          style={{ width: 180 }}
          value={selectedTemplate}
          onChange={setSelectedTemplate}
        >
          <Option value="all">All Templates</Option>
          {analytics.by_template.map(template => (
            <Option key={template.template_id} value={template.template_id}>
              {template.template_name}
            </Option>
          ))}
        </Select>
        <Button icon={<SyncOutlined />} onClick={fetchAnalytics}>
          Refresh
        </Button>
        <Button icon={<FileExcelOutlined />} onClick={handleExport} loading={exportLoading}>
          Export Data
        </Button>
        <Button onClick={handleReset}>
          Reset Filters
        </Button>
      </Space>
    </Space>
  );
  
  const renderSummaryCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Total Feedback"
            value={analytics.summary.total_feedback}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Average Rating"
            value={analytics.summary.average_rating.toFixed(1)}
            suffix="/ 5"
            precision={1}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Positive Feedback"
            value={analytics.summary.positive_count}
            suffix={`(${Math.round(analytics.summary.positive_count / analytics.summary.total_feedback * 100) || 0}%)`}
            valueStyle={{ color: POSITIVE_COLOR }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Negative Feedback"
            value={analytics.summary.negative_count}
            suffix={`(${Math.round(analytics.summary.negative_count / analytics.summary.total_feedback * 100) || 0}%)`}
            valueStyle={{ color: NEGATIVE_COLOR }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderTimeChart = () => (
    <Card title="Feedback Over Time" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={analytics.by_date}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="positive_count" 
            name="Positive" 
            stroke={POSITIVE_COLOR} 
            activeDot={{ r: 8 }} 
          />
          <Line 
            type="monotone" 
            dataKey="negative_count" 
            name="Negative" 
            stroke={NEGATIVE_COLOR} 
          />
          <Line 
            type="monotone" 
            dataKey="neutral_count" 
            name="Neutral" 
            stroke={NEUTRAL_COLOR} 
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
  
  const renderTemplateComparison = () => (
    <Card title="Template Performance Comparison" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={analytics.by_template}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="template_name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="average_rating" name="Avg. Rating" fill="#8884d8" />
          <Bar dataKey="feedback_count" name="Feedback Count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
  
  const renderContentTypePie = () => (
    <Card title="Feedback by Content Type" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={analytics.by_content_type}
            dataKey="feedback_count"
            nameKey="content_type_name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {analytics.by_content_type.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
  
  const renderCommonTerms = () => (
    <Card title="Common Feedback Terms" style={{ marginBottom: 24 }}>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <LikeOutlined />
              Positive Feedback
            </span>
          }
          key="1"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {analytics.common_terms.positive.map((term, index) => (
              <Tag key={index} color="green" style={{ marginBottom: 8, fontSize: 14 }}>
                {term.term} <Text type="secondary">({term.count})</Text>
              </Tag>
            ))}
            {analytics.common_terms.positive.length === 0 && (
              <Empty description="No common positive terms found" />
            )}
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <DislikeOutlined />
              Negative Feedback
            </span>
          }
          key="2"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {analytics.common_terms.negative.map((term, index) => (
              <Tag key={index} color="red" style={{ marginBottom: 8, fontSize: 14 }}>
                {term.term} <Text type="secondary">({term.count})</Text>
              </Tag>
            ))}
            {analytics.common_terms.negative.length === 0 && (
              <Empty description="No common negative terms found" />
            )}
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
  
  const renderImprovementSuggestions = () => (
    <Card 
      title={
        <Space>
          <BulbOutlined />
          <span>Improvement Suggestions</span>
        </Space>
      } 
      style={{ marginBottom: 24 }}
    >
      <List
        itemLayout="horizontal"
        dataSource={analytics.improvements}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<WarningOutlined style={{ fontSize: 24, color: '#faad14' }} />}
              title={item.title}
              description={item.description}
            />
            <div>
              <Tag color="orange">Priority: {item.priority}</Tag>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'No improvement suggestions available' }}
      />
    </Card>
  );
  
  const feedbackColumns = [
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
      render: (text) => `User ${text}`,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => {
        const color = rating >= 4 ? POSITIVE_COLOR : (rating >= 3 ? NEUTRAL_COLOR : NEGATIVE_COLOR);
        return <Tag color={color}>{rating} / 5</Tag>;
      },
    },
    {
      title: 'Content Type',
      dataIndex: 'content_type_name',
      key: 'content_type_name',
      width: 150,
    },
    {
      title: 'Template',
      dataIndex: 'template_name',
      key: 'template_name',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Feedback',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (text) => text || <Text type="secondary">No comment provided</Text>,
    },
    {
      title: 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 120,
      render: (sentiment) => {
        let color, text;
        switch (sentiment) {
          case 'positive':
            color = POSITIVE_COLOR;
            text = 'Positive';
            break;
          case 'negative':
            color = NEGATIVE_COLOR;
            text = 'Negative';
            break;
          default:
            color = NEUTRAL_COLOR;
            text = 'Neutral';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
    },
  ];
  
  return (
    <div>
      <Card title="User Feedback Analysis" bordered={false}>
        {renderFilters()}
        
        {renderSummaryCards()}
        
        <Row gutter={16}>
          <Col span={16}>
            {renderTimeChart()}
          </Col>
          <Col span={8}>
            {renderContentTypePie()}
          </Col>
        </Row>
        
        {renderTemplateComparison()}
        
        <Row gutter={16}>
          <Col span={12}>
            {renderCommonTerms()}
          </Col>
          <Col span={12}>
            {renderImprovementSuggestions()}
          </Col>
        </Row>
        
        <Card title="Detailed Feedback" bordered={false}>
          <div style={{ marginBottom: 16 }}>
            <Search
              placeholder="Search feedback comments"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </div>
          
          <Table
            columns={feedbackColumns}
            dataSource={feedbackDetails}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`,
            }}
            onChange={handleTableChange}
          />
        </Card>
      </Card>
    </div>
  );
};

// Missing import
import { message } from 'antd';

export default FeedbackAnalysis;