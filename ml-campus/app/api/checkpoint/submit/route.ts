import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth';
import { prisma } from '../../../../lib/db/prisma';
import { mitCurriculum } from '../../../../lib/degree/mitCurriculum';
import { completeText } from '../../../../lib/agent/llm';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { checkpointId, nodeId, response } = await req.json();
  const studentId = (session.user as any).id;

  // Find the checkpoint
  let checkpoint = null;
  for (const course of mitCurriculum.courses) {
    for (const node of course.nodes) {
      const found = node.checkpoints.find(c => c.id === checkpointId);
      if (found) { checkpoint = found; break; }
    }
    if (checkpoint) break;
  }

  if (!checkpoint) return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });

  const assessmentPrompt = `You are assessing a student's checkpoint response.

Checkpoint prompt: ${checkpoint.prompt}
Passing criteria: ${checkpoint.passingCriteria}
Student response: ${response}

Assess whether the student has met the passing criteria. Respond with:
[CHECKPOINT_RESULT: passed=true] or [CHECKPOINT_RESULT: passed=false]

Then provide 2-3 sentences of constructive feedback.`;

  const content = await completeText({
    messages: [{ role: 'user', content: assessmentPrompt }],
    maxTokens: 500,
  });
  const passed = content.includes('[CHECKPOINT_RESULT: passed=true]');
  const feedback = content.replace(/\[CHECKPOINT_RESULT: passed=(true|false)\]/g, '').trim();

  await prisma.checkpointResult.create({
    data: {
      studentId,
      checkpointId,
      response,
      passed,
      agentFeedback: feedback,
      requiresHumanReview: checkpoint.requiresHumanReview,
    },
  });

  // Update knowledge state if passed
  if (passed) {
    await prisma.knowledgeState.upsert({
      where: { studentId_nodeId: { studentId, nodeId } },
      update: { level: 3 },
      create: { studentId, nodeId, level: 3 },
    });
  }

  return NextResponse.json({ passed, feedback, requiresHumanReview: checkpoint.requiresHumanReview });
}
