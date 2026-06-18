import { mitCurriculum, ConceptNode } from '../degree/mitCurriculum';

const MASTERY_THRESHOLD = 4; // level >= 4 means mastered
const UNLOCK_THRESHOLD = 2; // prerequisite satisfied at level >= 2

let nodeIndex: Map<string, ConceptNode> | null = null;

function buildIndex(): Map<string, ConceptNode> {
  if (nodeIndex) return nodeIndex;
  const idx = new Map<string, ConceptNode>();
  for (const course of mitCurriculum.courses) {
    for (const node of course.nodes) {
      idx.set(node.id, node);
    }
  }
  nodeIndex = idx;
  return idx;
}

export function getNodeById(nodeId: string): ConceptNode | null {
  return buildIndex().get(nodeId) ?? null;
}

export function getAllNodes(): ConceptNode[] {
  return mitCurriculum.courses.flatMap((c) => c.nodes);
}

function level(knowledgeState: Record<string, number>, nodeId: string): number {
  return knowledgeState[nodeId] ?? 0;
}

/**
 * A node is available if every prerequisite is at level >= UNLOCK_THRESHOLD.
 * A node already at level >= UNLOCK_THRESHOLD is also considered unlocked.
 */
export function getAvailableNodes(knowledgeState: Record<string, number>): string[] {
  const available: string[] = [];
  for (const node of getAllNodes()) {
    if (level(knowledgeState, node.id) >= UNLOCK_THRESHOLD) {
      available.push(node.id);
      continue;
    }
    const prereqsMet = node.prerequisites.every(
      (p) => level(knowledgeState, p) >= UNLOCK_THRESHOLD
    );
    if (prereqsMet) available.push(node.id);
  }
  return available;
}

/**
 * Recommend nodes the student can work on next: available, not yet mastered.
 * Goals string biases ordering toward breadth, depth, or career outcomes.
 */
export function getNextRecommendedNodes(
  knowledgeState: Record<string, number>,
  goals: string
): string[] {
  const available = new Set(getAvailableNodes(knowledgeState));
  const nodes = getAllNodes();

  // Course order maps roughly to depth; preserve curriculum order as baseline.
  const courseOrder = new Map<string, number>();
  mitCurriculum.courses.forEach((c, i) => courseOrder.set(c.id, i));

  const candidates = nodes.filter(
    (n) => available.has(n.id) && level(knowledgeState, n.id) < MASTERY_THRESHOLD
  );

  const g = (goals || '').toLowerCase();
  const wantsBreadth = g.includes('breadth');
  const wantsDepth = g.includes('depth');
  const wantsCareer = g.includes('career');

  const scored = candidates.map((n) => {
    const courseIdx = courseOrder.get(n.courseId) ?? 0;
    const lvl = level(knowledgeState, n.id);
    let score = 0;

    // Baseline: prefer earlier curriculum nodes and partially-started ones.
    score += courseIdx * 10;
    score += (MASTERY_THRESHOLD - lvl); // nudge toward nearly-finished nodes

    if (wantsBreadth) {
      // Spread across courses: reward the first unmastered node of each course.
      score -= courseIdx * 4;
    }
    if (wantsDepth) {
      // Go deep: reward staying within already-started courses.
      const startedCourse = nodes.some(
        (m) => m.courseId === n.courseId && level(knowledgeState, m.id) >= UNLOCK_THRESHOLD
      );
      if (startedCourse) score -= 15;
    }
    if (wantsCareer) {
      // Bias toward applied/systems courses valued in industry.
      const careerCourses = ['intro-ml', 'deep-learning', 'ml-systems', 'nlp', 'computer-vision'];
      if (careerCourses.includes(n.courseId)) score -= 12;
    }

    return { id: n.id, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.id);
}

export type NodeStatus =
  | 'locked'
  | 'available'
  | 'in-progress'
  | 'checkpoint-pending'
  | 'complete';

export function getNodeStatus(
  nodeId: string,
  knowledgeState: Record<string, number>,
  checkpointResults?: Array<{ checkpointId: string; passed: boolean; requiresHumanReview?: boolean }>
): NodeStatus {
  const node = getNodeById(nodeId);
  if (!node) return 'locked';

  const lvl = level(knowledgeState, nodeId);
  const available = new Set(getAvailableNodes(knowledgeState));

  if (lvl >= MASTERY_THRESHOLD) return 'complete';

  if (!available.has(nodeId)) return 'locked';

  // Checkpoint-pending: a checkpoint was submitted that requires human review
  // and is not yet decisively passed, or the node is at level 3 (post-checkpoint
  // but not fully mastered).
  if (checkpointResults && checkpointResults.length > 0) {
    const nodeCheckpointIds = new Set(node.checkpoints.map((c) => c.id));
    const pending = checkpointResults.some(
      (r) =>
        nodeCheckpointIds.has(r.checkpointId) &&
        r.requiresHumanReview &&
        !r.passed
    );
    if (pending) return 'checkpoint-pending';
  }

  if (lvl >= 3) return 'checkpoint-pending';
  if (lvl >= 1) return 'in-progress';
  return 'available';
}
