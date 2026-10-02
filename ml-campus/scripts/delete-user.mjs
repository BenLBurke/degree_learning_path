// Delete a user (and all their data) from the database by name or email.
//
// Usage (from ml-campus/):
//   node scripts/delete-user.mjs "Ben Burke"
//   node scripts/delete-user.mjs someone@example.com
//
// Matches on exact email first, then on name (case-insensitive). Removes the
// student plus their knowledge states and checkpoint results.

import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

config({ path: '.env.local' });
config({ path: '.env' });

const [, , query] = process.argv;
if (!query) {
  console.error('Usage: node scripts/delete-user.mjs "<name or email>"');
  process.exit(1);
}

const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const url = rawUrl.startsWith('file:./') ? `file:${process.cwd()}/${rawUrl.slice(7)}` : rawUrl;
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url }) });

async function main() {
  const q = query.trim();
  const all = await prisma.student.findMany();
  const matches = all.filter(
    (s) => s.email.toLowerCase() === q.toLowerCase() || s.name.toLowerCase() === q.toLowerCase()
  );

  if (matches.length === 0) {
    console.log(`\nNo user found matching "${q}". Nothing deleted.\n`);
    return;
  }

  const ids = matches.map((s) => s.id);
  await prisma.checkpointResult.deleteMany({ where: { studentId: { in: ids } } });
  await prisma.knowledgeState.deleteMany({ where: { studentId: { in: ids } } });
  await prisma.account.deleteMany({ where: { userId: { in: ids } } });
  await prisma.authSession.deleteMany({ where: { userId: { in: ids } } });
  await prisma.student.deleteMany({ where: { id: { in: ids } } });

  console.log(`\n🗑️  Deleted ${matches.length} user(s):`);
  matches.forEach((s) => console.log(`   ${s.name} <${s.email}>`));
  console.log('');
}

main()
  .catch((e) => {
    console.error('\n❌ delete-user failed:\n', e.message ?? e, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
