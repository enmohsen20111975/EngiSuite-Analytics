/**
 * React-Flow Custom Edges for Electrical Wiring
 * Supports 3-phase color coding, cable sizing, and wire types
 */
import React from 'react';
import { getBezierPath, getStraightPath, getSmoothStepPath } from '@xyflow/react';
import { PhaseColors } from '../definitions/electricalComponents';

// Wire type configurations
export const WireTypes = {
  SINGLE_CORE: 'single',
  THREE_CORE: 'three_core',
  FOUR_CORE: 'four_core',
  CONTROL: 'control',
  EARTH: 'earth',
};

// Cable size options (mm²)
export const CableSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];

// Get color for wire based on phase
const getWireColor = (phase, wireType = WireTypes.SINGLE_CORE) => {
  switch (phase) {
    case 'a':
    case 'ac_phase_a':
    case 'l1':
      return PhaseColors.A;
    case 'b':
    case 'ac_phase_b':
    case 'l2':
      return PhaseColors.B;
    case 'c':
    case 'ac_phase_c':
    case 'l3':
      return PhaseColors.C;
    case 'n':
    case 'neutral':
      return PhaseColors.N;
    case 'e':
    case 'earth':
    case 'pe':
      return PhaseColors.E;
    case 'dc_positive':
      return PhaseColors.DC_P;
    case 'dc_negative':
      return PhaseColors.DC_N;
    case 'control':
    case 'signal':
      return '#888888';
    default:
      return '#666666';
  }
};

// Get stroke width based on cable size
const getStrokeWidth = (size) => {
  if (size <= 2.5) return 2;
  if (size <= 6) return 3;
  if (size <= 16) return 4;
  if (size <= 50) return 5;
  if (size <= 120) return 6;
  if (size <= 240) return 7;
  return 8;
};

// Base edge component
const BaseEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd,
  pathType = 'bezier',
}) => {
  const { phase = 'a', cableSize = 2.5, wireType = WireTypes.SINGLE_CORE, current = 0, active = false } = data;
  
  // Get path based on type
  let edgePath;
  switch (pathType) {
    case 'straight':
      [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
      break;
    case 'step':
      [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      });
      break;
    case 'smoothstep':
      [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 10,
      });
      break;
    default:
      [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
  }
  
  const wireColor = getWireColor(phase, wireType);
  const strokeWidth = getStrokeWidth(cableSize);
  
  // Animation for current flow
  const strokeDasharray = active ? '5,5' : 'none';
  const animationStyle = active ? {
    strokeDashoffset: 0,
    animation: 'dash 1s linear infinite',
  } : {};
  
  return (
    <>
      <style>
        {active && `
          @keyframes dash {
            to {
              stroke-dashoffset: -10;
            }
          }
        `}
      </style>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: wireColor,
          strokeWidth,
          fill: 'none',
          strokeDasharray,
          ...animationStyle,
          filter: active ? `drop-shadow(0 0 3px ${wireColor})` : 'none',
        }}
        markerEnd={markerEnd}
      />
      {/* Cable label */}
      {cableSize > 2.5 && (
        <text
          style={{
            fontSize: '8px',
            fill: '#666',
          }}
        >
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {cableSize}mm²
          </textPath>
        </text>
      )}
    </>
  );
};

// Single phase wire edge
export const SinglePhaseEdge = (props) => {
  return <BaseEdge {...props} pathType="bezier" />;
};

// Three-phase wire edge (shows all 3 phases)
export const ThreePhaseEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
}) => {
  const { cableSize = 2.5, currents = [0, 0, 0], active = false } = data;
  const strokeWidth = getStrokeWidth(cableSize);
  
  // Calculate offset for parallel lines
  const offset = strokeWidth + 2;
  
  // Get bezier paths for each phase
  const phases = ['a', 'b', 'c'];
  const offsets = [-offset, 0, offset];
  
  return (
    <>
      {phases.map((phase, index) => {
        // Calculate perpendicular offset
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const perpAngle = angle + Math.PI / 2;
        const dx = Math.cos(perpAngle) * offsets[index];
        const dy = Math.sin(perpAngle) * offsets[index];
        
        const [edgePath] = getBezierPath({
          sourceX: sourceX + dx,
          sourceY: sourceY + dy,
          targetX: targetX + dx,
          targetY: targetY + dy,
          sourcePosition,
          targetPosition,
        });
        
        const phaseActive = currents[index] > 0;
        const wireColor = getWireColor(phase);
        
        return (
          <path
            key={`${id}-${phase}`}
            id={`${id}-${phase}`}
            className="react-flow__edge-path"
            d={edgePath}
            style={{
              ...style,
              stroke: wireColor,
              strokeWidth: strokeWidth * 0.8,
              fill: 'none',
              strokeDasharray: phaseActive ? '5,5' : 'none',
              filter: phaseActive ? `drop-shadow(0 0 2px ${wireColor})` : 'none',
            }}
          />
        );
      })}
      {/* Cable label */}
      <text
        style={{
          fontSize: '8px',
          fill: '#666',
        }}
      >
        <textPath href={`#${id}-a`} startOffset="50%" textAnchor="middle">
          3C × {cableSize}mm²
        </textPath>
      </text>
    </>
  );
};

// Four-core cable edge (3 phases + neutral)
export const FourCoreEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
}) => {
  const { cableSize = 2.5, currents = [0, 0, 0, 0], active = false } = data;
  const strokeWidth = getStrokeWidth(cableSize);
  
  // Calculate offset for parallel lines
  const offset = strokeWidth + 1;
  
  // Get bezier paths for each phase
  const phases = ['a', 'b', 'c', 'n'];
  const offsets = [-offset * 1.5, -offset * 0.5, offset * 0.5, offset * 1.5];
  
  return (
    <>
      {phases.map((phase, index) => {
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const perpAngle = angle + Math.PI / 2;
        const dx = Math.cos(perpAngle) * offsets[index];
        const dy = Math.sin(perpAngle) * offsets[index];
        
        const [edgePath] = getBezierPath({
          sourceX: sourceX + dx,
          sourceY: sourceY + dy,
          targetX: targetX + dx,
          targetY: targetY + dy,
          sourcePosition,
          targetPosition,
        });
        
        const phaseActive = currents[index] > 0;
        const wireColor = getWireColor(phase);
        
        return (
          <path
            key={`${id}-${phase}`}
            id={`${id}-${phase}`}
            className="react-flow__edge-path"
            d={edgePath}
            style={{
              ...style,
              stroke: wireColor,
              strokeWidth: strokeWidth * 0.7,
              fill: 'none',
              strokeDasharray: phaseActive ? '4,4' : 'none',
              filter: phaseActive ? `drop-shadow(0 0 2px ${wireColor})` : 'none',
            }}
          />
        );
      })}
      {/* Cable label */}
      <text
        style={{
          fontSize: '8px',
          fill: '#666',
        }}
      >
        <textPath href={`#${id}-a`} startOffset="50%" textAnchor="middle">
          4C × {cableSize}mm²
        </textPath>
      </text>
    </>
  );
};

// Control wire edge (dashed gray)
export const ControlEdge = (props) => {
  return (
    <BaseEdge
      {...props}
      data={{ ...props.data, phase: 'control' }}
      pathType="smoothstep"
    />
  );
};

// Earth wire edge (green/yellow striped)
export const EarthEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  
  return (
    <>
      {/* Green base */}
      <path
        id={`${id}-green`}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: '#00ff00',
          strokeWidth: 3,
          fill: 'none',
        }}
      />
      {/* Yellow stripes */}
      <path
        id={`${id}-yellow`}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: '#ffff00',
          strokeWidth: 3,
          fill: 'none',
          strokeDasharray: '8,8',
        }}
      />
    </>
  );
};

// Orthogonal edge for industrial diagrams
export const OrthogonalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
}) => {
  const { phase = 'a', cableSize = 2.5, active = false } = data;
  
  // Calculate orthogonal path
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  // Determine path based on direction
  let path;
  if (Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY)) {
    // Horizontal first, then vertical
    path = `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
  } else {
    // Vertical first, then horizontal
    path = `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
  }
  
  const wireColor = getWireColor(phase);
  const strokeWidth = getStrokeWidth(cableSize);
  
  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={path}
      style={{
        ...style,
        stroke: wireColor,
        strokeWidth,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeDasharray: active ? '5,5' : 'none',
        filter: active ? `drop-shadow(0 0 3px ${wireColor})` : 'none',
      }}
    />
  );
};

// Power flow edge with arrow
export const PowerFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd,
}) => {
  const { power = 0, voltage = 400, phase = 'a' } = data;
  const wireColor = getWireColor(phase);
  const active = power > 0;
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  
  // Calculate midpoint for power label
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: wireColor,
          strokeWidth: active ? 4 : 2,
          fill: 'none',
          strokeDasharray: active ? '8,4' : 'none',
          filter: active ? `drop-shadow(0 0 4px ${wireColor})` : 'none',
        }}
        markerEnd={markerEnd}
      />
      {/* Power flow label */}
      {active && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x="-25"
            y="-10"
            width="50"
            height="20"
            fill="white"
            stroke={wireColor}
            strokeWidth="1"
            rx="3"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="bold"
            fill={wireColor}
          >
            {power.toFixed(1)} kW
          </text>
        </g>
      )}
    </>
  );
};

// Edge type map
export const edgeTypes = {
  default: SinglePhaseEdge,
  single: SinglePhaseEdge,
  three_phase: ThreePhaseEdge,
  four_core: FourCoreEdge,
  control: ControlEdge,
  earth: EarthEdge,
  orthogonal: OrthogonalEdge,
  power_flow: PowerFlowEdge,
};

export default edgeTypes;
