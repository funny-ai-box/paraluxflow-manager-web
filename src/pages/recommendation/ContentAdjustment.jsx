// src/pages/recommendation/ContentAdjustment.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Slider,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Radio,
  Modal,
  Typography,
  Drawer,
  Form
} from 'antd';
import {
  SearchOutlined,
  PushpinOutlined,
  FireOutlined,
  EyeOutlined,
  EditOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  ImportOutlined,
  ExportOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { 
  fetchContentList, 
  adjustContentScore, 
  pinContent, 
  unpinContent,
  lockContent, 
  unlockContent,
  bulkAdjustContent
} from '@/services/recommendation';
import HtmlContentViewer from '@/pages/rss/Feeds/components/HtmlContentViewer';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const ContentAdjustment = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: undefined,
    source: undefined,
    dateRange: undefined,
    scoreRange: [0, 100],
    adjustment: 'all',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [bulkAdjustmentVisible, setBulkAdjustmentVisible] = useState(false);
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState('score');
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState(0);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetchData();
    fetchMetadata();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        keyword: searchParams.keyword,
        category_id: searchParams.category,
        source_id: searchParams.source,
        min_score: searchParams.scoreRange[0],
        max_score: searchParams.scoreRange[1],
        start_date: searchParams.dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: searchParams.dateRange?.[1]?.format('YYYY-MM-DD'),
        adjustment_type: searchParams.adjustment,
      };

      const response = await fetchContentList(params);
      if (response.code === 200) {
        setContent(response.data.items);
        setPagination({
          ...pagination,
          total: response.data.total,
        });
      } else {
        message.error('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('An error occurred while loading content');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMetadata = async () => {
    try {
      // In a real implementation, these would be separate API calls
      // For simplicity, I'm using mock data here
      setCategories([
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Business' },
        { id: 3, name: 'Science' },
        { id: 4, name: 'Health' },
        { id: 5, name: 'Entertainment' },
      ]);
      
      setSources([
        { id: 1, name: 'BBC News' },
        { id: 2, name: 'CNN' },
        { id: 3, name: 'The New York Times' },
        { id: 4, name: 'TechCrunch' },
        { id: 5, name: 'Wired' },
      ]);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };
  
  const handleSearch = (value) => {
    setSearchParams({
      ...searchParams,
      keyword: value,
    });
    setPagination({
      ...pagination,
      current: 1, // Reset to first page on new search
    });
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleFilterChange = (key, value) => {
    setSearchParams({
      ...searchParams,
      [key]: value,
    });
    setPagination({
      ...pagination,
      current: 1, // Reset to first page on filter change
    });
  };

  const handleScoreChange = async (id, value) => {
    try {
      const response = await adjustContentScore(id, { score_adjustment: value });
      if (response.code === 200) {
        message.success('Score adjusted successfully');
        
        // Update the local state
        const updatedContent = content.map(item => {
          if (item.id === id) {
            return {
              ...item,
              score_adjustment: value,
              final_score: response.data.final_score,
            };
          }
          return item;
        });
        
        setContent(updatedContent);
      } else {
        message.error(response.message || 'Failed to adjust score');
      }
    } catch (error) {
      console.error('Error adjusting score:', error);
      message.error('An error occurred while adjusting the score');
    }
  };

  const handlePinContent = async (id, pinned) => {
    try {
      const response = pinned 
        ? await unpinContent(id) 
        : await pinContent(id);
      
      if (response.code === 200) {
        message.success(`Content ${pinned ? 'unpinned' : 'pinned'} successfully`);
        
        // Update the local state
        const updatedContent = content.map(item => {
          if (item.id === id) {
            return {
              ...item,
              is_pinned: !pinned,
            };
          }
          return item;
        });
        
        setContent(updatedContent);
      } else {
        message.error(response.message || `Failed to ${pinned ? 'unpin' : 'pin'} content`);
      }
    } catch (error) {
      console.error(`Error ${pinned ? 'unpinning' : 'pinning'} content:`, error);
      message.error(`An error occurred while ${pinned ? 'unpinning' : 'pinning'} content`);
    }
  };

  const handleLockContent = async (id, locked) => {
    try {
      const response = locked
        ? await unlockContent(id)
        : await lockContent(id);
      
      if (response.code === 200) {
        message.success(`Content ${locked ? 'unlocked' : 'locked'} successfully`);
        
        // Update the local state
        const updatedContent = content.map(item => {
          if (item.id === id) {
            return {
              ...item,
              is_locked: !locked,
            };
          }
          return item;
        });
        
        setContent(updatedContent);
      } else {
        message.error(response.message || `Failed to ${locked ? 'unlock' : 'lock'} content`);
      }
    } catch (error) {
      console.error(`Error ${locked ? 'unlocking' : 'locking'} content:`, error);
      message.error(`An error occurred while ${locked ? 'unlocking' : 'locking'} content`);
    }
  };

  const showPreview = (item) => {
    setPreviewContent(item);
    setPreviewVisible(true);
  };

  const fetchAdjustmentHistory = async (id) => {
    // In a real application, this would fetch from the server
    setAdjustmentHistory([
      { 
        id: 1, 
        user: 'admin', 
        timestamp: '2023-08-15 14:30:45', 
        action: 'score_adjustment', 
        old_value: '0', 
        new_value: '20' 
      },
      { 
        id: 2, 
        user: 'john.doe', 
        timestamp: '2023-08-16 09:15:22', 
        action: 'pin', 
        old_value: 'false', 
        new_value: 'true' 
      },
      { 
        id: 3, 
        user: 'admin', 
        timestamp: '2023-08-17 11:42:17', 
        action: 'score_adjustment', 
        old_value: '20', 
        new_value: '30' 
      },
    ]);
    setHistoryVisible(true);
  };

  const handleBulkAdjustment = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one item');
      return;
    }

    try {
      const response = await bulkAdjustContent({
        content_ids: selectedRowKeys,
        adjustment_type: bulkAdjustmentType,
        adjustment_value: bulkAdjustmentValue,
      });

      if (response.code === 200) {
        message.success(`Successfully adjusted ${selectedRowKeys.length} items`);
        setBulkAdjustmentVisible(false);
        fetchData(); // Refresh data
        setSelectedRowKeys([]); // Clear selection
      } else {
        message.error(response.message || 'Failed to apply bulk adjustment');
      }
    } catch (error) {
      console.error('Error applying bulk adjustment:', error);
      message.error('An error occurred while applying bulk adjustment');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };
  
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      render: (text, record) => (
        <Space>
          {record.is_pinned && (
            <Tooltip title="Pinned">
              <PushpinOutlined style={{ color: '#f50' }} />
            </Tooltip>
          )}
          {record.is_locked && (
            <Tooltip title="Locked">
              <LockOutlined style={{ color: '#108ee9' }} />
            </Tooltip>
          )}
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source_name',
      key: 'source',
      width: 150,
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Original Score',
      dataIndex: 'original_score',
      key: 'original_score',
      width: 100,
      render: (value) => value.toFixed(1),
    },
    {
      title: 'Adjustment',
      dataIndex: 'score_adjustment',
      key: 'score_adjustment',
      width: 180,
      render: (value, record) => (
        <Space>
          <InputNumber
            min={-50}
            max={50}
            value={value}
            onChange={(newValue) => handleScoreChange(record.id, newValue)}
            disabled={record.is_locked}
            style={{ width: 70 }}
          />
          <Tooltip title="Reset adjustment">
            <Button
              icon={<CloseCircleOutlined />}
              size="small"
              onClick={() => handleScoreChange(record.id, 0)}
              disabled={value === 0 || record.is_locked}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Final Score',
      dataIndex: 'final_score',
      key: 'final_score',
      width: 100,
      sorter: (a, b) => a.final_score - b.final_score,
      render: (value) => {
        let color = 'green';
        if (value < 60) color = 'red';
        else if (value < 80) color = 'orange';
        
        return (
          <Badge 
            count={Math.round(value)} 
            style={{ backgroundColor: color }}
          />
        );
      },
    },
    {
      title: 'Published',
      dataIndex: 'published_date',
      key: 'published_date',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Content">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => showPreview(record)}
            />
          </Tooltip>
          <Tooltip title={record.is_pinned ? "Unpin Content" : "Pin Content"}>
            <Button
              icon={record.is_pinned ? <PushpinOutlined /> : <PushpinOutlined />}
              size="small"
              danger={record.is_pinned}
              onClick={() => handlePinContent(record.id, record.is_pinned)}
              disabled={record.is_locked}
            />
          </Tooltip>
          <Tooltip title={record.is_locked ? "Unlock Content" : "Lock Content"}>
            <Button
              icon={record.is_locked ? <UnlockOutlined /> : <LockOutlined />}
              size="small"
              type={record.is_locked ? "primary" : "default"}
              onClick={() => handleLockContent(record.id, record.is_locked)}
            />
          </Tooltip>
          <Tooltip title="View History">
            <Button
              icon={<HistoryOutlined />}
              size="small"
              onClick={() => fetchAdjustmentHistory(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  const renderFilterToolbar = () => (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space wrap>
          <Search
            placeholder="Search by title or content"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton
          />
          <Select
            placeholder="Category"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleFilterChange('category', value)}
            value={searchParams.category}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Source"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleFilterChange('source', value)}
            value={searchParams.source}
          >
            {sources.map(source => (
              <Option key={source.id} value={source.id}>{source.name}</Option>
            ))}
          </Select>
          <RangePicker 
            onChange={(dates) => handleFilterChange('dateRange', dates)}
            value={searchParams.dateRange}
          />
        </Space>
        
        <Space wrap>
          <Space>
            <Text strong>Score Range:</Text>
            <Slider
              range
              min={0}
              max={100}
              value={searchParams.scoreRange}
              onChange={(value) => handleFilterChange('scoreRange', value)}
              style={{ width: 200 }}
            />
            <Text>{searchParams.scoreRange[0]} - {searchParams.scoreRange[1]}</Text>
          </Space>
          
          <Radio.Group
            value={searchParams.adjustment}
            onChange={(e) => handleFilterChange('adjustment', e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="adjusted">Adjusted</Radio.Button>
            <Radio.Button value="pinned">Pinned</Radio.Button>
            <Radio.Button value="locked">Locked</Radio.Button>
          </Radio.Group>
        </Space>
      </Space>
    </div>
  );
  
  const renderBulkActionTools = () => (
    <div style={{ marginBottom: 16 }}>
      <Space>
        <Button
          type="primary"
          disabled={selectedRowKeys.length === 0}
          onClick={() => setBulkAdjustmentVisible(true)}
        >
          Bulk Adjust ({selectedRowKeys.length})
        </Button>
        <Button
          disabled={selectedRowKeys.length === 0}
          onClick={() => setSelectedRowKeys([])}
        >
          Clear Selection
        </Button>
      </Space>
    </div>
  );

  return (
    <div>
      <Card title="Content Recommendation Management" bordered={false}>
        {renderFilterToolbar()}
        
        {selectedRowKeys.length > 0 && renderBulkActionTools()}
        
        <Table
          columns={columns}
          dataSource={content}
          rowSelection={rowSelection}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1300 }}
        />
      </Card>
      
      {/* Content Preview Modal */}
      <Modal
        title="Content Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {previewContent && (
          <div>
            <Typography.Title level={4}>{previewContent.title}</Typography.Title>
            <Typography.Paragraph type="secondary">
              <Space>
                <span>Source: {previewContent.source_name}</span>
                <span>Category: {previewContent.category_name}</span>
                <span>Published: {previewContent.published_date}</span>
              </Space>
            </Typography.Paragraph>
            
            <HtmlContentViewer htmlContent={previewContent.content} />
          </div>
        )}
      </Modal>
      
      {/* Adjustment History Modal */}
      <Modal
        title="Adjustment History"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <Table
          dataSource={adjustmentHistory}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'User',
              dataIndex: 'user',
              key: 'user',
            },
            {
              title: 'Timestamp',
              dataIndex: 'timestamp',
              key: 'timestamp',
            },
            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              render: (text) => {
                const actionMap = {
                  'score_adjustment': 'Score Adjustment',
                  'pin': 'Pin/Unpin',
                  'lock': 'Lock/Unlock',
                };
                return actionMap[text] || text;
              }
            },
            {
              title: 'From',
              dataIndex: 'old_value',
              key: 'old_value',
            },
            {
              title: 'To',
              dataIndex: 'new_value',
              key: 'new_value',
            },
          ]}
        />
      </Modal>
      
      {/* Bulk Adjustment Drawer */}
      <Drawer
        title="Bulk Adjustment"
        placement="right"
        onClose={() => setBulkAdjustmentVisible(false)}
        open={bulkAdjustmentVisible}
        width={400}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setBulkAdjustmentVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={handleBulkAdjustment} type="primary">
              Apply
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: 24 }}>
          <Text>Selected {selectedRowKeys.length} items</Text>
        </div>
        
        <Form layout="vertical">
          <Form.Item label="Adjustment Type">
            <Radio.Group 
              value={bulkAdjustmentType} 
              onChange={(e) => setBulkAdjustmentType(e.target.value)}
            >
              <Radio value="score">Score</Radio>
              <Radio value="pin">Pin</Radio>
              <Radio value="lock">Lock</Radio>
            </Radio.Group>
          </Form.Item>
          
          {bulkAdjustmentType === 'score' && (
            <Form.Item label="Score Adjustment">
              <InputNumber
                min={-50}
                max={50}
                value={bulkAdjustmentValue}
                onChange={(value) => setBulkAdjustmentValue(value)}
                style={{ width: '100%' }}
                formatter={value => `${value > 0 ? '+' : ''}${value}`}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Positive values increase the score, negative values decrease it
                </Text>
              </div>
            </Form.Item>
          )}
          
          {bulkAdjustmentType === 'pin' && (
            <Form.Item label="Pin Action">
              <Radio.Group 
                value={bulkAdjustmentValue} 
                onChange={(e) => setBulkAdjustmentValue(e.target.value)}
              >
                <Radio value={1}>Pin</Radio>
                <Radio value={0}>Unpin</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          
          {bulkAdjustmentType === 'lock' && (
            <Form.Item label="Lock Action">
              <Radio.Group 
                value={bulkAdjustmentValue} 
                onChange={(e) => setBulkAdjustmentValue(e.target.value)}
              >
                <Radio value={1}>Lock</Radio>
                <Radio value={0}>Unlock</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default ContentAdjustment;