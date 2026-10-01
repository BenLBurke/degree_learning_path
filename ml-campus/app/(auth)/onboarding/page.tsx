'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_OPTIONS,
  buildKnowledgeStateFromAnswers,
} from '@/lib/degree/diagnostic';

type Goal = 'breadth' | 'depth' | 'career';

interface Profile {
  name: string;
  email: string;
  background: string;
  goals: Goal[];
}

const GOAL_OPTIONS: { value: Goal; label: string; desc: string }[] = [
  { value: 'breadth', label: 'Broad Overview', desc: 'Cover the full ML landscape' },
  { value: 'depth', label: 'Deep Mastery', desc: 'Go deep in specific areas' },
  { value: 'career', label: 'Career-Ready', desc: 'Focus on industry-valued skills' },
];

const TOTAL_QUESTIONS = DIAGNOSTIC_QUESTIONS.length;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', background: '', goals: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [knowledgeState, setKnowledgeState] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  function toggleGoal(g: Goal) {
    setProfile((p) => ({
      ...p,
      goals: p.goals.includes(g) ? p.goals.filter((x) => x !== g) : [...p.goals, g],
    }));
  }

  function startDiagnostic() {
    setCurrentIndex(0);
    setAnswers([]);
    setStep(2);
  }

  // Record the chosen level for the current question and advance. Hard-capped
  // at TOTAL_QUESTIONS — once the last question is answered we go to the summary.
  function selectOption(level: number) {
    const updated = [...answers];
    updated[currentIndex] = level;
    setAnswers(updated);

    if (currentIndex >= TOTAL_QUESTIONS - 1) {
      setKnowledgeState(buildKnowledgeStateFromAnswers(updated));
      setStep(3);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  async function createAccount() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, password, knowledgeState }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Registration failed');
      }
      router.push('/login?registered=true');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Who are you?</h2>
              <p className="text-gray-400 text-sm mt-1">Your guide will personalize everything to you.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Background</label>
              <textarea
                value={profile.background}
                onChange={(e) => setProfile((p) => ({ ...p, background: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="E.g. Software engineer with Python experience, studied stats in undergrad…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Learning goals</label>
              <div className="space-y-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => toggleGoal(g.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      profile.goals.includes(g.value)
                        ? 'border-indigo-500 bg-indigo-900/40 text-indigo-200'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{g.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startDiagnostic}
              disabled={!profile.name.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Continue to Diagnostic →
            </button>
          </div>
        )}

        {/* Step 2: Diagnostic (static, 10 self-assessment questions) */}
        {step === 2 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Knowledge Diagnostic</h2>
              <p className="text-gray-400 text-sm mt-1">
                Question {currentIndex + 1} of {TOTAL_QUESTIONS} · {DIAGNOSTIC_QUESTIONS[currentIndex].topic} —
                answer honestly so we can map your starting point.
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {DIAGNOSTIC_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < currentIndex ? 'bg-green-500' : i === currentIndex ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-100 text-sm leading-relaxed">
                How would you rate your knowledge of: <span className="font-medium">{DIAGNOSTIC_QUESTIONS[currentIndex].prompt}</span>
              </p>
            </div>

            <div className="space-y-2">
              {DIAGNOSTIC_OPTIONS.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => selectOption(opt.level)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-gray-200 hover:border-indigo-500 hover:bg-indigo-900/30 transition-all text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {currentIndex > 0 && (
              <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-300">
                ← Previous question
              </button>
            )}
          </div>
        )}

        {/* Step 3: Summary + create account */}
        {step === 3 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Your path is ready.</h2>
              <p className="text-gray-400 text-sm mt-1">
                We've mapped your knowledge state. Create your account to begin.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2">
              <p className="text-sm text-gray-300"><span className="font-medium">Name:</span> {profile.name}</p>
              <p className="text-sm text-gray-300"><span className="font-medium">Goals:</span> {profile.goals.join(', ') || 'General'}</p>
              <p className="text-sm text-gray-300">
                <span className="font-medium">Nodes assessed:</span>{' '}
                {Object.keys(knowledgeState).length}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-medium">Known concepts:</span>{' '}
                {Object.values(knowledgeState).filter((v) => v >= 2).length}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Choose a password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={createAccount}
              disabled={submitting || !password.trim() || !profile.email.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {submitting ? 'Creating account…' : 'Launch My Degree →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
