/**
 * ConnectionRenderer Component
 * Renders connections between workflow nodes
 */
import { memo, useMemo } from 'react';
import { cn } from '../../lib/utils';

// Connection colors
const CONNECTION_COLORS = {
  default: '#64748b',
  selected: '#3b82f6',
  hover: '#60a5fa',
  data: '#22c55e',
  error: '#ef4444'
};

/**
 * Calculate bezier curve control points
 */
function calculateBezierPoints(fromX, fromY, toX, toY, curvature = 0.5) {
  const dx = toX - fromX;
  const controlOffset = Math.min(Math.abs(dx) * curvature, 150);
  
  return {
    cp1x: fromX + controlOffset,
    cp1y: fromY,
    cp2x: toX - controlOffset,
    cp2y: toY
  };
}

/**
 * Get connection point on a node
 */
function getConnectionPoint(node, portIndex, portType, zoom = 1) {
  const width = (node.width || 200) * zoom;
  const baseY = 55 * zoom + portIndex * 22 * zoom;
  
  if (portType === 'output') {
    return {
      x: node.x * zoom + width,
      y: node.y * zoom + baseY
    };
  } else {
    return {
      x: node.x * zoom,
      y: node.y * zoom + baseY
    };
  }
}

/**
 * ConnectionRenderer Component
 */
export const ConnectionRenderer = memo(function ConnectionRenderer({
  connection,
  fromNode,
  toNode,
  viewport,
  isSelected = false,
  isHovered = false,
  curvature = 0.5,
  color,
  strokeWidth = 2,
  showArrow = true,
  animated = false,
  onClick,
  onMouseEnter,
  onMouseLeave
}) {
  const { zoom = 1, offset = { x: 0, y: 0 } } = viewport || {};
  
  // Calculate connection points
  const points = useMemo(() => {
    if (!fromNode || !toNode) return null;
    
    const from = getConnectionPoint(fromNode, connection.fromPort || 0, 'output', zoom);
    const to = getConnectionPoint(toNode, connection.toPort || 0, 'input', zoom);
    
    // Apply viewport offset
    from.x += offset.x;
    from.y += offset.y;
    to.x += offset.x;
    to.y += offset.y;
    
    return { from, to };
  }, [fromNode, toNode, connection, zoom, offset]);
  
  if (!points) return null;
  
  const { from, to } = points;
  const bezier = calculateBezierPoints(from.x, from.y, to.x, to.y, curvature);
  
  // Determine color
  const lineColor = color || (
    isSelected ? CONNECTION_COLORS.selected :
    isHovered ? CONNECTION_COLORS.hover :
    CONNECTION_COLORS.default
  );
  
  // Create path
  const path = `M ${from.x} ${from.y} C ${bezier.cp1x} ${bezier.cp1y}, ${bezier.cp2x} ${bezier.cp2y}, ${to.x} ${to.y}`;
  
  // Arrow head calculation
  const arrowAngle = Math.atan2(to.y - bezier.cp2y, to.x - bezier.cp2x);
  const arrowSize = 8 * zoom;
  const arrowPoints = [
    [to.x, to.y],
    [to.x - arrowSize * Math.cos(arrowAngle - Math.PI / 6), to.y - arrowSize * Math.sin(arrowAngle - Math.PI / 6)],
    [to.x - arrowSize * Math.cos(arrowAngle + Math.PI / 6), to.y - arrowSize * Math.sin(arrowAngle + Math.PI / 6)]
  ].map(p => p.join(',')).join(' ');
  
  return (
    <g 
      className="connection-group"
      data-connection-id={connection.id}
    >
      {/* Invisible wider path for easier selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onClick={() => onClick?.(connection)}
        onMouseEnter={() => onMouseEnter?.(connection)}
        onMouseLeave={() => onMouseLeave?.(connection)}
      />
      
      {/* Visible connection path */}
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={cn(
          "transition-colors duration-150",
          animated && "animate-pulse"
        )}
        onClick={() => onClick?.(connection)}
        onMouseEnter={() => onMouseEnter?.(connection)}
        onMouseLeave={() => onMouseLeave?.(connection)}
      />
      
      {/* Animated dash (for data flow) */}
      {animated && (
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="8 8"
          className="animate-dash"
        />
      )}
      
      {/* Arrow head */}
      {showArrow && (
        <polygon
          points={arrowPoints}
          fill={lineColor}
          className="pointer-events-none"
        />
      )}
      
      {/* Connection status indicator */}
      {connection.status && (
        <circle
          cx={(from.x + to.x) / 2}
          cy={(from.y + to.y) / 2}
          r={6}
          fill={
            connection.status === 'success' ? '#22c55e' :
            connection.status === 'error' ? '#ef4444' :
            '#f59e0b'
          }
          className="pointer-events-none"
        />
      )}
    </g>
  );
});

/**
 * ConnectionList Component - Renders multiple connections
 */
export function ConnectionList({
  connections,
  nodes,
  viewport,
  selectedIds = [],
  hoveredId = null,
  onClick,
  onMouseEnter,
  onMouseLeave
}) {
  return (
    <g className="connections-layer">
      {connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) return null;
        
        return (
          <ConnectionRenderer
            key={conn.id}
            connection={conn}
            fromNode={fromNode}
            toNode={toNode}
            viewport={viewport}
            isSelected={selectedIds.includes(conn.id)}
            isHovered={hoveredId === conn.id}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        );
      })}
    </g>
  );
}

/**
 * ConnectionPreview Component - Shows preview while creating connection
 */
export const ConnectionPreview = memo(function ConnectionPreview({
  startPoint,
  endPoint,
  viewport,
  isValid = true
}) {
  if (!startPoint || !endPoint) return null;
  
  const { zoom = 1, offset = { x: 0, y: 0 } } = viewport || {};
  
  const fromX = startPoint.x * zoom + offset.x;
  const fromY = startPoint.y * zoom + offset.y;
  const toX = endPoint.x * zoom + offset.x;
  const toY = endPoint.y * zoom + offset.y;
  
  const bezier = calculateBezierPoints(fromX, fromY, toX, toY);
  const path = `M ${fromX} ${fromY} C ${bezier.cp1x} ${bezier.cp1y}, ${bezier.cp2x} ${bezier.cp2y}, ${toX} ${toY}`;
  
  return (
    <g className="connection-preview">
      <path
        d={path}
        fill="none"
        stroke={isValid ? '#22c55e' : '#ef4444'}
        strokeWidth={2}
        strokeDasharray="8 4"
        className="pointer-events-none"
      />
      <circle
        cx={toX}
        cy={toY}
        r={6}
        fill={isValid ? '#22c55e' : '#ef4444'}
        className="pointer-events-none"
      />
    </g>
  );
});

/**
 * StraightConnectionRenderer - For simple straight lines
 */
export const StraightConnectionRenderer = memo(function StraightConnectionRenderer({
  connection,
  fromNode,
  toNode,
  viewport,
  isSelected = false,
  color,
  strokeWidth = 2,
  onClick
}) {
  const { zoom = 1, offset = { x: 0, y: 0 } } = viewport || {};
  
  if (!fromNode || !toNode) return null;
  
  const from = getConnectionPoint(fromNode, connection.fromPort || 0, 'output', zoom);
  const to = getConnectionPoint(toNode, connection.toPort || 0, 'input', zoom);
  
  from.x += offset.x;
  from.y += offset.y;
  to.x += offset.x;
  to.y += offset.y;
  
  const lineColor = color || (isSelected ? CONNECTION_COLORS.selected : CONNECTION_COLORS.default);
  
  return (
    <g className="connection-group" data-connection-id={connection.id}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={lineColor}
        strokeWidth={strokeWidth}
        className="cursor-pointer hover:stroke-blue-400"
        onClick={() => onClick?.(connection)}
      />
    </g>
  );
});

export default ConnectionRenderer;
