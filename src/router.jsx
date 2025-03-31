// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';

// Import layouts
import MainLayout from './layouts/MainLayout';

// Import pages
import Welcome from './pages/Welcome';
import NotFoundPage from './pages/404';
import Feeds from './pages/rss/Feeds';
import FeedDetail from './pages/rss/Feeds/Detail';
import Articles from './pages/rss/Articles';
import Execution from './pages/crawler/Execution';
import ContentExecution from './pages/crawler/ContentExecution';

// Create the router with direct route definitions
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Welcome />,
      },
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
        path: '/crawler/execution',
        element: <Execution />,
      },
      {
        path: '/crawler/content-execution',
        element: <ContentExecution />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;