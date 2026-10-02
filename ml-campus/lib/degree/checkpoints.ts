import { mitCurriculum } from './mitCurriculum';

export interface CheckpointInfo {
  checkpointId: string;
  type: string;
  prompt: string;
  nodeId: string;
  nodeTitle: string;
  courseId: string;
  courseTitle: string;
}

export type CheckpointStatus = 'passed' | 'pending' | 'failed' | 'todo';

export interface CheckpointWithStatus extends CheckpointInfo {
  status: CheckpointStatus;
}

export interface CourseCheckpoints {
  courseId: string;
  courseTitle: string;
  checkpoints: CheckpointWithStatus[];
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

interface ResultRow {
  checkpointId: string;
  passed: boolean;
  requiresHumanReview: boolean;
  submittedAt: Date | string;
}

/** Latest result per checkpoint → status. */
export function checkpointStatus(results: ResultRow[], checkpointId: string): CheckpointStatus {
  const matching = results
    .filter((r) => r.checkpointId === checkpointId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const latest = matching[0];
  if (!latest) return 'todo';
  if (latest.passed) return 'passed';
  if (latest.requiresHumanReview) return 'pending';
  return 'failed';
}

function statusFor(results: ResultRow[], checkpointId: string): CheckpointStatus {
  return checkpointStatus(results, checkpointId);
}

/** All checkpoints grouped by course, each tagged with the student's status. */
export function checkpointsByCourse(results: ResultRow[]): CourseCheckpoints[] {
  return mitCurriculum.courses.map((course) => ({
    courseId: course.id,
    courseTitle: course.title,
    checkpoints: course.nodes.flatMap((node) =>
      node.checkpoints.map((cp) => ({
        checkpointId: cp.id,
        type: cp.type,
        prompt: cp.prompt,
        nodeId: node.id,
        nodeTitle: node.title,
        courseId: course.id,
        courseTitle: course.title,
        status: statusFor(results, cp.id),
      }))
    ),
  }));
}
