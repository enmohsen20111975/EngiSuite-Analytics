import type { Vec2, Vec3, CurvaturePoint } from '@/types';

// Vector operations
export const vec2 = {
  create: (x = 0, y = 0): Vec2 => ({ x, y }),
  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
  scale: (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s }),
  dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,
  length: (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y),
  normalize: (v: Vec2): Vec2 => {
    const len = vec2.length(v);
    return len > 0 ? vec2.scale(v, 1 / len) : { x: 0, y: 0 };
  },
  rotate: (v: Vec2, angle: number): Vec2 => ({
    x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
    y: v.x * Math.sin(angle) + v.y * Math.cos(angle),
  }),
  perpendicular: (v: Vec2): Vec2 => ({ x: -v.y, y: v.x }),
  distance: (a: Vec2, b: Vec2): number => vec2.length(vec2.sub(a, b)),
  lerp: (a: Vec2, b: Vec2, t: number): Vec2 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  }),
};

export const vec3 = {
  create: (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z }),
  add: (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  sub: (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  scale: (v: Vec3, s: number): Vec3 => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
  dot: (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z,
  length: (v: Vec3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  normalize: (v: Vec3): Vec3 => {
    const len = vec3.length(v);
    return len > 0 ? vec3.scale(v, 1 / len) : { x: 0, y: 0, z: 0 };
  },
  cross: (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  distance: (a: Vec3, b: Vec3): number => vec3.length(vec3.sub(a, b)),
  lerp: (a: Vec3, b: Vec3, t: number): Vec3 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }),
  rotateX: (v: Vec3, angle: number): Vec3 => ({
    x: v.x,
    y: v.y * Math.cos(angle) - v.z * Math.sin(angle),
    z: v.y * Math.sin(angle) + v.z * Math.cos(angle),
  }),
  rotateY: (v: Vec3, angle: number): Vec3 => ({
    x: v.x * Math.cos(angle) + v.z * Math.sin(angle),
    y: v.y,
    z: -v.x * Math.sin(angle) + v.z * Math.cos(angle),
  }),
  rotateZ: (v: Vec3, angle: number): Vec3 => ({
    x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
    y: v.x * Math.sin(angle) + v.y * Math.cos(angle),
    z: v.z,
  }),
};

// Curve parametrizations
export const curves = {
  // Cycloid: x = r(θ - sin θ), y = r(1 - cos θ)
  cycloid: (theta: number, radius: number): Vec2 => ({
    x: radius * (theta - Math.sin(theta)),
    y: radius * (1 - Math.cos(theta)),
  }),

  // Cycloid derivative for velocity
  cycloidDerivative: (theta: number, radius: number): Vec2 => ({
    x: radius * (1 - Math.cos(theta)),
    y: radius * Math.sin(theta),
  }),

  // Epicycloid
  epicycloid: (theta: number, R: number, r: number): Vec2 => {
    const ratio = R / r;
    return {
      x: (R + r) * Math.cos(theta) - r * Math.cos((R + r) / r * theta),
      y: (R + r) * Math.sin(theta) - r * Math.sin((R + r) / r * theta),
    };
  },

  // Hypocycloid
  hypocycloid: (theta: number, R: number, r: number): Vec2 => {
    return {
      x: (R - r) * Math.cos(theta) + r * Math.cos((R - r) / r * theta),
      y: (R - r) * Math.sin(theta) - r * Math.sin((R - r) / r * theta),
    };
  },

  // Lissajous figure
  lissajous: (t: number, A: number, B: number, a: number, b: number, delta: number): Vec2 => ({
    x: A * Math.sin(a * t + delta),
    y: B * Math.sin(b * t),
  }),

  // Ellipse
  ellipse: (t: number, a: number, b: number): Vec2 => ({
    x: a * Math.cos(t),
    y: b * Math.sin(t),
  }),

  // Helix (3D)
  helix: (t: number, radius: number, pitch: number): Vec3 => ({
    x: radius * Math.cos(t),
    y: radius * Math.sin(t),
    z: pitch * t,
  }),

  // Bezier curve (cubic)
  bezier: (t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): Vec2 => {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    };
  },

  // Bezier derivative (tangent)
  bezierDerivative: (t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): Vec2 => {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return {
      x: 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x),
      y: 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y),
    };
  },
};

// Curvature calculation for parametric curves
export const curvature = {
  // 2D curvature: κ = |x'y'' - y'x''| / (x'² + y'²)^(3/2)
  parametric2D: (
    dx: number,
    dy: number,
    ddx: number,
    ddy: number
  ): number => {
    const numerator = Math.abs(dx * ddy - dy * ddx);
    const denominator = Math.pow(dx * dx + dy * dy, 1.5);
    return denominator > 0 ? numerator / denominator : 0;
  },

  // Radius of curvature
  radius: (kappa: number): number => kappa > 0 ? 1 / kappa : Infinity,

  // Osculation circle center
  osculatingCenter: (
    pos: Vec2,
    tangent: Vec2,
    normal: Vec2,
    radiusOfCurvature: number
  ): Vec2 => vec2.add(pos, vec2.scale(normal, radiusOfCurvature)),
};

// Calculate curvature for a cycloid at parameter theta
export function cycloidCurvature(theta: number, radius: number): number {
  // For cycloid: κ = -1 / (4r sin(θ/2)) for θ ∈ (0, 2π)
  const sinHalfTheta = Math.sin(theta / 2);
  if (Math.abs(sinHalfTheta) < 0.001) return Infinity;
  return -1 / (4 * radius * sinHalfTheta);
}

// Calculate Frenet frame for a curve point
export function frenetFrame(
  tangent: Vec3,
  normal: Vec3 | null = null
): { tangent: Vec3; normal: Vec3; binormal: Vec3 } {
  const T = vec3.normalize(tangent);
  
  let N: Vec3;
  if (normal) {
    N = vec3.normalize(normal);
  } else {
    // Pick an arbitrary vector not parallel to T
    const arbitrary: Vec3 = Math.abs(T.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
    N = vec3.normalize(vec3.cross(T, arbitrary));
  }
  
  const B = vec3.cross(T, N);
  
  return { tangent: T, normal: N, binormal: B };
}

// Polar to Cartesian conversion
export const polar = {
  toCartesian: (r: number, theta: number): Vec2 => ({
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  }),
  fromCartesian: (x: number, y: number): { r: number; theta: number } => ({
    r: Math.sqrt(x * x + y * y),
    theta: Math.atan2(y, x),
  }),
};

// Spherical to Cartesian (3D)
export const spherical = {
  toCartesian: (r: number, theta: number, phi: number): Vec3 => ({
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  }),
  fromCartesian: (x: number, y: number, z: number): { r: number; theta: number; phi: number } => ({
    r: Math.sqrt(x * x + y * y + z * z),
    theta: Math.atan2(y, x),
    phi: Math.acos(z / Math.sqrt(x * x + y * y + z * z)),
  }),
};

// Surface parametrizations
export const surfaces = {
  // Sphere: (r cos u sin v, r sin u sin v, r cos v)
  sphere: (u: number, v: number, radius: number): Vec3 => ({
    x: radius * Math.cos(u) * Math.sin(v),
    y: radius * Math.sin(u) * Math.sin(v),
    z: radius * Math.cos(v),
  }),

  // Torus
  torus: (u: number, v: number, R: number, r: number): Vec3 => ({
    x: (R + r * Math.cos(v)) * Math.cos(u),
    y: (R + r * Math.cos(v)) * Math.sin(u),
    z: r * Math.sin(v),
  }),

  // Helicoid
  helicoid: (u: number, v: number, pitch: number): Vec3 => ({
    x: v * Math.cos(u),
    y: v * Math.sin(u),
    z: pitch * u,
  }),

  // Hyperboloid of one sheet
  hyperboloid: (u: number, v: number, a: number, b: number, c: number): Vec3 => ({
    x: a * Math.cosh(v) * Math.cos(u),
    y: b * Math.cosh(v) * Math.sin(u),
    z: c * Math.sinh(v),
  }),

  // Möbius strip
  mobius: (u: number, v: number, width: number): Vec3 => {
    const halfWidth = width / 2;
    return {
      x: (1 + v * halfWidth * Math.cos(u / 2)) * Math.cos(u),
      y: (1 + v * halfWidth * Math.cos(u / 2)) * Math.sin(u),
      z: v * halfWidth * Math.sin(u / 2),
    };
  },

  // Paraboloid
  paraboloid: (x: number, y: number, a: number, b: number): Vec3 => ({
    x,
    y,
    z: (x * x) / (a * a) + (y * y) / (b * b),
  }),

  // Saddle surface (hyperbolic paraboloid)
  saddle: (x: number, y: number, a: number, b: number): Vec3 => ({
    x,
    y,
    z: (x * x) / (a * a) - (y * y) / (b * b),
  }),
};

// Gaussian curvature calculation
export function gaussianCurvature(
  E: number, F: number, G: number,
  L: number, M: number, N: number
): number {
  // K = (LN - M²) / (EG - F²)
  const numerator = L * N - M * M;
  const denominator = E * G - F * F;
  return denominator !== 0 ? numerator / denominator : 0;
}

// Physics helpers
export const physics = {
  // Gravitational potential energy
  potentialEnergy: (mass: number, height: number, g = 9.81): number => mass * g * height,

  // Kinetic energy
  kineticEnergy: (mass: number, velocity: number): number => 0.5 * mass * velocity * velocity,

  // Total mechanical energy
  totalEnergy: (mass: number, height: number, velocity: number, g = 9.81): number =>
    physics.potentialEnergy(mass, height, g) + physics.kineticEnergy(mass, velocity),

  // Velocity from energy conservation (starting from height h0, current height h)
  velocityFromEnergy: (h0: number, h: number, g = 9.81): number =>
    Math.sqrt(2 * g * (h0 - h)),
};

// Numerical integration
export const integrate = {
  // Simpson's rule for numerical integration
  simpson: (f: (x: number) => number, a: number, b: number, n = 100): number => {
    if (n % 2 === 1) n++;
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += (i % 2 === 0 ? 2 : 4) * f(x);
    }
    
    return (h / 3) * sum;
  },

  // Arc length of parametric curve
  arcLength: (
    dx: (t: number) => number,
    dy: (t: number) => number,
    a: number,
    b: number,
    n = 100
  ): number => {
    return integrate.simpson(t => Math.sqrt(dx(t) * dx(t) + dy(t) * dy(t)), a, b, n);
  },
};

// Utility functions
export const utils = {
  // Clamp value between min and max
  clamp: (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value)),

  // Linear interpolation
  lerp: (a: number, b: number, t: number): number => a + (b - a) * t,

  // Map value from one range to another
  map: (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
    outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin),

  // Smooth step function
  smoothstep: (edge0: number, edge1: number, x: number): number => {
    const t = utils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },

  // Ease in out
  easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

  // Degrees to radians
  degToRad: (degrees: number): number => degrees * (Math.PI / 180),

  // Radians to degrees
  radToDeg: (radians: number): number => radians * (180 / Math.PI),

  // Format number for display
  formatNumber: (n: number, decimals = 2): string => {
    if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(decimals);
    return n.toFixed(decimals);
  },
};
