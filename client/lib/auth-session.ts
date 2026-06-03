import type { User } from '@/types/auth-page';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function cookieFlags() {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  return `path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax${secure}`;
}

/** Mirror client session into cookies so middleware can enforce route access. */
export function setAuthCookies(user: User, token?: string) {
  if (typeof document === 'undefined') return;
  const flags = cookieFlags();
  if (token && token !== 'none') {
    document.cookie = `token=${encodeURIComponent(token)}; ${flags}`;
  }
  document.cookie = `user=${encodeURIComponent(JSON.stringify({ role: user.role, id: user.id }))}; ${flags}`;
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'user=; path=/; max-age=0; SameSite=Lax';
}
