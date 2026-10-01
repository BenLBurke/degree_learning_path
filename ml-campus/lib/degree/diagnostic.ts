// Static diagnostic: 10 fixed, degree-relevant self-assessment questions.
// No AI, no backend call — deterministic onboarding. Each answer maps the
// listed concept nodes to the chosen knowledge level (0..4).

export interface DiagnosticOption {
  label: string;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface DiagnosticQuestion {
  id: string;
  prompt: string;
  topic: string;
  nodes: string[]; // curriculum node ids this question assesses
}

// Uniform self-report scale reused by every question.
export const DIAGNOSTIC_OPTIONS: DiagnosticOption[] = [
  { label: 'Never encountered it', level: 0 },
  { label: "I've heard of it", level: 1 },
  { label: 'I can use the basics', level: 2 },
  { label: "I'm comfortable with it", level: 3 },
  { label: 'I could teach it', level: 4 },
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q-linalg-basics',
    topic: 'Linear Algebra',
    prompt: 'Vectors, matrices, and matrix operations (multiplication, inverse, rank):',
    nodes: ['vectors-matrices', 'matrix-operations'],
  },
  {
    id: 'q-linalg-advanced',
    topic: 'Linear Algebra',
    prompt: 'Eigenvalues, eigenvectors, and the singular value decomposition (SVD):',
    nodes: ['linear-transformations', 'eigenvalues', 'svd'],
  },
  {
    id: 'q-calculus',
    topic: 'Calculus',
    prompt: 'Derivatives, gradients, and the chain rule:',
    nodes: ['derivatives-gradients', 'chain-rule', 'multivariate-calc'],
  },
  {
    id: 'q-optimization',
    topic: 'Optimization',
    prompt: 'Optimization basics, convexity, and gradient descent:',
    nodes: ['optimization-basics', 'convexity'],
  },
  {
    id: 'q-probability',
    topic: 'Probability',
    prompt: 'Probability, random variables, and common distributions:',
    nodes: ['probability-foundations', 'random-variables', 'distributions'],
  },
  {
    id: 'q-statistics',
    topic: 'Statistics',
    prompt: 'Expectation/variance, Bayesian inference, and hypothesis testing:',
    nodes: ['expectation-variance', 'bayesian-inference', 'hypothesis-testing'],
  },
  {
    id: 'q-ml-fundamentals',
    topic: 'Machine Learning',
    prompt: 'ML fundamentals and linear/logistic regression:',
    nodes: ['ml-fundamentals', 'linear-regression'],
  },
  {
    id: 'q-ml-classification',
    topic: 'Machine Learning',
    prompt: 'Classification, model evaluation, and regularization:',
    nodes: ['classification', 'model-evaluation', 'regularization'],
  },
  {
    id: 'q-neural-nets',
    topic: 'Deep Learning',
    prompt: 'Neural networks, backpropagation, and network architecture:',
    nodes: ['neural-nets-intro', 'backpropagation', 'deep-nn-architecture'],
  },
  {
    id: 'q-deep-architectures',
    topic: 'Deep Learning',
    prompt: 'Modern architectures — CNNs, RNNs/LSTMs, and transformers:',
    nodes: ['cnns', 'rnns-lstms', 'transformers'],
  },
];

/**
 * Turn the per-question chosen levels into a knowledge-state map.
 * answers[i] is the level chosen for DIAGNOSTIC_QUESTIONS[i].
 */
export function buildKnowledgeStateFromAnswers(answers: number[]): Record<string, number> {
  const ks: Record<string, number> = {};
  DIAGNOSTIC_QUESTIONS.forEach((q, i) => {
    const level = answers[i] ?? 0;
    for (const nodeId of q.nodes) ks[nodeId] = level;
  });
  return ks;
}
