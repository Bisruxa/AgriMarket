
'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types/auth-page';
import { AuthContextType } from '@/types/auth-page';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

function clearStoredSession() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = useCallback((userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredSession();
    authApi.logout().catch(() => {});
    router.push('/signin');
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      const tokenAtStart = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      try {
        if (!tokenAtStart || tokenAtStart === 'none') {
          if (storedUser) clearStoredSession();
          if (!cancelled) setUser(null);
          return;
        }

        const response = await authApi.getMe();
        if (cancelled) return;

        if (response.success && response.data) {
          const userData = response.data as User;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          return;
        }

        // Only clear if login did not replace the token while getMe was in flight
        if (localStorage.getItem('token') === tokenAtStart) {
          clearStoredSession();
          setUser(null);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to restore session:', error);
        if (localStorage.getItem('token') === tokenAtStart) {
          clearStoredSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
