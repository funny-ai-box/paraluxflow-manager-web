import request from '@/utils/request';

export async function fetchAIModels() {
      return request('/api/v1/ai/models', {
        method: 'GET'
      });
    }
    
    // Create AI model
    export async function createAIModel(data) {
      return request('/api/v1/ai/models/create', {
        method: 'POST',
        data
      });
    }
    
    // Update AI model
    export async function updateAIModel(id, data) {
      return request(`/api/v1/ai/models/update`, {
        method: 'Post',
        data: { id, ...data }
      });
    }
    
    // Delete AI model
    export async function deleteAIModel(id) {
      return request(`/api/v1/ai/models/delete`, {
        method: 'POST',
        data: { id }
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
      return request(`/api/v1/ai/content-types/mapping`, {
        method: 'POST',
        data: { id, ...data }
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
      return request('/api/v1/ai/templates/create', {
        method: 'POST',
        data
      });
    }
    
    // Update summary template
    export async function updateSummaryTemplate(id, data) {
      return request(`/api/v1/ai/templates/update`, {
        method: 'POST',
        data: { id, ...data }
      });
    }
    
    // Delete summary template
    export async function deleteSummaryTemplate(id) {
      return request(`/api/v1/ai/templates/delete`, {
        method: 'POST',
        data: { id }
      });
    }
    
    // Test summary template
    export async function testSummaryTemplate(id) {
      return request(`/api/v1/ai/templates/test`, {
        method: 'POST',
        data: { id }
      });
    }
    
   