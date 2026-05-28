'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmsApi, ApiResponse } from '@/lib/api';
import { Farm, CreateFarmData, UpdateFarmData } from '@/types/farm';
import { toast } from 'sonner';

export const useFarms = () => {
  return useQuery({
    queryKey: ['farms'],
    queryFn: () => farmsApi.getMyFarms(),
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

  const createMutation = useMutation({
    mutationFn: (data: CreateFarmData) => farmsApi.create(data),
    onSuccess: (response: ApiResponse<Farm>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['farms'] });
        toast.success(response.message || 'Farm created successfully');
      } else {
        toast.error(response?.message || 'Failed to create farm');
      }
    },
    onError: () => {
      toast.error('Network error. Please try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmData }) =>
      farmsApi.update(id, data),
    onSuccess: (response: ApiResponse<Farm>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['farms'] });
        toast.success(response.message || 'Farm updated successfully');
      } else {
        toast.error(response?.message || 'Failed to update farm');
      }
    },
    onError: () => {
      toast.error('Network error. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => farmsApi.delete(id),
    onSuccess: (response: ApiResponse<unknown>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['farms'] });
        toast.success('Farm deleted successfully');
      } else {
        toast.error(response?.message || 'Failed to delete farm');
      }
    },
    onError: () => {
      toast.error('Network error. Please try again.');
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
