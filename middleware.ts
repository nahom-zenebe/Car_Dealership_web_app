import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = "secrto-02-3"; // Should be at least 32 bytes for HS256 in production

const roleRoutes: Record<string, string[]> = {
  admin: [
    '/dashboard/admin',
    '/dashboard/admin/Discover',
    '/dashboard/Cartpage',
    '/dashboard/Favoritepage',
    '/dashboard/Analytics',
    '/dashboard/admin/createcar',
    '/dashboard/admin/verification',
    '/dashboard/settingpage',
    '/dashboard/user/UserAccountprofile',
    '/dashboard/user/checkout',
    '/dashboard/cars',
  ],
  seller: [
    '/dashboard/user',
    '/dashboard/Cartpage',
    '/dashboard/Favoritepage',
    '/dashboard/Analytics',
    '/dashboard/admin/createcar',
    '/dashboard/settingpage',
    '/dashboard/user/UserAccountprofile',
    '/dashboard/user/checkout',
    '/dashboard/cars',
  ],
  buyer: [
    '/dashboard/user',
    '/dashboard/Cartpage',
    '/dashboard/Favoritepage',
    '/dashboard/Analytics',
    '/dashboard/settingpage',
    '/dashboard/user/UserAccountprofile',
    '/dashboard/user/checkout',
    '/dashboard/cars',
  ],
};

async function getRoleFromRequest(request: NextRequest): Promise<string> {
  const token = request.cookies.get('token')?.value;
  if (!token) return 'buyer';
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) || 'buyer';
  } catch {
    return 'buyer';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  const role = await getRoleFromRequest(request);
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