import { ComponentInstance } from '../types';

export const getTerminalPosition = (componentId: string, terminalId: string, components: ComponentInstance[]): {x: number, y: number} | null => {
  const component = components.find(c => c.id === componentId);
  if(!component) return null;
  const terminal = component.terminals.find(t => t.id === terminalId);
  if(!terminal) return null;

  const angleRad = (component.rotation || 0) * (Math.PI / 180);
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const rotatedX = terminal.x * cosA - terminal.y * sinA;
  const rotatedY = terminal.x * sinA + terminal.y * cosA;

  return { x: component.x + rotatedX, y: component.y + rotatedY };
};

export const isPointOnSegment = (p: {x: number, y: number}, a: {x: number, y: number}, b: {x: number, y: number}, tolerance: number = 8): boolean => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    
    if (dx === 0 && dy === 0) return false; // a and b are the same point

    const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);

    // Check if projection is on the segment
    if (t < 0 || t > 1) {
        return false;
    }

    const projectionX = a.x + t * dx;
    const projectionY = a.y + t * dy;

    const dist = Math.sqrt((p.x - projectionX)**2 + (p.y - projectionY)**2);

    return dist <= tolerance;
};