import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  
  // 从环境变量获取API服务的URL或使用默认值
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://paraluxflow-admin-server.zeabur.internal:8000'
  
  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': '/src',
      },
    },
    
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
          }
        },
      },
    },
  }
})