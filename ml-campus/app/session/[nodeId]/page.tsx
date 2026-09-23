import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getNodeById, getNodeStatus } from '@/lib/agent/pathfinder';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import AgentChat from '@/components/AgentChat';
import CopilotSidecarWrapper from '@/components/CopilotSidecarWrapper';
import Link from 'next/link';

interface Props {
  params: { nodeId: string };
}

export default async function SessionPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const node = getNodeById(params.nodeId);
  if (!node) notFound();

  const studentId = (session.user as any).id as string;
  const [knowledgeStates, checkpointResults] = await Promise.all([
    prisma.knowledgeState.findMany({ where: { studentId } }),
    prisma.checkpointResult.findMany({ where: { studentId } }),
  ]);

  const knowledgeState: Record<string, number> = {};
  knowledgeStates.forEach((ks) => { knowledgeState[ks.nodeId] = ks.level; });

  const cpResults = checkpointResults.map((r) => ({
    checkpointId: r.checkpointId,
    passed: r.passed,
    requiresHumanReview: r.requiresHumanReview,
  }));

  const status = getNodeStatus(params.nodeId, knowledgeState, cpResults);
  if (status === 'locked') redirect('/dashboard');

  const level = knowledgeState[params.nodeId] ?? 0;
  const levelLabels = ['Unknown', 'Aware', 'Familiar', 'Proficient', 'Mastered'];
  const course = mitCurriculum.courses.find((c) => c.id === node.courseId);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-500 text-sm">{course?.title}</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200 text-sm font-medium">{node.title}</span>
      </nav>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left: node info + checkpoints */}
        <aside className="w-80 border-r border-gray-800 p-6 overflow-y-auto shrink-0 space-y-6">
          {/* Node header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                status === 'complete' ? 'bg-green-900 text-green-300' :
                status === 'in-progress' ? 'bg-yellow-900 text-yellow-300' :
                'bg-indigo-900 text-indigo-300'
              }`}>
                {levelLabels[level]}
              </span>
              <span className="text-xs text-gray-600">{node.estimatedHours}h estimated</span>
            </div>
            <h1 className="text-xl font-bold text-white">{node.title}</h1>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{node.description}</p>
          </div>

          {/* Knowledge level bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Knowledge level</span>
              <span>{level}/4</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div
                className="h-2 bg-indigo-500 rounded-full transition-all"
                style={{ width: `${(level / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Checkpoints */}
          {node.checkpoints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Checkpoints</h3>
              <div className="space-y-2">
                {node.checkpoints.map((cp) => {
                  const result = cpResults.find((r) => r.checkpointId === cp.id);
                  return (
                    <Link
                      key={cp.id}
                      href={`/checkpoint/${cp.id}?nodeId=${node.id}`}
                      className="block bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">{cp.type.replace('_', ' ')}</span>
                        {result ? (
                          <span className={`text-xs font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">Not started</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cp.prompt}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {node.prerequisites.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prerequisites</h3>
              <div className="space-y-1">
                {node.prerequisites.map((prereqId) => {
                  const prereqNode = getNodeById(prereqId);
                  const prereqLevel = knowledgeState[prereqId] ?? 0;
                  return (
                    <div key={prereqId} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${prereqLevel >= 2 ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className={prereqLevel >= 2 ? 'text-gray-400' : 'text-gray-600'}>
                        {prereqNode?.title ?? prereqId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Right: agent chat */}
        <main className="flex-1 p-6 min-w-0">
          <AgentChat nodeId={params.nodeId} />
        </main>
      </div>
      <CopilotSidecarWrapper knowledgeState={knowledgeState} currentNodeId={params.nodeId} />
    </div>
  );
}
