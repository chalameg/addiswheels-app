import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Only protect API routes - client-side routes are handled by DashboardLayout
  if (pathname.startsWith('/api/booking') || pathname.startsWith('/api/admin')) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      // For admin API routes, check if user is admin
      if (pathname.startsWith('/api/admin') && payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/booking/:path*',
    '/api/admin/:path*'
  ],
}; 
