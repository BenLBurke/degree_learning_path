import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getAllNodes, getNextRecommendedNodes } from '@/lib/agent/pathfinder';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import { PROGRAMS, getProgram } from '@/lib/degree/programs';
import DegreeGraphClient from './DegreeGraphClient';
import CopilotSidecarWrapper from '@/components/CopilotSidecarWrapper';
import StudentPicker from './StudentPicker';
import BrandLogo from '@/components/BrandLogo';
import { getCurrentProfessor } from '@/lib/auth/roles';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { studentId?: string; program?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const viewerId = (session.user as any).id as string;
  const professor = await getCurrentProfessor();

  // A professor may inspect another student's dashboard read-only via ?studentId.
  const targetId = professor && searchParams.studentId ? searchParams.studentId : viewerId;
  const isViewingOther = targetId !== viewerId;

  const [student, knowledgeStates, checkpointRows, allStudents] = await Promise.all([
    prisma.student.findUnique({ where: { id: targetId } }),
    prisma.knowledgeState.findMany({ where: { studentId: targetId } }),
    prisma.checkpointResult.findMany({ where: { studentId: targetId } }),
    professor
      ? prisma.student.findMany({
          where: { role: 'student' },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, email: true },
        })
      : Promise.resolve([]),
  ]);

  if (!student) redirect('/dashboard');

  // Default to the enrolled degree of whoever's dashboard this is.
  const program = getProgram(searchParams.program ?? student.degree);
  const programCourseIds = new Set(program.courseIds);

  const knowledgeState: Record<string, number> = {};
  knowledgeStates.forEach((ks) => { knowledgeState[ks.nodeId] = ks.level; });

  const checkpointResults = checkpointRows.map((r) => ({
    id: r.id,
    checkpointId: r.checkpointId,
    response: r.response,
    passed: r.passed,
    agentFeedback: r.agentFeedback,
    requiresHumanReview: r.requiresHumanReview,
    submittedAt: r.submittedAt.toISOString(),
  }));

  const allNodes = getAllNodes().filter((n) => programCourseIds.has(n.courseId));
  const mastered = allNodes.filter((n) => (knowledgeState[n.id] ?? 0) >= 4).length;
  const inProgress = allNodes.filter((n) => { const l = knowledgeState[n.id] ?? 0; return l >= 1 && l < 4; }).length;
  const total = allNodes.length;
  const pct = total ? Math.round((mastered / total) * 100) : 0;

  const recommended = getNextRecommendedNodes(knowledgeState, student.goals ?? '');
  const recommendedNodes = recommended
    .map((id) => allNodes.find((n) => n.id === id))
    .filter(Boolean)
    .slice(0, 3);

  const programCourses = mitCurriculum.courses.filter((c) => programCourseIds.has(c.id));

  // Preserve studentId when switching programs.
  const programHref = (pid: string) =>
    isViewingOther ? `/dashboard?studentId=${targetId}&program=${pid}` : `/dashboard?program=${pid}`;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo />
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
          {!isViewingOther && (
            <Link href="/checkpoints" className="text-sm text-gray-400 hover:text-white transition-colors">
              My Checkpoints
            </Link>
          )}
          {professor && (
            <Link
              href="/admin"
              className="text-sm bg-indigo-600/20 border border-indigo-700 text-indigo-200 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Professor Portal →
            </Link>
          )}
          <a href="/api/auth/signout" className="text-sm text-gray-500 hover:text-gray-300">
            Sign out
          </a>
        </div>
      </nav>

      {/* Program tabs */}
      <div className="border-b border-gray-800 px-6 flex items-center gap-1">
        {PROGRAMS.map((p) => {
          const active = p.id === program.id;
          return (
            <Link
              key={p.id}
              href={programHref(p.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {p.title}
            </Link>
          );
        })}
      </div>

      {/* Read-only banner when a professor inspects a student */}
      {isViewingOther && (
        <div className="bg-indigo-950/60 border-b border-indigo-900 px-6 py-2.5 flex items-center justify-between">
          <p className="text-sm text-indigo-200">
            Viewing <span className="font-semibold">{student.name}</span>&apos;s progress ·{' '}
            <span className="text-indigo-400">read-only</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href={`/checkpoints?studentId=${targetId}`} className="text-sm text-indigo-400 hover:text-indigo-300">
              View checkpoints
            </Link>
            <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300">
            Back to my dashboard
          </Link>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-106px)]">
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
              {programCourses.map((course) => {
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
          <DegreeGraphClient knowledgeState={knowledgeState} checkpointResults={checkpointResults} courseIds={program.courseIds} readOnly={isViewingOther} />
        </main>
      </div>
      {!isViewingOther && (
        <CopilotSidecarWrapper knowledgeState={knowledgeState} studentName={student.name} />
      )}
    </div>
  );
}
