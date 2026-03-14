export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token?:string;
  errors?: { field: string; message: string }[];
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    };

    try {
      console.log('Using cookies')
      const response = await fetch(url, config);
      const data = await response.json();
      

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Something went wrong',
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      console.log('error',error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Auth API functions
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    region?: string;
    woreda?: string;
    farmSize?: string;
    crops?: string;
    experience?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout', {}),
};

// Products API functions
export const productsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/products${query}`);
  },

  getById: (id: string) => api.get(`/products/${id}`),

  create: (data: unknown) => api.post('/products', data),

  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),
};
