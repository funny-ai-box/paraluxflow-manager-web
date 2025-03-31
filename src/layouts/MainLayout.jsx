// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space, Breadcrumb } from 'antd';
import { generateMenuItems, routes } from '../routes';

const { Header, Sider, Content } = Layout;

// 生成面包屑项
const generateBreadcrumb = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  
  // 生成面包屑项目
  return [
    {
      title: <Link to="/">首页</Link>,
    },
    ...paths.map((path, index) => {
      // 转换路径为标题（首字母大写，替换连字符为空格）
      const title = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // 计算此面包屑项的路径
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      
      return {
        title: index === paths.length - 1 ? title : <Link to={url}>{title}</Link>,
      };
    }),
  ];
};

// 获取当前路由的打开的菜单键
const getOpenKeys = (pathname, menuItems) => {
  const result = [];
  
  // 递归函数用于查找匹配的菜单项
  const findOpenKeys = (items, parentKey = null) => {
    for (const item of items) {
      if (pathname.startsWith(item.key) && item.key !== '/') {
        if (parentKey) {
          result.push(parentKey);
        }
        result.push(item.key);
      }
      
      // 递归处理子菜单
      if (item.children) {
        findOpenKeys(item.children, item.key);
      }
    }
  };
  
  findOpenKeys(menuItems);
  return result;
};

// 获取当前选中的菜单键
const getSelectedKey = (pathname, menuItems) => {
  let selectedKey = null;
  let maxMatchLength = 0;
  
  // 递归函数用于查找最佳匹配的菜单项
  const findSelectedKey = (items) => {
    for (const item of items) {
      if (pathname === item.key) {
        // 如果是精确匹配，直接返回
        return item.key;
      } else if (pathname.startsWith(item.key) && item.key.length > maxMatchLength) {
        // 如果是前缀匹配，并且是最长匹配，记录下来
        maxMatchLength = item.key.length;
        selectedKey = item.key;
      }
      
      // 递归处理子菜单
      if (item.children) {
        const childKey = findSelectedKey(item.children);
        if (childKey) {
          return childKey;
        }
      }
    }
    return null;
  };
  
  const exactMatch = findSelectedKey(menuItems);
  return exactMatch || selectedKey || '/';
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  
  // 生成菜单项
  const menuItems = generateMenuItems(routes[1].children); // 使用主布局下的子路由

  // 用户下拉菜单配置
  const userMenu = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      // 处理登出
      localStorage.removeItem('token');
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  // 生成面包屑项
  const breadcrumbItems = generateBreadcrumb(pathname);

  // 获取当前打开的菜单键
  const openKeys = getOpenKeys(pathname, menuItems);
  
  // 获取当前选中的菜单键
  const selectedKey = getSelectedKey(pathname, menuItems);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        theme="dark"
      >
        <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: token.colorPrimary, margin: 0, fontSize: collapsed ? '16px' : '20px' }}>
            {collapsed ? 'PF' : 'ParaluxFlow'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={openKeys}
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: 0,
            background: token.colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 999,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ paddingRight: 24 }}>
            <Dropdown 
              menu={{ 
                items: userMenu,
                onClick: handleUserMenuClick,
              }} 
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <div style={{ padding: '16px 16px 0', background: token.colorBgContainer }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: 4,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;