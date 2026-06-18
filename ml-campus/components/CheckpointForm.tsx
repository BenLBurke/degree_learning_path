'use client';

import { useState } from 'react';

interface CheckpointFormProps {
  checkpointId: string;
  nodeId: string;
  prompt: string;
  type: 'written' | 'problem_set' | 'code' | 'oral';
}

interface Result {
  passed: boolean;
  feedback: string;
  requiresHumanReview: boolean;
}

export default function CheckpointForm({ checkpointId, nodeId, prompt, type }: CheckpointFormProps) {
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function submit() {
    if (!response.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/checkpoint/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId, nodeId, response }),
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl p-6 border ${
            result.passed
              ? 'bg-green-900/30 border-green-700'
              : 'bg-red-900/30 border-red-700'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`text-2xl font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}
            >
              {result.passed ? '✓ Passed' : '✗ Not yet'}
            </span>
            {result.requiresHumanReview && (
              <span className="text-xs bg-yellow-800 text-yellow-300 px-2 py-1 rounded-full">
                Pending instructor review
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{result.feedback}</p>
        </div>
        {!result.passed && (
          <button
            onClick={() => { setResult(null); setResponse(''); }}
            className="text-sm text-indigo-400 hover:text-indigo-300 underline"
          >
            Try again
          </button>
        )}
        {result.passed && (
          <p className="text-sm text-gray-500">
            This node's knowledge level has been updated. Return to the dashboard to continue.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide mb-2">
          Checkpoint · {type.replace('_', ' ')}
        </p>
        <p className="text-gray-100 text-sm leading-relaxed">{prompt}</p>
      </div>

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your response here…"
        rows={8}
        className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-600 rounded-xl px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={submitting}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || !response.trim()}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
      >
        {submitting ? 'Assessing…' : 'Submit for Assessment'}
      </button>
    </div>
  );
}
