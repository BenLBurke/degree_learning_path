import { prisma } from '@/lib/db/prisma';

/** Total checkpoint submissions awaiting human review, across all students. */
export async function pendingReviewCount(): Promise<number> {
  return prisma.checkpointResult.count({ where: { requiresHumanReview: true } });
}

/** Pending-review counts grouped by studentId (only students with > 0). */
export async function pendingReviewByStudent(): Promise<Record<string, number>> {
  const rows = await prisma.checkpointResult.groupBy({
    by: ['studentId'],
    where: { requiresHumanReview: true },
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.studentId] = r._count._all;
  return map;
}
