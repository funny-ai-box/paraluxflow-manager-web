import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Select, 
  Button, 
  Space, 
  Row, 
  Col, 
  DatePicker, 
  Table, 
  message,
  Spin,
  Empty,
  Progress,
  Input,
  Form,
  Statistic,
  Divider,
  Alert
} from 'antd';
import { 
  ReloadOutlined, 
  SearchOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  CloseCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { analyzeCrawlerPerformance } from '@/services/crawler';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CrawlerAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [feedId, setFeedId] = useState('');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [groupBy, setGroupBy] = useState('feed');
  const [form] = Form.useForm();

  const fetchAnalysisData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await analyzeCrawlerPerformance({
        feed_id: params.feed_id || undefined,
        start_date: params.start_date || dateRange[0].format('YYYY-MM-DD'),
        end_date: params.end_date || dateRange[1].format('YYYY-MM-DD'),
        group_by: params.group_by || groupBy
      });
      
      if (response.code === 200) {
        setAnalysisData(response.data);
      } else {
        message.error(response.message || '获取爬虫性能分析失败');
      }
    } catch (error) {
      console.error('获取爬虫性能分析时出错:', error);
      message.error('获取爬虫性能分析时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const handleSearch = (values) => {
    const { date_range, feed_id, group_by } = values;
    
    const params = {
      feed_id: feed_id,
      group_by: group_by,
    };
    
    if (date_range && date_range.length === 2) {
      params.start_date = date_range[0].format('YYYY-MM-DD');
      params.end_date = date_range[1].format('YYYY-MM-DD');
      setDateRange(date_range);
    }
    
    setFeedId(feed_id || '');
    setGroupBy(group_by);
    
    fetchAnalysisData(params);
  };

  const handleReset = () => {
    form.resetFields();
    setFeedId('');
    setGroupBy('feed');
    setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
    
    fetchAnalysisData({
      feed_id: undefined,
      start_date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      group_by: 'feed'
    });
  };

  // 渲染成功率图表
  const renderSuccessRateChart = () => {
    if (!analysisData || !analysisData.items || analysisData.items.length === 0) {
      return <Empty description="暂无数据" />;
    }

    // 根据分组方式判断X轴标签
    const getLabelKey = () => {
      switch (groupBy) {
        case 'date': return 'date';
        case 'crawler': return 'crawler_id';
        case 'feed':
        default: return 'feed_title';
      }
    };

    const labelKey = getLabelKey();
    
    return (
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analysisData.items}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={labelKey} 
              angle={-45} 
              textAnchor="end" 
              height={70}
              interval={0}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, '成功率']} />
            <Legend />
            <Bar dataKey="success_rate" name="成功率" fill="#52c41a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染处理时间图表
  const renderProcessingTimeChart = () => {
    if (!analysisData || !analysisData.items || analysisData.items.length === 0) {
      return <Empty description="暂无数据" />;
    }

    // 根据分组方式判断X轴标签
    const getLabelKey = () => {
      switch (groupBy) {
        case 'date': return 'date';
        case 'crawler': return 'crawler_id';
        case 'feed':
        default: return 'feed_title';
      }
    };

    const labelKey = getLabelKey();
    
    return (
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={analysisData.items}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={labelKey} 
              angle={-45} 
              textAnchor="end" 
              height={70}
              interval={0}
            />
            <YAxis />
            <Tooltip formatter={(value) => [`${value.toFixed(2)}秒`, '平均处理时间']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avg_processing_time" 
              name="平均处理时间" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染统计卡片
  const renderStatsCards = () => {
    if (!analysisData) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总批次数"
              value={analysisData.total_batches || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="整体成功率"
              value={analysisData.overall_success_rate || 0}
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
              value={analysisData.avg_processing_time || 0}
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
              value={analysisData.failed_batches || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染分析表格
  const renderAnalysisTable = () => {
    if (!analysisData || !analysisData.items) return null;

    // 根据分组方式确定表格列
    const getColumns = () => {
      const baseColumns = [
        {
          title: '总批次',
          dataIndex: 'total_batches',
          key: 'total_batches',
          sorter: (a, b) => a.total_batches - b.total_batches,
        },
        {
          title: '成功批次',
          dataIndex: 'success_batches',
          key: 'success_batches',
          sorter: (a, b) => a.success_batches - b.success_batches,
        },
        {
          title: '失败批次',
          dataIndex: 'failed_batches',
          key: 'failed_batches',
          sorter: (a, b) => a.failed_batches - b.failed_batches,
        },
        {
          title: '成功率',
          dataIndex: 'success_rate',
          key: 'success_rate',
          render: (text) => `${text.toFixed(2)}%`,
          sorter: (a, b) => a.success_rate - b.success_rate,
        },
        {
          title: '平均处理时间',
          dataIndex: 'avg_processing_time',
          key: 'avg_processing_time',
          render: (text) => `${text.toFixed(2)}秒`,
          sorter: (a, b) => a.avg_processing_time - b.avg_processing_time,
        },
      ];

      // 根据分组方式添加不同的首列
      if (groupBy === 'feed') {
        return [
          {
            title: '订阅源',
            key: 'feed',
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.feed_title || '未知'}</Text>
                <Text type="secondary">ID: {record.feed_id}</Text>
                {record.feed_url && (
                  <a href={record.feed_url} target="_blank" rel="noopener noreferrer">
                    <LinkOutlined /> 链接
                  </a>
                )}
              </Space>
            ),
            fixed: 'left',
            width: 250,
          },
          ...baseColumns
        ];
      } else if (groupBy === 'date') {
        return [
          {
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            fixed: 'left',
            width: 120,
          },
          ...baseColumns
        ];
      } else if (groupBy === 'crawler') {
        return [
          {
            title: '爬虫ID',
            dataIndex: 'crawler_id',
            key: 'crawler_id',
            fixed: 'left',
            width: 150,
          },
          ...baseColumns
        ];
      }

      return baseColumns;
    };

    const columns = getColumns();

    return (
      <Card title="性能分析详情" style={{ marginBottom: 16 }}>
        <Table 
          columns={columns} 
          dataSource={analysisData.items} 
          rowKey={(record) => {
            if (groupBy === 'feed') return record.feed_id;
            if (groupBy === 'date') return record.date;
            if (groupBy === 'crawler') return record.crawler_id;
            return Math.random().toString(36).substring(2);
          }}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>爬虫性能分析</Title>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => fetchAnalysisData({
                feed_id: feedId || undefined,
                group_by: groupBy
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
              group_by: groupBy,
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
                <Form.Item name="group_by" label="分组方式">
                  <Select placeholder="请选择分组方式">
                    <Option value="feed">按订阅源分组</Option>
                    <Option value="date">按日期分组</Option>
                    <Option value="crawler">按爬虫分组</Option>
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
                      分析
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Spin spinning={loading}>
          {analysisData ? (
            <>
              {/* 统计卡片 */}
              {renderStatsCards()}
              
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title="成功率分析" style={{ marginBottom: 16 }}>
                    {renderSuccessRateChart()}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="处理时间分析" style={{ marginBottom: 16 }}>
                    {renderProcessingTimeChart()}
                  </Card>
                </Col>
              </Row>
              
              {/* 分析表格 */}
              {renderAnalysisTable()}
            </>
          ) : (
            <Empty description="暂无分析数据" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default CrawlerAnalysis;