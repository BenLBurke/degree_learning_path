'use client';

import { useRouter } from 'next/navigation';

interface Props {
  students: { id: string; name: string; email: string }[];
  selectedId: string;
}

export default function StudentPicker({ students, selectedId }: Props) {
  const router = useRouter();

  return (
    <select
      value={selectedId}
      onChange={(e) => {
        const id = e.target.value;
        router.push(id ? `/dashboard?studentId=${id}` : '/dashboard');
      }}
      className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      title="View a student's progress"
    >
      <option value="">My dashboard</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
