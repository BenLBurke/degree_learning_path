'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';
import { getNodeStatus, NodeStatus } from '@/lib/agent/pathfinder';

interface DegreeGraphProps {
  knowledgeState: Record<string, number>;
  checkpointResults?: Array<{ checkpointId: string; passed: boolean; requiresHumanReview?: boolean }>;
}

const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed',
  available: 'bg-indigo-900 border-indigo-500 text-indigo-200 cursor-pointer hover:border-indigo-300',
  'in-progress': 'bg-yellow-900 border-yellow-500 text-yellow-200 cursor-pointer hover:border-yellow-300',
  'checkpoint-pending': 'bg-orange-900 border-orange-500 text-orange-200 cursor-pointer',
  complete: 'bg-green-900 border-green-500 text-green-200 cursor-pointer',
};

const STATUS_MINIMAP: Record<NodeStatus, string> = {
  locked: '#374151',
  available: '#3730a3',
  'in-progress': '#78350f',
  'checkpoint-pending': '#7c2d12',
  complete: '#14532d',
};

function CurriculumNode({ data }: NodeProps) {
  return (
    <div className={`px-3 py-2 rounded-lg border-2 text-xs font-medium min-w-[120px] max-w-[160px] text-center ${data.style}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-600" />
      <div className="truncate">{data.label}</div>
      <div className="text-[10px] opacity-60 mt-0.5">{data.hours}h</div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
    </div>
  );
}

const nodeTypes = { curriculum: CurriculumNode };

export default function DegreeGraph({ knowledgeState, checkpointResults = [] }: DegreeGraphProps) {
  const router = useRouter();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    let courseX = 0;
    for (const course of mitCurriculum.courses) {
      let nodeY = 0;
      for (const node of course.nodes) {
        const status = getNodeStatus(node.id, knowledgeState, checkpointResults);
        nodes.push({
          id: node.id,
          type: 'curriculum',
          position: { x: courseX, y: nodeY },
          data: {
            label: node.title,
            hours: node.estimatedHours,
            style: STATUS_STYLES[status],
            status,
            nodeId: node.id,
          },
        });
        for (const prereq of node.prerequisites) {
          const edgeId = `${prereq}->${node.id}`;
          if (!edgeSet.has(edgeId)) {
            edgeSet.add(edgeId);
            edges.push({
              id: edgeId,
              source: prereq,
              target: node.id,
              style: { stroke: '#4b5563', strokeWidth: 1 },
              animated: status === 'in-progress',
            });
          }
        }
        nodeY += 110;
      }
      courseX += 200;
    }
    return { nodes, edges };
  }, [knowledgeState, checkpointResults]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const { status, nodeId } = node.data;
      if (status === 'locked') return;
      router.push(`/session/${nodeId}`);
    },
    [router]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-950"
      >
        <Background color="#374151" gap={20} />
        <Controls className="!bg-gray-800 !border-gray-700 !text-gray-300" />
        <MiniMap
          nodeColor={(n) => STATUS_MINIMAP[n.data?.status as NodeStatus] ?? '#374151'}
          className="!bg-gray-900 !border-gray-700"
        />
      </ReactFlow>
    </div>
  );
}
