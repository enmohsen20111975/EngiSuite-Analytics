// KineticGeometry Lab Course Data
// Interactive geometry and mathematics visualizations

export const KINETIC_GEOMETRY_COURSE = {
  id: 'kinetic-geometry-lab',
  title: 'KineticGeometry Lab',
  description: 'Interactive geometry and mathematics visualizations - from coordinate systems to chaos theory',
  discipline: 'mathematics',
  level: 'intermediate',
  totalLessons: 25,
  duration: '15 hours',
  image: '/images/courses/geometry.jpg',
  features: [
    'Parametric curves',
    'Fractal exploration',
    'Interactive coordinate systems',
    'Mathematical proofs'
  ]
};

// Module types
export const GeometryModuleType = {
  THEORY: 'THEORY',
  SIMULATION_COORDINATES: 'SIMULATION_COORDINATES',
  SIMULATION_CURVES: 'SIMULATION_CURVES',
  SIMULATION_SURFACES: 'SIMULATION_SURFACES',
  SIMULATION_FRACTALS: 'SIMULATION_FRACTALS',
  QUIZ: 'QUIZ'
};

// Course Modules
export const KINETIC_GEOMETRY_MODULES = [
  {
    id: 'geo-m1',
    title: '1. Foundations of Geometric Motion',
    description: 'Explore coordinate systems and vectors in motion.',
    type: GeometryModuleType.THEORY,
    lessons: [
      {
        id: 'geo-l1-1',
        title: 'The Coordinate System',
        content: `### Understanding Coordinate Systems
A coordinate system provides a framework for describing position in space. The most common is the Cartesian coordinate system.

### Cartesian Coordinates
- **2D**: Points described by (x, y) pairs
- **3D**: Points described by (x, y, z) triplets
- Each axis is perpendicular to the others

### Polar Coordinates
Instead of x and y, we use:
- **r (rho)**: Distance from origin
- **θ (theta)**: Angle from reference direction

### Key Concepts
1. Origin: The reference point (0, 0)
2. Axes: Perpendicular lines through origin
3. Quadrants: The four regions of2 Cartesian plane`,
        type: 'reading',
        duration: 15
      }
    ]
  },
  {
    id: 'geo-m2',
    title: '2. Parametric Curves',
    description: 'Discover beautiful mathematical curves through parameters.',
    type: GeometryModuleType.SIMULATION_CURVES,
    simulationType: 'lissajous-figures',
    lessons: []
  },
  {
    id: 'geo-m3',
    title: '3. Fractals & Chaos',
    description: 'Explore infinite complexity and deterministic chaos.',
    type: GeometryModuleType.SIMULATION_FRACTALS,
    simulationType: 'mandelbrot-explorer',
    lessons: []
  }
];

// Quiz Data
export const KINETIC_GEOMETRY_QUIZ_DATA = [
  {
    id: 1,
    question: "What is the relationship between polar coordinates (r, θ) and Cartesian coordinates (x, y)?",
    options: ["x = r·cos(θ), y = r·sin(θ)", "x = r·sin(θ), y = r·cos(θ)", "x = θ·cos(r), y = θ·sin(r)", "x = r + θ, y = r - θ"],
    correctIndex: 0,
    explanation: "The conversion from polar to Cartesian coordinates uses trigonometric functions: x = r·cos(θ) and y = r·sin(θ)."
  },
  {
    id: 2,
    question: "In a Lissajous figure, what determines the 'knot' pattern?",
    options: ["The amplitude", "The frequency ratio", "The color", "The speed"],
    correctIndex: 1,
    explanation: "The frequency ratio between the two oscillators determines the complexity and closedness of the Lissajous pattern."
  },
  {
    id: 3,
    question: "What is the Mandelbrot set famous for?",
    options: ["Being perfectly smooth", "Having infinite self-similarity", "Being a simple circle", "Having only one solution"],
    correctIndex: 1,
    explanation: "The Mandelbrot set exhibits infinite complexity and self-similarity at all scales of zoom."
  }
];

export default {
  KINETIC_GEOMETRY_COURSE,
  KINETIC_GEOMETRY_MODULES,
  KINETIC_GEOMETRY_QUIZ_DATA,
  GeometryModuleType
};
