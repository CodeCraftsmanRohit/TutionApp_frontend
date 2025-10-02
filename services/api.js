// services/api.js - Base configuration for deployed backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = axios.create({
  baseURL: `https://tuitionapp-backend-m786.onrender.com/api`, // ✅ Deployed backend
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
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      AsyncStorage.multiRemove(['token', 'role', 'userEmail', 'userName', 'userId']);
      // Optional: navigate to login screen if using react-navigation
      // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }

    return Promise.reject(error);
  }
);

export default API;
