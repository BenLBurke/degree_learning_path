import { prisma } from '@/lib/db/prisma';
import { getAllNodes } from '@/lib/agent/pathfinder';

export default async function RosterPage() {
  const [students, allKnowledge, allCheckpoints] = await Promise.all([
    prisma.student.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.knowledgeState.findMany(),
    prisma.checkpointResult.findMany({ where: { passed: true } }),
  ]);

  const totalNodes = getAllNodes().length;

  const byStudent = new Map<string, { mastered: number; sum: number; count: number }>();
  for (const ks of allKnowledge) {
    const agg = byStudent.get(ks.studentId) ?? { mastered: 0, sum: 0, count: 0 };
    agg.sum += ks.level;
    agg.count += 1;
    if (ks.level >= 4) agg.mastered += 1;
    byStudent.set(ks.studentId, agg);
  }

  const passedByStudent = new Map<string, number>();
  for (const cp of allCheckpoints) {
    passedByStudent.set(cp.studentId, (passedByStudent.get(cp.studentId) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Roster</h1>
        <p className="text-gray-400 text-sm mt-1">{students.length} enrolled</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Student</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-right px-5 py-3 font-medium">Mastered</th>
              <th className="text-right px-5 py-3 font-medium">Checkpoints Passed</th>
              <th className="text-right px-5 py-3 font-medium">Avg Level</th>
              <th className="text-right px-5 py-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const agg = byStudent.get(s.id) ?? { mastered: 0, sum: 0, count: 0 };
              const avg = agg.count > 0 ? (agg.sum / agg.count).toFixed(1) : '0.0';
              const pct = Math.round((agg.mastered / totalNodes) * 100);
              return (
                <tr key={s.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30">
                  <td className="px-5 py-3">
                    <div className="text-gray-200 font-medium">{s.name}</div>
                    <div className="text-gray-600 text-xs">{s.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.role === 'student' ? 'bg-gray-800 text-gray-400' : 'bg-indigo-900 text-indigo-300'
                    }`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-300">{agg.mastered}/{totalNodes}</td>
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
