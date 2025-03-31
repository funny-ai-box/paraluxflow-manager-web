// src/router.jsx
import { createBrowserRouter, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { routes } from './routes';

// Auth Guard Component
const AuthGuard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
    console.log('=============================token');
    console.log(token);
    console.log('=============================')
    
    }
  }, [navigate]);
  
  return <Outlet />;
};

/**
 * 递归构建路由配置
 */
const buildRouter = () => {
  // 首先找到登录路由和主应用路由

  const mainRoute = routes.find(route => route.path === '/');
  
  // 处理主应用子路由
  const processChildren = (children) => {
    return children.map(child => {
      const result = {
        path: child.path,
      };
      
      // 处理组件
      if (child.component) {
        result.element = <child.component />;
      }
      
      // 处理重定向
      if (child.redirect) {
        result.element = <Navigate to={child.redirect} replace />;
      }
      
      // 处理子路由
      if (child.children && child.children.length > 0) {
        result.children = processChildren(child.children);
      }
      
      return result;
    });
  };
  
  // 构建最终路由配置
  const routerConfig = [
    // 登录路由

    
    // 主应用路由 (带认证守卫)
    {
      path: '/',
      element: <AuthGuard />,
      children: [
        {
          path: '/',
          element: <mainRoute.component />,
          children: processChildren(mainRoute.children),
        }
      ]
    }
  ];
  
  return routerConfig;
};

// 创建路由
const router = createBrowserRouter(buildRouter());

export default router;