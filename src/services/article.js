// src/services/article.js
import request from '@/utils/request';

export async function fetchArticleList(params = {}) {
  return request('/api/admin/v1/article/list', {
    method: 'GET',
    params
  });
}

export async function fetchArticleDetail(article_id) {
  return request('/api/admin/v1/article/detail', {
    method: 'GET',
    params: { article_id }
  });
}

export async function resetArticle(article_id) {
  return request('/api/admin/v1/article/reset', {
    method: 'POST',
    data: { article_id }
  });
}

export async function syncArticle(feed_id) {
  return request('/api/admin/v1/article/sync', {
    method: 'POST',
    data: { feed_id }
  });
}

export async function batchSyncArticles(feed_ids) {
  return request('/api/admin/v1/article/batch_sync', {
    method: 'POST',
    data: { feed_ids }
  });
}

export async function getContentFromUrl(url) {
  return request('/api/admin/v1/article/get_content_from_url', {
    method: 'GET',
    params: { url }
  });
}

// Proxy image service
export function getProxyImageUrl(originalUrl) {
  return `/api/admin/v1/article/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}