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
      return request(`/api/v1/recommendation/rules/${id}`, {
        method: 'PUT',
        data
      });
    }
    
    // Delete recommendation rule
    export async function deleteRecommendationRule(id) {
      return request(`/api/v1/recommendation/rules/${id}`, {
        method: 'DELETE'
      });
    }
    
    // Reorder recommendation rules
    export async function reorderRecommendationRules(data) {
      return request('/api/v1/recommendation/rules/reorder', {
        method: 'PUT',
        data
      });
    }
    
    // Fetch content list for adjustment
    export async function fetchContentList(params = {}) {
      return request('/api/v1/recommendation/content', {
        method: 'GET',
        params
      });
    }
    
    // Adjust content score
    export async function adjustContentScore(id, data) {
      return request(`/api/v1/recommendation/content/${id}/score`, {
        method: 'PUT',
        data
      });
    }
    
    // Pin content
    export async function pinContent(id) {
      return request(`/api/v1/recommendation/content/${id}/pin`, {
        method: 'PUT'
      });
    }
    
    // Unpin content
    export async function unpinContent(id) {
      return request(`/api/v1/recommendation/content/${id}/unpin`, {
        method: 'PUT'
      });
    }
    
    // Lock content
    export async function lockContent(id) {
      return request(`/api/v1/recommendation/content/${id}/lock`, {
        method: 'PUT'
      });
    }
    
    // Unlock content
    export async function unlockContent(id) {
      return request(`/api/v1/recommendation/content/${id}/unlock`, {
        method: 'PUT'
      });
    }
    
    // Bulk adjust content
    export async function bulkAdjustContent(data) {
      return request('/api/v1/recommendation/content/bulk-adjust', {
        method: 'PUT',
        data
      });
    }