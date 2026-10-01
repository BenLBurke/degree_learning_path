'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CourseCheckpoints, CheckpointStatus } from '@/lib/degree/checkpoints';

type Filter = 'all' | 'done' | 'todo';

const STATUS_META: Record<CheckpointStatus, { label: string; cls: string }> = {
  passed: { label: 'Passed', cls: 'bg-green-900 text-green-300' },
  pending: { label: 'Pending review', cls: 'bg-yellow-900 text-yellow-300' },
  failed: { label: 'Retry', cls: 'bg-red-900 text-red-300' },
  todo: { label: 'Not started', cls: 'bg-gray-800 text-gray-400' },
};

export default function CheckpointList({
  courses,
  readOnly = false,
}: {
  courses: CourseCheckpoints[];
  readOnly?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const matches = (s: CheckpointStatus) =>
    filter === 'all' ? true : filter === 'done' ? s === 'passed' : s !== 'passed';

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'done', 'todo'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'todo' ? 'To do' : f}
          </button>
        ))}
      </div>

      {courses.map((course) => {
        const visible = course.checkpoints.filter((c) => matches(c.status));
        if (visible.length === 0) return null;
        const passed = course.checkpoints.filter((c) => c.status === 'passed').length;
        return (
          <div key={course.courseId}>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-200">{course.courseTitle}</h2>
              <span className="text-xs text-gray-500">
                {passed}/{course.checkpoints.length} passed
              </span>
            </div>
            <div className="space-y-2">
              {visible.map((cp) => {
                const meta = STATUS_META[cp.status];
                const inner = (
                  <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{cp.nodeTitle}</p>
                      <p className="text-xs text-gray-500 capitalize">{cp.type.replace('_', ' ')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ml-3 ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                );
                return readOnly ? (
                  <div key={cp.checkpointId}>{inner}</div>
                ) : (
                  <Link
                    key={cp.checkpointId}
                    href={`/checkpoint/${cp.checkpointId}?nodeId=${cp.nodeId}`}
                    className="block hover:opacity-90 transition-opacity"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
