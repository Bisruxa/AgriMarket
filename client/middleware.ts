import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredRoles, isPublicPath } from '@/lib/route-access';

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

  const requiredRoles = getRequiredRoles(pathname);
  if (!requiredRoles) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const role = parseUserRole(request);

  // Session may live in localStorage until the client hydrates — only enforce
  // role when auth cookies are already present (e.g. after client sync).
  if (token && token !== 'none' && role && !requiredRoles.includes(role)) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|json|js|css)$).*)',
  ],
};
