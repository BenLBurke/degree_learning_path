import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/db/prisma';
import { mitCurriculum } from '../../../lib/degree/mitCurriculum';

export async function POST(req: NextRequest) {
  const { name, email, password, background, goals, knowledgeState } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const student = await prisma.student.create({
    data: {
      name,
      email,
      password: hashedPassword,
      background,
      goals: JSON.stringify(goals || []),
      onboardingComplete: true,
    },
  });

  // Seed knowledge states from diagnostic
  if (knowledgeState && Object.keys(knowledgeState).length > 0) {
    await prisma.knowledgeState.createMany({
      data: Object.entries(knowledgeState).map(([nodeId, level]) => ({
        studentId: student.id,
        nodeId,
        level: level as number,
      })),
    });
  } else {
    // Default: all nodes at level 0
    const allNodes = mitCurriculum.courses.flatMap(c => c.nodes.map(n => n.id));
    await prisma.knowledgeState.createMany({
      data: allNodes.map(nodeId => ({
        studentId: student.id,
        nodeId,
        level: 0,
      })),
    });
  }

  return NextResponse.json({ id: student.id, name: student.name, email: student.email });
}
