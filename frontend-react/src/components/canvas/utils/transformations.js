/**
 * Canvas Transformation Utilities
 * Handles coordinate transformations between screen and canvas space
 */

/**
 * Convert screen coordinates to canvas coordinates
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {Object} viewport - Viewport state { offset: {x, y}, zoom }
 * @param {DOMRect} rect - Canvas bounding rectangle
 * @returns {Object} Canvas coordinates {x, y}
 */
export function screenToCanvas(screenX, screenY, viewport, rect) {
  return {
    x: (screenX - rect.left - viewport.offset.x) / viewport.zoom,
    y: (screenY - rect.top - viewport.offset.y) / viewport.zoom
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 * @param {number} canvasX - Canvas X coordinate
 * @param {number} canvasY - Canvas Y coordinate
 * @param {Object} viewport - Viewport state { offset: {x, y}, zoom }
 * @param {DOMRect} rect - Canvas bounding rectangle
 * @returns {Object} Screen coordinates {x, y}
 */
export function canvasToScreen(canvasX, canvasY, viewport, rect) {
  return {
    x: canvasX * viewport.zoom + viewport.offset.x + rect.left,
    y: canvasY * viewport.zoom + viewport.offset.y + rect.top
  };
}

/**
 * Calculate zoom to fit all elements in viewport
 * @param {Array} elements - Array of elements with x, y, width, height
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} padding - Padding around elements
 * @returns {Object} Viewport state { zoom, offset: {x, y} }
 */
export function fitToView(elements, canvasWidth, canvasHeight, padding = 50) {
  if (!elements || elements.length === 0) {
    return { zoom: 1, offset: { x: 0, y: 0 } };
  }

  // Calculate bounding box
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  elements.forEach(el => {
    const x = el.x || 0;
    const y = el.y || 0;
    const width = el.width || 0;
    const height = el.height || 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Calculate zoom to fit
  const zoomX = (canvasWidth - padding * 2) / contentWidth;
  const zoomY = (canvasHeight - padding * 2) / contentHeight;
  const zoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%

  // Calculate offset to center
  const scaledWidth = contentWidth * zoom;
  const scaledHeight = contentHeight * zoom;
  const offsetX = (canvasWidth - scaledWidth) / 2 - minX * zoom;
  const offsetY = (canvasHeight - scaledHeight) / 2 - minY * zoom;

  return {
    zoom,
    offset: { x: offsetX, y: offsetY }
  };
}

/**
 * Zoom to a specific point while maintaining that point's position
 * @param {number} x - Screen X coordinate (zoom center)
 * @param {number} y - Screen Y coordinate (zoom center)
 * @param {number} delta - Zoom delta (positive = zoom in)
 * @param {Object} viewport - Current viewport state
 * @param {Object} options - Zoom options { minZoom, maxZoom, factor }
 * @returns {Object} New viewport state
 */
export function zoomToPoint(x, y, delta, viewport, options = {}) {
  const { minZoom = 0.1, maxZoom = 5, factor = 1.1 } = options;
  const oldZoom = viewport.zoom;
  const zoomFactor = delta > 0 ? factor : 1 / factor;
  const newZoom = Math.max(minZoom, Math.min(maxZoom, oldZoom * zoomFactor));

  if (newZoom === oldZoom) {
    return viewport;
  }

  // Calculate the canvas position under the mouse before zoom
  const canvasX = (x - viewport.offset.x) / oldZoom;
  const canvasY = (y - viewport.offset.y) / oldZoom;

  // Calculate new offset to keep the point under the mouse
  const newOffsetX = x - canvasX * newZoom;
  const newOffsetY = y - canvasY * newZoom;

  return {
    zoom: newZoom,
    offset: { x: newOffsetX, y: newOffsetY }
  };
}

/**
 * Snap a value to the nearest grid point
 * @param {number} value - Value to snap
 * @param {number} gridSize - Grid size
 * @returns {number} Snapped value
 */
export function snapToGrid(value, gridSize) {
  if (!gridSize || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Check if a point is inside a rectangle
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {Object} rect - Rectangle { x, y, width, height }
 * @returns {boolean}
 */
export function isPointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/**
 * Check if two rectangles intersect
 * @param {Object} rect1 - First rectangle { x, y, width, height }
 * @param {Object} rect2 - Second rectangle { x, y, width, height }
 * @returns {boolean}
 */
export function rectsIntersect(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Get the bounding box of multiple elements
 * @param {Array} elements - Array of elements with x, y, width, height
 * @returns {Object} Bounding box { x, y, width, height }
 */
export function getBoundingBox(elements) {
  if (!elements || elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  elements.forEach(el => {
    const x = el.x || 0;
    const y = el.y || 0;
    const width = el.width || 0;
    const height = el.height || 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Constrain a value within min and max bounds
 * @param {number} value - Value to constrain
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
