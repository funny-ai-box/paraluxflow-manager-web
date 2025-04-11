// src/services/rss.js
import request from '@/utils/request';

// Feed list
export async function fetchRssFeeds(params = {}) {
  return request('/api/v1/rss/feed/list', {
    method: 'GET',
    params
  });
}

// Feed detail
export async function fetchRssFeedDetail(id) {
  return request(`/api/v1/rss/feed/detail`, {
    method: 'GET',
    params: { feed_id: id }
  });
}

// Get article content from URL
export async function fetchArtcileHtmlByUrl(url) {
  return request(`/api/v1/article/get_content_from_url`, {
    method: 'GET',
    params: { url }
  });
}

// Feed articles
export async function fetchRssFeedArticles({
  id,
  page = 1,
  pageSize = 10,
}) {
  return request(`/api/v1/article/list`, {
    method: 'GET',
    params: {
      feed_id: id,
      page,
      per_page: pageSize
    }
  });
}

// Sync feed articles
export async function syncFeedArticles(id) {
  return request(`/api/v1/article/sync`, {
    method: 'POST',
    data: { feed_id: id }
  });
}

// Batch sync feed articles
export async function batchSyncFeedArticles(feed_ids) {
  return request(`/api/v1/article/batch_sync`, {
    method: 'POST',
    data: { feed_ids }
  });
}

// Test feed link content crawler
export async function testFeedLinkCrawlerScript(options) {
  return request(`/api/v1/rss/test_html_content_crawler_script`, {
    method: 'POST',
    data: options
  });
}

// Add new feed
export async function addNewFeed(options = {}) {
  return request('/api/v1/rss/add_feed', {
    method: 'POST',
    data: options
  });
}

// Add new group
export async function addNewGroup(options = {}) {
  return request('/api/v1/rss/group/add', {
    method: 'POST',
    data: options
  });
}

// Get group list
export async function getGroupList() {
  return request('/api/v1/rss/group/getList', {
    method: 'GET'
  });
}

// Update group
export async function updateGroup(options = {}) {
  return request('/api/v1/rss/group/update', {
    method: 'POST',
    data: options
  });
}

// Update feed status
export async function updateFeed(options = {}) {
  return request('/api/v1/rss/feed/update', {
    method: 'POST',
    data: options
  });
}

// Publish RSS feed script
export async function publishRssFeedScript(options = {}) {
  return request('/api/v1/rss/publish_feed_script', {
    method: 'POST',
    data: options
  });
}

// Update RSS feed crawler script
export async function updateRssFeedCrawlerScript(options = {}) {
  return request('/api/v1/rss/update_feed_crawl_script', {
    method: 'POST',
    data: options
  });
}

// Fetch RSS feed crawler scripts
export async function fetchRssFeedCrawlerScripts(feed_id) {
  return request('/api/v1/rss/feed_crawl_scripts', {
    method: 'GET',
    params: { feed_id }
  });
}

// Fetch RSS group crawler scripts
export async function fetchRssGroupCrawlerScripts(group_id) {
  return request('/api/v1/rss/group_crawl_scripts', {
    method: 'GET',
    params: { group_id }
  });
}

// Update RSS group crawler script
export async function updateRssGroupCrawlerScript(options = {}) {
  return request('/api/v1/rss/update_group_crawl_script', {
    method: 'POST',
    data: options
  });
}

// Publish RSS group crawler script
export async function publishRssGroupCrawlerScript(options = {}) {
  return request('/api/v1/rss/publish_group_crawl_script', {
    method: 'POST',
    data: options
  });
}




export async function fetchRssFeedCategories() {
  return request('/api/v1/rss/feed/categories', {
    method: 'GET'
  });
}