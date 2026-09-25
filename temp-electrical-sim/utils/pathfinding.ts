import { ComponentInstance, Wire, ComponentType } from '../types';

const GRID_SIZE = 20;
const WIRE_CROSS_COST = 150; // Increased cost to avoid crossing
const TURN_COST = 1; // Lowered turn cost to allow more flexible paths
const ADJACENT_WIRE_COST = 10; // New cost for being next to another wire

const getComponentDimensions = (type: ComponentType): { width: number, height: number } => {
    // These values are slightly larger than the component icons to create a buffer zone.
    switch (type) {
        case ComponentType.Resistor:
        case ComponentType.Fuse:
            return { width: 70, height: 42 };
        case ComponentType.Switch:
            return { width: 50, height: 34 };
        case ComponentType.PushButton:
            return { width: 50, height: 42 };
        case ComponentType.Transformer:
            return { width: 62, height: 50 };
        case ComponentType.MCB:
        case ComponentType.MotorProtector:
        case ComponentType.RCBO:
            return { width: 50, height: 40 };
        case ComponentType.MCCB:
            return { width: 55, height: 40 };
        case ComponentType.ACB:
            return { width: 60, height: 40 };
        case ComponentType.ContactNO:
        case ComponentType.ContactNC:
            return { width: 26, height: 50 };
        case ComponentType.RelayCoil:
        case ComponentType.ContactorCoil:
             return { width: 50, height: 30 };
        case ComponentType.Contactor:
             return { width: 70, height: 50 };
        case ComponentType.PLCInput:
        case ComponentType.PLCOutput:
            return { width: 34, height: 50 };
        case ComponentType.Junction:
            return { width: 10, height: 10};
        default: // Covers sources, motors, lamps, meters
            return { width: 50, height: 50 };
    }
};

const getRotatedBoundingBox = (component: ComponentInstance): { minX: number, minY: number, maxX: number, maxY: number } => {
    const { width, height } = getComponentDimensions(component.type);
    const { x, y, rotation = 0 } = component;

    const angleRad = rotation * (Math.PI / 180);
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    
    const w2 = width / 2;
    const h2 = height / 2;

    const corners = [
        { x: -w2, y: -h2 }, { x: w2, y: -h2 },
        { x: w2, y: h2 },   { x: -w2, y: h2 },
    ];

    const rotatedCorners = corners.map(p => ({
        x: p.x * cosA - p.y * sinA,
        y: p.x * sinA + p.y * cosA,
    }));
    
    const minX = Math.min(...rotatedCorners.map(p => p.x)) + x;
    const maxX = Math.max(...rotatedCorners.map(p => p.x)) + x;
    const minY = Math.min(...rotatedCorners.map(p => p.y)) + y;
    const maxY = Math.max(...rotatedCorners.map(p => p.y)) + y;
    
    return { minX, minY, maxX, maxY };
};

type GetTerminalPositionFn = (componentId: string, terminalId: string, components: ComponentInstance[]) => {x: number, y: number} | null;

export const findOrthogonalPath = (
  startPos: { x: number; y: number },
  endPos: { x: number; y: number },
  existingComponents: ComponentInstance[],
  existingWires: Wire[],
  getTerminalPosition: GetTerminalPositionFn
): { x: number; y: number }[] => {
  
  interface PathNode {
    x: number; y: number; g: number; h: number; f: number;
    parent: PathNode | null;
    dir: { dx: number; dy: number } | null;
  }
  
  const toGrid = (pos: { x: number; y: number }) => ({
    x: Math.round(pos.x / GRID_SIZE),
    y: Math.round(pos.y / GRID_SIZE),
  });

  const fromGrid = (node: { x: number; y: number }) => ({
    x: node.x * GRID_SIZE,
    y: node.y * GRID_SIZE,
  });

  const startNodeGrid = toGrid(startPos);
  const endNodeGrid = toGrid(endPos);
  
  if (startNodeGrid.x === endNodeGrid.x && startNodeGrid.y === endNodeGrid.y) {
    return [];
  }

  const obstacles = new Set<string>();
  const componentPadding = 1; // in grid units
  existingComponents.forEach(comp => {
    const bbox = getRotatedBoundingBox(comp);

    const minGridX = Math.floor(bbox.minX / GRID_SIZE) - componentPadding;
    const maxGridX = Math.ceil(bbox.maxX / GRID_SIZE) + componentPadding;
    const minGridY = Math.floor(bbox.minY / GRID_SIZE) - componentPadding;
    const maxGridY = Math.ceil(bbox.maxY / GRID_SIZE) + componentPadding;

    for (let i = minGridX; i <= maxGridX; i++) {
      for (let j = minGridY; j <= maxGridY; j++) {
        obstacles.add(`${i},${j}`);
      }
    }
  });

  const wireCosts = new Map<string, number>();
  existingWires.forEach(wire => {
      const start = getTerminalPosition(wire.startComponentId, wire.startTerminalId, existingComponents);
      const end = getTerminalPosition(wire.endComponentId, wire.endTerminalId, existingComponents);
      if (!start || !end) return;

      const vertices = [start, ...(wire.points || []), end];
      for (let i = 0; i < vertices.length - 1; i++) {
          const p1 = toGrid(vertices[i]);
          const p2 = toGrid(vertices[i+1]);
          
          if (p1.x === p2.x) { // Vertical line
              for (let y = Math.min(p1.y, p2.y); y <= Math.max(p1.y, p2.y); y++) {
                  const key = `${p1.x},${y}`;
                  wireCosts.set(key, (wireCosts.get(key) || 0) + WIRE_CROSS_COST);
                  // Add adjacent cost
                  wireCosts.set(`${p1.x - 1},${y}`, (wireCosts.get(`${p1.x - 1},${y}`) || 0) + ADJACENT_WIRE_COST);
                  wireCosts.set(`${p1.x + 1},${y}`, (wireCosts.get(`${p1.x + 1},${y}`) || 0) + ADJACENT_WIRE_COST);
              }
          } else if (p1.y === p2.y) { // Horizontal line
               for (let x = Math.min(p1.x, p2.x); x <= Math.max(p1.x, p2.x); x++) {
                  const key = `${x},${p1.y}`;
                  wireCosts.set(key, (wireCosts.get(key) || 0) + WIRE_CROSS_COST);
                  // Add adjacent cost
                  wireCosts.set(`${x},${p1.y - 1}`, (wireCosts.get(`${x},${p1.y - 1}`) || 0) + ADJACENT_WIRE_COST);
                  wireCosts.set(`${x},${p1.y + 1}`, (wireCosts.get(`${x},${p1.y + 1}`) || 0) + ADJACENT_WIRE_COST);
              }
          }
      }
  });

  obstacles.delete(`${startNodeGrid.x},${startNodeGrid.y}`);
  obstacles.delete(`${endNodeGrid.x},${endNodeGrid.y}`);
  
  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  
  const heuristic = (a: {x:number, y:number}, b: {x:number, y:number}) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  
  const startNode: PathNode = {
    x: startNodeGrid.x, y: startNodeGrid.y, g: 0, h: heuristic(startNodeGrid, endNodeGrid), f: heuristic(startNodeGrid, endNodeGrid), parent: null, dir: null,
  };
  openSet.push(startNode);

  let pathFound = false;
  let resultPath: PathNode[] = [];

  while(openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 1; i < openSet.length; i++) if (openSet[i].f < openSet[lowestIndex].f) lowestIndex = i;
    const currentNode = openSet[lowestIndex];
    
    if (currentNode.x === endNodeGrid.x && currentNode.y === endNodeGrid.y) {
      let temp: PathNode | null = currentNode;
      while(temp) { resultPath.push(temp); temp = temp.parent; }
      pathFound = true;
      break;
    }
    
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${currentNode.x},${currentNode.y}`);
    
    const neighbors = [
      { x: currentNode.x + 1, y: currentNode.y, dir: { dx: 1, dy: 0 } },
      { x: currentNode.x - 1, y: currentNode.y, dir: { dx: -1, dy: 0 } },
      { x: currentNode.x, y: currentNode.y + 1, dir: { dx: 0, dy: 1 } },
      { x: currentNode.x, y: currentNode.y - 1, dir: { dx: 0, dy: -1 } },
    ];
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey) || obstacles.has(neighborKey)) continue;
      
      let gScore = currentNode.g + 1 + (wireCosts.get(neighborKey) || 0);
      if(currentNode.dir && (currentNode.dir.dx !== neighbor.dir.dx || currentNode.dir.dy !== neighbor.dir.dy)) {
          gScore += TURN_COST;
      }

      let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (!neighborNode) {
          neighborNode = {
            x: neighbor.x, y: neighbor.y, g: gScore, h: heuristic(neighbor, endNodeGrid), f: gScore + heuristic(neighbor, endNodeGrid), parent: currentNode, dir: neighbor.dir,
          };
          openSet.push(neighborNode);
      } else if (gScore < neighborNode.g) {
          neighborNode.parent = currentNode;
          neighborNode.g = gScore;
          neighborNode.f = gScore + neighborNode.h;
          neighborNode.dir = neighbor.dir;
      }
    }
  }

  if (pathFound) {
      const reversedPath = resultPath.reverse();
      if (reversedPath.length < 2) return [];
      const simplifiedPoints: {x: number, y: number}[] = [];
      for (let i = 1; i < reversedPath.length - 1; i++) {
        const prevDir = reversedPath[i].dir;
        const nextDir = reversedPath[i+1].dir;
        if (!prevDir || !nextDir || prevDir.dx !== nextDir.dx || prevDir.dy !== nextDir.dy) {
            simplifiedPoints.push(fromGrid(reversedPath[i]));
        }
      }
      return simplifiedPoints;
  }
  
  console.warn("A* pathfinding failed, using fallback.");
  const midX = (startPos.x + endPos.x) / 2;
  const midY = (startPos.y + endPos.y) / 2;
  const dx = Math.abs(startPos.x - endPos.x);
  const dy = Math.abs(startPos.y - endPos.y);
  if (dx > dy) { 
      return [{ x: midX, y: startPos.y }, { x: midX, y: endPos.y }];
  } else {
      return [{ x: startPos.x, y: midY }, { x: endPos.x, y: midY }];
  }
};