// src/router.jsx - Updated with new routes
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

// Crawler Pages
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
      
      // Crawler
      {
        path: '/crawler/execution',
        element: <Execution />,
      },
      {
        path: '/crawler/content-execution',
        element: <ContentExecution />,
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