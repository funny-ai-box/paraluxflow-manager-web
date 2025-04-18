import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';

const HtmlContentViewer = ({ htmlContent }) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      setLoading(true);
      const iframe = iframeRef.current;
      const doc = iframe.contentWindow.document;
      
      // Write the complete HTML document
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
                padding: 16px;
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.5;
                color: #333;
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 12px 0;
                border-radius: 4px;
              }
              iframe {
                max-width: 100%;
                margin: 12px 0;
                border: none;
              }
              table {
                max-width: 100%;
                overflow-x: auto;
                display: block;
                border-collapse: collapse;
                margin: 16px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
              }
              pre {
                background-color: #f5f5f5;
                padding: 12px;
                border-radius: 4px;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              code {
                background-color: #f5f5f5;
                padding: 2px 4px;
                border-radius: 3px;
              }
              blockquote {
                border-left: 4px solid #ddd;
                padding-left: 16px;
                margin-left: 0;
                color: #666;
              }
              a {
                color: #1677ff;
                text-decoration: none;
              }
              a:hover {
                text-decoration: underline;
              }
            </style>
            <base target="_blank">
          </head>
          <body>${htmlContent}</body>
        </html>
      `);
      doc.close();

      // Handle image errors with proxy
      const images = doc.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        const originalSrc = img.getAttribute('src');
        img.onerror = () => {
          if (!img.src.includes('/api/admin/v1/rss/article/proxy-image')) {
            img.src = `/api/admin/v1/rss/article/proxy-image?url=${encodeURIComponent(originalSrc)}`;
          }
        };
      });

      // Update iframe height when content changes
      const updateHeight = () => {
        const newHeight = doc.documentElement.scrollHeight;
        if (newHeight > 0) {
          setHeight(Math.min(newHeight, window.innerHeight * 0.7));
          setLoading(false);
        }
      };

      // Set up ResizeObserver to adjust height when content changes
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(doc.body);
      
      // Initial height update
      setTimeout(updateHeight, 100);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [htmlContent]);

  return (
    <div className="relative w-full border border-gray-200 rounded-md bg-white overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50 z-10">
          <Spin size="large" tip="Loading content..." />
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full"
        style={{ 
          height: `${height}px`,
          minHeight: '200px',
          maxHeight: '70vh',
          border: 'none',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.3s ease',
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-presentation"
        title="Article Content"
      />
    </div>
  );
};

export default HtmlContentViewer;