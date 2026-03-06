/**
 * useCanvasRender Hook
 * Handles canvas rendering logic for the simulator
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/Canvas.js
 */

import { useCallback, useRef, useEffect } from 'react';

export function useSimulatorCanvas(canvasRef, state, dispatch, actions) {
  const animationFrameRef = useRef(null);
  const dprRef = useRef(window.devicePixelRatio || 1);
  
  // Get canvas context
  const getContext = useCallback(() => {
    if (!canvasRef.current) return null;
    return canvasRef.current.getContext('2d');
  }, [canvasRef]);
  
  // Resize canvas to match container
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = dprRef.current;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, [canvasRef]);
  
  // Clear canvas
  const clear = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  }, [getContext, canvasRef]);
  
  // Transform coordinates from screen to canvas space
  const screenToCanvas = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (x - rect.left - state.canvas.offset.x) / state.canvas.zoom,
      y: (y - rect.top - state.canvas.offset.y) / state.canvas.zoom
    };
  }, [canvasRef, state.canvas.offset, state.canvas.zoom]);
  
  // Transform coordinates from canvas to screen space
  const canvasToScreen = useCallback((x, y) => {
    return {
      x: x * state.canvas.zoom + state.canvas.offset.x,
      y: y * state.canvas.zoom + state.canvas.offset.y
    };
  }, [state.canvas.offset, state.canvas.zoom]);
  
  // Apply transformations (zoom and pan)
  const applyTransform = useCallback((ctx) => {
    ctx.save();
    ctx.translate(state.canvas.offset.x, state.canvas.offset.y);
    ctx.scale(state.canvas.zoom, state.canvas.zoom);
  }, [state.canvas.offset, state.canvas.zoom]);
  
  // Restore canvas state
  const restoreTransform = useCallback((ctx) => {
    ctx.restore();
  }, []);
  
  // Zoom to point
  const zoomToPoint = useCallback((x, y, delta) => {
    const oldZoom = state.canvas.zoom;
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(5, oldZoom * zoomFactor));
    
    if (newZoom !== oldZoom) {
      const canvasPos = screenToCanvas(x, y);
      actions.setCanvasZoom(newZoom);
      
      // Calculate new offset to zoom toward cursor
      const newScreenPos = canvasToScreen(canvasPos.x, canvasPos.y);
      const dx = x - newScreenPos.x;
      const dy = y - newScreenPos.y;
      
      // Update offset
      actions.setCanvasOffset({
        x: state.canvas.offset.x + dx,
        y: state.canvas.offset.y + dy
      });
    }
  }, [state.canvas.zoom, state.canvas.offset, screenToCanvas, canvasToScreen, actions]);
  
  // Pan canvas
  const pan = useCallback((dx, dy) => {
    actions.panCanvas(dx, dy);
  }, [actions]);
  
  // Reset view
  const resetView = useCallback(() => {
    actions.resetView();
  }, [actions]);
  
  // Fit all components in view
  const fitToScreen = useCallback(() => {
    if (state.components.length === 0) {
      resetView();
      return;
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    state.components.forEach(comp => {
      minX = Math.min(minX, comp.x);
      minY = Math.min(minY, comp.y);
      maxX = Math.max(maxX, comp.x + (comp.width || 60));
      maxY = Math.max(maxY, comp.y + (comp.height || 40));
    });
    
    const width = maxX - minX;
    const height = maxY - minY;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const padding = 50;
    const zoomX = (rect.width - padding * 2) / width;
    const zoomY = (rect.height - padding * 2) / height;
    const zoom = Math.min(zoomX, zoomY, 1);
    
    actions.setCanvasZoom(zoom);
    actions.setCanvasOffset({
      x: (rect.width - (minX + width / 2) * zoom) / 2,
      y: (rect.height - (minY + height / 2) * zoom) / 2
    });
  }, [state.components, canvasRef, actions, resetView]);
  
  // Draw grid
  const drawGrid = useCallback((ctx) => {
    if (!state.settings.showGrid) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const gridSize = state.settings.gridSize;
    const isDark = state.settings.theme === 'dark';
    
    ctx.save();
    
    const startX = Math.floor((-state.canvas.offset.x) / (gridSize * state.canvas.zoom)) * gridSize;
    const startY = Math.floor((-state.canvas.offset.y) / (gridSize * state.canvas.zoom)) * gridSize;
    const endX = startX + rect.width / state.canvas.zoom + gridSize;
    const endY = startY + rect.height / state.canvas.zoom + gridSize;
    
    applyTransform(ctx);
    
    // Major grid lines every 5 units
    ctx.strokeStyle = isDark ? '#404040' : '#d0d0d0';
    ctx.lineWidth = 1;
    
    for (let x = startX; x < endX; x += gridSize * 5) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    for (let y = startY; y < endY; y += gridSize * 5) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    // Minor grid lines
    ctx.strokeStyle = isDark ? '#2a2a2a' : '#e8e8e8';
    ctx.lineWidth = 0.5;
    
    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    restoreTransform(ctx);
    ctx.restore();
  }, [state.settings, state.canvas, canvasRef, applyTransform, restoreTransform]);
  
  // Snap to grid
  const snapToGrid = useCallback((value) => {
    if (!state.settings.snapToGrid) return value;
    const gridSize = state.settings.gridSize;
    return Math.round(value / gridSize) * gridSize;
  }, [state.settings.snapToGrid, state.settings.gridSize]);
  
  // Get canvas as data URL
  const toDataURL = useCallback((type = 'image/png', quality = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL(type, quality);
  }, [canvasRef]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      resize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resize]);
  
  // Initial resize
  useEffect(() => {
    resize();
  }, [resize]);
  
  return {
    getContext,
    resize,
    clear,
    screenToCanvas,
    canvasToScreen,
    applyTransform,
    restoreTransform,
    zoomToPoint,
    pan,
    resetView,
    fitToScreen,
    drawGrid,
    snapToGrid,
    toDataURL,
    dpr: dprRef.current
  };
}

export default useSimulatorCanvas;
