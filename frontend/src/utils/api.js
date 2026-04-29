import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: only redirect to /login if the token is genuinely missing/expired
// (not for business-logic 401s like wrong password or inactive account)
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    const message = err.response?.data?.message || '';

    // Never redirect on auth endpoints — they handle their own errors
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/me') ||
      url.includes('/auth/forgot') ||
      url.includes('/auth/reset');

    // Only redirect when the token itself is invalid/expired/missing
    // NOT for "Account is inactive" or other business-logic 401s
    const isTokenError =
      status === 401 &&
      !isAuthEndpoint &&
      (message.toLowerCase().includes('token') ||
        message.toLowerCase().includes('no token') ||
        message.toLowerCase().includes('invalid token') ||
        message.toLowerCase().includes('expired') ||
        !localStorage.getItem('token'));

    if (isTokenError && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;
