import request from '@/utils/request';

export async function fetchTemplates(params = {}) {
      return request('/api/v1/templates', {
        method: 'GET',
        params
      });
    }
    
    // Fetch template details
    export async function fetchTemplateDetail(id) {
      return request(`/api/v1/templates/${id}`, {
        method: 'GET'
      });
    }
    
    // Create new template
    export async function createTemplate(data) {
      return request('/api/v1/templates', {
        method: 'POST',
        data
      });
    }
    
    // Update existing template
    export async function updateTemplate(id, data) {
      return request(`/api/v1/templates/${id}`, {
        method: 'PUT',
        data
      });
    }
    
    // Update template status
    export async function updateTemplateStatus(data) {
      return request('/api/v1/templates/status', {
        method: 'PUT',
        data
      });
    }
    
    // Fetch template script
    export async function fetchTemplateScript(id) {
      return request(`/api/v1/templates/${id}/script`, {
        method: 'GET'
      });
    }
    
    // Update template script
    export async function updateTemplateScript(id, data) {
      return request(`/api/v1/templates/${id}/script`, {
        method: 'PUT',
        data
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
      return request(`/api/v1/templates/${id}/usage`, {
        method: 'GET'
      });
    }

    