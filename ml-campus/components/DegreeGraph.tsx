'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  courseMastery,
  conceptMastery,
  courseEdges,
  coursePrereqIds,
  courseDependentIds,
  conceptPrereqIds,
  conceptDependentIds,
  isCourseUnlocked,
  isConceptUnlocked,
  getCourse,
  getConcept,
} from '@/lib/degree/graphModel';
import NodeDetailModal, { NodeDetail } from './NodeDetailModal';

interface DegreeGraphProps {
  knowledgeState: Record<string, number>;
  readOnly?: boolean; // professor viewing a student — no session navigation
}

type View = { level: 'courses' } | { level: 'concepts'; courseId: string };

// A circular bubble whose fill rises from the bottom to show mastery %.
function BubbleNode({ data }: NodeProps) {
  const pct = data.pct as number;
  const fill = pct >= 100 ? '#22c55e' : '#6366f1';
  const role = data.highlightRole as string | undefined; // 'self' | 'prev' | 'next' | 'dim' | undefined
  const ring =
    role === 'self'
      ? '0 0 0 3px #f9fafb'
      : role === 'prev'
      ? '0 0 0 3px #f59e0b'
      : role === 'next'
      ? '0 0 0 3px #22d3ee'
      : 'none';
  const opacity = role === 'dim' ? 0.35 : 1;
  const size = data.kind === 'course' ? 108 : 88;

  return (
    <div style={{ opacity }} className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="!bg-gray-600 !w-2 !h-2" />
      <div
        className="rounded-full border-2 flex flex-col items-center justify-center text-center transition-all"
        style={{
          width: size,
          height: size,
          borderColor: data.unlocked ? (pct >= 100 ? '#22c55e' : '#6366f1') : '#4b5563',
          background: `linear-gradient(to top, ${fill} ${pct}%, #1f2937 ${pct}%)`,
          boxShadow: ring,
          cursor: 'pointer',
        }}
      >
        <span className="text-[11px] font-semibold text-white px-2 leading-tight drop-shadow">
          {data.label}
        </span>
        <span className="text-[10px] text-gray-200/80 mt-0.5">{pct}%</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onInfo?.();
        }}
        className="mt-1 text-[10px] text-gray-500 hover:text-indigo-300"
      >
        ⓘ details
      </button>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-600 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { bubble: BubbleNode };

export default function DegreeGraph({ knowledgeState: ks, readOnly = false }: DegreeGraphProps) {
  const router = useRouter();
  const [view, setView] = useState<View>({ level: 'courses' });
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [detail, setDetail] = useState<NodeDetail | null>(null);

  // Build course-view or concept-view nodes/edges.
  const built = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (view.level === 'courses') {
      mitCurriculum.courses.forEach((course, i) => {
        const m = courseMastery(course.id, ks);
        const unlocked = isCourseUnlocked(course.id, ks);
        const col = i % 4;
        const row = Math.floor(i / 4);
        nodes.push({
          id: course.id,
          type: 'bubble',
          position: { x: col * 230, y: row * 220 },
          data: {
            kind: 'course',
            label: course.title,
            pct: m.pct,
            unlocked,
            onInfo: () => openCourseDetail(course.id),
          },
        });
      });
      for (const e of courseEdges()) {
        edges.push({ id: `${e.source}->${e.target}`, source: e.source, target: e.target });
      }
    } else {
      const course = getCourse(view.courseId)!;
      course.nodes.forEach((node, i) => {
        const m = conceptMastery(node.id, ks);
        const unlocked = isConceptUnlocked(node.id, ks);
        const col = i % 3;
        const row = Math.floor(i / 3);
        nodes.push({
          id: node.id,
          type: 'bubble',
          position: { x: col * 200, y: row * 200 },
          data: {
            kind: 'concept',
            label: node.title,
            pct: m.pct,
            unlocked,
            onInfo: () => openConceptDetail(node.id),
          },
        });
        // Edges only among concepts within this course (intra-course prereqs).
        for (const p of node.prerequisites) {
          if (course.nodes.some((n) => n.id === p)) {
            edges.push({ id: `${p}->${node.id}`, source: p, target: node.id });
          }
        }
      });
    }
    return { nodes, edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, ks]);

  // Apply highlight styling derived from highlightId.
  const { styledNodes, styledEdges } = useMemo(() => {
    const prevSet = new Set<string>();
    const nextSet = new Set<string>();
    if (highlightId) {
      const prereqs =
        view.level === 'courses' ? coursePrereqIds(highlightId) : conceptPrereqIds(highlightId);
      const deps =
        view.level === 'courses' ? courseDependentIds(highlightId) : conceptDependentIds(highlightId);
      prereqs.forEach((p) => prevSet.add(p));
      deps.forEach((d) => nextSet.add(d));
    }

    const styledNodes = built.nodes.map((n) => {
      let role: string | undefined;
      if (highlightId) {
        if (n.id === highlightId) role = 'self';
        else if (prevSet.has(n.id)) role = 'prev';
        else if (nextSet.has(n.id)) role = 'next';
        else role = 'dim';
      }
      return { ...n, data: { ...n.data, highlightRole: role } };
    });

    const styledEdges = built.edges.map((e) => {
      const touches = highlightId && (e.source === highlightId || e.target === highlightId);
      const isPrev = highlightId && e.target === highlightId; // incoming = previous
      const isNext = highlightId && e.source === highlightId; // outgoing = next
      return {
        ...e,
        animated: !!touches,
        style: {
          stroke: isPrev ? '#f59e0b' : isNext ? '#22d3ee' : touches ? '#f9fafb' : '#374151',
          strokeWidth: touches ? 2.5 : 1,
          opacity: highlightId && !touches ? 0.25 : 1,
        },
      };
    });

    return { styledNodes, styledEdges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built, highlightId, view]);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(styledNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(styledEdges);

  // Keep ReactFlow state in sync when derived nodes/edges change.
  useEffect(() => {
    setRfNodes(styledNodes);
    setRfEdges(styledEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styledNodes, styledEdges]);

  // ── Detail builders ─────────────────────────────────────────────────────────
  function openCourseDetail(courseId: string) {
    const course = getCourse(courseId)!;
    const m = courseMastery(courseId, ks);
    setDetail({
      kind: 'course',
      id: courseId,
      title: course.title,
      subtitle: `MIT ${course.mitEquivalent} · ${m.mastered}/${m.total} concepts mastered`,
      description: course.description,
      masteryPct: m.pct,
      unlocked: isCourseUnlocked(courseId, ks),
      prereqs: coursePrereqIds(courseId).map((id) => ({
        id,
        title: getCourse(id)?.title ?? id,
        mastered: courseMastery(id, ks).pct >= 100,
      })),
      dependents: courseDependentIds(courseId).map((id) => ({
        id,
        title: getCourse(id)?.title ?? id,
        mastered: false,
      })),
      actionLabel: 'Open course →',
      onAction: () => {
        setDetail(null);
        setHighlightId(null);
        setView({ level: 'concepts', courseId });
      },
    });
  }

  function openConceptDetail(nodeId: string) {
    const node = getConcept(nodeId)!;
    const m = conceptMastery(nodeId, ks);
    const unlocked = isConceptUnlocked(nodeId, ks);
    setDetail({
      kind: 'concept',
      id: nodeId,
      title: node.title,
      subtitle: getCourse(node.courseId)?.title,
      description: node.description,
      masteryPct: m.pct,
      unlocked,
      estimatedHours: node.estimatedHours,
      prereqs: conceptPrereqIds(nodeId).map((id) => ({
        id,
        title: getConcept(id)?.title ?? id,
        mastered: (ks[id] ?? 0) >= 2,
      })),
      dependents: conceptDependentIds(nodeId).map((id) => ({
        id,
        title: getConcept(id)?.title ?? id,
        mastered: false,
      })),
      actionLabel: readOnly ? undefined : unlocked ? 'Start learning session →' : 'Locked — finish prerequisites',
      onAction: readOnly ? undefined : () => router.push(`/session/${nodeId}`),
    });
  }

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (view.level === 'courses') setView({ level: 'concepts', courseId: node.id });
      else if (node.data.kind === 'concept') openConceptDetail(node.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view]
  );

  const currentCourse = view.level === 'concepts' ? getCourse(view.courseId) : null;

  return (
    <div className="w-full h-full relative">
      {/* Breadcrumb */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-sm bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-1.5">
        <button
          onClick={() => { setView({ level: 'courses' }); setHighlightId(null); }}
          className={view.level === 'courses' ? 'text-gray-300 font-medium' : 'text-indigo-400 hover:text-indigo-300'}
        >
          All Courses
        </button>
        {currentCourse && (
          <>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 font-medium">{currentCourse.title}</span>
          </>
        )}
        <span className="text-gray-600 ml-2 text-xs hidden sm:inline">
          {view.level === 'courses' ? 'click a course to open it' : 'click a concept for details'}
        </span>
      </div>

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={(_, n) => setHighlightId(n.id)}
        onNodeMouseLeave={() => setHighlightId(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        className="bg-gray-950"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#374151" gap={22} />
        <Controls className="!bg-gray-800 !border-gray-700" />
        <MiniMap className="!bg-gray-900 !border-gray-700" nodeColor="#4b5563" />
      </ReactFlow>

      <NodeDetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
