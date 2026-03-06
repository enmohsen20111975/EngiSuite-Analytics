/**
 * NodeRenderer Component
 * Renders workflow nodes with ports
 */
import { memo } from 'react';
import { cn } from '../../lib/utils';
import { GripVertical } from 'lucide-react';

// Default port radius
const PORT_RADIUS = 8;

// Domain colors for nodes
const DOMAIN_COLORS = {
  electrical: '#1976d2',
  mechanical: '#f57c00',
  civil: '#388e3c',
  chemical: '#7b1fa2',
  mathematics: '#00796b',
  general: '#455a64',
  default: '#64748b'
};

/**
 * Get color for a domain
 */
export function getDomainColor(domain) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
}

/**
 * NodeRenderer Component
 */
export const NodeRenderer = memo(function NodeRenderer({
  node,
  isSelected = false,
  isHovered = false,
  viewport,
  onPortMouseDown,
  showPorts = true,
  portRadius = PORT_RADIUS,
  customRender
}) {
  const { zoom = 1, offset = { x: 0, y: 0 } } = viewport || {};
  
  // Calculate screen position
  const screenX = node.x * zoom + offset.x;
  const screenY = node.y * zoom + offset.y;
  const screenW = (node.width || 200) * zoom;
  const screenH = (node.height || 100) * zoom;
  
  // Get domain color
  const color = getDomainColor(node.domain);
  
  // Custom render function
  if (customRender) {
    return customRender(node, {
      x: screenX,
      y: screenY,
      width: screenW,
      height: screenH,
      isSelected,
      isHovered,
      zoom
    });
  }
  
  // Default rendering
  return (
    <g
      transform={`translate(${screenX}, ${screenY})`}
      className="node-group"
      data-node-id={node.id}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x={-4 * zoom}
          y={-4 * zoom}
          width={screenW + 8 * zoom}
          height={screenH + 8 * zoom}
          rx={6 * zoom}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4"
          className="pointer-events-none"
        />
      )}
      
      {/* Node shadow */}
      <rect
        x={2 * zoom}
        y={2 * zoom}
        width={screenW}
        height={screenH}
        rx={4 * zoom}
        fill="rgba(0,0,0,0.1)"
        className="pointer-events-none"
      />
      
      {/* Node background */}
      <rect
        width={screenW}
        height={screenH}
        rx={4 * zoom}
        fill="white"
        stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
        strokeWidth={isSelected ? 2 : 1}
        className="drop-shadow-sm"
      />
      
      {/* Node header */}
      <rect
        width={screenW}
        height={28 * zoom}
        rx={4 * zoom}
        fill={color}
        style={{
          clipPath: `inset(0 0 50% 0 round ${4 * zoom}px ${4 * zoom}px 0 0)`
        }}
      />
      
      {/* Grip icon */}
      <g transform={`translate(${6 * zoom}, ${8 * zoom})`}>
        <GripVertical 
          className="pointer-events-none"
          style={{ 
            width: 14 * zoom, 
            height: 14 * zoom,
            color: 'rgba(255,255,255,0.7)'
          }}
        />
      </g>
      
      {/* Node title */}
      <text
        x={24 * zoom}
        y={18 * zoom}
        fontSize={11 * zoom}
        fontWeight="600"
        fill="white"
        className="select-none pointer-events-none"
      >
        {node.name || node.id}
      </text>
      
      {/* Domain badge */}
      <text
        x={24 * zoom}
        y={42 * zoom}
        fontSize={9 * zoom}
        fill="#64748b"
        className="select-none pointer-events-none"
      >
        {node.domain || 'general'}
      </text>
      
      {/* Input ports */}
      {showPorts && node.inputs?.map((input, i) => {
        const portY = 55 * zoom + i * 22 * zoom;
        const isConnected = input.connected;
        
        return (
          <g key={`input-${i}`} className="port-group">
            {/* Port circle */}
            <circle
              cx={0}
              cy={portY}
              r={portRadius * zoom}
              fill={isConnected ? color : 'white'}
              stroke={color}
              strokeWidth={2}
              className="cursor-crosshair hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                if (onPortMouseDown) {
                  onPortMouseDown(node.id, 'input', i, input);
                }
              }}
            />
            
            {/* Port label */}
            <text
              x={14 * zoom}
              y={portY + 3 * zoom}
              fontSize={9 * zoom}
              fill="#64748b"
              className="select-none pointer-events-none"
            >
              {input.name || input.symbol || `In ${i + 1}`}
            </text>
          </g>
        );
      })}
      
      {/* Output ports */}
      {showPorts && node.outputs?.map((output, i) => {
        const portY = 55 * zoom + i * 22 * zoom;
        const isConnected = output.connected;
        
        return (
          <g key={`output-${i}`} className="port-group">
            {/* Port label */}
            <text
              x={screenW - 14 * zoom}
              y={portY + 3 * zoom}
              fontSize={9 * zoom}
              fill="#64748b"
              textAnchor="end"
              className="select-none pointer-events-none"
            >
              {output.name || output.symbol || `Out ${i + 1}`}
            </text>
            
            {/* Port circle */}
            <circle
              cx={screenW}
              cy={portY}
              r={portRadius * zoom}
              fill={isConnected ? '#22c55e' : 'white'}
              stroke="#22c55e"
              strokeWidth={2}
              className="cursor-crosshair hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                if (onPortMouseDown) {
                  onPortMouseDown(node.id, 'output', i, output);
                }
              }}
            />
          </g>
        );
      })}
      
      {/* Resize handle (bottom-right) */}
      {isSelected && (
        <circle
          cx={screenW}
          cy={screenH}
          r={6 * zoom}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          className="cursor-se-resize"
        />
      )}
    </g>
  );
});

/**
 * NodeList Component - Renders multiple nodes
 */
export function NodeList({
  nodes,
  selectedIds = [],
  hoveredId = null,
  viewport,
  onPortMouseDown,
  customRender
}) {
  return (
    <g className="nodes-layer">
      {nodes.map(node => (
        <NodeRenderer
          key={node.id}
          node={node}
          isSelected={selectedIds.includes(node.id)}
          isHovered={hoveredId === node.id}
          viewport={viewport}
          onPortMouseDown={onPortMouseDown}
          customRender={customRender}
        />
      ))}
    </g>
  );
}

export default NodeRenderer;
