 const cookieOptions = {
  // expires: new Date(
  //   Date.now() + (parseInt(process.env.JWT_EXPIRE) || 30) * 24 * 60 * 60 * 1000
  // ),
  // httpOnly: true,
  // secure: true,      // REQUIRED for cross-site cookies
  // sameSite: 'none'   // REQUIRED for cross-site cookies
 }

 import { NextResponse } from 'next/server';
 import type { NextRequest } from 'next/server';
 
 const publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/'];
 // Define role-based route access
 const roleBasedRoutes = {
   ADMIN: ['/admin', '/admin/dashboard', '/admin/users', '/admin/products', '/admin/analytics'],
   FARMER: ['/farmer', '/farmer/dashboard', '/farmer/products', '/farmer/orders', '/farmer/portfolio'],
   TRADER: ['/trader', '/trader/dashboard', '/trader/market', '/trader/orders', '/trader/portfolio']
 };
 
 export function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;
   if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
     return NextResponse.next();
   }
 
   // Get token and user data from cookies/localStorage alternative
   const token = request.cookies.get('token')?.value;
   const userDataCookie = request.cookies.get('user')?.value;
   
   // If no token, redirect to signin
   if (!token) {
     const signinUrl = new URL('/signin', request.url);
     signinUrl.searchParams.set('from', pathname);
     return NextResponse.redirect(signinUrl);
   }
 
   let userRole = null;
   if (userDataCookie) {
     try {
       const userData = JSON.parse(userDataCookie);
       userRole = userData.role?.toUpperCase();
     } catch (error) {
       console.error('Failed to parse user data:', error);
     }
   }
 
   // If no role found in cookie, try to get from token or redirect to signin
   if (!userRole) {
     // You could also decode JWT token here to get role
     const signinUrl = new URL('/signin', request.url);
     return NextResponse.redirect(signinUrl);
   }
 
   // Check if user has access to the requested route based on role
   const hasAccess = checkRouteAccess(pathname, userRole);
   
   if (!hasAccess) {
     const dashboardUrl = getDashboardUrlByRole(userRole);
     return NextResponse.redirect(new URL(dashboardUrl, request.url));
   }
 
   return NextResponse.next();
 }
 
 function checkRouteAccess(pathname: string, role: string): boolean {
   if (role === 'ADMIN') {
     return true;
   }
 
   const allowedRoutes = roleBasedRoutes[role as keyof typeof roleBasedRoutes] || [];
   return allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
 }
 
 function getDashboardUrlByRole(role: string): string {
   switch (role) {
     case 'ADMIN':
       return '/admin/dashboard';
     case 'FARMER':
       return '/farmer/dashboard';
     case 'TRADER':
       return '/trader/dashboard';
     default:
       return '/signin';
   }
 }
 
 export const config = {
   matcher: [
     /*
      * Match all request paths except:
      * - _next/static (static files)
      * - _next/image (image optimization files)
      * - favicon.ico (favicon file)
      * - public folder
      */
     '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
   ],
 };