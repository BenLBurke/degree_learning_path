import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth';
import { prisma } from '../../../../lib/db/prisma';
import { buildSystemPrompt } from '../../../../lib/agent/systemPrompt';
import { parseKnowledgeUpdates } from '../../../../lib/agent/knowledgeAssessor';
import { getNodeById } from '../../../../lib/agent/pathfinder';
import { streamText } from '../../../../lib/agent/llm';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { nodeId, messages, mode = 'TEACH' } = await req.json();
  const studentId = (session.user as any).id;

  const [student, knowledgeStates] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.knowledgeState.findMany({ where: { studentId } }),
  ]);

  if (!student) return new Response('Student not found', { status: 404 });

  const knowledgeState: Record<string, number> = {};
  knowledgeStates.forEach(ks => { knowledgeState[ks.nodeId] = ks.level; });

  const node = getNodeById(nodeId);
  if (!node) return new Response('Node not found', { status: 404 });

  const nodeContent = node.content.map(c => c.content).join('\n\n');
  const systemPrompt = buildSystemPrompt({
    studentName: student.name,
    background: student.background || 'General background',
    goals: student.goals || '[]',
    knowledgeState,
    currentNode: { title: node.title, description: node.description, content: nodeContent },
    sessionSummary: `Learning ${node.title}`,
    mode: mode as any,
  });

  const encoder = new TextEncoder();
  let fullResponse = '';

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of streamText({
          system: systemPrompt,
          messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
          maxTokens: 1500,
        })) {
          fullResponse += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: `\n\n[Error: ${err?.message ?? 'agent failed'}]` })}\n\n`)
        );
      }

      // Parse knowledge updates and save them
      const updates = parseKnowledgeUpdates(fullResponse);
      for (const [nId, level] of Object.entries(updates)) {
        await prisma.knowledgeState.upsert({
          where: { studentId_nodeId: { studentId, nodeId: nId } },
          update: { level },
          create: { studentId, nodeId: nId, level },
        });
      }

      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
