// src/routes/index.js
import { Navigate } from 'react-router-dom';
import {
  HomeOutlined,
  ReadOutlined,
  FileTextOutlined,
  SettingOutlined,
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
 * 统一的路由配置，同时用于生成路由表和导航菜单
 * 
 * menu 属性用于生成导航菜单，如果为 null 则不在菜单中显示
 * hideInMenu 属性设置为 true 时，该路由不会在菜单中显示
 * 
 * 路由支持嵌套，每个路由可以有 children 属性表示子路由
 */
export const routes = [

  {
    path: '/',
    component: MainLayout,
    layout: 'main',
    redirect: '/', // 默认重定向
    menu: null, // 不在菜单中显示，因为它是布局容器
    children: [
      {
        path: '',
        component: Welcome,
        menu: {
          icon: <HomeOutlined />,
          label: '首页',
        },
      },
      {
        path: 'rss-manager',
        component: null, // 无需专门的组件，只是作为子路由的容器
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
        path: 'crawler',
        component: null,
        redirect: '/crawler/execution',
        menu: {
          icon: <FileTextOutlined />,
          label: '爬虫',
        },
        children: [
          {
            path: 'execution',
            component: Execution,
            menu: {
              label: '执行任务',
            },
          },
          {
            path: 'content-execution',
            component: ContentExecution,
            menu: {
              label: '内容抓取',
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
  return routes
    .filter(route => route.menu !== null && !route.hideInMenu)
    .map(route => {
      // 构建完整路径
      const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;
      
      // 基础菜单项
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

/**
 * 生成 React Router 路由配置
 */
export const generateRouteConfig = () => {
  const processRoutes = (routeList, parentPath = '') => {
    return routeList.map(route => {
      // 构建完整路径
      const fullPath = parentPath ? 
        (route.path ? `${parentPath}/${route.path}` : parentPath) : 
        route.path;
      
      // 基础路由配置
      const routeConfig = {
        path: route.path || '',
      };
      
      // 处理组件
      if (route.component) {
        routeConfig.element = <route.component />;
      }
      
      // 处理重定向
      if (route.redirect) {
        routeConfig.element = <Navigate to={route.redirect} replace />;
      }
      
      // 处理子路由
      if (route.children && route.children.length > 0) {
        routeConfig.children = processRoutes(route.children, fullPath);
      }
      
      return routeConfig;
    });
  };
  
  return processRoutes(routes);
};

export default routes;