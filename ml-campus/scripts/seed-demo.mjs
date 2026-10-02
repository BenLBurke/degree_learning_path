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
    degree: 'ml',
    background: 'Physics undergrad, strong math, self-taught Python. Aiming for research.',
    goals: ['depth'],
    // Near the finish line: 8 courses mastered, deep into vision.
    knowledge: buildKnowledge({ masteredCourses: 8, currentCourseLevels: [4, 4, 3, 3, 2, 1] }),
    checkpoints: [
      // Linear Algebra — all checkpoints passed (course shows complete/green).
      { id: 'cp-vectors-matrices-1', passed: true, review: false, feedback: 'Flawless — correct dot product, norms, and cosine.' },
      { id: 'cp-vectors-matrices-2', passed: true, review: false, feedback: 'Clear projection/similarity explanation.' },
      { id: 'cp-matrix-operations-1', passed: true, review: false, feedback: 'Correct product, inverse, and rank.' },
      { id: 'cp-linear-transformations-1', passed: true, review: false, feedback: 'All four subspaces correct.' },
      { id: 'cp-eigenvalues-1', passed: true, review: false, feedback: 'Correct eigenvalues and eigenvectors.' },
      { id: 'cp-eigenvalues-2', passed: true, review: false, feedback: 'Solid spectral-theorem argument.' },
      { id: 'cp-svd-1', passed: true, review: false, feedback: 'Good Eckart–Young explanation.' },
      { id: 'cp-applications-ml-1', passed: true, review: false, feedback: 'Strong PCA connection.' },
      // Deep learning — partial.
      { id: 'cp-backpropagation-1', passed: true, review: false, feedback: 'Derived the chain-rule gradient flow correctly.' },
      { id: 'cp-cnns-1', passed: true, review: false, feedback: 'Solid understanding of convolution.' },
    ],
  },
  {
    name: 'Marcus Johnson',
    email: 'demo.marcus@byui.edu',
    degree: 'ml',
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
    degree: 'ml',
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
    degree: 'supply-chain',
    background: 'First-year business student starting the supply chain degree.',
    goals: ['breadth'],
    // Just starting: into fundamentals.
    knowledge: {
      'scf-logistics': 3,
      'scf-forecasting': 2,
      'scf-eoq': 1,
      'scf-safety-stock': 0,
      'scf-transport': 0,
    },
    checkpoints: [
      { id: 'cp-scf-logistics-1', passed: true, review: false, feedback: 'Good grasp of the cost-vs-service trade-off.' },
      { id: 'cp-scf-forecasting-1', passed: false, review: false, feedback: 'Smoothing recursion applied incorrectly after the first step.' },
    ],
  },
  {
    name: 'Derek Williams',
    email: 'demo.derek@byui.edu',
    degree: 'supply-chain',
    background: 'Operations analyst moving into supply chain strategy.',
    goals: ['depth', 'career'],
    // Through fundamentals and analytics, into design. Two flagged reviews.
    knowledge: {
      'scf-logistics': 4, 'scf-forecasting': 4, 'scf-eoq': 4, 'scf-safety-stock': 3, 'scf-transport': 3,
      'sca-stats': 4, 'sca-regression': 3, 'sca-optimization': 2, 'sca-integer-opt': 1, 'sca-simulation': 1,
      'scd-network': 1,
    },
    checkpoints: [
      // Supply Chain Fundamentals — all passed (course shows complete/green).
      { id: 'cp-scf-logistics-1', passed: true, review: false, feedback: 'Good grasp of the cost-vs-service trade-off.' },
      { id: 'cp-scf-forecasting-1', passed: true, review: false, feedback: 'Correct smoothing application.' },
      { id: 'cp-scf-eoq-1', passed: true, review: false, feedback: 'Correct EOQ and order frequency.' },
      { id: 'cp-scf-safety-stock-1', passed: true, review: false, feedback: 'Correct safety stock and reorder point.' },
      { id: 'cp-scf-transport-1', passed: true, review: false, feedback: 'Clear LTL-vs-FTL trade-off.' },
      // Analytics / Design — flagged for review.
      { id: 'cp-sca-simulation-1', passed: false, review: true, feedback: 'Names simulation but does not justify when it beats a queuing formula. Needs human review.' },
      { id: 'cp-scd-network-1', passed: false, review: true, feedback: 'Lists costs but does not resolve the facility-count decision. Flagged for review.' },
    ],
  },
];

const SAMPLE_RESPONSES = {
  'cp-eigenvalues-2': 'Symmetric matrices are special because they mirror across the diagonal, so their eigenvectors end up perpendicular. I think it has to do with the spectral theorem but I am not totally sure how to prove the orthogonality part.',
  'cp-backpropagation-2': 'Backprop applies the chain rule from the loss backward. When you multiply lots of small derivatives together through many layers the gradient gets tiny, which is the vanishing gradient problem. ReLU helps because its derivative is 1 for positive inputs.',
  'cp-sca-simulation-1': 'I would use simulation when the system is too complicated for a formula. Queuing formulas are faster but simulation can handle more detail, so I would simulate when there are lots of moving parts.',
  'cp-scd-network-1': 'Adding regional DCs lowers transportation cost and improves delivery speed, but it increases facility and inventory costs. You would add them if the savings beat the added cost.',
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
        degree: s.degree ?? 'ml',
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
