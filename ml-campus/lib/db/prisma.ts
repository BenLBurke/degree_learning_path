import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

function createPrisma() {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
  // libsql expects file: with an absolute-style path; convert relative file: URLs.
  const url = rawUrl.startsWith('file:./')
    ? `file:${process.cwd()}/${rawUrl.slice(7)}`
    : rawUrl;

  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
