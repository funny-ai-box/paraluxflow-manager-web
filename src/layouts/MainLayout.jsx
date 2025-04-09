import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  HomeOutlined,
  ReadOutlined,
  SettingOutlined,
  AlertOutlined,
  RobotOutlined,
  LogoutOutlined,
  BellOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  LineChartOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { 
  Layout, 
  Menu, 
  Button, 
  theme, 
  Avatar, 
  Breadcrumb, 
  Dropdown, 
  Space, 
  Badge, 
  Typography,
  Divider,
  Tooltip
} from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 导航菜单项
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
        label: '订阅源管理',
      },
      {
        key: '/rss-manager/articles',
        label: '文章管理',
      },
      {
        key: '/rss-manager/sync-logs',
        label: '同步日志',
      },
    ],
  },
  {
    key: 'llm',
    icon: <RobotOutlined />,
    label: 'LLM 管理',
    children: [
      {
        key: '/llm/providers',
        label: '提供商管理',
      },
      {
        key: '/llm/models',
        label: '模型管理',
      },
    ],
  }
];

// 生成面包屑导航
const generateBreadcrumb = (pathname) => {
  const breadcrumbNameMap = {
    '/': '首页',
    '/rss-manager': 'RSS 管理',
    '/rss-manager/feeds': '订阅源管理',
    '/rss-manager/articles': '文章管理',
    '/rss-manager/sync-logs': '同步日志',
    '/rss-manager/sync-analysis': '同步分析',
    '/llm': 'LLM 管理',
    '/llm/providers': '提供商管理',
    '/llm/models': '模型管理',
  };
  
  const paths = pathname.split('/').filter(Boolean);
  
  // 处理动态路由
  let dynamicItemName = '';
  if (pathname.match(/^\/rss-manager\/feeds\/detail\/\d+$/)) {
    dynamicItemName = '订阅源详情';
  } else if (pathname.match(/^\/rss-manager\/sync-logs\/detail\/[\w-]+$/)) {
    dynamicItemName = '同步日志详情';
  }
  
  return [
    {
      title: <Link to="/">首页</Link>,
    },
    ...paths.map((path, index) => {
      // 计算当前路径
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      
      // 对于最后一级动态路由，使用动态名称
      if (index === paths.length - 1 && dynamicItemName) {
        return {
          title: dynamicItemName
        };
      }
      
      // 一般路径处理
      const title = breadcrumbNameMap[url] || path.charAt(0).toUpperCase() + path.slice(1);
      
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
  
  // 获取应该打开的菜单项
  const getOpenKeys = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return [segments[0]];
    }
    return [];
  };
  
  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    // 处理动态路由，返回父路由
    if (pathname.match(/^\/rss-manager\/feeds\/detail\/\d+$/)) {
      return '/rss-manager/feeds';
    }
    
    return pathname;
  };
  
  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/user/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/system/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  // 生成面包屑导航
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
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        }}
        theme="light"
        width={260}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <AppstoreOutlined style={{ 
              fontSize: 24, 
              color: token.colorPrimary,
              marginRight: collapsed ? 0 : 12
            }} />
            {!collapsed && (
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold',
                color: token.colorPrimary,
                margin: 0
              }}>
                ParaluxFlow
              </Text>
            )}
          </Link>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          defaultOpenKeys={getOpenKeys()}
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            padding: '12px 0'
          }}
        />
        
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%', 
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {collapsed ? 'v1.0' : 'ParaluxFlow v1.0'}
          </Text>
        </div>
      </Sider>
      
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 260, 
        transition: 'margin-left 0.2s'
      }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 999,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                marginRight: 24
              }}
            />
            <Breadcrumb items={breadcrumbItems} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size={16}>
              <Tooltip title="通知中心">
                <Badge count={0} size="small">
                  <Button type="text" icon={<BellOutlined />} shape="circle" />
                </Badge>
              </Tooltip>
              
              <Tooltip title="系统设置">
                <Button 
                  type="text" 
                  icon={<SettingOutlined />} 
                  shape="circle"
                  onClick={() => navigate('/system')}
                />
              </Tooltip>
              
              <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
              
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    style={{ 
                      marginRight: 8,
                      backgroundColor: token.colorPrimary 
                    }} 
                    icon={<UserOutlined />} 
                  />
                  <Text style={{ marginRight: 4 }}>管理员</Text>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '16px',
            minHeight: 280,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;