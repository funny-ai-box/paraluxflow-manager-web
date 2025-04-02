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

// Template Pages
import TemplateList from './pages/templates';
import TemplateForm from './pages/templates/TemplateForm';
import TemplateDetail from './pages/templates/Detail';
import ScriptEditor from './pages/templates/ScriptEditor';

// Recommendation Pages
import RecommendationRules from './pages/recommendation/Rules';
import ContentAdjustment from './pages/recommendation/ContentAdjustment';

// AI Pages
import ModelConfig from './pages/ai/ModelConfig';
import SummaryTemplates from './pages/ai/SummaryTemplates';


// Task Pages
import ScheduledTasks from './pages/tasks/ScheduledTasks';
import MonitoringDashboard from './pages/tasks/MonitoringDashboard';

// System Pages
import LogsAndAlerts from './pages/system/LogsAndAlerts';

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
      
      // Templates
      {
        path: '/templates',
        element: <TemplateList />,
      },
      {
        path: '/templates/create',
        element: <TemplateForm />,
      },
      {
        path: '/templates/edit/:id',
        element: <TemplateForm />,
      },
      {
        path: '/templates/detail/:id',
        element: <TemplateDetail />,
      },
      {
        path: '/templates/script/:id',
        element: <ScriptEditor />,
      },
      
      // Recommendation
      {
        path: '/recommendation/rules',
        element: <RecommendationRules />,
      },
      {
        path: '/recommendation/content',
        element: <ContentAdjustment />,
      },
      
      // AI
      {
        path: '/ai/models',
        element: <ModelConfig />,
      },
      {
        path: '/ai/templates',
        element: <SummaryTemplates />,
      },

      // Tasks
      {
        path: '/tasks/scheduled',
        element: <ScheduledTasks />,
      },
      {
        path: '/tasks/monitoring',
        element: <MonitoringDashboard />,
      },

      // System
      {
        path: '/system/logs-alerts',
        element: <LogsAndAlerts />,
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