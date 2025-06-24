import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // ✅ forces redirection here
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard');

      // ✅ Redirect to login if user is not authenticated and is on a protected route
      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }

      // ✅ Redirect already logged-in user from root `/` to dashboard
      if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true; // ✅ otherwise allow
    },
  },
  providers: [], // 🔐 Don't forget to add your credentials provider later
} satisfies NextAuthConfig;
