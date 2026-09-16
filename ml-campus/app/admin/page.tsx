import { prisma } from '@/lib/db/prisma';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import { getNodeById } from '@/lib/agent/pathfinder';
import ReviewCard from './ReviewCard';

function findCheckpoint(checkpointId: string) {
  for (const course of mitCurriculum.courses) {
    for (const node of course.nodes) {
      const cp = node.checkpoints.find((c) => c.id === checkpointId);
      if (cp) return { checkpoint: cp, node, course };
    }
  }
  return null;
}

export default async function ReviewQueuePage() {
  // Flagged for human review, or agent-failed — newest first.
  const results = await prisma.checkpointResult.findMany({
    where: { OR: [{ requiresHumanReview: true }, { passed: false }] },
    orderBy: { submittedAt: 'desc' },
    take: 100,
  });

  // Join student names.
  const studentIds = Array.from(new Set(results.map((r) => r.studentId)));
  const students = await prisma.student.findMany({ where: { id: { in: studentIds } } });
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const pending = results.filter((r) => r.requiresHumanReview);
  const failed = results.filter((r) => !r.requiresHumanReview && !r.passed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <p className="text-gray-400 text-sm mt-1">
          {pending.length} awaiting review · {failed.length} recent non-passes
        </p>
      </div>

      {results.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Nothing to review.</p>
          <p className="text-sm mt-1">Flagged and failed checkpoint submissions will appear here.</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
            Awaiting Human Review
          </h2>
          {pending.map((r) => {
            const meta = findCheckpoint(r.checkpointId);
            const student = studentMap.get(r.studentId);
            return (
              <ReviewCard
                key={r.id}
                result={{
                  id: r.id,
                  response: r.response,
                  passed: r.passed,
                  agentFeedback: r.agentFeedback,
                  submittedAt: r.submittedAt.toISOString(),
                }}
                studentName={student?.name ?? 'Unknown'}
                studentEmail={student?.email ?? ''}
                nodeTitle={meta?.node.title ?? r.checkpointId}
                courseTitle={meta?.course.title ?? ''}
                prompt={meta?.checkpoint.prompt ?? ''}
                passingCriteria={meta?.checkpoint.passingCriteria ?? ''}
              />
            );
          })}
        </section>
      )}

      {failed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Recent Non-Passes
          </h2>
          {failed.map((r) => {
            const meta = findCheckpoint(r.checkpointId);
            const student = studentMap.get(r.studentId);
            return (
              <ReviewCard
                key={r.id}
                result={{
                  id: r.id,
                  response: r.response,
                  passed: r.passed,
                  agentFeedback: r.agentFeedback,
                  submittedAt: r.submittedAt.toISOString(),
                }}
                studentName={student?.name ?? 'Unknown'}
                studentEmail={student?.email ?? ''}
                nodeTitle={meta?.node.title ?? r.checkpointId}
                courseTitle={meta?.course.title ?? ''}
                prompt={meta?.checkpoint.prompt ?? ''}
                passingCriteria={meta?.checkpoint.passingCriteria ?? ''}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
