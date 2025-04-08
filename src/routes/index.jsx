import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  HomeOutlined,
  ReadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

// 导入布局
import MainLayout from '../layouts/MainLayout';

// 导入页面
import Welcome from '../pages/Welcome';
import NotFoundPage from '../pages/404';

// RSS 页面
import Feeds from '../pages/rss/Feeds';
import FeedDetail from '../pages/rss/Feeds/Detail';
import Articles from '../pages/rss/Articles';


/**
 * 统一的路由配置，用于生成路由表和导航菜单
 */
export const routes = [
  {
    path: '/',
    component: MainLayout,
    layout: 'main',
    redirect: '/welcome',
    menu: null, // 不在菜单中显示，因为它是布局容器
    children: [
      {
        path: 'welcome',
        component: Welcome,
        menu: {
          icon: <HomeOutlined />,
          label: '首页',
        },
      },
      {
        path: 'rss-manager',
        component: null, // 没有专门的组件，仅作为子路由的容器
        redirect: '/rss-manager/feeds',
        menu: {
          icon: <ReadOutlined />,
          label: 'RSS 管理',
        },
        children: [
          {
            path: 'feeds',
            component: Feeds,
            menu: {
              label: '订阅源',
            },
            children: [
              {
                path: 'detail/:id',
                component: FeedDetail,
                menu: null, // 详情页不在菜单中显示
              },
            ],
          },
          {
            path: 'articles',
            component: Articles,
            menu: {
              label: '文章',
            },
          },
        ],
      },
     
      {
        path: '*',
        component: NotFoundPage,
        menu: null, // 不在菜单中显示
      },
    ],
  },
];

/**
 * 递归生成菜单项
 * @param {Array} routes - 路由配置
 * @param {String} parentPath - 父路径
 * @returns {Array} - 菜单项
 */
export const generateMenuItems = (routes, parentPath = '') => {
  if (!routes) return [];
  
  return routes
    .filter(route => route.menu !== null && !route.hideInMenu)
    .map(route => {
      // 构建完整路径
      const routePath = route.path || '';
      const fullPath = parentPath 
        ? routePath.startsWith('/')
          ? routePath
          : `${parentPath}/${routePath}`
        : routePath;
      
      // 基本菜单项
      const menuItem = {
        key: fullPath,
        ...(route.menu || {}),
      };
      
      // 处理子菜单
      if (route.children && route.children.length > 0) {
        const childMenuItems = generateMenuItems(route.children, fullPath);
        if (childMenuItems.length > 0) {
          menuItem.children = childMenuItems;
        }
      }
      
      return menuItem;
    })
    .filter(item => item !== null);
};

export default routes;