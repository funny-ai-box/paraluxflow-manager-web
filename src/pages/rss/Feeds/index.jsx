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
      setFeeds(response.data); // Assuming 'data' contains your feeds
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
        message.success('Status updated successfully');
        // Update the feed state locally
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
      message.error('Failed to update status');
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
      title: 'Title',
      dataIndex: 'title',
      width: 180,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 180,
    },

    {
      title: 'Link',
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
      title: 'Category',
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
      title: 'Collection',
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
      title: 'Create Time',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 100,
      search: false,
    },
    {
      title: 'Enable',
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
      title: 'Options',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <a
          key="View"
          target="_blank"
          href={`/rss-manager/feeds/detail/${record.id}`}
          rel="noreferrer"
        >
          View Detail
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
      headerTitle="RSS Feeds"
      toolBarRender={() => [<CreateNewFeed key="create" />]}
    />
  );
};
export default Feeds;