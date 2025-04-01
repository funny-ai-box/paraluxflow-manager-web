// src/pages/templates/Detail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Tag, 
  message, 
  Table, 
  Typography, 
  Tabs, 
  Empty, 
  Space,
  Statistic,
  Row,
  Col,
  Skeleton
} from 'antd';
import { 
  EditOutlined, 
  CodeOutlined, 
  FileTextOutlined, 
  PlusOutlined, 
  ExportOutlined 
} from '@ant-design/icons';
import { fetchTemplateDetail, fetchTemplateUsage } from '@/services/template';
import Editor from '@monaco-editor/react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ sources: [], stats: {} });
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch template details
      const detailResponse = await fetchTemplateDetail(id);
      if (detailResponse.code === 200) {
        setTemplate(detailResponse.data);
      } else {
        message.error('Failed to fetch template details');
      }
      
      // Fetch template usage data
      const usageResponse = await fetchTemplateUsage(id);
      if (usageResponse.code === 200) {
        setUsage(usageResponse.data);
      }
    } catch (error) {
      console.error('Error fetching template data:', error);
      message.error('An error occurred while loading template data');
    } finally {
      setLoading(false);
    }
  };
  
  const parameterColumns = [
    {
      title: 'Parameter Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      render: (required) => (
        <Tag color={required ? 'blue' : 'green'}>
          {required ? 'Required' : 'Optional'}
        </Tag>
      ),
    },
  ];
  
  const sourceColumns = [
    {
      title: 'Source ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
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
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => navigate(`/rss-manager/feeds/detail/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];
  
  if (loading) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }
  
  if (!template) {
    return (
      <Card>
        <Empty description="Template not found" />
      </Card>
    );
  }
  
  const typeMap = {
    1: { color: 'blue', text: 'RSS' },
    2: { color: 'green', text: 'WeChat' },
    3: { color: 'orange', text: 'Website' },
    4: { color: 'purple', text: 'API' },
  };
  
  return (
    <>
      <Card
        title={<Title level={4}>{template.name}</Title>}
        extra={
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/templates/edit/${id}`)}
            >
              Edit
            </Button>
            <Button 
              icon={<CodeOutlined />} 
              onClick={() => navigate(`/templates/script/${id}`)}
            >
              Edit Script
            </Button>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/rss-manager/feeds/create', { state: { templateId: id } })}
            >
              Create Source
            </Button>
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic 
              title="Sources Using Template" 
              value={usage.stats.source_count || 0} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Articles Processed" 
              value={usage.stats.article_count || 0} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Success Rate" 
              value={usage.stats.success_rate || 0} 
              suffix="%" 
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Average Processing Time" 
              value={usage.stats.avg_processing_time || 0} 
              suffix="ms" 
            />
          </Col>
        </Row>
        
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{template.id}</Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color={typeMap[template.type]?.color}>
              {typeMap[template.type]?.text || 'Unknown'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {template.description}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={template.status === 1 ? 'green' : 'red'}>
              {template.status === 1 ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {template.created_at}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {template.updated_at}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Parameters
              </span>
            } 
            key="1"
          >
            {template.parameters && template.parameters.length > 0 ? (
              <Table 
                dataSource={template.parameters} 
                columns={parameterColumns} 
                rowKey="name"
                pagination={false}
              />
            ) : (
              <Empty description="No parameters defined" />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CodeOutlined />
                Script
              </span>
            } 
            key="2"
          >
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 2 }}>
              <Editor
                height="400px"
                language="python"
                value={template.script || '# No script available'}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ExportOutlined />
                Sources Using Template
              </span>
            } 
            key="3"
          >
            {usage.sources && usage.sources.length > 0 ? (
              <Table 
                dataSource={usage.sources} 
                columns={sourceColumns} 
                rowKey="id"
              />
            ) : (
              <Empty description="No sources are using this template yet" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default TemplateDetail;