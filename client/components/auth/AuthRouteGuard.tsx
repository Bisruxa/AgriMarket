'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/UserContext';
import { setAuthCookies } from '@/lib/auth-session';
import { getRequiredRoles, isPublicPath } from '@/lib/route-access';

function hasStoredToken(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token && token !== 'none';
}

export function AuthRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const requiredRoles = pathname ? getRequiredRoles(pathname) : null;
  const isProtected = !!requiredRoles && !isPublicPath(pathname ?? '');

  useEffect(() => {
    if (!isProtected || loading) return;

    if (user && hasStoredToken()) {
      const token = localStorage.getItem('token') ?? undefined;
      setAuthCookies(user, token);
    }

    if (!user || !hasStoredToken()) {
      const from = encodeURIComponent(pathname || '/');
      router.replace(`/signin?from=${from}`);
      return;
    }

    const role = user.role?.toUpperCase();
    if (requiredRoles && role && !requiredRoles.includes(role)) {
      router.replace('/not-found');
    }
  }, [isProtected, loading, user, pathname, requiredRoles, router]);

  if (!isProtected) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9F5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B8C51]" aria-label="Loading" />
      </div>
    );
  }

  if (!user || !hasStoredToken()) {
    return null;
  }

  const role = user.role?.toUpperCase();
  if (requiredRoles && role && !requiredRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
