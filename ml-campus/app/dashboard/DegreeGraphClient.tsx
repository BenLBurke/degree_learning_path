'use client';

import dynamic from 'next/dynamic';

const DegreeGraph = dynamic(() => import('@/components/DegreeGraph'), { ssr: false });

interface Props {
  knowledgeState: Record<string, number>;
  checkpointResults: Array<{ checkpointId: string; passed: boolean; requiresHumanReview?: boolean }>;
}

export default function DegreeGraphClient({ knowledgeState, checkpointResults }: Props) {
  return <DegreeGraph knowledgeState={knowledgeState} checkpointResults={checkpointResults} />;
}
