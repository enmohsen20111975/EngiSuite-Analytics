/**
 * Canvas Hit Detection Utilities
 * Handles mouse/pointer detection for canvas elements
 */

import { isPointInRect, distance } from './transformations';

/**
 * Find the topmost element at a given point
 * @param {number} x - Canvas X coordinate
 * @param {number} y - Canvas Y coordinate
 * @param {Array} elements - Array of canvas elements
 * @param {string} type - Optional type filter
 * @returns {Object|null} The hit element or null
 */
export function findElementAtPoint(x, y, elements, type = null) {
  // Search in reverse order (top to bottom in z-index)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    
    // Type filter
    if (type && element.type !== type) continue;
    
    if (isPointInElement(x, y, element)) {
      return element;
    }
  }
  return null;
}

/**
 * Check if a point is inside an element
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {Object} element - Canvas element
 * @returns {boolean}
 */
export function isPointInElement(x, y, element) {
  const { type } = element;
  
  switch (type) {
    case 'node':
    case 'rectangle':
    case 'image':
    case 'text':
      return isPointInRect(x, y, {
        x: element.x,
        y: element.y,
        width: element.width || 100,
        height: element.height || 50
      });
      
    case 'circle':
      return isPointInCircle(x, y, {
        x: element.x + (element.radius || element.width / 2),
        y: element.y + (element.radius || element.height / 2),
        radius: element.radius || Math.min(element.width, element.height) / 2
      });
      
    case 'ellipse':
      return isPointInEllipse(x, y, element);
      
    case 'line':
    case 'arrow':
    case 'connection':
      return isPointNearLine(x, y, element, 10); // 10px tolerance
      
    case 'freehand':
    case 'path':
      return isPointNearPath(x, y, element.points, 10);
      
    case 'port':
      return isPointInCircle(x, y, {
        x: element.x,
        y: element.y,
        radius: element.radius || 8
      });
      
    default:
      return isPointInRect(x, y, element);
  }
}

/**
 * Check if a point is inside a circle
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {Object} circle - Circle { x, y, radius }
 * @returns {boolean}
 */
export function isPointInCircle(x, y, circle) {
  const dx = x - circle.x;
  const dy = y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * Check if a point is inside an ellipse
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {Object} ellipse - Ellipse { x, y, width, height }
 * @returns {boolean}
 */
export function isPointInEllipse(x, y, ellipse) {
  const cx = ellipse.x + ellipse.width / 2;
  const cy = ellipse.y + ellipse.height / 2;
  const rx = ellipse.width / 2;
  const ry = ellipse.height / 2;
  
  const dx = x - cx;
  const dy = y - cy;
  
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

/**
 * Check if a point is near a line segment
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {Object} line - Line { x1, y1, x2, y2 }
 * @param {number} tolerance - Distance tolerance
 * @returns {boolean}
 */
export function isPointNearLine(x, y, line, tolerance = 5) {
  const { x1, y1, x2, y2 } = line;
  
  // Calculate distance from point to line segment
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dist = distance(x, y, xx, yy);
  return dist <= tolerance;
}

/**
 * Check if a point is near a path (polyline)
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {Array} points - Array of {x, y} points
 * @param {number} tolerance - Distance tolerance
 * @returns {boolean}
 */
export function isPointNearPath(x, y, points, tolerance = 5) {
  if (!points || points.length < 2) return false;
  
  for (let i = 0; i < points.length - 1; i++) {
    if (isPointNearLine(x, y, {
      x1: points[i].x,
      y1: points[i].y,
      x2: points[i + 1].x,
      y2: points[i + 1].y
    }, tolerance)) {
      return true;
    }
  }
  return false;
}

/**
 * Find all elements within a selection rectangle
 * @param {Object} selectionRect - Selection rectangle { x, y, width, height }
 * @param {Array} elements - Array of canvas elements
 * @param {boolean} partial - Include partially overlapping elements
 * @returns {Array} Array of selected elements
 */
export function findElementsInRect(selectionRect, elements, partial = false) {
  return elements.filter(element => {
    const elementRect = {
      x: element.x,
      y: element.y,
      width: element.width || 100,
      height: element.height || 50
    };
    
    if (partial) {
      // Check if rectangles intersect
      return !(
        selectionRect.x > elementRect.x + elementRect.width ||
        selectionRect.x + selectionRect.width < elementRect.x ||
        selectionRect.y > elementRect.y + elementRect.height ||
        selectionRect.y + selectionRect.height < elementRect.y
      );
    } else {
      // Check if element is fully contained
      return (
        selectionRect.x <= elementRect.x &&
        selectionRect.y <= elementRect.y &&
        selectionRect.x + selectionRect.width >= elementRect.x + elementRect.width &&
        selectionRect.y + selectionRect.height >= elementRect.y + elementRect.height
      );
    }
  });
}

/**
 * Find a port at a given point
 * @param {number} x - Canvas X coordinate
 * @param {number} y - Canvas Y coordinate
 * @param {Array} nodes - Array of nodes with ports
 * @param {number} portRadius - Port hit radius
 * @returns {Object|null} { node, port, portIndex, type }
 */
export function findPortAtPoint(x, y, nodes, portRadius = 8) {
  for (const node of nodes) {
    // Check input ports
    if (node.inputs) {
      for (let i = 0; i < node.inputs.length; i++) {
        const port = node.inputs[i];
        const portX = node.x + (port.x || 0);
        const portY = node.y + (port.y || 20 + i * 25);
        
        if (distance(x, y, portX, portY) <= portRadius) {
          return { node, port, portIndex: i, type: 'input' };
        }
      }
    }
    
    // Check output ports
    if (node.outputs) {
      for (let i = 0; i < node.outputs.length; i++) {
        const port = node.outputs[i];
        const portX = node.x + (port.x || node.width || 200);
        const portY = node.y + (port.y || 20 + i * 25);
        
        if (distance(x, y, portX, portY) <= portRadius) {
          return { node, port, portIndex: i, type: 'output' };
        }
      }
    }
  }
  return null;
}

/**
 * Get resize handles for an element
 * @param {Object} element - Canvas element
 * @param {number} handleSize - Size of resize handles
 * @returns {Array} Array of handle positions
 */
export function getResizeHandles(element, handleSize = 8) {
  const { x, y, width = 100, height = 50 } = element;
  const halfHandle = handleSize / 2;
  
  return [
    { position: 'nw', x: x - halfHandle, y: y - halfHandle },
    { position: 'n', x: x + width / 2 - halfHandle, y: y - halfHandle },
    { position: 'ne', x: x + width - halfHandle, y: y - halfHandle },
    { position: 'e', x: x + width - halfHandle, y: y + height / 2 - halfHandle },
    { position: 'se', x: x + width - halfHandle, y: y + height - halfHandle },
    { position: 's', x: x + width / 2 - halfHandle, y: y + height - halfHandle },
    { position: 'sw', x: x - halfHandle, y: y + height - halfHandle },
    { position: 'w', x: x - halfHandle, y: y + height / 2 - halfHandle }
  ];
}

/**
 * Find which resize handle (if any) is at a given point
 * @param {number} x - Canvas X coordinate
 * @param {number} y - Canvas Y coordinate
 * @param {Object} element - Canvas element
 * @param {number} handleSize - Size of resize handles
 * @returns {string|null} Handle position or null
 */
export function findResizeHandle(x, y, element, handleSize = 8) {
  const handles = getResizeHandles(element, handleSize);
  
  for (const handle of handles) {
    if (
      x >= handle.x &&
      x <= handle.x + handleSize &&
      y >= handle.y &&
      y <= handle.y + handleSize
    ) {
      return handle.position;
    }
  }
  return null;
}
