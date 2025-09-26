import axios from 'axios';

// TEMPORARY: Force use of production API for testing
const API_BASE_URL = 'https://taskmanager-production-4880.up.railway.app';


// Debug: Log the API URL being used
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📝 All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token and debug
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request to:', config.baseURL + config.url);
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

// Response interceptor for error handling and debug
api.interceptors.response.use(
  (response) => {
    console.log('✅ API response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      fullError: error
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;