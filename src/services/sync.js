// src/services/sync.js
import request from '@/utils/request';

// 同步单个Feed的文章
export async function syncFeedArticles(feed_id) {
  return request('/api/admin/v1/rss/sync/sync_feed_articles', {
    method: 'POST',
    data: { feed_id }
  });
}

// 批量同步多个Feed的文章
export async function batchSyncFeedArticles(feed_ids) {
  return request('/api/admin/v1/rss/sync/batch_sync_articles', {
    method: 'POST',
    data: { feed_ids }
  });
}

// 获取RSS同步日志列表
export async function fetchSyncLogs(params = {}) {
  return request('/api/admin/v1/rss/sync/sync_log_list', {
    method: 'GET',
    params
  });
}

// 获取RSS同步日志详情
export async function fetchSyncLogDetail(sync_id) {
  return request('/api/admin/v1/rss/sync/sync_log_detail', {
    method: 'GET',
    params: { sync_id }
  });
}

// 获取RSS同步统计信息
export async function fetchSyncStats() {
  return request('/api/admin/v1/rss/sync/sync_log_stats', {
    method: 'GET'
  });
}

// 手动触发RSS同步
export async function triggerSync() {
  return request('/api/admin/v1/rss/sync/trigger', {
    method: 'POST'
  });
}