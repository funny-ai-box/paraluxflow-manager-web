import request from '@/utils/request';
export async function fetchRecommendationRules() {
      return request('/api/v1/recommendation/rules', {
        method: 'GET'
      });
    }
    
    // Create recommendation rule
    export async function createRecommendationRule(data) {
      return request('/api/v1/recommendation/rules', {
        method: 'POST',
        data
      });
    }
    
    // Update recommendation rule
    export async function updateRecommendationRule(id, data) {
      return request(`/api/v1/recommendation/rules`, {
        method: 'POST',
        data: { id, ...data }
      });
    }
    
    // Delete recommendation rule
    export async function deleteRecommendationRule(id) {
      return request(`/api/v1/recommendation/rules`, {
        method: 'POST',
        data: { id }
      });
    }
    
    // Reorder recommendation rules
    export async function reorderRecommendationRules(data) {
      return request('/api/v1/recommendation/rules/reorder', {
        method: 'POST',
        data
      });
    }
    

    export async function fetchContentList(params = {}) {
      return request('/api/v1/recommendation/content', {
        method: 'GET',
        params
      });
    }
    

    export async function adjustContentScore(id, data) {
      return request(`/api/v1/recommendation/content/score`, {
        method: 'POST',
        data: { id, ...data }
      });
    }
    

    export async function pinContent(id) {
      return request(`/api/v1/recommendation/content/pin`, {
        method: 'POST',
        data: { id }
      });
    }
    

    export async function unpinContent(id) {
      return request(`/api/v1/recommendation/content/unpin`, {
        method: 'POST',
        data: { id }
      });
    }
    

    export async function lockContent(id) {
      return request(`/api/v1/recommendation/content/lock`, {
        method: 'POST',
        data: { id }
      });
    }
    

    export async function unlockContent(id) {
      return request(`/api/v1/recommendation/content/unlock`, {
        method: 'POST',
        data: { id }
      });
    }
    
      export async function bulkAdjustContent(data) {
      return request('/api/v1/recommendation/content/bulk-adjust', {
        method: 'POST',
        data
      });
    }