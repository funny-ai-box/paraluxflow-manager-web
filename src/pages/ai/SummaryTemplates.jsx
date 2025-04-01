// src/pages/ai/SummaryTemplates.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tag,
  Popconfirm,
  Typography,
  Tabs,
  Divider,
  Tooltip,
  Radio,
  List,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  FormOutlined
} from '@ant-design/icons';
import { 
  fetchSummaryTemplates, 
  createSummaryTemplate, 
  updateSummaryTemplate, 
  deleteSummaryTemplate,
  testSummaryTemplate,
  fetchUserFeedback
} from '@/services/ai';
import HtmlContentViewer from '@/pages/rss/Feeds/components/HtmlContentViewer';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SummaryTemplates = () => {
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [contentTypes, setContentTypes] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    overview: {
      total_summaries: 0,
      positive_feedback: 0,
      negative_feedback: 0,
      average_rating: 0,
    },
    details: [],
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  useEffect(() => {
    fetchTemplates();
    
    // Mock content types for demo
    setContentTypes([
      { id: 1, name: 'News Articles' },
      { id: 2, name: 'Blog Posts' },
      { id: 3, name: 'Technical Documentation' },
      { id: 4, name: 'Product Reviews' },
      { id: 5, name: 'Scientific Papers' },
    ]);
  }, []);
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetchSummaryTemplates();
      if (response.code === 200) {
        setTemplates(response.data);
      } else {
        message.error('Failed to fetch summary templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('An error occurred while loading templates');
    } finally {
      setLoading(false);
    }
  };
  
  const showDrawer = (template = null) => {
    setEditingTemplate(template);
    if (template) {
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        content_type_id: template.content_type_id,
        template_content: template.template_content,
        css_styles: template.css_styles,
        show_original_link: template.show_original_link === 1,
        show_created_time: template.show_created_time === 1,
        show_content_type: template.show_content_type === 1,
        is_default: template.is_default === 1,
        status: template.status === 1,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        show_original_link: true,
        show_created_time: true,
        show_content_type: true,
        is_default: false,
        status: true,
      });
    }
    setDrawerVisible(true);
  };
  
  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingTemplate(null);
    form.resetFields();
  };
  
  const handleFormSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        status: values.status ? 1 : 0,
        show_original_link: values.show_original_link ? 1 : 0,
        show_created_time: values.show_created_time ? 1 : 0,
        show_content_type: values.show_content_type ? 1 : 0,
        is_default: values.is_default ? 1 : 0,
      };
      
      let response;
      if (editingTemplate) {
        response = await updateSummaryTemplate(editingTemplate.id, formattedValues);
      } else {
        response = await createSummaryTemplate(formattedValues);
      }
      
      if (response.code === 200) {
        message.success(`Template ${editingTemplate ? 'updated' : 'created'} successfully`);
        closeDrawer();
        fetchTemplates();
      } else {
        message.error(response.message || `Failed to ${editingTemplate ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error(`Error ${editingTemplate ? 'updating' : 'creating'} template:`, error);
      message.error(`An error occurred while ${editingTemplate ? 'updating' : 'creating'} the template`);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await deleteSummaryTemplate(id);
      if (response.code === 200) {
        message.success('Template deleted successfully');
        fetchTemplates();
      } else {
        message.error(response.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('An error occurred while deleting the template');
    }
  };
  
  const showPreview = (template) => {
    setPreviewTemplate(template);
    setPreviewVisible(true);
    setTestResult(null);
  };
  
  const handleTestTemplate = async () => {
    if (!previewTemplate) return;
    
    setTestLoading(true);
    try {
      const response = await testSummaryTemplate(previewTemplate.id);
      if (response.code === 200) {
        setTestResult(response.data);
        message.success('Test summary generated successfully');
      } else {
        message.error(response.message || 'Failed to generate test summary');
      }
    } catch (error) {
      console.error('Error testing template:', error);
      message.error('An error occurred while testing the template');
    } finally {
      setTestLoading(false);
    }
  };
  
  const loadFeedbackData = async (templateId) => {
    setFeedbackLoading(true);
    try {
      const response = await fetchUserFeedback(templateId);
      if (response.code === 200) {
        setFeedbackData(response.data);
      } else {
        message.error('Failed to load feedback data');
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      message.error('An error occurred while loading feedback data');
    } finally {
      setFeedbackLoading(false);
    }
  };
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {text}
          {record.is_default === 1 && (
            <Tag color="gold">Default</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Content Type',
      dataIndex: 'content_type_name',
      key: 'content_type_name',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Last Modified',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 1 ? 'success' : 'default'} 
          text={status === 1 ? 'Active' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showPreview(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Copy">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => {
                const newTemplate = {
                  ...record,
                  name: `${record.name} (Copy)`,
                  is_default: 0,
                };
                delete newTemplate.id;
                showDrawer(newTemplate);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this template?"
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
  
  return (
    <div>
      <Card 
        title="Summary Templates" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showDrawer()}
          >
            Add Template
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
        />
      </Card>
      
      <Drawer
        title={editingTemplate ? "Edit Summary Template" : "Create Summary Template"}
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
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter template name' }]}
          >
            <Input placeholder="Enter template name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={2} placeholder="Enter template description" />
          </Form.Item>
          
          <Form.Item
            name="content_type_id"
            label="Content Type"
            rules={[{ required: true, message: 'Please select content type' }]}
          >
            <Select placeholder="Select content type">
              {contentTypes.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="template_content"
            label={
              <Space>
                <span>Template Content</span>
                <Tooltip title="Use placeholders like {{title}}, {{summary}}, {{source}}, etc.">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Please enter template content' }]}
          >
            <TextArea
              rows={8}
              placeholder="Enter HTML template content with placeholders"
            />
          </Form.Item>
          
          <Form.Item
            name="css_styles"
            label="CSS Styles"
          >
            <TextArea
              rows={4}
              placeholder="Enter custom CSS styles"
            />
          </Form.Item>
          
          <Divider>Display Options</Divider>
          
          <Form.Item
            name="show_original_link"
            label="Show Original Link"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="show_created_time"
            label="Show Created Time"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="show_content_type"
            label="Show Content Type"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Divider>Settings</Divider>
          
          <Form.Item
            name="is_default"
            label="Default Template"
            valuePropName="checked"
            tooltip="Set as default template for this content type"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Drawer>
      
      <Drawer
        title={previewTemplate ? `Template Preview: ${previewTemplate.name}` : 'Template Preview'}
        width={800}
        onClose={() => setPreviewVisible(false)}
        open={previewVisible}
        extra={
          <Space>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={handleTestTemplate}
              loading={testLoading}
            >
              Test with Sample Content
            </Button>
          </Space>
        }
      >
        {previewTemplate && ( <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <span>
                  <FormOutlined />
                  Template Details
                </span>
              }
              key="1"
            >
              <div>
                <Title level={5}>Content Type</Title>
                <Paragraph>{previewTemplate.content_type_name}</Paragraph>
                
                <Title level={5}>Description</Title>
                <Paragraph>{previewTemplate.description || 'No description provided'}</Paragraph>
                
                <Divider />
                
                <Title level={5}>Template Content</Title>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  overflowX: 'auto'
                }}>
                  <pre style={{ margin: 0 }}>{previewTemplate.template_content}</pre>
                </div>
                
                {previewTemplate.css_styles && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>CSS Styles</Title>
                    <div style={{ 
                      background: '#f5f5f5', 
                      padding: 16, 
                      borderRadius: 4,
                      fontFamily: 'monospace',
                      overflowX: 'auto'
                    }}>
                      <pre style={{ margin: 0 }}>{previewTemplate.css_styles}</pre>
                    </div>
                  </>
                )}
                
                <Divider />
                
                <Title level={5}>Options</Title>
                <List size="small">
                  <List.Item>
                    <span>Show Original Link:</span>
                    <span>{previewTemplate.show_original_link === 1 ? 'Yes' : 'No'}</span>
                  </List.Item>
                  <List.Item>
                    <span>Show Created Time:</span>
                    <span>{previewTemplate.show_created_time === 1 ? 'Yes' : 'No'}</span>
                  </List.Item>
                  <List.Item>
                    <span>Show Content Type:</span>
                    <span>{previewTemplate.show_content_type === 1 ? 'Yes' : 'No'}</span>
                  </List.Item>
                  <List.Item>
                    <span>Default Template:</span>
                    <span>{previewTemplate.is_default === 1 ? 'Yes' : 'No'}</span>
                  </List.Item>
                </List>
              </div>
            </TabPane>
            
            <TabPane
              tab={
                <span>
                  <EyeOutlined />
                  Preview
                </span>
              }
              key="2"
            >
              {testResult ? (
                <div>
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: `
                        <style>${previewTemplate.css_styles || ''}</style>
                        ${testResult.rendered_content}
                      ` 
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <p style={{ marginTop: 16 }}>
                    Click "Test with Sample Content" to preview the template with sample data
                  </p>
                </div>
              )}
            </TabPane>
            
            <TabPane
              tab={
                <span>
                  <InfoCircleOutlined />
                  User Feedback
                </span>
              }
              key="3"
              onTabClick={() => loadFeedbackData(previewTemplate.id)}
            >
              {feedbackLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span>Loading feedback data...</span>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    marginBottom: 24,
                    textAlign: 'center' 
                  }}>
                    <div>
                      <Statistic 
                        title="Total Summaries" 
                        value={feedbackData.overview.total_summaries} 
                      />
                    </div>
                    <div>
                      <Statistic 
                        title="Positive Feedback" 
                        value={feedbackData.overview.positive_feedback} 
                        suffix={`(${Math.round(feedbackData.overview.positive_feedback / feedbackData.overview.total_summaries * 100) || 0}%)`}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </div>
                    <div>
                      <Statistic 
                        title="Negative Feedback" 
                        value={feedbackData.overview.negative_feedback} 
                        suffix={`(${Math.round(feedbackData.overview.negative_feedback / feedbackData.overview.total_summaries * 100) || 0}%)`}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </div>
                    <div>
                      <Statistic 
                        title="Average Rating" 
                        value={feedbackData.overview.average_rating} 
                        precision={1}
                        suffix="/5"
                      />
                    </div>
                  </div>
                  
                  <Divider>Recent Feedback</Divider>
                  
                  <List
                    itemLayout="horizontal"
                    dataSource={feedbackData.details}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <span>User {item.user_id}</span>
                              <Rate disabled defaultValue={item.rating} />
                              <Text type="secondary">{item.created_at}</Text>
                            </Space>
                          }
                          description={item.comment || 'No comment provided'}
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: 'No feedback received yet' }}
                  />
                </div>
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

// Fix for Rate and Statistic components which were used but not imported
import { Rate, Statistic } from 'antd';

export default SummaryTemplates;