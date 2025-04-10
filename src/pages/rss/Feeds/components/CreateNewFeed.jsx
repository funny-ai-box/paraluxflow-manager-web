import {
  addNewFeed,
  fetchRssFeedCategories,
 
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

  const [feedCategories, setFeedCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);



  const getFeedCategories = async () => {
    const result = await fetchRssFeedCategories();
    if (result.code === 200) {
      setFeedCategories(result.data);
    }
  };

  const handleFinish = async (values) => {
    try {
      values.is_active = values.is_active ? 1 : 0;
      values.use_proxy = values.use_proxy ? 1 : 0;

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

    getFeedCategories();
  }, []);

  return (
    <>
      <DrawerForm
        title={
          <Text className="text-lg font-medium">创建新订阅源</Text>
        }
        width={680}
        open={drawerVisible}
        onOpenChange={setDrawerVisible}
        trigger={
          <Button type="primary" className="flex items-center gap-2 px-4 h-9 rounded-lg shadow-none">
            <PlusOutlined />
            新建订阅源
          </Button>
        }
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            submitText: '创建订阅源',
            resetText: '取消',
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
              label="订阅源标题"
              tooltip="最多24个字符"
              placeholder="请输入订阅源标题"
              rules={[{ required: true, message: '请输入标题' }]}
              fieldProps={{
                prefix: <InfoCircleOutlined className="text-gray-400" />,
                className: 'rounded-lg',
              }}
            />
            
            <ProFormText
              name="description"
              label="描述"
              placeholder="请输入订阅源的简短描述"
              fieldProps={{
                prefix: <InfoCircleOutlined className="text-gray-400" />,
                className: 'rounded-lg',
              }}
            />
            
            <ProFormText 
              name="url" 
              label="订阅源URL"
              placeholder="请输入RSS订阅源URL"
              rules={[{ required: true, message: '请输入订阅源URL' }]}
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
                  <div className="mt-2 text-sm">上传Logo</div>
                </div>
              )}
            </Upload>
          </div>

          {/* Classification Section */}
          <div className="bg-white p-6 rounded-lg">
   
            <ProFormSelect
              name="group_id"
              label="分组"
              request={async () => {
                const { data } = await getGroupList();
                return data.map((e) => ({ label: e.title, value: e.id }));
              }}
              placeholder="选择一个分组"
              rules={[{ required: true, message: '请选择一个分组' }]}
              fieldProps={{
                className: 'rounded-lg',
              }}
            />
            
            <ProFormSelect
              name="category_id"
              label="分类"
              options={feedCategories.map((category) => ({
                label: category.text,
                value: category.id,
              }))}
              placeholder="选择一个分类"
              rules={[{ required: true, message: '请选择一个分类' }]}
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
                  <span>开启代理</span>
                  <Text type="secondary" className="text-sm">
                    (使用代理访问订阅源内容)
                  </Text>
                </Space>
              }
              name="use_proxy"
              initialValue={0}
            />
            
            <ProFormSwitch
              label={
                <Space>
                  <span>启用订阅源</span>
                  <Text type="secondary" className="text-sm">
                    (默认禁用，直到脚本设置完成)
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