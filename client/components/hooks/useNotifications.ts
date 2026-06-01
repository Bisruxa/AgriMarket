'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi, ApiResponse, AppNotification } from '@/lib/api';
import { useAuth } from '@/app/context/UserContext';

export function useNotifications() {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.getAll(),
    enabled: !authLoading && !!user,
    refetchInterval: 60_000,
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
}
