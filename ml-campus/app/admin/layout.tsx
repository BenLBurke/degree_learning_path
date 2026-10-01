import { redirect } from 'next/navigation';
import { getCurrentProfessor } from '@/lib/auth/roles';
import { pendingReviewCount } from '@/lib/admin/pending';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const professor = await getCurrentProfessor();
  if (!professor) redirect('/dashboard');

  const pending = await pendingReviewCount();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <AdminSidebar pendingCount={pending} professorName={professor.name} />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
