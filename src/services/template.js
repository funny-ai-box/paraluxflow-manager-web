import request from '@/utils/request';

export async function fetchTemplates(params = {}) {
      return request('/api/v1/templates', {
        method: 'GET',
        params
      });
    }
    
    // Fetch template details
    export async function fetchTemplateDetail(id) {
      return request(`/api/v1/templates`, {
        method: 'GET',
        params: { id }
      });
    }
    
    // Create new template
    export async function createTemplate(data) {
      return request('/api/v1/templates/create', {
        method: 'POST',
        data
      });
    }
    
    // Update existing template
    export async function updateTemplate(id, data) {
      return request(`/api/v1/templates`, {
        method: 'POST',
        data: { id, ...data }
      });
    }
    
    // Update template status
    export async function updateTemplateStatus(data) {
      return request('/api/v1/templates/status', {
        method: 'POST',
        data
      });
    }
    
    // Fetch template script
    export async function fetchTemplateScript(id) {
      return request(`/api/v1/templates/script`, {
        method: 'GET',
        params: { id }
      });
    }
    
    // Update template script
    export async function updateTemplateScript(id, data) {
      return request(`/api/v1/templates/script`, {
        method: 'POST',
        data: { id, ...data }
      });
    }
    
    // Test template script
    export async function testTemplateScript(formData) {
      return request('/api/v1/templates/test-script', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    // Fetch template usage data
    export async function fetchTemplateUsage(id) {
      return request(`/api/v1/templates/usage`, {
        method: 'GET',
        params: { id }
      });
    }

    