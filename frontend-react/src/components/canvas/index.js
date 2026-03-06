/**
 * Canvas Component Library
 * Shared canvas components for EngiSuite applications
 */

// Main Canvas Component
export { Canvas, default as CanvasComponent } from './Canvas';

// Controls
export { CanvasControls, default as CanvasControlsComponent } from './CanvasControls';

// Renderers
export { 
  NodeRenderer, 
  NodeList,
  getDomainColor,
  default as NodeRendererComponent 
} from './NodeRenderer';

export { 
  ConnectionRenderer, 
  ConnectionList,
  ConnectionPreview,
  StraightConnectionRenderer,
  default as ConnectionRendererComponent 
} from './ConnectionRenderer';

// Hooks
export { useCanvas, default as useCanvasHook } from './hooks/useCanvas';

// Utilities
export * from './utils/transformations';
export * from './utils/hitDetection';
export * from './utils/serialization';

// Constants
export const DOMAIN_COLORS = {
  electrical: '#1976d2',
  mechanical: '#f57c00',
  civil: '#388e3c',
  chemical: '#7b1fa2',
  mathematics: '#00796b',
  general: '#455a64',
  default: '#64748b'
};

export const DEFAULT_NODE_WIDTH = 200;
export const DEFAULT_NODE_HEIGHT = 100;
export const DEFAULT_PORT_RADIUS = 8;
export const DEFAULT_GRID_SIZE = 20;
