// Create (or update) a professor account directly in the database.
//
// Usage (from the ml-campus/ directory):
//   node scripts/create-professor.mjs [email] [password] [name]
//
// With no arguments it creates the default admin account:
//   admin@byui.edu / admin
//
// This bypasses the signup UI and the diagnostic entirely. It sets role
// "professor" on the record, so portal access works regardless of the
// ADMIN_EMAILS allowlist.

import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

// Load .env.local first (Next.js convention), then .env as a fallback.
config({ path: '.env.local' });
config({ path: '.env' });

const [, , emailArg, passwordArg, ...nameParts] = process.argv;

// Default to the built-in admin account when no args are given.
const email = (emailArg ?? 'admin@byui.edu').toLowerCase();
const password = passwordArg ?? 'admin';
const name = nameParts.join(' ') || (emailArg ? 'Professor' : 'Admin');

// Mirror the URL handling in lib/db/prisma.ts.
const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const url = rawUrl.startsWith('file:./')
  ? `file:${process.cwd()}/${rawUrl.slice(7)}`
  : rawUrl;

const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash(password, 12);

  const student = await prisma.student.upsert({
    where: { email },
    update: {
      name,
      password: hashed,
      role: 'professor',
      onboardingComplete: true,
    },
    create: {
      name,
      email,
      password: hashed,
      role: 'professor',
      background: 'Professor / instructor account',
      goals: '[]',
      onboardingComplete: true,
    },
  });

  console.log('\n✅ Professor account ready:');
  console.log(`   name:  ${student.name}`);
  console.log(`   email: ${student.email}`);
  console.log(`   role:  ${student.role}`);
  console.log('\nSign in at /login?role=professor with the password you provided.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Failed to create professor account:\n', e.message ?? e, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
