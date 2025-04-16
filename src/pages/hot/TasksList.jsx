import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  message, 
  Form,
  Select,
  DatePicker,
  Badge,
  Modal,
  Row,
  Col,
  Tooltip,
  Checkbox,
  Radio
} from 'antd';
import { 
  SearchOutlined, 
  SyncOutlined, 
  PlusOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { 
  fetchHotTasksList, 
  createHotTask,
  createScheduledHotTask
} from '@/services/hotTopics';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const HotTasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showQuickJumper: true,
  });
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const platformOptions = [
    { label: '微博热搜', value: 'weibo' },
    { label: '知乎热榜', value: 'zhihu' },
    { label: '百度热搜', value: 'baidu' },
    { label: '今日头条热榜', value: 'toutiao' },
    { label: '抖音热榜', value: 'douyin' }
  ];
  
  const recurrenceOptions = [
    { label: '不重复', value: 'none' },
    { label: '每天', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' }
  ];

  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const result = await fetchHotTasksList({
        page: params.current || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        ...params.filters
      });
      
      // 修复：调整读取响应数据的条件，匹配API返回的状态码和结构
      if (result.code === 200) { // 根据您提供的示例响应，状态码是200不是0
        setTasks(result.data.list || []);
        setPagination({
          ...pagination,
          current: result.data.current_page,
          total: result.data.total,
        });
      } else {
        message.error(result.message || '获取热点任务列表失败');
      }
    } catch (error) {
      console.error('获取热点任务列表时出错:', error);
      message.error('获取热点任务列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTableChange = (pag, filters, sorter) => {
    fetchTasks({
      current: pag.current,
      pageSize: pag.pageSize,
      filters,
      sorter
    });
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    // 处理日期范围
    const searchParams = { ...values };
    if (values.date_range) {
      searchParams.start_date = values.date_range[0].format('YYYY-MM-DD');
      searchParams.end_date = values.date_range[1].format('YYYY-MM-DD');
      delete searchParams.date_range;
    }
    
    fetchTasks({
      current: 1,
      filters: searchParams
    });
  };

  const handleReset = () => {
    form.resetFields();
    fetchTasks({
      current: 1,
      filters: {}
    });
  };
  
  const handleCreateTask = () => {
    setIsModalVisible(true);
    createForm.resetFields();
    setIsScheduled(false);
  };
  
  const handleCloseModal = () => {
    setIsModalVisible(false);
    createForm.resetFields();
  };
  
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setCreating(true);
      
      const requestData = {
        platforms: values.platforms,
      };
      
      if (isScheduled) {
        requestData.schedule_time = values.schedule_time.format('YYYY-MM-DDTHH:mm:ss');
        requestData.recurrence = values.recurrence;
        
        const result = await createScheduledHotTask(requestData);
        // 修复：调整成功状态码判断，同时确保关闭弹窗并刷新数据
        if (result.code === 200) { // 根据您的API响应模式，假设成功状态码是200
          message.success('定时热点爬取任务创建成功');
          setIsModalVisible(false); // 关闭弹窗
          fetchTasks(); // 刷新列表数据
        } else {
          message.error(result.message || '定时任务创建失败');
        }
      } else {
        if (values.schedule_time) {
          requestData.schedule_time = values.schedule_time.format('YYYY-MM-DDTHH:mm:ss');
        }
        
        const result = await createHotTask(requestData);
        // 修复：调整成功状态码判断，同时确保关闭弹窗并刷新数据
        if (result.code === 200) { // 根据您的API响应模式，假设成功状态码是200
          message.success('热点爬取任务创建成功');
          setIsModalVisible(false); // 关闭弹窗
          fetchTasks(); // 刷新列表数据
        } else {
          message.error(result.message || '任务创建失败');
        }
      }
    } catch (error) {
      console.error('创建任务时出错:', error);
      message.error('表单验证失败或创建任务时发生错误');
    } finally {
      setCreating(false);
    }
  };
  
  // 获取状态标签
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <Badge status="warning" text="待爬取" />;
      case 1:
        return <Badge status="processing" text="爬取中" />;
      case 2:
        return <Badge status="success" text="已完成" />;
      case 3:
        return <Badge status="error" text="失败" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };
  
  // 获取触发类型标签
  const getTriggerTypeTag = (type) => {
    switch (type) {
      case 'manual':
        return <Tag color="blue">手动触发</Tag>;
      case 'scheduled':
        return <Tag color="green">定时触发</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };
  const columns = [
      {
        title: '任务ID',
        dataIndex: 'id',
        key: 'id',
        width: 220,
        ellipsis: true,
        render: (id) => (
          <Tooltip title={id}>
            <Link to={`/hot-topics/tasks/${id}`}>
              {id.substring(0, 8)}...
            </Link>
          </Tooltip>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => getStatusBadge(status),
        filters: [
          { text: '待爬取', value: 0 },
          { text: '爬取中', value: 1 },
          { text: '已完成', value: 2 },
          { text: '失败', value: 3 },
        ],
      },
      {
        title: '平台',
        dataIndex: 'platforms',
        key: 'platforms',
        width: 250,
        render: (platforms) => (
          <Space wrap>
            {platforms.map(platform => {
              // 将平台值转换为用户可读的标签
              const platformLabel = platformOptions.find(opt => opt.value === platform)?.label || platform;
              return <Tag key={platform} color="blue">{platformLabel}</Tag>;
            })}
          </Space>
        ),
      },
      {
        title: '触发类型',
        dataIndex: 'trigger_type',
        key: 'trigger_type',
        width: 120,
        render: (type) => getTriggerTypeTag(type),
        filters: [
          { text: '手动触发', value: 'manual' },
          { text: '定时触发', value: 'scheduled' },
        ],
      },
      {
        title: '计划时间',
        dataIndex: 'scheduled_time',
        key: 'scheduled_time',
        width: 170,
        render: (time) => time ? (
          <span>
            <ClockCircleOutlined style={{ marginRight: 5 }} />
            {dayjs(time).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        ) : '-',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 170,
        render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
        sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Link to={`/hot-topics/tasks/${record.id}`}>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              查看详情
            </Button>
          </Link>
        ),
      },
    ];
  
    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>热点爬取任务管理</Title>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateTask}
                >
                  新建爬取任务
                </Button>
              </Space>
            </div>
          }
          bordered={false}
          style={{ borderRadius: '8px', marginBottom: '16px' }}
        >
          <Card
            style={{ borderRadius: '8px', marginBottom: '16px' }}
            size="small"
          >
            <Form 
              form={form}
              layout="inline"
              onFinish={handleSearch}
            >
              <Row gutter={[16, 16]} style={{ width: '100%' }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="status" label="状态">
                    <Select placeholder="请选择状态" allowClear>
                      <Option value={0}>待爬取</Option>
                      <Option value={1}>爬取中</Option>
                      <Option value={2}>已完成</Option>
                      <Option value={3}>失败</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="trigger_type" label="触发类型">
                    <Select placeholder="请选择触发类型" allowClear>
                      <Option value="manual">手动触发</Option>
                      <Option value="scheduled">定时触发</Option>
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
          
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1100 }}
            size="middle"
          />
        </Card>
        
        <Modal
          title="创建热点爬取任务"
          open={isModalVisible}
          onCancel={handleCloseModal}
          onOk={handleCreateSubmit}
          confirmLoading={creating}
          maskClosable={false}
          width={600}
        >
          <Form
            form={createForm}
            layout="vertical"
            initialValues={{ platforms: ['weibo'], recurrence: 'none' }}
          >
            <Form.Item
              name="platforms"
              label="爬取平台"
              rules={[{ required: true, message: '请选择至少一个平台' }]}
            >
              <CheckboxGroup options={platformOptions} />
            </Form.Item>
            
            <Form.Item>
              <Radio.Group 
                value={isScheduled ? 'scheduled' : 'immediate'} 
                onChange={(e) => setIsScheduled(e.target.value === 'scheduled')}
              >
                <Radio value="immediate">立即执行</Radio>
                <Radio value="scheduled">定时执行</Radio>
              </Radio.Group>
            </Form.Item>
            
            {!isScheduled ? (
              <Form.Item
                name="schedule_time"
                label="计划时间（可选）"
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择计划时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  name="schedule_time"
                  label="计划时间"
                  rules={[{ required: true, message: '请选择计划时间' }]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择计划时间"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="recurrence"
                  label="重复类型"
                  rules={[{ required: true, message: '请选择重复类型' }]}
                >
                  <Radio.Group options={recurrenceOptions} />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    );
  };
  
  export default HotTasksList;