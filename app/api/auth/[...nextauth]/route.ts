// import NextAuth from 'next-auth';
// import { authConfig } from '@/auth.config';
// import Credentials from 'next-auth/providers/credentials';
// import { z } from 'zod';
// import bcrypt from 'bcryptjs';
// import postgres from 'postgres';
// import type { User } from '@/app/lib/definitions';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// async function getUser(email: string): Promise<User | undefined> {
//   try {
//     const user = await sql<User[]>`
//       SELECT * FROM users WHERE email = ${email}
//     `;
//     return user[0];
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//     throw new Error('Failed to fetch user.');
//   }
// }

// const handler = NextAuth({
//   ...authConfig,
//   providers: [
//     Credentials({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         const parsed = z
//           .object({
//             email: z.string().email(),
//             password: z.string().min(6),
//           })
//           .safeParse(credentials);

//         if (!parsed.success) return null;

//         const { email, password } = parsed.data;
//         const user = await getUser(email);
//         if (!user) return null;

//         const isValid = await bcrypt.compare(password, user.password);
//         if (!isValid) return null;

//         return user;
//       },
//     }),
//   ],
// });

// // ✅ Must be default export for [...nextauth]
// export default handler;
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import type { User } from '@/app/lib/definitions';
import { authConfig } from '@/auth.config';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return undefined;
  }
}

export default NextAuth({
  ...authConfig,
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

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
});
