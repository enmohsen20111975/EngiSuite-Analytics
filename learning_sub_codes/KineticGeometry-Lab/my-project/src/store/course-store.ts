import { create } from 'zustand';

// Course types
export interface LessonContent {
  id: string;
  title: string;
  type: 'theory' | 'interactive' | 'visualization' | 'exercise';
  duration: string;
  content: string;
  keyPoints: string[];
  formula?: string;
  examples?: string[];
  workedExample?: {
    problem: string;
    solution: string[];
    answer: string;
  };
  applications?: string[];
  visualizationId?: string;
  practiceProblems?: {
    question: string;
    hint: string;
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  content: LessonContent[];
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  lessons: Lesson[];
  introduction?: string;
}

export interface SubjectCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  courses: Course[];
}

// ============================================
// MATHEMATICS COURSES
// ============================================
export const mathematicsCategory: SubjectCategory = {
  id: 'mathematics',
  title: 'Mathematics',
  description: 'From algebra to advanced calculus, master the language of science',
  icon: 'Calculator',
  color: 'from-blue-500 to-cyan-500',
  courses: [
    {
      id: 'linear-algebra',
      title: 'Linear Algebra',
      description: 'Vectors, matrices, transformations, and eigenvalues',
      icon: 'Grid3X3',
      color: 'from-blue-500 to-indigo-500',
      difficulty: 'intermediate',
      duration: '12 hours',
      introduction: 'Linear algebra is the branch of mathematics concerning linear equations, linear functions, and their representations through matrices and vector spaces. It is fundamental to machine learning, computer graphics, physics simulations, and data science. This course will take you from basic vector operations to understanding eigenvalues and their applications.',
      lessons: [
        {
          id: 'la-vectors',
          title: 'Vectors and Vector Spaces',
          description: 'Understanding vectors as mathematical objects',
          duration: '45 min',
          difficulty: 'beginner',
          prerequisites: ['Basic algebra', 'Understanding of coordinate systems'],
          learningObjectives: [
            'Define vectors and their components',
            'Perform vector addition and scalar multiplication',
            'Calculate vector magnitude and direction',
            'Understand the concept of vector spaces'
          ],
          content: [
            {
              id: 'la-v1',
              title: 'Introduction to Vectors',
              type: 'theory',
              duration: '15 min',
              content: `## What is a Vector?

A vector is a mathematical object that has both **magnitude** (size) and **direction**. Unlike scalars, which only have magnitude (like temperature or mass), vectors represent quantities that need both pieces of information to be fully described.

### Real-World Examples of Vectors

Think about these everyday quantities:

- **Velocity**: A car traveling 60 mph northeast has both speed (magnitude) and direction
- **Force**: Pushing a door with 10 Newtons of force at an angle
- **Displacement**: Walking 5 kilometers to the north
- **Wind**: A wind blowing at 25 km/h from the west

### Mathematical Representation

In mathematics, we represent vectors in several ways:

**Geometric Notation**: An arrow from point A to point B, written as →v or AB with an arrow above.

**Component Form**: In 2D, a vector from the origin to point (3, 4) is written as:
- v⃗ = (3, 4) or v⃗ = 3i + 4j where i and j are unit vectors

**Column Vector**: 
⃗v = [3]
      [4]

### Understanding Vector Components

Each vector can be broken down into components along coordinate axes. For a 2D vector v⃗ = (v₁, v₂):

- **v₁** (or vₓ): The horizontal component (how much the vector points in the x-direction)
- **v₂** (or vᵧ): The vertical component (how much the vector points in the y-direction)

For example, the vector (3, 4) means:
- Move 3 units in the positive x-direction
- Move 4 units in the positive y-direction

This is equivalent to the right triangle with legs of length 3 and 4, where the vector is the hypotenuse.`,
              keyPoints: [
                'Vectors have both magnitude (length) and direction',
                'Vectors are represented geometrically as arrows',
                'Component form (a, b) shows displacement along each axis',
                'The same vector can be represented starting from any point (translation invariant)',
                'Vectors are fundamental in physics, engineering, and computer science'
              ],
              formula: '\\vec{v} = (v_1, v_2, ..., v_n) = v_1\\hat{i} + v_2\\hat{j} + ... + v_n\\hat{n}',
              examples: [
                'Position vector: (3, 4) represents a point 3 units right and 4 units up from the origin',
                'Velocity vector: A plane flying 500 km/h at 30° north of east',
                'Force vector: A 10N push at 45° to the horizontal'
              ],
              workedExample: {
                problem: 'Find the components of a vector that points from point A(2, 3) to point B(7, 11).',
                solution: [
                  'Step 1: Identify the coordinates of both points.',
                  'Point A (starting point): (2, 3)',
                  'Point B (ending point): (7, 11)',
                  '',
                  'Step 2: Calculate the change in each coordinate.',
                  'Change in x (Δx) = x₂ - x₁ = 7 - 2 = 5',
                  'Change in y (Δy) = y₂ - y₁ = 11 - 3 = 8',
                  '',
                  'Step 3: Write the vector in component form.',
                  'The vector AB = (5, 8)',
                  '',
                  'Step 4: Verify by checking the distance.',
                  'Magnitude = √(5² + 8²) = √(25 + 64) = √89 ≈ 9.43 units'
                ],
                answer: 'The vector from A to B is (5, 8) or 5i + 8j'
              },
              applications: [
                'Computer Graphics: Position vectors determine where objects appear on screen',
                'Navigation: GPS uses vectors to calculate routes and distances',
                'Physics: Force vectors combine to determine net force on objects',
                'Game Development: Velocity vectors control character movement'
              ],
              practiceProblems: [
                { question: 'Find the vector from point P(1, 2) to Q(4, 6).', hint: 'Subtract the starting coordinates from the ending coordinates.' },
                { question: 'If vector v = (3, -2), in which quadrant does it point?', hint: 'Consider the signs of x and y components.' },
                { question: 'A vector has components (5, 12). What is its magnitude?', hint: 'Use the Pythagorean theorem: √(x² + y²).' }
              ]
            },
            {
              id: 'la-v2',
              title: 'Vector Magnitude and Direction',
              type: 'theory',
              duration: '15 min',
              content: `## Magnitude (Length) of a Vector

The **magnitude** or **length** of a vector measures how "long" the vector is, regardless of its direction. It's the distance from the tail to the head of the vector arrow.

### The Magnitude Formula

For a 2D vector v⃗ = (v₁, v₂), the magnitude is:

||v⃗|| = √(v₁² + v₂²)

This is directly from the Pythagorean theorem! The components form the legs of a right triangle, and the magnitude is the hypotenuse.

For a 3D vector v⃗ = (v₁, v₂, v₃):
||v⃗|| = √(v₁² + v₂² + v₃²)

### Direction (Angle) of a Vector

The **direction** of a 2D vector is typically expressed as an angle θ measured counterclockwise from the positive x-axis.

θ = arctan(v₂/v₁) = tan⁻¹(v₂/v₁)

**Important**: When using arctan, you must consider which quadrant the vector is in:
- Quadrant I (both positive): θ = tan⁻¹(v₂/v₁)
- Quadrant II (v₁ negative): θ = tan⁻¹(v₂/v₁) + 180°
- Quadrant III (both negative): θ = tan⁻¹(v₂/v₁) + 180°
- Quadrant IV (v₂ negative): θ = tan⁻¹(v₂/v₁) + 360°

### Unit Vectors

A **unit vector** has magnitude 1. It's useful for representing pure direction.

To convert any vector to a unit vector (normalize it):
û = v⃗/||v⃗||

The standard unit vectors are:
- î = (1, 0) — points along the positive x-axis
- ĵ = (0, 1) — points along the positive y-axis

Any 2D vector can be written as: v⃗ = v₁î + v₂ĵ`,
              keyPoints: [
                'Magnitude measures the length of a vector: ||v|| = √(v₁² + v₂²)',
                'Direction is the angle from the positive x-axis',
                'Unit vectors have magnitude 1 and represent pure direction',
                'Normalize a vector by dividing by its magnitude',
                'Standard unit vectors î, ĵ form the basis for 2D space'
              ],
              formula: '||\\vec{v}|| = \\sqrt{v_1^2 + v_2^2}, \\quad \\theta = \\tan^{-1}\\left(\\frac{v_2}{v_1}\\right)',
              workedExample: {
                problem: 'Find the magnitude and direction of the vector v⃗ = (3, 4). Then express it as a product of its magnitude and a unit vector.',
                solution: [
                  'Given: v⃗ = (3, 4)',
                  '',
                  'Step 1: Calculate the magnitude',
                  '||v⃗|| = √(3² + 4²) = √(9 + 16) = √25 = 5',
                  '',
                  'Step 2: Calculate the direction angle',
                  'θ = tan⁻¹(4/3) = tan⁻¹(1.333...)',
                  'θ ≈ 53.13° (measured from positive x-axis)',
                  '',
                  'Step 3: Find the unit vector',
                  'û = v⃗/||v⃗|| = (3/5, 4/5) = (0.6, 0.8)',
                  '',
                  'Step 4: Express v⃗ in polar form',
                  'v⃗ = ||v⃗|| · û = 5 · (0.6, 0.8)',
                  'Or in terms of magnitude and angle: v⃗ = 5∠53.13°'
                ],
                answer: '||v⃗|| = 5, θ ≈ 53.13°, and v⃗ = 5(0.6î + 0.8ĵ)'
              },
              practiceProblems: [
                { question: 'Find the magnitude of v⃗ = (-6, 8).', hint: 'The magnitude is always positive, even if components are negative.' },
                { question: 'Normalize the vector v⃗ = (1, 1).', hint: 'First find magnitude, then divide each component.' },
                { question: 'A vector has magnitude 10 and makes angle 30° with the x-axis. Find its components.', hint: 'x = ||v||·cos(θ), y = ||v||·sin(θ).' }
              ]
            },
            {
              id: 'la-v3',
              title: 'Vector Operations',
              type: 'interactive',
              duration: '15 min',
              content: `## Vector Addition and Scalar Multiplication

### Vector Addition

Vectors can be added together to create a new vector. There are two visual methods:

**Method 1: Tip-to-Tail Method**
Place the tail of the second vector at the tip of the first vector. The resultant vector goes from the tail of the first to the tip of the second.

**Method 2: Parallelogram Method**
Place both vectors tail-to-tail. Complete the parallelogram. The diagonal from the common tail is the resultant.

**Component Method (Algebraic)**:
For u⃗ = (u₁, u₂) and v⃗ = (v₁, v₂):
u⃗ + v⃗ = (u₁ + v₁, u₂ + v₂)

### Properties of Vector Addition

1. **Commutative**: u⃗ + v⃗ = v⃗ + u⃗
2. **Associative**: (u⃗ + v⃗) + w⃗ = u⃗ + (v⃗ + w⃗)
3. **Additive Identity**: u⃗ + 0⃗ = u⃗ (where 0⃗ = (0, 0))
4. **Additive Inverse**: u⃗ + (-u⃗) = 0⃗

### Scalar Multiplication

Multiplying a vector by a scalar (real number) changes its magnitude:
- If |scalar| > 1: the vector gets longer
- If 0 < |scalar| < 1: the vector gets shorter
- If scalar < 0: the vector reverses direction

For scalar c and vector v⃗ = (v₁, v₂):
c·v⃗ = (c·v₁, c·v₂)

### Properties of Scalar Multiplication

1. c·(u⃗ + v⃗) = c·u⃗ + c·v⃗
2. (c + d)·v⃗ = c·v⃗ + d·v⃗
3. (c·d)·v⃗ = c·(d·v⃗)
4. 1·v⃗ = v⃗

### Linear Combinations

A linear combination of vectors v⃗₁, v⃗₂, ..., v⃗ₙ is:
c₁v⃗₁ + c₂v⃗₂ + ... + cₙv⃗ₙ

where c₁, c₂, ..., cₙ are scalars (called coefficients).

This is fundamental to understanding vector spaces and will be crucial for understanding matrix operations and eigenvalues later.`,
              keyPoints: [
                'Vector addition: add corresponding components',
                'Scalar multiplication: multiply each component by the scalar',
                'Vector addition is commutative and associative',
                'Negative scalar reverses direction',
                'Linear combinations are weighted sums of vectors'
              ],
              formula: '\\vec{u} + \\vec{v} = (u_1+v_1, u_2+v_2), \\quad c\\vec{v} = (cv_1, cv_2)',
              workedExample: {
                problem: 'Given u⃗ = (2, -1) and v⃗ = (-3, 4), find: (a) u⃗ + v⃗, (b) 3u⃗ - 2v⃗, (c) ||u⃗ + v⃗||',
                solution: [
                  'Given: u⃗ = (2, -1) and v⃗ = (-3, 4)',
                  '',
                  'Part (a): u⃗ + v⃗',
                  'u⃗ + v⃗ = (2 + (-3), -1 + 4)',
                  'u⃗ + v⃗ = (-1, 3)',
                  '',
                  'Part (b): 3u⃗ - 2v⃗',
                  'First, find 3u⃗ = 3(2, -1) = (6, -3)',
                  'Next, find 2v⃗ = 2(-3, 4) = (-6, 8)',
                  'Then, 3u⃗ - 2v⃗ = (6, -3) + (6, -8) = (12, -11)',
                  '',
                  'Part (c): ||u⃗ + v⃗||',
                  'From part (a), u⃗ + v⃗ = (-1, 3)',
                  '||u⃗ + v⃗|| = √((-1)² + 3²) = √(1 + 9) = √10 ≈ 3.16'
                ],
                answer: '(a) (-1, 3), (b) (12, -11), (c) √10 ≈ 3.16'
              },
              applications: [
                'Physics: Adding force vectors to find net force',
                'Navigation: Combining velocity with wind/current to find actual path',
                'Computer Graphics: Combining transformations (scaling, rotation)',
                'Economics: Portfolio analysis combining different asset vectors'
              ],
              practiceProblems: [
                { question: 'If u⃗ = (1, 2) and v⃗ = (3, 1), find 2u⃗ + v⃗.', hint: 'First multiply u⃗ by 2, then add v⃗.' },
                { question: 'Find a scalar c such that c(2, 3) = (8, 12).', hint: 'Set up the equation c·2 = 8 and solve.' },
                { question: 'Show that u⃗ = (1, 2) and v⃗ = (2, -1) are perpendicular.', hint: 'Two vectors are perpendicular if their dot product is zero.' }
              ]
            },
            {
              id: 'la-v4',
              title: 'The Dot Product',
              type: 'theory',
              duration: '15 min',
              content: `## The Dot Product (Scalar Product)

The **dot product** is one of the most important operations in linear algebra. It takes two vectors and produces a scalar (a single number).

### Definition

For vectors u⃗ = (u₁, u₂, ..., uₙ) and v⃗ = (v₁, v₂, ..., vₙ):

**Algebraic Definition**:
u⃗ · v⃗ = u₁v₁ + u₂v₂ + ... + uₙvₙ

**Geometric Definition**:
u⃗ · v⃗ = ||u⃗|| ||v⃗|| cos(θ)

where θ is the angle between the two vectors.

### Properties of the Dot Product

1. **Commutative**: u⃗ · v⃗ = v⃗ · u⃗
2. **Distributive**: u⃗ · (v⃗ + w⃗) = u⃗ · v⃗ + u⃗ · w⃗
3. **Scalar multiplication**: (c·u⃗) · v⃗ = c(u⃗ · v⃗)
4. **u⃗ · u⃗ = ||u⃗||²**
5. **u⃗ · v⃗ = 0 if and only if u⃗ ⊥ v⃗** (perpendicular vectors)

### Finding the Angle Between Vectors

From the geometric definition:
cos(θ) = (u⃗ · v⃗) / (||u⃗|| ||v⃗||)

This gives us:
θ = cos⁻¹[(u⃗ · v⃗) / (||u⃗|| ||v⃗||)]

### Orthogonal Vectors

Two vectors are **orthogonal** (perpendicular) if their dot product equals zero:
u⃗ · v⃗ = 0 ⟹ u⃗ ⊥ v⃗

This is extremely useful for:
- Checking perpendicularity
- Finding normal vectors
- Orthogonal projections
- Gram-Schmidt orthogonalization

### Projection

The **projection** of vector v⃗ onto vector u⃗ is:

proj_u⃗(v⃗) = [(v⃗ · u⃗) / (u⃗ · u⃗)] u⃗

This gives the component of v⃗ that points in the direction of u⃗.`,
              keyPoints: [
                'Dot product produces a scalar (single number)',
                'u⃗ · v⃗ = u₁v₁ + u₂v₂ + ... (sum of products)',
                'Geometric interpretation: u⃗ · v⃗ = ||u⃗|| ||v⃗|| cos(θ)',
                'If u⃗ · v⃗ = 0, the vectors are perpendicular',
                'Use dot product to find angles between vectors',
                'Projection extracts component of one vector along another'
              ],
              formula: '\\vec{u} \\cdot \\vec{v} = \\sum_{i=1}^{n} u_i v_i = ||\\vec{u}|| \\, ||\\vec{v}|| \\cos\\theta',
              workedExample: {
                problem: 'Given u⃗ = (1, 2, 3) and v⃗ = (4, -1, 2):\n(a) Calculate u⃗ · v⃗\n(b) Find the angle between u⃗ and v⃗\n(c) Are these vectors perpendicular?',
                solution: [
                  'Given: u⃗ = (1, 2, 3) and v⃗ = (4, -1, 2)',
                  '',
                  'Part (a): Dot product',
                  'u⃗ · v⃗ = (1)(4) + (2)(-1) + (3)(2)',
                  'u⃗ · v⃗ = 4 + (-2) + 6 = 8',
                  '',
                  'Part (b): Angle between vectors',
                  'First, find magnitudes:',
                  '||u⃗|| = √(1² + 2² + 3²) = √(1 + 4 + 9) = √14',
                  '||v⃗|| = √(4² + (-1)² + 2²) = √(16 + 1 + 4) = √21',
                  '',
                  'Using cos(θ) = (u⃗ · v⃗) / (||u⃗|| ||v⃗||):',
                  'cos(θ) = 8 / (√14 · √21) = 8 / √294 ≈ 8/17.15 ≈ 0.467',
                  'θ = cos⁻¹(0.467) ≈ 62.2°',
                  '',
                  'Part (c): Perpendicularity',
                  'Since u⃗ · v⃗ = 8 ≠ 0, the vectors are NOT perpendicular.',
                  'For perpendicular vectors, the dot product must be exactly zero.'
                ],
                answer: '(a) 8, (b) ≈ 62.2°, (c) No, they are not perpendicular'
              },
              applications: [
                'Work in physics: W = F⃗ · d⃗ (force times displacement in the direction of force)',
                'Computer graphics: Lighting calculations use dot product for surface normals',
                'Machine learning: Cosine similarity measures document similarity',
                'Signal processing: Correlation between signals uses dot products'
              ],
              practiceProblems: [
                { question: 'Find the dot product of u⃗ = (2, 3) and v⃗ = (-1, 4).', hint: 'Multiply corresponding components and sum.' },
                { question: 'Find a value for k such that (1, k) is perpendicular to (k, 4).', hint: 'Set up the dot product equation and solve for k.' },
                { question: 'Find the projection of v⃗ = (3, 4) onto u⃗ = (1, 0).', hint: 'Use the projection formula: [(v⃗·u⃗)/(u⃗·u⃗)]u⃗' }
              ]
            }
          ]
        },
        {
          id: 'la-matrices',
          title: 'Matrices and Matrix Operations',
          description: 'Understanding matrices and their operations',
          duration: '60 min',
          difficulty: 'intermediate',
          prerequisites: ['Understanding of vectors', 'Basic algebra'],
          learningObjectives: [
            'Define matrices and their dimensions',
            'Perform matrix addition and scalar multiplication',
            'Multiply matrices correctly',
            'Understand the identity matrix and matrix properties'
          ],
          content: [
            {
              id: 'la-m1',
              title: 'Matrix Fundamentals',
              type: 'theory',
              duration: '20 min',
              content: `## What is a Matrix?

A **matrix** is a rectangular array of numbers arranged in rows and columns. Matrices are fundamental in linear algebra and have applications ranging from solving systems of equations to computer graphics and machine learning.

### Matrix Notation

We write a matrix as a grid enclosed in brackets:

A = [a₁₁  a₁₂  a₁₃]
    [a₂₁  a₂₂  a₂₃]
    [a₃₁  a₃₂  a₃₃]

**Subscript notation**: aᵢⱼ refers to the element in row i, column j.

For example, a₂₃ is in row 2, column 3.

### Matrix Dimensions

The **dimension** or **size** of a matrix is written as m × n (read "m by n"):
- **m** = number of rows
- **n** = number of columns

Examples:
- A 2×3 matrix has 2 rows and 3 columns
- A 4×4 matrix has 4 rows and 4 columns (called a "square matrix")
- A 1×n matrix is called a "row vector"
- An m×1 matrix is called a "column vector"

### Special Matrices

**Square Matrix**: Same number of rows and columns (n×n)

**Identity Matrix (I)**: A square matrix with 1s on the main diagonal and 0s elsewhere
    [1  0  0]
I = [0  1  0]
    [0  0  1]

The identity matrix is like the number 1 for regular multiplication: AI = IA = A

**Zero Matrix (O)**: All elements are zero

**Diagonal Matrix**: All elements off the main diagonal are zero

**Symmetric Matrix**: A = Aᵀ (the matrix equals its transpose)

### The Transpose

The **transpose** of a matrix A, written Aᵀ, is obtained by swapping rows and columns:

If A = [1  2  3]    then Aᵀ = [1  4]
       [4  5  6]             [2  5]
                             [3  6]

Row i of A becomes column i of Aᵀ.`,
              keyPoints: [
                'A matrix is a rectangular array of numbers',
                'Dimension m×n means m rows and n columns',
                'Element aᵢⱼ is in row i, column j',
                'Identity matrix has 1s on diagonal, 0s elsewhere',
                'Transpose swaps rows and columns'
              ],
              formula: 'A = [a_{ij}]_{m \\times n}, \\quad A^T = [a_{ji}]_{n \\times m}',
              workedExample: {
                problem: 'Given matrices A and B below:\nA = [2  1  3]    B = [0  4]\n    [4 -1  2]        [-2 1]\n                      [3  5]\n\n(a) What are the dimensions of A and B?\n(b) Find Aᵀ and Bᵀ\n(c) What is a₂₃ in matrix A?',
                solution: [
                  'Matrix A = [2  1  3]',
                  '           [4 -1  2]',
                  '',
                  'Matrix B = [0  4]',
                  '           [-2 1]',
                  '           [3  5]',
                  '',
                  'Part (a): Dimensions',
                  'Matrix A has 2 rows and 3 columns: dimension is 2×3',
                  'Matrix B has 3 rows and 2 columns: dimension is 3×2',
                  '',
                  'Part (b): Transposes',
                  'Aᵀ swaps rows to columns:',
                  'Aᵀ = [2   4]',
                  '     [1  -1]',
                  '     [3   2]',
                  '',
                  'Bᵀ swaps rows to columns:',
                  'Bᵀ = [0  -2  3]',
                  '     [4   1  5]',
                  '',
                  'Part (c): Element a₂₃',
                  'a₂₃ is in row 2, column 3 of A',
                  'Row 2 is [4, -1, 2]',
                  'Column 3 element is 2',
                  'Therefore, a₂₃ = 2'
                ],
                answer: '(a) A is 2×3, B is 3×2; (b) Aᵀ is 3×2, Bᵀ is 2×3; (c) a₂₃ = 2'
              },
              practiceProblems: [
                { question: 'Create a 3×3 matrix where aᵢⱼ = i + j.', hint: 'For each position, add the row number and column number.' },
                { question: 'If A is 4×5, what is the dimension of Aᵀ?', hint: 'Transpose swaps rows and columns.' },
                { question: 'Write the 4×4 identity matrix.', hint: '1s on diagonal, 0s everywhere else.' }
              ]
            },
            {
              id: 'la-m2',
              title: 'Matrix Multiplication',
              type: 'theory',
              duration: '25 min',
              content: `## Matrix Multiplication

Matrix multiplication is more complex than addition or scalar multiplication. It's not simply multiplying corresponding elements!

### When Can We Multiply?

For matrices A (m×n) and B (p×q):
- We can multiply AB only if n = p (columns of A = rows of B)
- The result will have dimension m×q

**Memory trick**: "Inner must match, outer gives result"
- A(m×**n**) · B(**p**×q) works if n = p
- Result is m×q

### How to Multiply

For element (i,j) of the product AB:
(AB)ᵢⱼ = (row i of A) · (column j of B)

This is the dot product of row i of A with column j of B!

### Step-by-Step Example

Let A = [1  2  3]    B = [7   8]
        [4  5  6]        [9  10]
                        [11 12]

A is 2×3, B is 3×2, so AB will be 2×2.

For (AB)₁₁:
= [1, 2, 3] · [7, 9, 11]
= 1(7) + 2(9) + 3(11)
= 7 + 18 + 33 = 58

For (AB)₁₂:
= [1, 2, 3] · [8, 10, 12]
= 1(8) + 2(10) + 3(12)
= 8 + 20 + 36 = 64

For (AB)₂₁:
= [4, 5, 6] · [7, 9, 11]
= 4(7) + 5(9) + 6(11)
= 28 + 45 + 66 = 139

For (AB)₂₂:
= [4, 5, 6] · [8, 10, 12]
= 4(8) + 5(10) + 6(12)
= 32 + 50 + 72 = 154

Therefore: AB = [58   64]
                [139 154]

### Properties of Matrix Multiplication

1. **NOT Commutative**: AB ≠ BA (usually)
   - Order matters! Matrix multiplication is not like regular number multiplication.

2. **Associative**: (AB)C = A(BC)
   - You can regroup, but not reorder.

3. **Distributive**: A(B + C) = AB + AC

4. **Identity**: AI = IA = A
   - Multiplying by the identity matrix leaves A unchanged.

5. **Transpose**: (AB)ᵀ = BᵀAᵀ
   - Note the order reversal!`,
              keyPoints: [
                'Matrix multiplication requires matching inner dimensions',
                '(AB)ᵢⱼ = dot product of row i of A with column j of B',
                'Matrix multiplication is NOT commutative (AB ≠ BA)',
                'Always check dimensions before multiplying',
                'The transpose reverses multiplication order: (AB)ᵀ = BᵀAᵀ'
              ],
              formula: '(AB)_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}',
              workedExample: {
                problem: 'Multiply the matrices:\nA = [1  2]    B = [5  6]\n    [3  4]        [7  8]\n\nVerify that AB ≠ BA.',
                solution: [
                  'Given: A = [1  2]    B = [5  6]',
                  '           [3  4]        [7  8]',
                  '',
                  'Both A and B are 2×2 matrices.',
                  'The product AB will be 2×2.',
                  '',
                  'Calculating AB:',
                  '(AB)₁₁ = [1, 2] · [5, 7] = 1(5) + 2(7) = 5 + 14 = 19',
                  '(AB)₁₂ = [1, 2] · [6, 8] = 1(6) + 2(8) = 6 + 16 = 22',
                  '(AB)₂₁ = [3, 4] · [5, 7] = 3(5) + 4(7) = 15 + 28 = 43',
                  '(AB)₂₂ = [3, 4] · [6, 8] = 3(6) + 4(8) = 18 + 32 = 50',
                  '',
                  'AB = [19  22]',
                  '     [43  50]',
                  '',
                  'Now calculating BA:',
                  '(BA)₁₁ = [5, 6] · [1, 3] = 5(1) + 6(3) = 5 + 18 = 23',
                  '(BA)₁₂ = [5, 6] · [2, 4] = 5(2) + 6(4) = 10 + 24 = 34',
                  '(BA)₂₁ = [7, 8] · [1, 3] = 7(1) + 8(3) = 7 + 24 = 31',
                  '(BA)₂₂ = [7, 8] · [2, 4] = 7(2) + 8(4) = 14 + 32 = 46',
                  '',
                  'BA = [23  34]',
                  '     [31  46]',
                  '',
                  'Comparing AB and BA:',
                  'AB = [19  22] ≠ [23  34] = BA',
                  '     [43  50]   [31  46]',
                  '',
                  'This confirms: AB ≠ BA (matrices do not commute!)'
                ],
                answer: 'AB = [19 22], BA = [23 34]. Clearly AB ≠ BA.'
              },
              applications: [
                'Computer Graphics: Transforming 3D objects (rotation, scaling, translation)',
                'Machine Learning: Neural networks use matrix multiplication for forward propagation',
                'Economics: Input-output models for analyzing economic systems',
                'Physics: Quantum mechanics uses matrices for state transformations'
              ],
              practiceProblems: [
                { question: 'Multiply: A = [1 2 3] (1×3) and B = [4; 5; 6] (3×1). What is the dimension of the result?', hint: 'Row vector times column vector gives a scalar (1×1 matrix).' },
                { question: 'Find two 2×2 matrices A and B where AB = BA.', hint: 'Try A = identity matrix or try A and B where both are diagonal.' },
                { question: 'If A is 3×4 and B is 4×5, what is the dimension of (AB)ᵀ?', hint: 'First find AB dimension, then take transpose.' }
              ]
            }
          ]
        },
        {
          id: 'la-determinants',
          title: 'Determinants',
          description: 'Calculate and understand determinants',
          duration: '50 min',
          difficulty: 'intermediate',
          prerequisites: ['Matrix fundamentals', 'Matrix multiplication'],
          learningObjectives: [
            'Calculate determinants of 2×2 and 3×3 matrices',
            'Understand the geometric meaning of determinants',
            'Use determinant properties for efficient calculation',
            'Determine if a matrix is invertible'
          ],
          content: [
            {
              id: 'la-d1',
              title: 'What is a Determinant?',
              type: 'theory',
              duration: '20 min',
              content: `## The Determinant

The **determinant** is a special number that can be calculated from a square matrix. It encodes important information about the linear transformation described by the matrix.

### 2×2 Determinant

For a 2×2 matrix A = [a  b]
                    [c  d]

The determinant is:
det(A) = ad - bc

**Memory trick**: "Down-right minus up-right" or "Main diagonal minus anti-diagonal"

### Geometric Interpretation

The determinant has a beautiful geometric meaning:

**For 2×2 matrices**: |det(A)| = area of the parallelogram formed by applying A to the unit square

**For 3×3 matrices**: |det(A)| = volume of the parallelepiped formed by applying A to the unit cube

**Sign of the determinant**:
- det(A) > 0: The transformation preserves orientation (right-hand rule maintained)
- det(A) < 0: The transformation reverses orientation (reflection occurred)
- det(A) = 0: The transformation "flattens" space (area/volume becomes zero)

### Invertibility

A square matrix A is **invertible** (has an inverse) **if and only if** det(A) ≠ 0.

If det(A) = 0, the matrix is called **singular** or **degenerate**, and:
- The matrix has no inverse
- The linear transformation "collapses" space
- The columns are linearly dependent
- The system Ax = b has either no solution or infinitely many solutions

### 3×3 Determinant (Sarrus' Rule)

For a 3×3 matrix, we can use Sarrus' rule:

A = [a  b  c]
    [d  e  f]
    [g  h  i]

det(A) = aei + bfg + cdh - ceg - bdi - afh

Or use cofactor expansion along any row or column.`,
              keyPoints: [
                'Determinant is a scalar calculated from a square matrix',
                'For 2×2: det = ad - bc',
                'Geometric meaning: signed area (2D) or volume (3D) scaling factor',
                'det(A) = 0 means matrix is singular (not invertible)',
                'det(A) > 0 preserves orientation; det(A) < 0 reverses it'
              ],
              formula: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc',
              workedExample: {
                problem: 'Find the determinant of each matrix and determine if it\'s invertible:\n(a) A = [3  2]    (b) B = [4  8]\n        [1  4]            [2  4]\n\nAlso, interpret the geometric meaning for matrix A.',
                solution: [
                  'Part (a): det(A)',
                  'A = [3  2]',
                  '    [1  4]',
                  '',
                  'det(A) = (3)(4) - (2)(1) = 12 - 2 = 10',
                  '',
                  'Since det(A) = 10 ≠ 0, A is invertible.',
                  '',
                  'Geometric interpretation:',
                  '- The transformation scales areas by a factor of 10',
                  '- The positive sign means orientation is preserved',
                  '',
                  'Part (b): det(B)',
                  'B = [4  8]',
                  '    [2  4]',
                  '',
                  'det(B) = (4)(4) - (8)(2) = 16 - 16 = 0',
                  '',
                  'Since det(B) = 0, B is NOT invertible (singular).',
                  '',
                  'Notice that row 2 = (1/2) × row 1:',
                  '[2, 4] = (1/2)[4, 8]',
                  '',
                  'This linear dependence causes the determinant to be zero.'
                ],
                answer: '(a) det(A) = 10, invertible, scales areas by 10×. (b) det(B) = 0, not invertible (singular).'
              },
              applications: [
                'Cryptography: Checking if encryption matrices are valid',
                'Computer Graphics: Detecting when transformations are reversible',
                'Economics: Determining unique solutions in economic models',
                'Engineering: Analyzing stability of systems (eigenvalues come from det(A-λI) = 0)'
              ],
              practiceProblems: [
                { question: 'Find det(A) where A = [2  -1; 3  4]. Is A invertible?', hint: 'det = ad - bc for 2×2 matrices.' },
                { question: 'If det(A) = 5 and det(B) = 3, find det(AB).', hint: 'det(AB) = det(A) × det(B).' },
                { question: 'Find a value of k such that [1 2; 3 k] is singular.', hint: 'Set determinant equal to zero and solve for k.' }
              ]
            }
          ]
        },
        {
          id: 'la-eigenvalues',
          title: 'Eigenvalues and Eigenvectors',
          description: 'Find eigenvalues and eigenvectors of matrices',
          duration: '75 min',
          difficulty: 'advanced',
          prerequisites: ['Matrix multiplication', 'Determinants'],
          learningObjectives: [
            'Understand the eigenvalue-eigenvector relationship',
            'Calculate eigenvalues from characteristic polynomial',
            'Find eigenvectors for each eigenvalue',
            'Apply eigenvalues to real-world problems'
          ],
          content: [
            {
              id: 'la-e1',
              title: 'Eigenvalues and Eigenvectors',
              type: 'theory',
              duration: '25 min',
              content: `## The Eigenvalue Problem

An **eigenvector** of a square matrix A is a non-zero vector v⃗ that, when multiplied by A, only gets scaled (not rotated). The scaling factor is called the **eigenvalue**.

### Definition

A vector v⃗ is an eigenvector of matrix A with eigenvalue λ if:

**Av⃗ = λv⃗**

This equation says: "Multiplying v⃗ by A is the same as scaling v⃗ by λ."

### Why Does This Matter?

Eigenvectors are special directions where the transformation A acts simply—it only stretches or shrinks, with no rotation.

**Real-world examples**:
- **Physics**: Normal modes of vibration (bridges, molecules)
- **Google's PageRank**: The steady-state distribution is an eigenvector
- **Principal Component Analysis**: Finding directions of maximum variance
- **Quantum Mechanics**: Observable quantities are eigenvalues

### Finding Eigenvalues

From Av⃗ = λv⃗, we can write:
Av⃗ - λv⃗ = 0⃗
(A - λI)v⃗ = 0⃗

For a non-trivial solution (v⃗ ≠ 0), the matrix (A - λI) must be singular:
**det(A - λI) = 0**

This is the **characteristic equation**, and its solutions are the eigenvalues.

### Finding Eigenvectors

Once we have an eigenvalue λ, we find eigenvectors by solving:
**(A - λI)v⃗ = 0⃗**

This means finding the null space of (A - λI).

### The Characteristic Polynomial

For a 2×2 matrix:
A = [a  b]
    [c  d]

det(A - λI) = det([a-λ  b  ])
                   [c    d-λ]

= (a-λ)(d-λ) - bc
= λ² - (a+d)λ + (ad-bc)
= λ² - (trace A)λ + (det A)

The eigenvalues are the roots of this polynomial!

### Important Properties

1. **Sum of eigenvalues** = trace(A) = a + d (sum of diagonal)
2. **Product of eigenvalues** = det(A)
3. **Number of eigenvalues** = dimension of matrix (counting multiplicity)
4. **Eigenvectors for different eigenvalues are linearly independent**`,
              keyPoints: [
                'Eigenvector: direction unchanged by transformation A',
                'Eigenvalue: scaling factor along eigenvector direction',
                'Find eigenvalues: solve det(A - λI) = 0',
                'Find eigenvectors: solve (A - λI)v⃗ = 0⃗',
                'Sum of eigenvalues = trace(A)',
                'Product of eigenvalues = det(A)'
              ],
              formula: 'A\\vec{v} = \\lambda\\vec{v} \\quad \\Leftrightarrow \\quad \\det(A - \\lambda I) = 0',
              workedExample: {
                problem: 'Find all eigenvalues and eigenvectors of:\nA = [4  1]\n    [2  3]',
                solution: [
                  'Given: A = [4  1]',
                  '           [2  3]',
                  '',
                  'Step 1: Find eigenvalues using characteristic equation',
                  'det(A - λI) = 0',
                  '',
                  'A - λI = [4-λ   1 ]',
                  '         [2    3-λ]',
                  '',
                  'det(A - λI) = (4-λ)(3-λ) - (1)(2)',
                  '            = 12 - 4λ - 3λ + λ² - 2',
                  '            = λ² - 7λ + 10',
                  '',
                  'Setting equal to zero:',
                  'λ² - 7λ + 10 = 0',
                  '(λ - 5)(λ - 2) = 0',
                  '',
                  'Eigenvalues: λ₁ = 5 and λ₂ = 2',
                  '',
                  'Step 2: Find eigenvectors for λ₁ = 5',
                  'Solve (A - 5I)v⃗ = 0⃗',
                  '',
                  'A - 5I = [4-5   1 ] = [-1  1]',
                  '         [2    3-5]   [2  -2]',
                  '',
                  'Row operations: [-1  1]  →  [1  -1]',
                  '                [2  -2]     [0   0]',
                  '',
                  'Equation: x₁ - x₂ = 0 ⟹ x₁ = x₂',
                  '',
                  'Let x₂ = 1, then x₁ = 1',
                  'Eigenvector: v⃗₁ = (1, 1) or any scalar multiple',
                  '',
                  'Step 3: Find eigenvectors for λ₂ = 2',
                  'Solve (A - 2I)v⃗ = 0⃗',
                  '',
                  'A - 2I = [4-2   1 ] = [2  1]',
                  '         [2    3-2]   [2  1]',
                  '',
                  'Row operations: [2  1]  →  [2  1]',
                  '                [2  1]     [0  0]',
                  '',
                  'Equation: 2x₁ + x₂ = 0 ⟹ x₂ = -2x₁',
                  '',
                  'Let x₁ = 1, then x₂ = -2',
                  'Eigenvector: v⃗₂ = (1, -2) or any scalar multiple',
                  '',
                  'Verification:',
                  'Av⃗₁ = [4 1][1] = [5] = 5[1] = λ₁v⃗₁ ✓',
                  '       [2 3][1]   [5]   [1]',
                  '',
                  'Av⃗₂ = [4 1][ 1] = [ 2] = 2[ 1] = λ₂v⃗₂ ✓',
                  '       [2 3][-2]   [-2]   [-2]'
                ],
                answer: 'λ₁ = 5 with eigenvector v⃗₁ = (1, 1); λ₂ = 2 with eigenvector v⃗₂ = (1, -2)'
              },
              applications: [
                'Google PageRank: The billion-dollar eigenvector',
                'Vibration Analysis: Natural frequencies of structures',
                'Image Compression: Using principal components',
                'Quantum Mechanics: Energy levels are eigenvalues',
                'Population Dynamics: Long-term growth rates',
                'Face Recognition: Eigenfaces method'
              ],
              practiceProblems: [
                { question: 'Find eigenvalues of A = [2 0; 0 3].', hint: 'For diagonal matrices, eigenvalues are the diagonal elements.' },
                { question: 'Verify: Sum of eigenvalues = trace, Product = determinant.', hint: 'trace = 4+3 = 7, det = 4×3 - 1×2 = 10.' },
                { question: 'Find the eigenvalues of [1 2; 2 1].', hint: 'Set up characteristic equation: det(A - λI) = (1-λ)² - 4 = 0.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'probability-statistics',
      title: 'Probability & Statistics',
      description: 'Understanding randomness and data analysis',
      icon: 'BarChart2',
      color: 'from-cyan-500 to-teal-500',
      difficulty: 'beginner',
      duration: '10 hours',
      lessons: [
        {
          id: 'ps-probability',
          title: 'Fundamentals of Probability',
          description: 'Basic probability concepts and rules',
          duration: '60 min',
          difficulty: 'beginner',
          prerequisites: ['Basic arithmetic', 'Understanding of fractions'],
          learningObjectives: [
            'Define probability and understand sample spaces',
            'Calculate probabilities of simple events',
            'Apply the addition and multiplication rules',
            'Understand conditional probability and independence'
          ],
          content: [
            {
              id: 'ps-p1',
              title: 'What is Probability?',
              type: 'theory',
              duration: '20 min',
              content: `## Understanding Probability

**Probability** is the mathematical study of uncertainty and randomness. It provides a framework for quantifying how likely events are to occur.

### Basic Definitions

**Experiment**: A process that produces an outcome (e.g., rolling a die, flipping a coin)

**Sample Space (S)**: The set of all possible outcomes
- Rolling a die: S = {1, 2, 3, 4, 5, 6}
- Flipping a coin: S = {Heads, Tails}
- Drawing a card: S = {52 cards in a deck}

**Event (E)**: A subset of the sample space
- "Rolling an even number": E = {2, 4, 6}
- "Drawing a heart": E = {13 heart cards}

### Probability of an Event

For equally likely outcomes:

**P(E) = Number of favorable outcomes / Total number of outcomes**

### Properties of Probability

1. **0 ≤ P(E) ≤ 1**: Probability is always between 0 and 1
   - P(E) = 0 means the event is impossible
   - P(E) = 1 means the event is certain

2. **P(S) = 1**: The probability of the entire sample space is 1

3. **P(Eᶜ) = 1 - P(E)**: The probability of "not E" is 1 minus P(E)

4. **P(E ∪ F) = P(E) + P(F) - P(E ∩ F)**: Addition rule for unions

### Example: Rolling a Fair Die

What is the probability of rolling a number greater than 4?

- Sample space: S = {1, 2, 3, 4, 5, 6}
- Event E = {5, 6} (outcomes greater than 4)
- P(E) = 2/6 = 1/3 ≈ 0.333

### Relative Frequency Interpretation

Probability can also be understood as long-run frequency:
- If you flip a fair coin many times, about half will be heads
- P(Heads) = 0.5 means "in the long run, 50% of flips are heads"

This connects probability to real-world experiments and data!`,
              keyPoints: [
                'Probability measures how likely an event is to occur',
                'P(E) = favorable outcomes / total outcomes (for equally likely cases)',
                'Probability ranges from 0 (impossible) to 1 (certain)',
                'P(not E) = 1 - P(E)',
                'Sample space contains all possible outcomes'
              ],
              formula: 'P(E) = \\frac{\\text{number of favorable outcomes}}{\\text{total number of outcomes}}',
              workedExample: {
                problem: 'A standard deck has 52 cards (13 hearts, 13 diamonds, 13 clubs, 13 spades).\nFind the probability of:\n(a) Drawing a heart\n(b) Drawing a face card (J, Q, K)\n(c) Drawing a heart OR a face card',
                solution: [
                  'Total number of cards = 52',
                  '',
                  'Part (a): Drawing a heart',
                  'Number of hearts = 13',
                  'P(heart) = 13/52 = 1/4 = 0.25',
                  '',
                  'Part (b): Drawing a face card',
                  'Each suit has 3 face cards (J, Q, K)',
                  'Total face cards = 4 suits × 3 = 12',
                  'P(face card) = 12/52 = 3/13 ≈ 0.231',
                  '',
                  'Part (c): Drawing a heart OR a face card',
                  'Using addition rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
                  '',
                  'P(heart) = 13/52',
                  'P(face card) = 12/52',
                  'P(heart AND face card) = 3/52 (J♥, Q♥, K♥)',
                  '',
                  'P(heart OR face) = 13/52 + 12/52 - 3/52',
                  '                 = 22/52 = 11/26 ≈ 0.423'
                ],
                answer: '(a) 0.25, (b) ≈ 0.231, (c) ≈ 0.423'
              },
              practiceProblems: [
                { question: 'Roll two dice. What is P(sum = 7)?', hint: 'Count pairs that sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Total outcomes = 36.' },
                { question: 'A bag has 5 red, 3 blue, and 2 green marbles. Find P(not red).', hint: 'P(not red) = 1 - P(red).' },
                { question: 'What is P(drawing an ace from a standard deck)?', hint: 'There are 4 aces in 52 cards.' }
              ]
            },
            {
              id: 'ps-p2',
              title: 'Conditional Probability',
              type: 'theory',
              duration: '25 min',
              content: `## Conditional Probability

**Conditional probability** asks: "What is the probability of event A, given that event B has already occurred?"

### Definition

The conditional probability of A given B is:

**P(A|B) = P(A ∩ B) / P(B)**

This is read as "probability of A given B."

### Understanding Conditional Probability

Think of it as "restricting" the sample space:
- Originally, our sample space was all possible outcomes
- After knowing B occurred, our sample space "shrinks" to just B
- We calculate probabilities within this new, smaller sample space

### Independence

Two events A and B are **independent** if knowing one gives no information about the other:

**A and B are independent ⟺ P(A|B) = P(A)**

Equivalently:
**P(A ∩ B) = P(A) × P(B)**

### Bayes' Theorem

Bayes' Theorem allows us to "reverse" conditional probabilities:

**P(A|B) = P(B|A) × P(A) / P(B)**

This is fundamental to medical testing, spam filtering, and many AI applications.

### Medical Testing Example

Consider a disease that affects 1% of the population (P(Disease) = 0.01).
A test is 95% accurate:
- P(Positive | Disease) = 0.95 (sensitivity)
- P(Negative | No Disease) = 0.95 (specificity)

If you test positive, what's the probability you have the disease?

Using Bayes' Theorem:
P(Disease | Positive) = P(Positive | Disease) × P(Disease) / P(Positive)

P(Positive) = P(Positive | Disease) × P(Disease) + P(Positive | No Disease) × P(No Disease)
            = 0.95 × 0.01 + 0.05 × 0.99 = 0.0095 + 0.0495 = 0.059

P(Disease | Positive) = 0.95 × 0.01 / 0.059 ≈ 0.161

**Surprising result**: Even with a positive test, there's only about 16% chance you have the disease!`,
              keyPoints: [
                'Conditional probability: P(A|B) = P(A ∩ B) / P(B)',
                'It restricts the sample space to outcomes where B occurred',
                'Independence: P(A|B) = P(A) means A and B are independent',
                'Bayes\' Theorem reverses conditional probabilities',
                'Base rates matter! Low base rate → many false positives'
              ],
              formula: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}, \\quad P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
              workedExample: {
                problem: 'A factory has two machines:\n- Machine A produces 60% of items, with 2% defective\n- Machine B produces 40% of items, with 4% defective\n\nIf a randomly selected item is defective, what is the probability it came from Machine A?',
                solution: [
                  'Given:',
                  'P(Machine A) = 0.60, P(Defective | A) = 0.02',
                  'P(Machine B) = 0.40, P(Defective | B) = 0.04',
                  '',
                  'We want: P(Machine A | Defective)',
                  '',
                  'Using Bayes\' Theorem:',
                  'P(A | D) = P(D | A) × P(A) / P(D)',
                  '',
                  'First, find P(D) using the law of total probability:',
                  'P(D) = P(D|A) × P(A) + P(D|B) × P(B)',
                  '     = 0.02 × 0.60 + 0.04 × 0.40',
                  '     = 0.012 + 0.016 = 0.028',
                  '',
                  'Now apply Bayes\' Theorem:',
                  'P(A | D) = (0.02 × 0.60) / 0.028',
                  '         = 0.012 / 0.028',
                  '         = 12/28 = 3/7 ≈ 0.429',
                  '',
                  'Interpretation:',
                  'Even though Machine A produces more items (60%),',
                  'given a defective item, there\'s only a 42.9% chance',
                  'it came from Machine A. This is because Machine B',
                  'has a higher defect rate.'
                ],
                answer: 'P(Machine A | Defective) = 3/7 ≈ 0.429 or about 42.9%'
              },
              applications: [
                'Medical diagnosis: Interpreting test results correctly',
                'Spam filtering: P(Spam | Contains "FREE MONEY")',
                'Machine learning: Naive Bayes classifiers',
                'Legal reasoning: P(Innocent | Evidence)',
                'Quality control: Identifying sources of defects'
              ],
              practiceProblems: [
                { question: 'If P(A) = 0.3, P(B) = 0.4, and P(A ∩ B) = 0.12, are A and B independent?', hint: 'Check if P(A) × P(B) = P(A ∩ B).' },
                { question: 'P(Rain) = 0.3, P(Umbrella | Rain) = 0.8, P(Umbrella | No Rain) = 0.1. Find P(Rain | Umbrella).', hint: 'Use Bayes\' Theorem.' },
                { question: 'A coin is flipped twice. Find P(both heads | at least one head).', hint: 'Sample space given "at least one head": {HH, HT, TH}.' }
              ]
            }
          ]
        },
        {
          id: 'ps-distributions',
          title: 'Probability Distributions',
          description: 'Common probability distributions and their properties',
          duration: '60 min',
          difficulty: 'intermediate',
          prerequisites: ['Probability fundamentals'],
          learningObjectives: [
            'Distinguish between discrete and continuous distributions',
            'Understand and apply the binomial distribution',
            'Work with the normal distribution',
            'Calculate expected values and variances'
          ],
          content: [
            {
              id: 'ps-d1',
              title: 'Discrete Distributions',
              type: 'theory',
              duration: '25 min',
              content: `## Discrete Probability Distributions

A **discrete probability distribution** assigns probabilities to each possible value of a discrete random variable.

### Random Variables

A **random variable** X is a function that assigns a number to each outcome:
- **Discrete**: X takes countable values (0, 1, 2, ...)
- **Continuous**: X can take any value in an interval

### Expected Value (Mean)

The expected value E[X] or μ is the long-run average:

**E[X] = Σ x × P(X = x)**

### Variance and Standard Deviation

Variance measures spread:
**Var(X) = E[(X - μ)²] = E[X²] - (E[X])²**

Standard deviation: **σ = √Var(X)**

### The Binomial Distribution

**Setup**: n independent trials, each with probability p of success

**X = number of successes in n trials**

**Probability Mass Function**:
P(X = k) = C(n,k) × pᵏ × (1-p)ⁿ⁻ᵏ

where C(n,k) = n! / (k!(n-k)!) is the binomial coefficient.

**Properties**:
- E[X] = np
- Var(X) = np(1-p)

### Example: Quality Control

A factory produces items with a 5% defect rate. In a sample of 20 items, what is:
1. Expected number of defects?
2. Probability of exactly 2 defects?
3. Probability of at most 2 defects?

**Solution**:
1. E[X] = np = 20 × 0.05 = 1 defect
2. P(X = 2) = C(20,2) × 0.05² × 0.95¹⁸ = 190 × 0.0025 × 0.397 ≈ 0.1887
3. P(X ≤ 2) = P(0) + P(1) + P(2) ≈ 0.3585 + 0.3774 + 0.1887 ≈ 0.925

### The Poisson Distribution

Models rare events in a fixed interval (time, space, etc.):

**P(X = k) = (λᵏ × e⁻λ) / k!**

where λ is the average rate.

**Properties**:
- E[X] = λ
- Var(X) = λ`,
              keyPoints: [
                'Discrete distributions assign probabilities to countable outcomes',
                'Expected value E[X] = Σ x × P(x) is the long-run average',
                'Binomial: n trials, probability p, count successes',
                'Binomial: E[X] = np, Var(X) = np(1-p)',
                'Poisson models rare events: E[X] = Var(X) = λ'
              ],
              formula: 'P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}',
              workedExample: {
                problem: 'A basketball player makes 70% of free throws.\nIn a game, she shoots 10 free throws.\n\n(a) What is the expected number of makes?\n(b) What is the probability she makes exactly 8?\n(c) What is the probability she makes at least 8?',
                solution: [
                  'This is a binomial distribution with:',
                  'n = 10 trials',
                  'p = 0.70 (probability of success on each trial)',
                  '',
                  'Part (a): Expected value',
                  'E[X] = np = 10 × 0.70 = 7',
                  'She is expected to make 7 free throws on average.',
                  '',
                  'Part (b): P(X = 8)',
                  'P(X = 8) = C(10,8) × (0.70)⁸ × (0.30)²',
                  '',
                  'C(10,8) = 10!/(8!×2!) = 45',
                  '',
                  'P(X = 8) = 45 × 0.0576 × 0.09',
                  '         = 45 × 0.00519',
                  '         ≈ 0.233',
                  '',
                  'Part (c): P(X ≥ 8) = P(8) + P(9) + P(10)',
                  '',
                  'P(9) = C(10,9) × (0.70)⁹ × (0.30)¹',
                  '     = 10 × 0.0404 × 0.30',
                  '     ≈ 0.121',
                  '',
                  'P(10) = C(10,10) × (0.70)¹⁰ × (0.30)⁰',
                  '      = 1 × 0.0282 × 1',
                  '      ≈ 0.028',
                  '',
                  'P(X ≥ 8) = 0.233 + 0.121 + 0.028 = 0.382',
                  '',
                  'There is a 38.2% chance she makes at least 8 free throws.'
                ],
                answer: '(a) 7 makes expected, (b) P(8) ≈ 0.233, (c) P(X≥8) ≈ 0.382'
              },
              applications: [
                'Quality control: Number of defects in a batch',
                'Medical trials: Number of patients who respond to treatment',
                'Marketing: Number of customers who click an ad',
                'Sports: Number of successful shots/attempts',
                'Insurance: Number of claims in a period'
              ],
              practiceProblems: [
                { question: 'A coin is flipped 5 times. Find P(exactly 3 heads).', hint: 'n=5, p=0.5, k=3. Use binomial formula.' },
                { question: 'If X ~ Binomial(100, 0.3), find E[X] and Var(X).', hint: 'E[X] = np, Var(X) = np(1-p).' },
                { question: 'A call center receives 4 calls per minute on average. Find P(exactly 6 calls in a minute).', hint: 'Use Poisson with λ = 4.' }
              ]
            },
            {
              id: 'ps-d2',
              title: 'The Normal Distribution',
              type: 'theory',
              duration: '25 min',
              content: `## The Normal Distribution

The **normal distribution** (Gaussian) is the most important continuous distribution in statistics. It's characterized by its symmetric, bell-shaped curve.

### Probability Density Function

The PDF of a normal distribution with mean μ and standard deviation σ is:

**f(x) = (1 / (σ√(2π))) × e^(-(x-μ)²/(2σ²))**

### Properties

1. **Symmetric** about the mean μ
2. **Bell-shaped** curve
3. Mean = Median = Mode = μ
4. Completely determined by μ and σ
5. **Empirical Rule (68-95-99.7)**:
   - 68% of data within 1σ of μ
   - 95% of data within 2σ of μ
   - 99.7% of data within 3σ of μ

### Standard Normal Distribution

The standard normal (Z) has μ = 0 and σ = 1:

**Z = (X - μ) / σ**

This "standardizes" any normal random variable.

### Finding Probabilities

Use the standard normal table or calculator:

**P(a < X < b) = P((a-μ)/σ < Z < (b-μ)/σ)**

### Why Is It So Important?

1. **Central Limit Theorem**: Sum of many independent random variables is approximately normal
2. **Natural phenomena**: Heights, weights, errors, measurements often follow normal distribution
3. **Statistical inference**: Many tests assume normality

### Example: SAT Scores

SAT scores are approximately normal with μ = 1000 and σ = 200.

What percentage of students score above 1300?

Z = (1300 - 1000) / 200 = 1.5

P(Z > 1.5) ≈ 0.0668 or about 6.68%

What score is needed to be in the top 10%?

P(Z > z) = 0.10 → z ≈ 1.28

X = μ + zσ = 1000 + 1.28(200) = 1256`,
              keyPoints: [
                'Normal distribution is symmetric and bell-shaped',
                'Defined by mean μ and standard deviation σ',
                '68-95-99.7 rule for 1, 2, 3 standard deviations',
                'Standardize: Z = (X - μ) / σ',
                'Central Limit Theorem explains its ubiquity'
              ],
              formula: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
              workedExample: {
                problem: 'Heights of adult women are normally distributed with μ = 64 inches and σ = 2.5 inches.\n\n(a) What percentage of women are taller than 68 inches?\n(b) What height corresponds to the 90th percentile?\n(c) What is the probability a randomly selected woman is between 62 and 66 inches tall?',
                solution: [
                  'Given: X ~ Normal(μ = 64, σ = 2.5)',
                  '',
                  'Part (a): P(X > 68)',
                  'Standardize: Z = (68 - 64) / 2.5 = 4/2.5 = 1.6',
                  '',
                  'Using standard normal table:',
                  'P(Z > 1.6) = 1 - P(Z < 1.6) = 1 - 0.9452 = 0.0548',
                  '',
                  'About 5.48% of women are taller than 68 inches.',
                  '',
                  'Part (b): 90th percentile',
                  'Find z such that P(Z < z) = 0.90',
                  'From table: z ≈ 1.28',
                  '',
                  'Convert back: X = μ + zσ = 64 + 1.28(2.5) = 64 + 3.2 = 67.2 inches',
                  '',
                  'A woman must be at least 67.2 inches tall to be in the 90th percentile.',
                  '',
                  'Part (c): P(62 < X < 66)',
                  'Standardize both values:',
                  'z₁ = (62 - 64) / 2.5 = -0.8',
                  'z₂ = (66 - 64) / 2.5 = 0.8',
                  '',
                  'P(-0.8 < Z < 0.8) = P(Z < 0.8) - P(Z < -0.8)',
                  '                    = 0.7881 - 0.2119',
                  '                    = 0.5762',
                  '',
                  'There is a 57.62% probability that a randomly selected woman',
                  'is between 62 and 66 inches tall.'
                ],
                answer: '(a) 5.48%, (b) 67.2 inches, (c) 57.62%'
              },
              applications: [
                'Educational testing: Standardized test scores',
                'Manufacturing: Quality control specifications',
                'Finance: Modeling stock returns',
                'Medicine: Reference ranges for blood tests',
                'Social sciences: Population characteristics'
              ],
              practiceProblems: [
                { question: 'If Z ~ Normal(0,1), find P(-1 < Z < 1).', hint: 'This is the 68% from the empirical rule. Use a table for exact value.' },
                { question: 'IQ scores are normal with μ = 100, σ = 15. What IQ is at the 98th percentile?', hint: 'Find z for P(Z < z) = 0.98, then convert to IQ.' },
                { question: 'Heights of men: μ = 70 inches, σ = 3 inches. What percentage of men are between 67 and 73 inches?', hint: 'Standardize and find the area between z-scores.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'differential-equations',
      title: 'Differential Equations',
      description: 'Solving equations with derivatives',
      icon: 'GitBranch',
      color: 'from-indigo-500 to-purple-500',
      difficulty: 'advanced',
      duration: '15 hours',
      lessons: [
        {
          id: 'de-intro',
          title: 'Introduction to Differential Equations',
          description: 'Understanding what differential equations are',
          duration: '50 min',
          difficulty: 'intermediate',
          content: [
            {
              id: 'de-i1',
              title: 'What is a Differential Equation?',
              type: 'theory',
              duration: '25 min',
              content: `## Understanding Differential Equations

A **differential equation** is an equation that relates a function with its derivatives. These equations describe how quantities change over time or space, making them fundamental to physics, engineering, biology, and economics.

### Types of Differential Equations

**Ordinary Differential Equations (ODEs)**: Involve functions of one variable and their derivatives.

Example: dy/dx = 2x

**Partial Differential Equations (PDEs)**: Involve functions of multiple variables and partial derivatives.

Example: ∂u/∂t = k(∂²u/∂x²) (Heat equation)

### Order of a Differential Equation

The **order** is the highest derivative that appears:

- dy/dx = 2x → First order
- d²y/dx² + dy/dx = 0 → Second order
- d³y/dx³ = y → Third order

### Linear vs Nonlinear

**Linear**: The dependent variable y and its derivatives appear only to the first power and are not multiplied together.

Example: d²y/dx² + 2(dy/dx) + 3y = sin(x)

**Nonlinear**: Contains products of y and its derivatives, or y appears to a power other than 1.

Example: (dy/dx)² + y = 0

### Why Are They Important?

Differential equations model virtually every physical phenomenon:

1. **Newton's Second Law**: F = ma becomes m(d²x/dt²) = F(x, v, t)
2. **Population Growth**: dP/dt = kP
3. **Radioactive Decay**: dN/dt = -λN
4. **Circuit Analysis**: L(dI/dt) + RI = V(t)
5. **Heat Transfer**: ∂u/∂t = α∇²u

### Solutions to Differential Equations

A **solution** is a function that satisfies the equation when substituted.

**General Solution**: Contains arbitrary constants equal to the order
- For first order: one constant C
- For second order: two constants C₁ and C₂

**Particular Solution**: A specific solution with constants determined by initial/boundary conditions.

### Example: Solving a Simple ODE

Solve: dy/dx = 3x²

Separate and integrate:
∫dy = ∫3x² dx
y = x³ + C

The general solution is y = x³ + C, where C is any constant.

If y(0) = 5 (initial condition), then:
5 = 0³ + C → C = 5

Particular solution: y = x³ + 5`,
              keyPoints: [
                'Differential equations relate functions to their derivatives',
                'Order = highest derivative present',
                'Linear equations are easier to solve than nonlinear',
                'General solution has arbitrary constants',
                'Initial conditions determine particular solutions'
              ],
              formula: '\\frac{dy}{dx} = f(x, y)',
              workedExample: {
                problem: 'Solve the differential equation with the given initial condition:\ndy/dx = 2x + 1, y(0) = 3',
                solution: [
                  'Given: dy/dx = 2x + 1',
                  'Initial condition: y(0) = 3',
                  '',
                  'Step 1: Separate variables',
                  'dy = (2x + 1) dx',
                  '',
                  'Step 2: Integrate both sides',
                  '∫dy = ∫(2x + 1) dx',
                  'y = x² + x + C',
                  '',
                  'This is the general solution.',
                  '',
                  'Step 3: Apply initial condition to find C',
                  'y(0) = 3 means when x = 0, y = 3',
                  '3 = 0² + 0 + C',
                  'C = 3',
                  '',
                  'Step 4: Write the particular solution',
                  'y = x² + x + 3',
                  '',
                  'Verification:',
                  'dy/dx = 2x + 1 ✓',
                  'y(0) = 0 + 0 + 3 = 3 ✓'
                ],
                answer: 'y = x² + x + 3'
              },
              applications: [
                'Physics: Motion under forces, oscillations',
                'Biology: Population dynamics, spread of disease',
                'Economics: Market equilibrium, growth models',
                'Engineering: Circuit analysis, control systems',
                'Chemistry: Reaction rates, diffusion'
              ],
              practiceProblems: [
                { question: 'Find the general solution: dy/dx = eˣ.', hint: 'Integrate: y = ∫eˣ dx.' },
                { question: 'Solve: dy/dx = 1/y, y(0) = 1.', hint: 'Separate: y dy = dx, then integrate both sides.' },
                { question: 'A population grows at rate dP/dt = 0.02P. If P(0) = 1000, find P(t).', hint: 'This is exponential growth: dP/P = 0.02 dt.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'complex-analysis',
      title: 'Complex Analysis',
      description: 'Functions of complex variables and contour integration',
      icon: 'Atom',
      color: 'from-violet-500 to-fuchsia-500',
      difficulty: 'advanced',
      duration: '11 hours',
      lessons: [
        {
          id: 'ca-complex-numbers',
          title: 'Complex Numbers',
          description: 'Foundation of complex analysis',
          duration: '45 min',
          difficulty: 'intermediate',
          content: [
            {
              id: 'ca-c1',
              title: 'The Complex Plane',
              type: 'theory',
              duration: '20 min',
              content: `## Complex Numbers

A **complex number** is a number of the form z = a + bi, where a and b are real numbers and i is the imaginary unit with the property i² = -1.

### The Complex Plane

Complex numbers can be visualized on the **complex plane** (Argand diagram):
- The horizontal axis represents the real part (Re)
- The vertical axis represents the imaginary part (Im)

### Polar Form

Any complex number can be written in polar form:

**z = r(cos θ + i sin θ) = re^(iθ)**

where:
- r = |z| = √(a² + b²) is the modulus
- θ = arg(z) = arctan(b/a) is the argument

### Euler's Formula

The remarkable connection between exponentials and trigonometry:

**e^(iθ) = cos θ + i sin θ**

This leads to **Euler's identity**: e^(iπ) + 1 = 0

### Operations

**Addition**: (a + bi) + (c + di) = (a+c) + (b+d)i

**Multiplication**: (a + bi)(c + di) = (ac-bd) + (ad+bc)i

**Division**: Multiply numerator and denominator by conjugate`,
              keyPoints: [
                'Complex numbers: z = a + bi where i² = -1',
                'Complex plane: real axis horizontal, imaginary vertical',
                'Polar form: z = re^(iθ)',
                'Euler\'s formula: e^(iθ) = cos θ + i sin θ',
                'Conjugate: z̄ = a - bi'
              ],
              formula: 'z = re^{i\\theta}, \\quad |z| = \\sqrt{a^2 + b^2}',
              workedExample: {
                problem: 'Convert z = 1 + i to polar form and find z⁵.',
                solution: [
                  'Given: z = 1 + i',
                  '',
                  'Step 1: Find the modulus',
                  'r = |z| = √(1² + 1²) = √2',
                  '',
                  'Step 2: Find the argument',
                  'θ = arctan(1/1) = arctan(1) = π/4',
                  '',
                  'Step 3: Write in polar form',
                  'z = √2 · e^(iπ/4)',
                  '',
                  'Step 4: Calculate z⁵',
                  'z⁵ = (√2)⁵ · e^(i·5π/4)',
                  'z⁵ = 4√2 · e^(i·5π/4)',
                  'z⁵ = 4√2 · [cos(5π/4) + i sin(5π/4)]',
                  'z⁵ = 4√2 · [-√2/2 - i√2/2]',
                  'z⁵ = -4 - 4i'
                ],
                answer: 'z = √2e^(iπ/4), z⁵ = -4 - 4i'
              },
              applications: [
                'Electrical engineering: AC circuit analysis',
                'Quantum mechanics: Wave functions',
                'Signal processing: Fourier transforms',
                'Control systems: Stability analysis'
              ],
              practiceProblems: [
                { question: 'Find the modulus of z = 3 - 4i.', hint: '|z| = √(a² + b²).' },
                { question: 'Express z = 2e^(iπ/3) in standard form a + bi.', hint: 'Use Euler\'s formula: z = r(cos θ + i sin θ).' },
                { question: 'Find all cube roots of 1.', hint: 'Solve z³ = 1 using polar form.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'number-theory',
      title: 'Number Theory',
      description: 'Properties of integers and divisibility',
      icon: 'Hash',
      color: 'from-teal-500 to-cyan-500',
      difficulty: 'intermediate',
      duration: '9 hours',
      lessons: [
        {
          id: 'nt-divisibility',
          title: 'Divisibility and Primes',
          description: 'Fundamental properties of integers',
          duration: '50 min',
          difficulty: 'beginner',
          content: [
            {
              id: 'nt-d1',
              title: 'Divisibility Rules',
              type: 'theory',
              duration: '25 min',
              content: `## Divisibility

We say **a divides b** (written a | b) if there exists an integer k such that b = ak.

### Divisibility Rules

**Divisibility by 2**: Number ends in 0, 2, 4, 6, or 8

**Divisibility by 3**: Sum of digits is divisible by 3

**Divisibility by 4**: Last two digits form a number divisible by 4

**Divisibility by 5**: Number ends in 0 or 5

**Divisibility by 6**: Divisible by both 2 and 3

**Divisibility by 9**: Sum of digits is divisible by 9

### Prime Numbers

A **prime number** is a natural number greater than 1 that has no positive divisors other than 1 and itself.

**Fundamental Theorem of Arithmetic**: Every integer greater than 1 is either prime or can be uniquely expressed as a product of primes.

### Euclidean Algorithm

Finding GCD using the Euclidean algorithm:

gcd(a, b) = gcd(b, a mod b)

Continue until the remainder is 0. The last non-zero remainder is the GCD.

### Example

Find gcd(48, 18):
- 48 = 2 × 18 + 12
- 18 = 1 × 12 + 6
- 12 = 2 × 6 + 0

Therefore, gcd(48, 18) = 6`,
              keyPoints: [
                'a | b means a divides b',
                'Prime numbers have exactly two divisors',
                'Fundamental Theorem: unique prime factorization',
                'Euclidean algorithm finds GCD efficiently',
                'gcd(a, b) × lcm(a, b) = a × b'
              ],
              formula: '\\gcd(a, b) = \\gcd(b, a \\mod b)',
              workedExample: {
                problem: 'Find gcd(252, 105) using the Euclidean algorithm, then express it as a linear combination.',
                solution: [
                  'Euclidean Algorithm:',
                  '252 = 2 × 105 + 42',
                  '105 = 2 × 42 + 21',
                  '42 = 2 × 21 + 0',
                  '',
                  'Therefore, gcd(252, 105) = 21',
                  '',
                  'Extended Euclidean Algorithm (backward substitution):',
                  '21 = 105 - 2 × 42',
                  '21 = 105 - 2 × (252 - 2 × 105)',
                  '21 = 105 - 2 × 252 + 4 × 105',
                  '21 = 5 × 105 - 2 × 252',
                  '',
                  'So 21 = (-2) × 252 + 5 × 105'
                ],
                answer: 'gcd(252, 105) = 21 = (-2)(252) + 5(105)'
              },
              applications: [
                'Cryptography: RSA encryption',
                'Computer science: Hash functions',
                'Coding theory: Error correction',
                'Music theory: Rhythm patterns'
              ],
              practiceProblems: [
                { question: 'Find gcd(84, 63).', hint: 'Use the Euclidean algorithm.' },
                { question: 'Is 901 prime?', hint: 'Check divisibility by primes up to √901 ≈ 30.' },
                { question: 'Find the prime factorization of 360.', hint: 'Divide by small primes: 360 = 2³ × 3² × 5.' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// ============================================
// GEOMETRY COURSES
// ============================================
export const geometryCategory: SubjectCategory = {
  id: 'geometry',
  title: 'Geometry',
  description: 'Explore shapes, spaces, and transformations through visual learning',
  icon: 'Shapes',
  color: 'from-emerald-500 to-teal-500',
  courses: [
    {
      id: 'euclidean-geometry',
      title: 'Euclidean Geometry',
      description: 'Classical geometry of points, lines, and planes',
      icon: 'Triangle',
      color: 'from-emerald-500 to-green-500',
      difficulty: 'beginner',
      duration: '8 hours',
      lessons: [
        {
          id: 'eg-triangles',
          title: 'Triangles and Their Properties',
          description: 'Understanding triangle properties and theorems',
          duration: '60 min',
          difficulty: 'beginner',
          content: [
            {
              id: 'eg-t1',
              title: 'Triangle Fundamentals',
              type: 'theory',
              duration: '30 min',
              content: `## Triangles: The Building Blocks of Geometry

A **triangle** is a polygon with three sides and three angles. Despite their simplicity, triangles are fundamental to geometry and have remarkable properties.

### Basic Properties

1. **Angle Sum**: The three interior angles of any triangle sum to exactly 180°
2. **Triangle Inequality**: The sum of any two sides must be greater than the third side
3. **Exterior Angle**: An exterior angle equals the sum of the two remote interior angles

### Types of Triangles

**By Sides**:
- **Equilateral**: All three sides equal (all angles = 60°)
- **Isosceles**: Two sides equal (angles opposite equal sides are equal)
- **Scalene**: All sides different (all angles different)

**By Angles**:
- **Acute**: All angles < 90°
- **Right**: One angle = 90°
- **Obtuse**: One angle > 90°

### The Pythagorean Theorem

For a right triangle with legs a, b and hypotenuse c:

**a² + b² = c²**

This is one of the most important theorems in mathematics!

**Proof using areas**: 
- Draw squares on each side
- The area of the square on the hypotenuse equals the sum of areas on the other two squares

### Area of a Triangle

**Using base and height**: A = (1/2) × base × height

**Using two sides and included angle**: A = (1/2)ab sin(C)

**Heron's formula**: A = √(s(s-a)(s-b)(s-c))
where s = (a+b+c)/2 is the semi-perimeter

### Special Right Triangles

**45°-45°-90° Triangle**:
- Two equal legs
- Hypotenuse = leg × √2

**30°-60°-90° Triangle**:
- Sides are in ratio 1 : √3 : 2
- Short leg : long leg : hypotenuse

### Similar Triangles

Two triangles are **similar** if their corresponding angles are equal (and thus their corresponding sides are proportional).

**Similarity Criteria**:
- **AA**: Two angles match
- **SSS**: All three sides are proportional
- **SAS**: Two sides proportional and included angle equal`,
              keyPoints: [
                'Triangle angles sum to 180°',
                'Pythagorean theorem: a² + b² = c² for right triangles',
                'Area = (1/2) × base × height',
                'Similar triangles have equal angles and proportional sides',
                'Special triangles: 45-45-90 and 30-60-90 have exact ratios'
              ],
              formula: 'a^2 + b^2 = c^2, \\quad A = \\frac{1}{2}bh',
              workedExample: {
                problem: 'A ladder 13 feet long leans against a wall. The foot of the ladder is 5 feet from the wall.\n\n(a) How high up the wall does the ladder reach?\n(b) What angle does the ladder make with the ground?',
                solution: [
                  'This creates a right triangle with:',
                  '- Hypotenuse (ladder) = 13 feet',
                  '- Base (distance from wall) = 5 feet',
                  '- Height = ? (this is what we need)',
                  '',
                  'Part (a): Find the height',
                  'Using the Pythagorean theorem:',
                  'a² + b² = c²',
                  'h² + 5² = 13²',
                  'h² + 25 = 169',
                  'h² = 169 - 25 = 144',
                  'h = √144 = 12 feet',
                  '',
                  'The ladder reaches 12 feet up the wall.',
                  '',
                  'Part (b): Find the angle with the ground',
                  'cos(θ) = adjacent/hypotenuse = 5/13',
                  'θ = cos⁻¹(5/13)',
                  'θ ≈ 67.4°',
                  '',
                  'Or using tangent:',
                  'tan(θ) = opposite/adjacent = 12/5 = 2.4',
                  'θ = tan⁻¹(2.4) ≈ 67.4°',
                  '',
                  'The ladder makes an angle of approximately 67.4° with the ground.'
                ],
                answer: '(a) 12 feet high, (b) ≈ 67.4° angle with ground'
              },
              applications: [
                'Architecture: Roof pitches, structural design',
                'Navigation: Triangulation for GPS',
                'Surveying: Measuring distances and heights',
                'Construction: Building stable structures',
                'Art: Perspective drawing'
              ],
              practiceProblems: [
                { question: 'A right triangle has legs 6 and 8. Find the hypotenuse.', hint: 'Use a² + b² = c².' },
                { question: 'Find the area of a triangle with sides 5, 6, 7 using Heron\'s formula.', hint: 's = (5+6+7)/2 = 9, then A = √(9×4×3×2).' },
                { question: 'In a 30-60-90 triangle, the short leg is 5. Find the long leg and hypotenuse.', hint: 'Long leg = 5√3, hypotenuse = 10.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'analytic-geometry',
      title: 'Analytic Geometry',
      description: 'Geometry using coordinate systems',
      icon: 'Grid',
      color: 'from-teal-500 to-cyan-500',
      difficulty: 'intermediate',
      duration: '7 hours',
      lessons: [
        {
          id: 'ag-coordinate-systems',
          title: 'Coordinate Systems',
          description: 'Different ways to locate points',
          duration: '40 min',
          difficulty: 'beginner',
          content: [
            {
              id: 'ag-cs1',
              title: 'Cartesian Coordinates',
              type: 'theory',
              duration: '15 min',
              content: `## Cartesian Coordinate System

The **Cartesian coordinate system** uses perpendicular axes to locate points in a plane or space.

### 2D Coordinates

A point in the plane is represented as (x, y):
- x: horizontal distance from the origin
- y: vertical distance from the origin

### 3D Coordinates

A point in space is represented as (x, y, z):
- x: distance along the x-axis
- y: distance along the y-axis  
- z: distance along the z-axis

### Distance Formula

Distance between points P₁(x₁, y₁) and P₂(x₂, y₂):

**d = √[(x₂-x₁)² + (y₂-y₁)²]**

In 3D: **d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]**

### Midpoint Formula

Midpoint M between P₁ and P₂:

**M = ((x₁+x₂)/2, (y₁+y₂)/2)**`,
              keyPoints: [
                'Cartesian coordinates use perpendicular axes',
                '2D: (x, y), 3D: (x, y, z)',
                'Distance formula from Pythagorean theorem',
                'Midpoint formula averages coordinates'
              ],
              formula: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
              workedExample: {
                problem: 'Find the distance between A(1, 2) and B(4, 6). Find the midpoint.',
                solution: [
                  'Given: A(1, 2) and B(4, 6)',
                  '',
                  'Distance:',
                  'd = √[(4-1)² + (6-2)²]',
                  'd = √[9 + 16]',
                  'd = √25 = 5',
                  '',
                  'Midpoint:',
                  'M = ((1+4)/2, (2+6)/2)',
                  'M = (2.5, 4)'
                ],
                answer: 'Distance = 5 units, Midpoint = (2.5, 4)'
              },
              applications: [
                'GPS navigation systems',
                'Computer graphics positioning',
                'Robotics path planning',
                'Game development'
              ],
              practiceProblems: [
                { question: 'Find the distance from origin to (3, 4).', hint: 'Use d = √(3² + 4²).' },
                { question: 'If midpoint is (5, 5) and one endpoint is (3, 4), find the other.', hint: 'Use midpoint formula backwards.' },
                { question: 'Find the perimeter of triangle with vertices (0,0), (3,0), (0,4).', hint: 'Calculate all three sides.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'differential-geometry',
      title: 'Differential Geometry',
      description: 'Geometry using calculus methods',
      icon: 'Waves',
      color: 'from-green-500 to-emerald-500',
      difficulty: 'advanced',
      duration: '14 hours',
      lessons: [
        {
          id: 'dg-curves',
          title: 'Curves and Curvature',
          description: 'Local properties of curves',
          duration: '60 min',
          difficulty: 'advanced',
          content: [
            {
              id: 'dg-c1',
              title: 'Parametric Curves',
              type: 'theory',
              duration: '25 min',
              content: `## Parametric Curves

A **parametric curve** is defined by giving each coordinate as a function of a parameter t:

**r(t) = (x(t), y(t))** in 2D
**r(t) = (x(t), y(t), z(t))** in 3D

### Tangent Vector

The derivative r'(t) gives the tangent vector:
- Points in the direction of motion
- Its magnitude is the speed

### Arc Length

The length of a curve from t=a to t=b:

**s = ∫[a to b] |r'(t)| dt**

### Curvature

Curvature κ measures how fast a curve changes direction:

**κ = |r'(t) × r''(t)| / |r'(t)|³**

For a circle of radius R: κ = 1/R

### Examples

**Circle**: r(t) = (cos t, sin t)
- r'(t) = (-sin t, cos t)
- |r'(t)| = 1 (constant speed)
- Curvature κ = 1 (constant curvature)

**Helix**: r(t) = (cos t, sin t, t)
- Curves upward while circling`,
              keyPoints: [
                'Parametric curves use a parameter t',
                'Tangent vector: r\'(t) gives direction of motion',
                'Arc length: integral of speed',
                'Curvature: measure of direction change rate'
              ],
              formula: '\\kappa = \\frac{|\\vec{r}\' \\times \\vec{r}\'\'|}{|\\vec{r}\'|^3}',
              workedExample: {
                problem: 'Find the arc length of the helix r(t) = (cos t, sin t, t) from t=0 to t=2π.',
                solution: [
                  'Given: r(t) = (cos t, sin t, t)',
                  '',
                  'Step 1: Find r\'(t)',
                  'r\'(t) = (-sin t, cos t, 1)',
                  '',
                  'Step 2: Find |r\'(t)|',
                  '|r\'(t)| = √(sin²t + cos²t + 1) = √2',
                  '',
                  'Step 3: Calculate arc length',
                  's = ∫₀^(2π) √2 dt = √2 · 2π = 2π√2',
                  '',
                  'The helix makes one complete turn',
                  'and rises 2π units in the z-direction.'
                ],
                answer: 'Arc length = 2π√2 ≈ 8.89 units'
              },
              applications: [
                'Robotics: Path planning for manipulators',
                'Computer graphics: Curve design',
                'Physics: Trajectory analysis',
                'Architecture: Spiral structures'
              ],
              practiceProblems: [
                { question: 'Find the arc length of r(t) = (t, t²) from t=0 to t=1.', hint: '|r\'(t)| = √(1 + 4t²).' },
                { question: 'Find the curvature of r(t) = (t², t) at t=1.', hint: 'Use the 2D curvature formula.' },
                { question: 'Show that a straight line has zero curvature.', hint: 'r(t) = (at + b, ct + d) has r\'\'(t) = 0.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'topology',
      title: 'Topology Fundamentals',
      description: 'Properties preserved under continuous deformation',
      icon: 'CircleDot',
      color: 'from-lime-500 to-green-500',
      difficulty: 'advanced',
      duration: '9 hours',
      lessons: [
        {
          id: 'top-basics',
          title: 'Topological Spaces',
          description: 'Foundation of topology',
          duration: '50 min',
          difficulty: 'advanced',
          content: [
            {
              id: 'top-b1',
              title: 'What is Topology?',
              type: 'theory',
              duration: '25 min',
              content: `## Topology

**Topology** studies properties that remain unchanged under continuous deformations—stretching, bending, but not tearing or gluing.

### Topological Spaces

A **topological space** is a set X together with a collection of "open sets" satisfying:
1. The empty set and X itself are open
2. Any union of open sets is open
3. Any finite intersection of open sets is open

### Homeomorphisms

Two spaces are **homeomorphic** if there's a continuous bijection with continuous inverse.

Classic joke: "A topologist can't tell a coffee cup from a donut"—both have one hole!

### Topological Invariants

Properties that homeomorphic spaces share:
- **Connectedness**: Can the space be split into two disjoint open sets?
- **Compactness**: Can the space be covered by finitely many open sets?
- **Genus**: Number of "holes" (torus has genus 1)
- **Euler characteristic**: χ = V - E + F for polyhedra

### Euler Characteristic

For a polyhedron:
**χ = V - E + F**

where V = vertices, E = edges, F = faces

- Sphere: χ = 2
- Torus: χ = 0
- Klein bottle: χ = 0`,
              keyPoints: [
                'Topology studies properties preserved under continuous deformation',
                'Homeomorphic spaces are "the same" topologically',
                'Euler characteristic: χ = V - E + F',
                'Sphere has χ = 2, torus has χ = 0',
                'Genus = number of holes'
              ],
              formula: '\\chi = V - E + F',
              workedExample: {
                problem: 'Verify Euler\'s formula for a cube and a tetrahedron.',
                solution: [
                  'Cube:',
                  'V = 8 vertices',
                  'E = 12 edges',
                  'F = 6 faces',
                  'χ = 8 - 12 + 6 = 2 ✓',
                  '',
                  'Tetrahedron:',
                  'V = 4 vertices',
                  'E = 6 edges',
                  'F = 4 faces',
                  'χ = 4 - 6 + 4 = 2 ✓',
                  '',
                  'Both are topologically equivalent to a sphere (χ = 2).'
                ],
                answer: 'Both have Euler characteristic χ = 2'
              },
              applications: [
                'Data analysis: Persistent homology',
                'Physics: Topological insulators',
                'Robotics: Configuration spaces',
                'Biology: DNA topology'
              ],
              practiceProblems: [
                { question: 'Find χ for a square pyramid.', hint: 'V = 5, E = 8, F = 5.' },
                { question: 'A surface has χ = 0. What could it be?', hint: 'Torus or Klein bottle have χ = 0.' },
                { question: 'How many holes does a pretzel shape have if χ = -2?', hint: 'χ = 2 - 2g, solve for genus g.' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// ============================================
// CALCULUS COURSES
// ============================================
export const calculusCategory: SubjectCategory = {
  id: 'calculus',
  title: 'Calculus',
  description: 'Limits, derivatives, integrals and their applications',
  icon: 'TrendingUp',
  color: 'from-purple-500 to-pink-500',
  courses: [
    {
      id: 'calculus-1',
      title: 'Calculus I: Limits & Derivatives',
      description: 'Foundation of differential calculus',
      icon: 'ArrowUpRight',
      color: 'from-purple-500 to-violet-500',
      difficulty: 'beginner',
      duration: '11 hours',
      lessons: [
        {
          id: 'c1-derivatives',
          title: 'Understanding Derivatives',
          description: 'The derivative as rate of change',
          duration: '60 min',
          difficulty: 'beginner',
          content: [
            {
              id: 'c1-d1',
              title: 'The Concept of Derivative',
              type: 'theory',
              duration: '30 min',
              content: `## What is a Derivative?

The **derivative** is one of the most powerful concepts in mathematics. It measures how a function changes as its input changes—the rate of change or the slope of a curve.

### The Definition

The derivative of f(x) at point a is:

**f'(a) = lim(h→0) [f(a+h) - f(a)] / h**

This limit represents:
1. The slope of the tangent line at x = a
2. The instantaneous rate of change at x = a
3. How fast f is changing when x = a

### Geometric Interpretation

Imagine zooming in on a curve at a point. As you zoom in more and more, the curve starts to look like a straight line. The slope of that line is the derivative!

### Physical Interpretation

If s(t) is position as a function of time:
- **s'(t) = v(t)** — velocity (rate of change of position)
- **s''(t) = a(t)** — acceleration (rate of change of velocity)

### Basic Derivative Rules

1. **Power Rule**: d/dx(xⁿ) = nxⁿ⁻¹
   - d/dx(x³) = 3x²
   - d/dx(x⁵) = 5x⁴

2. **Constant Rule**: d/dx(c) = 0
   - d/dx(5) = 0

3. **Sum Rule**: d/dx(f + g) = f' + g'
   - d/dx(x² + 3x) = 2x + 3

4. **Product Rule**: d/dx(fg) = f'g + fg'
   - d/dx(x²·eˣ) = 2x·eˣ + x²·eˣ

5. **Quotient Rule**: d/dx(f/g) = (f'g - fg')/g²

6. **Chain Rule**: d/dx(f(g(x))) = f'(g(x))·g'(x)
   - d/dx(sin(x²)) = cos(x²)·2x

### Why Derivatives Matter

1. **Optimization**: Find maximum and minimum values
2. **Physics**: Velocity, acceleration, force
3. **Economics**: Marginal cost, marginal revenue
4. **Engineering**: Rates of change in systems
5. **Machine Learning**: Gradient descent for training

### Example: Finding a Derivative

Find d/dx(3x⁴ - 2x² + 5x - 7)

Using the rules:
- d/dx(3x⁴) = 3·4x³ = 12x³
- d/dx(-2x²) = -2·2x = -4x
- d/dx(5x) = 5
- d/dx(-7) = 0

**Answer: f'(x) = 12x³ - 4x + 5**`,
              keyPoints: [
                'Derivative = rate of change = slope of tangent line',
                'Definition: f\'(x) = lim(h→0) [f(x+h)-f(x)]/h',
                'Power rule: d/dx(xⁿ) = nxⁿ⁻¹',
                'Chain rule for composite functions',
                'Derivatives enable optimization and modeling'
              ],
              formula: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
              workedExample: {
                problem: 'A ball is thrown upward with height function h(t) = -16t² + 64t + 5 feet.\n\n(a) Find the velocity function v(t).\n(b) When does the ball reach maximum height?\n(c) What is the maximum height?',
                solution: [
                  'Given: h(t) = -16t² + 64t + 5',
                  '',
                  'Part (a): Find velocity v(t) = h\'(t)',
                  'Using the power rule:',
                  'v(t) = d/dt(-16t² + 64t + 5)',
                  'v(t) = -32t + 64 ft/s',
                  '',
                  'Part (b): Maximum height occurs when velocity = 0',
                  'v(t) = 0',
                  '-32t + 64 = 0',
                  '32t = 64',
                  't = 2 seconds',
                  '',
                  'The ball reaches maximum height at t = 2 seconds.',
                  '',
                  'Part (c): Find maximum height h(2)',
                  'h(2) = -16(2)² + 64(2) + 5',
                  'h(2) = -16(4) + 128 + 5',
                  'h(2) = -64 + 128 + 5',
                  'h(2) = 69 feet',
                  '',
                  'Maximum height is 69 feet at t = 2 seconds.',
                  '',
                  'Verification: At t = 2, v(2) = -32(2) + 64 = 0 ✓',
                  '(Velocity is zero at the peak)'
                ],
                answer: '(a) v(t) = -32t + 64 ft/s, (b) t = 2 seconds, (c) 69 feet'
              },
              applications: [
                'Physics: Motion analysis (position → velocity → acceleration)',
                'Economics: Marginal analysis (cost, revenue, profit)',
                'Biology: Population growth rates',
                'Engineering: Signal processing, control systems',
                'Machine Learning: Gradient descent optimization'
              ],
              practiceProblems: [
                { question: 'Find d/dx(x⁵ - 3x³ + 2x - 1).', hint: 'Apply power rule to each term.' },
                { question: 'If f(x) = x² + 3x, find the equation of the tangent line at x = 1.', hint: 'Find f(1) and f\'(1), then use point-slope form.' },
                { question: 'A particle moves with s(t) = t³ - 6t² + 9t + 2. When is it moving backward (v < 0)?', hint: 'Find v(t), then solve v(t) < 0.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'calculus-2',
      title: 'Calculus II: Integration',
      description: 'Integrals and their applications',
      icon: 'ArrowDownRight',
      color: 'from-violet-500 to-fuchsia-500',
      difficulty: 'intermediate',
      duration: '13 hours',
      lessons: [
        {
          id: 'c2-integrals',
          title: 'The Integral',
          description: 'Understanding integration',
          duration: '60 min',
          difficulty: 'intermediate',
          content: [
            {
              id: 'c2-i1',
              title: 'The Definite Integral',
              type: 'theory',
              duration: '30 min',
              content: `## Integration

Integration is the inverse operation of differentiation. The **integral** represents the accumulated area under a curve.

### The Definite Integral

The definite integral from a to b:

**∫[a to b] f(x) dx**

This represents the signed area between the curve y = f(x) and the x-axis from x = a to x = b.

### Fundamental Theorem of Calculus

If F is an antiderivative of f (meaning F' = f), then:

**∫[a to b] f(x) dx = F(b) - F(a)**

This connects differentiation and integration!

### Basic Integration Rules

1. **Power Rule**: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (for n ≠ -1)

2. **Constant Multiple**: ∫cf(x) dx = c∫f(x) dx

3. **Sum Rule**: ∫[f(x) + g(x)] dx = ∫f(x) dx + ∫g(x) dx

4. **Exponential**: ∫eˣ dx = eˣ + C

5. **Natural Log**: ∫(1/x) dx = ln|x| + C

### Common Antiderivatives

- ∫cos(x) dx = sin(x) + C
- ∫sin(x) dx = -cos(x) + C
- ∫sec²(x) dx = tan(x) + C`,
              keyPoints: [
                'Integration is the inverse of differentiation',
                'Definite integral gives signed area under curve',
                'Fundamental Theorem: ∫f dx = F(b) - F(a)',
                'Power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C',
                'Don\'t forget the constant of integration!'
              ],
              formula: '\\int_a^b f(x)\\,dx = F(b) - F(a)',
              workedExample: {
                problem: 'Evaluate ∫₀² (3x² - 2x + 1) dx',
                solution: [
                  'Given: ∫₀² (3x² - 2x + 1) dx',
                  '',
                  'Step 1: Find the antiderivative',
                  'F(x) = 3(x³/3) - 2(x²/2) + x = x³ - x² + x',
                  '',
                  'Step 2: Apply the Fundamental Theorem',
                  '∫₀² (3x² - 2x + 1) dx = F(2) - F(0)',
                  '',
                  'F(2) = 2³ - 2² + 2 = 8 - 4 + 2 = 6',
                  'F(0) = 0³ - 0² + 0 = 0',
                  '',
                  '∫₀² (3x² - 2x + 1) dx = 6 - 0 = 6'
                ],
                answer: '∫₀² (3x² - 2x + 1) dx = 6'
              },
              applications: [
                'Physics: Work done by a force',
                'Economics: Total cost from marginal cost',
                'Probability: Expected values',
                'Engineering: Signal energy'
              ],
              practiceProblems: [
                { question: 'Find ∫(x⁴ + 3x² - 5) dx.', hint: 'Apply power rule to each term.' },
                { question: 'Evaluate ∫₀^π sin(x) dx.', hint: 'Antiderivative of sin(x) is -cos(x).' },
                { question: 'Find the area under y = x² from x = 0 to x = 2.', hint: 'Compute ∫₀² x² dx.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'multivariable-calculus',
      title: 'Multivariable Calculus',
      description: 'Functions of several variables',
      icon: 'Box',
      color: 'from-fuchsia-500 to-pink-500',
      difficulty: 'advanced',
      duration: '15 hours',
      lessons: [
        {
          id: 'mc-partial',
          title: 'Partial Derivatives',
          description: 'Derivatives of multivariable functions',
          duration: '50 min',
          difficulty: 'advanced',
          content: [
            {
              id: 'mc-p1',
              title: 'Functions of Several Variables',
              type: 'theory',
              duration: '25 min',
              content: `## Multivariable Functions

A function f(x, y) takes two inputs and produces one output. We can visualize this as a surface in 3D space.

### Partial Derivatives

The **partial derivative** with respect to x measures how f changes as x changes, holding y constant:

**∂f/∂x = lim[h→0] [f(x+h, y) - f(x, y)] / h**

Similarly for y:
**∂f/∂y = lim[h→0] [f(x, y+h) - f(x, y)] / h**

### How to Compute

To find ∂f/∂x:
- Treat y as a constant
- Differentiate with respect to x

**Example**: For f(x, y) = x²y + 3xy²

∂f/∂x = 2xy + 3y² (y is constant)
∂f/∂y = x² + 6xy (x is constant)

### Gradient

The **gradient** vector:
**∇f = (∂f/∂x, ∂f/∂y)**

The gradient points in the direction of steepest increase.

### Higher-Order Partials

Second partial derivatives:
- fₓₓ = ∂²f/∂x²
- fᵧᵧ = ∂²f/∂y²
- fₓᵧ = ∂²f/∂x∂y

**Clairaut's Theorem**: If the mixed partials are continuous, then:
fₓᵧ = fᵧₓ`,
              keyPoints: [
                'Partial derivative: differentiate w.r.t. one variable, hold others constant',
                'Gradient ∇f points in direction of steepest increase',
                'Mixed partials are equal if continuous (Clairaut\'s Theorem)',
                'Level curves: curves where f(x,y) = constant'
              ],
              formula: '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)',
              workedExample: {
                problem: 'Find all first and second partial derivatives of f(x, y) = x³y² + sin(xy).',
                solution: [
                  'Given: f(x, y) = x³y² + sin(xy)',
                  '',
                  'First partials:',
                  '∂f/∂x = 3x²y² + y·cos(xy)',
                  '∂f/∂y = 2x³y + x·cos(xy)',
                  '',
                  'Second partials:',
                  '∂²f/∂x² = 6xy² - y²·sin(xy)',
                  '∂²f/∂y² = 2x³ - x²·sin(xy)',
                  '',
                  'Mixed partials:',
                  '∂²f/∂x∂y = 6x²y + cos(xy) - xy·sin(xy)',
                  '∂²f/∂y∂x = 6x²y + cos(xy) - xy·sin(xy)',
                  '',
                  'Note: The mixed partials are equal (Clairaut\'s Theorem holds).'
                ],
                answer: 'First partials: 3x²y² + y·cos(xy), 2x³y + x·cos(xy). Second partials as shown above.'
              },
              applications: [
                'Physics: Heat equation, wave equation',
                'Economics: Utility functions, production functions',
                'Machine learning: Gradient descent optimization',
                'Computer graphics: Surface normals'
              ],
              practiceProblems: [
                { question: 'Find ∂f/∂x and ∂f/∂y for f(x,y) = x² + y².', hint: 'Treat other variable as constant.' },
                { question: 'Find the gradient of f(x,y) = xe^y.', hint: '∇f = (∂f/∂x, ∂f/∂y).' },
                { question: 'If f(x,y) = ln(x² + y²), verify that fₓₓ + fᵧᵧ = 0.', hint: 'This is Laplace\'s equation.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'vector-calculus',
      title: 'Vector Calculus',
      description: 'Calculus of vector fields',
      icon: 'Wind',
      color: 'from-pink-500 to-rose-500',
      difficulty: 'advanced',
      duration: '12 hours',
      lessons: [
        {
          id: 'vc-theorems',
          title: 'Fundamental Theorems',
          description: 'Green\'s, Stokes\', and Divergence theorems',
          duration: '60 min',
          difficulty: 'advanced',
          content: [
            {
              id: 'vc-t1',
              title: 'Green\'s Theorem',
              type: 'theory',
              duration: '25 min',
              content: `## Vector Calculus Theorems

These theorems connect line integrals, surface integrals, and volume integrals.

### Green's Theorem

For a positively oriented simple closed curve C enclosing region D:

**∮_C (P dx + Q dy) = ∬_D (∂Q/∂x - ∂P/∂y) dA**

This relates a line integral around a closed curve to a double integral over the region inside.

**Example**: Evaluate ∮_C (x² dx + xy dy) where C is the unit circle.

Using Green's Theorem:
∮_C (x² dx + xy dy) = ∬_D (∂(xy)/∂x - ∂(x²)/∂y) dA
                    = ∬_D (y - 0) dA
                    = ∬_D y dA = 0 (symmetry)

### Stokes' Theorem

For a surface S with boundary curve C:

**∮_C F⃗ · dr⃗ = ∬_S (∇ × F⃗) · dS⃗**

The line integral of F around C equals the flux of curl F through S.

### Divergence Theorem

For a solid region E with boundary surface S:

**∭_E (∇ · F⃗) dV = ∬_S F⃗ · dS⃗**

The total divergence inside equals the flux through the boundary.

### Applications

- **Fluid dynamics**: Conservation laws
- **Electromagnetism**: Maxwell's equations
- **Heat transfer**: Flux calculations`,
              keyPoints: [
                'Green\'s Theorem: line integral = double integral of (∂Q/∂x - ∂P/∂y)',
                'Stokes\' Theorem: line integral = surface integral of curl',
                'Divergence Theorem: volume integral of divergence = surface flux',
                'These are all generalizations of the Fundamental Theorem of Calculus'
              ],
              formula: '\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{S}',
              workedExample: {
                problem: 'Use Green\'s Theorem to evaluate ∮_C (y² dx + x² dy) where C is the triangle with vertices (0,0), (2,0), (0,2).',
                solution: [
                  'Given: ∮_C (y² dx + x² dy)',
                  'P = y², Q = x²',
                  '',
                  'Step 1: Compute ∂Q/∂x - ∂P/∂y',
                  '∂Q/∂x = 2x',
                  '∂P/∂y = 2y',
                  '∂Q/∂x - ∂P/∂y = 2x - 2y',
                  '',
                  'Step 2: Set up the double integral',
                  'The region D is: 0 ≤ x ≤ 2, 0 ≤ y ≤ 2-x',
                  '',
                  'Step 3: Evaluate',
                  '∬_D (2x - 2y) dA = ∫₀² ∫₀^(2-x) (2x - 2y) dy dx',
                  '',
                  'Inner integral:',
                  '∫₀^(2-x) (2x - 2y) dy = [2xy - y²]₀^(2-x)',
                  '= 2x(2-x) - (2-x)²',
                  '= 4x - 2x² - 4 + 4x - x²',
                  '= -3x² + 8x - 4',
                  '',
                  'Outer integral:',
                  '∫₀² (-3x² + 8x - 4) dx',
                  '= [-x³ + 4x² - 4x]₀²',
                  '= -8 + 16 - 8 = 0'
                ],
                answer: '∮_C (y² dx + x² dy) = 0'
              },
              applications: [
                'Fluid dynamics: Circulation and flux',
                'Electromagnetism: Maxwell\'s equations',
                'Aerodynamics: Lift calculations',
                'Thermodynamics: Heat flow'
              ],
              practiceProblems: [
                { question: 'Verify Green\'s Theorem for F = (x, -y) around the unit circle.', hint: 'Compute both the line integral and double integral.' },
                { question: 'Use Stokes\' Theorem to evaluate ∮_C F·dr for F = (y, z, x) where C is the unit circle in the xy-plane.', hint: 'curl F = (1, 1, 1), integrate over unit disk.' },
                { question: 'Use the Divergence Theorem for F = (x, y, z) over the unit sphere.', hint: '∇·F = 3, so flux = 3 × volume = 4π.' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// ============================================
// DEEP LEARNING COURSES
// ============================================
export const deepLearningCategory: SubjectCategory = {
  id: 'deep-learning',
  title: 'Deep Learning',
  description: 'Neural networks, machine learning, and AI',
  icon: 'Brain',
  color: 'from-amber-500 to-orange-500',
  courses: [
    {
      id: 'dl-foundations',
      title: 'Deep Learning Foundations',
      description: 'Neural networks and optimization',
      icon: 'Network',
      color: 'from-orange-500 to-amber-500',
      difficulty: 'intermediate',
      duration: '10 hours',
      lessons: [
        {
          id: 'dl-f1',
          title: 'Neural Network Fundamentals',
          description: 'Architecture of neural networks',
          duration: '60 min',
          difficulty: 'beginner',
          content: [
            {
              id: 'dl-f1-1',
              title: 'How Neural Networks Work',
              type: 'theory',
              duration: '30 min',
              content: `## Understanding Neural Networks

Neural networks are computing systems inspired by biological brains. They learn to perform tasks by considering examples, generally without being programmed with task-specific rules.

### The Basic Unit: The Neuron

A single artificial neuron performs a simple computation:

1. **Input**: Receives signals (x₁, x₂, ..., xₙ)
2. **Weights**: Each input has a weight (w₁, w₂, ..., wₙ)
3. **Weighted Sum**: z = Σwᵢxᵢ + b (b is the bias)
4. **Activation**: Output = σ(z) where σ is an activation function

### Activation Functions

**Sigmoid**: σ(z) = 1 / (1 + e⁻ᶻ)
- Output range: (0, 1)
- Good for probability outputs
- Problem: Vanishing gradients

**ReLU (Rectified Linear Unit)**: σ(z) = max(0, z)
- Most popular for hidden layers
- Fast computation
- Solves vanishing gradient problem

**Softmax**: For multi-class classification
- Converts outputs to probabilities that sum to 1

### Network Architecture

**Input Layer**: Receives the raw data
**Hidden Layers**: Perform transformations (the "deep" part)
**Output Layer**: Produces predictions

A "deep" network has multiple hidden layers.

### Forward Propagation

Information flows from input to output:

1. Input data enters the input layer
2. Each neuron computes: output = σ(Σwᵢxᵢ + b)
3. Outputs become inputs to the next layer
4. Final layer produces predictions

### Loss Functions

The loss function measures how wrong the predictions are:

**Mean Squared Error (MSE)**: For regression
L = (1/n)Σ(yᵢ - ŷᵢ)²

**Cross-Entropy**: For classification
L = -Σyᵢlog(ŷᵢ)

### Example: XOR Problem

The XOR function outputs 1 when inputs differ:
- XOR(0, 0) = 0
- XOR(0, 1) = 1
- XOR(1, 0) = 1
- XOR(1, 1) = 0

A single-layer network cannot learn XOR, but a network with one hidden layer can!

**Solution Architecture**:
- 2 inputs → 2 hidden neurons → 1 output
- Hidden layer learns: h₁ = XOR(OR), h₂ = XOR(NAND)
- Output: XOR(h₁, h₂)

This demonstrates why depth matters!`,
              keyPoints: [
                'Neurons compute weighted sums followed by activation',
                'ReLU is the most common activation for hidden layers',
                'Forward propagation moves data input → output',
                'Loss functions measure prediction error',
                'Depth enables learning complex patterns'
              ],
              formula: 'y = \\sigma\\left(\\sum_{i} w_i x_i + b\\right)',
              workedExample: {
                problem: 'A single neuron has:\n- Inputs: x₁ = 0.5, x₂ = 0.8\n- Weights: w₁ = 0.3, w₂ = -0.2\n- Bias: b = 0.1\n- Activation: Sigmoid\n\nCalculate the output of this neuron.',
                solution: [
                  'Given:',
                  'x₁ = 0.5, x₂ = 0.8',
                  'w₁ = 0.3, w₂ = -0.2',
                  'b = 0.1',
                  '',
                  'Step 1: Calculate weighted sum',
                  'z = w₁x₁ + w₂x₂ + b',
                  'z = (0.3)(0.5) + (-0.2)(0.8) + 0.1',
                  'z = 0.15 - 0.16 + 0.1',
                  'z = 0.09',
                  '',
                  'Step 2: Apply sigmoid activation',
                  'σ(z) = 1 / (1 + e⁻ᶻ)',
                  'σ(0.09) = 1 / (1 + e⁻⁰·⁰⁹)',
                  'e⁻⁰·⁰⁹ ≈ 0.914',
                  'σ(0.09) = 1 / (1 + 0.914)',
                  'σ(0.09) = 1 / 1.914',
                  'σ(0.09) ≈ 0.522',
                  '',
                  'Output: y ≈ 0.522',
                  '',
                  'Interpretation: The neuron outputs approximately 0.522,',
                  'which could represent a probability in a classification task.'
                ],
                answer: 'Output ≈ 0.522'
              },
              applications: [
                'Image recognition: Identifying objects in photos',
                'Natural language processing: Translation, sentiment analysis',
                'Speech recognition: Voice assistants',
                'Game AI: AlphaGo, game-playing agents',
                'Medical diagnosis: Disease detection from scans'
              ],
              practiceProblems: [
                { question: 'A neuron has inputs (1, 2), weights (0.5, -0.3), bias 0.2. Find the output using ReLU activation.', hint: 'z = 0.5(1) + (-0.3)(2) + 0.2 = 0.1, then ReLU(0.1) = 0.1.' },
                { question: 'Why is ReLU preferred over sigmoid for hidden layers?', hint: 'Consider gradient flow and computational cost.' },
                { question: 'How many parameters (weights + biases) are in a layer with 10 inputs and 5 neurons?', hint: '10×5 weights + 5 biases = 55 parameters.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'dl-cnn',
      title: 'Convolutional Neural Networks',
      description: 'Image recognition and computer vision',
      icon: 'Layers',
      color: 'from-amber-500 to-yellow-500',
      difficulty: 'intermediate',
      duration: '12 hours',
      lessons: [
        {
          id: 'cnn-conv',
          title: 'Convolution Operations',
          description: 'The building block of CNNs',
          duration: '50 min',
          difficulty: 'intermediate',
          content: [
            {
              id: 'cnn-c1',
              title: 'Understanding Convolution',
              type: 'theory',
              duration: '25 min',
              content: `## Convolutional Neural Networks

CNNs are specialized neural networks designed for processing data with grid-like topology, such as images.

### The Convolution Operation

**Convolution** applies learnable filters (kernels) to input images to detect features.

For an input I and kernel K:

**(I * K)(i, j) = Σ Σ I(i+m, j+n) · K(m, n)**

### Key Concepts

**Stride**: How much the filter moves each step
- Stride 1: Filter moves 1 pixel at a time
- Stride 2: Filter moves 2 pixels (reduces output size)

**Padding**: Adding zeros around the border
- "Valid": No padding
- "Same": Padding to keep output size same as input

**Output Size Formula**:
If input is n×n, filter is f×f, stride s, padding p:

**Output = ⌊(n + 2p - f)/s + 1⌋**

### Pooling Layers

**Max Pooling**: Take maximum value in each window
**Average Pooling**: Take average value in window

Pooling reduces spatial dimensions while retaining important features.

### Typical CNN Architecture

1. **Convolution layers**: Extract features
2. **Activation (ReLU)**: Add non-linearity
3. **Pooling**: Reduce dimensions
4. **Fully connected**: Classification

### Famous Architectures

- **LeNet**: Early digit recognition
- **AlexNet**: ImageNet breakthrough (2012)
- **VGG**: Very deep networks
- **ResNet**: Skip connections for very deep networks
- **Inception**: Multiple filter sizes in parallel`,
              keyPoints: [
                'Convolution applies learnable filters to detect features',
                'Stride controls step size, padding controls output size',
                'Pooling reduces spatial dimensions',
                'Stack conv → ReLU → pool for feature extraction',
                'Deeper layers detect more complex features'
              ],
              formula: '\\text{Output} = \\left\\lfloor \\frac{n + 2p - f}{s} + 1 \\right\\rfloor',
              workedExample: {
                problem: 'A 32×32 image passes through a 5×5 filter with stride 1 and no padding. What is the output size? What if we use stride 2?',
                solution: [
                  'Given: n = 32, f = 5, s = 1, p = 0',
                  '',
                  'Formula: Output = ⌊(n + 2p - f)/s + 1⌋',
                  '',
                  'Case 1: Stride 1',
                  'Output = ⌊(32 + 0 - 5)/1 + 1⌋',
                  'Output = ⌊27 + 1⌋ = 28',
                  '',
                  'So output is 28×28',
                  '',
                  'Case 2: Stride 2',
                  'Output = ⌊(32 + 0 - 5)/2 + 1⌋',
                  'Output = ⌊27/2 + 1⌋',
                  'Output = ⌊13.5 + 1⌋ = 14',
                  '',
                  'So output is 14×14'
                ],
                answer: 'Stride 1: 28×28 output, Stride 2: 14×14 output'
              },
              applications: [
                'Image classification',
                'Object detection',
                'Face recognition',
                'Medical image analysis',
                'Self-driving cars'
              ],
              practiceProblems: [
                { question: 'For a 64×64 input, 3×3 filter, stride 1, padding 1, find output size.', hint: 'Use formula: (64 + 2(1) - 3)/1 + 1 = 64.' },
                { question: 'How many parameters in a 5×5 filter with 3 input channels?', hint: '5 × 5 × 3 = 75 weights + 1 bias = 76 parameters.' },
                { question: 'Why do we use ReLU after convolution?', hint: 'Adds non-linearity, helps with gradient flow.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'dl-transformers',
      title: 'Transformers & Attention',
      description: 'Modern NLP architectures',
      icon: 'Sparkles',
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'advanced',
      duration: '14 hours',
      lessons: [
        {
          id: 'tf-attention',
          title: 'Self-Attention Mechanism',
          description: 'The core of transformers',
          duration: '60 min',
          difficulty: 'advanced',
          content: [
            {
              id: 'tf-a1',
              title: 'Understanding Attention',
              type: 'theory',
              duration: '30 min',
              content: `## The Attention Mechanism

**Attention** allows models to focus on relevant parts of the input when producing output. It's the key innovation behind modern language models.

### Self-Attention

For each input token, we compute three vectors:
- **Query (Q)**: What am I looking for?
- **Key (K)**: What do I contain?
- **Value (V)**: What information do I provide?

### Scaled Dot-Product Attention

**Attention(Q, K, V) = softmax(QKᵀ/√d_k)V**

where d_k is the dimension of the key vectors.

### Multi-Head Attention

Instead of single attention, we run multiple attention operations in parallel:

**MultiHead(Q, K, V) = Concat(head₁, ..., head_h)W^O**

where head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)

### Why Scale by √d_k?

For large d_k, dot products grow large, pushing softmax into regions with small gradients. Scaling prevents this.

### Positional Encoding

Since attention has no notion of position, we add positional encodings:

**PE(pos, 2i) = sin(pos/10000^(2i/d))**
**PE(pos, 2i+1) = cos(pos/10000^(2i/d))**

### GPT vs BERT

**GPT**: Decoder-only, generates text left-to-right
**BERT**: Encoder-only, bidirectional understanding`,
              keyPoints: [
                'Attention allows focusing on relevant input parts',
                'Q, K, V: Query, Key, Value vectors',
                'Scaled dot-product: softmax(QKᵀ/√d_k)V',
                'Multi-head attention runs parallel attentions',
                'Positional encoding adds position information'
              ],
              formula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
              workedExample: {
                problem: 'For Q = [[1, 0], [0, 1]], K = [[1, 0], [1, 1]], V = [[1, 2], [3, 4]], compute the attention output. Assume d_k = 2.',
                solution: [
                  'Step 1: Compute QKᵀ',
                  'QKᵀ = [[1, 0], [0, 1]] × [[1, 1], [0, 1]]',
                  'QKᵀ = [[1, 1], [0, 1]]',
                  '',
                  'Step 2: Scale by √d_k = √2 ≈ 1.414',
                  'QKᵀ/√d_k = [[0.707, 0.707], [0, 0.707]]',
                  '',
                  'Step 3: Apply softmax row-wise',
                  'softmax([0.707, 0.707]) = [0.5, 0.5]',
                  'softmax([0, 0.707]) = [0.33, 0.67]',
                  '',
                  'Step 4: Multiply by V',
                  'Output[0] = 0.5[1,2] + 0.5[3,4] = [2, 3]',
                  'Output[1] = 0.33[1,2] + 0.67[3,4] = [2.33, 3.33]'
                ],
                answer: 'Attention output ≈ [[2, 3], [2.33, 3.33]]'
              },
              applications: [
                'Large language models (GPT, BERT, LLaMA)',
                'Machine translation',
                'Text summarization',
                'Question answering',
                'Image generation (ViT, DALL-E)'
              ],
              practiceProblems: [
                { question: 'Why do we scale attention scores by √d_k?', hint: 'Consider gradient flow in softmax.' },
                { question: 'How many attention heads does BERT-base use?', hint: 'BERT-base has 12 heads.' },
                { question: 'What is the difference between self-attention and cross-attention?', hint: 'Self-attention: Q, K, V from same source. Cross-attention: Q from decoder, K, V from encoder.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'dl-gans',
      title: 'Generative Adversarial Networks',
      description: 'Image generation and creative AI',
      icon: 'CircleDot',
      color: 'from-orange-500 to-red-500',
      difficulty: 'advanced',
      duration: '9 hours',
      lessons: [
        {
          id: 'gan-basics',
          title: 'GAN Fundamentals',
          description: 'Generator and discriminator',
          duration: '55 min',
          difficulty: 'advanced',
          content: [
            {
              id: 'gan-b1',
              title: 'The GAN Framework',
              type: 'theory',
              duration: '25 min',
              content: `## Generative Adversarial Networks

GANs consist of two neural networks competing against each other:
- **Generator (G)**: Creates fake samples
- **Discriminator (D)**: Distinguishes real from fake

### The Adversarial Game

**Generator's Goal**: Create samples so realistic that D can't tell they're fake
**Discriminator's Goal**: Correctly classify real vs. fake

### The Loss Function

**Min-Max Objective**:

**min_G max_D V(D, G) = E[log D(x)] + E[log(1 - D(G(z)))]**

where:
- x: real data
- z: random noise
- G(z): generated sample
- D(x): probability x is real

### Training Process

1. Train Discriminator:
   - Update D to maximize log(D(x)) + log(1 - D(G(z)))

2. Train Generator:
   - Update G to minimize log(1 - D(G(z)))
   - Alternative: Maximize log(D(G(z))) (better gradients)

### Common Issues

**Mode Collapse**: Generator produces limited variety
**Vanishing Gradients**: Discriminator too strong
**Training Instability**: Difficult to balance G and D

### Famous GAN Variants

- **DCGAN**: Convolutional architecture
- **StyleGAN**: High-quality image synthesis
- **CycleGAN**: Image-to-image translation
- **BigGAN**: Large-scale generation`,
              keyPoints: [
                'GANs: Generator vs Discriminator competition',
                'Generator creates, Discriminator evaluates',
                'Min-max game equilibrium = realistic generation',
                'Mode collapse: generator produces limited variety',
                'Balance G and D for stable training'
              ],
              formula: '\\min_G \\max_D V(D, G) = \\mathbb{E}[\\log D(x)] + \\mathbb{E}[\\log(1 - D(G(z)))]',
              workedExample: {
                problem: 'If D outputs 0.7 for a real image and 0.4 for a generated image, calculate the discriminator loss using binary cross-entropy.',
                solution: [
                  'Discriminator Loss = -[log(D(x)) + log(1 - D(G(z)))]',
                  '',
                  'For real image (label = 1):',
                  'Loss_real = -log(0.7) ≈ 0.357',
                  '',
                  'For fake image (label = 0):',
                  'Loss_fake = -log(1 - 0.4) = -log(0.6) ≈ 0.511',
                  '',
                  'Total discriminator loss:',
                  'L_D = Loss_real + Loss_fake',
                  'L_D = 0.357 + 0.511 = 0.868',
                  '',
                  'A lower loss indicates better discriminator performance.',
                  'D is correctly identifying real as real (0.7) and',
                  'fake as somewhat fake (0.4).'
                ],
                answer: 'Discriminator loss = 0.868'
              },
              applications: [
                'Image synthesis (faces, art, photos)',
                'Image-to-image translation',
                'Super-resolution',
                'Data augmentation',
                'Video generation'
              ],
              practiceProblems: [
                { question: 'If G generates perfect images, what should D output?', hint: 'D should output 0.5 for both real and fake (cannot distinguish).' },
                { question: 'Why does mode collapse happen?', hint: 'Generator finds few modes that fool D reliably.' },
                { question: 'What is the generator\'s loss when D outputs 0.1 for G(z)?', hint: 'Generator wants D(G(z)) to be high. Loss = -log(0.1) ≈ 2.3.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'dl-reinforcement',
      title: 'Reinforcement Learning',
      description: 'Learning from interaction',
      icon: 'Zap',
      color: 'from-red-500 to-pink-500',
      difficulty: 'expert',
      duration: '12 hours',
      lessons: [
        {
          id: 'rl-basics',
          title: 'RL Fundamentals',
          description: 'Agents, environments, rewards',
          duration: '60 min',
          difficulty: 'expert',
          content: [
            {
              id: 'rl-b1',
              title: 'Markov Decision Processes',
              type: 'theory',
              duration: '30 min',
              content: `## Reinforcement Learning

In RL, an **agent** learns to make decisions by interacting with an **environment** to maximize cumulative **reward**.

### Markov Decision Process (MDP)

An MDP is defined by (S, A, P, R, γ):
- **S**: Set of states
- **A**: Set of actions
- **P(s'|s,a)**: Transition probability
- **R(s,a,s')**: Reward function
- **γ**: Discount factor (0 ≤ γ < 1)

### Key Concepts

**Policy π**: Mapping from states to actions
- Deterministic: π(s) = a
- Stochastic: π(a|s) = probability of action a in state s

**Value Function V^π(s)**: Expected cumulative reward from state s following policy π

**V^π(s) = E[Σ γ^t R_t | s₀ = s, π]**

**Q-Function Q^π(s,a)**: Value of taking action a in state s

**Q^π(s,a) = R(s,a) + γ Σ P(s'|s,a) V^π(s')**

### Bellman Equations

**V^π(s) = Σ π(a|s) [R(s,a) + γ Σ P(s'|s,a) V^π(s')]**

### Q-Learning

Update rule:

**Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)]**

This learns the optimal Q-function without needing a model!`,
              keyPoints: [
                'RL: Agent learns by interacting with environment',
                'MDP: (States, Actions, Transitions, Rewards, Discount)',
                'Policy π: Strategy for choosing actions',
                'Value V(s): Expected future reward from state',
                'Q-Learning: Learn optimal policy without model'
              ],
              formula: 'Q(s,a) \\leftarrow Q(s,a) + \\alpha[r + \\gamma \\max_{a\'} Q(s\',a\') - Q(s,a)]',
              workedExample: {
                problem: 'In Q-learning, if Q(s,a) = 5, the reward is 2, γ = 0.9, and max Q(s\',a\') = 10, compute the new Q-value with learning rate α = 0.1.',
                solution: [
                  'Given:',
                  'Q(s,a) = 5',
                  'r = 2',
                  'γ = 0.9',
                  'max Q(s\',a\') = 10',
                  'α = 0.1',
                  '',
                  'Q-Learning update:',
                  'Q_new = Q_old + α[r + γ·max Q(s\',a\') - Q_old]',
                  '',
                  'Target = r + γ·max Q(s\',a\')',
                  'Target = 2 + 0.9 × 10 = 2 + 9 = 11',
                  '',
                  'TD Error = Target - Q_old = 11 - 5 = 6',
                  '',
                  'Update:',
                  'Q_new = 5 + 0.1 × 6',
                  'Q_new = 5 + 0.6 = 5.6'
                ],
                answer: 'New Q(s,a) = 5.6'
              },
              applications: [
                'Game AI (AlphaGo, Atari)',
                'Robotics control',
                'Autonomous vehicles',
                'Recommendation systems',
                'Resource management'
              ],
              practiceProblems: [
                { question: 'What is the role of the discount factor γ?', hint: 'It determines how much we value future vs immediate rewards.' },
                { question: 'Why do we use ε-greedy exploration?', hint: 'Balance exploitation (best known action) with exploration (try new actions).' },
                { question: 'In deep Q-networks (DQN), what problem does experience replay solve?', hint: 'Breaks correlation between consecutive samples.' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// All categories combined
export const allCategories = [
  mathematicsCategory,
  geometryCategory,
  calculusCategory,
  deepLearningCategory,
];

// Store interface
interface CourseStore {
  currentCategoryId: string | null;
  currentCourseId: string | null;
  currentLessonId: string | null;
  currentContentId: string | null;
  
  // Actions
  setCategory: (categoryId: string | null) => void;
  setCourse: (courseId: string | null) => void;
  setLesson: (lessonId: string | null) => void;
  setContent: (contentId: string | null) => void;
  
  // Getters
  getCurrentCategory: () => SubjectCategory | undefined;
  getCurrentCourse: () => Course | undefined;
  getCurrentLesson: () => Lesson | undefined;
  getCurrentContent: () => LessonContent | undefined;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  currentCategoryId: null,
  currentCourseId: null,
  currentLessonId: null,
  currentContentId: null,
  
  setCategory: (categoryId) => set({ currentCategoryId: categoryId }),
  setCourse: (courseId) => set({ currentCourseId: courseId }),
  setLesson: (lessonId) => set({ currentLessonId: lessonId }),
  setContent: (contentId) => set({ currentContentId: contentId }),
  
  getCurrentCategory: () => {
    const { currentCategoryId } = get();
    return allCategories.find(c => c.id === currentCategoryId);
  },
  
  getCurrentCourse: () => {
    const { currentCourseId } = get();
    for (const category of allCategories) {
      const course = category.courses.find(c => c.id === currentCourseId);
      if (course) return course;
    }
    return undefined;
  },
  
  getCurrentLesson: () => {
    const { currentLessonId } = get();
    for (const category of allCategories) {
      for (const course of category.courses) {
        const lesson = course.lessons.find(l => l.id === currentLessonId);
        if (lesson) return lesson;
      }
    }
    return undefined;
  },
  
  getCurrentContent: () => {
    const { currentContentId } = get();
    for (const category of allCategories) {
      for (const course of category.courses) {
        for (const lesson of course.lessons) {
          const content = lesson.content.find(c => c.id === currentContentId);
          if (content) return content;
        }
      }
    }
    return undefined;
  },
}));
