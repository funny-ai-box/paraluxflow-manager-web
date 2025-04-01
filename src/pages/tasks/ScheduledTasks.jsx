// src/pages/tasks/ScheduledTasks.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Drawer,
  Form,
  Input,
  Select,
  TimePicker,
  Switch,
  Radio,
  Divider,
  Tabs,
  Badge,
  Popconfirm,
  message,
  Tooltip,
  Modal,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  FolderOutlined,
  CalendarOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { 
  fetchScheduledTasks, 
  createScheduledTask, 
  updateScheduledTask, 
  deleteScheduledTask,
  runTaskManually,
  fetchTaskGroups,
  fetchTaskHistory
} from '@/services/tasks';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const frequencyOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom', value: 'custom' },
];

const taskTypeOptions = [
  { label: 'Source Crawling', value: 'source_crawl' },
  { label: 'Content Processing', value: 'content_process' },
  { label: 'Summary Generation', value: 'summary_generation' },
  { label: 'Data Cleanup', value: 'data_cleanup' },
  { label: 'Report Generation', value: 'report_generation' },
];

const weekdayOptions = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
}));

const ScheduledTasks = () => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [manualRunLoading, setManualRunLoading] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  
  useEffect(() => {
    fetchTasks();
    fetchGroups();
  }, []);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetchScheduledTasks();
      if (response.code === 200) {
        setTasks(response.data);
      } else {
        message.error('Failed to fetch scheduled tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('An error occurred while loading tasks');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGroups = async () => {
    try {
      const response = await fetchTaskGroups();
      if (response.code === 200) {
        setTaskGroups(response.data);
      } else {
        message.error('Failed to fetch task groups');
      }
    } catch (error) {
      console.error('Error fetching task groups:', error);
    }
}

// src/pages/tasks/ScheduledTasks.jsx (Continued)

const fetchTaskHistoryData = async (taskId) => {
      setHistoryLoading(true);
      try {
        const response = await fetchTaskHistory(taskId);
        if (response.code === 200) {
          setTaskHistory(response.data);
        } else {
          message.error('Failed to fetch task history');
        }
      } catch (error) {
        console.error('Error fetching task history:', error);
        message.error('An error occurred while loading task history');
      } finally {
        setHistoryLoading(false);
      }
    };
    
    const showTaskHistory = (task) => {
      setSelectedTask(task);
      setHistoryVisible(true);
      fetchTaskHistoryData(task.id);
    };
    
    const showDrawer = (task = null) => {
      setEditingTask(task);
      if (task) {
        setFrequency(task.frequency);
        form.setFieldsValue({
          name: task.name,
          description: task.description,
          task_type: task.task_type,
          group_id: task.group_id,
          frequency: task.frequency,
          run_at: task.run_at ? moment(task.run_at, 'HH:mm:ss') : null,
          weekdays: task.weekdays ? task.weekdays.split(',').map(Number) : [],
          day_of_month: task.day_of_month ? Number(task.day_of_month) : null,
          sources: task.sources ? task.sources.split(',') : [],
          is_active: task.is_active === 1,
          parameters: task.parameters || '',
        });
      } else {
        form.resetFields();
        setFrequency('daily');
        form.setFieldsValue({
          frequency: 'daily',
          is_active: true,
        });
      }
      setDrawerVisible(true);
    };
    
    const closeDrawer = () => {
      setDrawerVisible(false);
      setEditingTask(null);
      form.resetFields();
    };
    
    const handleFormSubmit = async (values) => {
      try {
        // Format values
        const formattedValues = {
          ...values,
          run_at: values.run_at ? values.run_at.format('HH:mm:ss') : null,
          weekdays: values.weekdays ? values.weekdays.join(',') : null,
          day_of_month: values.day_of_month ? String(values.day_of_month) : null,
          sources: values.sources ? values.sources.join(',') : null,
          is_active: values.is_active ? 1 : 0,
        };
        
        let response;
        if (editingTask) {
          response = await updateScheduledTask(editingTask.id, formattedValues);
        } else {
          response = await createScheduledTask(formattedValues);
        }
        
        if (response.code === 200) {
          message.success(`Task ${editingTask ? 'updated' : 'created'} successfully`);
          closeDrawer();
          fetchTasks();
        } else {
          message.error(response.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
        }
      } catch (error) {
        console.error(`Error ${editingTask ? 'updating' : 'creating'} task:`, error);
        message.error(`An error occurred while ${editingTask ? 'updating' : 'creating'} the task`);
      }
    };
    
    const handleDelete = async (id) => {
      try {
        const response = await deleteScheduledTask(id);
        if (response.code === 200) {
          message.success('Task deleted successfully');
          fetchTasks();
        } else {
          message.error(response.message || 'Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        message.error('An error occurred while deleting the task');
      }
    };
    
    const handleManualRun = async (id) => {
      setManualRunLoading(true);
      try {
        const response = await runTaskManually(id);
        if (response.code === 200) {
          message.success('Task started successfully');
          fetchTasks(); // Refresh to update last_run and next_run
        } else {
          message.error(response.message || 'Failed to start task');
        }
      } catch (error) {
        console.error('Error starting task:', error);
        message.error('An error occurred while starting the task');
      } finally {
        setManualRunLoading(false);
      }
    };
    
    const getStatusTag = (status) => {
      switch (status) {
        case 'active':
          return <Badge status="success" text="Active" />;
        case 'inactive':
          return <Badge status="default" text="Inactive" />;
        case 'running':
          return <Badge status="processing" text="Running" />;
        case 'failed':
          return <Badge status="error" text="Failed" />;
        default:
          return <Badge status="default" text={status} />;
      }
    };
    
    const getFrequencyText = (task) => {
      switch (task.frequency) {
        case 'hourly':
          return 'Every hour';
        case 'daily':
          return `Daily at ${task.run_at}`;
        case 'weekly':
          return `Weekly on ${task.weekdays.split(',').map(day => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return dayNames[parseInt(day)];
          }).join(', ')} at ${task.run_at}`;
        case 'monthly':
          return `Monthly on day ${task.day_of_month} at ${task.run_at}`;
        case 'custom':
          return 'Custom schedule';
        default:
          return task.frequency;
      }
    };
    
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <Space>
            <a onClick={() => showTaskHistory(record)}>{text}</a>
            {record.is_running === 1 && <Badge status="processing" />}
          </Space>
        ),
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
        title: 'Group',
        dataIndex: 'group_name',
        key: 'group_name',
        width: 150,
      },
      {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        width: 200,
        render: (_, record) => getFrequencyText(record),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status) => getStatusTag(status),
      },
      {
        title: 'Last Run',
        dataIndex: 'last_run',
        key: 'last_run',
        width: 180,
        render: (text) => text || 'Never',
      },
      {
        title: 'Next Run',
        dataIndex: 'next_run',
        key: 'next_run',
        width: 180,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 180,
        render: (_, record) => (
          <Space>
            <Tooltip title="Run Now">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                size="small"
                onClick={() => handleManualRun(record.id)}
                loading={manualRunLoading && selectedTask?.id === record.id}
                disabled={record.is_running === 1}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => showDrawer(record)}
              />
            </Tooltip>
            <Tooltip title="View History">
              <Button
                icon={<HistoryOutlined />}
                size="small"
                onClick={() => showTaskHistory(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this task?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ];
    
    const historyColumns = [
      {
        title: 'Run ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: 'Start Time',
        dataIndex: 'start_time',
        key: 'start_time',
        width: 180,
      },
      {
        title: 'End Time',
        dataIndex: 'end_time',
        key: 'end_time',
        width: 180,
        render: (text) => text || '-',
      },
      {
        title: 'Duration',
        key: 'duration',
        width: 120,
        render: (_, record) => {
          if (!record.end_time) return 'Running...';
          
          const start = new Date(record.start_time);
          const end = new Date(record.end_time);
          const durationMs = end - start;
          
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
    
    const renderFrequencyFields = () => {
      switch (frequency) {
        case 'hourly':
          return null;
        case 'daily':
          return (
            <Form.Item
              name="run_at"
              label="Time"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          );
        case 'weekly':
          return (
            <>
              <Form.Item
                name="weekdays"
                label="Days of Week"
                rules={[{ required: true, message: 'Please select at least one day' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select days"
                  style={{ width: '100%' }}
                  options={weekdayOptions}
                />
              </Form.Item>
              <Form.Item
                name="run_at"
                label="Time"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </>
          );
        case 'monthly':
          return (
            <>
              <Form.Item
                name="day_of_month"
                label="Day of Month"
                rules={[{ required: true, message: 'Please select day' }]}
              >
                <Select placeholder="Select day" style={{ width: '100%' }}>
                  {dayOfMonthOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="run_at"
                label="Time"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </>
          );
        case 'custom':
          return (
            <Form.Item
              name="parameters"
              label="Cron Expression"
              rules={[{ required: true, message: 'Please enter cron expression' }]}
              tooltip="Enter a valid cron expression (e.g., '0 0 * * *' for daily at midnight)"
            >
              <Input placeholder="Enter cron expression" />
            </Form.Item>
          );
        default:
          return null;
      }
    };
    
    return (
      <div>
        <Card 
          title="Scheduled Tasks" 
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showDrawer()}
            >
              Add Task
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
          />
        </Card>
        
        <Drawer
          title={editingTask ? "Edit Scheduled Task" : "Create Scheduled Task"}
          width={720}
          onClose={closeDrawer}
          open={drawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={closeDrawer}>
                Cancel
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                {editingTask ? 'Update' : 'Create'}
              </Button>
            </div>
          }
        >
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleFormSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Task Name"
                  rules={[{ required: true, message: 'Please enter task name' }]}
                >
                  <Input placeholder="Enter task name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="task_type"
                  label="Task Type"
                  rules={[{ required: true, message: 'Please select task type' }]}
                >
                  <Select 
                    placeholder="Select task type"
                    options={taskTypeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={3} placeholder="Enter task description" />
            </Form.Item>
            
            <Form.Item
              name="group_id"
              label="Task Group"
              rules={[{ required: true, message: 'Please select task group' }]}
            >
              <Select placeholder="Select task group">
                {taskGroups.map(group => (
                  <Option key={group.id} value={group.id}>{group.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Divider>Schedule Configuration</Divider>
            
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true, message: 'Please select frequency' }]}
            >
              <Radio.Group 
                options={frequencyOptions} 
                onChange={(e) => setFrequency(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
            
            {renderFrequencyFields()}
            
            <Form.Item
              name="sources"
              label="Sources"
              tooltip="Select specific sources for this task (leave empty for all sources)"
            >
              <Select
                mode="multiple"
                placeholder="Select sources"
                style={{ width: '100%' }}
                allowClear
              >
                {/* Sources would be loaded dynamically in a real application */}
                <Option value="1">BBC News</Option>
                <Option value="2">CNN</Option>
                <Option value="3">The New York Times</Option>
                <Option value="4">TechCrunch</Option>
                <Option value="5">Wired</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="is_active"
              label="Active"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        </Drawer>
        
        <Modal
          title={selectedTask ? `Task History: ${selectedTask.name}` : 'Task History'}
          open={historyVisible}
          onCancel={() => setHistoryVisible(false)}
          width={1000}
          footer={[
            <Button key="close" onClick={() => setHistoryVisible(false)}>
              Close
            </Button>,
          ]}
        >
          <Table
            columns={historyColumns}
            dataSource={taskHistory}
            rowKey="id"
            loading={historyLoading}
            pagination={{ pageSize: 10 }}
          />
        </Modal>
      </div>
    );
  };
  
  // Fix for missing import
  import moment from 'moment';
  
  export default ScheduledTasks;