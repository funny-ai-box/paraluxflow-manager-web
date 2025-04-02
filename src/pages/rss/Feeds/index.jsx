import { fetchRssFeeds, updateFeedStatus } from '@/services/rss';
import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { Switch, message } from 'antd';
import CreateNewFeed from './components/CreateNewFeed';


const Feeds = () => {
  const [feeds, setFeeds] = useState([]);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadFeeds = async () => {
      setLoading(true);
      const response = await fetchRssFeeds({});
      setFeeds(response.data); // 假设 'data' 包含了你的 feeds
      setLoading(false);

    };
    loadFeeds();
  }, []);
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
        message.error(response.message);
      }
    } catch (error) {
      console.error(error);
      message.error('状态更新失败');
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 50,
      search: false,
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      valueType: 'logo',
      width: 100,
      render: (_, record) => {
        if (record.logo) {
          return <img src={record.logo} alt="Logo" width={50} height={50} />;
        }
      }

    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 180,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 180,
    },

    {
      title: '链接',
      dataIndex: 'url',
      width: 200,
      render: (_, record) =>
        record.url ? (
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {record.url}
          </a>
        ) : (
          'N/A'
        ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      search: false,
      width: 100,
      render: (_, record) => {
        if (record.collection) {
          return record.category.text;
        } else {
          return '-';
        }
      },
    },
    {
      title: '集合',
      dataIndex: 'collection',
      search: false,
      width: 100,
      render: (_, record) => {
        if (record.collection) {
          return record.collection.name;
        } else {
          return '-';
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 100,
      search: false,
    },
    {
      title: '启用',
      dataIndex: 'is_active',
      fixed: 'right',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Switch
          checked={record.is_active}
          onChange={(checked) => handleChangeFeedStatus(checked, record)}
          loading={loading}
        />
      ),
      renderFormItem: (_, { fieldProps }) => {
        return (
          // value 和 onchange 会通过 form 自动注入。
          <Select {...fieldProps} allowClear>
            <Select.Option value={1}>开启</Select.Option>
            <Select.Option value={0}>关闭</Select.Option>
          </Select>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <a
          key="查看"
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
    <ProTable
      columns={columns}
      dataSource={feeds}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1300 }}
      pagination={{
        showQuickJumper: true,
      }}
      search={{
        layout: 'vertical',
        defaultCollapsed: false,
      }}
      request={async (params) => {
        setLoading(true);
        setLoading(false);
        const response = await fetchRssFeeds(params);
        setLoading(false);
        setFeeds(response.data);
      }}
      // search={false}
      dateFormatter="string"
      headerTitle="RSS 订阅源"
      toolBarRender={() => [<CreateNewFeed key="create" />]}
    />
  );
};
export default Feeds;