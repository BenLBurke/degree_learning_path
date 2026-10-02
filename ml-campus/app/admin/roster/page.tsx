import { prisma } from '@/lib/db/prisma';
import { reviewQueueByStudent } from '@/lib/admin/pending';
import { getProgram } from '@/lib/degree/programs';
import { coursesCompletion } from '@/lib/degree/checkpoints';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RosterPage() {
  const [students, allCheckpoints, pendingByStudent] = await Promise.all([
    prisma.student.findMany({ orderBy: [{ degree: 'asc' }, { name: 'asc' }] }),
    prisma.checkpointResult.findMany({ where: { passed: true } }),
    reviewQueueByStudent(),
  ]);

  // Passed checkpoint ids per student (completion is checkpoint-based).
  const passedByStudentSet = new Map<string, Set<string>>();
  for (const cp of allCheckpoints) {
    let s = passedByStudentSet.get(cp.studentId);
    if (!s) { s = new Set(); passedByStudentSet.set(cp.studentId, s); }
    s.add(cp.checkpointId);
  }

  const passedByStudent = new Map<string, number>();
  for (const cp of allCheckpoints) {
    passedByStudent.set(cp.studentId, (passedByStudent.get(cp.studentId) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Roster</h1>
        <p className="text-gray-400 text-sm mt-1">{students.length} enrolled · progress shown within each student&apos;s degree</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Student</th>
              <th className="text-left px-5 py-3 font-medium">Degree</th>
              <th className="text-right px-5 py-3 font-medium">Mastered</th>
              <th className="text-right px-5 py-3 font-medium">Checkpoints Passed</th>
              <th className="text-right px-5 py-3 font-medium">Avg Level</th>
              <th className="text-right px-5 py-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const degree = getProgram(s.degree);
              const passedSet = passedByStudentSet.get(s.id) ?? new Set<string>();
              const comp = coursesCompletion(degree.courseIds, passedSet);
              const mastered = comp.nodesComplete;
              const totalNodes = comp.nodesTotal;
              const avg = comp.total > 0 ? ((comp.passed / comp.total) * 4).toFixed(1) : '0.0';
              const pct = comp.pct;
              return (
                <tr key={s.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard?studentId=${s.id}`} className="group block min-w-0">
                        <div className="text-gray-200 font-medium group-hover:text-indigo-300 truncate">{s.name}</div>
                        <div className="text-gray-600 text-xs truncate">{s.email}</div>
                      </Link>
                      {pendingByStudent[s.id] ? (
                        <Link
                          href="/admin"
                          className="text-[11px] font-semibold bg-red-600 hover:bg-red-500 text-white px-1.5 py-0.5 rounded-full shrink-0"
                          title="Go to review queue"
                        >
                          {pendingByStudent[s.id]} to review
                        </Link>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard?studentId=${s.id}&program=${s.degree}`}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        degree.id === 'ml' ? 'bg-indigo-900 text-indigo-300' : 'bg-emerald-900 text-emerald-300'
                      }`}
                    >
                      {degree.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-300">{mastered}/{totalNodes}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{passedByStudent.get(s.id) ?? 0}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{avg}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-1.5 bg-gray-700 rounded-full">
                        <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-500 text-xs w-8">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-12 text-gray-500">No students enrolled yet.</div>
        )}
      </div>
    </div>
  );
}
