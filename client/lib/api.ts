export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// smtg
import { Product } from '@/types/product';
import { Farm, CreateFarmData, UpdateFarmData } from '@/types/farm';

export type ApiResponse<T> = {
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
  total?: number;
  pages?: number;
  length?: number;
  count?: number;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** JWT from login/register (cookie alone is unreliable cross-origin on localhost). */
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    if (token && token !== 'none') {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
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
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (
        response.ok &&
        typeof window !== 'undefined' &&
        data?.token &&
        data.token !== 'none'
      ) {
        localStorage.setItem('token', data.token);
      }

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

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

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

export const farmsApi = {
  getMyFarms: () => api.get<Farm[]>('/farms'),

  getFarm: (id: string) => api.get<Farm>(`/farms/${id}`),

  create: (data: CreateFarmData) => api.post<Farm>('/farms', data),

  update: (id: string, data: UpdateFarmData) => api.put<Farm>(`/farms/${id}`, data),

  delete: (id: string) => api.delete(`/farms/${id}`),
};

export type AppNotification = {
  id: string;
  key?: string;
  type: string;
  href: string;
  createdAt: string;
  count?: number;
  note?: string | null;
  isRead?: boolean;
};

export const notificationsApi = {
  getAll: () =>
    api.get<{ notifications: AppNotification[]; unreadCount: number }>('/notifications'),

  markRead: (key: string) =>
    api.patch<{ notifications: AppNotification[]; unreadCount: number }>(
      `/notifications/${encodeURIComponent(key)}/read`
    ),

  markAllRead: () =>
    api.patch<{ notifications: AppNotification[]; unreadCount: number }>(
      '/notifications/read-all'
    ),

  dismiss: (key: string) =>
    api.delete<{ notifications: AppNotification[]; unreadCount: number }>(
      `/notifications/${encodeURIComponent(key)}`
    ),
};

export const agriaiApi = {
  predictPrice: (data: { crop_name: string; region: string; year: number; month: number }) =>
    api.post('/agriai/predict/price', data),

  getPriceForecasterMetadata: () =>
    api.get<{ crops: string[]; regions: string[] }>('/agriai/price-forecaster/metadata'),
};

export interface PriceRecord {
  id: string;
  cropName: string;
  region: string;
  year: number;
  month: number;
  avgPrice: number;
  minPrice: number | null;
  maxPrice: number | null;
  source: string | null;
}

export interface SalesTimingResult {
  cropName: string;
  region: string | null;
  hasData: boolean;
  recommendation: {
    bestSellMonth: number;
    bestSellMonthName: string;
    averageBestPrice: number;
    lowestMonth: number;
    lowestMonthName: string;
    averageLowestPrice: number;
    latestKnownPrice: number;
    latestKnownPeriod: string;
    expectedGainPercent: number;
  } | null;
  topMonths?: Array<{ month: number; monthName: string; avgPrice: number; samples: number }>;
  dataPoints?: number;
}

export interface MultiCropProfitabilityResult {
  hasData: boolean;
  summary: {
    farmsAnalyzed: number;
    cropsAnalyzed: number;
    profitableNow: number;
    diversificationIndex: number;
    topRecommendation: string | null;
  } | null;
  topRecommendations?: Array<{
    cropName: string;
    hasPriceData: boolean;
    region?: string;
    latestPrice?: number;
    recentAverage?: number;
    annualAverage?: number;
    trendPercent?: number;
    score?: number;
  }>;
  items?: Array<{
    cropName: string;
    hasPriceData: boolean;
    region?: string;
    latestPrice?: number;
    recentAverage?: number;
    annualAverage?: number;
    trendPercent?: number;
    score?: number;
  }>;
  message?: string;
}

export const pricesApi = {
  getTrends: (params?: { cropName?: string; region?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.cropName) query.set('cropName', params.cropName);
    if (params?.region) query.set('region', params.region);
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PriceRecord[]>(`/prices/trends?${query.toString()}`);
  },
  getCrops: () => api.get<string[]>('/prices/crops'),
  getRegions: () => api.get<string[]>('/prices/regions'),
  getYearRange: () => api.get<{ minYear: number; maxYear: number }>('/prices/year-range'),
  getSalesTiming: (params: { cropName: string; region?: string }) => {
    const query = new URLSearchParams();
    query.set('cropName', params.cropName);
    if (params.region) query.set('region', params.region);
    return api.get<SalesTimingResult>(`/prices/sales-timing?${query.toString()}`);
  },
  getMultiCropProfitability: (farmId?: string) =>
    api.get<MultiCropProfitabilityResult>(
      farmId ? `/prices/multi-crop-profitability?farmId=${farmId}` : '/prices/multi-crop-profitability'
    ),
};

export const chatApi = {
  getChats: () => api.get('/chat'),
  getChat: (id: string) => api.get(`/chat/${id}`),
  createChat: (title?: string) => api.post('/chat', { title: title || 'New Chat' }),
  deleteChat: (id: string) => api.delete(`/chat/${id}`),
  sendMessage: (chatId: string, content: string) =>
    api.post(`/chat/${chatId}/messages`, { content }),
  appendMessage: (chatId: string, role: string, content: string) =>
    api.post(`/chat/${chatId}/messages/append`, { role, content }),
};

export const productsApi = {
  getMyProducts: (page: number, limit: number) => 
    api.get<Product[]>(`/products/my-products?page=${page}&limit=${limit}`),
   getAllProducts: (page: number, limit: number, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => {
    let url = `/products?page=${page}&limit=${limit}`;
    if (filters) {
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
      if (filters.search) url += `&search=${filters.search}`;
    }
    return api.get<Product[]>(url);
  },
  getProductById: (id: string) => api.get(`/products/${id}`),
  create: (data: unknown) => api.post('/products', data),
  
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  
  delete: (id: string) => api.delete(`/products/${id}`),
};
