import { NextRequest, NextResponse } from 'next/server';
import { COOKIE, verifySession } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next();
  if (await verifySession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
