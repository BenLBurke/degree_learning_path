'use client';

import { mitCurriculum } from '@/lib/degree/mitCurriculum';

interface KnowledgeMapProps {
  knowledgeState: Record<string, number>;
}

const LEVEL_LABELS = ['Unknown', 'Aware', 'Familiar', 'Proficient', 'Mastered'];
const LEVEL_COLORS = [
  'bg-gray-700',
  'bg-blue-800',
  'bg-blue-600',
  'bg-indigo-500',
  'bg-green-500',
];

export default function KnowledgeMap({ knowledgeState }: KnowledgeMapProps) {
  return (
    <div className="space-y-6">
      {mitCurriculum.courses.map((course) => {
        const levels = course.nodes.map((n) => knowledgeState[n.id] ?? 0);
        const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
        const pct = Math.round((avgLevel / 4) * 100);

        return (
          <div key={course.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">{course.title}</span>
              <span className="text-xs text-gray-500">{pct}%</span>
            </div>
            {/* Course progress bar */}
            <div className="h-2 bg-gray-700 rounded-full mb-3">
              <div
                className="h-2 bg-indigo-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            {/* Per-node dots */}
            <div className="flex gap-2 flex-wrap">
              {course.nodes.map((node) => {
                const lvl = knowledgeState[node.id] ?? 0;
                return (
                  <div key={node.id} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded-full ${LEVEL_COLORS[lvl]}`}
                      title={`${node.title}: ${LEVEL_LABELS[lvl]}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap pt-2 border-t border-gray-700">
        {LEVEL_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${LEVEL_COLORS[i]}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
