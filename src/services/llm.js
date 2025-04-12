// src/services/llm.js
import request from '@/utils/request';

export async function fetchLlmProviders() {
  return request('/api/admin/v1/llm/providers', {
    method: 'GET'
  });
}

export async function fetchLlmProviderDetail(provider_id) {
  return request('/api/admin/v1/llm/provider/detail', {
    method: 'GET',
    params: { provider_id }
  });
}

export async function fetchLlmProviderModels(provider_id) {
  return request('/api/admin/v1/llm/provider/models', {
    method: 'GET',
    params: { provider_id }
  });
}

export async function updateLlmProviderConfig(config) {
  return request('/api/admin/v1/llm/provider/update_config', {
    method: 'POST',
    data: config
  });
}

export async function testLlmProvider(data) {
  return request('/api/admin/v1/llm/provider/test', {
    method: 'POST',
    data
  });
}