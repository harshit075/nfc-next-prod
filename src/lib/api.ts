import axios from 'axios';

/**
 * Configure Axios Client.
 * Automatically adds the JWT Bearer token to headers.
 * Intercepts 401 errors to silently rotate access tokens via refresh endpoint.
 */
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }
};

// Initialize token from localStorage on client-side boot
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem('accessToken');
  if (savedToken) {
    setAccessToken(savedToken);
  }
}

// Global response interceptor for token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      try {
        // Attempt silent token refresh
        const { data } = await axios.post('/api/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default api;
