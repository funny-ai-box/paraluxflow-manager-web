// src/services/crawler.js
import request from '@/utils/request';

// 获取爬取日志列表
export async function fetchCrawlerLogs(params = {}) {
  return request('/api/v1/rss/crawler/logs', {
    method: 'GET',
    params
  });
}

// 获取爬虫统计信息
export async function fetchCrawlerStats(params = {}) {
  return request('/api/v1/rss/crawler/stats', {
    method: 'GET',
    params
  });
}

// 分析爬虫性能
export async function analyzeCrawlerPerformance(params = {}) {
  return request('/api/v1/rss/crawler/analyze', {
    method: 'GET',
    params
  });
}

// 分析爬虫错误
export async function analyzeCrawlerErrors(params = {}) {
  return request('/api/v1/rss/crawler/error_analysis', {
    method: 'GET',
    params
  });
}