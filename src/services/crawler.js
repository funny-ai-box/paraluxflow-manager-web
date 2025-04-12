// src/services/crawler.js
import request from '@/utils/request';

// 获取爬取日志列表
export async function fetchCrawlerLogs(params = {}) {
  return request('/api/admin/v1/rss/crawler/logs', {
    method: 'GET',
    params
  });
}

// 获取爬虫统计信息
export async function fetchCrawlerStats(params = {}) {
  return request('/api/admin/v1/rss/crawler/stats', {
    method: 'GET',
    params
  });
}

// 分析爬虫性能
export async function analyzeCrawlerPerformance(params = {}) {
  return request('/api/admin/v1/rss/crawler/analyze', {
    method: 'GET',
    params
  });
}

// 分析爬虫错误
export async function analyzeCrawlerErrors(params = {}) {
  return request('/api/admin/v1/rss/crawler/error_analysis', {
    method: 'GET',
    params
  });
}


// 获取指定订阅源的失败文章列表
export async function fetchFeedFailedArticles(feed_id, params = {}) {
      return request('/api/admin/v1/rss/crawler/feed_failed_articles', {
        method: 'GET',
        params: {
          feed_id,
          ...params
        }
      });
    }
    
    // 获取文章的爬取失败详情
    export async function fetchArticleCrawlErrors(article_id) {
      return request('/api/admin/v1/rss/crawler/article_errors', {
        method: 'GET',
        params: {
          article_id
        }
      });
    }