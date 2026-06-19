'use client';

import dynamic from 'next/dynamic';

const CopilotProvider = dynamic(() => import('./CopilotProvider'), { ssr: false });
const CopilotSidecar = dynamic(() => import('./CopilotSidecar'), { ssr: false });

interface Props {
  knowledgeState: Record<string, number>;
  currentNodeId?: string;
  studentName?: string;
}

export default function CopilotSidecarWrapper({ knowledgeState, currentNodeId, studentName }: Props) {
  if (process.env.NEXT_PUBLIC_ENABLE_COPILOT_SIDECAR !== 'true') return null;
  return (
    <CopilotProvider>
      <CopilotSidecar
        knowledgeState={knowledgeState}
        currentNodeId={currentNodeId}
        studentName={studentName}
      />
    </CopilotProvider>
  );
}
