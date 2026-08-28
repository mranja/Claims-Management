import axios from 'axios';

// API Base URL
// Local development: falls back to Vite proxy -> /api
// Production: uses VITE_API_BASE_URL from Vercel
const getBaseURL = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  if (baseURL) {
    return baseURL.replace(/\/+$/, '');
  }

  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// Attach JWT Authorization token
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

// Response handling + authentication errors
API.interceptors.response.use(
  (response) => response.data,

  (error) => {
    // Handle unauthorized user
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      if (
        currentPath !== '/login' &&
        currentPath !== '/signup' &&
        currentPath !== '/'
      ) {
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

// ======================================================
// AUTH API
// ======================================================

export const authApi = {
  login: (credentials) =>
    API.post('/auth/login', credentials),

  register: (userData) =>
    API.post('/auth/register', userData),

  getMe: () =>
    API.get('/auth/me'),
};

// ======================================================
// USERS API
// ======================================================

export const usersApi = {
  updateMe: (profile) =>
    API.patch('/users/me', profile),

  uploadAvatar: (formData) =>
    API.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  changePassword: (passwords) =>
    API.patch('/users/me/password', passwords),

  getAllPatients: () =>
    API.get('/users/patients'),
};

// ======================================================
// CLAIMS API
// ======================================================

export const claimsApi = {
  // Patient / insurer: submit a new claim
  submitClaim: (formData) =>
    API.post('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Patient: get own claims
  getPatientClaims: () =>
    API.get('/claims/mine'),

  // Insurer: get all claims with filters
  getAllClaims: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) {
      params.append('status', filters.status);
    }

    if (filters.minAmount) {
      params.append('minAmount', filters.minAmount);
    }

    if (filters.maxAmount) {
      params.append('maxAmount', filters.maxAmount);
    }

    if (filters.fromDate) {
      params.append('fromDate', filters.fromDate);
    }

    if (filters.toDate) {
      params.append('toDate', filters.toDate);
    }

    if (filters.riskLevel) {
      params.append('riskLevel', filters.riskLevel);
    }

    const queryString = params.toString();

    return API.get(
      queryString ? `/claims?${queryString}` : '/claims'
    );
  },

  // Get a single claim
  getClaimById: (id) =>
    API.get(`/claims/${id}`),

  // Insurer: approve/reject/update claim
  updateClaimStatus: (id, statusData) =>
    API.patch(`/claims/${id}/status`, statusData),
};

// ======================================================
// AI API
// ======================================================

export const aiApi = {
  // Re-run AI claim analysis
  reanalyzeClaim: (claimId) =>
    API.post(`/ai/claims/${claimId}/reanalyze`),

  // Policy RAG query
  queryPolicyRag: (query, policyCode) =>
    API.post('/ai/policy/query', {
      query,
      policyCode,
    }),

  // Get policies
  getPolicies: () =>
    API.get('/ai/policies'),

  // Create policy
  createPolicy: (policyData) =>
    API.post('/ai/policies', policyData),

  // Patient AI assistant
  patientAssistantChat: (message, claimId) =>
    API.post('/ai/patient-chat', {
      message,
      claimId,
    }),

  // AI operational analytics
  getAnalytics: () =>
    API.get('/ai/analytics'),
};

// Export configured Axios instance
export default API;
