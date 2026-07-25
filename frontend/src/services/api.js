import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

// Interceptor to attach Authorization Bearer Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('claims_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to format response & handle 401 unauthenticated
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('claims_jwt_token');
        localStorage.removeItem('claims_user');
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// API Modules
export const authApi = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

export const usersApi = {
  updateMe: (profile) => API.patch('/users/me', profile),
  uploadAvatar: (formData) => API.patch('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (passwords) => API.patch('/users/me/password', passwords),
};

export const claimsApi = {
  // Submit new claim (multipart form data)
  submitClaim: (formData) =>
    API.post('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Patient view own claims
  getPatientClaims: () => API.get('/claims/mine'),

  // Insurer view all claims with filters
  getAllClaims: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    return API.get(`/claims?${params.toString()}`);
  },

  // Insurer view single claim
  getClaimById: (id) => API.get(`/claims/${id}`),

  // Insurer update claim status
  updateClaimStatus: (id, statusData) =>
    API.patch(`/claims/${id}/status`, statusData),
};

export default API;
