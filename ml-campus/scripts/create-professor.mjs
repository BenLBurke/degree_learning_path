// Create (or update) a professor account directly in the database.
//
// Usage (from the ml-campus/ directory):
//   node scripts/create-professor.mjs <email> <password> [name]
//
// Example:
//   node scripts/create-professor.mjs benleeburke@gmail.com hunter2 "Ben Burke"
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

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/create-professor.mjs <email> <password> [name]');
  process.exit(1);
}

const email = emailArg.toLowerCase();
const password = passwordArg;
const name = nameParts.join(' ') || 'Professor';

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
