// src/layouts/MainLayout.jsx

import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined
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
  Tooltip,
  ConfigProvider // Import ConfigProvider for component-level theme overrides
} from 'antd';
import { layoutMenuItems, breadcrumbNameMap } from '../router'; // Adjust path if needed

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

// Helper function to find the name for a given path, including dynamic parts
// (Keep the improved getBreadcrumbName function from the previous version)
const getBreadcrumbName = (path, map) => {
    if (map[path]) return map[path];
    const pathSegments = path.split('/');
    if (pathSegments.length > 1) {
        const lastSegment = pathSegments[pathSegments.length - 1];
        // Basic check for ID-like segment
        if (/^(\d+|[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12})$/.test(lastSegment)) {
            const basePath = pathSegments.slice(0, -1).join('/');
            const detailPathKey = `${basePath}/detail`;
             if (map[detailPathKey]) return map[detailPathKey];
             if (map[basePath]) return `${map[basePath]} 详情`;
        }
    }
    const lastSegmentName = path.split('/').pop();
    return lastSegmentName ? lastSegmentName.charAt(0).toUpperCase() + lastSegmentName.slice(1) : 'Page';
};


// Generate breadcrumb items using the imported map
// (Keep the improved generateBreadcrumb function from the previous version)
const generateBreadcrumb = (pathname, map) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbItems = [ { title: <Link to="/">首页</Link> } ];
  let currentPath = '';
  paths.forEach((segment, index) => {
    currentPath = `${currentPath}/${segment}`;
    const isLast = index === paths.length - 1;
    const name = getBreadcrumbName(currentPath, map);
    if (name || isLast) {
       breadcrumbItems.push({
         title: isLast ? name : <Link to={currentPath}>{name || segment}</Link>,
       });
    }
  });
  return pathname === '/' ? [breadcrumbItems[0]] : breadcrumbItems;
};


const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  // Memoized calculations (Keep from previous version)
  const openKeys = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) return [`/${segments[0]}`];
     if (segments.length === 1 && layoutMenuItems.some(item => item.key === `/${segments[0]}` && item.children)) {
       return [`/${segments[0]}`];
    }
    return [];
  }, [pathname]);

  const selectedKey = useMemo(() => {
      if (layoutMenuItems.some(item => item.key === pathname || (item.children && item.children.some(child => child.key === pathname)))) {
            return pathname;
        }
        const pathSegments = pathname.split('/');
        for (let i = pathSegments.length; i > 1; i--) {
            const potentialKey = pathSegments.slice(0, i).join('/');
             const foundItem = layoutMenuItems.find(item => {
                if (item.key === potentialKey) return true;
                if (item.children) return item.children.some(child => child.key === potentialKey);
                return false;
            });
            if (foundItem) return potentialKey;
        }
        return pathname;
  }, [pathname]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/auth/login');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人设置' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }
  ];

  const breadcrumbItems = generateBreadcrumb(pathname, breadcrumbNameMap);

  // --- Style Overrides ---
  const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    background: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
  };

  const headerStyle = {
    padding: `0 ${token.paddingLG}px`,
    background: token.colorBgContainer,
    position: 'sticky',
    top: 0,
    zIndex: 999,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: token.Layout?.headerHeight || 64,
  };

  const contentStyle = {

    overflow: 'initial',
  };

  const contentWrapperStyle = {
    padding: token.paddingLG,
    background: token.colorBgContainer,

    minHeight: `calc(100vh - ${(token.Layout?.headerHeight || 64)}px )`,
    boxShadow: token.boxShadowSecondary, // Add subtle shadow to content card
  };

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={siderStyle}
        theme="light"
        width={240}
      >
        {/* Logo Area */}
        <div style={{
          height: token.Layout?.headerHeight || 64,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 16px', borderBottom: `1px solid ${token.colorSplit}`,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <AppstoreOutlined style={{
              fontSize: 28, color: token.colorPrimary,
              marginRight: collapsed ? 0 : 12,
              transition: 'margin 0.3s cubic-bezier(0.2, 0, 0, 1)',
            }} />
            {!collapsed && (
              <Title level={5} style={{
                color: token.colorPrimary, margin: 0, fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                ParaluxFlow
              </Title>
            )}
          </Link>
        </div>

        {/* Menu Styling */}
        <ConfigProvider theme={{ components: { Menu: {
             // General Menu Styling
             itemPaddingInline: 16,
             itemMarginBlock: 4,
             itemHeight: 42,
             iconSize: token.fontSizeLG, // Slightly larger icons
             subMenuItemBg: token.colorBgLayout,

             // Active/Selected Item Styling
             itemSelectedColor: token.colorPrimary, // Text/Icon color for selected item
             itemSelectedBg: token.colorPrimaryBg, // Background color for selected item

             // Hover Item Styling
             itemHoverColor: token.colorText, // Text/Icon color on hover
             itemHoverBg: token.controlItemBgHover, // Background on hover

             // Remove default active bar if using background highlight
             activeBarBorderWidth: 0,
             itemBorderRadius: token.borderRadius, // Add slight rounding to hover/active bg
        }}}}>
            <Menu
              theme="light"
              mode="inline"
              defaultOpenKeys={openKeys}
              selectedKeys={[selectedKey]}
              items={layoutMenuItems}
              onClick={handleMenuClick}
              style={{
                borderRight: 0,
                padding: '8px 4px', // Adjusted padding
                background: 'transparent',
              }}
            />
        </ConfigProvider>

        {/* Optional Footer/Version Info */}
        <div style={{
          position: 'absolute', bottom: 0, width: '100%',
          padding: '16px 0', textAlign: 'center',
          borderTop: `1px solid ${token.colorSplit}`,
          background: 'transparent'
        }}>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {collapsed ? 'v1.0' : `ParaluxFlow v1.0`}
          </Text>
        </div>
      </Sider>

      {/* Main Content Layout */}
      <Layout style={{
        marginLeft: collapsed ? 80 : 240,
        transition: 'margin-left 0.2s',
         background: 'transparent'
      }}>
        <Header style={headerStyle}>
          {/* Left Side: Toggle + Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', marginRight: token.marginSM }}
            />
             <ConfigProvider theme={{ components: { Breadcrumb: {
                  itemColor: token.colorTextSecondary,
                  lastItemColor: token.colorTextHeading,
                  linkColor: token.colorTextSecondary,
                  linkHoverColor: token.colorPrimary,
                  separatorColor: token.colorTextSecondary,
             }}}}>
                <Breadcrumb items={breadcrumbItems} style={{ marginLeft: token.margin }}/>
             </ConfigProvider>
          </div>

          {/* Right Side: Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
             {/* Use ConfigProvider to potentially style header buttons differently */}
             <ConfigProvider theme={{ components: { Button: {
                  textHoverBg: token.controlItemBgHover, // Subtle hover for text buttons
             }}}}>
                 <Space size={token.marginSM}> {/* Slightly smaller space */}
                   <Tooltip title="帮助文档">
                     <Button type="text" icon={<QuestionCircleOutlined style={{ fontSize: token.fontSizeLG }} />} shape="circle" size="middle"/>
                   </Tooltip>
                   <Tooltip title="通知中心">
                     <Badge count={5} size="small">
                       <Button type="text" icon={<BellOutlined style={{ fontSize: token.fontSizeLG }} />} shape="circle" size="middle"/>
                     </Badge>
                   </Tooltip>
                   <Tooltip title="系统设置">
                     <Button type="text" icon={<SettingOutlined style={{ fontSize: token.fontSizeLG }} />} shape="circle" size="middle"/>
                   </Tooltip>

                   <Divider type="vertical" style={{ height: 20 }} />

                   <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                     <Button type='text' style={{ display: 'flex', alignItems: 'center', height: 'auto', padding: '0 8px' }}>
                       <Avatar size="small" style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />}/>
                       <Text style={{ marginLeft: token.marginXS, color: token.colorText }}>管理员</Text>
                     </Button>
                   </Dropdown>
                 </Space>
            </ConfigProvider>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content style={contentStyle}>
           <div style={contentWrapperStyle}>
               <Outlet />
           </div>
        </Content>

      </Layout>
    </Layout>
  );
};

export default MainLayout;