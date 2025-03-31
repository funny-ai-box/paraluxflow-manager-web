// src/routes/index.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  HomeOutlined,
  ReadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

// Import layouts
import MainLayout from '../layouts/MainLayout';

// Import pages
import Welcome from '../pages/Welcome';
import NotFoundPage from '../pages/404';

// RSS Pages
import Feeds from '../pages/rss/Feeds';
import FeedDetail from '../pages/rss/Feeds/Detail';
import Articles from '../pages/rss/Articles';

// Crawler Pages
import Execution from '../pages/crawler/Execution';
import ContentExecution from '../pages/crawler/ContentExecution';

/**
 * Unified route configuration used to generate both route table and navigation menu
 */
export const routes = [
  {
    path: '/',
    component: MainLayout,
    layout: 'main',
    redirect: '/welcome',
    menu: null, // Not shown in menu as it's a layout container
    children: [
      {
        path: 'welcome',
        component: Welcome,
        menu: {
          icon: <HomeOutlined />,
          label: 'Home',
        },
      },
      {
        path: 'rss-manager',
        component: null, // No dedicated component, just a container for child routes
        redirect: '/rss-manager/feeds',
        menu: {
          icon: <ReadOutlined />,
          label: 'RSS Management',
        },
        children: [
          {
            path: 'feeds',
            component: Feeds,
            menu: {
              label: 'Feeds',
            },
            children: [
              {
                path: 'detail/:id',
                component: FeedDetail,
                menu: null, // Detail page not shown in menu
              },
            ],
          },
          {
            path: 'articles',
            component: Articles,
            menu: {
              label: 'Articles',
            },
          },
        ],
      },
      {
        path: 'crawler',
        component: null,
        redirect: '/crawler/execution',
        menu: {
          icon: <FileTextOutlined />,
          label: 'Crawler',
        },
        children: [
          {
            path: 'execution',
            component: Execution,
            menu: {
              label: 'Execution Tasks',
            },
          },
          {
            path: 'content-execution',
            component: ContentExecution,
            menu: {
              label: 'Content Fetching',
            },
          },
        ],
      },
      {
        path: '*',
        component: NotFoundPage,
        menu: null, // Not shown in menu
      },
    ],
  },
];

/**
 * Recursively generate menu items
 * @param {Array} routes - Route configuration
 * @param {String} parentPath - Parent path
 * @returns {Array} - Menu items
 */
export const generateMenuItems = (routes, parentPath = '') => {
  if (!routes) return [];
  
  return routes
    .filter(route => route.menu !== null && !route.hideInMenu)
    .map(route => {
      // Build full path
      const routePath = route.path || '';
      const fullPath = parentPath 
        ? routePath.startsWith('/')
          ? routePath
          : `${parentPath}/${routePath}`
        : routePath;
      
      // Basic menu item
      const menuItem = {
        key: fullPath,
        ...(route.menu || {}),
      };
      
      // Handle children
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