import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  // Icons below are now defined in router.jsx for menu items
  // HomeOutlined, ReadOutlined, RobotOutlined, FileTextOutlined, BugOutlined, FireOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined, // Keep for Header action
  AppstoreOutlined // Keep for Logo
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
// Import the menu items and breadcrumb map from router.jsx
import { layoutMenuItems, breadcrumbNameMap } from '../router'; // Adjust path if needed

const { Header, Sider, Content } = Layout;
const { Text } = Typography;


// Helper function to find the name for a given path, including dynamic parts
const getBreadcrumbName = (path, map) => {
    // Direct match
    if (map[path]) return map[path];

    // Check for dynamic routes (simple case: /path/:id)
    const pathSegments = path.split('/');
    if (pathSegments.length > 1) {
        const lastSegment = pathSegments[pathSegments.length - 1];
        // Check if the last segment could be an ID (numeric or uuid-like)
        // This is a basic check, adjust regex as needed
        if (/^(\d+|[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12})$/.test(lastSegment)) {
            const basePath = pathSegments.slice(0, -1).join('/');
            const detailPathKey = `${basePath}/detail`; // Or a convention like using ':id' in the map key
             if (map[detailPathKey]) {
                 return map[detailPathKey];
             }
             // Fallback: try finding name for base path and append 'Detail'
             if (map[basePath]) {
                 return `${map[basePath]} 详情`;
             }
        }
    }
    return path.split('/').pop(); // Fallback to the last segment
};


// Generate breadcrumb items using the imported map
const generateBreadcrumb = (pathname, map) => {
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    {
      title: <Link to="/">首页</Link>, // Always start with Home
    },
  ];

  let currentPath = '';
  paths.forEach((segment, index) => {
    currentPath = `${currentPath}/${segment}`;
    const isLast = index === paths.length - 1;
    const name = getBreadcrumbName(currentPath, map);

    breadcrumbItems.push({
      title: isLast ? name : <Link to={currentPath}>{name}</Link>,
    });
  });

  // Remove the first default "Home" if the path is just "/"
  return pathname === '/' ? [breadcrumbItems[0]] : breadcrumbItems;
};


const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  // Get the parent path for defaultOpenKeys
  const getOpenKeys = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) { // Only open if it's a nested route
      return [`/${segments[0]}`]; // Return the first segment as the key (e.g., /rss-manager)
    }
     // If it's a top-level route like '/', it doesn't need an open key
    if (segments.length === 1 && layoutMenuItems.some(item => item.key === `/${segments[0]}` && item.children)) {
       return [`/${segments[0]}`];
    }
    return [];
  };

   // Get the current selected key, handling potential mismatches for dynamic routes
  const getSelectedKey = () => {
        // Direct match check first
        if (layoutMenuItems.some(item => item.key === pathname || (item.children && item.children.some(child => child.key === pathname)))) {
            return pathname;
        }

        // Handle dynamic routes: find the closest matching static parent route key
        const pathSegments = pathname.split('/');
        for (let i = pathSegments.length; i > 1; i--) {
            const potentialKey = pathSegments.slice(0, i).join('/');
             // Check if this potential key exists in the menu items (either top-level or child)
             const foundItem = layoutMenuItems.find(item => {
                if (item.key === potentialKey) return true;
                if (item.children) return item.children.some(child => child.key === potentialKey);
                return false;
            });
            if (foundItem) {
                return potentialKey;
            }
        }

        // Fallback if no match found (e.g., for '/')
        return pathname;
    };


  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    // Assuming you store the token in localStorage
    localStorage.removeItem('auth_token'); // Use the same key as in request.js
    navigate('/auth/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      // onClick: () => navigate('/user/profile') // Add this route if it exists
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      // onClick: () => navigate('/system/settings') // Add this route if it exists
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

  const breadcrumbItems = generateBreadcrumb(pathname, breadcrumbNameMap);

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
                margin: 0,
                whiteSpace: 'nowrap' // Prevent wrapping when collapsing
              }}>
                ParaluxFlow
              </Text>
            )}
          </Link>
        </div>

        <Menu
          theme="light"
          mode="inline"
          // Use defaultOpenKeys for initial render, allow user interaction to change open keys
          defaultOpenKeys={getOpenKeys()}
          // selectedKeys needs to accurately reflect the current route or its parent
          selectedKeys={[getSelectedKey()]}
          items={layoutMenuItems} // Use imported menu items
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            padding: '12px 0'
          }}
        />

        {/* Footer/Version info can stay if desired */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
          background: token.colorBgContainer // Match background
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
            {/* Use generated breadcrumb items */}
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Header actions like notifications, settings, user dropdown remain */}
            <Space size={16}>
               <Tooltip title="通知中心">
                 <Badge count={0} size="small"> {/* Placeholder count */}
                   <Button type="text" icon={<BellOutlined />} shape="circle" />
                 </Badge>
               </Tooltip>

               <Tooltip title="系统设置">
                 <Button
                   type="text"
                   icon={<SettingOutlined />}
                   shape="circle"
                   // onClick={() => navigate('/system/settings')} // Link if needed
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
                  {/* Dynamically display username if available */}
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
            // Removed fixed padding, allow Outlet content to control its padding
            // padding: 24,
            background: token.colorBgLayout, // Use layout background color
            overflow: 'initial' // Let content scroll if needed
          }}
        >
          {/* Add a wrapper div if padding is desired around the Outlet content */}
           <div style={{ padding: 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, minHeight: 'calc(100vh - 64px - 32px)' }}>
               <Outlet />
           </div>
        </Content>
        {/* Optional Footer
        <Footer style={{ textAlign: 'center', background: token.colorBgLayout }}>
          ParaluxFlow ©{new Date().getFullYear()} Created by YourTeam
        </Footer>
        */}
      </Layout>
    </Layout>
  );
};

export default MainLayout;