import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
});

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable request/response logging in development
  ...(process.env.NODE_ENV === 'development' && {
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors
  }),
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      // Log requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
          params: config.params,
        });
      }
      
      return config;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to signin
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
      }
      
      // Extract error message from response
      const errorMessage = data?.error || data?.message || `HTTP error! status: ${status}`;
      error.message = errorMessage;
      
      // Log error responses in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          data,
          message: errorMessage,
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      error.message = error.message || 'Request failed';
    }
    
    console.error('API request failed:', error);
    return Promise.reject(error);
  }
);

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export async function apiCall<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  try {
    const { method = 'GET', body, headers = {}, params } = options;

    const config: AxiosRequestConfig = {
      method: method.toLowerCase(),
      url: endpoint,
      headers,
      params,
    };

    if (body && method !== 'GET') {
      config.data = body;
    }

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // Error is already handled by interceptor, just rethrow
    throw error;
  }
}

// Convenience methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: 'GET', params, headers }),

  post: <T = any>(endpoint: string, body: any, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: 'POST', body, headers }),

  put: <T = any>(endpoint: string, body: any, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: 'PUT', body, headers }),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: 'DELETE', headers }),

  patch: <T = any>(endpoint: string, body: any, headers?: Record<string, string>) =>
    apiCall<T>(endpoint, { method: 'PATCH', body, headers }),
};

// Special method for file uploads (FormData)
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: endpoint,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // Error is already handled by interceptor, just rethrow
    throw error;
  }
}

// Utility function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.access_token;
  } catch (error) {
    return false;
  }
}

// Utility function to get current user session
export async function getCurrentSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    return null;
  }
}

// Utility function to refresh session
export async function refreshSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.refresh_token) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refresh_token,
      });
      return { data, error };
    }
    return { data: null, error: 'No refresh token available' };
  } catch (error) {
    return { data: null, error };
  }
}

// Export the axios instance for advanced usage
export { apiClient }; 