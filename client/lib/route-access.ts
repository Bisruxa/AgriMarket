/** Shared route access rules for middleware and client-side guards. */

export const PUBLIC_PATHS = new Set([
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]);

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return (
    pathname.startsWith('/signin/') ||
    pathname.startsWith('/signup/') ||
    pathname.startsWith('/forgot-password/') ||
    pathname.startsWith('/reset-password/') ||
    pathname.startsWith('/verify-email/')
  );
}

export function getRequiredRoles(pathname: string): string[] | null {
  if (pathname.startsWith('/farmer')) return ['FARMER'];
  if (pathname.startsWith('/trader')) return ['TRADER'];
  if (pathname.startsWith('/admin')) return ['ADMIN'];
  if (pathname.startsWith('/chat')) return ['FARMER', 'ADMIN'];
  return null;
}

export function safeRedirectPath(from: string | null): string | null {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return null;
  if (from.startsWith('/signin') || from.startsWith('/signup')) return null;
  return from;
}
