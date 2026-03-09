import { create } from 'zustand';
import type { ModuleDef, ChapterDef, VisualizationDef, AnimationState, ParameterDef } from '@/types';

// Course structure
export const modules: ModuleDef[] = [
  {
    id: 'module-1',
    title: 'Foundations of Geometric Motion',
    description: 'Explore the coordinate system as a stage for motion and learn about vectors in motion.',
    difficulty: 'beginner',
    duration: '2-3 weeks',
    chapters: [
      {
        id: 'chapter-1-1',
        moduleId: 'module-1',
        title: 'The Coordinate System as Stage',
        description: 'Animated grid with floating points that trace paths when parameters change.',
        visualizations: [
          {
            id: 'vis-cartesian-3d',
            chapterId: 'chapter-1-1',
            title: '3D Cartesian Theater',
            description: 'Animated grid with floating points that trace paths when parameters change',
            component: 'CartesianTheater3D',
            parameters: [
              { key: 'radius', label: 'Radius', min: 0.5, max: 3, step: 0.1, default: 1, unit: 'units' },
              { key: 'speed', label: 'Speed', min: 0.1, max: 3, step: 0.1, default: 1, unit: 'x' },
            ],
            features: ['Parametric tracing', 'Real-time manipulation', 'Glowing trail effect'],
          },
          {
            id: 'vis-polar-dance',
            chapterId: 'chapter-1-1',
            title: 'Polar Coordinate Dance',
            description: 'Points moving in spiral/radial patterns with real-time coordinate conversion',
            component: 'PolarDance',
            parameters: [
              { key: 'spiralRate', label: 'Spiral Rate', min: 0, max: 2, step: 0.1, default: 0.5 },
              { key: 'angularSpeed', label: 'Angular Speed', min: 0.1, max: 3, step: 0.1, default: 1 },
            ],
            features: ['Spiral patterns', 'Coordinate conversion display', 'Radial visualization'],
          },
          {
            id: 'vis-parametric-navigator',
            chapterId: 'chapter-1-1',
            title: 'Parametric Space Navigator',
            description: 'Split-screen showing parameter space (t) vs. Cartesian output (x,y,z)',
            component: 'ParametricNavigator',
            parameters: [
              { key: 'tMin', label: 't Min', min: -10, max: 0, step: 0.5, default: -Math.PI },
              { key: 'tMax', label: 't Max', min: 0, max: 10, step: 0.5, default: 2 * Math.PI },
            ],
            features: ['Split-screen view', 'Parameter-output mapping', 'Interactive domain'],
          },
        ],
      },
      {
        id: 'chapter-1-2',
        moduleId: 'module-1',
        title: 'Vectors in Motion',
        description: 'Animated arrows showing vector addition/subtraction with particle systems.',
        visualizations: [
          {
            id: 'vis-vector-field',
            chapterId: 'chapter-1-2',
            title: 'Vector Field Flow',
            description: 'Animated arrows showing vector addition/subtraction with particle systems',
            component: 'VectorFieldFlow',
            parameters: [
              { key: 'fieldStrength', label: 'Field Strength', min: 0.1, max: 2, step: 0.1, default: 1 },
              { key: 'particleCount', label: 'Particles', min: 10, max: 100, step: 10, default: 50 },
            ],
            features: ['Field visualization', 'Particle systems', 'Flow lines'],
          },
          {
            id: 'vis-basis-transform',
            chapterId: 'chapter-1-2',
            title: 'Basis Transformation',
            description: 'Grid morphing between standard and alternative bases with matrix display',
            component: 'BasisTransformation',
            parameters: [
              { key: 'angle', label: 'Rotation Angle', min: 0, max: 360, step: 5, default: 0, unit: '°' },
              { key: 'scaleX', label: 'Scale X', min: 0.5, max: 2, step: 0.1, default: 1 },
              { key: 'scaleY', label: 'Scale Y', min: 0.5, max: 2, step: 0.1, default: 1 },
            ],
            features: ['Grid morphing', 'Matrix display', 'Interactive basis'],
          },
          {
            id: 'vis-dot-product',
            chapterId: 'chapter-1-2',
            title: 'Dot Product Spotlight',
            description: 'Two vectors with projection animation and angle calculator',
            component: 'DotProductSpotlight',
            parameters: [
              { key: 'vec1Angle', label: 'Vector 1 Angle', min: 0, max: 360, step: 5, default: 30, unit: '°' },
              { key: 'vec2Angle', label: 'Vector 2 Angle', min: 0, max: 360, step: 5, default: 75, unit: '°' },
            ],
            features: ['Projection animation', 'Angle calculator', 'Interactive vectors'],
          },
        ],
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Kinematic Curves',
    description: 'Master parametric curves, cycloids, and curvature analysis.',
    difficulty: 'intermediate',
    duration: '3-4 weeks',
    chapters: [
      {
        id: 'chapter-2-1',
        moduleId: 'module-2',
        title: 'Parametric Curves Library',
        description: 'Interactive gallery of beautiful mathematical curves.',
        visualizations: [
          {
            id: 'vis-cycloid-race',
            chapterId: 'chapter-2-1',
            title: 'The Cycloid Race (Brachistochrone)',
            description: 'Three particles racing down different paths proving cycloid is fastest',
            component: 'CycloidRace',
            parameters: [
              { key: 'radius', label: 'Cycloid Radius', min: 0.5, max: 2, step: 0.1, default: 1 },
              { key: 'gravity', label: 'Gravity', min: 1, max: 20, step: 1, default: 9.81 },
            ],
            features: ['Real-time race', 'Energy conservation', 'Velocity display'],
          },
          {
            id: 'vis-epicycloid',
            chapterId: 'chapter-2-1',
            title: 'Epicycloid/Hypocycloid Generator',
            description: 'Multiple rotating circles creating beautiful patterns',
            component: 'EpicycloidGenerator',
            parameters: [
              { key: 'R', label: 'Fixed Radius', min: 1, max: 3, step: 0.1, default: 2 },
              { key: 'r', label: 'Rolling Radius', min: 0.2, max: 1, step: 0.1, default: 0.5 },
              { key: 'type', label: 'Type', min: 0, max: 1, step: 1, default: 1 },
            ],
            features: ['Gear ratio visualization', 'Pattern gallery', 'Animation control'],
          },
          {
            id: 'vis-bezier',
            chapterId: 'chapter-2-1',
            title: 'Bézier Curves Studio',
            description: 'Control point manipulation with tangent and curvature combs',
            component: 'BezierStudio',
            parameters: [
              { key: 't', label: 'Parameter t', min: 0, max: 1, step: 0.01, default: 0.5 },
            ],
            features: ['Drag control points', 'Curvature comb', 'Tangent display'],
          },
          {
            id: 'vis-lissajous',
            chapterId: 'chapter-2-1',
            title: 'Lissajous Figures',
            description: 'Dual harmonic oscillators creating mesmerizing patterns',
            component: 'LissajousFigures',
            parameters: [
              { key: 'freqA', label: 'Frequency A', min: 1, max: 10, step: 1, default: 3 },
              { key: 'freqB', label: 'Frequency B', min: 1, max: 10, step: 1, default: 4 },
              { key: 'phase', label: 'Phase Shift', min: 0, max: 360, step: 15, default: 90, unit: '°' },
            ],
            features: ['Frequency ratio display', 'Audiovisual sync', 'Pattern explorer'],
          },
        ],
      },
      {
        id: 'chapter-2-2',
        moduleId: 'module-2',
        title: 'Curvature & Osculating Circle',
        description: 'Understand how curves bend through visual analysis.',
        visualizations: [
          {
            id: 'vis-curvature-station',
            chapterId: 'chapter-2-2',
            title: 'Curvature Analysis Station',
            description: 'Moving frame and osculating circle following a curve point',
            component: 'CurvatureStation',
            parameters: [
              { key: 't', label: 'Position', min: 0, max: 1, step: 0.01, default: 0 },
              { key: 'curveType', label: 'Curve', min: 0, max: 2, step: 1, default: 0 },
            ],
            features: ['Osculating circle', 'Frenet frame', 'Curvature graph'],
          },
          {
            id: 'vis-evolute',
            chapterId: 'chapter-2-2',
            title: 'Evolute Generation',
            description: 'Locus of curvature centers drawn in real-time',
            component: 'EvoluteGeneration',
            parameters: [
              { key: 'a', label: 'Ellipse A', min: 1, max: 3, step: 0.1, default: 2 },
              { key: 'b', label: 'Ellipse B', min: 0.5, max: 2, step: 0.1, default: 1 },
            ],
            features: ['Real-time tracing', 'Curve comparison', 'Parameter adjustment'],
          },
        ],
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Surfaces & Solid Geometry',
    description: 'Explore surface parametrization, geodesics, and Gaussian curvature.',
    difficulty: 'intermediate-advanced',
    duration: '3-4 weeks',
    chapters: [
      {
        id: 'chapter-3-1',
        moduleId: 'module-3',
        title: 'Surface Parametrization',
        description: 'Interactive 3D models of mathematical surfaces.',
        visualizations: [
          {
            id: 'vis-ruled-surfaces',
            chapterId: 'chapter-3-1',
            title: 'Ruled Surfaces Generator',
            description: 'Two curve inputs animated as a sweeping surface',
            component: 'RuledSurfaces',
            parameters: [
              { key: 'twist', label: 'Twist', min: 0, max: 2, step: 0.1, default: 0.5 },
              { key: 'segments', label: 'Segments', min: 10, max: 50, step: 5, default: 30 },
            ],
            features: ['Surface sweep animation', 'Hyperboloid', 'Helicoid', 'Möbius strip'],
          },
          {
            id: 'vis-surface-revolution',
            chapterId: 'chapter-3-1',
            title: 'Surface of Revolution',
            description: '2D profile curve rotated into 3D with curvature heat map',
            component: 'SurfaceRevolution',
            parameters: [
              { key: 'profile', label: 'Profile', min: 0, max: 3, step: 1, default: 0 },
              { key: 'resolution', label: 'Resolution', min: 16, max: 64, step: 8, default: 32 },
            ],
            features: ['Rotation animation', 'Profile editor', 'Curvature heatmap'],
          },
          {
            id: 'vis-gaussian-explorer',
            chapterId: 'chapter-3-1',
            title: 'Gaussian Curvature Explorer',
            description: 'Color-coded surface showing elliptic, parabolic, and hyperbolic regions',
            component: 'GaussianExplorer',
            parameters: [
              { key: 'surfaceType', label: 'Surface', min: 0, max: 4, step: 1, default: 0 },
              { key: 'showNormals', label: 'Show Normals', min: 0, max: 1, step: 1, default: 1 },
            ],
            features: ['K color coding', 'Tangent plane', 'Geodesic circles'],
          },
        ],
      },
      {
        id: 'chapter-3-2',
        moduleId: 'module-3',
        title: 'Geodesics & Parallel Transport',
        description: 'Discover the shortest paths on curved surfaces.',
        visualizations: [
          {
            id: 'vis-great-circle',
            chapterId: 'chapter-3-2',
            title: 'Great Circle Navigation',
            description: 'Earth model with shortest path animation between two cities',
            component: 'GreatCircleNav',
            parameters: [
              { key: 'lat1', label: 'Latitude 1', min: -90, max: 90, step: 5, default: 40.7 },
              { key: 'lon1', label: 'Longitude 1', min: -180, max: 180, step: 5, default: -74 },
              { key: 'lat2', label: 'Latitude 2', min: -90, max: 90, step: 5, default: 51.5 },
              { key: 'lon2', label: 'Longitude 2', min: -180, max: 180, step: 5, default: -0.1 },
            ],
            features: ['Flight path', 'Distance calculation', 'City markers'],
          },
          {
            id: 'vis-parallel-transport',
            chapterId: 'chapter-3-2',
            title: 'Parallel Transport',
            description: 'Vector maintaining parallel status while moving on surface',
            component: 'ParallelTransport',
            parameters: [
              { key: 'pathLength', label: 'Path Length', min: 0, max: 1, step: 0.05, default: 0 },
            ],
            features: ['Holonomy demo', 'Curved surface', 'Vector rotation'],
          },
        ],
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Dynamic Geometry & Physics',
    description: 'Explore rigid body kinematics, Euler angles, and mass geometry.',
    difficulty: 'advanced',
    duration: '4-5 weeks',
    chapters: [
      {
        id: 'chapter-4-1',
        moduleId: 'module-4',
        title: 'Rigid Body Kinematics',
        description: 'Understand how rigid bodies move through space.',
        visualizations: [
          {
            id: 'vis-gimbal',
            chapterId: 'chapter-4-1',
            title: 'Euler Angles Gimbal',
            description: 'Interactive 3D gimbal system with gimbal lock visualization',
            component: 'GimbalVisualization',
            parameters: [
              { key: 'roll', label: 'Roll', min: -180, max: 180, step: 5, default: 0, unit: '°' },
              { key: 'pitch', label: 'Pitch', min: -90, max: 90, step: 5, default: 0, unit: '°' },
              { key: 'yaw', label: 'Yaw', min: -180, max: 180, step: 5, default: 0, unit: '°' },
            ],
            features: ['Gimbal lock warning', 'Quaternion comparison', 'Smooth interpolation'],
          },
          {
            id: 'vis-instant-center',
            chapterId: 'chapter-4-1',
            title: 'Instant Center of Rotation',
            description: 'Rolling objects analysis and four-bar linkage animation',
            component: 'InstantCenter',
            parameters: [
              { key: 'linkRatio', label: 'Link Ratio', min: 0.5, max: 2, step: 0.1, default: 1 },
            ],
            features: ['Instant center tracing', 'Four-bar linkage', 'Velocity analysis'],
          },
        ],
      },
      {
        id: 'chapter-4-2',
        moduleId: 'module-4',
        title: 'Mass Geometry',
        description: 'Center of mass and moment of inertia visualizations.',
        visualizations: [
          {
            id: 'vis-centroid',
            chapterId: 'chapter-4-2',
            title: 'Pappus Centroid Theorems',
            description: 'Volume and surface area via centroid path',
            component: 'PappusTheorem',
            parameters: [
              { key: 'shape', label: 'Shape', min: 0, max: 2, step: 1, default: 0 },
              { key: 'revolution', label: 'Revolution', min: 0, max: 360, step: 15, default: 0, unit: '°' },
            ],
            features: ['Centroid path', 'Volume calculation', 'Surface area'],
          },
          {
            id: 'vis-inertia',
            chapterId: 'chapter-4-2',
            title: 'Moment of Inertia Ellipsoid',
            description: 'Rotating body with inertia tensor visualization',
            component: 'InertiaEllipsoid',
            parameters: [
              { key: 'mass', label: 'Mass', min: 0.5, max: 5, step: 0.5, default: 1, unit: 'kg' },
              { key: 'omega', label: 'Angular Velocity', min: 0.1, max: 5, step: 0.1, default: 1 },
            ],
            features: ['Tensor visualization', 'Principal axes', 'Angular momentum'],
          },
        ],
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Advanced Kinetic Concepts',
    description: 'Topology, fractals, and chaos theory visualizations.',
    difficulty: 'expert',
    duration: '3-4 weeks',
    chapters: [
      {
        id: 'chapter-5-1',
        moduleId: 'module-5',
        title: 'Topology in Motion',
        description: 'Continuous transformations and topological invariants.',
        visualizations: [
          {
            id: 'vis-winding-number',
            chapterId: 'chapter-5-1',
            title: 'Winding Number',
            description: 'Point orbiting curve with counter visualization',
            component: 'WindingNumber',
            parameters: [
              { key: 'pointX', label: 'Point X', min: -2, max: 2, step: 0.1, default: 0 },
              { key: 'pointY', label: 'Point Y', min: -2, max: 2, step: 0.1, default: 0 },
            ],
            features: ['Real-time counting', 'Multiple curves', 'Interactive points'],
          },
          {
            id: 'vis-fixed-point',
            chapterId: 'chapter-5-1',
            title: 'Brouwer Fixed Point',
            description: 'Hair combing theorem animation',
            component: 'FixedPointTheorem',
            parameters: [
              { key: 'fieldType', label: 'Field Type', min: 0, max: 2, step: 1, default: 0 },
            ],
            features: ['Vector field', 'Fixed point highlighting', 'Topological proof'],
          },
        ],
      },
      {
        id: 'chapter-5-2',
        moduleId: 'module-5',
        title: 'Fractal Geometry & Chaos',
        description: 'Explore infinite complexity and deterministic chaos.',
        visualizations: [
          {
            id: 'vis-mandelbrot',
            chapterId: 'chapter-5-2',
            title: 'Mandelbrot/Julia Set Explorer',
            description: 'Real-time zoom with orbit trails',
            component: 'MandelbrotExplorer',
            parameters: [
              { key: 'maxIter', label: 'Max Iterations', min: 50, max: 500, step: 50, default: 200 },
              { key: 'zoom', label: 'Zoom', min: 1, max: 1000, step: 10, default: 1 },
            ],
            features: ['Real-time rendering', 'Orbit trails', 'Julia set connection'],
          },
          {
            id: 'vis-lorenz',
            chapterId: 'chapter-5-2',
            title: 'Strange Attractors',
            description: 'Lorenz system 3D trajectory with sensitivity demo',
            component: 'LorenzAttractor',
            parameters: [
              { key: 'sigma', label: 'Sigma (σ)', min: 5, max: 15, step: 0.5, default: 10 },
              { key: 'rho', label: 'Rho (ρ)', min: 20, max: 35, step: 1, default: 28 },
              { key: 'beta', label: 'Beta (β)', min: 2, max: 4, step: 0.1, default: 8/3 },
            ],
            features: ['3D trajectory', 'Sensitivity demo', 'Butterfly effect'],
          },
          {
            id: 'vis-hilbert',
            chapterId: 'chapter-5-2',
            title: 'Space-Filling Curves',
            description: 'Hilbert and Peano curve iterations',
            component: 'SpaceFillingCurves',
            parameters: [
              { key: 'iteration', label: 'Iteration', min: 1, max: 7, step: 1, default: 3 },
              { key: 'curveType', label: 'Curve Type', min: 0, max: 1, step: 1, default: 0 },
            ],
            features: ['Iteration animation', 'Multiple curves', 'Area filling'],
          },
        ],
      },
    ],
  },
];

// Store state interface
interface GeometryStore {
  // Navigation
  currentModuleId: string | null;
  currentChapterId: string | null;
  currentVisualizationId: string | null;
  
  // Animation state
  animationState: AnimationState;
  
  // Visualization settings
  showTrails: boolean;
  showVectors: boolean;
  showGrid: boolean;
  showForces: boolean;
  
  // Parameters
  parameters: Record<string, number>;
  
  // Actions
  setModule: (moduleId: string | null) => void;
  setChapter: (chapterId: string | null) => void;
  setVisualization: (visualizationId: string | null) => void;
  setParameter: (key: string, value: number) => void;
  setParameters: (params: Record<string, number>) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  updateTime: (deltaTime: number) => void;
  resetTime: () => void;
  toggleTrails: () => void;
  toggleVectors: () => void;
  toggleGrid: () => void;
  toggleForces: () => void;
  
  // Getters
  getCurrentModule: () => ModuleDef | undefined;
  getCurrentChapter: () => ChapterDef | undefined;
  getCurrentVisualization: () => VisualizationDef | undefined;
}

// Helper to get default parameters from visualization
function getDefaultParams(visualizationId: string | null): Record<string, number> {
  if (!visualizationId) return {};
  
  for (const mod of modules) {
    for (const chapter of mod.chapters) {
      const vis = chapter.visualizations.find(v => v.id === visualizationId);
      if (vis) {
        const params: Record<string, number> = {};
        for (const param of vis.parameters) {
          params[param.key] = param.default;
        }
        return params;
      }
    }
  }
  return {};
}

export const useGeometryStore = create<GeometryStore>((set, get) => ({
  // Initial state
  currentModuleId: null,
  currentChapterId: null,
  currentVisualizationId: null,
  
  animationState: {
    isPlaying: false,
    speed: 1,
    time: 0,
    deltaTime: 0,
    frameCount: 0,
  },
  
  showTrails: true,
  showVectors: true,
  showGrid: true,
  showForces: false,
  
  parameters: {},
  
  // Actions
  setModule: (moduleId) => {
    const chapter = get().currentChapterId;
    const mod = modules.find(m => m.id === moduleId);
    const isDifferentModule = mod?.chapters.every(c => c.id !== chapter);
    
    set({
      currentModuleId: moduleId,
      currentChapterId: isDifferentModule ? mod?.chapters[0]?.id || null : chapter,
      currentVisualizationId: isDifferentModule ? mod?.chapters[0]?.visualizations[0]?.id || null : get().currentVisualizationId,
    });
  },
  
  setChapter: (chapterId) => {
    const chapter = modules
      .flatMap(m => m.chapters)
      .find(c => c.id === chapterId);
    
    set({
      currentChapterId: chapterId,
      currentModuleId: chapter?.moduleId || get().currentModuleId,
      currentVisualizationId: chapter?.visualizations[0]?.id || null,
      parameters: getDefaultParams(chapter?.visualizations[0]?.id || null),
    });
  },
  
  setVisualization: (visualizationId) => {
    set({
      currentVisualizationId: visualizationId,
      parameters: getDefaultParams(visualizationId),
      animationState: { ...get().animationState, time: 0, frameCount: 0 },
    });
  },
  
  setParameter: (key, value) => {
    set((state) => ({
      parameters: { ...state.parameters, [key]: value },
    }));
  },
  
  setParameters: (params) => {
    set({ parameters: params });
  },
  
  togglePlay: () => {
    set((state) => ({
      animationState: {
        ...state.animationState,
        isPlaying: !state.animationState.isPlaying,
      },
    }));
  },
  
  setSpeed: (speed) => {
    set((state) => ({
      animationState: { ...state.animationState, speed },
    }));
  },
  
  updateTime: (deltaTime) => {
    set((state) => ({
      animationState: {
        ...state.animationState,
        time: state.animationState.time + deltaTime * state.animationState.speed,
        deltaTime,
        frameCount: state.animationState.frameCount + 1,
      },
    }));
  },
  
  resetTime: () => {
    set((state) => ({
      animationState: {
        ...state.animationState,
        time: 0,
        frameCount: 0,
      },
    }));
  },
  
  toggleTrails: () => set((state) => ({ showTrails: !state.showTrails })),
  toggleVectors: () => set((state) => ({ showVectors: !state.showVectors })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleForces: () => set((state) => ({ showForces: !state.showForces })),
  
  // Getters
  getCurrentModule: () => {
    const { currentModuleId } = get();
    return modules.find(m => m.id === currentModuleId);
  },
  
  getCurrentChapter: () => {
    const { currentChapterId } = get();
    return modules.flatMap(m => m.chapters).find(c => c.id === currentChapterId);
  },
  
  getCurrentVisualization: () => {
    const { currentVisualizationId } = get();
    return modules.flatMap(m => m.chapters.flatMap(c => c.visualizations)).find(v => v.id === currentVisualizationId);
  },
}));
