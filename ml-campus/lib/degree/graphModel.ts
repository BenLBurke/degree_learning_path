import { mitCurriculum, ConceptNode, Course } from './mitCurriculum';

const MASTERY = 4;
const UNLOCK = 2;

// ── Lookups ──────────────────────────────────────────────────────────────────
const courseById = new Map<string, Course>();
const nodeById = new Map<string, ConceptNode>();
const courseOfNode = new Map<string, string>();
for (const course of mitCurriculum.courses) {
  courseById.set(course.id, course);
  for (const node of course.nodes) {
    nodeById.set(node.id, node);
    courseOfNode.set(node.id, course.id);
  }
}

export function getCourse(courseId: string): Course | undefined {
  return courseById.get(courseId);
}
export function getConcept(nodeId: string): ConceptNode | undefined {
  return nodeById.get(nodeId);
}
export function courseIdOf(nodeId: string): string | undefined {
  return courseOfNode.get(nodeId);
}

const lvl = (ks: Record<string, number>, id: string) => ks[id] ?? 0;

// ── Mastery ──────────────────────────────────────────────────────────────────
export interface Mastery {
  pct: number; // 0..100, average level / 4
  mastered: number; // count at level 4
  total: number;
  avg: number; // 0..4
}

export function courseMastery(courseId: string, ks: Record<string, number>): Mastery {
  const course = courseById.get(courseId);
  if (!course) return { pct: 0, mastered: 0, total: 0, avg: 0 };
  const levels = course.nodes.map((n) => lvl(ks, n.id));
  const total = levels.length;
  const sum = levels.reduce((a, b) => a + b, 0);
  const mastered = levels.filter((l) => l >= MASTERY).length;
  const avg = total ? sum / total : 0;
  return { pct: Math.round((avg / MASTERY) * 100), mastered, total, avg };
}

export function conceptMastery(nodeId: string, ks: Record<string, number>): Mastery {
  const level = lvl(ks, nodeId);
  return { pct: Math.round((level / MASTERY) * 100), mastered: level >= MASTERY ? 1 : 0, total: 1, avg: level };
}

// ── Course-level dependency graph (derived from concept prerequisites) ─────────
const coursePrereqs = new Map<string, Set<string>>();
const courseDependents = new Map<string, Set<string>>();
for (const course of mitCurriculum.courses) {
  coursePrereqs.set(course.id, new Set());
  courseDependents.set(course.id, new Set());
}
for (const course of mitCurriculum.courses) {
  for (const node of course.nodes) {
    for (const prereq of node.prerequisites) {
      const fromCourse = courseOfNode.get(prereq);
      if (fromCourse && fromCourse !== course.id) {
        coursePrereqs.get(course.id)!.add(fromCourse);
        courseDependents.get(fromCourse)!.add(course.id);
      }
    }
  }
}

export function coursePrereqIds(courseId: string): string[] {
  return Array.from(coursePrereqs.get(courseId) ?? []);
}
export function courseDependentIds(courseId: string): string[] {
  return Array.from(courseDependents.get(courseId) ?? []);
}

export interface CourseEdge {
  source: string;
  target: string;
}
export function courseEdges(): CourseEdge[] {
  const edges: CourseEdge[] = [];
  for (const [courseId, prereqs] of Array.from(coursePrereqs.entries())) {
    for (const p of Array.from(prereqs)) edges.push({ source: p, target: courseId });
  }
  return edges;
}

// ── Concept-level dependents (prereqs live on the node itself) ────────────────
const conceptDependents = new Map<string, string[]>();
for (const node of Array.from(nodeById.values())) {
  for (const p of node.prerequisites) {
    const arr = conceptDependents.get(p) ?? [];
    arr.push(node.id);
    conceptDependents.set(p, arr);
  }
}
export function conceptDependentIds(nodeId: string): string[] {
  return conceptDependents.get(nodeId) ?? [];
}
export function conceptPrereqIds(nodeId: string): string[] {
  return nodeById.get(nodeId)?.prerequisites ?? [];
}

// ── Availability ──────────────────────────────────────────────────────────────
export function isConceptUnlocked(nodeId: string, ks: Record<string, number>): boolean {
  if (lvl(ks, nodeId) >= UNLOCK) return true;
  const node = nodeById.get(nodeId);
  if (!node) return false;
  return node.prerequisites.every((p) => lvl(ks, p) >= UNLOCK);
}

export function isCourseUnlocked(courseId: string, ks: Record<string, number>): boolean {
  // A course is enterable if any of its concepts is unlocked, or it has begun.
  const course = courseById.get(courseId);
  if (!course) return false;
  return course.nodes.some((n) => isConceptUnlocked(n.id, ks) || lvl(ks, n.id) >= 1);
}

export function allCourses(): Course[] {
  return mitCurriculum.courses;
}
