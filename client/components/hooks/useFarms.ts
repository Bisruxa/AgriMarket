'use client';
import { useQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';
import { farmsApi, ApiResponse } from '@/lib/api';
import { Farm, CreateFarmData, UpdateFarmData } from '@/types/farm';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/UserContext';
import { useTranslations } from '@/components/hooks/useTranlations';

export const useFarms = () => {
  const { user, loading: authLoading } = useAuth();
  const hasToken =
    typeof window !== 'undefined' &&
    !!localStorage.getItem('token') &&
    localStorage.getItem('token') !== 'none';
  const isReady = !authLoading && !!user && hasToken;

  return useQuery({
    queryKey: ['farms', user?.id],
    queryFn: isReady ? () => farmsApi.getMyFarms() : skipToken,
    select: (response: ApiResponse<Farm[]>) => {
      if (!response) return { farms: [], count: 0 };
      return {
        farms: response.data || [],
        count: response.count || 0,
      };
    },
  });
};

export const useFarm = (id: string) => {
  return useQuery({
    queryKey: ['farm', id],
    queryFn: () => farmsApi.getFarm(id),
    enabled: !!id,
    select: (response: ApiResponse<Farm>) => {
      return response?.data || null;
    },
  });
};

export const useFarmMutations = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const f = t.dashboard.farms;

  const createMutation = useMutation({
    mutationFn: (data: CreateFarmData) => farmsApi.create(data),
    onSuccess: (response: ApiResponse<Farm>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['farms'] });
        toast.success(response.message || f.toastCreated);
      } else {
        toast.error(response?.message || f.toastFailed);
      }
    },
    onError: () => {
      toast.error(f.toastNetworkError);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmData }) =>
      farmsApi.update(id, data),
    onSuccess: (response: ApiResponse<Farm>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['farms'] });
        toast.success(response.message || f.toastUpdated);
      } else {
        toast.error(response?.message || f.toastUpdated);
      }
    },
    onError: () => {
      toast.error(f.toastNetworkError);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => farmsApi.delete(id),
    onSuccess: (response: ApiResponse<unknown>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['farms'] });
        toast.success(f.toastDeleted);
      } else {
        toast.error(response?.message || f.toastDeleted);
      }
    },
    onError: () => {
      toast.error(f.toastNetworkError);
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
