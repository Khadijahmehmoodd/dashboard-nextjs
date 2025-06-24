// import type { NextAuthConfig } from 'next-auth';
 
// export const authConfig = {
//   pages: {
//     signIn: '/login',
//   },
//    callbacks: {
//     authorized({ auth, request: { nextUrl } }) {
//       const isLoggedIn = !!auth?.user;
//       const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
//       if (isOnDashboard) {
//         if (isLoggedIn) return true;
//         return false; // Redirect unauthenticated users to login page
//       } else if (isLoggedIn) {
//         return Response.redirect(new URL('/dashboard', nextUrl));
//       }
//       return true;
//     },
//   },
//   providers: [], // Add providers with an empty array for now
// } satisfies NextAuthConfig;
// ;

// Force Node.js runtime


import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user[0];
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export const authConfig = {
  pages: {
    signIn: '/login', // custom login route
  },
  providers: [
    Credentials({
      name: 'Credentials',
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await getUser(email);
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isDashboard) {
        return loggedIn;
      }

      if (loggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
