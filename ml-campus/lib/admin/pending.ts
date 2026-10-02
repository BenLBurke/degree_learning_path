import { prisma } from '@/lib/db/prisma';

// What the Review Queue shows: submissions flagged for human review OR any
// non-pass. Keep the badge/chip counts in sync with that exact set.
const QUEUE_WHERE = {
  OR: [{ requiresHumanReview: true }, { passed: false }],
};

/** Total checkpoint submissions in the review queue, across all students. */
export async function reviewQueueCount(): Promise<number> {
  return prisma.checkpointResult.count({ where: QUEUE_WHERE });
}

/** Review-queue counts grouped by studentId (only students with > 0). */
export async function reviewQueueByStudent(): Promise<Record<string, number>> {
  const rows = await prisma.checkpointResult.groupBy({
    by: ['studentId'],
    where: QUEUE_WHERE,
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.studentId] = r._count._all;
  return map;
}
