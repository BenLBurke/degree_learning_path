import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentProfessor } from '@/lib/auth/roles';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';

function nodeIdForCheckpoint(checkpointId: string): string | null {
  for (const course of mitCurriculum.courses) {
    for (const node of course.nodes) {
      if (node.checkpoints.some((c) => c.id === checkpointId)) return node.id;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const professor = await getCurrentProfessor();
  if (!professor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { resultId, passed, note } = await req.json();
  if (!resultId || typeof passed !== 'boolean') {
    return NextResponse.json({ error: 'Missing resultId or passed' }, { status: 400 });
  }

  const result = await prisma.checkpointResult.findUnique({ where: { id: resultId } });
  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  const feedbackPrefix = `[Reviewed by ${professor.name}] ${passed ? 'Approved' : 'Rejected'}.`;
  const agentFeedback = note?.trim()
    ? `${feedbackPrefix} ${note.trim()}`
    : `${feedbackPrefix} ${result.agentFeedback ?? ''}`.trim();

  await prisma.checkpointResult.update({
    where: { id: resultId },
    data: { passed, requiresHumanReview: false, agentFeedback },
  });

  // Reflect the human decision in the student's knowledge state.
  const nodeId = nodeIdForCheckpoint(result.checkpointId);
  if (nodeId) {
    if (passed) {
      await prisma.knowledgeState.upsert({
        where: { studentId_nodeId: { studentId: result.studentId, nodeId } },
        update: { level: 3 },
        create: { studentId: result.studentId, nodeId, level: 3 },
      });
    }
  }

  return NextResponse.json({ ok: true, passed });
}
