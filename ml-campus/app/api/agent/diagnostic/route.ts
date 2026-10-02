import { NextRequest, NextResponse } from 'next/server';
import { mitCurriculum } from '../../../../lib/degree/mitCurriculum';
import { parseKnowledgeUpdates } from '../../../../lib/agent/knowledgeAssessor';
import { completeText } from '../../../../lib/agent/llm';

interface DiagnosticAnswer {
  question: string;
  answer: string;
  nodeId?: string;
}

export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (err: any) {
    console.error('[diagnostic] error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Diagnostic failed' },
      { status: 500 }
    );
  }
}

async function handle(req: NextRequest) {
  const body = await req.json();
  const studentProfile: { name: string; background: string; goals: string[] } =
    body.studentProfile ?? body.profile ?? { name: 'Student', background: '', goals: [] };
  const answers: DiagnosticAnswer[] = body.answers ?? [];
  studentProfile.name = studentProfile.name ?? 'Student';
  studentProfile.background = studentProfile.background ?? '';
  studentProfile.goals = studentProfile.goals ?? [];

  const allNodes = mitCurriculum.courses.flatMap(c => c.nodes.map(n => ({ id: n.id, title: n.title, courseId: c.id })));

  if (answers.length >= 10) {
    // Finalize and return knowledge state
    const finalPrompt = `Based on these diagnostic answers from student ${studentProfile.name}, determine their knowledge level for each topic.

Student background: ${studentProfile.background}
Student goals: ${studentProfile.goals.join(', ')}

Q&A History:
${answers.map((a, i) => `Q${i+1}: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Available nodes: ${allNodes.map(n => n.id).join(', ')}

For each node where you can assess knowledge based on the answers, output:
[KNOWLEDGE_UPDATE: nodeId=level]
where level is 0=unknown, 1=aware, 2=familiar, 3=proficient, 4=mastered.

Be generous - if a student shows familiarity with prerequisites, mark those as familiar too.`;

    const content = await completeText({
      messages: [{ role: 'user', content: finalPrompt }],
      maxTokens: 1000,
    });
    const knowledgeState = parseKnowledgeUpdates(content);

    return NextResponse.json({ complete: true, knowledgeState });
  }

  // Generate next question
  const questionNumber = answers.length + 1;
  const previousQA = answers.map((a, i) => `Q${i+1}: ${a.question}\nA: ${a.answer}`).join('\n\n');

  const prompt = `You are conducting a diagnostic assessment for a student learning ML.

Student: ${studentProfile.name}
Background: ${studentProfile.background}
Goals: ${studentProfile.goals.join(', ')}

${previousQA ? `Previous Q&A:\n${previousQA}\n\n` : ''}

This is question ${questionNumber} of 10. Ask a diagnostic question to assess their ML/math knowledge.
- Questions 1-3: Basic math (linear algebra, calculus)
- Questions 4-6: Statistics and probability
- Questions 7-9: ML fundamentals
- Question 10: Deep learning/advanced topics

Ask a specific, testable question. Just output the question directly, no preamble.`;

  const question = await completeText({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 300,
  });

  return NextResponse.json({ question, questionNumber, totalQuestions: 10 });
}
