// services/api.js - Add base configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = axios.create({
  baseURL: `http://10.41.36.179:4000/api`, // Replace with your IP
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
      // Token expired or invalid
      AsyncStorage.multiRemove(['token', 'role', 'userEmail', 'userName', 'userId']);
      // You might want to redirect to login here
    }

    return Promise.reject(error);
  }
);

export default API;