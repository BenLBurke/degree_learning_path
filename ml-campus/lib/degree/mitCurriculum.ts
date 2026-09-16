// MIT-flavored ML degree curriculum graph.
// 10 courses, each with 4-6 concept nodes, logical prerequisites within and
// across courses, 1-2 checkpoints per node, and real content blocks.

export type KnowledgeLevel = 0 | 1 | 2 | 3 | 4;

export interface ContentBlock {
  type: 'text' | 'link' | 'problem';
  content: string;
}

export interface Checkpoint {
  id: string;
  nodeId: string;
  type: 'written' | 'problem_set' | 'code' | 'oral';
  prompt: string;
  passingCriteria: string;
  requiresHumanReview: boolean;
}

export interface ConceptNode {
  id: string;
  courseId: string;
  title: string;
  description: string;
  prerequisites: string[];
  content: ContentBlock[];
  checkpoints: Checkpoint[];
  estimatedHours: number;
}

export interface Course {
  id: string;
  title: string;
  mitEquivalent: string;
  description: string;
  nodes: ConceptNode[];
}

export interface DegreeGraph {
  courses: Course[];
}

// ---------------------------------------------------------------------------
// Course 1 — Linear Algebra (18.06)
// ---------------------------------------------------------------------------
const mathLinalg: Course = {
  id: 'math-linalg',
  title: 'Linear Algebra',
  mitEquivalent: '18.06',
  description:
    'The language of machine learning: vectors, matrices, transformations, and the spectral theory that underpins dimensionality reduction and modern ML.',
  nodes: [
    {
      id: 'vectors-matrices',
      courseId: 'math-linalg',
      title: 'Vectors & Matrices',
      description:
        'Vector spaces, dot products, norms, and the matrix as a fundamental data structure for representing systems of equations and datasets.',
      prerequisites: [],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'A vector is an element of a vector space; in R^n it is an ordered list of numbers. The dot product u·v = Σ u_i v_i measures alignment and induces the Euclidean norm ||v|| = sqrt(v·v).' },
        { type: 'text', content: 'A matrix encodes a linear map and a system of equations Ax = b. Rows and columns can be read as data points or as features — a duality used everywhere in ML.' },
        { type: 'link', content: 'MIT 18.06 Lecture 1: The Geometry of Linear Equations — https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/' },
        { type: 'problem', content: 'Given u=(1,2,2) and v=(2,0,1), compute u·v, ||u||, and the cosine of the angle between them.' },
      ],
      checkpoints: [
        { id: 'cp-vectors-matrices-1', nodeId: 'vectors-matrices', type: 'problem_set', prompt: 'Compute the dot product, both Euclidean norms, and the cosine similarity for u=(3,-1,2) and v=(1,4,-2). Show each step.', passingCriteria: 'Correct dot product (−3), correct norms (sqrt(14), sqrt(21)), and cosine ≈ −0.175 with clear working.', requiresHumanReview: false },
        { id: 'cp-vectors-matrices-2', nodeId: 'vectors-matrices', type: 'written', prompt: 'Explain in your own words why the dot product can be interpreted both as a measure of similarity and as a projection.', passingCriteria: 'Student connects u·v = ||u||||v||cosθ to both similarity and the scalar projection of one vector onto another.', requiresHumanReview: false },
      ],
    },
    {
      id: 'matrix-operations',
      courseId: 'math-linalg',
      title: 'Matrix Operations',
      description:
        'Matrix multiplication, inverse, transpose, rank, and how Gaussian elimination solves linear systems.',
      prerequisites: ['vectors-matrices'],
      estimatedHours: 10,
      content: [
        { type: 'text', content: 'Matrix multiplication composes linear maps: (AB)x = A(Bx). It is associative but not commutative. The rank of A is the dimension of its column space and determines solvability of Ax = b.' },
        { type: 'text', content: 'Gaussian elimination reduces A to row-echelon form, exposing pivots, rank, and the inverse when it exists. The inverse A^{-1} satisfies A A^{-1} = I.' },
        { type: 'problem', content: 'Solve the system: x + 2y = 5, 3x + 4y = 6 using elimination, then verify with the matrix inverse.' },
      ],
      checkpoints: [
        { id: 'cp-matrix-operations-1', nodeId: 'matrix-operations', type: 'problem_set', prompt: 'Multiply A=[[1,2],[0,1]] by B=[[2,0],[1,3]], compute A^{-1}, and state the rank of AB.', passingCriteria: 'Correct product, correct inverse [[1,-2],[0,1]], and rank 2 identified.', requiresHumanReview: false },
      ],
    },
    {
      id: 'linear-transformations',
      courseId: 'math-linalg',
      title: 'Linear Transformations',
      description:
        'Matrices as transformations of space: rotations, scalings, projections, and the four fundamental subspaces.',
      prerequisites: ['matrix-operations'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Every linear map T(x) = Ax preserves lines through the origin and addition. The column space, null space, row space, and left null space are the four fundamental subspaces.' },
        { type: 'text', content: 'Projections P = A(A^T A)^{-1} A^T project onto the column space and are the foundation of least-squares regression.' },
        { type: 'link', content: 'MIT 18.06 — The Four Fundamental Subspaces.' },
      ],
      checkpoints: [
        { id: 'cp-linear-transformations-1', nodeId: 'linear-transformations', type: 'written', prompt: 'Describe the four fundamental subspaces of a 3x2 matrix and give their dimensions when the matrix has rank 2.', passingCriteria: 'Correct dimensions: column space 2, left null space 1, row space 2, null space 0.', requiresHumanReview: false },
      ],
    },
    {
      id: 'eigenvalues',
      courseId: 'math-linalg',
      title: 'Eigenvalues & Eigenvectors',
      description:
        'Characteristic equations, diagonalization, and why eigenvectors reveal the natural axes of a transformation.',
      prerequisites: ['linear-transformations'],
      estimatedHours: 11,
      content: [
        { type: 'text', content: 'An eigenvector v satisfies Av = λv. Eigenvalues are roots of det(A − λI) = 0. Diagonalization A = QΛQ^{-1} decouples a system into independent modes.' },
        { type: 'text', content: 'Symmetric matrices have real eigenvalues and orthogonal eigenvectors (the spectral theorem) — central to PCA and covariance analysis.' },
        { type: 'problem', content: 'Find the eigenvalues and eigenvectors of A=[[2,1],[1,2]].' },
      ],
      checkpoints: [
        { id: 'cp-eigenvalues-1', nodeId: 'eigenvalues', type: 'problem_set', prompt: 'For A=[[4,1],[2,3]], compute the eigenvalues and one eigenvector for each.', passingCriteria: 'Eigenvalues 5 and 2 with correct corresponding eigenvectors.', requiresHumanReview: false },
        { id: 'cp-eigenvalues-2', nodeId: 'eigenvalues', type: 'oral', prompt: 'Explain why symmetric matrices always have orthogonal eigenvectors.', passingCriteria: 'Student references the spectral theorem and orthogonality of eigenspaces.', requiresHumanReview: true },
      ],
    },
    {
      id: 'svd',
      courseId: 'math-linalg',
      title: 'Singular Value Decomposition',
      description:
        'The SVD A = UΣV^T: the most important matrix factorization for ML, enabling low-rank approximation and PCA.',
      prerequisites: ['eigenvalues'],
      estimatedHours: 10,
      content: [
        { type: 'text', content: 'Every matrix factors as A = UΣV^T with orthogonal U, V and non-negative singular values on Σ. Truncating small singular values gives the best low-rank approximation (Eckart–Young).' },
        { type: 'text', content: 'SVD connects to eigenvalues: singular values are square roots of eigenvalues of A^T A. PCA is SVD applied to centered data.' },
        { type: 'link', content: 'Gilbert Strang — Singular Value Decomposition lecture.' },
      ],
      checkpoints: [
        { id: 'cp-svd-1', nodeId: 'svd', type: 'written', prompt: 'Explain how SVD produces the best rank-k approximation of a matrix and why this matters for compression.', passingCriteria: 'Student states Eckart–Young theorem and connects singular value magnitude to retained variance.', requiresHumanReview: false },
      ],
    },
    {
      id: 'applications-ml',
      courseId: 'math-linalg',
      title: 'Linear Algebra in ML',
      description:
        'PCA, least squares, and how data lives in high-dimensional vector spaces.',
      prerequisites: ['svd'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'PCA finds directions of maximum variance via eigen/SVD of the covariance matrix. Least squares solves min ||Ax − b|| using the normal equations A^T A x = A^T b.' },
        { type: 'problem', content: 'Given a 2D dataset, derive the first principal component direction by hand.' },
      ],
      checkpoints: [
        { id: 'cp-applications-ml-1', nodeId: 'applications-ml', type: 'code', prompt: 'Implement PCA from scratch (centering, covariance, eigendecomposition) and project a small dataset onto 2 components.', passingCriteria: 'Working code that centers data, computes covariance, extracts top eigenvectors, and projects correctly.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 2 — Calculus (18.01 / 18.02)
// ---------------------------------------------------------------------------
const mathCalc: Course = {
  id: 'math-calc',
  title: 'Calculus for Machine Learning',
  mitEquivalent: '18.01/18.02',
  description:
    'Single and multivariable calculus, gradients, and optimization theory — the machinery that powers gradient descent and training.',
  nodes: [
    {
      id: 'derivatives-gradients',
      courseId: 'math-calc',
      title: 'Derivatives & Gradients',
      description:
        'Limits, derivatives, partial derivatives, and the gradient vector pointing in the direction of steepest ascent.',
      prerequisites: [],
      estimatedHours: 9,
      content: [
        { type: 'text', content: "The derivative f'(x) is the instantaneous rate of change. For multivariable f, the gradient ∇f stacks all partial derivatives and points uphill the fastest." },
        { type: 'text', content: 'Gradients are the central object in ML optimization: parameters are updated by stepping opposite the gradient of the loss.' },
        { type: 'problem', content: 'Compute the gradient of f(x,y) = x^2 + 3xy + y^2 at (1,2).' },
      ],
      checkpoints: [
        { id: 'cp-derivatives-gradients-1', nodeId: 'derivatives-gradients', type: 'problem_set', prompt: 'Compute the gradient of f(x,y)=x^2 y + sin(y) and evaluate it at (2, 0).', passingCriteria: 'Correct gradient (2xy, x^2 + cos y) = (0, 5) at (2,0).', requiresHumanReview: false },
      ],
    },
    {
      id: 'chain-rule',
      courseId: 'math-calc',
      title: 'The Chain Rule',
      description:
        'Composition of functions and the multivariate chain rule — the mathematical heart of backpropagation.',
      prerequisites: ['derivatives-gradients'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: "The chain rule states (f∘g)'(x) = f'(g(x)) g'(x). The multivariate form composes Jacobians and is exactly what backprop applies layer by layer." },
        { type: 'problem', content: 'Differentiate h(x) = (3x^2 + 1)^5 using the chain rule.' },
      ],
      checkpoints: [
        { id: 'cp-chain-rule-1', nodeId: 'chain-rule', type: 'written', prompt: 'Explain how the chain rule lets you compute the derivative of a deeply nested function, and relate it to backpropagation.', passingCriteria: 'Student describes layer-by-layer Jacobian multiplication and links it to gradient flow in networks.', requiresHumanReview: false },
      ],
    },
    {
      id: 'multivariate-calc',
      courseId: 'math-calc',
      title: 'Multivariate Calculus',
      description:
        'Partial derivatives, Jacobians, Hessians, and Taylor expansions in multiple dimensions.',
      prerequisites: ['chain-rule'],
      estimatedHours: 10,
      content: [
        { type: 'text', content: 'The Jacobian generalizes the derivative to vector-valued functions; the Hessian collects second partials and describes local curvature. Second-order Taylor expansions justify Newton-type optimizers.' },
        { type: 'problem', content: 'Compute the Hessian of f(x,y) = x^2 y + y^3.' },
      ],
      checkpoints: [
        { id: 'cp-multivariate-calc-1', nodeId: 'multivariate-calc', type: 'problem_set', prompt: 'Compute the Jacobian of F(x,y)=(x^2+y, xy) and the Hessian of g(x,y)=x^2+xy+y^2.', passingCriteria: 'Correct Jacobian [[2x,1],[y,x]] and Hessian [[2,1],[1,2]].', requiresHumanReview: false },
      ],
    },
    {
      id: 'optimization-basics',
      courseId: 'math-calc',
      title: 'Optimization Basics',
      description:
        'Critical points, gradient descent, learning rates, and convergence intuition.',
      prerequisites: ['multivariate-calc'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Minima occur where ∇f = 0 and the Hessian is positive semidefinite. Gradient descent iterates x ← x − η∇f(x); the learning rate η trades speed against stability.' },
        { type: 'problem', content: 'Run two steps of gradient descent on f(x) = x^2 from x_0 = 3 with η = 0.1.' },
      ],
      checkpoints: [
        { id: 'cp-optimization-basics-1', nodeId: 'optimization-basics', type: 'code', prompt: 'Implement gradient descent to minimize f(x,y)=x^2+10y^2 and report the trajectory for a chosen learning rate.', passingCriteria: 'Working iterative descent that converges toward (0,0); discussion of learning-rate effect.', requiresHumanReview: false },
      ],
    },
    {
      id: 'convexity',
      courseId: 'math-calc',
      title: 'Convexity',
      description:
        'Convex sets and functions, why convexity guarantees global minima, and where ML losses are (and are not) convex.',
      prerequisites: ['optimization-basics'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'A function is convex if its Hessian is positive semidefinite everywhere. For convex problems, any local minimum is global. Logistic regression is convex; deep nets are not.' },
      ],
      checkpoints: [
        { id: 'cp-convexity-1', nodeId: 'convexity', type: 'written', prompt: 'Prove or argue why a function with a positive-definite Hessian everywhere has a unique global minimum.', passingCriteria: 'Student connects positive-definiteness to strict convexity and uniqueness of the minimizer.', requiresHumanReview: false },
      ],
    },
    {
      id: 'lagrange-multipliers',
      courseId: 'math-calc',
      title: 'Lagrange Multipliers',
      description:
        'Constrained optimization, the Lagrangian, and KKT conditions used across SVMs and regularization.',
      prerequisites: ['convexity'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'To optimize f subject to g = 0, set ∇f = λ∇g. The Lagrangian L = f − λg unifies objective and constraint; KKT conditions extend this to inequalities.' },
        { type: 'problem', content: 'Maximize f(x,y) = xy subject to x + y = 10 using Lagrange multipliers.' },
      ],
      checkpoints: [
        { id: 'cp-lagrange-multipliers-1', nodeId: 'lagrange-multipliers', type: 'problem_set', prompt: 'Use Lagrange multipliers to find the extremum of f(x,y)=x^2+y^2 subject to x+2y=5.', passingCriteria: 'Correct solution (x,y)=(1,2) with λ derived correctly.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 3 — Probability & Statistics (6.041)
// ---------------------------------------------------------------------------
const probStats: Course = {
  id: 'prob-stats',
  title: 'Probability & Statistics',
  mitEquivalent: '6.041',
  description:
    'Probabilistic reasoning, random variables, and statistical inference — the foundation for reasoning under uncertainty in ML.',
  nodes: [
    {
      id: 'probability-foundations',
      courseId: 'prob-stats',
      title: 'Probability Foundations',
      description:
        'Sample spaces, axioms of probability, conditional probability, and independence.',
      prerequisites: [],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Probability assigns measures to events in a sample space satisfying Kolmogorov axioms. Conditional probability P(A|B) = P(A∩B)/P(B) and independence P(A∩B)=P(A)P(B) are core tools.' },
        { type: 'problem', content: 'Two dice are rolled. What is P(sum = 7 | first die is 3)?' },
      ],
      checkpoints: [
        { id: 'cp-probability-foundations-1', nodeId: 'probability-foundations', type: 'problem_set', prompt: 'A bag has 3 red and 5 blue balls. Two are drawn without replacement. Find P(both red) and P(second is blue).', passingCriteria: 'Correct P(both red)=3/28 and P(second blue)=5/8 with reasoning.', requiresHumanReview: false },
      ],
    },
    {
      id: 'random-variables',
      courseId: 'prob-stats',
      title: 'Random Variables',
      description:
        'Discrete and continuous random variables, PMFs, PDFs, and CDFs.',
      prerequisites: ['probability-foundations'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'A random variable maps outcomes to numbers. Discrete RVs have PMFs; continuous RVs have PDFs whose integral is the CDF. These objects describe data-generating processes in ML.' },
      ],
      checkpoints: [
        { id: 'cp-random-variables-1', nodeId: 'random-variables', type: 'written', prompt: 'Distinguish a PMF from a PDF and explain why P(X=x)=0 for a continuous random variable.', passingCriteria: 'Student correctly explains measure-zero events and the role of density vs probability.', requiresHumanReview: false },
      ],
    },
    {
      id: 'distributions',
      courseId: 'prob-stats',
      title: 'Common Distributions',
      description:
        'Bernoulli, binomial, Poisson, Gaussian, and exponential distributions and where they appear in ML.',
      prerequisites: ['random-variables'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'The Gaussian dominates ML through the central limit theorem and maximum-likelihood assumptions. Bernoulli/binomial model binary outcomes; Poisson models counts.' },
        { type: 'problem', content: 'For X ~ N(0,1), what is P(−1 < X < 1) approximately?' },
      ],
      checkpoints: [
        { id: 'cp-distributions-1', nodeId: 'distributions', type: 'problem_set', prompt: 'Identify the appropriate distribution for: (a) number of heads in 10 coin flips, (b) arrival count per hour, (c) heights of adults. Justify each.', passingCriteria: 'Binomial, Poisson, and Gaussian identified with sound justification.', requiresHumanReview: false },
      ],
    },
    {
      id: 'expectation-variance',
      courseId: 'prob-stats',
      title: 'Expectation & Variance',
      description:
        'Moments, linearity of expectation, variance, covariance, and the law of large numbers.',
      prerequisites: ['distributions'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'E[X] is the long-run average; Var(X)=E[(X−E[X])^2] measures spread. Linearity of expectation holds even without independence. Covariance generalizes variance to pairs.' },
        { type: 'problem', content: 'Compute E[X] and Var(X) for a fair six-sided die.' },
      ],
      checkpoints: [
        { id: 'cp-expectation-variance-1', nodeId: 'expectation-variance', type: 'problem_set', prompt: 'For a random variable taking values {1,2,3} with probabilities {0.2,0.5,0.3}, compute E[X] and Var(X).', passingCriteria: 'Correct E[X]=2.1 and Var(X)=0.49.', requiresHumanReview: false },
      ],
    },
    {
      id: 'bayesian-inference',
      courseId: 'prob-stats',
      title: 'Bayesian Inference',
      description:
        "Bayes' theorem, priors, likelihoods, and posteriors — the basis of probabilistic ML.",
      prerequisites: ['expectation-variance'],
      estimatedHours: 10,
      content: [
        { type: 'text', content: 'Bayes: P(θ|D) ∝ P(D|θ)P(θ). Posterior beliefs update prior beliefs in light of data. This framework underlies Naive Bayes, Bayesian nets, and probabilistic deep learning.' },
        { type: 'problem', content: 'A test is 99% accurate; disease prevalence is 0.5%. Given a positive test, what is the probability of disease?' },
      ],
      checkpoints: [
        { id: 'cp-bayesian-inference-1', nodeId: 'bayesian-inference', type: 'problem_set', prompt: 'Work the classic medical-test Bayes problem: 1% prevalence, 95% sensitivity, 90% specificity. Find P(disease | positive).', passingCriteria: 'Correct application of Bayes giving ≈ 0.088 with full working.', requiresHumanReview: false },
      ],
    },
    {
      id: 'hypothesis-testing',
      courseId: 'prob-stats',
      title: 'Hypothesis Testing',
      description:
        'Null hypotheses, p-values, confidence intervals, and the pitfalls of statistical significance.',
      prerequisites: ['bayesian-inference'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Hypothesis testing quantifies evidence against a null hypothesis via a test statistic and p-value. Confidence intervals express estimation uncertainty. Misuse leads to p-hacking and false discoveries.' },
      ],
      checkpoints: [
        { id: 'cp-hypothesis-testing-1', nodeId: 'hypothesis-testing', type: 'written', prompt: 'Explain what a p-value does and does not mean, and describe one common misinterpretation.', passingCriteria: 'Student correctly defines p-value and identifies a misinterpretation (e.g., P(H0 true)).', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 4 — Introduction to Machine Learning (6.036)
// ---------------------------------------------------------------------------
const introMl: Course = {
  id: 'intro-ml',
  title: 'Introduction to Machine Learning',
  mitEquivalent: '6.036',
  description:
    'Core supervised learning: regression, classification, model evaluation, and the bias-variance tradeoff.',
  nodes: [
    {
      id: 'ml-fundamentals',
      courseId: 'intro-ml',
      title: 'ML Fundamentals',
      description:
        'Supervised vs unsupervised learning, the learning problem, loss functions, and generalization.',
      prerequisites: ['probability-foundations', 'vectors-matrices'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Machine learning fits a function from data to minimize expected loss while generalizing to unseen examples. Supervised learning uses labels; unsupervised learning finds structure.' },
        { type: 'text', content: 'Generalization, not training accuracy, is the goal — motivating train/validation/test splits.' },
      ],
      checkpoints: [
        { id: 'cp-ml-fundamentals-1', nodeId: 'ml-fundamentals', type: 'written', prompt: 'Define supervised and unsupervised learning and give a real example of each, then explain why we hold out a test set.', passingCriteria: 'Correct definitions, valid examples, and a clear generalization rationale for held-out data.', requiresHumanReview: false },
      ],
    },
    {
      id: 'linear-regression',
      courseId: 'intro-ml',
      title: 'Linear Regression',
      description:
        'Fitting linear models with least squares, the normal equations, and gradient-based fitting.',
      prerequisites: ['ml-fundamentals', 'derivatives-gradients', 'vectors-matrices'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Linear regression minimizes squared error ||Xw − y||^2. The closed-form solution w = (X^T X)^{-1} X^T y is the normal equation; gradient descent scales to large data.' },
        { type: 'problem', content: 'Derive the gradient of the squared-error loss with respect to weights w.' },
      ],
      checkpoints: [
        { id: 'cp-linear-regression-1', nodeId: 'linear-regression', type: 'code', prompt: 'Implement linear regression two ways (normal equation and gradient descent) and confirm they agree on a small dataset.', passingCriteria: 'Both implementations produce matching weights; correct gradient used.', requiresHumanReview: false },
      ],
    },
    {
      id: 'classification',
      courseId: 'intro-ml',
      title: 'Classification',
      description:
        'Logistic regression, decision boundaries, the perceptron, and softmax for multiclass.',
      prerequisites: ['linear-regression', 'bayesian-inference'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Logistic regression models P(y=1|x) = σ(w·x) and is trained with cross-entropy loss. Softmax generalizes to multiple classes. Decision boundaries are linear in feature space.' },
      ],
      checkpoints: [
        { id: 'cp-classification-1', nodeId: 'classification', type: 'problem_set', prompt: 'Derive the cross-entropy loss gradient for logistic regression and explain why it is convex.', passingCriteria: 'Correct gradient (σ(w·x)−y)x and a valid convexity argument.', requiresHumanReview: false },
        { id: 'cp-classification-2', nodeId: 'classification', type: 'code', prompt: 'Train a logistic regression classifier on a 2D toy dataset and plot the decision boundary.', passingCriteria: 'Working classifier with a sensible linear decision boundary.', requiresHumanReview: false },
      ],
    },
    {
      id: 'model-evaluation',
      courseId: 'intro-ml',
      title: 'Model Evaluation',
      description:
        'Train/val/test splits, cross-validation, accuracy, precision/recall, ROC, and the bias-variance tradeoff.',
      prerequisites: ['classification', 'hypothesis-testing'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Evaluate on held-out data with metrics matched to the problem: accuracy, precision, recall, F1, AUC. Bias-variance decomposition explains under- and over-fitting.' },
      ],
      checkpoints: [
        { id: 'cp-model-evaluation-1', nodeId: 'model-evaluation', type: 'written', prompt: 'Given a confusion matrix, compute precision, recall, and F1, and explain when accuracy is misleading.', passingCriteria: 'Correct metric computations and a class-imbalance example for accuracy failure.', requiresHumanReview: false },
      ],
    },
    {
      id: 'regularization',
      courseId: 'intro-ml',
      title: 'Regularization',
      description:
        'L1/L2 penalties, weight decay, and controlling overfitting.',
      prerequisites: ['model-evaluation', 'lagrange-multipliers'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'Regularization adds a penalty (L2 ridge, L1 lasso) to the loss to discourage complex models. L1 induces sparsity; L2 shrinks weights smoothly. Both can be viewed through constrained optimization.' },
      ],
      checkpoints: [
        { id: 'cp-regularization-1', nodeId: 'regularization', type: 'written', prompt: 'Compare L1 and L2 regularization, explaining why L1 produces sparse solutions.', passingCriteria: 'Student explains geometry of the L1 ball and corner solutions yielding sparsity.', requiresHumanReview: false },
      ],
    },
    {
      id: 'neural-nets-intro',
      courseId: 'intro-ml',
      title: 'Introduction to Neural Networks',
      description:
        'Perceptrons, multilayer networks, activation functions, and universal approximation.',
      prerequisites: ['classification', 'chain-rule'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'A neural network stacks affine transforms and nonlinear activations (ReLU, sigmoid, tanh). With enough hidden units it can approximate any continuous function (universal approximation).' },
      ],
      checkpoints: [
        { id: 'cp-neural-nets-intro-1', nodeId: 'neural-nets-intro', type: 'written', prompt: 'Explain why a multilayer network needs nonlinear activations, and what happens without them.', passingCriteria: 'Student shows that stacking linear layers collapses to a single linear map.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 5 — Deep Learning (6.S191)
// ---------------------------------------------------------------------------
const deepLearning: Course = {
  id: 'deep-learning',
  title: 'Deep Learning',
  mitEquivalent: '6.S191',
  description:
    'Modern neural architectures: backpropagation, CNNs, RNNs, attention, and training at scale.',
  nodes: [
    {
      id: 'backpropagation',
      courseId: 'deep-learning',
      title: 'Backpropagation',
      description:
        'Reverse-mode automatic differentiation and how gradients flow through computational graphs.',
      prerequisites: ['chain-rule', 'neural-nets-intro'],
      estimatedHours: 10,
      content: [
        { type: 'text', content: 'Backpropagation applies the chain rule over a computational graph in reverse, reusing intermediate results to compute all parameter gradients efficiently in one backward pass.' },
        { type: 'problem', content: 'Hand-derive the gradients for a 2-layer network with sigmoid activation and MSE loss.' },
      ],
      checkpoints: [
        { id: 'cp-backpropagation-1', nodeId: 'backpropagation', type: 'code', prompt: 'Implement backprop for a 2-layer MLP from scratch (no autograd) and verify gradients numerically.', passingCriteria: 'Analytic gradients match finite-difference checks within tolerance.', requiresHumanReview: false },
        { id: 'cp-backpropagation-2', nodeId: 'backpropagation', type: 'oral', prompt: 'Explain why reverse-mode differentiation is more efficient than forward-mode for typical neural networks.', passingCriteria: 'Student reasons about output-vs-input dimensionality and gradient reuse.', requiresHumanReview: true },
      ],
    },
    {
      id: 'deep-nn-architecture',
      courseId: 'deep-learning',
      title: 'Deep Network Architectures',
      description:
        'Depth, width, skip connections, batch/layer normalization, and why deep nets work.',
      prerequisites: ['backpropagation', 'neural-nets-intro'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Depth enables hierarchical feature learning. Residual connections (ResNets) and normalization layers stabilize training of very deep networks by improving gradient flow.' },
      ],
      checkpoints: [
        { id: 'cp-deep-nn-architecture-1', nodeId: 'deep-nn-architecture', type: 'written', prompt: 'Explain how residual connections mitigate vanishing gradients in deep networks.', passingCriteria: 'Student describes identity shortcut paths preserving gradient magnitude.', requiresHumanReview: false },
      ],
    },
    {
      id: 'training-techniques',
      courseId: 'deep-learning',
      title: 'Training Techniques',
      description:
        'Optimizers (SGD, Adam), learning-rate schedules, dropout, and initialization.',
      prerequisites: ['deep-nn-architecture', 'optimization-basics'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Adam adapts per-parameter learning rates; schedules anneal the rate over training. Dropout and weight decay regularize; careful initialization (He/Xavier) keeps activations well-scaled.' },
      ],
      checkpoints: [
        { id: 'cp-training-techniques-1', nodeId: 'training-techniques', type: 'written', prompt: 'Compare SGD with momentum and Adam, and explain when each is preferable.', passingCriteria: 'Student correctly contrasts adaptivity, generalization, and tuning effort.', requiresHumanReview: false },
      ],
    },
    {
      id: 'cnns',
      courseId: 'deep-learning',
      title: 'Convolutional Neural Networks',
      description:
        'Convolution, pooling, parameter sharing, and translation invariance.',
      prerequisites: ['deep-nn-architecture'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'CNNs exploit spatial locality and weight sharing via convolution filters, drastically reducing parameters and giving translation invariance — ideal for images.' },
      ],
      checkpoints: [
        { id: 'cp-cnns-1', nodeId: 'cnns', type: 'problem_set', prompt: 'Given a 5x5 input and a 3x3 filter with stride 1 and no padding, compute the output dimensions and the number of parameters.', passingCriteria: 'Output 3x3 and 9 (+1 bias) parameters identified correctly.', requiresHumanReview: false },
      ],
    },
    {
      id: 'rnns-lstms',
      courseId: 'deep-learning',
      title: 'RNNs & LSTMs',
      description:
        'Sequence modeling, recurrence, vanishing gradients, and gated memory cells.',
      prerequisites: ['deep-nn-architecture'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'RNNs process sequences via a hidden state but suffer vanishing gradients. LSTMs and GRUs add gates to carry long-range information across time steps.' },
      ],
      checkpoints: [
        { id: 'cp-rnns-lstms-1', nodeId: 'rnns-lstms', type: 'written', prompt: 'Explain how LSTM gates address the vanishing gradient problem of vanilla RNNs.', passingCriteria: 'Student describes the cell state and gating preserving gradient flow over time.', requiresHumanReview: false },
      ],
    },
    {
      id: 'transformers',
      courseId: 'deep-learning',
      title: 'Transformers & Attention',
      description:
        'Query-key-value attention, self-attention, multi-head attention, and the transformer block.',
      prerequisites: ['rnns-lstms'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Attention computes a weighted sum of values using softmax over query-key similarities: Attention(Q,K,V) = softmax(QK^T/sqrt(d))V. Self-attention lets every token attend to every other, enabling parallelism and long-range dependencies.' },
      ],
      checkpoints: [
        { id: 'cp-transformers-1', nodeId: 'transformers', type: 'written', prompt: 'Write out the scaled dot-product attention formula and explain the role of the sqrt(d) scaling.', passingCriteria: 'Correct formula and explanation that scaling stabilizes softmax gradients for large d.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 6 — Reinforcement Learning (6.7900)
// ---------------------------------------------------------------------------
const rl: Course = {
  id: 'rl',
  title: 'Reinforcement Learning',
  mitEquivalent: '6.7900',
  description:
    'Sequential decision making: MDPs, dynamic programming, value/policy methods, and deep RL.',
  nodes: [
    {
      id: 'mdp-foundations',
      courseId: 'rl',
      title: 'Markov Decision Processes',
      description:
        'States, actions, rewards, transitions, discount factors, and the RL problem formulation.',
      prerequisites: ['probability-foundations', 'expectation-variance'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'An MDP is (S, A, P, R, γ). The agent seeks a policy maximizing expected discounted return. The Markov property says the future depends only on the current state.' },
      ],
      checkpoints: [
        { id: 'cp-mdp-foundations-1', nodeId: 'mdp-foundations', type: 'written', prompt: 'Define each component of an MDP and explain the role of the discount factor γ.', passingCriteria: 'All five components defined correctly with a sound explanation of discounting.', requiresHumanReview: false },
      ],
    },
    {
      id: 'dynamic-programming',
      courseId: 'rl',
      title: 'Dynamic Programming',
      description:
        'Bellman equations, value iteration, and policy iteration for known MDPs.',
      prerequisites: ['mdp-foundations'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'The Bellman optimality equation V*(s) = max_a [R(s,a) + γ Σ P(s\'|s,a) V*(s\')] is solved by value iteration or policy iteration when the model is known.' },
        { type: 'problem', content: 'Run one sweep of value iteration on a 2-state MDP.' },
      ],
      checkpoints: [
        { id: 'cp-dynamic-programming-1', nodeId: 'dynamic-programming', type: 'code', prompt: 'Implement value iteration for a small gridworld and report the optimal policy.', passingCriteria: 'Correct convergence to optimal values and a sensible greedy policy.', requiresHumanReview: false },
      ],
    },
    {
      id: 'q-learning',
      courseId: 'rl',
      title: 'Q-Learning',
      description:
        'Model-free temporal-difference control, the Q-function, and exploration vs exploitation.',
      prerequisites: ['dynamic-programming', 'probability-foundations'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Q-learning updates Q(s,a) ← Q(s,a) + α[r + γ max_a\' Q(s\',a\') − Q(s,a)] without a model. ε-greedy balances exploration and exploitation.' },
      ],
      checkpoints: [
        { id: 'cp-q-learning-1', nodeId: 'q-learning', type: 'code', prompt: 'Implement tabular Q-learning on a gridworld and show the learned policy converges to optimal.', passingCriteria: 'Working Q-learning with epsilon-greedy that learns a near-optimal policy.', requiresHumanReview: false },
      ],
    },
    {
      id: 'policy-gradient',
      courseId: 'rl',
      title: 'Policy Gradient Methods',
      description:
        'Directly optimizing policies via REINFORCE and the policy gradient theorem.',
      prerequisites: ['q-learning', 'derivatives-gradients'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Policy gradient methods parameterize π_θ and ascend ∇_θ E[return]. REINFORCE uses the log-derivative trick; baselines reduce variance.' },
      ],
      checkpoints: [
        { id: 'cp-policy-gradient-1', nodeId: 'policy-gradient', type: 'written', prompt: 'State the policy gradient theorem and explain why a baseline reduces variance without adding bias.', passingCriteria: 'Correct theorem statement and a valid unbiasedness argument for baselines.', requiresHumanReview: false },
      ],
    },
    {
      id: 'deep-rl',
      courseId: 'rl',
      title: 'Deep Reinforcement Learning',
      description:
        'Function approximation with neural networks: DQN, actor-critic, and stability tricks.',
      prerequisites: ['policy-gradient', 'backpropagation'],
      estimatedHours: 10,
      content: [
        { type: 'text', content: 'Deep RL replaces tables with neural networks. DQN adds experience replay and target networks for stability; actor-critic combines value and policy learning.' },
      ],
      checkpoints: [
        { id: 'cp-deep-rl-1', nodeId: 'deep-rl', type: 'written', prompt: 'Explain why DQN needs experience replay and a target network for stable training.', passingCriteria: 'Student explains decorrelation of samples and stationary targets.', requiresHumanReview: false },
      ],
    },
    {
      id: 'rl-applications',
      courseId: 'rl',
      title: 'RL Applications',
      description:
        'Robotics, games, RLHF, and the challenges of real-world deployment.',
      prerequisites: ['deep-rl'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'RL powers game-playing agents, robotic control, and RLHF for aligning language models. Sample efficiency, safety, and reward design are key practical challenges.' },
      ],
      checkpoints: [
        { id: 'cp-rl-applications-1', nodeId: 'rl-applications', type: 'written', prompt: 'Describe how RLHF uses reinforcement learning to align large language models, including the reward model.', passingCriteria: 'Student outlines preference data, reward model, and policy optimization (e.g., PPO).', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 7 — Natural Language Processing (6.806)
// ---------------------------------------------------------------------------
const nlp: Course = {
  id: 'nlp',
  title: 'Natural Language Processing',
  mitEquivalent: '6.806',
  description:
    'Representing and modeling language: embeddings, language models, transformers, and large pretrained models.',
  nodes: [
    {
      id: 'text-representations',
      courseId: 'nlp',
      title: 'Text Representations',
      description:
        'Tokenization, bag-of-words, TF-IDF, and word embeddings (word2vec, GloVe).',
      prerequisites: ['ml-fundamentals', 'vectors-matrices'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Text must be turned into vectors. Bag-of-words and TF-IDF are sparse; word embeddings learn dense vectors where semantic similarity maps to geometric proximity.' },
      ],
      checkpoints: [
        { id: 'cp-text-representations-1', nodeId: 'text-representations', type: 'written', prompt: 'Explain the limitation of bag-of-words and how word embeddings address it.', passingCriteria: 'Student notes loss of order/semantics in BoW and dense semantic geometry of embeddings.', requiresHumanReview: false },
      ],
    },
    {
      id: 'language-models',
      courseId: 'nlp',
      title: 'Language Models',
      description:
        'N-gram and neural language models, perplexity, and next-token prediction.',
      prerequisites: ['text-representations', 'neural-nets-intro'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'A language model assigns probabilities to sequences. Neural LMs predict the next token from context; perplexity measures how well a model predicts held-out text.' },
      ],
      checkpoints: [
        { id: 'cp-language-models-1', nodeId: 'language-models', type: 'written', prompt: 'Define perplexity and explain what a lower perplexity indicates about a language model.', passingCriteria: 'Correct definition relating perplexity to exponentiated cross-entropy and predictive quality.', requiresHumanReview: false },
      ],
    },
    {
      id: 'attention-mechanism',
      courseId: 'nlp',
      title: 'Attention in NLP',
      description:
        'Sequence-to-sequence attention and the transformer architecture for language.',
      prerequisites: ['language-models', 'transformers'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Transformers stack multi-head self-attention and feed-forward layers with positional encodings, enabling parallel training and strong long-range modeling for language.' },
      ],
      checkpoints: [
        { id: 'cp-attention-mechanism-1', nodeId: 'attention-mechanism', type: 'written', prompt: 'Explain why positional encodings are needed in a transformer that processes tokens in parallel.', passingCriteria: 'Student notes self-attention is permutation-invariant and needs position information.', requiresHumanReview: false },
      ],
    },
    {
      id: 'bert-gpt',
      courseId: 'nlp',
      title: 'BERT & GPT',
      description:
        'Pretraining paradigms: masked language modeling vs autoregressive modeling.',
      prerequisites: ['attention-mechanism', 'transformers'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'BERT uses bidirectional masked language modeling for understanding tasks; GPT uses autoregressive next-token prediction for generation. Both pretrain on large corpora then transfer.' },
      ],
      checkpoints: [
        { id: 'cp-bert-gpt-1', nodeId: 'bert-gpt', type: 'written', prompt: 'Contrast BERT and GPT in terms of pretraining objective and typical downstream use.', passingCriteria: 'Student correctly contrasts MLM/bidirectional vs autoregressive/generative.', requiresHumanReview: false },
      ],
    },
    {
      id: 'fine-tuning',
      courseId: 'nlp',
      title: 'Fine-tuning & Transfer',
      description:
        'Transfer learning, prompt-based methods, and parameter-efficient fine-tuning (LoRA).',
      prerequisites: ['bert-gpt'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Fine-tuning adapts a pretrained model to a task. Full fine-tuning updates all weights; parameter-efficient methods like LoRA inject small trainable adapters, saving compute and memory.' },
      ],
      checkpoints: [
        { id: 'cp-fine-tuning-1', nodeId: 'fine-tuning', type: 'written', prompt: 'Explain the trade-offs between full fine-tuning and LoRA-style parameter-efficient fine-tuning.', passingCriteria: 'Student discusses compute/memory, catastrophic forgetting, and performance trade-offs.', requiresHumanReview: false },
      ],
    },
    {
      id: 'nlp-applications',
      courseId: 'nlp',
      title: 'NLP Applications',
      description:
        'Machine translation, question answering, summarization, and retrieval-augmented generation.',
      prerequisites: ['fine-tuning'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'Modern NLP applications combine pretrained models with task-specific data and retrieval. RAG grounds generation in retrieved documents to reduce hallucination.' },
      ],
      checkpoints: [
        { id: 'cp-nlp-applications-1', nodeId: 'nlp-applications', type: 'written', prompt: 'Describe how retrieval-augmented generation (RAG) reduces hallucination in LLM outputs.', passingCriteria: 'Student explains grounding generation in retrieved context.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 8 — Computer Vision (6.819)
// ---------------------------------------------------------------------------
const computerVision: Course = {
  id: 'computer-vision',
  title: 'Computer Vision',
  mitEquivalent: '6.819',
  description:
    'Seeing with machines: image fundamentals, convolutional architectures, detection, segmentation, and generative vision.',
  nodes: [
    {
      id: 'image-fundamentals',
      courseId: 'computer-vision',
      title: 'Image Fundamentals',
      description:
        'Pixels, color spaces, filtering, edges, and classical feature detection.',
      prerequisites: ['ml-fundamentals', 'matrix-operations'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Images are tensors of pixel intensities. Convolution with kernels performs blurring, sharpening, and edge detection (Sobel). Classical features like SIFT preceded deep learning.' },
      ],
      checkpoints: [
        { id: 'cp-image-fundamentals-1', nodeId: 'image-fundamentals', type: 'problem_set', prompt: 'Apply a 3x3 Sobel kernel to a small image patch by hand and interpret the result.', passingCriteria: 'Correct convolution arithmetic and an edge-strength interpretation.', requiresHumanReview: false },
      ],
    },
    {
      id: 'conv-nets-vision',
      courseId: 'computer-vision',
      title: 'ConvNets for Vision',
      description:
        'CNN architectures for image classification: LeNet, AlexNet, ResNet.',
      prerequisites: ['image-fundamentals', 'cnns'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Vision CNNs stack convolution, nonlinearity, and pooling to learn hierarchical features. Architectures evolved from LeNet to deep residual networks enabling ImageNet-scale accuracy.' },
      ],
      checkpoints: [
        { id: 'cp-conv-nets-vision-1', nodeId: 'conv-nets-vision', type: 'code', prompt: 'Train a small CNN to classify a subset of CIFAR-10 or MNIST and report accuracy.', passingCriteria: 'Working CNN that achieves reasonable accuracy with correct training loop.', requiresHumanReview: false },
      ],
    },
    {
      id: 'object-detection',
      courseId: 'computer-vision',
      title: 'Object Detection',
      description:
        'Bounding-box detection: R-CNN family, YOLO, anchor boxes, and non-max suppression.',
      prerequisites: ['conv-nets-vision'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Detection localizes and classifies objects. Two-stage detectors (Faster R-CNN) propose then classify regions; single-stage detectors (YOLO/SSD) predict boxes directly for speed.' },
      ],
      checkpoints: [
        { id: 'cp-object-detection-1', nodeId: 'object-detection', type: 'written', prompt: 'Explain the role of non-maximum suppression and the IoU metric in object detection.', passingCriteria: 'Student correctly defines IoU and how NMS removes duplicate boxes.', requiresHumanReview: false },
      ],
    },
    {
      id: 'segmentation',
      courseId: 'computer-vision',
      title: 'Image Segmentation',
      description:
        'Semantic and instance segmentation: FCNs, U-Net, and Mask R-CNN.',
      prerequisites: ['object-detection'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Segmentation assigns a class to every pixel. Encoder-decoder networks like U-Net and fully convolutional networks produce dense predictions; Mask R-CNN adds instance masks.' },
      ],
      checkpoints: [
        { id: 'cp-segmentation-1', nodeId: 'segmentation', type: 'written', prompt: 'Distinguish semantic from instance segmentation and describe the U-Net skip connections.', passingCriteria: 'Student correctly distinguishes the tasks and explains encoder-decoder skip connections.', requiresHumanReview: false },
      ],
    },
    {
      id: 'generative-vision',
      courseId: 'computer-vision',
      title: 'Generative Vision Models',
      description:
        'GANs, VAEs, and diffusion models for image generation.',
      prerequisites: ['segmentation', 'training-techniques'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Generative models learn the image distribution. GANs pit generator vs discriminator; VAEs use a probabilistic latent; diffusion models iteratively denoise and now dominate image synthesis.' },
      ],
      checkpoints: [
        { id: 'cp-generative-vision-1', nodeId: 'generative-vision', type: 'written', prompt: 'Compare GANs, VAEs, and diffusion models in terms of training stability and sample quality.', passingCriteria: 'Student gives a sound comparison covering at least stability and quality trade-offs.', requiresHumanReview: false },
      ],
    },
    {
      id: 'vision-applications',
      courseId: 'computer-vision',
      title: 'Vision Applications',
      description:
        'Medical imaging, autonomous driving, and vision-language models.',
      prerequisites: ['generative-vision'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'Computer vision drives medical diagnosis, self-driving perception, and multimodal vision-language models like CLIP that align images and text in a shared embedding space.' },
      ],
      checkpoints: [
        { id: 'cp-vision-applications-1', nodeId: 'vision-applications', type: 'written', prompt: 'Explain how CLIP aligns images and text and why this enables zero-shot classification.', passingCriteria: 'Student describes contrastive image-text training and zero-shot via text prompts.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 9 — ML Systems (6.S965)
// ---------------------------------------------------------------------------
const mlSystems: Course = {
  id: 'ml-systems',
  title: 'Machine Learning Systems',
  mitEquivalent: '6.S965',
  description:
    'Engineering ML in production: pipelines, data engineering, serving, MLOps, distributed training, and monitoring.',
  nodes: [
    {
      id: 'ml-pipelines',
      courseId: 'ml-systems',
      title: 'ML Pipelines',
      description:
        'End-to-end ML workflows: ingestion, feature engineering, training, and deployment stages.',
      prerequisites: ['model-evaluation'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'A production ML pipeline chains data ingestion, validation, feature engineering, training, evaluation, and deployment, ideally reproducibly and with versioned artifacts.' },
      ],
      checkpoints: [
        { id: 'cp-ml-pipelines-1', nodeId: 'ml-pipelines', type: 'written', prompt: 'Diagram and describe the stages of an end-to-end ML pipeline and why reproducibility matters.', passingCriteria: 'Student lists the major stages and explains versioning/reproducibility benefits.', requiresHumanReview: false },
      ],
    },
    {
      id: 'data-engineering',
      courseId: 'ml-systems',
      title: 'Data Engineering',
      description:
        'Data storage, feature stores, validation, and handling data quality at scale.',
      prerequisites: ['ml-pipelines'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Reliable ML depends on data engineering: schemas, validation, feature stores for consistency between training and serving, and pipelines that handle scale and drift.' },
      ],
      checkpoints: [
        { id: 'cp-data-engineering-1', nodeId: 'data-engineering', type: 'written', prompt: 'Explain training-serving skew and how a feature store helps prevent it.', passingCriteria: 'Student defines training-serving skew and the consistency role of a feature store.', requiresHumanReview: false },
      ],
    },
    {
      id: 'model-serving',
      courseId: 'ml-systems',
      title: 'Model Serving',
      description:
        'Inference APIs, batching, latency vs throughput, and quantization for deployment.',
      prerequisites: ['data-engineering'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Serving exposes models via APIs. Batching improves throughput at some latency cost; quantization and distillation shrink models for cheaper, faster inference.' },
      ],
      checkpoints: [
        { id: 'cp-model-serving-1', nodeId: 'model-serving', type: 'written', prompt: 'Explain the latency-throughput trade-off introduced by request batching in model serving.', passingCriteria: 'Student correctly reasons about queueing, batch size, latency, and throughput.', requiresHumanReview: false },
      ],
    },
    {
      id: 'distributed-training',
      courseId: 'ml-systems',
      title: 'Distributed Training',
      description:
        'Data and model parallelism, gradient synchronization, and scaling laws.',
      prerequisites: ['model-serving', 'training-techniques'],
      estimatedHours: 9,
      content: [
        { type: 'text', content: 'Large models train across many devices. Data parallelism replicates the model and syncs gradients (all-reduce); model/tensor parallelism splits the model itself across devices.' },
      ],
      checkpoints: [
        { id: 'cp-distributed-training-1', nodeId: 'distributed-training', type: 'written', prompt: 'Contrast data parallelism and model parallelism and state when each is necessary.', passingCriteria: 'Student correctly contrasts the two and ties model parallelism to memory limits.', requiresHumanReview: false },
      ],
    },
    {
      id: 'mlops',
      courseId: 'ml-systems',
      title: 'MLOps',
      description:
        'CI/CD for models, experiment tracking, model registries, and reproducibility.',
      prerequisites: ['distributed-training'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'MLOps applies DevOps practices to ML: automated pipelines, experiment tracking, model registries, and continuous deployment with rollback for safe iteration.' },
      ],
      checkpoints: [
        { id: 'cp-mlops-1', nodeId: 'mlops', type: 'written', prompt: 'Describe how CI/CD differs for ML systems compared to traditional software.', passingCriteria: 'Student notes data/model versioning, retraining triggers, and validation gates.', requiresHumanReview: false },
      ],
    },
    {
      id: 'monitoring-drift',
      courseId: 'ml-systems',
      title: 'Monitoring & Drift',
      description:
        'Production monitoring, data and concept drift detection, and retraining triggers.',
      prerequisites: ['mlops'],
      estimatedHours: 7,
      content: [
        { type: 'text', content: 'Deployed models degrade as data shifts. Monitoring tracks input distributions and performance; drift detection triggers alerts or automated retraining.' },
      ],
      checkpoints: [
        { id: 'cp-monitoring-drift-1', nodeId: 'monitoring-drift', type: 'written', prompt: 'Distinguish data drift from concept drift and describe how you would detect each in production.', passingCriteria: 'Student correctly distinguishes the two and proposes valid detection methods.', requiresHumanReview: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Course 10 — Capstone Project (custom)
// ---------------------------------------------------------------------------
const capstone: Course = {
  id: 'capstone',
  title: 'Capstone Project',
  mitEquivalent: 'Custom Capstone',
  description:
    'Integrate the full curriculum into an end-to-end ML project: scoping, building, evaluating, deploying, and presenting.',
  nodes: [
    {
      id: 'project-scoping',
      courseId: 'capstone',
      title: 'Project Scoping',
      description:
        'Defining a problem, success metrics, feasibility, and a project plan.',
      prerequisites: ['monitoring-drift', 'nlp-applications', 'vision-applications', 'rl-applications'],
      estimatedHours: 6,
      content: [
        { type: 'text', content: 'A strong capstone starts with a well-scoped problem: a clear question, measurable success criteria, data availability assessment, and a realistic plan.' },
      ],
      checkpoints: [
        { id: 'cp-project-scoping-1', nodeId: 'project-scoping', type: 'written', prompt: 'Write a one-page project proposal with problem statement, success metric, data plan, and risks.', passingCriteria: 'Proposal includes a clear problem, measurable metric, data plan, and identified risks.', requiresHumanReview: true },
      ],
    },
    {
      id: 'data-collection',
      courseId: 'capstone',
      title: 'Data Collection',
      description:
        'Sourcing, cleaning, labeling, and ethical considerations for project data.',
      prerequisites: ['project-scoping'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Collect and curate data: source responsibly, clean and label carefully, document provenance, and consider privacy and bias from the start.' },
      ],
      checkpoints: [
        { id: 'cp-data-collection-1', nodeId: 'data-collection', type: 'written', prompt: 'Document your dataset: source, size, cleaning steps, labeling process, and ethical considerations.', passingCriteria: 'Documentation covers provenance, preprocessing, and at least one ethical consideration.', requiresHumanReview: true },
      ],
    },
    {
      id: 'model-development',
      courseId: 'capstone',
      title: 'Model Development',
      description:
        'Building, iterating, and tuning models for the capstone problem.',
      prerequisites: ['data-collection'],
      estimatedHours: 12,
      content: [
        { type: 'text', content: 'Develop models iteratively: establish a baseline, improve through better features/architectures/tuning, and track experiments to compare honestly.' },
      ],
      checkpoints: [
        { id: 'cp-model-development-1', nodeId: 'model-development', type: 'code', prompt: 'Submit your model code with a baseline and at least one improved model, plus an experiment log.', passingCriteria: 'Reproducible code with baseline, improvement, and documented experiments.', requiresHumanReview: true },
      ],
    },
    {
      id: 'evaluation-reporting',
      courseId: 'capstone',
      title: 'Evaluation & Reporting',
      description:
        'Rigorous evaluation, error analysis, and honest reporting of results.',
      prerequisites: ['model-development'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Evaluate with appropriate held-out metrics, perform error analysis, report limitations, and compare against baselines fairly.' },
      ],
      checkpoints: [
        { id: 'cp-evaluation-reporting-1', nodeId: 'evaluation-reporting', type: 'written', prompt: 'Write an evaluation report with metrics, error analysis, and a discussion of limitations.', passingCriteria: 'Report includes appropriate metrics, genuine error analysis, and honest limitations.', requiresHumanReview: true },
      ],
    },
    {
      id: 'deployment',
      courseId: 'capstone',
      title: 'Deployment',
      description:
        'Packaging and deploying the model as a usable service.',
      prerequisites: ['evaluation-reporting'],
      estimatedHours: 8,
      content: [
        { type: 'text', content: 'Deploy the model behind an API or app, with monitoring and documentation so others can use and maintain it.' },
      ],
      checkpoints: [
        { id: 'cp-deployment-1', nodeId: 'deployment', type: 'code', prompt: 'Deploy your model as an API or app and provide a link plus a short usage guide.', passingCriteria: 'A working deployment with documented endpoints/usage.', requiresHumanReview: true },
      ],
    },
    {
      id: 'presentation',
      courseId: 'capstone',
      title: 'Final Presentation',
      description:
        'Communicating the project clearly to a technical and non-technical audience.',
      prerequisites: ['deployment'],
      estimatedHours: 6,
      content: [
        { type: 'text', content: 'Present the project: motivation, approach, results, and impact, tailored to the audience, with clear visuals and an honest discussion of trade-offs.' },
      ],
      checkpoints: [
        { id: 'cp-presentation-1', nodeId: 'presentation', type: 'oral', prompt: 'Deliver a 10-minute presentation covering motivation, method, results, and future work.', passingCriteria: 'Clear, well-structured presentation accessible to a mixed audience.', requiresHumanReview: true },
      ],
    },
  ],
};

export const mitCurriculum: DegreeGraph = {
  courses: [
    mathLinalg,
    mathCalc,
    probStats,
    introMl,
    deepLearning,
    rl,
    nlp,
    computerVision,
    mlSystems,
    capstone,
  ],
};
