// src/pages/templates/ScriptEditor.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  message, 
  Upload, 
  Space, 
  Tabs, 
  Typography,
  Divider,
  Spin,
  Modal
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  RollbackOutlined, 
  ExperimentOutlined 
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { 
  fetchTemplateScript, 
  updateTemplateScript, 
  testTemplateScript 
} from '@/services/template';
import HtmlContentViewer from '@/pages/rss/Feeds/components/HtmlContentViewer';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const ScriptEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [script, setScript] = useState('');
  const [originalScript, setOriginalScript] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    fetchScript();
  }, [id]);
  
  const fetchScript = async () => {
    setLoading(true);
    try {
      const response = await fetchTemplateScript(id);
      if (response.code === 200) {
        setScript(response.data.script);
        setOriginalScript(response.data.script);
        setTemplateName(response.data.name);
      } else {
        message.error('Failed to fetch template script');
      }
    } catch (error) {
      console.error('Error fetching script:', error);
      message.error('An error occurred while loading the script');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveScript = async () => {
    setSaving(true);
    try {
      const response = await updateTemplateScript(id, { script });
      if (response.code === 200) {
        message.success('Script saved successfully');
        setOriginalScript(script);
        setHasChanges(false);
      } else {
        message.error('Failed to save script');
      }
    } catch (error) {
      console.error('Error saving script:', error);
      message.error('An error occurred while saving the script');
    } finally {
      setSaving(false);
    }
  };
  
  const handleScriptChange = (value) => {
    setScript(value);
    setHasChanges(value !== originalScript);
  };
  
  const handleTestScript = async () => {
    if (!fileList.length) {
      message.warning('Please upload a test HTML file first');
      return;
    }
    
    setTesting(true);
    
    try {
      const formData = new FormData();
      formData.append('script', script);
      formData.append('file', fileList[0].originFileObj);
      formData.append('template_id', id);
      
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
      setTesting(false);
    }
  };
  
  const handleLeave = () => {
    if (hasChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes that will be lost. Do you want to save before leaving?',
        okText: 'Save & Leave',
        cancelText: 'Leave Without Saving',
        onOk: async () => {
          await handleSaveScript();
          navigate(`/templates/detail/${id}`);
        },
        onCancel: () => {
          navigate(`/templates/detail/${id}`);
        },
      });
    } else {
      navigate(`/templates/detail/${id}`);
    }
  };
  
  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isHTML = file.type === 'text/html' || file.name.endsWith('.html');
      if (!isHTML) {
        message.error('You can only upload HTML files!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false;
    },
    fileList,
  };
  
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading script...</div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      title={
        <Space>
          <Title level={4}>Script Editor</Title>
          <Text type="secondary">Template: {templateName}</Text>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<RollbackOutlined />} 
            onClick={handleLeave}
          >
            Back to Details
          </Button>
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveScript}
            loading={saving}
            disabled={!hasChanges}
          >
            Save Script
          </Button>
        </Space>
      }
    >
      <Tabs defaultActiveKey="1">
        <TabPane 
          tab="Script Editor" 
          key="1"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Edit the content processing script for this template. The script should define a 
            'process_data' function that receives raw_html and params arguments.
          </Text>
          
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 2 }}>
            <Editor
              height="600px"
              language="python"
              value={script}
              onChange={handleScriptChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
              }}
            />
          </div>
        </TabPane>
        
        <TabPane 
          tab="Test Script" 
          key="2"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Upload an HTML file to test how your script processes the content
          </Text>
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Test HTML File</Button>
              </Upload>
              
              <Button 
                type="primary" 
                icon={<ExperimentOutlined />}
                onClick={handleTestScript} 
                loading={testing}
                disabled={fileList.length === 0}
              >
                Run Test
              </Button>
            </Space>
            
            {testResults && (
              <>
                <Divider orientation="left">Test Results</Divider>
                
                <Tabs defaultActiveKey="1">
                  <TabPane tab="HTML Content" key="1">
                    <Card title="Processed HTML Content" bordered={false}>
                      <HtmlContentViewer htmlContent={testResults.html_content} />
                    </Card>
                  </TabPane>
                  
                  <TabPane tab="Text Content" key="2">
                    <Card 
                      title="Extracted Text Content" 
                      bordered={false}
                      bodyStyle={{
                        maxHeight: '500px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                      }}
                    >
                      {testResults.text_content}
                    </Card>
                  </TabPane>
                  
                  {testResults.execution_time && (
                    <TabPane tab="Performance" key="3">
                      <Card title="Execution Information" bordered={false}>
                        <Text>Execution Time: {testResults.execution_time} ms</Text>
                        {testResults.memory_usage && (
                          <div>Memory Usage: {testResults.memory_usage} MB</div>
                        )}
                      </Card>
                    </TabPane>
                  )}
                </Tabs>
              </>
            )}
          </Space>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ScriptEditor;