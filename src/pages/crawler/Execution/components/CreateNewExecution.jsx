import { createArticlelExecution } from '@/services/crawler';
import { fetchRssAvailableFeeds } from '@/services/rss'; // Adjust the import path as needed
import { Button, Card, Drawer, Result, Space, Steps, Table, message } from 'antd';
import { useEffect, useState } from 'react';

const { Step } = Steps;

const CreateNewExecution = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feeds, setFeeds] = useState([]);
  const [selectedFeeds, setSelectedFeeds] = useState([]);

  const fetchFeeds = async () => {
    try {
      const response = await fetchRssAvailableFeeds({});
      setFeeds(response.data); // Adjust according to actual API response structure
    } catch (error) {
      console.log('=============================error');
      console.log(error);
      console.log('=============================')
      
      message.error('Failed to fetch feeds');
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const showDrawer = () => {
    setVisible(true);
    console.log('=============================selectedFeeds');
    console.log(selectedFeeds);
    console.log('=============================');
  };

  const onClose = () => {
    setVisible(false);
    setCurrentStep(0);
    setSelectedFeeds([]);
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      if (selectedFeeds.length === 0) {
        message.error('Please select at least one feed.');
        return;
      }

      // Pass selectedFeeds to createNewCrawlExecution
      const res = await createArticlelExecution({ feed_ids: selectedFeeds.join(',') });

      console.log('=============================res');
      console.log(res);
      console.log('=============================');

      if (res.code === 200) {
        setCurrentStep(currentStep + 1);
        message.success('Proceeding to execution...');
      } else {
        message.error(res.message);
      }
    } else {
      message.success('Execution completed!');
      onClose(); // Optionally close the drawer after execution
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',

      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'title',
    },
    {
      title: 'Last Fetch Time',
      dataIndex: 'last_fetch_at',
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedFeeds(selectedRowKeys);
    },
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        Create New Execution
      </Button>
      <Drawer
        title="Create Execution for RSS Feeds"
        width={1024}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <Space style={{ float: 'right' }}>
            {currentStep === 0 && (
              <Button type="primary" onClick={nextStep}>
                Next Step
              </Button>
            )}
          </Space>
        }
      >
        <Steps current={currentStep} style={{ marginBottom: 20 }}>
          <Step title="Select Feed" />
          <Step title="Execute" />
        </Steps>
        {currentStep === 0 && (
          <Card style={{ height: 'calc(100vh - 270px)', overflow: 'auto' }}>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={feeds}
              rowKey="id"
              pagination={false}
              scroll={{ y: 'calc(100vh - 380px)' }}
            />
          </Card>
        )}
        {currentStep === 1 && <Result status="success" title="Execution Completed" />}
      </Drawer>
    </>
  );
};

export default CreateNewExecution;
