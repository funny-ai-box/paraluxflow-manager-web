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

// Auth helper functions
const AUTH_TOKEN_KEY = 'auth_token';

const saveAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
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
    // Add Bearer token if available
    const token = getAuthToken();
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

// Redirect to login page
const redirectToLogin = () => {
  clearAuthToken();
  // Use window.location to force a full page reload
  window.location.href = '/auth/login';
};

// Error handler
const handleError = (error) => {
  if (error.response) {
    // Server responded with non-2xx status
    const status = error.response.status;
    
    if (status === 401 || status === 403) {
      // Unauthorized or Forbidden - redirect to login
      message.error('Authentication required, please login again');
      redirectToLogin();
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

// Request function - simplified to only handle GET and POST
const request = async (url, options = {}) => {
  try {
    // Method defaults to GET
    const method = options.method || 'GET';
    
    // Handle GET and POST methods only
    if (method === 'GET') {
      return instance.get(url, { params: options.params });
    } else if (method === 'POST') {
      return instance.post(url, options.data, { params: options.params });
    } else {
      console.warn(`Unsupported method: ${method}. Using POST as fallback.`);
      return instance.post(url, options.data, { params: options.params });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

// Export auth functions to be used in auth service
export { saveAuthToken, getAuthToken, clearAuthToken };
export default request;