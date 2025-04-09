import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Row, 
  Col, 
  DatePicker, 
  Table, 
  message,
  Spin,
  Empty,
  Form,
  Input,
  Select,
  Divider,
  Alert,
  Tag,
  InputNumber
} from 'antd';
import { 
  ReloadOutlined, 
  SearchOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  BugOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { analyzeCrawlerErrors } from '@/services/crawler';
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
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 饼图颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CrawlerErrorAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [errorData, setErrorData] = useState(null);
  const [feedId, setFeedId] = useState('');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [limit, setLimit] = useState(10);
  const [form] = Form.useForm();

  const fetchErrorAnalysis = async (params = {}) => {
    setLoading(true);
    try {
      const response = await analyzeCrawlerErrors({
        feed_id: params.feed_id || undefined,
        start_date: params.start_date || dateRange[0].format('YYYY-MM-DD'),
        end_date: params.end_date || dateRange[1].format('YYYY-MM-DD'),
        limit: params.limit || limit
      });
      
      if (response.code === 200) {
        setErrorData(response.data);
      } else {
        message.error(response.message || '获取爬虫错误分析失败');
      }
    } catch (error) {
      console.error('获取爬虫错误分析时出错:', error);
      message.error('获取爬虫错误分析时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorAnalysis();
  }, []);

  const handleSearch = (values) => {
    const { date_range, feed_id, limit } = values;
    
    const params = {
      feed_id: feed_id,
      limit: limit
    };
    
    if (date_range && date_range.length === 2) {
      params.start_date = date_range[0].format('YYYY-MM-DD');
      params.end_date = date_range[1].format('YYYY-MM-DD');
      setDateRange(date_range);
    }
    
    setFeedId(feed_id || '');
    setLimit(limit || 10);
    
    fetchErrorAnalysis(params);
  };

  const handleReset = () => {
    form.resetFields();
    setFeedId('');
    setLimit(10);
    setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
    
    fetchErrorAnalysis({
      feed_id: undefined,
      start_date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      limit: 10
    });
  };

  // 渲染错误类型饼图
  const renderErrorTypesPieChart = () => {
    if (!errorData || !errorData.error_types || errorData.error_types.length === 0) {
      return <Empty description="暂无错误类型数据" />;
    }
    
    return (
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={errorData.error_types}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="error_type"
              label={({ error_type, percentage }) => `${error_type}: ${percentage.toFixed(1)}%`}
            >
              {errorData.error_types.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, entry) => [`${value} (${entry.payload.percentage.toFixed(1)}%)`, entry.payload.error_type]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染错误阶段饼图
  const renderErrorStagesPieChart = () => {
    if (!errorData || !errorData.error_stages || errorData.error_stages.length === 0) {
      return <Empty description="暂无错误阶段数据" />;
    }
    
    return (
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={errorData.error_stages}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="error_stage"
              label={({ error_stage, percentage }) => `${error_stage}: ${percentage.toFixed(1)}%`}
            >
              {errorData.error_stages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, entry) => [`${value} (${entry.payload.percentage.toFixed(1)}%)`, entry.payload.error_stage]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染错误类型表格
  const renderErrorTypesTable = () => {
    if (!errorData || !errorData.error_types) return null;

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
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text) => `${text.toFixed(2)}%`,
        sorter: (a, b) => a.percentage - b.percentage,
      },
    ];

    return (
      <Card title="错误类型分布" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={errorData.error_types} 
          rowKey="error_type"
          pagination={false}
        />
      </Card>
    );
  };

  // 渲染错误阶段表格
  const renderErrorStagesTable = () => {
    if (!errorData || !errorData.error_stages) return null;

    const columns = [
      {
        title: '错误阶段',
        dataIndex: 'error_stage',
        key: 'error_stage',
        render: (text) => {
          const stageMap = {
            'html_fetch': { color: 'blue', text: '获取HTML' },
            'content_parse': { color: 'purple', text: '解析内容' },
            'script_fetch': { color: 'cyan', text: '获取脚本' },
          };
          
          const { color, text: displayText } = stageMap[text] || { color: 'default', text: text };
          
          return <Tag color={color}>{displayText}</Tag>;
        }
      },
      {
        title: '出现次数',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
      },
      {
        title: '占比',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text) => `${text.toFixed(2)}%`,
        sorter: (a, b) => a.percentage - b.percentage,
      },
    ];

    return (
      <Card title="错误阶段分布" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={errorData.error_stages} 
          rowKey="error_stage"
          pagination={false}
        />
      </Card>
    );
  };

  // 渲染错误订阅源表格
  const renderErrorFeedsTable = () => {
    if (!errorData || !errorData.top_error_feeds) return null;

    const columns = [
      {
        title: '订阅源ID',
        dataIndex: 'feed_id',
        key: 'feed_id',
      },
      {
        title: '错误次数',
        dataIndex: 'error_count',
        key: 'error_count',
        sorter: (a, b) => a.error_count - b.error_count,
      },
      {
        title: '占比',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text) => `${text.toFixed(2)}%`,
        sorter: (a, b) => a.percentage - b.percentage,
      },
    ];

    return (
      <Card title="错误最多的订阅源" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={errorData.top_error_feeds} 
          rowKey="feed_id"
          pagination={false}
        />
      </Card>
    );
  };

  // 渲染常见错误消息表格
  const renderCommonErrorMessagesTable = () => {
    if (!errorData || !errorData.common_error_messages) return null;

    const columns = [
      {
        title: '错误信息',
        dataIndex: 'error_message',
        key: 'error_message',
        width: '60%',
        ellipsis: { showTitle: false },
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            <Text style={{ width: '100%' }} ellipsis={{ tooltip: text }}>
              {text}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: '出现次数',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
      },
      {
        title: '占比',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (text) => `${text.toFixed(2)}%`,
        sorter: (a, b) => a.percentage - b.percentage,
      },
    ];

    return (
      <Card title="常见错误信息" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={errorData.common_error_messages} 
          rowKey="error_message"
          pagination={errorData.common_error_messages.length > 10}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>爬虫错误分析</Title>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => fetchErrorAnalysis({
                feed_id: feedId || undefined,
                limit: limit
              })}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        }
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSearch}
            initialValues={{
              limit: limit,
              date_range: dateRange,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="feed_id" label="订阅源ID">
                  <Input placeholder="请输入订阅源ID" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="limit" label="错误类型数量限制">
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
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
                      分析
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Spin spinning={loading}>
          {errorData ? (
            <>
              <Alert
                message={`总计 ${errorData.total_errors || 0} 个错误`}
                description={`分析时间范围: ${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title="错误类型分布" style={{ marginBottom: 16 }}>
                    {renderErrorTypesPieChart()}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="错误阶段分布" style={{ marginBottom: 16 }}>
                    {renderErrorStagesPieChart()}
                  </Card>
                </Col>
              </Row>
              
              {/* 错误类型表格 */}
              {renderErrorTypesTable()}
              
              {/* 错误阶段表格 */}
              {renderErrorStagesTable()}
              
              {/* 错误订阅源表格 */}
              {renderErrorFeedsTable()}
              
              {/* 常见错误信息表格 */}
              {renderCommonErrorMessagesTable()}
            </>
          ) : (
            <Empty description="暂无错误分析数据" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default CrawlerErrorAnalysis;