/**
 * Canvas Serialization Utilities
 * Handles save/load/export of canvas state
 */

/**
 * Serialize canvas state to JSON
 * @param {Object} state - Canvas state
 * @returns {string} JSON string
 */
export function serializeCanvas(state) {
  const serialized = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    viewport: {
      zoom: state.viewport?.zoom || 1,
      offset: state.viewport?.offset || { x: 0, y: 0 }
    },
    elements: state.elements || [],
    connections: state.connections || [],
    metadata: {
      name: state.metadata?.name || 'Untitled',
      type: state.metadata?.type || 'canvas',
      description: state.metadata?.description || ''
    }
  };
  
  return JSON.stringify(serialized, null, 2);
}

/**
 * Deserialize JSON to canvas state
 * @param {string} json - JSON string
 * @returns {Object} Canvas state
 */
export function deserializeCanvas(json) {
  try {
    const parsed = JSON.parse(json);
    
    // Version migration if needed
    const version = parsed.version || '1.0';
    const migrated = migrateCanvasData(parsed, version);
    
    return {
      viewport: migrated.viewport || { zoom: 1, offset: { x: 0, y: 0 } },
      elements: migrated.elements || [],
      connections: migrated.connections || [],
      metadata: migrated.metadata || { name: 'Untitled', type: 'canvas' }
    };
  } catch (error) {
    console.error('Failed to deserialize canvas:', error);
    return getDefaultCanvasState();
  }
}

/**
 * Get default canvas state
 * @returns {Object} Default state
 */
export function getDefaultCanvasState() {
  return {
    viewport: { zoom: 1, offset: { x: 0, y: 0 } },
    elements: [],
    connections: [],
    metadata: { name: 'Untitled', type: 'canvas' }
  };
}

/**
 * Migrate canvas data from older versions
 * @param {Object} data - Parsed canvas data
 * @param {string} version - Data version
 * @returns {Object} Migrated data
 */
function migrateCanvasData(data, version) {
  // Currently only version 1.0 exists
  // Add migration logic here when versions change
  return data;
}

/**
 * Export canvas to SVG
 * @param {Object} state - Canvas state
 * @param {Object} options - Export options
 * @returns {string} SVG string
 */
export function exportToSVG(state, options = {}) {
  const {
    width = 1200,
    height = 800,
    backgroundColor = '#ffffff',
    padding = 50
  } = options;
  
  // Calculate bounding box
  const bbox = calculateBoundingBox(state.elements);
  const viewBox = {
    x: bbox.x - padding,
    y: bbox.y - padding,
    width: bbox.width + padding * 2,
    height: bbox.height + padding * 2
  };
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${width}" 
     height="${height}" 
     viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}">
  <rect x="${viewBox.x}" y="${viewBox.y}" width="${viewBox.width}" height="${viewBox.height}" fill="${backgroundColor}"/>
`;
  
  // Render connections first (behind elements)
  if (state.connections) {
    state.connections.forEach(conn => {
      svg += renderConnectionToSVG(conn, state.elements);
    });
  }
  
  // Render elements
  if (state.elements) {
    state.elements.forEach(element => {
      svg += renderElementToSVG(element);
    });
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * Render an element to SVG string
 * @param {Object} element - Canvas element
 * @returns {string} SVG string
 */
function renderElementToSVG(element) {
  const { type, x, y, width = 100, height = 50, fill = '#ffffff', stroke = '#000000', strokeWidth = 2 } = element;
  
  switch (type) {
    case 'rectangle':
    case 'node':
      return `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="4"/>
`;
      
    case 'circle':
      const radius = element.radius || Math.min(width, height) / 2;
      const cx = x + radius;
      const cy = y + radius;
      return `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
`;
      
    case 'ellipse':
      const ecx = x + width / 2;
      const ecy = y + height / 2;
      return `  <ellipse cx="${ecx}" cy="${ecy}" rx="${width / 2}" ry="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
`;
      
    case 'line':
      return `  <line x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
`;
      
    case 'arrow':
      const arrowHead = createArrowHead(element);
      return `  <line x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
  <polygon points="${arrowHead}" fill="${stroke}"/>
`;
      
    case 'text':
      const textContent = element.text || '';
      const fontSize = element.fontSize || 14;
      return `  <text x="${x}" y="${y + fontSize}" font-size="${fontSize}" fill="${stroke}">${escapeXML(textContent)}</text>
`;
      
    case 'path':
    case 'freehand':
      if (element.points && element.points.length > 0) {
        const pathData = element.points.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');
        return `  <path d="${pathData}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
`;
      }
      return '';
      
    default:
      return `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
`;
  }
}

/**
 * Render a connection to SVG
 * @param {Object} connection - Connection object
 * @param {Array} elements - Array of elements
 * @returns {string} SVG string
 */
function renderConnectionToSVG(connection, elements) {
  const fromElement = elements.find(el => el.id === connection.from);
  const toElement = elements.find(el => el.id === connection.to);
  
  if (!fromElement || !toElement) return '';
  
  // Calculate connection points
  const fromPoint = getConnectionPoint(fromElement, connection.fromPort, 'output');
  const toPoint = getConnectionPoint(toElement, connection.toPort, 'input');
  
  // Create bezier curve
  const dx = toPoint.x - fromPoint.x;
  const controlOffset = Math.min(Math.abs(dx) / 2, 100);
  
  const path = `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x + controlOffset} ${fromPoint.y}, ${toPoint.x - controlOffset} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
  
  return `  <path d="${path}" fill="none" stroke="#64748b" stroke-width="2"/>
`;
}

/**
 * Get connection point on an element
 * @param {Object} element - Element object
 * @param {number} portIndex - Port index
 * @param {string} type - 'input' or 'output'
 * @returns {Object} Point {x, y}
 */
function getConnectionPoint(element, portIndex = 0, type) {
  const width = element.width || 200;
  const height = element.height || 100;
  
  if (type === 'output') {
    return {
      x: element.x + width,
      y: element.y + 30 + portIndex * 25
    };
  } else {
    return {
      x: element.x,
      y: element.y + 30 + portIndex * 25
    };
  }
}

/**
 * Create arrow head points
 * @param {Object} line - Line with x1, y1, x2, y2
 * @param {number} size - Arrow head size
 * @returns {string} SVG polygon points
 */
function createArrowHead(line, size = 10) {
  const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
  const x = line.x2;
  const y = line.y2;
  
  const p1 = {
    x: x - size * Math.cos(angle - Math.PI / 6),
    y: y - size * Math.sin(angle - Math.PI / 6)
  };
  const p2 = {
    x: x - size * Math.cos(angle + Math.PI / 6),
    y: y - size * Math.sin(angle + Math.PI / 6)
  };
  
  return `${x},${y} ${p1.x},${p1.y} ${p2.x},${p2.y}`;
}

/**
 * Calculate bounding box of elements
 * @param {Array} elements - Array of elements
 * @returns {Object} Bounding box {x, y, width, height}
 */
function calculateBoundingBox(elements) {
  if (!elements || elements.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }
  
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  elements.forEach(el => {
    const x = el.x || el.x1 || 0;
    const y = el.y || el.y1 || 0;
    const width = el.width || (el.x2 ? el.x2 - el.x1 : 100);
    const height = el.height || (el.y2 ? el.y2 - el.y1 : 50);
    
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
 * Escape XML special characters
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
function escapeXML(str) {
  const XML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => XML_ENTITIES[char]);
}

/**
 * Export canvas to PNG (returns data URL)
 * @param {Object} state - Canvas state
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Export options
 * @returns {Promise<string>} Data URL
 */
export async function exportToPNG(state, canvas, options = {}) {
  const {
    width = 1200,
    height = 800,
    backgroundColor = '#ffffff',
    scale = 2
  } = options;
  
  return new Promise((resolve) => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width * scale;
    exportCanvas.height = height * scale;
    
    const ctx = exportCanvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Apply viewport transform
    ctx.save();
    ctx.translate(state.viewport?.offset?.x || 0, state.viewport?.offset?.y || 0);
    ctx.scale(state.viewport?.zoom || 1, state.viewport?.zoom || 1);
    
    // Render elements (this would need a proper renderer)
    // For now, copy from source canvas if available
    if (canvas) {
      ctx.drawImage(canvas, 0, 0);
    }
    
    ctx.restore();
    
    resolve(exportCanvas.toDataURL('image/png'));
  });
}

/**
 * Generate thumbnail from canvas state
 * @param {Object} state - Canvas state
 * @param {number} size - Thumbnail size (width and height)
 * @returns {Promise<string>} Base64 thumbnail
 */
export async function generateThumbnail(state, size = 200) {
  // Create a simple thumbnail representation
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, size, size);
  
  // Draw simplified representation
  if (state.elements && state.elements.length > 0) {
    const bbox = calculateBoundingBox(state.elements);
    const scale = Math.min(
      (size - 20) / bbox.width,
      (size - 20) / bbox.height,
      1
    );
    
    const offsetX = (size - bbox.width * scale) / 2 - bbox.x * scale;
    const offsetY = (size - bbox.height * scale) / 2 - bbox.y * scale;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Draw elements as simple rectangles
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1 / scale;
    
    state.elements.forEach(el => {
      ctx.fillRect(el.x, el.y, el.width || 100, el.height || 50);
      ctx.strokeRect(el.x, el.y, el.width || 100, el.height || 50);
    });
    
    ctx.restore();
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Validate canvas state
 * @param {Object} state - Canvas state to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateCanvasState(state) {
  const errors = [];
  
  if (!state) {
    return { valid: false, errors: ['State is null or undefined'] };
  }
  
  // Check viewport
  if (state.viewport) {
    if (typeof state.viewport.zoom !== 'number' || state.viewport.zoom <= 0) {
      errors.push('Invalid viewport zoom');
    }
    if (!state.viewport.offset || typeof state.viewport.offset.x !== 'number') {
      errors.push('Invalid viewport offset');
    }
  }
  
  // Check elements
  if (state.elements && Array.isArray(state.elements)) {
    state.elements.forEach((el, index) => {
      if (!el.id) {
        errors.push(`Element at index ${index} missing id`);
      }
      if (!el.type) {
        errors.push(`Element at index ${index} missing type`);
      }
    });
  }
  
  // Check connections
  if (state.connections && Array.isArray(state.connections)) {
    state.connections.forEach((conn, index) => {
      if (!conn.from || !conn.to) {
        errors.push(`Connection at index ${index} missing from or to`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
