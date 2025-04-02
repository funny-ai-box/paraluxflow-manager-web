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
  testSummaryTemplate  
} from '@/services/ai';

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


  useEffect(() => {
    fetchTemplates();
    
    // 模拟内容类型数据用于演示
    setContentTypes([
      { id: 1, name: '新闻文章' },
      { id: 2, name: '博客文章' },
      { id: 3, name: '技术文档' },
      { id: 4, name: '产品评论' },
      { id: 5, name: '科学论文' },
    ]);
  }, []);
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetchSummaryTemplates();
      if (response.code === 200) {
        setTemplates(response.data);
      } else {
        message.error('获取摘要模板失败');
      }
    } catch (error) {
      console.error('获取模板时出错:', error);
      message.error('加载模板时发生错误');
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
        message.success(`模板${editingTemplate ? '更新' : '创建'}成功`);
        closeDrawer();
        fetchTemplates();
      } else {
        message.error(response.message || `模板${editingTemplate ? '更新' : '创建'}失败`);
      }
    } catch (error) {
      console.error(`模板${editingTemplate ? '更新' : '创建'}时出错:`, error);
      message.error(`模板${editingTemplate ? '更新' : '创建'}时发生错误`);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await deleteSummaryTemplate(id);
      if (response.code === 200) {
        message.success('模板删除成功');
        fetchTemplates();
      } else {
        message.error(response.message || '删除模板失败');
      }
    } catch (error) {
      console.error('删除模板时出错:', error);
      message.error('删除模板时发生错误');
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
        message.success('测试摘要生成成功');
      } else {
        message.error(response.message || '生成测试摘要失败');
      }
    } catch (error) {
      console.error('测试模板时出错:', error);
      message.error('测试模板时发生错误');
    } finally {
      setTestLoading(false);
    }
  };
  

  
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {text}
          {record.is_default === 1 && (
            <Tag color="gold">默认</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '内容类型',
      dataIndex: 'content_type_name',
      key: 'content_type_name',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '最后修改时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 1 ? 'success' : 'default'} 
          text={status === 1 ? '启用' : '停用'} 
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="预览">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showPreview(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => {
                const newTemplate = {
                  ...record,
                  name: `${record.name} (复制)`,
                  is_default: 0,
                };
                delete newTemplate.id;
                showDrawer(newTemplate);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Tooltip title="删除">
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
        title="摘要模板" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showDrawer()}
          >
            添加模板
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
        title={editingTemplate ? "编辑摘要模板" : "创建摘要模板"}
        width={720}
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={closeDrawer}>
              取消
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingTemplate ? '更新' : '创建'}
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
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={2} placeholder="请输入模板描述" />
          </Form.Item>
          
          <Form.Item
            name="content_type_id"
            label="内容类型"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Select placeholder="请选择内容类型">
              {contentTypes.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="template_content"
            label={
              <Space>
                <span>模板内容</span>
                <Tooltip title="使用占位符如 {{title}}, {{summary}}, {{source}} 等">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <TextArea
              rows={8}
              placeholder="请输入包含占位符的 HTML 模板内容"
            />
          </Form.Item>
          
          <Form.Item
            name="css_styles"
            label="CSS 样式"
          >
            <TextArea
              rows={4}
              placeholder="请输入自定义 CSS 样式"
            />
          </Form.Item>
          
          <Divider>显示选项</Divider>
          
          <Form.Item
            name="show_original_link"
            label="显示原文链接"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="show_created_time"
            label="显示创建时间"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="show_content_type"
            label="显示内容类型"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Divider>设置</Divider>
          
          <Form.Item
            name="is_default"
            label="默认模板"
            valuePropName="checked"
            tooltip="设置为此内容类型的默认模板"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Drawer>
      
      <Drawer
        title={previewTemplate ? `模板预览: ${previewTemplate.name}` : '模板预览'}
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
              使用示例内容测试
            </Button>
          </Space>
        }
      >
        {previewTemplate && ( <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <span>
                  <FormOutlined />
                  模板详情
                </span>
              }
              key="1"
            >
              <div>
                <Title level={5}>内容类型</Title>
                <Paragraph>{previewTemplate.content_type_name}</Paragraph>
                
                <Title level={5}>描述</Title>
                <Paragraph>{previewTemplate.description || '未提供描述'}</Paragraph>
                
                <Divider />
                
                <Title level={5}>模板内容</Title>
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
                    <Title level={5} style={{ marginTop: 16 }}>CSS 样式</Title>
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
                
                <Title level={5}>选项</Title>
                <List size="small">
                  <List.Item>
                    <span>显示原文链接:</span>
                    <span>{previewTemplate.show_original_link === 1 ? '是' : '否'}</span>
                  </List.Item>
                  <List.Item>
                    <span>显示创建时间:</span>
                    <span>{previewTemplate.show_created_time === 1 ? '是' : '否'}</span>
                  </List.Item>
                  <List.Item>
                    <span>显示内容类型:</span>
                    <span>{previewTemplate.show_content_type === 1 ? '是' : '否'}</span>
                  </List.Item>
                  <List.Item>
                    <span>默认模板:</span>
                    <span>{previewTemplate.is_default === 1 ? '是' : '否'}</span>
                  </List.Item>
                </List>
              </div>
            </TabPane>
            
            <TabPane
              tab={
                <span>
                  <EyeOutlined />
                  预览
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
                    点击“使用示例内容测试”以使用示例数据预览模板
                  </p>
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