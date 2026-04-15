import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Token Refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Standard response shape from backend: { success: true, data: ... }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (!refreshToken) {
        // No refresh token, force logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
        
        if (res.data.success) {
          const { access_token } = res.data.data;
          localStorage.setItem('token', access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          processQueue(null, access_token);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const MOCK_MODE = false;

const MOCK_DATA: Record<string, any> = {
  '/supplier/me': {
    id: 'mock-id',
    companyName: 'Delraw Mock Supplier',
    status: 'VERIFIED',
    email: 'mock@delraw.com',
    gstNumber: '22AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    address: '123 Business Park, Mumbai',
    city: 'Mumbai',
    country: 'India',
    yearEstablished: 2020,
    workforceSize: 50,
    monthlyCapacity: 5000,
  },
  '/supplier/dashboard': {
    productStats: {
      total: 12,
      live: 8,
      pending: 4,
    }
  },
  '/products': [
    { id: '1', name: 'Premium Cotton Tee', category: 'Apparel', price: 1200, status: 'LIVE', supplier: { companyName: 'Mock Supplier A' } },
    { id: '2', name: 'Eco-Friendly Tote', category: 'Accessories', price: 450, status: 'PENDING', supplier: { companyName: 'Mock Supplier A' } },
    { id: '3', name: 'Leather Wallet', category: 'Accessories', price: 2100, status: 'LIVE', supplier: { companyName: 'Mock Supplier A' } },
  ],
  '/admin/stats': {
    suppliers: { total: 128, pending: 5 },
    products: { live: 450, pending: 12 },
    users: { total: 156 },
  },
  '/admin/suppliers/pending': [
    { id: 'sup1', companyName: 'Apex Industries', status: 'SUBMITTED', user: { email: 'apex@example.com' } },
    { id: 'sup2', companyName: 'Lockdown Mfg', status: 'UNDER_REVIEW', user: { email: 'lockdown@example.com' } },
  ],
  '/admin/products?status=PENDING_APPROVAL': [
    { id: 'prod1', name: 'Solar Panel v2', price: 15000, supplier: { companyName: 'Green Energy Ltd' } },
    { id: 'prod2', name: 'Wireless Mouse', price: 800, supplier: { companyName: 'Tech Gadgets' } },
  ],
  '/auth/me': {
    id: 'mock-admin-id',
    email: 'admin@delraw.com',
    role: 'ADMIN',
  },
  '/auth/login': {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    user: {
      id: 'mock-id',
      email: 'alex@company.com',
      role: 'SUPPLIER' // Try 'ADMIN' or 'SUPER_ADMIN' to test other roles
    }
  },
  '/auth/verify-otp': {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    user: {
      id: 'mock-id',
      email: 'alex@company.com',
      role: 'SUPPLIER'
    }
  },
  '/products/categories': [
    'Apparel',
    'Accessories',
    'Electronics',
    'Home & Garden',
    'Beauty & Personal Care',
    'Industrial',
  ],
  '/supplier/submit': { success: true }
};

export const fetchWithAuth = async (url: string, options: any = {}) => {
  if (MOCK_MODE) {
    console.log(`[MOCK API] ${url}`);
    
    // Prefer exact match first
    if (MOCK_DATA[url]) {
      return MOCK_DATA[url];
    }

    // Support partial match for complex URLs (like query params)
    const mockKey = Object.keys(MOCK_DATA).find(k => url.includes(k));
    return mockKey ? MOCK_DATA[mockKey] : { success: true, message: 'Mock response' };
  }

  const method = options.method?.toLowerCase() || 'get';
  const data = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
  
  // Axios will handle the headers and token via interceptors
  const response: any = await api({
    url,
    method,
    data,
    ...options,
    headers: {
      ...options.headers,
    }
  });
  
  // Return the data directly as fetchWithAuth did .json()
  return response;
};

export default api;
