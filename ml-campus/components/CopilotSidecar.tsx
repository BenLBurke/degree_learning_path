'use client';

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import { getNextRecommendedNodes, getNodeById } from '@/lib/agent/pathfinder';

interface CopilotSidecarProps {
  knowledgeState: Record<string, number>;
  currentNodeId?: string;
  studentName?: string;
}

// Mini quiz card rendered by the agent
function QuizCard({ questions }: { questions: Array<{ question: string; options: string[] }> }) {
  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-xl border border-indigo-800">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Quick Quiz</p>
      {questions.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm text-gray-200">{q.question}</p>
          <div className="space-y-1">
            {q.options.map((opt, j) => (
              <button
                key={j}
                className="w-full text-left text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Mini path recommendation card
function PathCard({ nodeIds }: { nodeIds: string[] }) {
  const nodes = nodeIds.map((id) => getNodeById(id)).filter(Boolean);
  return (
    <div className="space-y-2 p-4 bg-gray-900 rounded-xl border border-indigo-800">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Recommended Next</p>
      {nodes.map((node) => (
        <a
          key={node!.id}
          href={`/session/${node!.id}`}
          className="block px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
        >
          <p className="text-sm font-medium text-gray-200">{node!.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{node!.estimatedHours}h</p>
        </a>
      ))}
    </div>
  );
}

// Knowledge map inline
function MiniKnowledgeMap({ knowledgeState }: { knowledgeState: Record<string, number> }) {
  return (
    <div className="space-y-3 p-4 bg-gray-900 rounded-xl border border-indigo-800">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Knowledge Map</p>
      {mitCurriculum.courses.map((course) => {
        const avg = course.nodes.reduce((sum, n) => sum + (knowledgeState[n.id] ?? 0), 0) / course.nodes.length;
        const pct = Math.round((avg / 4) * 100);
        return (
          <div key={course.id}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="truncate">{course.title}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full">
              <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple concept plot placeholder
function ConceptPlot({ title, xLabel, yLabel }: { title: string; xLabel: string; yLabel: string }) {
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-indigo-800">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">{title}</p>
      <svg viewBox="0 0 200 120" className="w-full h-auto">
        <line x1="20" y1="100" x2="180" y2="100" stroke="#4b5563" strokeWidth="1" />
        <line x1="20" y1="10" x2="20" y2="100" stroke="#4b5563" strokeWidth="1" />
        <path d="M20,95 Q80,30 180,15" fill="none" stroke="#6366f1" strokeWidth="2" />
        <text x="100" y="115" textAnchor="middle" fill="#6b7280" fontSize="8">{xLabel}</text>
        <text x="8" y="55" textAnchor="middle" fill="#6b7280" fontSize="8" transform="rotate(-90,8,55)">{yLabel}</text>
      </svg>
    </div>
  );
}

export default function CopilotSidecar({ knowledgeState, currentNodeId, studentName }: CopilotSidecarProps) {
  const currentNode = currentNodeId ? getNodeById(currentNodeId) : null;
  const recommended = getNextRecommendedNodes(knowledgeState, '').slice(0, 5);

  // Expose student context to the copilot agent
  useCopilotReadable({
    description: 'The student\'s current knowledge state — a map of nodeId to level (0=unknown, 4=mastered)',
    value: knowledgeState,
  });

  useCopilotReadable({
    description: 'The concept node the student is currently studying',
    value: currentNode ? { id: currentNode.id, title: currentNode.title, description: currentNode.description } : null,
  });

  useCopilotReadable({
    description: 'Recommended next nodes for the student based on their knowledge state',
    value: recommended,
  });

  // Generative UI actions
  useCopilotAction({
    name: 'renderQuiz',
    description: 'Display an interactive quiz to test the student\'s understanding of a concept',
    parameters: [
      {
        name: 'questions',
        type: 'object[]',
        description: 'Array of quiz questions with options',
        attributes: [
          { name: 'question', type: 'string', description: 'The question text' },
          { name: 'options', type: 'string[]', description: '4 answer options' },
        ],
      },
    ],
    render: ({ args }) => <QuizCard questions={(args.questions as any) ?? []} />,
  });

  useCopilotAction({
    name: 'renderPathRecommendation',
    description: 'Show recommended next nodes for the student to study',
    parameters: [
      {
        name: 'nodeIds',
        type: 'string[]',
        description: 'IDs of the recommended concept nodes',
      },
    ],
    render: ({ args }) => <PathCard nodeIds={(args.nodeIds as string[]) ?? recommended} />,
  });

  useCopilotAction({
    name: 'renderKnowledgeMap',
    description: 'Display the student\'s full knowledge map across all courses',
    parameters: [],
    render: () => <MiniKnowledgeMap knowledgeState={knowledgeState} />,
  });

  useCopilotAction({
    name: 'renderConceptPlot',
    description: 'Show a simple concept visualization plot (e.g. loss curve, gradient descent)',
    parameters: [
      { name: 'title', type: 'string', description: 'Plot title' },
      { name: 'xLabel', type: 'string', description: 'X axis label' },
      { name: 'yLabel', type: 'string', description: 'Y axis label' },
    ],
    render: ({ args }) => (
      <ConceptPlot
        title={(args.title as string) ?? 'Concept Plot'}
        xLabel={(args.xLabel as string) ?? 'x'}
        yLabel={(args.yLabel as string) ?? 'y'}
      />
    ),
  });

  return (
    <CopilotSidebar
      defaultOpen={false}
      labels={{
        title: 'ML Guide',
        initial: `Hi ${studentName ?? 'there'}! I'm your AI guide. I can quiz you, show your progress map, recommend next steps, or explain any concept. What would you like?`,
      }}
    />
  );
}
