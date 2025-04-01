import request from '@/utils/request';
export async function fetchScheduledTasks() {
      return request('/api/v1/tasks/scheduled', {
        method: 'GET'
      });
    }
    
    // Create scheduled task
    export async function createScheduledTask(data) {
      return request('/api/v1/tasks/scheduled', {
        method: 'POST',
        data
      });
    }
    
    // Update scheduled task
    export async function updateScheduledTask(id, data) {
      return request(`/api/v1/tasks/scheduled/${id}`, {
        method: 'PUT',
        data
      });
    }
    
    // Delete scheduled task
    export async function deleteScheduledTask(id) {
      return request(`/api/v1/tasks/scheduled/${id}`, {
        method: 'DELETE'
      });
    }
    
    // Run task manually
    export async function runTaskManually(id) {
      return request(`/api/v1/tasks/scheduled/${id}/run`, {
        method: 'POST'
      });
    }
    
    // Fetch task groups
    export async function fetchTaskGroups() {
      return request('/api/v1/tasks/groups', {
        method: 'GET'
      });
    }
    
    // Fetch task history
    export async function fetchTaskHistory(taskId) {
      return request(`/api/v1/tasks/history`, {
        method: 'GET',
        params: { task_id: taskId }
      });
    }
    
    // Fetch tasks stats
    export async function fetchTasksStats(params = {}) {
      return request('/api/v1/tasks/stats', {
        method: 'GET',
        params
      });
    }
    
    // Fetch active runs
    export async function fetchActiveRuns() {
      return request('/api/v1/tasks/runs/active', {
        method: 'GET'
      });
    }
    
    // Fetch recent tasks
    export async function fetchRecentTasks(params = {}) {
      return request('/api/v1/tasks/recent', {
        method: 'GET',
        params
      });
    }
    
    // Fetch tasks performance
    export async function fetchTasksPerformance(params = {}) {
      return request('/api/v1/tasks/performance', {
        method: 'GET',
        params
      });
    }
    
    // Export tasks report
    export async function exportTasksReport(params = {}) {
      return request('/api/v1/tasks/export', {
        method: 'GET',
        params,
        responseType: 'blob'
      });
    }