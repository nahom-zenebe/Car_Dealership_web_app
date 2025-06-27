import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "secrto-02-3";

const roleRoutes: Record<string, string[]> = {
  admin: [
    '/dashboard/admin',
    '/dashboard/admin/Discover',
    '/dashboard/Cartpage',
    '/dashboard/Favoritepage',
    '/dashboard/Analytics',
    '/dashboard/admin/createcar',
    '/dashboard/admin/verification',
  ],
  seller: [
    '/dashboard/user',
    '/dashboard/Cartpage',
    '/dashboard/Favoritepage',
    '/dashboard/Analytics',
    '/dashboard/admin/createcar',
  ],
  buyer: [
    '/dashboard/user',
    '/dashboard/Cartpage',
    '/dashboard/Favoritepage',
    '/dashboard/Analytics',
  ],
};

function getRoleFromRequest(request: NextRequest): string {
  const token = request.cookies.get('token')?.value;
  if (!token) return 'buyer'; // fallback to buyer if not logged in
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role || 'buyer';
  } catch {
    return 'buyer';
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  const role = getRoleFromRequest(request);
  const allowedRoutes = roleRoutes[role] || [];
  const isAllowed = allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  if (!isAllowed) {
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};