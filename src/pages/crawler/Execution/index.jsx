import { useEffect, useState } from 'react';

import { fetchCrwalArticleExcutions } from '@/services/crawler';
import { ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import CreateNewExecution from './components/CreateNewExecution';

const StatusTag = ({ status }) => {
  let color;
  let text;
  switch (status) {
    case 0:
      color = 'orange';
      text = 'Pending';
      break;
    case 1:
      color = 'blue';
      text = 'Running';
      break;
    case 2:
      color = 'green';
      text = 'Success';
      break;
    case 3:
      color = 'red';
      text = 'Failed';
      break;
    default:
      color = 'grey';
      text = 'Unknown';
      break;
  }
  return <Tag color={color}>{text}</Tag>;
};

export default () => {
  const [articleExcutions, setArticleExcutions] = useState<TableListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchExcutions = async (page, pageSize) => {
    setLoading(true);
    const response = await fetchCrwalArticleExcutions({ page, pageSize });
    if (response.code === 200) {
      setArticleExcutions(response.data.list); // Adjust according to actual API response structure
      setTotal(response.data.total); // Total number of items for pagination
    }
    setLoading(false);
  };
  const handleTableChange = (pagination) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
    fetchExcutions(pagination.current, pagination.pageSize);
  };

  useEffect(() => {
    fetchExcutions(current, pageSize);
  }, []);

  const columns = [
    {
      title: 'Batch',
      dataIndex: 'id',
      width: 50,
    },
    {
      title: 'Feed Ids',
      dataIndex: 'feed_ids',
      width: 180,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      width: 100,
      render: (_, record) => (record.duration ? `${record.duration} s` : 'N/A'),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      width: 100,
      render: (_, record) => {
        if (record.error) {
          return record.error;
        } else {
          return '-';
        }
      },
    },

    {
      title: 'Start Time',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: 'Finish Time',
      dataIndex: 'finished_at',
      valueType: 'dateTime',
      width: 180,
    },

  ];
  return (
    <>
      <ProTable
        columns={columns}
        dataSource={articleExcutions}
        loading={loading}
        rowKey="id"
        pagination={{
          current,
          pageSize,
          total,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
        search={false}
        dateFormatter="string"
        headerTitle="Crawler Execution List"
        toolBarRender={() => [<CreateNewExecution key="create" />]}
      />
    </>
  );
};
