import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * A user is treated as a professor/admin if their stored role is "professor"
 * or "admin", OR their email is listed in the ADMIN_EMAILS env var (comma
 * separated). The env allowlist lets you grant yourself access in local dev
 * without editing the database.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getCurrentProfessor() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const email = (session.user.email ?? '').toLowerCase();
  const studentId = (session.user as any).id as string | undefined;

  const student = studentId
    ? await prisma.student.findUnique({ where: { id: studentId } })
    : await prisma.student.findUnique({ where: { email } });

  if (!student) return null;

  const isProfessor =
    student.role === 'professor' ||
    student.role === 'admin' ||
    adminEmails().includes(email);

  return isProfessor ? student : null;
}
