import axios from 'axios';

// Smart API URL detection for different environments
const getApiBaseUrl = () => {
  // 1. Check for explicit environment variable (Railway deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Production environment - use Railway backend
  if (import.meta.env.PROD) {
    return 'https://taskmanager-production-4880.up.railway.app';
  }
  
  // 3. Development environment - check if running in different contexts
  const hostname = window.location.hostname;
  
  // Jenkins or CI environment (usually localhost but might be different port)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check if backend is available locally, otherwise use Railway
    return 'http://localhost:8000';
  }
  
  // 4. Fallback to Railway for any other case
  return 'https://taskmanager-production-4880.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API URL being used (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.MODE);
  console.log('🏠 Hostname:', window.location.hostname);
  console.log('📝 VITE_API_URL:', import.meta.env.VITE_API_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for Railway cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('🚀 Making API request to:', config.baseURL + config.url);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('✅ API response success:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Always log errors, but with different detail levels
    if (import.meta.env.DEV) {
      console.error('❌ API response error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      // Production - log less detail
      console.error('API Error:', error.response?.status, error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;