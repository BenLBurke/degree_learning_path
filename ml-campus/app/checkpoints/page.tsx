import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { checkpointsByCourse } from '@/lib/degree/checkpoints';
import CheckpointList from '@/components/CheckpointList';
import Link from 'next/link';

export default async function CheckpointsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const studentId = (session.user as any).id as string;
  const results = await prisma.checkpointResult.findMany({ where: { studentId } });
  const courses = checkpointsByCourse(results);

  const all = courses.flatMap((c) => c.checkpoints);
  const passed = all.filter((c) => c.status === 'passed').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200 text-sm font-medium">My Checkpoints</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Checkpoints</h1>
          <p className="text-gray-400 text-sm mt-1">
            {passed} of {all.length} checkpoints passed across all courses.
          </p>
        </div>
        <CheckpointList courses={courses} />
      </div>
    </div>
  );
}
