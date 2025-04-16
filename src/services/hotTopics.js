// src/services/hotTopics.js
import request from '@/utils/request';

// 获取最新热点话题
export async function fetchLatestHotTopics(params = {}) {
  return request('/api/admin/v1/hot_topics/latest', {
    method: 'GET',
    params
  });
}

// 获取热点话题列表
export async function fetchHotTopicsList(params = {}) {
  return request('/api/admin/v1/hot_topics/list', {
    method: 'GET',
    params
  });
}

// 获取热点任务列表
export async function fetchHotTasksList(params = {}) {
  return request('/api/admin/v1/hot_topics/task/list', {
    method: 'GET',
    params
  });
}

// 获取热点任务详情
export async function fetchHotTaskDetail(taskId) {
  return request('/api/admin/v1/hot_topics/task/detail', {
    method: 'GET',
    params: { task_id: taskId }
  });
}

// 创建热点爬取任务
export async function createHotTask(data) {
  return request('/api/admin/v1/hot_topics/task/create', {
    method: 'POST',
    data
  });
}

// 创建定时热点爬取任务
export async function createScheduledHotTask(data) {
  return request('/api/admin/v1/hot_topics/task/schedule', {
    method: 'POST',
    data
  });
}

// 获取热点爬取日志
export async function fetchHotTopicsLogs(params = {}) {
  return request('/api/admin/v1/hot_topics/logs', {
    method: 'GET',
    params
  });
}

// 获取热点话题统计信息
export async function fetchHotTopicsStats() {
  return request('/api/admin/v1/hot_topics/stats', {
    method: 'GET'
  });
}