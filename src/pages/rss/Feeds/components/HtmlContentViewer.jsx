import React, { useEffect, useRef } from 'react';

const HtmlContentViewer = ({ htmlContent }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
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
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 8px 0;
              }
              iframe {
                max-width: 100%;
                margin: 8px 0;
              }
              table {
                max-width: 100%;
                overflow-x: auto;
                display: block;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
            <base target="_blank">
          </head>
          <body>${htmlContent}</body>
        </html>
      `);
      doc.close();

      // Handle image errors
      const images = doc.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        const originalSrc = img.getAttribute('src');
        img.onerror = () => {
          if (!img.src.includes('/api/feed/proxy-image')) {
            img.src = `/api/feed/proxy-image?url=${encodeURIComponent(originalSrc)}`;
          }
        };
      });

      // Adjust iframe height based on content
      const resizeObserver = new ResizeObserver(() => {
        const newHeight = doc.documentElement.scrollHeight;
        iframe.style.height = `${Math.min(newHeight, window.innerHeight * 0.7)}px`;
      });

      resizeObserver.observe(doc.body);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [htmlContent]);

  return (
    <div className="relative w-full border border-gray-200 rounded-md bg-white overflow-hidden">
      <iframe
        ref={iframeRef}
        className="w-full"
        style={{ 
          minHeight: '200px',
          maxHeight: '70vh',
          border: 'none',
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-presentation"
      />
    </div>
  );
};

export default HtmlContentViewer;