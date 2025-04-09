// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';

// Import layouts
import MainLayout from './layouts/MainLayout';

// Import pages
import Welcome from './pages/Welcome';
import NotFoundPage from './pages/404';

// RSS Pages
import Feeds from './pages/rss/Feeds';
import FeedDetail from './pages/rss/Feeds/Detail';
import Articles from './pages/rss/Articles';
import SyncLogs from './pages/rss/SyncLogs';
import SyncLogDetail from './pages/rss/SyncLogs/Detail';
import SyncAnalysis from './pages/rss/SyncAnalysis';


// LLM Pages (new)
import LlmProviders from './pages/llm/Providers';
import LlmModels from './pages/llm/Models';

// Auth Pages (new)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Create the router with direct route definitions
const router = createBrowserRouter([
  // Auth Routes
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
  
  // Main Application Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Welcome />,
      },
      
      // RSS Management
      {
        path: '/rss-manager/feeds',
        element: <Feeds />,
      },
      {
        path: '/rss-manager/feeds/detail/:id',
        element: <FeedDetail />,
      },
      {
        path: '/rss-manager/articles',
        element: <Articles />,
      },
      {
        path: '/rss-manager/articles',
        element: <Articles />,
      },
      {
        path: '/rss-manager/sync-logs',
        element: <SyncLogs />,
      },
      {
        path: '/rss-manager/sync-logs/detail/:id',
        element: <SyncLogDetail />,
      },
      {
        path: '/rss-manager/sync-analysis',
        element: <SyncAnalysis />,
      },

      
      // LLM Providers (new)
      {
        path: '/llm/providers',
        element: <LlmProviders />,
      },
      {
        path: '/llm/models',
        element: <LlmModels />,
      },
      
      // 404 page
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;