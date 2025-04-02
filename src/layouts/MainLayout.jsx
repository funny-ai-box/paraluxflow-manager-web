// src/layouts/MainLayout.jsx - Updated with new navigation items
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  HomeOutlined,
  ReadOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  RobotOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  SettingOutlined,
  BulbOutlined,
  ToolOutlined,
  LineChartOutlined,
  DashboardOutlined,
  AlertOutlined,
  ClusterOutlined,
  ApiOutlined,
  FileAddOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Breadcrumb } from 'antd';

const { Header, Sider, Content } = Layout;

// Define menu items directly
const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: 'rss-manager',
    icon: <ReadOutlined />,
    label: 'RSS 管理',
    children: [
      {
        key: '/rss-manager/feeds',
        label: '订阅源',
      },
      {
        key: '/rss-manager/articles',
        label: '文章',
      },
    ],
  },
  {
    key: 'templates',
    icon: <FileAddOutlined />,
    label: '资源模板',
    children: [
      {
        key: '/templates',
        label: '模板列表',
      },
      {
        key: '/templates/create',
        label: '创建模板',
      },
    ],
  },
  {
    key: 'crawler',
    icon: <FileSearchOutlined />,
    label: '爬虫',
    children: [
      {
        key: '/crawler/execution',
        label: '执行任务',
      },
      {
        key: '/crawler/content-execution',
        label: '内容抓取',
      },
    ],
  },
  {
    key: 'recommendation',
    icon: <BulbOutlined />,
    label: '推荐',
    children: [
      {
        key: '/recommendation/rules',
        label: '规则管理',
      },
      {
        key: '/recommendation/content',
        label: '内容调整',
      },
    ],
  },
  {
    key: 'ai',
    icon: <RobotOutlined />,
    label: 'AI 摘要',
    children: [
      {
        key: '/ai/models',
        label: '模型配置',
      },
      {
        key: '/ai/templates',
        label: '摘要模板',
      },
  
    ],
  },
  {
    key: 'tasks',
    icon: <ScheduleOutlined />,
    label: '任务',
    children: [
      {
        key: '/tasks/scheduled',
        label: '定时任务',
      },
      {
        key: '/tasks/monitoring',
        label: '监控面板',
      },
    ],
  },
  {
    key: 'statistics',
    icon: <BarChartOutlined />,
    label: '统计',
    children: [
      {
        key: '/statistics/data-analysis',
        label: '数据分析',
      },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统',
    children: [
      {
        key: '/system/logs-alerts',
        label: '日志与警报',
      },
    ],
  },
];

// Generate breadcrumb items
// src/layouts/MainLayout.jsx (Continued)

// Generate breadcrumb items
const generateBreadcrumb = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  
  return [
    {
      title: <Link to="/">首页</Link>,
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
  
  // Find the selected key (current page)
  const getSelectedKey = () => {
    // For most pages, the pathname is the key
    // For dynamic routes, we need to handle special cases
    if (pathname.match(/^\/templates\/edit\/\d+$/)) {
      return '/templates/edit';
    } else if (pathname.match(/^\/templates\/detail\/\d+$/)) {
      return '/templates/detail';
    } else if (pathname.match(/^\/templates\/script\/\d+$/)) {
      return '/templates/script';
    } else if (pathname.match(/^\/rss-manager\/feeds\/detail\/\d+$/)) {
      return '/rss-manager/feeds/detail';
    } else {
      return pathname;
    }
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
        width={260}
      >
        <div className="logo" style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: token.colorPrimary,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ 
            color: token.colorPrimary, 
            margin: 0, 
            fontSize: collapsed ? '16px' : '20px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            {collapsed ? 'PF' : 'ParaluxFlow'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={getOpenKeys()}
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
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
          <div style={{ paddingRight: 24, display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<AlertOutlined />} 
              style={{ marginRight: 16 }}
              onClick={() => navigate('/system/logs-alerts')}
            />
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              style={{ marginRight: 16 }}
              onClick={() => navigate('/system')}
            />
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