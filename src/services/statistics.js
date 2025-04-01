import request from '@/utils/request';

export async function fetchCrawlStats(params = {}) {
      return request('/api/v1/statistics/crawl', {
        method: 'GET',
        params
      });
    }
    
    // Fetch subscription stats
    export async function fetchSubscriptionStats(params = {}) {
      return request('/api/v1/statistics/subscriptions', {
        method: 'GET',
        params
      });
    }
    
    // Fetch source stats
    export async function fetchSourceStats(params = {}) {
      return request('/api/v1/statistics/sources', {
        method: 'GET',
        params
      });
    }
    
    // Export statistics data
    export async function exportStatisticsData(params = {}) {
      return request('/api/v1/statistics/export', {
        method: 'GET',
        params,
        responseType: 'blob'
      });
    }