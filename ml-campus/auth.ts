import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/db/prisma';
import bcrypt from 'bcryptjs';

// On hosts that expose their public URL (e.g. Render's RENDER_EXTERNAL_URL),
// use it for NextAuth callbacks when NEXTAUTH_URL isn't set explicitly.
if (!process.env.NEXTAUTH_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL;
}

export const authOptions: NextAuthOptions = {
  // Fixed fallback secret so demo sessions survive server restarts without any
  // env setup. Override with NEXTAUTH_SECRET in production.
  secret: process.env.NEXTAUTH_SECRET ?? 'ml-campus-demo-secret-do-not-use-in-production',
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const student = await prisma.student.findUnique({
          where: { email: credentials.email },
        });
        if (!student || !student.password) return null;
        const isValid = await bcrypt.compare(credentials.password, student.password);
        if (!isValid) return null;
        return { id: student.id, email: student.email, name: student.name };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
