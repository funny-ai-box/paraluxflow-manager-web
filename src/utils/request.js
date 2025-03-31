import axios from 'axios';
import { message, notification } from 'antd';

// Error handling types
const ErrorShowType = {
  SILENT: 0,
  WARN_MESSAGE: 1,
  ERROR_MESSAGE: 2,
  NOTIFICATION: 3,
  REDIRECT: 9,
};

// Create axios instance
const instance = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add token if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // Handle different response structures
    if (res.code !== undefined && res.code !== 200) {
      // API error with code
      handleError(res);
      return Promise.reject(new Error(res.message || 'Error'));
    }
    
    return res;
  },
  (error) => {
    handleError(error);
    return Promise.reject(error);
  }
);

// Error handler
const handleError = (error) => {
  if (error.response) {
    // Server responded with non-2xx status
    const status = error.response.status;
    
    if (status === 401) {
      // Unauthorized - redirect to login
      message.error('Unauthorized, please login again');
      // Clear user data and redirect
      localStorage.removeItem('token');
      window.location.href = '/user/login';
    } else if (status === 403) {
      message.error('Forbidden access');
    } else if (status === 404) {
      message.error('Resource not found');
    } else if (status === 500) {
      message.error('Server error, please try again later');
    } else {
      message.error(`Request failed with status ${status}`);
    }
  } else if (error.request) {
    // No response received
    message.error('No response from server, please check your network');
  } else if (error.code && error.message) {
    // Handle API error
    let errorMsg = error.message;
    
    switch (error.showType || ErrorShowType.ERROR_MESSAGE) {
      case ErrorShowType.SILENT:
        // Do nothing
        break;
      case ErrorShowType.WARN_MESSAGE:
        message.warning(errorMsg);
        break;
      case ErrorShowType.ERROR_MESSAGE:
        message.error(errorMsg);
        break;
      case ErrorShowType.NOTIFICATION:
        notification.error({
          message: 'Error',
          description: errorMsg,
        });
        break;
      case ErrorShowType.REDIRECT:
        // Could add redirect logic here
        break;
      default:
        message.error(errorMsg);
    }
  } else {
    // Other errors
    message.error('An unexpected error occurred');
  }
};

// Request function
const request = async (url, options = {}) => {
  try {
    // Method defaults to GET
    const method = options.method || 'GET';
    
    // Handle different request methods
    if (method === 'GET') {
      return instance.get(url, { params: options.params });
    } else if (method === 'POST') {
      return instance.post(url, options.data, { params: options.params });
    } else if (method === 'PUT') {
      return instance.put(url, options.data, { params: options.params });
    } else if (method === 'DELETE') {
      return instance.delete(url, { data: options.data, params: options.params });
    } else {
      return instance.request({
        url,
        ...options,
      });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export default request;