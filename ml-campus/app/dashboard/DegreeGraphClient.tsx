'use client';

import dynamic from 'next/dynamic';

const DegreeGraph = dynamic(() => import('@/components/DegreeGraph'), { ssr: false });

interface Props {
  knowledgeState: Record<string, number>;
  readOnly?: boolean;
}

export default function DegreeGraphClient({ knowledgeState, readOnly }: Props) {
  return <DegreeGraph knowledgeState={knowledgeState} readOnly={readOnly} />;
}
