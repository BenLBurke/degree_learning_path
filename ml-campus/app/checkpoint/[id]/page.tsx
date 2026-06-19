import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getNodeById } from '@/lib/agent/pathfinder';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import CheckpointForm from '@/components/CheckpointForm';
import Link from 'next/link';

interface Props {
  params: { id: string };
  searchParams: { nodeId?: string };
}

export default async function CheckpointPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  // Find checkpoint across all nodes
  let checkpoint = null;
  let nodeId = searchParams.nodeId ?? '';
  for (const course of mitCurriculum.courses) {
    for (const node of course.nodes) {
      const found = node.checkpoints.find((c) => c.id === params.id);
      if (found) { checkpoint = found; nodeId = nodeId || node.id; break; }
    }
    if (checkpoint) break;
  }
  if (!checkpoint) notFound();

  const node = getNodeById(nodeId);
  const studentId = (session.user as any).id as string;
  const priorResult = await prisma.checkpointResult.findFirst({
    where: { studentId, checkpointId: params.id },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href={`/session/${nodeId}`} className="text-gray-500 hover:text-gray-300 text-sm">
          ← Back to {node?.title ?? 'session'}
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide mb-1">
            Checkpoint · {checkpoint.type.replace('_', ' ')}
          </p>
          <h1 className="text-2xl font-bold">{node?.title ?? 'Checkpoint'}</h1>
        </div>

        {priorResult?.passed ? (
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-6 space-y-3">
            <p className="text-green-400 font-semibold">You passed this checkpoint.</p>
            <p className="text-gray-300 text-sm">{priorResult.agentFeedback}</p>
            <Link href={`/session/${nodeId}`} className="text-sm text-indigo-400 hover:text-indigo-300">
              Return to session →
            </Link>
          </div>
        ) : (
          <CheckpointForm
            checkpointId={params.id}
            nodeId={nodeId}
            prompt={checkpoint.prompt}
            type={checkpoint.type}
          />
        )}
      </div>
    </div>
  );
}
