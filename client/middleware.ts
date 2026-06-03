import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/signin', '/signup', '/forgot-password']);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return (
    pathname.startsWith('/signin/') ||
    pathname.startsWith('/signup/') ||
    pathname.startsWith('/forgot-password/')
  );
}

function getRouteRoles(pathname: string): string[] | null {
  if (pathname.startsWith('/farmer')) return ['FARMER'];
  if (pathname.startsWith('/trader')) return ['TRADER'];
  if (pathname.startsWith('/admin')) return ['ADMIN'];
  if (pathname.startsWith('/chat')) return ['FARMER', 'ADMIN'];
  return null;
}

function parseUserRole(request: NextRequest): string | null {
  const raw = request.cookies.get('user')?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { role?: string };
    return parsed.role?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const requiredRoles = getRouteRoles(pathname);
  if (!requiredRoles) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  if (!token || token === 'none') {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const role = parseUserRole(request);
  if (!role) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (!requiredRoles.includes(role)) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|json|js|css)$).*)',
  ],
};
