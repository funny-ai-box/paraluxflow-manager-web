// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import {
  HomeOutlined,
  ReadOutlined,
  SettingOutlined, // Keep if needed elsewhere, or remove if only for layout
  RobotOutlined,
  FileTextOutlined,
  BugOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  FireOutlined,
  SyncOutlined,
  LineChartOutlined,
  DatabaseOutlined // Added for Vector Search icon
} from '@ant-design/icons';


// Import layouts
import MainLayout from './layouts/MainLayout';

// Import pages
import Welcome from './pages/Welcome';
import NotFoundPage from './pages/404';

// RSS Pages
import Feeds from './pages/rss/Feeds';
import FeedDetail from './pages/rss/Feeds/Detail';
import Articles from './pages/rss/Articles';
import VectorSearch from './pages/rss/Articles/VectorSearch';
import SyncLogs from './pages/rss/SyncLogs';
import SyncLogDetail from './pages/rss/SyncLogs/Detail';
import SyncAnalysis from './pages/rss/SyncAnalysis';

// 新增爬取分析相关页面
import CrawlerLogs from './pages/rss/CrawlerLogs';
import CrawlerStats from './pages/rss/CrawlerStats';
import CrawlerAnalysis from './pages/rss/CrawlerAnalysis';
import CrawlerErrorAnalysis from './pages/rss/CrawlerErrorAnalysis';

// LLM Pages
import LlmProviders from './pages/llm/Providers';
import LlmModels from './pages/llm/Models';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// 热点话题页面
import HotTopicsList from './pages/hot/TopicsList';
import HotTopicsStats from './pages/hot/TopicsStats';
import HotTasksList from './pages/hot/TasksList';
import HotTaskDetail from './pages/hot/TaskDetail';
import HotTopicsLogs from './pages/hot/TopicsLogs';

// Define routes with metadata for menu items
const mainLayoutRoutes = [
  {
    path: '/',
    element: <Welcome />,
    name: '首页', // Menu label
    icon: <HomeOutlined />, // Menu icon
    hideInMenu: false, // Explicitly show in menu
  },
  {
    // Parent Route for grouping in menu
    path: 'rss-manager', // Relative path for grouping logic, not used for actual routing here
    name: 'RSS 管理',
    icon: <ReadOutlined />,
    hideInMenu: false,
    children: [
      {
        path: '/rss-manager/feeds',
        element: <Feeds />,
        name: '订阅源管理',
        hideInMenu: false,
      },
      {
        path: '/rss-manager/feeds/detail/:id', // Detail route, usually hidden from menu
        element: <FeedDetail />,
        name: '订阅源详情', // Name for breadcrumb or title
        hideInMenu: true, // Hide from menu
      },
      {
        path: '/rss-manager/sync-logs',
        element: <SyncLogs />,
        name: '同步日志',
        icon: <SyncOutlined />, // Example specific icon
        hideInMenu: false,
      },
      {
        path: '/rss-manager/sync-logs/detail/:id', // Detail route
        element: <SyncLogDetail />,
        name: '同步日志详情',
        hideInMenu: true,
      },
      {
        path: '/rss-manager/sync-analysis',
        element: <SyncAnalysis />,
        name: '同步分析',
        icon: <LineChartOutlined />, // Example specific icon
        hideInMenu: false,
      },
    ],
  },
  {
    path: 'article-manager',
    name: '文章管理',
    icon: <FileTextOutlined />,
    hideInMenu: false,
    children: [
      {
        path: '/article-manager/list',
        element: <Articles />,
        name: '文章列表',
        hideInMenu: false,
      },
      {
        path: '/article-manager/vector-search',
        element: <VectorSearch />,
        name: '向量搜索',
        icon: <DatabaseOutlined />, // Specific icon
        hideInMenu: false,
      },
    ],
  },
  {
    path: 'crawler-manager',
    name: '爬取分析',
    icon: <BugOutlined />,
    hideInMenu: false,
    children: [
      {
        path: '/crawler-manager/logs',
        element: <CrawlerLogs />,
        name: '爬取日志',
        hideInMenu: false,
      },
      {
        path: '/crawler-manager/stats',
        element: <CrawlerStats />,
        name: '统计数据',
        icon: <BarChartOutlined />,
        hideInMenu: false,
      },
      {
        path: '/crawler-manager/analysis',
        element: <CrawlerAnalysis />,
        name: '性能分析',
        icon: <PieChartOutlined />,
        hideInMenu: false,
      },
      {
        path: '/crawler-manager/errors',
        element: <CrawlerErrorAnalysis />,
        name: '错误分析',
        icon: <AreaChartOutlined />,
        hideInMenu: false,
      },
    ],
  },
  {
    path: 'hot-topics',
    name: '热点话题',
    icon: <FireOutlined />,
    hideInMenu: false,
    children: [
      {
        path: '/hot-topics/list',
        element: <HotTopicsList />,
        name: '话题列表',
        hideInMenu: false,
      },
      {
        path: '/hot-topics/tasks',
        element: <HotTasksList />,
        name: '任务管理',
        hideInMenu: false,
      },
       {
        path: '/hot-topics/tasks/:id', // Detail route
        element: <HotTaskDetail />,
        name: '任务详情',
        hideInMenu: true,
      },
      {
        path: '/hot-topics/logs',
        element: <HotTopicsLogs />,
        name: '爬取日志',
        hideInMenu: false,
      },
      {
        path: '/hot-topics/stats',
        element: <HotTopicsStats />,
        name: '统计分析',
        icon: <LineChartOutlined />,
        hideInMenu: false,
      },
    ],
  },
  {
    path: 'llm',
    name: 'LLM 管理',
    icon: <RobotOutlined />,
    hideInMenu: false,
    children: [
      {
        path: '/llm/providers',
        element: <LlmProviders />,
        name: '提供商管理',
        hideInMenu: false,
      },
      {
        path: '/llm/models',
        element: <LlmModels />,
        name: '模型管理',
        hideInMenu: false,
      },
    ],
  },
  // 404 page - should be last within the layout
  {
    path: '*',
    element: <NotFoundPage />,
    name: '404',
    hideInMenu: true, // Hide 404 from menu
  },
];

// Function to generate menu items from routes
const generateMenuItems = (routes) => {
  return routes
    .filter(route => !route.hideInMenu) // Filter out hidden routes
    .map(route => {
      const item = {
        key: route.path.startsWith('/') ? route.path : `/${route.path}`, // Ensure key is absolute path for top level
        icon: route.icon,
        label: route.name,
      };
      if (route.children && route.children.some(child => !child.hideInMenu)) {
         // Only add children if there are visible children
        item.children = route.children
           .filter(child => !child.hideInMenu)
           .map(child => ({
             key: child.path, // Child keys should be the full path
             label: child.name,
             icon: child.icon, // Add icon if child has one
           }));
         // If the parent itself doesn't have a direct element, don't make it clickable
         if (!route.element) {
             item.path = undefined; // Or handle as needed by Ant Design Menu for parent items
         }
      }
      return item;
    });
};

// Generate menu items specifically for the MainLayout
export const layoutMenuItems = generateMenuItems(mainLayoutRoutes);

// Generate breadcrumb name map from routes
const generateBreadcrumbMap = (routes, basePath = '', map = {}) => {
    routes.forEach(route => {
        const currentPath = route.path === '/' ? '/' : `${basePath}${route.path.startsWith('/') ? '' : '/'}${route.path}`;

        if (route.name) {
            map[currentPath] = route.name;
        }

        // Add specific handling for dynamic routes if needed here, or rely on the generic naming in MainLayout
         if (currentPath.includes(':id')) {
            // Example: map['/rss-manager/feeds/detail'] = '订阅源详情'; // Base path for dynamic route
            // Or derive from parent's name if available
            const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
             if (map[parentPath] && !map[currentPath]) {
                 // A basic dynamic name, adjust as needed
                 map[currentPath.replace(/:id$/, 'detail')] = `${map[parentPath]}详情`;
             }
         }


        if (route.children) {
            generateBreadcrumbMap(route.children, route.path === '/' ? '' : currentPath, map);
        }
    });
    return map;
};


// Base map including non-layout routes if needed for context
export const breadcrumbNameMap = {
    '/': '首页',
    '/auth': '认证',
    '/auth/login': '登录',
    '/auth/register': '注册',
     // Add dynamic route base paths explicitly for cleaner lookups
    '/rss-manager/feeds/detail': '订阅源详情',
    '/rss-manager/sync-logs/detail': '同步日志详情',
    '/hot-topics/tasks/detail': '任务详情',
     // Auto-generate from layout routes
    ...generateBreadcrumbMap(mainLayoutRoutes)
};


// Create the router configuration
const router = createBrowserRouter([
  // Auth Routes (outside MainLayout)
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      }
    ]
  },

  // Main Application Routes (inside MainLayout)
  {
    path: '/',
    element: <MainLayout />, // MainLayout wraps these routes
    children: mainLayoutRoutes.flatMap(route => {
        // If a route has children, map both parent (if it has element) and children
        if (route.children) {
            const childRoutes = route.children.map(child => ({
                path: child.path.startsWith('/') ? child.path.substring(1) : child.path, // Make paths relative to parent layout
                element: child.element,
            }));
             // Include the parent route only if it has an element to render
            // return route.element ? [{ path: route.path === '/' ? '' : route.path , element: route.element }, ...childRoutes] : childRoutes;
             // Correction: The structure needs flat list of routes for children of MainLayout.
             // Parent routes without elements are just for menu grouping.
             return childRoutes;
        }
        // If no children, just return the route itself
        return {
             path: route.path === '/' ? '' : route.path , // Handle root path
            element: route.element,
        };
    }),
  },
  // Consider adding a top-level 404 route if needed, though '*' inside MainLayout handles layout-based 404s
  // { path: '*', element: <NotFoundPage /> }
]);

export default router;