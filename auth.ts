import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import type { User } from '@/app/lib/definitions';
import { authConfig } from './auth.config';

// Connect to your PostgreSQL database using the POSTGRES_URL env
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Custom function to fetch user by email
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// Main NextAuth config with credentials provider
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig, // includes pages, callbacks (middleware, redirect, etc.)
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        return user; // This object gets attached to the session
      },
    }),
  ],
});
