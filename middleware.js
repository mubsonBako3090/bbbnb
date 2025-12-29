import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or Authorization header
  let token = request.cookies.get('token')?.value;
  
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/bills',
    '/profile', 
    '/usage',
    '/api/users',
    '/api/bills',
    '/api/payments'
  ];

  // Define auth routes (where authenticated users shouldn't go)
  const authRoutes = ['/auth/login', '/auth/register'];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current route is auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // For API routes, check Authorization header
  const isApiRoute = pathname.startsWith('/api/');

  // Verify token if it exists
  let user = null;
  if (token) {
    try {
      user = await verifyToken(token);
    } catch (error) {
      // Token is invalid, clear it
      token = null;
    }
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token || !user) {
      if (isApiRoute) {
        return new Response(
          JSON.stringify({ message: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // Redirect to login with return URL
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Handle auth routes (redirect to dashboard if already authenticated)
  if (isAuthRoute && token && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For API routes that require auth, add user to request headers
  if (isApiRoute && user) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.\\.(?:svg|png|jpg|jpeg|gif|webp)$).)',
  ],
};