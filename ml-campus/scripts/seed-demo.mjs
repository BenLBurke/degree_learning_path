// Seed demo data: several students at different progress layers, plus a
// realistic review queue of checkpoint submissions for the professor portal.
//
// Usage (from ml-campus/):
//   node scripts/seed-demo.mjs
//
// Idempotent: re-running deletes the demo students (by email) and recreates
// them, so the review queue and roster stay clean.

import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

config({ path: '.env.local' });
config({ path: '.env' });

const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const url = rawUrl.startsWith('file:./')
  ? `file:${process.cwd()}/${rawUrl.slice(7)}`
  : rawUrl;

const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url }) });

// Real curriculum node ids grouped by course (from lib/degree/mitCurriculum.ts).
const COURSES = {
  'math-linalg': ['vectors-matrices', 'matrix-operations', 'linear-transformations', 'eigenvalues', 'svd', 'applications-ml'],
  'math-calc': ['derivatives-gradients', 'chain-rule', 'multivariate-calc', 'optimization-basics', 'convexity', 'lagrange-multipliers'],
  'prob-stats': ['probability-foundations', 'random-variables', 'distributions', 'expectation-variance', 'bayesian-inference', 'hypothesis-testing'],
  'intro-ml': ['ml-fundamentals', 'linear-regression', 'classification', 'model-evaluation', 'regularization', 'neural-nets-intro'],
  'deep-learning': ['backpropagation', 'deep-nn-architecture', 'training-techniques', 'cnns', 'rnns-lstms', 'transformers'],
  'rl': ['mdp-foundations', 'dynamic-programming', 'q-learning', 'policy-gradient', 'deep-rl', 'rl-applications'],
  'nlp': ['text-representations', 'language-models', 'attention-mechanism', 'bert-gpt', 'fine-tuning', 'nlp-applications'],
  'computer-vision': ['image-fundamentals', 'conv-nets-vision', 'object-detection', 'segmentation', 'generative-vision', 'vision-applications'],
  'ml-systems': ['ml-pipelines', 'data-engineering', 'model-serving', 'distributed-training', 'mlops', 'monitoring-drift'],
  'capstone': ['project-scoping', 'data-collection', 'model-development', 'evaluation-reporting', 'deployment', 'presentation'],
};

const COURSE_ORDER = Object.keys(COURSES);

/**
 * Build a full knowledge-state map from a "progress frontier": how many whole
 * courses are mastered, plus a partially-learned current course. Produces a
 * realistic gradient (mastered -> proficient -> familiar -> unknown).
 */
function buildKnowledge({ masteredCourses, currentCourseLevels }) {
  const ks = {};
  COURSE_ORDER.forEach((courseId, i) => {
    const nodes = COURSES[courseId];
    if (i < masteredCourses) {
      nodes.forEach((n) => (ks[n] = 4));
    } else if (i === masteredCourses && currentCourseLevels) {
      nodes.forEach((n, j) => (ks[n] = currentCourseLevels[j] ?? 0));
    } else {
      nodes.forEach((n) => (ks[n] = 0));
    }
  });
  return ks;
}

// ── Demo students ───────────────────────────────────────────────────────────
const STUDENTS = [
  {
    name: 'Aisha Khan',
    email: 'demo.aisha@byui.edu',
    background: 'Physics undergrad, strong math, self-taught Python. Aiming for research.',
    goals: ['depth'],
    // Near the finish line: 8 courses mastered, deep into vision.
    knowledge: buildKnowledge({ masteredCourses: 8, currentCourseLevels: [4, 4, 3, 3, 2, 1] }),
    checkpoints: [
      { id: 'cp-vectors-matrices-1', passed: true, review: false, feedback: 'Flawless — correct dot product, norms, and cosine with clean working.' },
      { id: 'cp-eigenvalues-1', passed: true, review: false, feedback: 'Correct eigenvalues and eigenvectors; strong grasp of diagonalization.' },
      { id: 'cp-backpropagation-1', passed: true, review: false, feedback: 'Derived the chain-rule gradient flow correctly.' },
      { id: 'cp-cnns-1', passed: true, review: false, feedback: 'Solid understanding of convolution and parameter sharing.' },
    ],
  },
  {
    name: 'Marcus Johnson',
    email: 'demo.marcus@byui.edu',
    background: 'Bootcamp grad, 2 years as a web dev. Comfortable coding, rusty on math.',
    goals: ['career'],
    // Solid foundations, mid intro-ml. One flagged oral, one failed classification.
    knowledge: buildKnowledge({ masteredCourses: 3, currentCourseLevels: [4, 3, 2, 2, 1, 1] }),
    checkpoints: [
      { id: 'cp-vectors-matrices-1', passed: true, review: false, feedback: 'Correct, though the cosine step needed a nudge.' },
      { id: 'cp-eigenvalues-2', passed: false, review: true, feedback: 'Oral response gestures at the spectral theorem but does not justify orthogonality. Needs human review.' },
      { id: 'cp-linear-regression-1', passed: true, review: false, feedback: 'Good derivation of the normal equations.' },
      { id: 'cp-classification-1', passed: false, review: false, feedback: 'Confused the decision boundary with the loss surface; logistic vs. linear not distinguished.' },
    ],
  },
  {
    name: 'Priya Patel',
    email: 'demo.priya@byui.edu',
    background: 'Data analyst, strong stats, wants to move into ML engineering.',
    goals: ['breadth', 'career'],
    // Strong through prob-stats, working through deep learning. One flagged.
    knowledge: buildKnowledge({ masteredCourses: 4, currentCourseLevels: [4, 3, 3, 2, 1, 0] }),
    checkpoints: [
      { id: 'cp-bayesian-inference-1', passed: true, review: false, feedback: 'Excellent Bayesian updating with correct posterior.' },
      { id: 'cp-neural-nets-intro-1', passed: true, review: false, feedback: 'Clear on activation functions and the universal approximation intuition.' },
      { id: 'cp-backpropagation-2', passed: false, review: true, feedback: 'Written explanation is close but hand-waves the vanishing-gradient argument. Flagged for instructor review.' },
    ],
  },
  {
    name: 'Sofia Nguyen',
    email: 'demo.sofia@byui.edu',
    background: 'First-year CS student. Motivated but new to linear algebra.',
    goals: ['breadth'],
    // Just starting: partway through the first course.
    knowledge: buildKnowledge({ masteredCourses: 0, currentCourseLevels: [3, 2, 1, 0, 0, 0] }),
    checkpoints: [
      { id: 'cp-vectors-matrices-1', passed: true, review: false, feedback: 'Nice work for a first checkpoint — all three quantities correct.' },
      { id: 'cp-matrix-operations-1', passed: false, review: false, feedback: 'Product correct, but the inverse was miscomputed; revisit cofactor method.' },
    ],
  },
  {
    name: 'Derek Williams',
    email: 'demo.derek@byui.edu',
    background: 'Career switcher from finance. Strong quant intuition, inconsistent follow-through.',
    goals: ['depth', 'career'],
    // Uneven: good calc, gaps elsewhere. A flagged oral awaiting review.
    knowledge: buildKnowledge({ masteredCourses: 2, currentCourseLevels: [3, 1, 2, 0, 1, 0] }),
    checkpoints: [
      { id: 'cp-svd-1', passed: true, review: false, feedback: 'Good statement of Eckart–Young and the variance connection.' },
      { id: 'cp-eigenvalues-2', passed: false, review: true, feedback: 'Oral answer is intuitive but skips the symmetry argument. Needs a human call.' },
      { id: 'cp-classification-2', passed: false, review: false, feedback: 'Precision/recall tradeoff misapplied to the given confusion matrix.' },
    ],
  },
];

const SAMPLE_RESPONSES = {
  'cp-eigenvalues-2': 'Symmetric matrices are special because they mirror across the diagonal, so their eigenvectors end up perpendicular. I think it has to do with the spectral theorem but I am not totally sure how to prove the orthogonality part.',
  'cp-backpropagation-2': 'Backprop applies the chain rule from the loss backward. When you multiply lots of small derivatives together through many layers the gradient gets tiny, which is the vanishing gradient problem. ReLU helps because its derivative is 1 for positive inputs.',
  default: 'Here is my worked solution with the steps shown as requested.',
};

async function main() {
  const emails = STUDENTS.map((s) => s.email);

  // Clean prior demo data (checkpoint results + knowledge states cascade via studentId).
  const existing = await prisma.student.findMany({ where: { email: { in: emails } } });
  const ids = existing.map((s) => s.id);
  if (ids.length) {
    await prisma.checkpointResult.deleteMany({ where: { studentId: { in: ids } } });
    await prisma.knowledgeState.deleteMany({ where: { studentId: { in: ids } } });
    await prisma.student.deleteMany({ where: { id: { in: ids } } });
  }

  for (const s of STUDENTS) {
    const student = await prisma.student.create({
      data: {
        name: s.name,
        email: s.email,
        password: null,
        role: 'student',
        background: s.background,
        goals: JSON.stringify(s.goals),
        onboardingComplete: true,
      },
    });

    await prisma.knowledgeState.createMany({
      data: Object.entries(s.knowledge).map(([nodeId, level]) => ({
        studentId: student.id,
        nodeId,
        level,
      })),
    });

    let daysAgo = s.checkpoints.length;
    for (const cp of s.checkpoints) {
      await prisma.checkpointResult.create({
        data: {
          studentId: student.id,
          checkpointId: cp.id,
          response: SAMPLE_RESPONSES[cp.id] ?? SAMPLE_RESPONSES.default,
          passed: cp.passed,
          agentFeedback: cp.feedback,
          requiresHumanReview: cp.review,
          submittedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
      daysAgo -= 1;
    }
    console.log(`  seeded ${s.name} (${s.checkpoints.length} submissions)`);
  }

  const pending = STUDENTS.flatMap((s) => s.checkpoints).filter((c) => c.review).length;
  const failed = STUDENTS.flatMap((s) => s.checkpoints).filter((c) => !c.review && !c.passed).length;
  console.log(`\n✅ Seeded ${STUDENTS.length} demo students.`);
  console.log(`   Review queue: ${pending} awaiting review, ${failed} recent non-passes.\n`);
}

main()
  .catch((e) => {
    console.error('\n❌ seed-demo failed:\n', e.message ?? e, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
