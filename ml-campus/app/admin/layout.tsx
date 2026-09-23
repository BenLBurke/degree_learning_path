import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfessor } from '@/lib/auth/roles';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const professor = await getCurrentProfessor();
  if (!professor) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">ML Campus</span>
          <span className="text-gray-600">/</span>
          <span className="text-indigo-400 font-medium">Professor Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
            Review Queue
          </Link>
          <Link href="/admin/roster" className="text-sm text-gray-400 hover:text-white transition-colors">
            Roster
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300">
            Exit
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
