'use client';

import dynamic from 'next/dynamic';

const DegreeGraph = dynamic(() => import('@/components/DegreeGraph'), { ssr: false });

interface CheckpointResultRow {
  id: string;
  checkpointId: string;
  response: string;
  passed: boolean;
  agentFeedback: string | null;
  requiresHumanReview: boolean;
  submittedAt: string;
}

interface Props {
  knowledgeState: Record<string, number>;
  checkpointResults?: CheckpointResultRow[];
  readOnly?: boolean;
}

export default function DegreeGraphClient({ knowledgeState, checkpointResults, readOnly }: Props) {
  return (
    <DegreeGraph
      knowledgeState={knowledgeState}
      checkpointResults={checkpointResults}
      readOnly={readOnly}
    />
  );
}
