import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_ROUTES, PROTECTED_ROUTES_EXACT, PROTECTED_ROUTES_PREFIX, RT_COOKIE_NAME } from './constants/auth.const';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES_EXACT.includes(path) ||
    PROTECTED_ROUTES_PREFIX.some(
      (p) => path === p || path.startsWith(p + '/')
    );
  const isAuthRoute = AUTH_ROUTES.includes(path);
  const nextResponse = NextResponse.next();

  const refreshToken = request.cookies.get(RT_COOKIE_NAME)?.value;

  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if (isProtectedRoute && !refreshToken) {
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(path)}`, request.nextUrl));
  }

  return nextResponse;
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};