/**
 * useCanvas Hook
 * Main hook for canvas state management
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  screenToCanvas, 
  canvasToScreen, 
  fitToView, 
  zoomToPoint,
  snapToGrid 
} from '../utils/transformations';
import { 
  findElementAtPoint, 
  findElementsInRect,
  findPortAtPoint 
} from '../utils/hitDetection';
import {
  serializeCanvas,
  deserializeCanvas,
  getDefaultCanvasState,
  validateCanvasState
} from '../utils/serialization';

/**
 * Main canvas hook
 * @param {Object} options - Configuration options
 * @returns {Object} Canvas state and methods
 */
export function useCanvas(options = {}) {
  const {
    initialElements = [],
    initialConnections = [],
    gridEnabled = true,
    gridSize = 20,
    snapToGridEnabled = false,
    minZoom = 0.1,
    maxZoom = 5,
    onStateChange,
    onSelectionChange
  } = options;

  // Canvas state
  const [viewport, setViewport] = useState({
    zoom: 1,
    offset: { x: 0, y: 0 }
  });
  const [elements, setElements] = useState(initialElements);
  const [connections, setConnections] = useState(initialConnections);
  const [selectedIds, setSelectedIds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [status, setStatus] = useState('Ready');

  // Refs
  const canvasRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Notify state change
  const notifyStateChange = useCallback((state) => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [onStateChange]);

  // Notify selection change
  const notifySelectionChange = useCallback((ids) => {
    if (onSelectionChange) {
      onSelectionChange(ids);
    }
  }, [onSelectionChange]);

  // Get canvas bounding rect
  const getCanvasRect = useCallback(() => {
    return canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
  }, []);

  // Convert screen to canvas coordinates
  const toCanvasCoords = useCallback((screenX, screenY) => {
    const rect = getCanvasRect();
    return screenToCanvas(screenX, screenY, viewport, rect);
  }, [viewport, getCanvasRect]);

  // Convert canvas to screen coordinates
  const toScreenCoords = useCallback((canvasX, canvasY) => {
    const rect = getCanvasRect();
    return canvasToScreen(canvasX, canvasY, viewport, rect);
  }, [viewport, getCanvasRect]);

  // Zoom handlers
  const handleZoom = useCallback((delta, centerX, centerY) => {
    setViewport(prev => {
      const newViewport = zoomToPoint(centerX, centerY, delta, prev, {
        minZoom,
        maxZoom
      });
      return newViewport;
    });
  }, [minZoom, maxZoom]);

  const zoomIn = useCallback(() => {
    const rect = getCanvasRect();
    handleZoom(1, rect.width / 2, rect.height / 2);
  }, [handleZoom, getCanvasRect]);

  const zoomOut = useCallback(() => {
    const rect = getCanvasRect();
    handleZoom(-1, rect.width / 2, rect.height / 2);
  }, [handleZoom, getCanvasRect]);

  const resetZoom = useCallback(() => {
    setViewport({ zoom: 1, offset: { x: 0, y: 0 } });
  }, []);

  const fitAll = useCallback(() => {
    const rect = getCanvasRect();
    const newViewport = fitToView(elements, rect.width, rect.height, 50);
    setViewport(newViewport);
  }, [elements, getCanvasRect]);

  // Pan handlers
  const startPan = useCallback((x, y) => {
    setIsPanning(true);
    panStart.current = { x: viewport.offset.x, y: viewport.offset.y };
    lastMousePos.current = { x, y };
  }, [viewport.offset]);

  const updatePan = useCallback((x, y) => {
    if (!isPanning) return;
    
    const dx = x - lastMousePos.current.x;
    const dy = y - lastMousePos.current.y;
    
    setViewport(prev => ({
      ...prev,
      offset: {
        x: panStart.current.x + dx,
        y: panStart.current.y + dy
      }
    }));
  }, [isPanning]);

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Selection handlers
  const selectElement = useCallback((id, addToSelection = false) => {
    setSelectedIds(prev => {
      if (addToSelection) {
        return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(elements.map(el => el.id));
  }, [elements]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const getSelectedElements = useCallback(() => {
    return elements.filter(el => selectedIds.includes(el.id));
  }, [elements, selectedIds]);

  // Element manipulation
  const addElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: element.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: snapToGridEnabled ? snapToGrid(element.x, gridSize) : element.x,
      y: snapToGridEnabled ? snapToGrid(element.y, gridSize) : element.y
    };
    
    setElements(prev => [...prev, newElement]);
    saveToHistory();
    
    return newElement;
  }, [snapToGridEnabled, gridSize]);

  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  const updateElements = useCallback((updates) => {
    // updates is an array of { id, ...changes }
    setElements(prev => prev.map(el => {
      const update = updates.find(u => u.id === el.id);
      return update ? { ...el, ...update } : el;
    }));
  }, []);

  const deleteElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setConnections(prev => prev.filter(conn => 
      conn.from !== id && conn.to !== id
    ));
    setSelectedIds(prev => prev.filter(i => i !== id));
    saveToHistory();
  }, []);

  const deleteSelected = useCallback(() => {
    setElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
    setConnections(prev => prev.filter(conn => 
      !selectedIds.includes(conn.from) && !selectedIds.includes(conn.to)
    ));
    setSelectedIds([]);
    saveToHistory();
  }, [selectedIds]);

  // Drag handlers
  const startDrag = useCallback((x, y, elementId) => {
    setIsDragging(true);
    dragStartPos.current = { x, y };
    
    if (!selectedIds.includes(elementId)) {
      selectElement(elementId, false);
    }
    
    // Store initial positions
    const selected = getSelectedElements();
    selected.forEach(el => {
      el._dragStartX = el.x;
      el._dragStartY = el.y;
    });
  }, [selectedIds, selectElement, getSelectedElements]);

  const updateDrag = useCallback((x, y) => {
    if (!isDragging) return;
    
    const dx = x - dragStartPos.current.x;
    const dy = y - dragStartPos.current.y;
    
    const updates = getSelectedElements().map(el => {
      let newX = (el._dragStartX || el.x) + dx / viewport.zoom;
      let newY = (el._dragStartY || el.y) + dy / viewport.zoom;
      
      if (snapToGridEnabled) {
        newX = snapToGrid(newX, gridSize);
        newY = snapToGrid(newY, gridSize);
      }
      
      return { id: el.id, x: newX, y: newY };
    });
    
    updateElements(updates);
  }, [isDragging, getSelectedElements, viewport.zoom, snapToGridEnabled, gridSize, updateElements]);

  const endDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory();
    }
  }, [isDragging]);

  // Connection handlers
  const startConnection = useCallback((nodeId, portIndex, portType) => {
    setIsConnecting(true);
    setConnectionStart({ nodeId, portIndex, portType });
  }, []);

  const completeConnection = useCallback((toNodeId, toPortIndex, toPortType) => {
    if (!connectionStart) return;
    
    if (connectionStart.portType === toPortType) {
      setStatus('Cannot connect same port types');
      return;
    }
    
    const [fromNodeId, fromPortIndex] = connectionStart.portType === 'output'
      ? [connectionStart.nodeId, connectionStart.portIndex]
      : [toNodeId, toPortIndex];
    
    const [finalToNodeId, finalToPortIndex] = connectionStart.portType === 'output'
      ? [toNodeId, toPortIndex]
      : [connectionStart.nodeId, connectionStart.portIndex];
    
    const newConnection = {
      id: `conn_${Date.now()}`,
      from: fromNodeId,
      fromPort: fromPortIndex,
      to: finalToNodeId,
      toPort: finalToPortIndex
    };
    
    setConnections(prev => [...prev, newConnection]);
    setIsConnecting(false);
    setConnectionStart(null);
    saveToHistory();
  }, [connectionStart]);

  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStart(null);
  }, []);

  // Selection rectangle
  const startSelectionRect = useCallback((x, y) => {
    const canvasPos = toCanvasCoords(x, y);
    setSelectionRect({
      startX: canvasPos.x,
      startY: canvasPos.y,
      x: canvasPos.x,
      y: canvasPos.y,
      width: 0,
      height: 0
    });
  }, [toCanvasCoords]);

  const updateSelectionRect = useCallback((x, y) => {
    if (!selectionRect) return;
    
    const canvasPos = toCanvasCoords(x, y);
    
    setSelectionRect(prev => ({
      ...prev,
      x: Math.min(prev.startX, canvasPos.x),
      y: Math.min(prev.startY, canvasPos.y),
      width: Math.abs(canvasPos.x - prev.startX),
      height: Math.abs(canvasPos.y - prev.startY)
    }));
  }, [selectionRect, toCanvasCoords]);

  const endSelectionRect = useCallback((addToSelection = false) => {
    if (!selectionRect) return;
    
    const selected = findElementsInRect(selectionRect, elements, true);
    
    if (addToSelection) {
      setSelectedIds(prev => [...new Set([...prev, ...selected.map(el => el.id)])]);
    } else {
      setSelectedIds(selected.map(el => el.id));
    }
    
    setSelectionRect(null);
    notifySelectionChange(selectedIds);
  }, [selectionRect, elements, selectedIds, notifySelectionChange]);

  // History (undo/redo)
  const saveToHistory = useCallback(() => {
    const state = {
      elements: [...elements],
      connections: [...connections]
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [elements, connections, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    
    if (state) {
      setElements(state.elements);
      setConnections(state.connections);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    
    if (state) {
      setElements(state.elements);
      setConnections(state.connections);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Serialization
  const save = useCallback(() => {
    return serializeCanvas({
      viewport,
      elements,
      connections,
      metadata: { name: 'Canvas', type: 'canvas' }
    });
  }, [viewport, elements, connections]);

  const load = useCallback((json) => {
    const state = deserializeCanvas(json);
    const validation = validateCanvasState(state);
    
    if (!validation.valid) {
      console.error('Invalid canvas state:', validation.errors);
      return false;
    }
    
    setViewport(state.viewport);
    setElements(state.elements);
    setConnections(state.connections);
    saveToHistory();
    
    return true;
  }, [saveToHistory]);

  const clear = useCallback(() => {
    setElements([]);
    setConnections([]);
    setSelectedIds([]);
    setViewport({ zoom: 1, offset: { x: 0, y: 0 } });
    saveToHistory();
  }, [saveToHistory]);

  // Hit testing
  const hitTest = useCallback((x, y, type = null) => {
    const canvasPos = toCanvasCoords(x, y);
    return findElementAtPoint(canvasPos.x, canvasPos.y, elements, type);
  }, [elements, toCanvasCoords]);

  const hitTestPort = useCallback((x, y, portRadius = 12) => {
    const canvasPos = toCanvasCoords(x, y);
    return findPortAtPoint(canvasPos.x, canvasPos.y, elements, portRadius);
  }, [elements, toCanvasCoords]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            deleteSelected();
          }
          break;
        case 'Escape':
          clearSelection();
          cancelConnection();
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectAll();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteSelected, clearSelection, cancelConnection, selectAll, undo, redo, zoomIn, zoomOut, resetZoom]);

  return {
    // Refs
    canvasRef,
    
    // State
    viewport,
    elements,
    connections,
    selectedIds,
    hoveredId,
    isDragging,
    isPanning,
    isConnecting,
    connectionStart,
    selectionRect,
    status,
    
    // Viewport controls
    zoomIn,
    zoomOut,
    resetZoom,
    fitAll,
    handleZoom,
    
    // Pan controls
    startPan,
    updatePan,
    endPan,
    
    // Selection
    selectElement,
    selectAll,
    clearSelection,
    getSelectedElements,
    
    // Element manipulation
    addElement,
    updateElement,
    updateElements,
    deleteElement,
    deleteSelected,
    setElements,
    setConnections,
    
    // Drag
    startDrag,
    updateDrag,
    endDrag,
    
    // Connections
    startConnection,
    completeConnection,
    cancelConnection,
    
    // Selection rectangle
    startSelectionRect,
    updateSelectionRect,
    endSelectionRect,
    
    // History
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    
    // Serialization
    save,
    load,
    clear,
    
    // Coordinate conversion
    toCanvasCoords,
    toScreenCoords,
    
    // Hit testing
    hitTest,
    hitTestPort,
    
    // Utilities
    setStatus
  };
}

export default useCanvas;
