// src/services/article.js
import request from '@/utils/request';

export async function fetchArticleList(params = {}) {
  return request('/api/admin/v1/rss/article/list', {
    method: 'GET',
    params
  });
}

export async function fetchArticleDetail(article_id) {
  return request('/api/admin/v1/rss/article/detail', {
    method: 'GET',
    params: { article_id }
  });
}

export async function resetArticle(article_id) {
  return request('/api/admin/v1/rss/article/reset', {
    method: 'POST',
    data: { article_id }
  });
}

export async function syncArticle(feed_id) {
  return request('/api/admin/v1/rss/article/sync', {
    method: 'POST',
    data: { feed_id }
  });
}

export async function batchSyncArticles(feed_ids) {
  return request('/api/admin/v1/rss/article/batch_sync', {
    method: 'POST',
    data: { feed_ids }
  });
}

export async function getContentFromUrl(url) {
  return request('/api/admin/v1/rss/article/get_content_from_url', {
    method: 'GET',
    params: { url }
  });
}

// 新增向量化相关接口
export async function getArticlesVectorizationStatus(article_ids) {
  return request('/api/admin/v1/rss/article/vectorization_status', {
    method: 'GET',
    params: { article_ids: article_ids.join(',') }
  });
}

export async function resetArticleVectorization(article_id, reason) {
  return request('/api/admin/v1/rss/article/reset_vectorization', {
    method: 'POST',
    data: { article_id, reason }
  });
}

export async function getVectorizationStatistics(feed_id) {
  return request('/api/admin/v1/rss/article/vectorization_statistics', {
    method: 'POST',
    data: { feed_id }
  });
}

// Proxy image service
export function getProxyImageUrl(originalUrl) {
  return `/api/admin/v1/rss/article/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}