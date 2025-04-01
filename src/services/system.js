import request from '@/utils/request';

export async function fetchSystemLogs(params = {}) {
      return request('/api/v1/system/logs', {
        method: 'GET',
        params
      });
    }
    
    // Export logs
    export async function exportLogs(params = {}) {
      return request('/api/v1/system/logs/export', {
        method: 'GET',
        params,
        responseType: 'blob'
      });
    }
    
    // Fetch alert rules
    export async function fetchAlertRules() {
      return request('/api/v1/system/alerts/rules', {
        method: 'GET'
      });
    }
    
    // Create alert rule
    export async function createAlertRule(data) {
      return request('/api/v1/system/alerts/rules', {
        method: 'POST',
        data
      });
    }
    
    // Update alert rule
    export async function updateAlertRule(id, data) {
      return request(`/api/v1/system/alerts/rules/${id}`, {
        method: 'PUT',
        data
      });
    }
    
    // Delete alert rule
    export async function deleteAlertRule(id) {
      return request(`/api/v1/system/alerts/rules/${id}`, {
        method: 'DELETE'
      });
    }
    
    // Fetch alert history
    export async function fetchAlertHistory() {
      return request('/api/v1/system/alerts/history', {
        method: 'GET'
      });
    }
    
    // Test alert rule
    export async function testAlertRule(id) {
      return request(`/api/v1/system/alerts/rules/${id}/test`, {
        method: 'POST'
      });
    }