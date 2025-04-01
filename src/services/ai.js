import request from '@/utils/request';

export async function fetchAIModels() {
      return request('/api/v1/ai/models', {
        method: 'GET'
      });
    }
    
    // Create AI model
    export async function createAIModel(data) {
      return request('/api/v1/ai/models', {
        method: 'POST',
        data
      });
    }
    
    // Update AI model
    export async function updateAIModel(id, data) {
      return request(`/api/v1/ai/models/${id}`, {
        method: 'PUT',
        data
      });
    }
    
    // Delete AI model
    export async function deleteAIModel(id) {
      return request(`/api/v1/ai/models/${id}`, {
        method: 'DELETE'
      });
    }
    
    // Fetch content types
    export async function fetchContentTypes() {
      return request('/api/v1/ai/content-types', {
        method: 'GET'
      });
    }
    
    // Update content type model mapping
    export async function updateContentTypeModelMapping(id, data) {
      return request(`/api/v1/ai/content-types/${id}/mapping`, {
        method: 'PUT',
        data
      });
    }
    
    // Fetch summary templates
    export async function fetchSummaryTemplates() {
      return request('/api/v1/ai/templates', {
        method: 'GET'
      });
    }
    
    // Create summary template
    export async function createSummaryTemplate(data) {
      return request('/api/v1/ai/templates', {
        method: 'POST',
        data
      });
    }
    
    // Update summary template
    export async function updateSummaryTemplate(id, data) {
      return request(`/api/v1/ai/templates/${id}`, {
        method: 'PUT',
        data
      });
    }
    
    // Delete summary template
    export async function deleteSummaryTemplate(id) {
      return request(`/api/v1/ai/templates/${id}`, {
        method: 'DELETE'
      });
    }
    
    // Test summary template
    export async function testSummaryTemplate(id) {
      return request(`/api/v1/ai/templates/${id}/test`, {
        method: 'POST'
      });
    }
    
    // Fetch user feedback
    export async function fetchUserFeedback(templateId) {
      return request(`/api/v1/ai/feedback`, {
        method: 'GET',
        params: { template_id: templateId }
      });
    }
    
    // Fetch feedback analytics
    export async function fetchFeedbackAnalytics(params = {}) {
      return request('/api/v1/ai/feedback/analytics', {
        method: 'GET',
        params
      });
    }
    
    // Fetch feedback details
    export async function fetchFeedbackDetails(params = {}) {
      return request('/api/v1/ai/feedback/details', {
        method: 'GET',
        params
      });
    }
    
    // Export feedback data
    export async function exportFeedbackData(params = {}) {
      return request('/api/v1/ai/feedback/export', {
        method: 'GET',
        params,
        responseType: 'blob'
      });
    }