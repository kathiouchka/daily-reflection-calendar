import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Add session check for protected routes
  if (request.nextUrl.pathname.startsWith('/calendar')) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Skip any processing for auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/calendar/:path*'],
}; 