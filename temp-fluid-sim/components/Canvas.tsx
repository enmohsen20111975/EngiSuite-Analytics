
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useCircuitStore } from '../hooks/useCircuitStore';
import { CircuitComponent, ComponentType, Point, Connection } from '../types';
import * as Icons from './icons';
import { componentLibrary } from '../data/componentLibrary';

const COMPONENT_SIZE = 80;
const GRID_SIZE = 20;

const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

const ComponentTooltip: React.FC<{ state: Record<string, any> }> = ({ state }) => {
    const formattedState = Object.entries(state).map(([key, value]) => {
        let displayValue = String(value);
        if (typeof value === 'number') {
            displayValue = value.toFixed(2);
        } else if (typeof value === 'boolean') {
            displayValue = value ? 'ON' : 'OFF';
        }
        return { key, value: displayValue };
    });

    if (formattedState.length === 0) return null;

    return (
        <div className="absolute top-0 -right-2 translate-x-full w-max bg-card/90 backdrop-blur-sm p-2 rounded shadow-lg border border-border z-50 text-xs font-mono pointer-events-none">
            {formattedState.map(({ key, value }) => (
                <div key={key} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="text-primary font-semibold">{value}</span>
                </div>
            ))}
        </div>
    );
};

// Helper component for rendering individual circuit components
const ComponentRenderer: React.FC<{ 
    component: CircuitComponent;
    isSelected: boolean;
    showLabels: boolean;
    onIoPortClick: (componentId: string, ioId: string) => void;
    onMouseDown: (e: React.MouseEvent, componentId: string) => void;
    onDoubleClick: (e: React.MouseEvent, componentId: string) => void;
    onRotateStart: (e: React.MouseEvent, componentId: string) => void;
}> = ({ component, isSelected, showLabels, onIoPortClick, onMouseDown, onDoubleClick, onRotateStart }) => {
  const Icon = Icons[component.type as keyof typeof Icons] || Icons.Fallback;
  const [isHovered, setIsHovered] = useState(false);
  
  // Cylinder animation based on simulation state
  let transform = '';
  if (component.type === ComponentType.DoubleActingCylinder && component.state.position !== undefined) {
     const extension = component.state.position * 50; // Simple scaling for visualization
     transform = `translateX(${extension}px)`;
  }
  
  const isPressed = (component.type === ComponentType.PushButton || component.type === ComponentType.EStopButton) && component.state.isPressed;
  const isPumpActive = component.type === ComponentType.HydraulicPump && component.state.isActive;
  
  return (
    <div
      style={{ 
        left: component.position.x, 
        top: component.position.y,
        width: COMPONENT_SIZE,
        height: COMPONENT_SIZE,
      }}
      className="absolute group select-none"
      onMouseDown={(e) => onMouseDown(e, component.id)}
      onDoubleClick={(e) => onDoubleClick(e, component.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        style={{ transform: `rotate(${component.rotation}deg)` }}
        className="relative w-full h-full"
      >
        <div style={{transform}} className="transition-transform duration-100 ease-linear cursor-pointer w-full h-full">
          <Icon className={`h-full w-full ${isPressed ? 'text-green-400' : 'text-foreground'}`} isPumpActive={isPumpActive} isPressed={isPressed}/>
        </div>
        
        {isHovered && <ComponentTooltip state={component.state} />}
        
        {/* Render IO ports */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
          {component.io.map(port => (
            <div
              key={port.id}
              style={{
                left: `${port.position.x}%`,
                top: `${port.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute w-3 h-3 bg-background border-2 border-primary rounded-full cursor-crosshair hover:bg-primary"
              onMouseDown={(e) => { // Use onMouseDown to prevent triggering drag
                e.stopPropagation(); 
                onIoPortClick(component.id, port.id);
              }}
              onClick={(e) => e.stopPropagation()} // Prevent component selection
            />
          ))}
        </div>
      </div>
      
      {/* Selection highlight */}
      {isSelected && (
          <div 
            className="absolute top-0 left-0 w-full h-full border-2 border-blue-500/80 rounded-md pointer-events-none"
            style={{ transform: `rotate(${component.rotation}deg)` }}
          />
      )}

      {/* Rotation handle */}
      {isSelected && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-alias"
          onMouseDown={(e) => {
              e.stopPropagation();
              onRotateStart(e, component.id);
          }}
        />
      )}

      {showLabels && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs bg-card px-1 rounded whitespace-nowrap">
          {component.label}
        </div>
      )}
    </div>
  );
};

interface CanvasProps {
    updateComponentState: (id: string, state: object) => void;
}

const Canvas: React.FC<CanvasProps> = ({ updateComponentState: updateComponentAndWorkerState }) => {
  const store = useCircuitStore();
  const { circuit, selectedComponentId, selectedConnectionId, showLabels, zoom } = store;
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ id: string, startPosition: Point, startMouse: Point } | null>(null);
  const [rotatingState, setRotatingState] = useState<string | null>(null);
  const [vertexDragState, setVertexDragState] = useState<{ connId: string; vertexIndex: number; } | null>(null);


  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    const type = event.dataTransfer.getData('application/reactflow') as ComponentType;
    if (!type) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
        x: snapToGrid((event.clientX - rect.left) / zoom - (COMPONENT_SIZE / 2)),
        y: snapToGrid((event.clientY - rect.top) / zoom - (COMPONENT_SIZE / 2)),
    };
    
    const baseComponent = componentLibrary.find(c => c.type === type);
    if (!baseComponent) return;

    const newComponent: CircuitComponent = {
      ...JSON.parse(JSON.stringify(baseComponent)), // Deep copy
      id: `${type}_${Date.now()}`,
      position,
      rotation: 0,
      state: {}, // Initialize dynamic state
    };

    store.addComponent(newComponent);
  }, [store, zoom]);

  const onCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking on the background & cancel connection drawing
    if (e.target === e.currentTarget) {
        store.selectComponent(null);
        store.selectConnection(null);
        store.setConnectionStartPoint(null);
    }
  }

  const handleComponentMouseDown = (e: React.MouseEvent, componentId: string) => {
    store.selectComponent(componentId);
    const component = circuit?.components.find(c => c.id === componentId);
    if (!component) return;

    setDragState({
      id: componentId,
      startPosition: component.position,
      startMouse: { x: e.clientX, y: e.clientY }
    });
  }
  
  const handleComponentDoubleClick = (e: React.MouseEvent, componentId: string) => {
      e.stopPropagation();
      const component = circuit?.components.find(c => c.id === componentId);
      if (!component) return;

      if (component.type === ComponentType.PushButton) {
          const currentState = component.state.isPressed ?? false;
          updateComponentAndWorkerState(component.id, { isPressed: !currentState });
      }
  };

  const handleRotateStart = (e: React.MouseEvent, componentId: string) => {
    setRotatingState(componentId);
  }
  
  const onMouseMove = (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const currentMousePos = {
          x: (e.clientX - rect.left) / zoom,
          y: (e.clientY - rect.top) / zoom,
      };
      setMousePosition(currentMousePos);
      
      if (vertexDragState && circuit) {
        const { connId, vertexIndex } = vertexDragState;
        const conn = circuit.connections.find(c => c.id === connId);
        // BUG FIX: Added boundary check to prevent crash when dragging a newly created vertex before state has updated.
        if (conn?.vertices && vertexIndex < conn.vertices.length) {
            const newVertices = [...conn.vertices];
            newVertices[vertexIndex] = { 
                x: snapToGrid(currentMousePos.x), 
                y: snapToGrid(currentMousePos.y) 
            };
            store.updateConnectionVertices(connId, newVertices);
        }
      } else if (dragState) {
          const dx = e.clientX - dragState.startMouse.x;
          const dy = e.clientY - dragState.startMouse.y;
          const newX = snapToGrid(dragState.startPosition.x + dx / zoom);
          const newY = snapToGrid(dragState.startPosition.y + dy / zoom);
          store.updateComponentPosition(dragState.id, newX, newY);
      } else if (rotatingState && circuit) {
          const component = circuit.components.find(c => c.id === rotatingState);
          if (!component) return;
          
          const centerX = component.position.x + COMPONENT_SIZE / 2;
          const centerY = component.position.y + COMPONENT_SIZE / 2;
          
          const angleRad = Math.atan2(currentMousePos.y - centerY, currentMousePos.x - centerX);
          const angleDeg = angleRad * (180 / Math.PI) + 90; // Add 90deg offset for correct handle position
          store.updateComponentRotation(rotatingState, angleDeg);
      }
  }
  
  const onMouseUp = () => {
    setDragState(null);
    setRotatingState(null);
    setVertexDragState(null);
  }

  const handleIoPortClick = (componentId: string, ioId: string) => {
    if (store.isSimulationRunning) return;
    if (!store.connectionStartPoint) {
      store.setConnectionStartPoint({ componentId, ioId });
    } else {
      if (store.connectionStartPoint.componentId === componentId && store.connectionStartPoint.ioId === ioId) {
        return; 
      }
      store.addConnection({ componentId, ioId });
    }
  };

  const handleVertexMouseDown = (e: React.MouseEvent, connId: string, vertexIndex: number) => {
    e.stopPropagation();
    setVertexDragState({ connId, vertexIndex });
  };
  
  const handleMidpointMouseDown = (e: React.MouseEvent, conn: Connection, insertIndex: number, position: Point) => {
    e.stopPropagation();
    const newVertices = [...(conn.vertices || [])];
    newVertices.splice(insertIndex, 0, position);
    store.updateConnectionVertices(conn.id, newVertices);
    setVertexDragState({ connId: conn.id, vertexIndex: insertIndex });
  };
  
  const getIoPortAbsolutePosition = (componentId: string, ioId: string): Point | null => {
      if (!circuit) return null;
      const component = circuit.components.find(c => c.id === componentId);
      if (!component) return null;
      const port = component.io.find(p => p.id === ioId);
      if (!port) return null;

      const rad = component.rotation * (Math.PI / 180);
      const centerX = COMPONENT_SIZE / 2;
      const centerY = COMPONENT_SIZE / 2;
      const portX = (port.position.x / 100) * COMPONENT_SIZE;
      const portY = (port.position.y / 100) * COMPONENT_SIZE;

      const rotatedX = (portX - centerX) * Math.cos(rad) - (portY - centerY) * Math.sin(rad) + centerX;
      const rotatedY = (portX - centerX) * Math.sin(rad) + (portY - centerY) * Math.cos(rad) + centerY;

      return {
          x: component.position.x + rotatedX,
          y: component.position.y + rotatedY,
      };
  };

  const getIoPortAbsoluteDirection = (component: CircuitComponent, ioId: string): Point => {
    const port = component.io.find(p => p.id === ioId);
    if (!port) return { x: 0, y: 1 }; // Default down

    const center = { x: 50, y: 50 };
    const relativePos = { x: port.position.x - center.x, y: port.position.y - center.y };

    let dir: Point;
    if (Math.abs(relativePos.x) > Math.abs(relativePos.y)) {
      dir = { x: Math.sign(relativePos.x), y: 0 };
    } else {
      dir = { x: 0, y: Math.sign(relativePos.y) || 1 }; // Default to down if at center
    }

    const rad = component.rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotatedDir = {
      x: Math.round(dir.x * cos - dir.y * sin),
      y: Math.round(dir.x * sin + dir.y * cos),
    };
    return rotatedDir;
  };

  const calculateConnectionPath = useCallback((conn: Connection): Point[] => {
    if (!circuit) return [];
    
    const fromPos = getIoPortAbsolutePosition(conn.from.componentId, conn.from.ioId);
    const toPos = getIoPortAbsolutePosition(conn.to.componentId, conn.to.ioId);
    const fromComponent = circuit.components.find(c => c.id === conn.from.componentId);
    const toComponent = circuit.components.find(c => c.id === conn.to.componentId);
    
    if (!fromPos || !toPos || !fromComponent || !toComponent) return [];

    if (conn.vertices && conn.vertices.length > 0) {
        return [fromPos, ...conn.vertices, toPos];
    }

    // New Orthogonal Routing Logic
    const fromDir = getIoPortAbsoluteDirection(fromComponent, conn.from.ioId);
    const toDir = getIoPortAbsoluteDirection(toComponent, conn.to.ioId);
    const STUB_LENGTH = 30;

    const pathPoints: Point[] = [fromPos];
    const p1 = { x: fromPos.x + fromDir.x * STUB_LENGTH, y: fromPos.y + fromDir.y * STUB_LENGTH };
    const pLast = { x: toPos.x + toDir.x * STUB_LENGTH, y: toPos.y + toDir.y * STUB_LENGTH };

    pathPoints.push(p1);

    const isFromVertical = fromDir.x === 0;
    const isToVertical = toDir.x === 0;

    if (isFromVertical === isToVertical) { // Both vertical or both horizontal
        if (isFromVertical) { // Both vertical
            const midX = (p1.x + pLast.x) / 2;
            pathPoints.push({ x: midX, y: p1.y });
            pathPoints.push({ x: midX, y: pLast.y });
        } else { // Both horizontal
            const midY = (p1.y + pLast.y) / 2;
            pathPoints.push({ x: p1.x, y: midY });
            pathPoints.push({ x: pLast.x, y: midY });
        }
    } else { // One vertical, one horizontal (L-bend)
        if (isFromVertical) {
            pathPoints.push({ x: pLast.x, y: p1.y });
        } else { // From horizontal
            pathPoints.push({ x: p1.x, y: pLast.y });
        }
    }

    pathPoints.push(pLast);
    pathPoints.push(toPos);

    // Optimization to remove consecutive duplicate points and collinear points
    const optimizedPoints = pathPoints.reduce((acc, point) => {
        if (acc.length > 0) {
            const lastPoint = acc[acc.length - 1];
            if (point.x === lastPoint.x && point.y === lastPoint.y) {
                return acc; // Skip duplicate point
            }
        }
        if (acc.length > 1) {
            const pPrev = acc[acc.length - 2];
            const pLast = acc[acc.length - 1];
            // Check for horizontal collinearity
            if (pPrev.y === pLast.y && pLast.y === point.y) {
                acc[acc.length - 1] = point; // Replace last point with the new one
                return acc;
            }
            // Check for vertical collinearity
            if (pPrev.x === pLast.x && pLast.x === point.x) {
                acc[acc.length - 1] = point; // Replace last point
                return acc;
            }
        }
        acc.push(point);
        return acc;
    }, [] as Point[]);

    return optimizedPoints;
  }, [circuit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.isSimulationRunning) return;
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedComponentId) {
            store.deleteComponent(selectedComponentId);
        } else if (selectedConnectionId) {
            store.deleteConnection(selectedConnectionId);
        }
      }
      if (e.key === 'Escape') {
          store.setConnectionStartPoint(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId, selectedConnectionId, store]);
  
  const startPointAbsPos = store.connectionStartPoint 
    ? getIoPortAbsolutePosition(store.connectionStartPoint.componentId, store.connectionStartPoint.ioId) 
    : null;

  return (
    <div 
        ref={canvasRef} 
        className="flex-1 w-full h-full relative overflow-hidden bg-grid cursor-default" 
        onDragOver={onDragOver} 
        onDrop={onDrop}
        onClick={onCanvasClick}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp} // Stop dragging if mouse leaves canvas
        style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
        }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <svg ref={svgRef} className="absolute top-0 left-0 w-[5000px] h-[5000px]" style={{ zIndex: 0 }}>
          {/* Render existing connections */}
          {circuit?.connections.map(conn => {
            const pathPoints = calculateConnectionPath(conn);
            if (pathPoints.length < 2) return null;
            const pathData = pathPoints.map(p => `${p.x},${p.y}`).join(' ');

            const isSelected = conn.id === selectedConnectionId;
            const hasFlow = (conn.state?.flowRate ?? 0) > 0;

            const strokeColor = isSelected
              ? 'hsl(210 100% 50%)' // A bright blue for selection
              : conn.mediaType === 'hydraulic' ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground))';
            const strokeWidth = isSelected ? 4 : 2;
            
            return (
              <g 
                  key={conn.id} 
                  className="cursor-pointer"
                  onClick={(e) => {
                      e.stopPropagation(); // Prevent canvas click from firing
                      store.selectConnection(conn.id);
                  }}
              >
                  {/* Invisible wider line for easier clicking */}
                  <polyline points={pathData} fill="none" stroke="transparent" strokeWidth="15" />
                  {/* Visual glow for selected line */}
                  {isSelected && (
                      <polyline points={pathData} fill="none" stroke="hsl(210 100% 70%)" strokeWidth={8} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* Visible line */}
                  <polyline points={pathData} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                  {/* Flow animation line */}
                  {hasFlow && (
                     <polyline 
                        points={pathData} 
                        fill="none" 
                        stroke="hsl(190 100% 50%)" 
                        strokeWidth={3} 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="flow-animation pointer-events-none"
                    />
                  )}
                  {/* Vertex and Midpoint Handles for selected connection */}
                  {isSelected && !store.isSimulationRunning && (
                    <>
                        {conn.vertices?.map((vertex, index) => (
                            <circle
                                key={`vertex-${conn.id}-${index}`}
                                cx={vertex.x}
                                cy={vertex.y}
                                r={6 / zoom}
                                className="fill-blue-500 stroke-white cursor-move"
                                style={{ strokeWidth: 2 / zoom }}
                                onMouseDown={(e) => handleVertexMouseDown(e, conn.id, index)}
                            />
                        ))}
                        {pathPoints.slice(0, -1).map((p1, i) => {
                            const p2 = pathPoints[i + 1];
                            const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                            return (
                                <circle
                                    key={`midpoint-${conn.id}-${i}`}
                                    cx={midPoint.x}
                                    cy={midPoint.y}
                                    r={5 / zoom}
                                    className="fill-blue-500/50 stroke-white opacity-60 hover:opacity-100 cursor-pointer"
                                    style={{ strokeWidth: 1 / zoom }}
                                    onMouseDown={(e) => handleMidpointMouseDown(e, conn, i + 1, midPoint)}
                                />
                            );
                        })}
                    </>
                  )}
              </g>
            );
          })}
          
          {/* Render preview line */}
          {startPointAbsPos && (
            <line
              x1={startPointAbsPos.x}
              y1={startPointAbsPos.y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        </svg>
        
        {circuit?.components.map((component) => (
          <ComponentRenderer 
              key={component.id} 
              component={component} 
              isSelected={component.id === selectedComponentId}
              showLabels={showLabels}
              onIoPortClick={handleIoPortClick} 
              onMouseDown={handleComponentMouseDown}
              onDoubleClick={handleComponentDoubleClick}
              onRotateStart={handleRotateStart}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;