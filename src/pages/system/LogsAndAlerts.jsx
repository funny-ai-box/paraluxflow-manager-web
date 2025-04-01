// src/pages/system/LogsAndAlerts.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Tabs,
  Typography,
  Tag,
  Badge,
  Drawer,
  Form,
  Checkbox,
  Radio,
  Row,
  Col,
  Divider,
  InputNumber,
  Alert,
  message,
  Modal,
  Popconfirm,
  Switch
} from 'antd';
import {
      HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  BellOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { 
  fetchSystemLogs, 
  fetchAlertRules, 
  createAlertRule, 
  updateAlertRule, 
  deleteAlertRule,
  fetchAlertHistory,
  testAlertRule,
  exportLogs
} from '@/services/system';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const LogsAndAlerts = () => {
  const [form] = Form.useForm();
  const [logs, setLogs] = useState([]);
  const [alertRules, setAlertRules] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testResultVisible, setTestResultVisible] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetailVisible, setLogDetailVisible] = useState(false);
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [component, setComponent] = useState('all');
  
  useEffect(() => {
    if (activeTab === '1') {
      fetchLogs();
    } else if (activeTab === '2') {
      fetchAlerts();
    } else if (activeTab === '3') {
      fetchHistory();
    }
  }, [activeTab]);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchText || undefined,
        level: logLevel !== 'all' ? logLevel : undefined,
        start_date: dateRange[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: dateRange[1]?.format('YYYY-MM-DD HH:mm:ss'),
        component: component !== 'all' ? component : undefined,
      };
      
      const response = await fetchSystemLogs(params);
      if (response.code === 200) {
        setLogs(response.data);
      } else {
        message.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      message.error('An error occurred while loading logs');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await fetchAlertRules();
      if (response.code === 200) {
        setAlertRules(response.data);
      } else {
        message.error('Failed to fetch alert rules');
      }
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      message.error('An error occurred while loading alert rules');
    } finally {
      setAlertsLoading(false);
    }
  };
  
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetchAlertHistory();
      if (response.code === 200) {
        setAlertHistory(response.data);
      } else {
        message.error('Failed to fetch alert history');
      }
    } catch (error) {
      console.error('Error fetching alert history:', error);
      message.error('An error occurred while loading alert history');
    } finally {
      setHistoryLoading(false);
    }
  };
  
  const handleExportLogs = async () => {
    setExportLoading(true);
    try {
      const params = {
        keyword: searchText || undefined,
        level: logLevel !== 'all' ? logLevel : undefined,
        start_date: dateRange[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: dateRange[1]?.format('YYYY-MM-DD HH:mm:ss'),
        component: component !== 'all' ? component : undefined,
      };
      
      const response = await exportLogs(params);
      if (response.code === 200) {
        // In a real app, this would trigger a file download
        message.success('Logs exported successfully');
      } else {
        message.error('Failed to export logs');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      message.error('An error occurred while exporting logs');
    } finally {
      setExportLoading(false);
    }
  };
  
  const showDrawer = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      form.setFieldsValue({
        name: rule.name,
        description: rule.description,
        condition_type: rule.condition_type,
        log_level: rule.log_level,
        keyword: rule.keyword,
        component: rule.component,
        threshold: rule.threshold,
        time_window: rule.time_window,
        notification_channels: rule.notification_channels,
        email_addresses: rule.email_addresses,
        webhook_url: rule.webhook_url,
        is_active: rule.is_active === 1,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        condition_type: 'keyword',
        log_level: 'error',
        threshold: 5,
        time_window: 10,
        notification_channels: ['email'],
        is_active: true,
      });
    }
    setDrawerVisible(true);
  };
  
  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingRule(null);
    form.resetFields();
  };
  
  const handleFormSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        notification_channels: values.notification_channels.join(','),
        is_active: values.is_active ? 1 : 0,
      };
      
      let response;
      if (editingRule) {
        response = await updateAlertRule(editingRule.id, formattedValues);
      } else {
        response = await createAlertRule(formattedValues);
      }
      
      if (response.code === 200) {
        message.success(`Alert rule ${editingRule ? 'updated' : 'created'} successfully`);
        closeDrawer();
        fetchAlerts();
      } else {
        message.error(response.message || `Failed to ${editingRule ? 'update' : 'create'} alert rule`);
      }
    } catch (error) {
      console.error(`Error ${editingRule ? 'updating' : 'creating'} alert rule:`, error);
      message.error(`An error occurred while ${editingRule ? 'updating' : 'creating'} the alert rule`);
    }
  };
  
  const handleDeleteRule = async (id) => {
    try {
      const response = await deleteAlertRule(id);
      if (response.code === 200) {
        message.success('Alert rule deleted successfully');
        fetchAlerts();
      } else {
        message.error(response.message || 'Failed to delete alert rule');
      }
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      message.error('An error occurred while deleting the alert rule');
    }
  };
  
  const handleTestRule = async (rule) => {
    setTestLoading(true);
    try {
      const response = await testAlertRule(rule.id);
      if (response.code === 200) {
        setTestResult(response.data);
        setTestResultVisible(true);
      } else {
        message.error(response.message || 'Failed to test alert rule');
      }
    } catch (error) {
      console.error('Error testing alert rule:', error);
      message.error('An error occurred while testing the alert rule');
    } finally {
      setTestLoading(false);
    }
  };
  
  const showLogDetail = (log) => {
    setSelectedLog(log);
    setLogDetailVisible(true);
  };
  
  const getLevelTag = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <Tag color="red" icon={<CloseCircleOutlined />}>ERROR</Tag>;
      case 'warning':
        return <Tag color="orange" icon={<WarningOutlined />}>WARNING</Tag>;
      case 'info':
        return <Tag color="blue" icon={<InfoCircleOutlined />}>INFO</Tag>;
      case 'debug':
        return <Tag color="green" icon={<CheckCircleOutlined />}>DEBUG</Tag>;
      default:
        return <Tag color="default">{level}</Tag>;
    }
  };
  
  const renderLogFilters = () => (
    <Space style={{ marginBottom: 16 }} wrap>
      <Input
        placeholder="Search log content"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onPressEnter={fetchLogs}
        style={{ width: 200 }}
        suffix={<SearchOutlined />}
        allowClear
      />
      <Select 
        style={{ width: 120 }} 
        value={logLevel} 
        onChange={setLogLevel}
        placeholder="Log Level"
      >
        <Option value="all">All Levels</Option>
        <Option value="error">Error</Option>
        <Option value="warning">Warning</Option>
        <Option value="info">Info</Option>
        <Option value="debug">Debug</Option>
      </Select>
      <RangePicker 
        showTime 
        value={dateRange} 
        onChange={setDateRange} 
        style={{ width: 380 }}
      />
      <Select 
        style={{ width: 150 }} 
        value={component} 
        onChange={setComponent}
        placeholder="Component"
      >
        <Option value="all">All Components</Option>
        <Option value="crawler">Crawler</Option>
        <Option value="parser">Parser</Option>
        <Option value="ai">AI Service</Option>
        <Option value="database">Database</Option>
        <Option value="api">API</Option>
        <Option value="scheduler">Scheduler</Option>
      </Select>
      <Button 
        type="primary" 
        icon={<FilterOutlined />} 
        onClick={fetchLogs}
      >
        Filter
      </Button>
      <Button 
        icon={<ReloadOutlined />} 
        onClick={() => {
          setSearchText('');
          setLogLevel('all');
          setDateRange([null, null]);
          setComponent('all');
          fetchLogs();
        }}
      >
        Reset
      </Button>
      <Button 
        icon={<DownloadOutlined />} 
        onClick={handleExportLogs}
        loading={exportLoading}
      >
        Export Logs
      </Button>
    </Space>
  );
  
  const logColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => getLevelTag(level),
    },
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
      width: 120,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      // src/pages/system/LogsAndAlerts.jsx (Continued)

      render: (_, record) => (
            <Button 
              type="link" 
              size="small" 
              onClick={() => showLogDetail(record)}
            >
              View
            </Button>
          ),
        },
      ];
      
      const alertRuleColumns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text, record) => (
            <Space>
              {text}
              {record.is_active === 0 && <Tag color="default">Inactive</Tag>}
            </Space>
          ),
        },
        {
          title: 'Condition',
          key: 'condition',
          render: (_, record) => {
            if (record.condition_type === 'keyword') {
              return (
                <Space>
                  <Tag color="blue">Keyword</Tag>
                  <span>"{record.keyword}"</span>
                  <Tag color={record.log_level === 'error' ? 'red' : (record.log_level === 'warning' ? 'orange' : 'blue')}>
                    {record.log_level.toUpperCase()}
                  </Tag>
                  {record.component && <Tag color="purple">{record.component}</Tag>}
                </Space>
              );
            } else {
              return (
                <Space>
                  <Tag color="green">Threshold</Tag>
                  <span>{record.threshold} {record.log_level.toUpperCase()} logs in {record.time_window} minutes</span>
                  {record.component && <Tag color="purple">{record.component}</Tag>}
                </Space>
              );
            }
          },
        },
        {
          title: 'Notification',
          key: 'notification',
          render: (_, record) => {
            const channels = record.notification_channels.split(',');
            return (
              <Space>
                {channels.map(channel => {
                  switch (channel) {
                    case 'email':
                      return <Tag icon={<MailOutlined />} color="blue">Email</Tag>;
                    case 'sms':
                      return <Tag icon={<MobileOutlined />} color="green">SMS</Tag>;
                    case 'webhook':
                      return <Tag icon={<ApiOutlined />} color="purple">Webhook</Tag>;
                    default:
                      return <Tag color="default">{channel}</Tag>;
                  }
                })}
              </Space>
            );
          },
        },
        {
          title: 'Status',
          dataIndex: 'is_active',
          key: 'is_active',
          width: 100,
          render: (active) => (
            <Badge status={active === 1 ? 'success' : 'default'} text={active === 1 ? 'Active' : 'Inactive'} />
          ),
        },
        {
          title: 'Created',
          dataIndex: 'created_at',
          key: 'created_at',
          width: 180,
        },
        {
          title: 'Actions',
          key: 'actions',
          width: 180,
          render: (_, record) => (
            <Space>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => showDrawer(record)}
              />
              <Button
                icon={<SendOutlined />}
                size="small"
                onClick={() => handleTestRule(record)}
                loading={testLoading}
              />
              <Popconfirm
                title="Are you sure you want to delete this rule?"
                onConfirm={() => handleDeleteRule(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Popconfirm>
            </Space>
          ),
        },
      ];
      
      const alertHistoryColumns = [
        {
          title: 'Time',
          dataIndex: 'triggered_at',
          key: 'triggered_at',
          width: 180,
          sorter: (a, b) => new Date(a.triggered_at) - new Date(b.triggered_at),
          defaultSortOrder: 'descend',
        },
        {
          title: 'Alert Rule',
          dataIndex: 'rule_name',
          key: 'rule_name',
        },
        {
          title: 'Level',
          dataIndex: 'level',
          key: 'level',
          width: 100,
          render: (level) => getLevelTag(level),
        },
        {
          title: 'Message',
          dataIndex: 'message',
          key: 'message',
          ellipsis: true,
        },
        {
          title: 'Recipients',
          dataIndex: 'recipients',
          key: 'recipients',
          width: 200,
          ellipsis: true,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width: 120,
          render: (status) => {
            switch (status) {
              case 'sent':
                return <Badge status="success" text="Sent" />;
              case 'failed':
                return <Badge status="error" text="Failed" />;
              case 'pending':
                return <Badge status="processing" text="Pending" />;
              default:
                return <Badge status="default" text={status} />;
            }
          },
        },
      ];
      
      const renderLogTab = () => (
        <div>
          {renderLogFilters()}
          
          <Table
            columns={logColumns}
            dataSource={logs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showQuickJumper: true }}
            expandable={{
              expandedRowRender: (record) => (
                <Card>
                  <p><Text strong>Request ID:</Text> {record.request_id || 'N/A'}</p>
                  <p><Text strong>Source IP:</Text> {record.source_ip || 'N/A'}</p>
                  <p><Text strong>User:</Text> {record.username || 'N/A'}</p>
                  {record.stack_trace && (
                    <div>
                      <Text strong>Stack Trace:</Text>
                      <pre style={{ 
                        marginTop: 8, 
                        padding: 8, 
                        background: '#f5f5f5', 
                        borderRadius: 4,
                        maxHeight: 200,
                        overflow: 'auto'
                      }}>
                        {record.stack_trace}
                      </pre>
                    </div>
                  )}
                </Card>
              ),
            }}
          />
          
          <Modal
            title="Log Details"
            open={logDetailVisible}
            onCancel={() => setLogDetailVisible(false)}
            width={800}
            footer={[
              <Button key="close" onClick={() => setLogDetailVisible(false)}>
                Close
              </Button>,
            ]}
          >
            {selectedLog && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    {getLevelTag(selectedLog.level)}
                    <Text strong>{selectedLog.timestamp}</Text>
                    <Tag color="purple">{selectedLog.component}</Tag>
                  </Space>
                </div>
                
                <Card title="Message" style={{ marginBottom: 16 }}>
                  <Text>{selectedLog.message}</Text>
                </Card>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Context" size="small">
                      <p><Text strong>Request ID:</Text> {selectedLog.request_id || 'N/A'}</p>
                      <p><Text strong>Source IP:</Text> {selectedLog.source_ip || 'N/A'}</p>
                      <p><Text strong>User:</Text> {selectedLog.username || 'N/A'}</p>
                      <p><Text strong>User Agent:</Text> {selectedLog.user_agent || 'N/A'}</p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Additional Data" size="small">
                      {selectedLog.additional_data && (
                        <pre style={{ 
                          margin: 0, 
                          padding: 0, 
                          maxHeight: 150,
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(selectedLog.additional_data, null, 2)}
                        </pre>
                      )}
                      {!selectedLog.additional_data && <Text type="secondary">No additional data</Text>}
                    </Card>
                  </Col>
                </Row>
                
                {selectedLog.stack_trace && (
                  <Card title="Stack Trace" style={{ marginTop: 16 }}>
                    <pre style={{ 
                      margin: 0, 
                      padding: 0, 
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      {selectedLog.stack_trace}
                    </pre>
                  </Card>
                )}
              </div>
            )}
          </Modal>
        </div>
      );
      
      const renderAlertRulesTab = () => (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showDrawer()}
              >
                Create Alert Rule
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                onClick={fetchAlerts}
                loading={alertsLoading}
              >
                Refresh
              </Button>
            </Space>
            
            <Input.Search 
              placeholder="Search alert rules" 
              style={{ width: 300 }} 
              onSearch={(value) => {
                // Filter rules client-side
                const filteredRules = alertRules.filter(rule => 
                  rule.name.toLowerCase().includes(value.toLowerCase()) || 
                  rule.description?.toLowerCase().includes(value.toLowerCase())
                );
                setAlertRules(filteredRules);
              }}
              allowClear
              onPressEnter={(e) => e.preventDefault()}
            />
          </div>
          
          <Table
            columns={alertRuleColumns}
            dataSource={alertRules}
            rowKey="id"
            loading={alertsLoading}
            pagination={{ pageSize: 10 }}
          />
          
          <Modal
            title="Alert Rule Test Result"
            open={testResultVisible}
            onCancel={() => setTestResultVisible(false)}
            footer={[
              <Button key="close" onClick={() => setTestResultVisible(false)}>
                Close
              </Button>,
            ]}
          >
            {testResult && (
              <div>
                <Alert
                  message={testResult.success ? "Test Successful" : "Test Failed"}
                  description={testResult.message}
                  type={testResult.success ? "success" : "error"}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                {testResult.matches && testResult.matches.length > 0 && (
                  <div>
                    <Title level={5}>Matching Logs ({testResult.matches.length})</Title>
                    <List
                      size="small"
                      bordered
                      dataSource={testResult.matches}
                      renderItem={item => (
                        <List.Item>
                          <Space>
                            {getLevelTag(item.level)}
                            <Text>{item.timestamp}</Text>
                            <Text ellipsis>{item.message}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
                
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Notification Preview</Title>
                  <Card>
                    <p><strong>Subject:</strong> {testResult.notification?.subject || 'N/A'}</p>
                    <p><strong>Recipients:</strong> {testResult.notification?.recipients || 'N/A'}</p>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {testResult.notification?.body || 'No preview available'}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Modal>
        </div>
      );
      
      const renderAlertHistoryTab = () => (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <RangePicker showTime />
              <Select style={{ width: 120 }} placeholder="Status">
                <Option value="all">All Status</Option>
                <Option value="sent">Sent</Option>
                <Option value="failed">Failed</Option>
                <Option value="pending">Pending</Option>
              </Select>
              <Button 
                icon={<SyncOutlined />} 
                onClick={fetchHistory}
                loading={historyLoading}
              >
                Refresh
              </Button>
            </Space>
          </div>
          
          <Table
            columns={alertHistoryColumns}
            dataSource={alertHistory}
            rowKey="id"
            loading={historyLoading}
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => (
                <Card>
                  <Title level={5}>Alert Content</Title>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                    {record.content}
                  </div>
                  
                  {record.error_message && (
                    <Alert
                      message="Error Details"
                      description={record.error_message}
                      type="error"
                      showIcon
                    />
                  )}
                </Card>
              ),
            }}
          />
        </div>
      );
      
      return (
        <Card title="System Logs & Alerts" bordered={false}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  System Logs
                </span>
              } 
              key="1"
            >
              {renderLogTab()}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <BellOutlined />
                  Alert Rules
                </span>
              } 
              key="2"
            >
              {renderAlertRulesTab()}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  Alert History
                </span>
              } 
              key="3"
            >
              {renderAlertHistoryTab()}
            </TabPane>
          </Tabs>
          
          <Drawer
            title={editingRule ? "Edit Alert Rule" : "Create Alert Rule"}
            width={720}
            onClose={closeDrawer}
            open={drawerVisible}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={closeDrawer}>
                    Cancel
                  </Button>
                  <Button type="primary" onClick={() => form.submit()}>
                    {editingRule ? 'Update' : 'Create'}
                  </Button>
                </Space>
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
                    label="Rule Name"
                    rules={[{ required: true, message: 'Please enter rule name' }]}
                  >
                    <Input placeholder="Enter rule name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="is_active"
                    label="Status"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={2} placeholder="Enter rule description" />
              </Form.Item>
              
              <Divider>Alert Condition</Divider>
              
              <Form.Item
                name="condition_type"
                label="Condition Type"
                rules={[{ required: true, message: 'Please select condition type' }]}
              >
                <Radio.Group>
                  <Radio value="keyword">Keyword Match</Radio>
                  <Radio value="threshold">Threshold</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.condition_type !== currentValues.condition_type}
              >
                {({ getFieldValue }) => {
                  const conditionType = getFieldValue('condition_type');
                  return conditionType === 'keyword' ? (
                    <Form.Item
                      name="keyword"
                      label="Keyword"
                      rules={[{ required: true, message: 'Please enter keyword' }]}
                    >
                      <Input placeholder="Enter keyword to match in logs" />
                    </Form.Item>
                  ) : (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="threshold"
                          label="Threshold Count"
                          rules={[{ required: true, message: 'Please enter threshold' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="time_window"
                          label="Time Window (minutes)"
                          rules={[{ required: true, message: 'Please enter time window' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }}
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="log_level"
                    label="Log Level"
                    rules={[{ required: true, message: 'Please select log level' }]}
                  >
                    <Select placeholder="Select log level">
                      <Option value="error">Error</Option>
                      <Option value="warning">Warning</Option>
                      <Option value="info">Info</Option>
                      <Option value="debug">Debug</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="component"
                    label="Component (Optional)"
                  >
                    <Select placeholder="Select component" allowClear>
                      <Option value="crawler">Crawler</Option>
                      <Option value="parser">Parser</Option>
                      <Option value="ai">AI Service</Option>
                      <Option value="database">Database</Option>
                      <Option value="api">API</Option>
                      <Option value="scheduler">Scheduler</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Notification Settings</Divider>
              
              <Form.Item
                name="notification_channels"
                label="Notification Channels"
                rules={[{ required: true, message: 'Please select at least one channel' }]}
              >
                <Checkbox.Group>
                  <Space direction="vertical">
                    <Checkbox value="email">Email</Checkbox>
                    <Checkbox value="sms">SMS</Checkbox>
                    <Checkbox value="webhook">Webhook</Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>
              
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.notification_channels !== currentValues.notification_channels}
              >
                {({ getFieldValue }) => {
                  const channels = getFieldValue('notification_channels') || [];
                  
                  return (
                    <>
                      {channels.includes('email') && (
                        <Form.Item
                          name="email_addresses"
                          label="Email Recipients"
                          rules={[{ required: true, message: 'Please enter email addresses' }]}
                          tooltip="Separate multiple emails with commas"
                        >
                          <Input placeholder="email1@example.com, email2@example.com" />
                        </Form.Item>
                      )}
                      
                      {channels.includes('sms') && (
                        <Form.Item
                          name="phone_numbers"
                          label="Phone Numbers"
                          rules={[{ required: true, message: 'Please enter phone numbers' }]}
                          tooltip="Separate multiple numbers with commas"
                        >
                          <Input placeholder="+1234567890, +0987654321" />
                        </Form.Item>
                      )}
                      
                      {channels.includes('webhook') && (
                        <Form.Item
                          name="webhook_url"
                          label="Webhook URL"
                          rules={[
                            { required: true, message: 'Please enter webhook URL' },
                            { type: 'url', message: 'Please enter a valid URL' }
                          ]}
                        >
                          <Input placeholder="https://example.com/webhook" />
                        </Form.Item>
                      )}
                    </>
                  );
                }}
              </Form.Item>
            </Form>
          </Drawer>
        </Card>
      );
    };
    
    // Missing imports
    import { ApiOutlined, MailOutlined, MobileOutlined } from '@ant-design/icons';
    
    export default LogsAndAlerts;