'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewCardProps {
  result: {
    id: string;
    response: string;
    passed: boolean;
    agentFeedback: string | null;
    submittedAt: string;
  };
  studentName: string;
  studentEmail: string;
  nodeTitle: string;
  courseTitle: string;
  prompt: string;
  passingCriteria: string;
}

export default function ReviewCard(props: ReviewCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<'pass' | 'fail' | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function decide(pass: boolean) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: props.result.id, passed: pass, note }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed to save decision');
      }
      setDecision(pass ? 'pass' : 'fail');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{props.nodeTitle}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {props.courseTitle} · {props.studentName}{' '}
            {props.studentEmail && <span className="text-gray-600">({props.studentEmail})</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              props.result.passed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}
          >
            Agent: {props.result.passed ? 'pass' : 'fail'}
          </span>
          <span className="text-xs text-gray-600">
            {new Date(props.result.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Prompt + criteria */}
      {props.prompt && (
        <div className="text-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Prompt</p>
          <p className="text-gray-300">{props.prompt}</p>
        </div>
      )}
      {props.passingCriteria && (
        <div className="text-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Passing Criteria</p>
          <p className="text-gray-400">{props.passingCriteria}</p>
        </div>
      )}

      {/* Student response */}
      <div className="text-sm">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Student Response</p>
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 whitespace-pre-wrap">
          {props.result.response}
        </div>
      </div>

      {/* Agent feedback */}
      {props.result.agentFeedback && (
        <div className="text-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Agent Feedback</p>
          <p className="text-gray-400 italic">{props.result.agentFeedback}</p>
        </div>
      )}

      {/* Decision */}
      {decision ? (
        <p className={`text-sm font-medium ${decision === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
          Recorded as {decision === 'pass' ? 'PASS' : 'FAIL'}.
        </p>
      ) : (
        <div className="space-y-3 pt-2 border-t border-gray-800">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note to override the agent feedback…"
            className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => decide(true)}
              disabled={busy}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Approve (pass)
            </button>
            <button
              onClick={() => decide(false)}
              disabled={busy}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Reject (fail)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
