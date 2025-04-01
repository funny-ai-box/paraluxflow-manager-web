// src/pages/templates/TemplateForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Select,
  Switch,
  message,
  Divider,
  Tabs,
  Upload,
  Typography
} from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { 
  fetchTemplateDetail,
  createTemplate,
  updateTemplate,
  testTemplateScript
} from '@/services/template';
import HtmlContentViewer from '@/pages/rss/Feeds/components/HtmlContentViewer';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const defaultScript = `
import re
from bs4 import BeautifulSoup

def process_data(raw_html, params):
    html_content = ""
    text_content = ""
    
    # Parse the HTML content
    soup = BeautifulSoup(raw_html, 'html.parser')
    
    # Extract content based on the template logic
    # You can use params dictionary for template-specific parameters
    
    # Example: Extract main content div
    main_content = soup.find('div', {'class': 'main-content'})
    if main_content:
        html_content = str(main_content)
        text_content = main_content.get_text(separator='\\n').strip()
    
    return html_content, text_content
`;

const TemplateForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [script, setScript] = useState(defaultScript);
  const [fileList, setFileList] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  
  useEffect(() => {
    if (isEdit) {
      fetchTemplateData();
    }
  }, [id]);
  
  const fetchTemplateData = async () => {
    setLoading(true);
    try {
      const response = await fetchTemplateDetail(id);
      if (response.code === 200) {
        const data = response.data;
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          type: data.type,
          status: data.status === 1,
          parameters: data.parameters || [],
        });
        setScript(data.script || defaultScript);
      } else {
        message.error('Failed to load template details');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      message.error('An error occurred while loading the template');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Transform parameters into required format
      const transformedValues = {
        ...values,
        status: values.status ? 1 : 0,
        script: script,
        parameters: values.parameters || [],
      };
      
      let response;
      if (isEdit) {
        response = await updateTemplate(id, transformedValues);
      } else {
        response = await createTemplate(transformedValues);
      }
      
      if (response.code === 200) {
        message.success(`Template ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/templates');
      } else {
        message.error(response.message || `Failed to ${isEdit ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} template:`, error);
      message.error(`An error occurred while ${isEdit ? 'updating' : 'creating'} the template`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestScript = async () => {
    if (!fileList.length) {
      message.warning('Please upload a test HTML file first');
      return;
    }
    
    setTestLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('script', script);
      formData.append('file', fileList[0].originFileObj);
      
      // Get parameters from form
      const params = form.getFieldValue('parameters') || [];
      formData.append('parameters', JSON.stringify(params));
      
      const response = await testTemplateScript(formData);
      
      if (response.code === 200) {
        setTestResults(response.data);
        message.success('Test completed successfully');
      } else {
        message.error(response.message || 'Test failed');
      }
    } catch (error) {
      console.error('Error testing script:', error);
      message.error('An error occurred during testing');
    } finally {
      setTestLoading(false);
    }
  };
  
  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Only allow HTML files
      const isHTML = file.type === 'text/html' || file.name.endsWith('.html');
      if (!isHTML) {
        message.error('You can only upload HTML files!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    fileList,
  };
  
  return (
    <Card
      title={
        <Title level={4}>{isEdit ? 'Edit Template' : 'Create Template'}</Title>
      }
      bordered={false}
      loading={loading}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: '1',
            label: 'Basic Info',
            children: (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  status: true,
                  type: 1,
                  parameters: [{ name: '', description: '', required: true }],
                }}
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
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea
                    placeholder="Enter template description"
                    rows={4}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
                
                <Form.Item
                  name="type"
                  label="Template Type"
                  rules={[{ required: true, message: 'Please select template type' }]}
                >
                  <Select placeholder="Select template type">
                    <Select.Option value={1}>RSS</Select.Option>
                    <Select.Option value={2}>WeChat</Select.Option>
                    <Select.Option value={3}>Website</Select.Option>
                    <Select.Option value={4}>API</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="status"
                  label="Status"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
                
                <Divider orientation="left">Template Parameters</Divider>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Define the parameters required when using this template
                </Text>
                
                <Form.List name="parameters">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space 
                          key={key} 
                          style={{ display: 'flex', marginBottom: 8 }} 
                          align="baseline"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            rules={[{ required: true, message: 'Parameter name required' }]}
                          >
                            <Input placeholder="Parameter Name" style={{ width: 200 }} />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                          >
                            <Input placeholder="Description" style={{ width: 320 }} />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'required']}
                            valuePropName="checked"
                            initialValue={true}
                          >
                            <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                          </Form.Item>
                          
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      
                      <Form.Item>
                        <Button 
                          type="dashed" 
                          onClick={() => add()} 
                          block 
                          icon={<PlusOutlined />}
                        >
                          Add Parameter
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {isEdit ? 'Update Template' : 'Create Template'}
                    </Button>
                    <Button onClick={() => navigate('/templates')}>Cancel</Button>
                  </Space>
                </Form.Item>
              </Form>
            )
          },
          {
            key: '2',
            label: 'Script Editor',
            children: (
              <>
                <Card
                  bordered={false}
                  title="Template Script"
                  extra={
                    <Button type="primary" onClick={() => setActiveTab('3')}>
                      Test Script
                    </Button>
                  }
                >
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Write a script to process content for this template. The script should define a 
                    'process_data' function that receives raw_html and params arguments.
                  </Text>
                  
                  <div style={{ border: '1px solid #d9d9d9', borderRadius: 2 }}>
                    <Editor
                      height="500px"
                      language="python"
                      value={script}
                      onChange={setScript}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                  
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Space>
                      <Button onClick={() => setActiveTab('1')}>Previous</Button>
                      <Button type="primary" onClick={() => setActiveTab('3')}>Next</Button>
                    </Space>
                  </div>
                </Card>
              </>
            )
          },
          {
            key: '3',
            label: 'Test Template',
            children: (
              <Card bordered={false} title="Test Template Processing">
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Upload an HTML file to test how your template script processes the content
                </Text>
                
                <div style={{ marginBottom: 16 }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Test HTML File</Button>
                  </Upload>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    onClick={handleTestScript} 
                    loading={testLoading}
                    disabled={fileList.length === 0}
                  >
                    Run Test
                  </Button>
                </div>
                
                {testResults && (
                  <div style={{ marginTop: 24 }}>
                    <Divider orientation="left">Test Results</Divider>
                    
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="HTML Content" key="1">
                        <div style={{ border: '1px solid #d9d9d9', padding: 16, borderRadius: 2 }}>
                          <HtmlContentViewer htmlContent={testResults.html_content} />
                        </div>
                      </TabPane>
                      <TabPane tab="Text Content" key="2">
                        <div
                          style={{
                            border: '1px solid #d9d9d9',
                            padding: 16,
                            borderRadius: 2,
                            maxHeight: '500px',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                          }}
                        >
                          {testResults.text_content}
                        </div>
                      </TabPane>
                    </Tabs>
                  </div>
                )}
                
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => setActiveTab('2')}>Previous</Button>
                    <Button type="primary" onClick={handleSubmit} loading={loading}>
                      {isEdit ? 'Update Template' : 'Create Template'}
                    </Button>
                  </Space>
                </div>
              </Card>
            )
          }
        ]}
      />
    </Card>
  );
};

export default TemplateForm;