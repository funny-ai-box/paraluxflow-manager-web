// src/pages/templates/index.jsx
import { useState, useEffect } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Button, Tag, message, Tooltip, Space } from 'antd';
import { EyeOutlined, EditOutlined, PlusOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchTemplates, updateTemplateStatus } from '@/services/template';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async (params = {}) => {
    setLoading(true);
    try {
      const response = await fetchTemplates(params);
      if (response.code === 200) {
        setTemplates(response.data);
      } else {
        message.error(response.message || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('An error occurred while loading templates');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await updateTemplateStatus({
        template_id: id,
        status: status ? 1 : 0
      });
      
      if (response.code === 200) {
        message.success('Template status updated successfully');
        loadTemplates();
      } else {
        message.error(response.message || 'Failed to update template status');
      }
    } catch (error) {
      console.error('Error updating template status:', error);
      message.error('An error occurred while updating template status');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 180,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 120,
      valueEnum: {
        1: { text: 'RSS', status: 'Default' },
        2: { text: 'WeChat', status: 'Processing' },
        3: { text: 'Website', status: 'Success' },
        4: { text: 'API', status: 'Warning' },
      },
      render: (_, record) => {
        const typeMap = {
          1: { color: 'blue', text: 'RSS' },
          2: { color: 'green', text: 'WeChat' },
          3: { color: 'orange', text: 'Website' },
          4: { color: 'purple', text: 'API' },
        };
        const { color, text } = typeMap[record.type] || { color: 'default', text: 'Unknown' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Parameter Count',
      dataIndex: 'param_count',
      width: 140,
      search: false,
      render: (text) => text || 0,
    },
    {
      title: 'Source Count',
      dataIndex: 'source_count',
      width: 140,
      search: false,
      render: (text) => text || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        0: { text: 'Inactive', status: 'Default' },
        1: { text: 'Active', status: 'Success' },
      },
      render: (_, record) => {
        const statusMap = {
          0: { color: 'default', text: 'Inactive' },
          1: { color: 'success', text: 'Active' },
        };
        const { color, text } = statusMap[record.status] || { color: 'default', text: 'Unknown' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: 'Actions',
      width: 180,
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="View Details" key="view">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/templates/detail/${record.id}`)}
          />
        </Tooltip>,
        <Tooltip title="Edit Template" key="edit">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/templates/edit/${record.id}`)}
          />
        </Tooltip>,
        <Tooltip title="View Script" key="script">
          <Button
            type="link"
            icon={<CodeOutlined />}
            onClick={() => navigate(`/templates/script/${record.id}`)}
          />
        </Tooltip>
      ],
    },
  ];

  return (
    <ProTable
      headerTitle="Source Templates"
      rowKey="id"
      columns={columns}
      dataSource={templates}
      loading={loading}
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      pagination={{
        showQuickJumper: true,
        showSizeChanger: true,
      }}
      options={{
        density: true,
        fullScreen: true,
        reload: () => loadTemplates(),
      }}
      toolBarRender={() => [
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/templates/create')}
        >
          Create Template
        </Button>,
      ]}
      request={async (params) => {
        await loadTemplates(params);
        return {
          data: templates,
          success: true,
        };
      }}
    />
  );
};

export default TemplateList;