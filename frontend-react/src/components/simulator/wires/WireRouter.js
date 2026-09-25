/**
 * WireRouter
 * Smart wire routing algorithm for hydraulic connections
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/WireRouter.js
 */

/**
 * Route a wire between two points avoiding obstacles
 */
export function routeWire(start, end, obstacles, options = {}) {
  const {
    algorithm = 'orthogonal',
    gridSize = 10,
    clearance = 15
  } = options;
  
  if (algorithm === 'orthogonal') {
    return routeOrthogonal(start, end, obstacles, gridSize, clearance);
  } else if (algorithm === 'direct') {
    return [start, end];
  } else if (algorithm === 'manhattan') {
    return routeManhattan(start, end, obstacles, gridSize, clearance);
  }
  
  return [start, end];
}

/**
 * Orthogonal routing (L-shaped or Z-shaped)
 */
function routeOrthogonal(start, end, obstacles, gridSize, clearance) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // If points are close, use direct line
  if (Math.abs(dx) < gridSize && Math.abs(dy) < gridSize) {
    return [start, end];
  }
  
  // Try L-shaped routes
  const route1 = [
    start,
    { x: start.x, y: end.y },
    end
  ];
  
  const route2 = [
    start,
    { x: end.x, y: start.y },
    end
  ];
  
  // Check which route has fewer collisions
  const collisions1 = countCollisions(route1, obstacles, clearance);
  const collisions2 = countCollisions(route2, obstacles, clearance);
  
  if (collisions1 === 0) return route1;
  if (collisions2 === 0) return route2;
  
  // Try Z-shaped route
  const midX = start.x + dx / 2;
  const midY = start.y + dy / 2;
  
  const route3 = [
    start,
    { x: midX, y: start.y },
    { x: midX, y: end.y },
    end
  ];
  
  const route4 = [
    start,
    { x: start.x, y: midY },
    { x: end.x, y: midY },
    end
  ];
  
  const collisions3 = countCollisions(route3, obstacles, clearance);
  const collisions4 = countCollisions(route4, obstacles, clearance);
  
  // Return route with fewest collisions
  const routes = [
    { route: route1, collisions: collisions1 },
    { route: route2, collisions: collisions2 },
    { route: route3, collisions: collisions3 },
    { route: route4, collisions: collisions4 }
  ];
  
  routes.sort((a, b) => a.collisions - b.collisions);
  return routes[0].route;
}

/**
 * Manhattan routing with A* pathfinding
 */
function routeManhattan(start, end, obstacles, gridSize, clearance) {
  // Simplified Manhattan routing - for now just use orthogonal
  return routeOrthogonal(start, end, obstacles, gridSize, clearance);
}

/**
 * Count collisions between route and obstacles
 */
function countCollisions(route, obstacles, clearance) {
  let collisions = 0;
  
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i + 1];
    
    for (const obstacle of obstacles) {
      if (lineIntersectsRect(p1, p2, obstacle, clearance)) {
        collisions++;
      }
    }
  }
  
  return collisions;
}

/**
 * Check if line segment intersects rectangle
 */
function lineIntersectsRect(p1, p2, rect, clearance) {
  const expandedRect = {
    x: rect.x - clearance,
    y: rect.y - clearance,
    width: rect.width + clearance * 2,
    height: rect.height + clearance * 2
  };
  
  // Check if line is completely outside
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);
  
  if (maxX < expandedRect.x || minX > expandedRect.x + expandedRect.width) {
    return false;
  }
  if (maxY < expandedRect.y || minY > expandedRect.y + expandedRect.height) {
    return false;
  }
  
  return true;
}

/**
 * Build obstacle map from components
 */
export function buildObstacleMap(components) {
  return components.map(comp => ({
    x: comp.x,
    y: comp.y,
    width: comp.width || 60,
    height: comp.height || 40,
    id: comp.id
  }));
}

/**
 * Update wire routes after component movement
 */
export function updateWireRoutes(wires, components, options = {}) {
  const obstacles = buildObstacleMap(components);
  
  return wires.map(wire => {
    if (!wire.from || !wire.to) return wire;
    
    const fromComp = components.find(c => c.id === wire.from.componentId);
    const toComp = components.find(c => c.id === wire.to.componentId);
    
    if (!fromComp || !toComp) return wire;
    
    const fromTerminal = fromComp.terminals?.find(t => t.id === wire.from.terminalId);
    const toTerminal = toComp.terminals?.find(t => t.id === wire.to.terminalId);
    
    if (!fromTerminal || !toTerminal) return wire;
    
    const start = {
      x: fromComp.x + fromTerminal.x,
      y: fromComp.y + fromTerminal.y
    };
    
    const end = {
      x: toComp.x + toTerminal.x,
      y: toComp.y + toTerminal.y
    };
    
    // Filter out the connected components from obstacles
    const filteredObstacles = obstacles.filter(
      o => o.id !== fromComp.id && o.id !== toComp.id
    );
    
    const route = routeWire(start, end, filteredObstacles, options);
    
    return {
      ...wire,
      route
    };
  });
}

export default {
  routeWire,
  buildObstacleMap,
  updateWireRoutes
};
