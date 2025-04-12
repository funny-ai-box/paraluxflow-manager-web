// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'

// 导入路由配置
import router from './router'

// 创建根节点并渲染
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
       <AntApp>
      <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)