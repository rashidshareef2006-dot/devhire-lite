import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request: auto-attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 pe auto-logout (sirf non-auth endpoints pe)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthCall) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;