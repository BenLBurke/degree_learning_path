'use client';

interface DepItem {
  id: string;
  title: string;
  mastered: boolean;
}

export interface NodeDetail {
  kind: 'course' | 'concept';
  id: string;
  title: string;
  subtitle?: string; // mitEquivalent or course name
  description: string;
  masteryPct: number;
  unlocked: boolean;
  prereqs: DepItem[];
  dependents: DepItem[];
  estimatedHours?: number;
  // Primary action
  actionLabel?: string;
  onAction?: () => void;
}

export default function NodeDetailModal({
  detail,
  onClose,
}: {
  detail: NodeDetail | null;
  onClose: () => void;
}) {
  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-indigo-400 font-semibold">
                {detail.kind}
              </span>
              {!detail.unlocked && (
                <span className="text-[10px] uppercase tracking-wide text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                  Locked
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{detail.title}</h2>
            {detail.subtitle && <p className="text-sm text-gray-500">{detail.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mastery */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Mastery</span>
            <span>
              {detail.masteryPct}%{detail.estimatedHours ? ` · ${detail.estimatedHours}h` : ''}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all"
              style={{ width: `${detail.masteryPct}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed">{detail.description}</p>

        {/* Dependencies */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Requires ({detail.prereqs.length})
            </p>
            {detail.prereqs.length === 0 ? (
              <p className="text-xs text-gray-600">No prerequisites — a starting point.</p>
            ) : (
              <ul className="space-y-1.5">
                {detail.prereqs.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${d.mastered ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className={d.mastered ? 'text-gray-300' : 'text-gray-500'}>{d.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Unlocks ({detail.dependents.length})
            </p>
            {detail.dependents.length === 0 ? (
              <p className="text-xs text-gray-600">Nothing depends on this yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {detail.dependents.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-gray-400">{d.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Action */}
        {detail.actionLabel && detail.onAction && (
          <button
            onClick={detail.onAction}
            disabled={!detail.unlocked && detail.kind === 'concept'}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {detail.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
