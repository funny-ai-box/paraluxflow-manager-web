import { fetchRssFeeds, updateFeedStatus } from '@/services/rss';
import { useEffect, useState } from 'react';
import { Table, Input, Select, Switch, Button, Space, Card, Typography, Image, Tooltip, message, Form } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import CreateNewFeed from './components/CreateNewFeed';

const { Title, Text } = Typography;
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
      const response = await updateFeedStatus({
        feed_id: record.id,
        action: checked ? 'enable' : 'disable',
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: truncateId, // 使用截断函数显示ID
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo) => logo ? <Image src={logo} alt="Logo" width={40} height={40} preview={false} /> : null
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      ellipsis: true, // 启用省略
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      ellipsis: true,
      render: (url) => url ? (
        <Tooltip title={url}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url.length > 25 ? `${url.substring(0, 25)}...` : url}
          </a>
        </Tooltip>
      ) : 'N/A'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (_, record) => record.category ? record.category.name : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
    },
    {
      title: '最后抓取',
      dataIndex: 'last_fetch_at',
      key: 'last_fetch_at',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'last_fetch_status',
      key: 'last_fetch_status',
      width: 80,
      render: (status) => {
        if (status === 1) return <Text type="success">成功</Text>;
        if (status === 2) return <Text type="danger">失败</Text>;
        return <Text type="warning">未知</Text>;
      }
    },
    {
      title: '启用',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleChangeFeedStatus(checked, record)}
          loading={loading}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right', // 固定在右侧
      render: (_, record) => (
        <a
          key="view"
          target="_blank"
          href={`/rss-manager/feeds/detail/${record.id}`}
          rel="noreferrer"
        >
          查看详情
        </a>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>RSS 订阅源</Title>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => loadFeeds()}
                loading={loading}
              >
                刷新
              </Button>
              <CreateNewFeed key="create" />
            </Space>
          </div>
          
          <Card>
            <Form 
              form={searchForm}
              layout="inline"
              onFinish={handleSearch}
              style={{ marginBottom: 24 }}
            >
              <Form.Item name="title" label="标题">
                <Input placeholder="请输入标题" allowClear />
              </Form.Item>
              <Form.Item name="url" label="链接">
                <Input placeholder="请输入链接" allowClear />
              </Form.Item>
              <Form.Item name="is_active" label="状态">
                <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
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
            scroll={{ x: 1300 }}
            size="middle" // 使用更紧凑的表格布局
          />
        </Space>
      </Card>
    </div>
  );
};

export default Feeds;