import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api' // Adjust if your API is hosted elsewhere
});

// Authentication service
export const authService = {
  // Login method
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  
  // Register method
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  
  // Get current user
  getCurrentUser: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return api.get('/auth/me', {
      headers: {
        'x-auth-token': token
      }
    });
  },
  
  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};

// Add other API services here