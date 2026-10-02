'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CourseCheckpoints, CheckpointStatus, CheckpointWithStatus } from '@/lib/degree/checkpoints';

type Filter = 'all' | 'done' | 'todo';

const STATUS_META: Record<CheckpointStatus, { label: string; cls: string }> = {
  passed: { label: 'Passed', cls: 'bg-green-900 text-green-300' },
  pending: { label: 'Pending review', cls: 'bg-yellow-900 text-yellow-300' },
  failed: { label: 'Retry', cls: 'bg-red-900 text-red-300' },
  todo: { label: 'Not started', cls: 'bg-gray-800 text-gray-400' },
};

function CheckpointRow({
  cp,
  canAttempt,
  canResolve,
}: {
  cp: CheckpointWithStatus;
  canAttempt: boolean;
  canResolve: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const meta = STATUS_META[cp.status];

  async function resolve(passed: boolean) {
    if (!cp.latest) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: cp.latest.resultId, passed, note }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed to save decision');
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const canReview = canResolve && cp.latest && cp.status !== 'passed';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="min-w-0 flex items-center gap-2">
          <span className={`text-gray-500 text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
          <div className="min-w-0">
            <p className="text-sm text-gray-200 truncate">{cp.nodeTitle}</p>
            <p className="text-xs text-gray-500 capitalize">{cp.type.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ml-3 ${meta.cls}`}>
          {meta.label}
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-800">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Question</p>
            <p className="text-sm text-gray-300">{cp.prompt}</p>
          </div>

          {cp.latest ? (
            <>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Submitted response</p>
                <div className="text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 whitespace-pre-wrap">
                  {cp.latest.response}
                </div>
              </div>
              {cp.latest.feedback && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Feedback</p>
                  <p className="text-sm text-gray-400 italic">{cp.latest.feedback}</p>
                </div>
              )}
              <p className="text-[11px] text-gray-600">
                Submitted {new Date(cp.latest.submittedAt).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Not attempted yet.</p>
          )}

          {/* Professor resolve controls */}
          {canReview && (
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note to the student…"
                className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => resolve(true)}
                  disabled={busy}
                  className="px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium"
                >
                  Approve (pass)
                </button>
                <button
                  onClick={() => resolve(false)}
                  disabled={busy}
                  className="px-3 py-1.5 bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium"
                >
                  Reject (fail)
                </button>
              </div>
            </div>
          )}

          {/* Student attempt link */}
          {canAttempt && cp.status !== 'passed' && (
            <Link
              href={`/checkpoint/${cp.checkpointId}?nodeId=${cp.nodeId}`}
              className="inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              {cp.status === 'todo' ? 'Attempt this checkpoint →' : 'Retry this checkpoint →'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckpointList({
  courses,
  canAttempt = false,
  canResolve = false,
}: {
  courses: CourseCheckpoints[];
  canAttempt?: boolean;
  canResolve?: boolean;
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
              {visible.map((cp) => (
                <CheckpointRow
                  key={cp.checkpointId}
                  cp={cp}
                  canAttempt={canAttempt}
                  canResolve={canResolve}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
