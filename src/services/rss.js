import request from '@/utils/request';

// Feed list
export async function fetchRssFeeds(params = {}) {
  return request('/api/feed/list', {
    method: 'GET',
    data: params
  });
}

// Available feeds
export async function fetchRssAvailableFeeds(params = {}) {
  return request('/api/v1/rss/available_feeds', {
    method: 'GET',
    params
  });
}

// Feed collections
export async function fetchRssFeedCollections() {
  return request('/api/v1/rss/feed_collections', {
    method: 'GET'
  });
}

// Feed categories
export async function fetchRssFeedCategories() {
  return request('/api/feed/categories', {
    method: 'GET'
  });
}

// Feed detail
export async function fetchRssFeedDetail(id) {
  return request(`/api/feed/detail`, {
    method: 'GET',
    params: { feed_id: id }
  });
}

// Get article content from URL
export async function fetchArtcileHtmlByUrl(url) {
  return request(`/api/feed/article/get_content_from_url`, {
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
  return request(`/api/feed/articles`, {
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
  return request(`/api/feed/sync_articles`, {
    method: 'POST',
    data: { feed_id: id }
  });
}

// Test feed link content crawler
export async function fetchRssFeedLinkContentCrawlerTest(link) {
  return request(`/api/v1/rss/test_feed_link_content_crawler`, {
    method: 'GET',
    params: { link }
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
export async function updateFeedStatus(options = {}) {
  return request('/api/v1/rss/update_feed_status', {
    method: 'POST',
    data: options
  });
}

// Test feed link crawler script
export async function testFeedLinkCrawlerScript(options = {}) {
  return request('/api/v1/rss/test_html_content_crawler_script', {
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

// Fetch RSS feed crawler script by ID
export async function fetchRssFeedCrawlerScriptById(id) {
  return request('/api/v1/rss/get_script_by_id', {
    method: 'GET',
    params: { id }
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

// Synchronous feed service
export async function SynchronousFeedService(options = {}) {
  return request('/api/v1/rss/group/SynchronousFeed', {
    method: 'POST',
    data: options
  });
}