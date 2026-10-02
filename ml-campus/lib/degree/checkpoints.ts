import { mitCurriculum } from './mitCurriculum';

export interface CheckpointInfo {
  checkpointId: string;
  type: string;
  prompt: string;
  passingCriteria: string;
  nodeId: string;
  nodeTitle: string;
  courseId: string;
  courseTitle: string;
}

export type CheckpointStatus = 'passed' | 'pending' | 'failed' | 'todo';

export interface Submission {
  resultId: string;
  response: string;
  feedback: string | null;
  passed: boolean;
  requiresHumanReview: boolean;
  submittedAt: string;
}

export interface CheckpointWithStatus extends CheckpointInfo {
  status: CheckpointStatus;
  latest?: Submission;
}

export interface CourseCheckpoints {
  courseId: string;
  courseTitle: string;
  checkpoints: CheckpointWithStatus[];
}

export interface ResultRow {
  id: string;
  checkpointId: string;
  response: string;
  passed: boolean;
  agentFeedback: string | null;
  requiresHumanReview: boolean;
  submittedAt: Date | string;
}

/** Every checkpoint in the curriculum, with its course/node context. */
export function allCheckpoints(): CheckpointInfo[] {
  const out: CheckpointInfo[] = [];
  for (const course of mitCurriculum.courses) {
    for (const node of course.nodes) {
      for (const cp of node.checkpoints) {
        out.push({
          checkpointId: cp.id,
          type: cp.type,
          prompt: cp.prompt,
          passingCriteria: cp.passingCriteria,
          nodeId: node.id,
          nodeTitle: node.title,
          courseId: course.id,
          courseTitle: course.title,
        });
      }
    }
  }
  return out;
}

/** Latest submission for a checkpoint, or undefined. */
export function latestSubmission(results: ResultRow[], checkpointId: string): Submission | undefined {
  const matching = results
    .filter((r) => r.checkpointId === checkpointId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const r = matching[0];
  if (!r) return undefined;
  return {
    resultId: r.id,
    response: r.response,
    feedback: r.agentFeedback,
    passed: r.passed,
    requiresHumanReview: r.requiresHumanReview,
    submittedAt: typeof r.submittedAt === 'string' ? r.submittedAt : r.submittedAt.toISOString(),
  };
}

export function statusFromSubmission(s: Submission | undefined): CheckpointStatus {
  if (!s) return 'todo';
  if (s.passed) return 'passed';
  if (s.requiresHumanReview) return 'pending';
  return 'failed';
}

/** Status for a checkpoint from a result set. */
export function checkpointStatus(results: ResultRow[], checkpointId: string): CheckpointStatus {
  return statusFromSubmission(latestSubmission(results, checkpointId));
}

/** All checkpoints grouped by course, each with the student's status + latest submission. */
export function checkpointsByCourse(results: ResultRow[]): CourseCheckpoints[] {
  return mitCurriculum.courses.map((course) => ({
    courseId: course.id,
    courseTitle: course.title,
    checkpoints: course.nodes.flatMap((node) =>
      node.checkpoints.map((cp) => {
        const latest = latestSubmission(results, cp.id);
        return {
          checkpointId: cp.id,
          type: cp.type,
          prompt: cp.prompt,
          passingCriteria: cp.passingCriteria,
          nodeId: node.id,
          nodeTitle: node.title,
          courseId: course.id,
          courseTitle: course.title,
          status: statusFromSubmission(latest),
          latest,
        };
      })
    ),
  }));
}
