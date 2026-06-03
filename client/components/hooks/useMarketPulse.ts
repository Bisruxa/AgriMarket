'use client';

import { useQuery } from '@tanstack/react-query';
import { pricesApi, ApiResponse, MultiCropProfitabilityResult } from '@/lib/api';
import { useAuth } from '@/app/context/UserContext';

function hasStoredToken() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token && token !== 'none';
}

export function useMarketPulse(farmCount: number) {
  const { user, loading: authLoading } = useAuth();
  const isReady = !authLoading && !!user && hasStoredToken();

  return useQuery({
    queryKey: ['marketPulse', user?.id, farmCount],
    enabled: isReady,
    queryFn: () => pricesApi.getMultiCropProfitability(),
    select: (res: ApiResponse<MultiCropProfitabilityResult>) => {
      if (!res.success || !res.data) return null;
      return res.data;
    },
    staleTime: 30_000,
  });
}
