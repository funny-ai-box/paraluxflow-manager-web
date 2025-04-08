

import request, { saveAuthToken, clearAuthToken, getAuthToken } from '@/utils/request';

export async function login(data) {
  const response = await request('/api/v1/auth/login', {
    method: 'POST',
    data
  });
  
  // If login was successful, save the token
  if (response.code === 200 && response.data?.token) {
    saveAuthToken(response.data.token);
  }
  
  return response;
}

export async function logout() {
  clearAuthToken();
  window.location.href = '/auth/login';
}

export function isAuthenticated() {
  return !!getAuthToken();
}


export async function register(data) {
  return request('/api/v1/auth/register', {
    method: 'POST',
    data
  });
}

export async function getPublicKey() {
  return request('/api/v1/auth/public_key', {
    method: 'GET'
  });
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

