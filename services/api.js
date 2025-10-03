// services/api.js - Base configuration for deployed backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = axios.create({
  baseURL: `https://tuitionapp-backend-hwrs.onrender.com/api`, // ✅ Deployed backend
  withCredentials: true,
  timeout: 15000,
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
// Add better error handling to the response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // For rating duplicate errors, we want to let the component handle it
    if (error.response?.status === 400 && error.config?.url.includes('/ratings')) {
      // Don't do anything special - let the component handle 400 for ratings
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      AsyncStorage.multiRemove(['token', 'role', 'userEmail', 'userName', 'userId']);
    }

    return Promise.reject(error);
  }
);
export default API;
