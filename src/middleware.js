import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function middleware(request) {
  const tokenCookie = request.cookies.get('mellowToken');
  const token = tokenCookie?.value;

  if (!token) {
    // No token, redirect to login page
    const loginUrl = new URL('/loginpage', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    // Invalid or expired token, redirect to login page and clear the invalid cookie
    const loginUrl = new URL('/loginpage', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('mellowToken');
    return response;
  }

  // Session is valid. Implement sliding session by extending the cookie expiration
  const response = NextResponse.next();
  response.cookies.set('mellowToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1800, // 30 minutes
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: [
    '/candidatelist',
    '/candidateonboarding',
    '/candidateselection',
    '/candidateview/:path*',
    '/dashboard',
    '/joblisting',
    '/jobmatching',
    '/jobposting',
    '/jobview/:path*',
  ],
};
