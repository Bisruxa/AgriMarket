'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi, ApiResponse, AppNotification } from '@/lib/api';
import { useAuth } from '@/app/context/UserContext';

function hasStoredToken() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token && token !== 'none';
}

export function useNotifications() {
  const { user, loading: authLoading } = useAuth();
  const isReady = !authLoading && !!user && hasStoredToken();

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: isReady,
    queryFn: () => notificationsApi.getAll(),
    refetchInterval: isReady ? 60_000 : false,
    select: (res: ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>) => {
      if (!res.success || !res.data) {
        return { notifications: [] as AppNotification[], unreadCount: 0, error: res.message };
      }
      return {
        notifications: res.data.notifications ?? [],
        unreadCount: res.data.unreadCount ?? 0,
        error: undefined as string | undefined,
      };
    },
  });

  return { ...query, isReady };
}
