// hooks/admin/useAdminQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatsData } from '@/types/statsData';
import { User ,Trader} from '@/types/auth-page';

// Types
export interface UserFromAPI {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  region: string;
  woreda: string;
  approvalStatus: string;
  approvalNote: string | null;
  isVerified: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface UsersApiResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: UserFromAPI[];
  message?: string;
}

export interface TraderFromAPI {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  region: string;
  woreda: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PendingTradersResponse {
  success: boolean;
  count: number;
  data: TraderFromAPI[];
  message?: string;
}

export interface TraderDetailResponse {
  success: boolean;
  data: TraderFromAPI;
  message?: string;
}

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  traders: () => [...adminKeys.all, 'traders'] as const,
  pendingTraders: () => [...adminKeys.traders(), 'pending'] as const,
  traderDetail: (id: string) => [...adminKeys.traders(), id] as const,
};

// Transform functions
const transformUser = (user: UserFromAPI): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? '',
  role: user.role as 'FARMER' | 'TRADER',
  status: user.approvalStatus.toLowerCase() as 'pending' | 'approved' | 'rejected',
  registrationDate: user.createdAt,
});

const transformTrader = (trader: TraderFromAPI) => ({
  id: trader.id,
  businessName: trader.name,
  ownerName: trader.name,
  email: trader.email,
  phone: trader.phone ?? 'N/A',
  region: trader.region,
  woreda: trader.woreda,
  approvalStatus: trader.approvalStatus.toLowerCase(),
  status: trader.approvalStatus.toLowerCase(),
  registrationDate: trader.createdAt,
  businessType: '',
});

// Hooks

export const useAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: StatsData }>('/admin/stats');
      
      if (!response.success) throw new Error(response.message || 'Failed to fetch stats');
      if (!response.data) throw new Error('No stats data received');
      
      // Return just the data, not the whole response
      return response.data;
    },
  });
};
// hooks/admin/useAdminQueries.ts
export const useAllUsers = () => {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      const response = await api.get<UsersApiResponse>('/admin/users');
      console.log('Users API response:', response); // Debug log
      
      if (!response.success) throw new Error(response.message || 'Failed to fetch users');
      
      // Check different possible response structures
      let usersArray: UserFromAPI[] = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Structure: { success: true, data: { data: [...] } }
        usersArray = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Structure: { success: true, data: [...] }
        usersArray = response.data;
      } else if (Array.isArray(response.data)) {
        // Structure: [...] (direct array)
        usersArray = response.data;
      }
      
      console.log('Extracted users array:', usersArray);
      
      // Filter only farmers and traders, then transform
      return usersArray
        .filter(user => user.role === 'FARMER' || user.role === 'TRADER')
        .map(transformUser);
    },
  });
};

export const usePendingTraders = () => {
  return useQuery({
    queryKey: adminKeys.pendingTraders(),
    queryFn: async () => {
      const response = await api.get<PendingTradersResponse>('/admin/traders/pending');
      if (!response.success) throw new Error(response.message || 'Failed to fetch pending traders');
      
      return response.data?.data.map(transformTrader);
    },
  });
};

export const useTraderDetail = (id: string) => {
  return useQuery({
    queryKey: adminKeys.traderDetail(id),
    queryFn: async () => {
      const response = await api.get<TraderDetailResponse>(`/admin/traders/${id}`);
      if (!response.success) throw new Error(response.message || 'Failed to fetch trader details');
      
      // Add null check for response.data
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Handle both possible response structures
      const traderData = response.data.data || response.data;
      
      if (!traderData) {
        throw new Error('Trader data not found');
      }
      
      return transformTrader(traderData);
    },
    enabled: !!id, // Only run if id exists
  });
};

// Mutations
export const useApproveTrader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/admin/traders/${id}/approve`, {});
      if (!response.success) throw new Error(response.message || 'Failed to approve trader');
      return response;
    },
    onSuccess: (_, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingTraders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.traderDetail(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};

export const useRejectTrader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.put(`/admin/traders/${id}/reject`, { reason });
      if (!response.success) throw new Error(response.message || 'Failed to reject trader');
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingTraders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.traderDetail(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (user: User) => {
      const response = await api.put(`/admin/users/${user.id}`, user);
      if (!response.success) throw new Error(response.message || 'Failed to update user');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};