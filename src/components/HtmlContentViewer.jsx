import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';

/**
 * HTML内容查看器组件
 * 用于安全地显示HTML内容
 * 
 * @param {Object} props
 * @param {String} props.htmlContent - 要显示的HTML内容
 */
const HtmlContentViewer = ({ htmlContent }) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(500);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      setLoading(true);
      const iframe = iframeRef.current;
      const doc = iframe.contentWindow.document;
      
      // 写入完整的HTML文档
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #fff;
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 16px 0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              }
              iframe {
                max-width: 100%;
                margin: 16px 0;
                border: none;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              }
              table {
                max-width: 100%;
                overflow-x: auto;
                display: block;
                border-collapse: collapse;
                margin: 16px 0;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
              }
              th, td {
                border: 1px solid #eee;
                padding: 12px;
              }
              th {
                background-color: #fafafa;
              }
              pre {
                background-color: #f5f5f5;
                padding: 16px;
                border-radius: 8px;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow-x: auto;
              }
              code {
                background-color: #f5f5f5;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
                font-size: 0.9em;
              }
              blockquote {
                border-left: 4px solid #1677ff;
                padding: 8px 16px;
                margin: 16px 0;
                background-color: #f9f9f9;
                color: #666;
                border-radius: 0 8px 8px 0;
              }
              a {
                color: #1677ff;
                text-decoration: none;
                transition: color 0.3s;
              }
              a:hover {
                text-decoration: underline;
                color: #4096ff;
              }
              h1, h2, h3, h4, h5, h6 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
              }
              h1 {
                font-size: 2em;
                border-bottom: 1px solid #eee;
                padding-bottom: 8px;
              }
              h2 {
                font-size: 1.5em;
                border-bottom: 1px solid #eee;
                padding-bottom: 6px;
              }
              p {
                margin: 16px 0;
              }
              ul, ol {
                padding-left: 2em;
              }
              li {
                margin: 8px 0;
              }
            </style>
            <base target="_blank">
          </head>
          <body>${htmlContent}</body>
        </html>
      `);
      doc.close();

      // 处理图片加载错误，使用代理
      const images = doc.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        const originalSrc = img.getAttribute('src');
        img.onerror = () => {
          if (!img.src.includes('/api/admin/v1/rss/article/proxy-image')) {
            img.src = `/api/admin/v1/rss/article/proxy-image?url=${encodeURIComponent(originalSrc)}`;
          }
        };
        
        // 为所有图片添加加载效果
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        img.onload = () => {
          img.style.opacity = '1';
        };
      });

      // 更新iframe高度
      const updateHeight = () => {
        const newHeight = doc.documentElement.scrollHeight;
        if (newHeight > 0) {
          setHeight(Math.min(newHeight, window.innerHeight * 0.8));
          setLoading(false);
        }
      };

      // 设置ResizeObserver来调整高度
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(doc.body);
      
      // 初始化高度更新
      setTimeout(updateHeight, 200);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [htmlContent]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      border: '1px solid #f0f0f0', 
      borderRadius: '8px', 
      backgroundColor: '#fff',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(255, 255, 255, 0.7)', 
          zIndex: 10 
        }}>
          <Spin size="large" tip="正在加载内容..." />
        </div>
      )}
      <iframe
        ref={iframeRef}
        style={{ 
          width: '100%',
          height: `${height}px`,
          minHeight: '300px',
          maxHeight: '80vh',
          border: 'none',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.3s ease',
        }}
        sandbox="allow-same-origin allow-scripts"
        title="文章内容"
      />
    </div>
  );
};

export default HtmlContentViewer;