import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Example check for maintenance mode (could be from a cookie or header in reality)
  const isMaintenanceMode = request.cookies.get('maintenance_mode')?.value === 'true';

  if (isMaintenanceMode && !pathname.startsWith('/admin') && !pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
