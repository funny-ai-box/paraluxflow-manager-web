import {
  addNewFeed,
  fetchRssFeedCategories,
  fetchRssFeedCollections,
  getGroupList,
} from '@/services/rss';
import { InfoCircleOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { 
  DrawerForm, 
  ProForm, 
  ProFormSelect, 
  ProFormSwitch, 
  ProFormText 
} from '@ant-design/pro-components';
import { Button, Divider, message, Space, Typography, Upload } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

const CreateNewFeed = () => {
  const [, setFeedCollections] = useState([]);
  const [feedCategories, setFeedCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const getFeedCollections = async () => {
    const result = await fetchRssFeedCollections();
    if (result.code === 200) {
      setFeedCollections(result.data);
    }
  };

  const getFeedCategories = async () => {
    const result = await fetchRssFeedCategories();
    if (result.code === 200) {
      setFeedCategories(result.data);
    }
  };

  const handleFinish = async (values) => {
    try {
      values.is_active = values.is_active ? 1 : 0;

      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        
        const uploadResponse = await fetch('/api/feed/upload_logo', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          if (uploadResult.code !== 200) {
            throw new Error(uploadResult.message);
          }

          
          values.logo = uploadResult.data.url;
        } else {
          throw new Error('Failed to upload logo');
        }
      }

      const result = await addNewFeed(values);
      if (result.code === 200) {
        message.success('Feed successfully added!');
        setFileList([]);
        setDrawerVisible(false);
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(error.message || 'An error occurred');
      return false;
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    fileList,
    maxCount: 1,
  };

  useEffect(() => {
    getFeedCollections();
    getFeedCategories();
  }, []);

  return (
    <>
      <DrawerForm
        title={
          <Text className="text-lg font-medium">Create New Feed</Text>
        }
        width={680}
        open={drawerVisible}
        onOpenChange={setDrawerVisible}
        trigger={
          <Button type="primary" className="flex items-center gap-2 px-4 h-9 rounded-lg shadow-none">
            <PlusOutlined />
            New Feed
          </Button>
        }
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            submitText: 'Create Feed',
            resetText: 'Cancel',
          },
          submitButtonProps: {
            className: 'rounded-lg shadow-none h-9',
          },
          resetButtonProps: {
            className: 'rounded-lg shadow-none h-9',
          },
        }}
        drawerProps={{
          bodyStyle: { 
            padding: '24px',
            background: '#f7f9fc'
          },
          contentWrapperStyle: {
            boxShadow: 'none'
          }
        }}
      >
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white p-6 rounded-lg">
  
            <ProFormText
              name="title"
              label="Feed Title"
              tooltip="Maximum 24 characters"
              placeholder="Enter your feed title"
              rules={[{ required: true, message: 'Please enter a title' }]}
              fieldProps={{
                prefix: <InfoCircleOutlined className="text-gray-400" />,
                className: 'rounded-lg',
              }}
            />
            
            <ProFormText
              name="description"
              label="Description"
              placeholder="Enter a brief description of your feed"
              fieldProps={{
                prefix: <InfoCircleOutlined className="text-gray-400" />,
                className: 'rounded-lg',
              }}
            />
            
            <ProFormText 
              name="url" 
              label="Feed URL"
              placeholder="Enter the RSS feed URL"
              rules={[{ required: true, message: 'Please enter the feed URL' }]}
              fieldProps={{
                prefix: <LinkOutlined className="text-gray-400" />,
                className: 'rounded-lg',
              }}
            />
          </div>

          {/* Logo Upload Section */}
          <div className="bg-white p-6 rounded-lg">
            <Text className="block text-base font-medium mb-2">Logo</Text>

            <Upload
              {...uploadProps}
              listType="picture-card"
              className="rounded-lg overflow-hidden"
            >
              {fileList.length === 0 && (
                <div className="text-center">
                  <PlusOutlined className="text-lg" />
                  <div className="mt-2 text-sm">Upload Logo</div>
                </div>
              )}
            </Upload>
          </div>

          {/* Classification Section */}
          <div className="bg-white p-6 rounded-lg">
   
            <ProFormSelect
              name="group_id"
              label="Group"
              request={async () => {
                const { data } = await getGroupList();
                return data.map((e) => ({ label: e.title, value: e.id }));
              }}
              placeholder="Select a group"
              rules={[{ required: true, message: 'Please select a group' }]}
              fieldProps={{
                className: 'rounded-lg',
              }}
            />
            
            <ProFormSelect
              name="category_id"
              label="Category"
              options={feedCategories.map((category) => ({
                label: category.text,
                value: category.id,
              }))}
              placeholder="Select a category"
              rules={[{ required: true, message: 'Please select a category' }]}
              fieldProps={{
                className: 'rounded-lg',
              }}
            />
            
           
          </div>

          {/* Settings Section */}
          <div className="bg-white p-6 rounded-lg">

            <ProFormSwitch
              label={
                <Space>
                  <span>Enable Feed</span>
                  <Text type="secondary" className="text-sm">
                    (Disabled by default until script setup is complete)
                  </Text>
                </Space>
              }
              initialValue={0}
              name="is_active"
              disabled
            />
          </div>
        </div>
      </DrawerForm>
    </>
  );
};

export default CreateNewFeed;