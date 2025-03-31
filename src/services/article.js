import request from '@/utils/request';

export async function fetchArticleList(params = {}) {
  return request('/api/feed/article/list', {
    method: 'GET',
    params
  });
}

export async function fetchArticleDetail(article_id) {
  return request('/api/feed/article/detail', {
    method: 'GET',
    params: { article_id }
  });
}