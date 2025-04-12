import {
  fetchRssFeeds, updateFeed
} from '@/services/rss';
import { batchSyncFeedArticles } from '@/services/sync';
import { useEffect, useState } from 'react';
import { 
  Table, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Card, 
  Typography, 
  Image, 
  Tooltip, 
  message, 
  Form,
  Tag,
  Avatar,
  Divider,
  Badge,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  SyncOutlined, 
  LinkOutlined,
  EyeOutlined, 
  CheckCircleFilled,
  CloseCircleFilled,
  QuestionCircleFilled
} from '@ant-design/icons';
import CreateNewFeed from './components/CreateNewFeed';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Feeds = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showQuickJumper: true,
  });
  const [searchForm] = Form.useForm();
  
  // 添加批量同步功能
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);

  const handleBatchSync = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择需要同步的订阅源');
      return;
    }

    Modal.confirm({
      title: '批量同步确认',
      content: `确定要同步选中的 ${selectedRowKeys.length} 个订阅源吗？`,
      onOk: async () => {
        setSyncLoading(true);
        try {
          const result = await batchSyncFeedArticles(selectedRowKeys);
          if (result.code === 200) {
            message.success(`批量同步任务已触发，共 ${selectedRowKeys.length} 个订阅源，同步ID: ${result.data.sync_id}`);
            setSelectedRowKeys([]);
          } else {
            message.error(result.message || '批量同步订阅源文章失败');
          }
        } catch (error) {
          console.error('批量同步订阅源文章时出错:', error);
          message.error('批量同步订阅源文章时发生错误');
        } finally {
          setSyncLoading(false);
        }
      }
    });
  };
  
  const loadFeeds = async (params = {}) => {
    setLoading(true);
    try {
      const response = await fetchRssFeeds({
        page: params.current || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        ...params.filters
      });
      
      if (response.code === 200) {
        setFeeds(response.data.list || []);
        setPagination({
          ...pagination,
          current: response.data.current_page,
          total: response.data.total,
        });
      } else {
        message.error(response.message || '加载数据失败');
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      message.error('获取RSS订阅源失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  const handleTableChange = (pag, filters) => {
    loadFeeds({
      current: pag.current,
      pageSize: pag.pageSize,
      filters
    });
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    loadFeeds({
      current: 1,
      filters: values
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    loadFeeds({
      current: 1,
      filters: {}
    });
  };

  const handleChangeFeedStatus = async (checked, record) => {
    setLoading(true);
    try {
      const response = await updateFeed({
        feed_id: record.id,
        is_active: checked ? 1 : 0,
      });
      
      if (response.code === 200) {
        message.success('状态更新成功');
        // 本地更新 feed 状态
        const updatedFeeds = feeds.map((feed) => {
          if (feed.id === record.id) {
            return { ...feed, is_active: checked };
          }
          return feed;
        });
        setFeeds(updatedFeeds);
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      console.error(error);
      message.error('状态更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 截断长ID的函数
  const truncateId = (id) => {
    if (!id || typeof id !== 'string') return id;
    if (id.length > 8) {
      return (
        <Tooltip title={id}>
          {id.substring(0, 8)}...
        </Tooltip>
      );
    }
    return id;
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_NONE,
      {
        key: 'active',
        text: '选择所有已启用',
        onSelect: () => {
          const activeKeys = feeds
            .filter(feed => feed.is_active)
            .map(feed => feed.id);
          setSelectedRowKeys(activeKeys);
        }
      }
    ]
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: truncateId,
    },
    {
      title: '订阅源信息',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <Space align="start">
          <Avatar 
            src={record.logo} 
            alt={text}
            shape="square" 
            size={40}
            style={{ backgroundColor: '#f0f0f0' }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ maxWidth: 240 }}>
            <Text strong style={{ fontSize: '14px', display: 'block' }}>{text}</Text>
            <Paragraph 
              type="secondary" 
              ellipsis={{ rows: 2, tooltip: record.description || '暂无描述' }}
              style={{ fontSize: '12px', marginBottom: 0, lineHeight: '1.4' }}
            >
              {record.description || '暂无描述'}
            </Paragraph>
          </div>
        </Space>
      )
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      width: 250,
      ellipsis: true,
      render: (url) => url ? (
        <Tooltip title={url}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
            <LinkOutlined style={{ marginRight: 6 }} />
            <span>{url.length > 30 ? `${url.substring(0, 30)}...` : url}</span>
          </a>
        </Tooltip>
      ) : '无链接'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (_, record) => record.category ? (
        <Tag color="blue">{record.category.name}</Tag>
      ) : <Tag color="default">未分类</Tag>
    },
    {
      title: '最后抓取',
      dataIndex: 'last_fetch_at',
      key: 'last_fetch_at',
      width: 170,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text>{text || '从未抓取'}</Text>
          <Text>
            {record.last_fetch_status === 1 ? (
              <Badge status="success" text="成功" />
            ) : record.last_fetch_status === 2 ? (
              <Badge status="error" text="失败" />
            ) : (
              <Badge status="default" text="未知" />
            )}
          </Text>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active, record) => (
        <Switch
          checked={!!active}
          onChange={(checked) => handleChangeFeedStatus(checked, record)}
          loading={loading}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <a href={`/rss-manager/feeds/detail/${record.id}`} target="_blank" rel="noopener noreferrer">
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
        </a>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>RSS 订阅源</Title>
            <Space>
              <Button 
                icon={<SyncOutlined />} 
                onClick={() => loadFeeds()}
                loading={loading}
              >
                刷新
              </Button>
              {selectedRowKeys.length > 0 && (
                <Button 
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={handleBatchSync}
                  loading={syncLoading}
                >
                  批量同步 ({selectedRowKeys.length})
                </Button>
              )}
              <CreateNewFeed key="create" />
            </Space>
          </div>
        }
        bordered={false}
        style={{ borderRadius: '8px', marginBottom: '16px' }}
      >
        <Card
          style={{ borderRadius: '8px', marginBottom: '16px' }}
          size="small"
        >
          <Form 
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
          >
            <Form.Item name="title" label="标题">
              <Input 
                placeholder="请输入标题"
                allowClear
                style={{ width: 180 }}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>
            <Form.Item name="url" label="链接">
              <Input 
                placeholder="请输入链接" 
                allowClear
                style={{ width: 180 }}
                prefix={<LinkOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>
            <Form.Item name="is_active" label="状态">
              <Select 
                placeholder="请选择状态" 
                allowClear 
                style={{ width: 120 }}
              >
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
        
        <Table
          columns={columns}
          dataSource={feeds}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1100 }}
          size="middle"
          bordered
          rowSelection={rowSelection}
        />
        
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary">共 {pagination.total} 个订阅源</Text>
        </div>
      </Card>
    </div>
  );
};

export default Feeds;