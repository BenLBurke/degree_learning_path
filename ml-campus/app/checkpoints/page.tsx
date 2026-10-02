import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { checkpointsByCourse } from '@/lib/degree/checkpoints';
import { getCurrentProfessor } from '@/lib/auth/roles';
import CheckpointList from '@/components/CheckpointList';
import Link from 'next/link';

export default async function CheckpointsPage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const viewerId = (session.user as any).id as string;
  const professor = await getCurrentProfessor();

  // A professor may inspect another student's checkpoints read-only via ?studentId.
  const targetId = professor && searchParams.studentId ? searchParams.studentId : viewerId;
  const isViewingOther = targetId !== viewerId;

  const [student, results] = await Promise.all([
    prisma.student.findUnique({ where: { id: targetId } }),
    prisma.checkpointResult.findMany({ where: { studentId: targetId } }),
  ]);
  if (!student) redirect('/checkpoints');

  const courses = checkpointsByCourse(results);
  const all = courses.flatMap((c) => c.checkpoints);
  const passed = all.filter((c) => c.status === 'passed').length;

  const backHref = isViewingOther ? `/dashboard?studentId=${targetId}` : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href={backHref} className="text-gray-500 hover:text-gray-300 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200 text-sm font-medium">
          {isViewingOther ? `${student.name}'s Checkpoints` : 'My Checkpoints'}
        </span>
      </nav>

      {isViewingOther && (
        <div className="bg-indigo-950/60 border-b border-indigo-900 px-6 py-2.5 flex items-center justify-between">
          <p className="text-sm text-indigo-200">
            Viewing <span className="font-semibold">{student.name}</span>&apos;s checkpoints ·{' '}
            <span className="text-indigo-400">read-only</span>
          </p>
          <Link href="/admin/roster" className="text-sm text-indigo-400 hover:text-indigo-300">
            Back to roster
          </Link>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isViewingOther ? `${student.name}'s Checkpoints` : 'My Checkpoints'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {passed} of {all.length} checkpoints passed across all courses.
          </p>
        </div>
        <CheckpointList courses={courses} readOnly={isViewingOther} />
      </div>
    </div>
  );
}
