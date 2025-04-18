// src/services/vectorization.js
import request from '@/utils/request';

// 重试文章向量化
export async function retryVectorization(params) {
  return request('/api/admin/v1/rss/vectorization/retry_vectorization', {
    method: 'POST',
    data: params
  });
}

// 获取向量化日志
export async function fetchVectorizationLogs(params = {}) {
  return request('/api/admin/v1/rss/vectorization/vectorization_logs', {
    method: 'GET',
    params
  });
}

// 获取向量化日志详情
export async function fetchVectorizationLogDetail(task_id) {
  return request('/api/admin/v1/rss/vectorization/log_detail', {
    method: 'GET',
    params: { task_id }
  });
}

// 语义搜索文章
export async function searchArticles(params) {
  return request('/api/admin/v1/rss/vectorization/search', {
    method: 'POST',
    data: params
  });
}

// 获取相似文章
export async function fetchSimilarArticles(params) {
  return request('/api/admin/v1/rss/vectorization/similar_articles', {
    method: 'GET',
    params
  });
}

// 获取向量存储信息
export async function fetchVectorStoreInfo(collection_name) {
  return request('/api/admin/v1/rss/vectorization/vector_store_info', {
    method: 'GET',
    params: { collection_name }
  });
}

// 批量重试向量化
export async function batchRetryVectorization(params) {
  return request('/api/admin/v1/rss/vectorization/batch_retry', {
    method: 'POST',
    data: params
  });
}