import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getAllNodes, getNextRecommendedNodes } from '@/lib/agent/pathfinder';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import DegreeGraphClient from './DegreeGraphClient';
import CopilotSidecarWrapper from '@/components/CopilotSidecarWrapper';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const studentId = (session.user as any).id as string;
  const [student, knowledgeStates, checkpointResults] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.knowledgeState.findMany({ where: { studentId } }),
    prisma.checkpointResult.findMany({ where: { studentId } }),
  ]);

  if (!student) redirect('/login');

  const knowledgeState: Record<string, number> = {};
  knowledgeStates.forEach((ks) => { knowledgeState[ks.nodeId] = ks.level; });

  const allNodes = getAllNodes();
  const mastered = allNodes.filter((n) => (knowledgeState[n.id] ?? 0) >= 4).length;
  const inProgress = allNodes.filter((n) => { const l = knowledgeState[n.id] ?? 0; return l >= 1 && l < 4; }).length;
  const total = allNodes.length;
  const pct = Math.round((mastered / total) * 100);

  const recommended = getNextRecommendedNodes(knowledgeState, student.goals ?? '').slice(0, 3);
  const recommendedNodes = recommended.map((id) => allNodes.find((n) => n.id === id)).filter(Boolean);

  const cpResults = checkpointResults.map((r) => ({
    checkpointId: r.checkpointId,
    passed: r.passed,
    requiresHumanReview: r.requiresHumanReview,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">ML Campus</span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{student.name}</span>
          <a href="/api/auth/signout" className="text-sm text-gray-500 hover:text-gray-300">
            Sign out
          </a>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left sidebar */}
        <aside className="w-72 border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          {/* Progress stats */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Progress</h3>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mastered</span>
                <span className="text-green-400 font-medium">{mastered}/{total}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{inProgress} in progress</span>
                <span>{pct}% complete</span>
              </div>
            </div>
          </div>

          {/* Recommended next */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Study Next</h3>
            <div className="space-y-2">
              {recommendedNodes.length === 0 ? (
                <p className="text-sm text-gray-600">All caught up!</p>
              ) : (
                recommendedNodes.map((node) => (
                  <a
                    key={node!.id}
                    href={`/session/${node!.id}`}
                    className="block bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-200">{node!.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{node!.estimatedHours}h · {mitCurriculum.courses.find((c) => c.id === node!.courseId)?.title}</p>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Course breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Courses</h3>
            <div className="space-y-2">
              {mitCurriculum.courses.map((course) => {
                const levels = course.nodes.map((n) => knowledgeState[n.id] ?? 0);
                const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
                const coursePct = Math.round((avg / 4) * 100);
                return (
                  <div key={course.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 truncate">{course.title}</span>
                      <span className="text-gray-600 ml-2">{coursePct}%</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full">
                      <div className="h-1 bg-indigo-600 rounded-full" style={{ width: `${coursePct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main graph area */}
        <main className="flex-1 min-w-0">
          <DegreeGraphClient knowledgeState={knowledgeState} checkpointResults={cpResults} />
        </main>
      </div>
      <CopilotSidecarWrapper knowledgeState={knowledgeState} studentName={student.name} />
    </div>
  );
}
