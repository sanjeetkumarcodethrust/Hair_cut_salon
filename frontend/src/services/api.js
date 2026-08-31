import axios from 'axios';
import toast from 'react-hot-toast';

const runtimeApiUrl =
  typeof window !== 'undefined' && window.__API_URL__
    ? window.__API_URL__
    : '';

const apiBaseURL =
  runtimeApiUrl ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'https://hair-cut-salon-1.onrender.com/api');

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.token) {
          config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = 'An unexpected error occurred.';

    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      customMessage = 'Unable to connect to backend server. Please verify the server is running.';
      toast.error(customMessage, { id: 'network-error' });
    } else if (error.code === 'ECONNABORTED') {
      customMessage = 'Request timed out. Please try again.';
      toast.error(customMessage, { id: 'timeout-error' });
    } else if (error.response) {
      const { status, data } = error.response;
      if (status === 503) {
        customMessage = 'Backend service is currently unavailable or suspended.';
        toast.error(customMessage, { id: 'service-unavailable' });
      } else if (status === 401) {
        customMessage = 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        customMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        customMessage = 'The requested resource was not found.';
      } else if (status >= 500) {
        customMessage = 'Server error. Please try again later.';
        toast.error(customMessage, { id: 'server-error' });
      } else {
        customMessage = data?.message || customMessage;
      }
    }

    error.customMessage = customMessage;
    return Promise.reject(error);
  }
);

export default api;
