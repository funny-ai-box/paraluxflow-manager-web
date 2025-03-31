import request from '@/utils/request';

export async function fetchCrwalArticleExcutions(params = {}) {
  return request('/api/v1/crawler/article_executions', {
    method: 'GET',
    params
  });
}

export async function createArticlelExecution(options = {}) {
  return request('/api/v1/crawler/create_article_execution', {
    method: 'POST',
    data: options
  });
}

export async function createArticleContentExecution(options = {}) {
  return request('/api/v1/crawler/create_article_content_execution', {
    method: 'POST',
    data: options
  });
}

export async function fetchCrwalArticleContentExcutions(params = {}) {
  return request('/api/v1/crawler/article_content_executions', {
    method: 'GET',
    params
  });
}