// import NextAuth from 'next-auth';
// import { authConfig } from './auth.config';
 
// export default NextAuth(authConfig).auth;
 
// export const config = {
//   // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
//   matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// };
// Force Node.js runtime
// export const runtime = 'nodejs';

// import { auth } from '@/auth';

// export default auth;

// export const config = {
//   matcher: ['/((?!api|_next|favicon.ico).*)'],
// };

// middleware.ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  return NextResponse.next(); // remove all logic for now
}
