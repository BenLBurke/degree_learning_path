import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getAllNodes, getNextRecommendedNodes } from '@/lib/agent/pathfinder';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import DegreeGraphClient from './DegreeGraphClient';
import CopilotSidecarWrapper from '@/components/CopilotSidecarWrapper';
import StudentPicker from './StudentPicker';
import { getCurrentProfessor } from '@/lib/auth/roles';
import Link from 'next/link';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const viewerId = (session.user as any).id as string;
  const professor = await getCurrentProfessor();

  // A professor may inspect another student's dashboard read-only via ?studentId.
  const targetId = professor && searchParams.studentId ? searchParams.studentId : viewerId;
  const isViewingOther = targetId !== viewerId;

  const [student, knowledgeStates, allStudents] = await Promise.all([
    prisma.student.findUnique({ where: { id: targetId } }),
    prisma.knowledgeState.findMany({ where: { studentId: targetId } }),
    professor
      ? prisma.student.findMany({
          where: { role: 'student' },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, email: true },
        })
      : Promise.resolve([]),
  ]);

  if (!student) redirect('/dashboard');

  const knowledgeState: Record<string, number> = {};
  knowledgeStates.forEach((ks) => { knowledgeState[ks.nodeId] = ks.level; });

  const allNodes = getAllNodes();
  const mastered = allNodes.filter((n) => (knowledgeState[n.id] ?? 0) >= 4).length;
  const inProgress = allNodes.filter((n) => { const l = knowledgeState[n.id] ?? 0; return l >= 1 && l < 4; }).length;
  const total = allNodes.length;
  const pct = Math.round((mastered / total) * 100);

  const recommended = getNextRecommendedNodes(knowledgeState, student.goals ?? '').slice(0, 3);
  const recommendedNodes = recommended.map((id) => allNodes.find((n) => n.id === id)).filter(Boolean);

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
          {professor && (
            <StudentPicker
              students={allStudents}
              selectedId={isViewingOther ? targetId : ''}
            />
          )}
          <span className="text-sm text-gray-400">{session.user.name}</span>
          {professor && (
            <Link href="/admin" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
              Professor Portal
            </Link>
          )}
          <a href="/api/auth/signout" className="text-sm text-gray-500 hover:text-gray-300">
            Sign out
          </a>
        </div>
      </nav>

      {/* Read-only banner when a professor inspects a student */}
      {isViewingOther && (
        <div className="bg-indigo-950/60 border-b border-indigo-900 px-6 py-2.5 flex items-center justify-between">
          <p className="text-sm text-indigo-200">
            Viewing <span className="font-semibold">{student.name}</span>&apos;s progress ·{' '}
            <span className="text-indigo-400">read-only</span>
          </p>
          <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300">
            Back to my dashboard
          </Link>
        </div>
      )}

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left sidebar */}
        <aside className="w-72 border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {isViewingOther ? `${student.name}'s Progress` : 'Progress'}
            </h3>
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

          {/* Recommended next (hidden in read-only professor view) */}
          {!isViewingOther && (
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
          )}

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
          <DegreeGraphClient knowledgeState={knowledgeState} readOnly={isViewingOther} />
        </main>
      </div>
      {!isViewingOther && (
        <CopilotSidecarWrapper knowledgeState={knowledgeState} studentName={student.name} />
      )}
    </div>
  );
}
