import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth';
import { prisma } from '../../../../lib/db/prisma';
import { getAvailableNodes, getNextRecommendedNodes } from '../../../../lib/agent/pathfinder';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const studentId = (session.user as any).id;
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { knowledgeStates: true },
  });

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const knowledgeState: Record<string, number> = {};
  student.knowledgeStates.forEach(ks => {
    knowledgeState[ks.nodeId] = ks.level;
  });

  const availableNodes = getAvailableNodes(knowledgeState);
  const recommendedNodes = getNextRecommendedNodes(knowledgeState, student.goals || '');

  return NextResponse.json({ knowledgeState, availableNodes, recommendedNodes, student: { name: student.name, goals: student.goals, background: student.background } });
}
