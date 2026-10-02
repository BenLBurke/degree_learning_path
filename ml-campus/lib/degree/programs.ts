import { mitCurriculum } from './mitCurriculum';

// A program is a distinct degree track — a named group of courses. Programs are
// independent: their course graphs do not share prerequisites.
export interface Program {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
}

export const PROGRAMS: Program[] = [
  {
    id: 'ml',
    title: 'Machine Learning',
    description: 'MIT-structured Machine Learning degree.',
    courseIds: [
      'math-linalg',
      'math-calc',
      'prob-stats',
      'intro-ml',
      'deep-learning',
      'rl',
      'nlp',
      'computer-vision',
      'ml-systems',
      'capstone',
    ],
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain',
    description: 'MITx Supply Chain Management (CTL.SC0x–SC4x) degree.',
    courseIds: [
      'scm-fundamentals',
      'scm-analytics',
      'scm-design',
      'scm-dynamics',
      'scm-technology',
      'scm-capstone',
    ],
  },
];

export const DEFAULT_PROGRAM_ID = 'ml';

export function getProgram(id: string | undefined): Program {
  return PROGRAMS.find((p) => p.id === id) ?? PROGRAMS[0];
}

export function programForCourse(courseId: string): Program | undefined {
  return PROGRAMS.find((p) => p.courseIds.includes(courseId));
}

/** Concept-node ids belonging to a program (all nodes in its courses). */
export function programNodeIds(programId: string): string[] {
  const program = getProgram(programId);
  const ids: string[] = [];
  for (const course of mitCurriculum.courses) {
    if (program.courseIds.includes(course.id)) {
      for (const node of course.nodes) ids.push(node.id);
    }
  }
  return ids;
}
