/**
 * Canvas Component
 * Main reusable canvas component for drawing and workflow editing
 */
import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../lib/utils';
import { useCanvas } from './hooks/useCanvas';
import { 
  ZoomIn, ZoomOut, Maximize, Undo, Redo, 
  Grid3X3, Move, MousePointer 
} from 'lucide-react';

// Default port configuration
const DEFAULT_PORT_RADIUS = 8;

/**
 * Canvas Component
 */
export const Canvas = forwardRef(function Canvas({
  // Initial state
  initialElements = [],
  initialConnections = [],
  initialViewport = { zoom: 1, offset: { x: 0, y: 0 } },
  
  // Configuration
  width = '100%',
  height = '100%',
  minWidth = 400,
  minHeight = 300,
  backgroundColor = '#f8fafc',
  gridEnabled = true,
  gridSize = 20,
  snapToGrid = false,
  minZoom = 0.1,
  maxZoom = 5,
  
  // Rendering
  renderNode,
  renderConnection,
  renderBackground,
  renderOverlay,
  
  // Event handlers
  onElementClick,
  onElementDoubleClick,
  onElementDrag,
  onSelectionChange,
  onConnectionCreate,
  onConnectionDelete,
  onStateChange,
  onViewportChange,
  
  // Controls
  showControls = true,
  showMinimap = false,
  readOnly = false,
  
  // Children for additional renderers
  children,
  
  className,
  ...props
}, ref) {
  // Container ref
  const containerRef = useRef(null);
  
  // Canvas hook
  const canvas = useCanvas({
    initialElements,
    initialConnections,
    gridEnabled,
    gridSize,
    snapToGridEnabled: snapToGrid,
    minZoom,
    maxZoom,
    onStateChange,
    onSelectionChange
  });
  
  // Local state
  const [cursor, setCursor] = useState('default');
  const [tool, setTool] = useState('select'); // select, pan, connect
  
  // Expose canvas methods via ref
  useImperativeHandle(ref, () => ({
    ...canvas,
    getCanvasElement: () => containerRef.current,
    exportAsJSON: canvas.save,
    importFromJSON: canvas.load,
    clear: canvas.clear
  }), [canvas]);
  
  // Sync viewport changes
  useEffect(() => {
    if (onViewportChange) {
      onViewportChange(canvas.viewport);
    }
  }, [canvas.viewport, onViewportChange]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    if (readOnly) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);
    
    // Check for port hit first
    const portHit = canvas.hitTestPort(e.clientX, e.clientY);
    if (portHit) {
      canvas.startConnection(portHit.node.id, portHit.portIndex, portHit.type);
      return;
    }
    
    // Check for element hit
    const hitElement = canvas.hitTest(e.clientX, e.clientY);
    
    if (e.button === 1 || (e.button === 0 && tool === 'pan')) {
      // Middle mouse or pan tool - start panning
      canvas.startPan(x, y);
      setCursor('grabbing');
    } else if (e.button === 0) {
      if (hitElement) {
        // Start dragging element
        canvas.startDrag(x, y, hitElement.id);
        setCursor('grabbing');
        
        if (onElementClick) {
          onElementClick(hitElement, e);
        }
      } else {
        // Start selection rectangle
        canvas.clearSelection();
        canvas.startSelectionRect(e.clientX, e.clientY);
        setCursor('crosshair');
      }
    }
  }, [readOnly, tool, canvas, onElementClick]);
  
  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);
    
    if (canvas.isPanning) {
      canvas.updatePan(x, y);
    } else if (canvas.isDragging) {
      canvas.updateDrag(x, y);
      
      if (onElementDrag) {
        onElementDrag(canvas.getSelectedElements(), e);
      }
    } else if (canvas.selectionRect) {
      canvas.updateSelectionRect(e.clientX, e.clientY);
    } else if (canvas.isConnecting) {
      // Connection preview is handled by the connection renderer
    } else {
      // Update cursor based on hover
      const hitElement = canvas.hitTest(e.clientX, e.clientY);
      const hitPort = canvas.hitTestPort(e.clientX, e.clientY);
      
      if (hitPort) {
        setCursor('crosshair');
      } else if (hitElement) {
        setCursor('move');
      } else {
        setCursor(tool === 'pan' ? 'grab' : 'default');
      }
      
      canvas.setHoveredId?.(hitElement?.id || null);
    }
  }, [canvas, tool, onElementDrag]);
  
  const handleMouseUp = useCallback((e) => {
    if (canvas.isPanning) {
      canvas.endPan();
      setCursor(tool === 'pan' ? 'grab' : 'default');
    } else if (canvas.isDragging) {
      canvas.endDrag();
      setCursor('default');
    } else if (canvas.selectionRect) {
      canvas.endSelectionRect(e.shiftKey);
      setCursor('default');
    } else if (canvas.isConnecting) {
      const portHit = canvas.hitTestPort(e.clientX, e.clientY);
      if (portHit && portHit.node.id !== canvas.connectionStart?.nodeId) {
        canvas.completeConnection(portHit.node.id, portHit.portIndex, portHit.type);
        
        if (onConnectionCreate) {
          onConnectionCreate(canvas.connectionStart, {
            nodeId: portHit.node.id,
            portIndex: portHit.portIndex,
            portType: portHit.type
          });
        }
      } else {
        canvas.cancelConnection();
      }
    }
  }, [canvas, tool, onConnectionCreate]);
  
  const handleMouseLeave = useCallback(() => {
    if (canvas.isDragging) {
      canvas.endDrag();
    }
    if (canvas.isPanning) {
      canvas.endPan();
    }
    setCursor('default');
  }, [canvas]);
  
  // Wheel handler for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);
    
    canvas.handleZoom(e.deltaY > 0 ? -1 : 1, x, y);
  }, [canvas]);
  
  // Double click handler
  const handleDoubleClick = useCallback((e) => {
    const hitElement = canvas.hitTest(e.clientX, e.clientY);
    
    if (hitElement && onElementDoubleClick) {
      onElementDoubleClick(hitElement, e);
    }
  }, [canvas, onElementDoubleClick]);
  
  // Render grid
  const renderGrid = () => {
    if (!gridEnabled) return null;
    
    const { zoom, offset } = canvas.viewport;
    const scaledGridSize = gridSize * zoom;
    
    // Calculate grid offset for smooth panning
    const gridOffsetX = offset.x % scaledGridSize;
    const gridOffsetY = offset.y % scaledGridSize;
    
    return (
      <defs>
        <pattern
          id="canvas-grid"
          width={scaledGridSize}
          height={scaledGridSize}
          patternUnits="userSpaceOnUse"
          x={gridOffsetX}
          y={gridOffsetY}
        >
          <path
            d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300 dark:text-gray-700"
          />
        </pattern>
      </defs>
    );
  };
  
  // Render background
  const renderBackgroundLayer = () => {
    if (renderBackground) {
      return renderBackground(canvas);
    }
    
    return (
      <>
        {renderGrid()}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={gridEnabled ? 'url(#canvas-grid)' : backgroundColor}
          className="pointer-events-none"
        />
      </>
    );
  };
  
  // Render connections
  const renderConnections = () => {
    return canvas.connections.map((conn, index) => {
      const fromElement = canvas.elements.find(el => el.id === conn.from);
      const toElement = canvas.elements.find(el => el.id === conn.to);
      
      if (!fromElement || !toElement) return null;
      
      if (renderConnection) {
        return renderConnection(conn, fromElement, toElement, canvas.viewport);
      }
      
      // Default connection rendering
      const fromX = fromElement.x + (fromElement.width || 200);
      const fromY = fromElement.y + 30 + (conn.fromPort || 0) * 25;
      const toX = toElement.x;
      const toY = toElement.y + 30 + (conn.toPort || 0) * 25;
      
      const dx = toX - fromX;
      const controlOffset = Math.min(Math.abs(dx) / 2, 100);
      
      const path = `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`;
      
      return (
        <g key={conn.id || index}>
          <path
            d={path}
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer hover:stroke-blue-500"
            onClick={() => {
              if (onConnectionDelete) {
                onConnectionDelete(conn);
              }
            }}
          />
          <circle cx={toX} cy={toY} r="4" fill="#64748b" />
        </g>
      );
    });
  };
  
  // Render connection preview
  const renderConnectionPreview = () => {
    if (!canvas.isConnecting || !canvas.connectionStart) return null;
    
    const startElement = canvas.elements.find(el => el.id === canvas.connectionStart.nodeId);
    if (!startElement) return null;
    
    // This would need the current mouse position - simplified for now
    return null;
  };
  
  // Render elements/nodes
  const renderElements = () => {
    return canvas.elements.map((element) => {
      const isSelected = canvas.selectedIds.includes(element.id);
      const isHovered = canvas.hoveredId === element.id;
      
      if (renderNode) {
        return renderNode(element, { isSelected, isHovered, canvas });
      }
      
      // Default node rendering
      const { zoom, offset } = canvas.viewport;
      const x = element.x * zoom + offset.x;
      const y = element.y * zoom + offset.y;
      const w = (element.width || 200) * zoom;
      const h = (element.height || 100) * zoom;
      
      return (
        <g
          key={element.id}
          transform={`translate(${x}, ${y})`}
          className={cn(
            "cursor-move",
            isSelected && "ring-2 ring-blue-500"
          )}
        >
          {/* Node background */}
          <rect
            width={w}
            height={h}
            rx={4 * zoom}
            fill="white"
            stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
            strokeWidth={isSelected ? 2 : 1}
            className="drop-shadow-md"
          />
          
          {/* Node header */}
          <rect
            width={w}
            height={30 * zoom}
            rx={4 * zoom}
            fill={element.color || "#3b82f6"}
            className="opacity-80"
          />
          
          {/* Node title */}
          <text
            x={10 * zoom}
            y={20 * zoom}
            fontSize={12 * zoom}
            fill="white"
            className="select-none pointer-events-none"
          >
            {element.name || element.id}
          </text>
          
          {/* Input ports */}
          {(element.inputs || []).map((input, i) => (
            <g key={`input-${i}`}>
              <circle
                cx={0}
                cy={40 * zoom + i * 25 * zoom}
                r={DEFAULT_PORT_RADIUS * zoom}
                fill="white"
                stroke="#64748b"
                strokeWidth={2}
                className="cursor-crosshair hover:fill-blue-100"
              />
              <text
                x={15 * zoom}
                y={44 * zoom + i * 25 * zoom}
                fontSize={10 * zoom}
                fill="#64748b"
                className="select-none pointer-events-none"
              >
                {input.name || input.symbol || `Input ${i + 1}`}
              </text>
            </g>
          ))}
          
          {/* Output ports */}
          {(element.outputs || []).map((output, i) => (
            <g key={`output-${i}`}>
              <circle
                cx={w}
                cy={40 * zoom + i * 25 * zoom}
                r={DEFAULT_PORT_RADIUS * zoom}
                fill="white"
                stroke="#22c55e"
                strokeWidth={2}
                className="cursor-crosshair hover:fill-green-100"
              />
              <text
                x={w - 10 * zoom}
                y={44 * zoom + i * 25 * zoom}
                fontSize={10 * zoom}
                fill="#64748b"
                textAnchor="end"
                className="select-none pointer-events-none"
              >
                {output.name || output.symbol || `Output ${i + 1}`}
              </text>
            </g>
          ))}
        </g>
      );
    });
  };
  
  // Render selection rectangle
  const renderSelectionRect = () => {
    if (!canvas.selectionRect) return null;
    
    const { zoom, offset } = canvas.viewport;
    const { x, y, width, height } = canvas.selectionRect;
    
    const screenX = x * zoom + offset.x;
    const screenY = y * zoom + offset.y;
    const screenW = width * zoom;
    const screenH = height * zoom;
    
    return (
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        fill="rgba(59, 130, 246, 0.1)"
        stroke="#3b82f6"
        strokeWidth="1"
        strokeDasharray="4"
        className="pointer-events-none"
      />
    );
  };
  
  // Render controls
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
        {/* Tool selection */}
        <div className="flex items-center border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
          <button
            onClick={() => setTool('select')}
            className={cn(
              "p-2 rounded-md transition-colors",
              tool === 'select' 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title="Select tool"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('pan')}
            className={cn(
              "p-2 rounded-md transition-colors",
              tool === 'pan' 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title="Pan tool"
          >
            <Move className="w-4 h-4" />
          </button>
        </div>
        
        {/* Zoom controls */}
        <button
          onClick={canvas.zoomIn}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={canvas.zoomOut}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={canvas.fitAll}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Fit to view"
        >
          <Maximize className="w-4 h-4" />
        </button>
        
        {/* Grid toggle */}
        <button
          onClick={() => {}}
          className={cn(
            "p-2 rounded-md transition-colors",
            gridEnabled 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          title="Toggle grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        
        {/* Undo/Redo */}
        <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-2 ml-2">
          <button
            onClick={canvas.undo}
            disabled={!canvas.canUndo}
            className={cn(
              "p-2 rounded-md transition-colors",
              canvas.canUndo 
                ? "hover:bg-gray-100 dark:hover:bg-gray-700" 
                : "opacity-50 cursor-not-allowed"
            )}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={canvas.redo}
            disabled={!canvas.canRedo}
            className={cn(
              "p-2 rounded-md transition-colors",
              canvas.canRedo 
                ? "hover:bg-gray-100 dark:hover:bg-gray-700" 
                : "opacity-50 cursor-not-allowed"
            )}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
        
        {/* Zoom percentage */}
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 min-w-[50px] text-center">
          {Math.round(canvas.viewport.zoom * 100)}%
        </div>
      </div>
    );
  };
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        "bg-gray-50 dark:bg-gray-900",
        className
      )}
      style={{
        width,
        height,
        minWidth,
        minHeight,
        cursor
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      <svg
        ref={canvas.canvasRef}
        width="100%"
        height="100%"
        className="block"
      >
        {/* Background layer */}
        {renderBackgroundLayer()}
        
        {/* Connections (rendered below elements) */}
        <g className="connections-layer">
          {renderConnections()}
          {renderConnectionPreview()}
        </g>
        
        {/* Elements layer */}
        <g className="elements-layer">
          {renderElements()}
        </g>
        
        {/* Selection rectangle */}
        {renderSelectionRect()}
        
        {/* Custom overlay */}
        {renderOverlay && renderOverlay(canvas)}
      </svg>
      
      {/* Controls */}
      {renderControls()}
      
      {/* Children (additional renderers) */}
      {children}
    </div>
  );
});

export default Canvas;
