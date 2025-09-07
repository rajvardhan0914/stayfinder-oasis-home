import axios from 'axios';

// Use full server URL for development
const SERVER_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Configuration loaded

const api = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Basic token validation (check if it's a valid JWT format)
        const parts = token.split('.');
        if (parts.length !== 3) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return config;
        }
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // This function recursively finds and fixes image URLs in the response data
    const fixImagePaths = (data: any): any => {
      if (!data) return data;
      
      if (Array.isArray(data)) {
        return data.map(item => fixImagePaths(item));
      }
      
      if (typeof data === 'object') {
        // Fix owner avatar
        if (data.owner?.avatar && !data.owner.avatar.startsWith('http')) {
          data.owner.avatar = `${SERVER_BASE_URL}${data.owner.avatar}`;
        }
        
        // Fix user avatar
        if (data.avatar && !data.avatar.startsWith('http')) {
          data.avatar = `${SERVER_BASE_URL}${data.avatar}`;
        }
        
        // Recursively check other properties
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = fixImagePaths(data[key]);
          }
        }
      }
      return data;
    };
    
    if (response.data) {
      response.data = fixImagePaths(response.data);
    }
    
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
      return Promise.reject(error);
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        // Only redirect to login if it's not a profile update request
        if (!error.config?.url?.includes('/users/profile')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        break;
      case 403:
        error.message = 'Access denied. Please check your permissions.';
        break;
      case 404:
        error.message = 'Resource not found.';
        break;
      case 500:
        error.message = 'Server error. Please try again later.';
        break;
      default:
        error.message = error.response?.data?.message || 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

export default api; 