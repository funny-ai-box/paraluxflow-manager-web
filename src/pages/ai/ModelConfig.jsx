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
        message.error('获取 AI 模型失败');
      }
    } catch (error) {
      console.error('获取 AI 模型时出错:', error);
      message.error('加载 AI 模型时发生错误');
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
        message.error('获取内容类型失败');
      }
    } catch (error) {
      console.error('获取内容类型时出错:', error);
      message.error('加载内容类型时发生错误');
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
        message.success(`模型${editingModel ? '更新' : '创建'}成功`);
        closeDrawer();
        fetchModels();
      } else {
        message.error(response.message || `模型${editingModel ? '更新' : '创建'}失败`);
      }
    } catch (error) {
      console.error(`模型${editingModel ? '更新' : '创建'}时出错:`, error);
      message.error(`模型${editingModel ? '更新' : '创建'}时发生错误`);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await deleteAIModel(id);
      if (response.code === 200) {
        message.success('模型删除成功');
        fetchModels();
      } else {
        message.error(response.message || '删除模型失败');
      }
    } catch (error) {
      console.error('删除模型时出错:', error);
      message.error('删除模型时发生错误');
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
          message.success('内容类型映射更新成功');
          closeMappingDrawer();
          fetchContentTypesData();
        } else {
          message.error(response.message || '更新内容类型映射失败');
        }
      } catch (error) {
        console.error('更新内容类型映射时出错:', error);
        message.error('更新内容类型映射时发生错误');
      }
    };
    
    const modelColumns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '提供商',
        dataIndex: 'provider',
        key: 'provider',
        render: (text) => {
          const colorMap = {
            'OpenAI': '绿色',
            'Anthropic': '蓝色',
            'Google': '橙色',
            'Alibaba': '红色',
            'Hugging Face': '紫色',
            'Custom': '默认',
          };
          return <Tag color={colorMap[text] || '默认'}>{text}</Tag>;
        },
      },
      {
        title: '模型密钥',
        dataIndex: 'model_key',
        key: 'model_key',
      },
      {
        title: '最大令牌数',
        dataIndex: 'max_tokens',
        key: 'max_tokens',
      },
      {
        title: '温度',
        dataIndex: 'temperature',
        key: 'temperature',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 1 ? '绿色' : '红色'}>
            {status === 1 ? '启用' : '禁用'}
          </Tag>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showDrawer(record)}
            />
            <Popconfirm
              title="确定要删除此模型吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="是"
              cancelText="否"
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
        title: '内容类型',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: '分配的模型',
        dataIndex: 'model_name',
        key: 'model_name',
        render: (text) => text || <Text type="secondary">未分配</Text>,
      },
      {
        title: '摘要策略',
        dataIndex: 'summarization_strategy',
        key: 'summarization_strategy',
        render: (text) => {
          const strategyMap = {
            'extractive': { color: '蓝色', text: '抽取式' },
            'abstractive': { color: '绿色', text: '生成式' },
            'hybrid': { color: '紫色', text: '混合式' },
          };
          const { color, text: displayText } = strategyMap[text] || { color: '默认', text: text || '未设置' };
          return <Tag color={color}>{displayText}</Tag>;
        },
      },
      {
        title: '最大长度',
        dataIndex: 'max_summary_length',
        key: 'max_summary_length',
        render: (text) => text || '-',
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Button
            icon={<SettingOutlined />}
            size="small"
            onClick={() => showMappingDrawer(record)}
          >
            配置
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
                AI 模型
              </span>
            } 
            key="1"
          >
            <Card 
              title="AI 模型配置" 
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => showDrawer()}
                >
                  添加模型
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
                内容类型映射
              </span>
            } 
            key="2"
          >
            <Card 
              title="内容类型模型映射" 
              extra={
                <Button 
                  icon={<SyncOutlined />} 
                  onClick={fetchContentTypesData}
                >
                  刷新
                </Button>
              }
            >
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                配置每种内容类型由哪个 AI 模型处理以及摘要的具体参数。
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
          title={editingModel ? "编辑 AI 模型" : "添加 AI 模型"}
          width={600}
          onClose={closeDrawer}
          open={drawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={closeDrawer}>
                取消
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                {editingModel ? '更新' : '创建'}
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
                  label="模型名称"
                  rules={[{ required: true, message: '请输入模型名称' }]}
                >
                  <Input placeholder="输入模型名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="provider"
                  label="提供商"
                  rules={[{ required: true, message: '请选择提供商' }]}
                >
                  <Select placeholder="选择提供商">
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
                  label="模型密钥"
                  rules={[{ required: true, message: '请输入模型密钥' }]}
                  tooltip="此模型在提供商 API 中的标识符（例如，gpt-4，claude-2）"
                >
                  <Input placeholder="输入模型密钥" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="api_endpoint"
                  label="API 地址"
                  rules={[{ required: true, message: '请输入 API 地址' }]}
                >
                  <Input placeholder="输入 API 地址" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="api_key"
              label="API 密钥"
              tooltip={editingModel ? "留空以保持当前 API 密钥" : ""}
              rules={[{ required: !editingModel, message: '请输入 API 密钥' }]}
            >
              <Input.Password placeholder={editingModel ? "输入以更改 API 密钥" : "输入 API 密钥"} />
            </Form.Item>
            
            <Divider>模型参数</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="max_tokens"
                  label="最大令牌数"
                  rules={[{ required: true, message: '请输入最大令牌数' }]}
                >
                  <InputNumber min={1} max={100000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="temperature"
                  label="温度"
                  rules={[{ required: true, message: '请输入温度值' }]}
                >
                  <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="top_p"
                  label="Top P"
                  rules={[{ required: true, message: '请输入 Top P 值' }]}
                >
                  <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="system_prompt"
              label="默认系统提示"
              tooltip="为所有请求提供给模型的基本指令"
            >
              <TextArea rows={4} placeholder="输入默认系统提示" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="supports_streaming"
                  label="支持流式传输"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={3} placeholder="输入模型描述" />
            </Form.Item>
          </Form>
        </Drawer>
        
        <Drawer
          title="配置内容类型处理"
          width={600}
          onClose={closeMappingDrawer}
          open={mappingDrawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={closeMappingDrawer}>
                取消
              </Button>
              <Button type="primary" onClick={() => mappingForm.submit()}>
                保存
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
                label="AI 模型"
                rules={[{ required: true, message: '请选择 AI 模型' }]}
              >
                <Select placeholder="选择 AI 模型">
                  {models.map(model => (
                    <Option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="summarization_strategy"
                label="摘要策略"
                rules={[{ required: true, message: '请选择摘要策略' }]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="extractive">
                      <Space>
                        <span>抽取式</span>
                        <Text type="secondary">从原文中提取关键句</Text>
                      </Space>
                    </Radio>
                    <Radio value="abstractive">
                      <Space>
                        <span>生成式</span>
                        <Text type="secondary">生成捕捉含义的新文本</Text>
                      </Space>
                    </Radio>
                    <Radio value="hybrid">
                      <Space>
                        <span>混合式</span>
                        <Text type="secondary">结合抽取式和生成式方法</Text>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="max_summary_length"
                    label="最大摘要长度"
                    rules={[{ required: true, message: '请输入最大摘要长度' }]}
                    tooltip="生成摘要的最大字数"
                  >
                    <InputNumber min={50} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="include_images"
                    label="包含图片"
                    valuePropName="checked"
                    tooltip="是否在摘要中包含原始内容中的图片"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="include_links"
                label="包含链接"
                valuePropName="checked"
                tooltip="是否在摘要中包含原始内容中的超链接"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="custom_prompt"
                label="自定义提示模板"
                tooltip="此内容类型的自定义指令（覆盖默认系统提示）"
              >
                <TextArea 
                  rows={4} 
                  placeholder="输入自定义提示模板"
                />
              </Form.Item>
              
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  使用 {'{content}'} 占位符表示原始内容在提示中的插入位置。
                </Text>
              </div>
            </Form>
          )}
        </Drawer>
      </div>
    );
  };
  
  export default ModelConfig;