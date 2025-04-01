// src/pages/ai/ModelConfig.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Button,
  Space,
  Select,
  InputNumber,
  Switch,
  message,
  Tabs,
  Typography,
  Popconfirm,
  Tooltip,
  Tag,
  Drawer,
  Radio,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  SyncOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { 
  fetchAIModels, 
  updateAIModel, 
  createAIModel, 
  deleteAIModel,
  fetchContentTypes,
  updateContentTypeModelMapping
} from '@/services/ai';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;

const ModelConfig = () => {
  const [form] = Form.useForm();
  const [mappingForm] = Form.useForm();
  const [models, setModels] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [mappingDrawerVisible, setMappingDrawerVisible] = useState(false);
  const [editingContentType, setEditingContentType] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  
  useEffect(() => {
    fetchModels();
    fetchContentTypesData();
  }, []);
  
  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetchAIModels();
      if (response.code === 200) {
        setModels(response.data);
      } else {
        message.error('Failed to fetch AI models');
      }
    } catch (error) {
      console.error('Error fetching AI models:', error);
      message.error('An error occurred while loading AI models');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchContentTypesData = async () => {
    try {
      const response = await fetchContentTypes();
      if (response.code === 200) {
        setContentTypes(response.data);
      } else {
        message.error('Failed to fetch content types');
      }
    } catch (error) {
      console.error('Error fetching content types:', error);
      message.error('An error occurred while loading content types');
    }
  };
  
  const showDrawer = (model = null) => {
    setEditingModel(model);
    if (model) {
      form.setFieldsValue({
        name: model.name,
        provider: model.provider,
        model_key: model.model_key,
        api_endpoint: model.api_endpoint,
        supports_streaming: model.supports_streaming === 1,
        max_tokens: model.max_tokens,
        temperature: model.temperature,
        top_p: model.top_p,
        system_prompt: model.system_prompt,
        description: model.description,
        status: model.status === 1,
        api_key: '',  // Security: never set the API key in the form
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        supports_streaming: false,
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 1000,
        status: true,
      });
    }
    setDrawerVisible(true);
  };
  
  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingModel(null);
    form.resetFields();
  };
  
  const handleFormSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        status: values.status ? 1 : 0,
        supports_streaming: values.supports_streaming ? 1 : 0,
      };
      
      let response;
      if (editingModel) {
        response = await updateAIModel(editingModel.id, formattedValues);
      } else {
        response = await createAIModel(formattedValues);
      }
      
      if (response.code === 200) {
        message.success(`Model ${editingModel ? 'updated' : 'created'} successfully`);
        closeDrawer();
        fetchModels();
      } else {
        message.error(response.message || `Failed to ${editingModel ? 'update' : 'create'} model`);
      }
    } catch (error) {
      console.error(`Error ${editingModel ? 'updating' : 'creating'} model:`, error);
      message.error(`An error occurred while ${editingModel ? 'updating' : 'creating'} the model`);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await deleteAIModel(id);
      if (response.code === 200) {
        message.success('Model deleted successfully');
        fetchModels();
      } else {
        message.error(response.message || 'Failed to delete model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      message.error('An error occurred while deleting the model');
    }
  };
  
  const showMappingDrawer = (contentType) => {
    setEditingContentType(contentType);
    mappingForm.setFieldsValue({
      content_type_id: contentType.id,
      model_id: contentType.model_id,
      summarization_strategy: contentType.summarization_strategy || 'extractive',
      max_summary_length: contentType.max_summary_length || 300,
      include_images: contentType.include_images === 1,
      include_links: contentType.include_links === 1,
      custom_prompt: contentType.custom_prompt || '',
    });
    setMappingDrawerVisible(true);
  };
  
  const closeMappingDrawer = () => {
    setMappingDrawerVisible(false);
    setEditingContentType(null);
    mappingForm.resetFields();
  };
  
  // src/pages/ai/ModelConfig.jsx (Continued)

  const handleMappingSubmit = async (values) => {
      try {
        const formattedValues = {
          ...values,
          include_images: values.include_images ? 1 : 0,
          include_links: values.include_links ? 1 : 0,
        };
        
        const response = await updateContentTypeModelMapping(values.content_type_id, formattedValues);
        
        if (response.code === 200) {
          message.success('Content type mapping updated successfully');
          closeMappingDrawer();
          fetchContentTypesData();
        } else {
          message.error(response.message || 'Failed to update content type mapping');
        }
      } catch (error) {
        console.error('Error updating content type mapping:', error);
        message.error('An error occurred while updating the content type mapping');
      }
    };
    
    const modelColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Provider',
        dataIndex: 'provider',
        key: 'provider',
        render: (text) => {
          const colorMap = {
            'OpenAI': 'green',
            'Anthropic': 'blue',
            'Google': 'orange',
            'Alibaba': 'red',
            'Hugging Face': 'purple',
            'Custom': 'default',
          };
          return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
        },
      },
      {
        title: 'Model Key',
        dataIndex: 'model_key',
        key: 'model_key',
      },
      {
        title: 'Max Tokens',
        dataIndex: 'max_tokens',
        key: 'max_tokens',
      },
      {
        title: 'Temperature',
        dataIndex: 'temperature',
        key: 'temperature',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 1 ? 'green' : 'red'}>
            {status === 1 ? 'Active' : 'Inactive'}
          </Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showDrawer(record)}
            />
            <Popconfirm
              title="Are you sure you want to delete this model?"
              onConfirm={() => handleDelete(record.id)}
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
    
    const contentTypeColumns = [
      {
        title: 'Content Type',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: 'Assigned Model',
        dataIndex: 'model_name',
        key: 'model_name',
        render: (text) => text || <Text type="secondary">Not assigned</Text>,
      },
      {
        title: 'Summary Strategy',
        dataIndex: 'summarization_strategy',
        key: 'summarization_strategy',
        render: (text) => {
          const strategyMap = {
            'extractive': { color: 'blue', text: 'Extractive' },
            'abstractive': { color: 'green', text: 'Abstractive' },
            'hybrid': { color: 'purple', text: 'Hybrid' },
          };
          const { color, text: displayText } = strategyMap[text] || { color: 'default', text: text || 'Not set' };
          return <Tag color={color}>{displayText}</Tag>;
        },
      },
      {
        title: 'Max Length',
        dataIndex: 'max_summary_length',
        key: 'max_summary_length',
        render: (text) => text || '-',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Button
            icon={<SettingOutlined />}
            size="small"
            onClick={() => showMappingDrawer(record)}
          >
            Configure
          </Button>
        ),
      },
    ];
    
    return (
      <div>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <ApiOutlined />
                AI Models
              </span>
            } 
            key="1"
          >
            <Card 
              title="AI Model Configuration" 
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => showDrawer()}
                >
                  Add Model
                </Button>
              }
            >
              <Table
                columns={modelColumns}
                dataSource={models}
                rowKey="id"
                loading={loading}
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Content Type Mapping
              </span>
            } 
            key="2"
          >
            <Card 
              title="Content Type Model Mapping" 
              extra={
                <Button 
                  icon={<SyncOutlined />} 
                  onClick={fetchContentTypesData}
                >
                  Refresh
                </Button>
              }
            >
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                Configure which AI model processes each content type and the specific parameters for summarization.
              </Text>
              
              <Table
                columns={contentTypeColumns}
                dataSource={contentTypes}
                rowKey="id"
                loading={loading}
              />
            </Card>
          </TabPane>
        </Tabs>
        
        <Drawer
          title={editingModel ? "Edit AI Model" : "Add AI Model"}
          width={600}
          onClose={closeDrawer}
          open={drawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={closeDrawer}>
                Cancel
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                {editingModel ? 'Update' : 'Create'}
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
                  label="Model Name"
                  rules={[{ required: true, message: 'Please enter model name' }]}
                >
                  <Input placeholder="Enter model name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="provider"
                  label="Provider"
                  rules={[{ required: true, message: 'Please select provider' }]}
                >
                  <Select placeholder="Select provider">
                    <Option value="OpenAI">OpenAI</Option>
                    <Option value="Anthropic">Anthropic</Option>
                    <Option value="Google">Google</Option>
                    <Option value="Alibaba">Alibaba</Option>
                    <Option value="Hugging Face">Hugging Face</Option>
                    <Option value="Custom">Custom</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="model_key"
                  label="Model Key"
                  rules={[{ required: true, message: 'Please enter model key' }]}
                  tooltip="The identifier for this model in the provider's API (e.g., gpt-4, claude-2)"
                >
                  <Input placeholder="Enter model key" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="api_endpoint"
                  label="API Endpoint"
                  rules={[{ required: true, message: 'Please enter API endpoint' }]}
                >
                  <Input placeholder="Enter API endpoint URL" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="api_key"
              label="API Key"
              tooltip={editingModel ? "Leave blank to keep the current API key" : ""}
              rules={[{ required: !editingModel, message: 'Please enter API key' }]}
            >
              <Input.Password placeholder={editingModel ? "Enter to change API key" : "Enter API key"} />
            </Form.Item>
            
            <Divider>Model Parameters</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="max_tokens"
                  label="Max Tokens"
                  rules={[{ required: true, message: 'Please enter max tokens' }]}
                >
                  <InputNumber min={1} max={100000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="temperature"
                  label="Temperature"
                  rules={[{ required: true, message: 'Please enter temperature' }]}
                >
                  <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="top_p"
                  label="Top P"
                  rules={[{ required: true, message: 'Please enter top p value' }]}
                >
                  <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="system_prompt"
              label="Default System Prompt"
              tooltip="Base instructions given to the model for all requests"
            >
              <TextArea rows={4} placeholder="Enter default system prompt" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="supports_streaming"
                  label="Supports Streaming"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
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
              <TextArea rows={3} placeholder="Enter model description" />
            </Form.Item>
          </Form>
        </Drawer>
        
        <Drawer
          title="Configure Content Type Processing"
          width={600}
          onClose={closeMappingDrawer}
          open={mappingDrawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={closeMappingDrawer}>
                Cancel
              </Button>
              <Button type="primary" onClick={() => mappingForm.submit()}>
                Save
              </Button>
            </div>
          }
        >
          {editingContentType && (
            <Form 
              form={mappingForm} 
              layout="vertical" 
              onFinish={handleMappingSubmit}
            >
              <Form.Item name="content_type_id" hidden>
                <Input />
              </Form.Item>
              
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>{editingContentType.name}</Title>
                <Text type="secondary">{editingContentType.description}</Text>
              </div>
              
              <Form.Item
                name="model_id"
                label="AI Model"
                rules={[{ required: true, message: 'Please select an AI model' }]}
              >
                <Select placeholder="Select AI model">
                  {models.map(model => (
                    <Option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="summarization_strategy"
                label="Summarization Strategy"
                rules={[{ required: true, message: 'Please select a summarization strategy' }]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="extractive">
                      <Space>
                        <span>Extractive</span>
                        <Text type="secondary">Extract key sentences from original text</Text>
                      </Space>
                    </Radio>
                    <Radio value="abstractive">
                      <Space>
                        <span>Abstractive</span>
                        <Text type="secondary">Generate new text that captures the meaning</Text>
                      </Space>
                    </Radio>
                    <Radio value="hybrid">
                      <Space>
                        <span>Hybrid</span>
                        <Text type="secondary">Combine extractive and abstractive approaches</Text>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="max_summary_length"
                    label="Max Summary Length"
                    rules={[{ required: true, message: 'Please enter maximum summary length' }]}
                    tooltip="Maximum number of words in the generated summary"
                  >
                    <InputNumber min={50} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="include_images"
                    label="Include Images"
                    valuePropName="checked"
                    tooltip="Whether to include images from the original content in the summary"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="include_links"
                label="Include Links"
                valuePropName="checked"
                tooltip="Whether to include hyperlinks from the original content in the summary"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="custom_prompt"
                label="Custom Prompt Template"
                tooltip="Custom instructions for this content type (overrides the default system prompt)"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Enter custom prompt template for this content type"
                />
              </Form.Item>
              
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Use {'{content}'} placeholder to indicate where the original content should be inserted in the prompt.
                </Text>
              </div>
            </Form>
          )}
        </Drawer>
      </div>
    );
  };
  
  export default ModelConfig;