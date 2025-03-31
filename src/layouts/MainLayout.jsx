// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Breadcrumb } from 'antd';

const { Header, Sider, Content } = Layout;

// Define menu items directly
const menuItems = [
  {
    key: '/',
    icon: <UserOutlined />,
    label: 'Home',
  },
  {
    key: 'rss-manager',
    icon: <UserOutlined />,
    label: 'RSS Management',
    children: [
      {
        key: '/rss-manager/feeds',
        label: 'Feeds',
      },
      {
        key: '/rss-manager/articles',
        label: 'Articles',
      },
    ],
  },
  {
    key: 'crawler',
    icon: <UserOutlined />,
    label: 'Crawler',
    children: [
      {
        key: '/crawler/execution',
        label: 'Execution Tasks',
      },
      {
        key: '/crawler/content-execution',
        label: 'Content Fetching',
      },
    ],
  },
];

// Generate breadcrumb items
const generateBreadcrumb = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  
  return [
    {
      title: <Link to="/">Home</Link>,
    },
    ...paths.map((path, index) => {
      // Convert path to title (capitalize first letter, replace hyphens with spaces)
      const title = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Calculate path for this breadcrumb item
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      
      return {
        title: index === paths.length - 1 ? title : <Link to={url}>{title}</Link>,
      };
    }),
  ];
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  
  // Find which menu keys should be open
  const getOpenKeys = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return [segments[0]];
    }
    return [];
  };
  
  // Handle menu click
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Generate breadcrumb items
  const breadcrumbItems = generateBreadcrumb(pathname);

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
          defaultOpenKeys={getOpenKeys()}
          selectedKeys={[pathname]}
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
            <Avatar icon={<UserOutlined />} />
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