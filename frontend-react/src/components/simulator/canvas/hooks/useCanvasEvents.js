/**
 * useCanvasEvents Hook
 * Handles mouse and keyboard events for the simulator canvas
 * 
 * Converted from: external/Hydraulic-Simulator_JS/app.js (event handling)
 */

import { useCallback, useRef, useEffect } from 'react';

export function useSimulatorEvents(canvasRef, state, actions, canvasUtils) {
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const selectionStartRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  const { screenToCanvas, pan, zoomToPoint, snapToGrid } = canvasUtils;
  
  // Get component at position
  const findComponentAtPosition = useCallback((x, y) => {
    // Check components in reverse order (top to bottom)
    for (let i = state.components.length - 1; i >= 0; i--) {
      const comp = state.components[i];
      const width = comp.width || 60;
      const height = comp.height || 40;
      
      if (x >= comp.x && x <= comp.x + width &&
          y >= comp.y && y <= comp.y + height) {
        return comp;
      }
    }
    return null;
  }, [state.components]);
  
  // Get wire at position
  const findWireAtPosition = useCallback((x, y) => {
    const threshold = 5 / state.canvas.zoom;
    
    for (const wire of state.wires) {
      const route = wire.route || [];
      for (let i = 0; i < route.length - 1; i++) {
        const p1 = route[i];
        const p2 = route[i + 1];
        
        const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (distance < threshold) {
          return wire;
        }
      }
    }
    return null;
  }, [state.wires, state.canvas.zoom]);
  
  // Get terminal at position
  const findTerminalAtPosition = useCallback((x, y) => {
    const threshold = 8 / state.canvas.zoom;
    
    for (const comp of state.components) {
      const terminals = comp.terminals || [];
      for (const terminal of terminals) {
        const tx = comp.x + terminal.x;
        const ty = comp.y + terminal.y;
        const distance = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);
        
        if (distance < threshold) {
          return { component: comp, terminal };
        }
      }
    }
    return null;
  }, [state.components, state.canvas.zoom]);
  
  // Mouse down handler
  const handleMouseDown = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvasPos = screenToCanvas(x, y);
    
    lastMousePosRef.current = { x, y };
    dragStartRef.current = { x, y };
    
    // Middle mouse button - start panning
    if (e.button === 1) {
      isPanningRef.current = true;
      e.preventDefault();
      return;
    }
    
    // Right click - context menu (prevent default)
    if (e.button === 2) {
      e.preventDefault();
      return;
    }
    
    // Left click - handle based on current tool
    switch (state.tool.current) {
      case 'select':
        handleSelectMouseDown(canvasPos, e.shiftKey);
        break;
      case 'wire':
        handleWireMouseDown(canvasPos);
        break;
      case 'pan':
        isPanningRef.current = true;
        break;
      case 'component':
        handleComponentPlace(canvasPos);
        break;
    }
  }, [canvasRef, screenToCanvas, state.tool.current, state.tool.currentComponent]);
  
  // Select tool mouse down
  const handleSelectMouseDown = useCallback((canvasPos, addToSelection) => {
    // Check for terminal first (for wire creation)
    const terminalHit = findTerminalAtPosition(canvasPos.x, canvasPos.y);
    if (terminalHit) {
      // Start wire drawing from terminal
      actions.startWireDrawing({
        componentId: terminalHit.component.id,
        terminalId: terminalHit.terminal.id,
        x: terminalHit.component.x + terminalHit.terminal.x,
        y: terminalHit.component.y + terminalHit.terminal.y
      });
      actions.setTool('wire');
      return;
    }
    
    // Check for component
    const component = findComponentAtPosition(canvasPos.x, canvasPos.y);
    if (component) {
      if (addToSelection) {
        if (state.selectedComponents.includes(component.id)) {
          actions.deselectComponent(component.id);
        } else {
          actions.selectComponent(component.id, true);
        }
      } else {
        if (!state.selectedComponents.includes(component.id)) {
          actions.selectComponent(component.id, false);
        }
      }
      isDraggingRef.current = true;
      selectionStartRef.current = canvasPos;
    } else {
      // Check for wire
      const wire = findWireAtPosition(canvasPos.x, canvasPos.y);
      if (wire) {
        if (addToSelection) {
          if (state.selectedWires.includes(wire.id)) {
            actions.deselectWire(wire.id);
          } else {
            actions.selectWire(wire.id, true);
          }
        } else {
          actions.selectWire(wire.id, false);
        }
      } else {
        // Clicked on empty space - clear selection or start selection rectangle
        if (!addToSelection) {
          actions.clearSelection();
        }
        isDraggingRef.current = true;
        selectionStartRef.current = canvasPos;
      }
    }
  }, [findComponentAtPosition, findWireAtPosition, findTerminalAtPosition, 
      state.selectedComponents, state.selectedWires, actions]);
  
  // Wire tool mouse down
  const handleWireMouseDown = useCallback((canvasPos) => {
    if (!state.tool.drawingWire) {
      // Start new wire
      const terminalHit = findTerminalAtPosition(canvasPos.x, canvasPos.y);
      if (terminalHit) {
        actions.startWireDrawing({
          componentId: terminalHit.component.id,
          terminalId: terminalHit.terminal.id,
          x: terminalHit.component.x + terminalHit.terminal.x,
          y: terminalHit.component.y + terminalHit.terminal.y
        });
      }
    } else {
      // Add waypoint or complete wire
      const terminalHit = findTerminalAtPosition(canvasPos.x, canvasPos.y);
      if (terminalHit && terminalHit.component.id !== state.tool.wireStart.componentId) {
        // Complete wire
        const wire = {
          from: {
            componentId: state.tool.wireStart.componentId,
            terminalId: state.tool.wireStart.terminalId
          },
          to: {
            componentId: terminalHit.component.id,
            terminalId: terminalHit.terminal.id
          },
          route: [...state.tool.wirePoints, {
            x: terminalHit.component.x + terminalHit.terminal.x,
            y: terminalHit.component.y + terminalHit.terminal.y
          }]
        };
        actions.addWire(wire);
        actions.endWireDrawing();
        actions.setTool('select');
      } else {
        // Add waypoint
        actions.addWirePoint({ x: canvasPos.x, y: canvasPos.y });
      }
    }
  }, [state.tool, findTerminalAtPosition, actions]);
  
  // Component placement
  const handleComponentPlace = useCallback((canvasPos) => {
    if (state.tool.currentComponent) {
      const snappedX = snapToGrid(canvasPos.x);
      const snappedY = snapToGrid(canvasPos.y);
      
      // Import and create component instance
      import('../../components/definitions/hydraulic').then(({ createComponentInstance }) => {
        const component = createComponentInstance(state.tool.currentComponent, snappedX, snappedY);
        if (component) {
          actions.addComponent(component);
          actions.selectComponent(component.id, false);
        }
      });
    }
  }, [state.tool.currentComponent, snapToGrid, actions]);
  
  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvasPos = screenToCanvas(x, y);
    
    const dx = x - lastMousePosRef.current.x;
    const dy = y - lastMousePosRef.current.y;
    
    lastMousePosRef.current = { x, y };
    
    // Panning
    if (isPanningRef.current) {
      pan(dx, dy);
      return;
    }
    
    // Handle based on current tool
    switch (state.tool.current) {
      case 'select':
        if (isDraggingRef.current && state.selectedComponents.length > 0) {
          // Move selected components
          const snappedDx = snapToGrid(canvasPos.x - selectionStartRef.current.x);
          const snappedDy = snapToGrid(canvasPos.y - selectionStartRef.current.y);
          
          if (snappedDx !== 0 || snappedDy !== 0) {
            state.selectedComponents.forEach(id => {
              const comp = state.components.find(c => c.id === id);
              if (comp) {
                actions.moveComponent(id, comp.x + snappedDx, comp.y + snappedDy);
              }
            });
            selectionStartRef.current = canvasPos;
          }
        }
        break;
        
      case 'wire':
        if (state.tool.drawingWire) {
          // Update wire preview point
          actions.addWirePoint({ x: canvasPos.x, y: canvasPos.y });
          // Remove last point if it was a preview
          // This is handled differently in actual implementation
        }
        break;
    }
    
    // Update cursor position display
    if (actions.setUIState) {
      actions.setUIState({ cursorPosition: canvasPos });
    }
  }, [canvasRef, screenToCanvas, pan, snapToGrid, state.tool, state.selectedComponents,
      state.components, isDraggingRef, actions]);
  
  // Mouse up handler
  const handleMouseUp = useCallback((e) => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
    
    // If we were moving components, save state for undo
    if (state.tool.current === 'select' && state.selectedComponents.length > 0) {
      // Trigger state save for undo/redo
      // This is automatically handled by the reducer
    }
  }, [state.tool.current, state.selectedComponents]);
  
  // Double click handler
  const handleDoubleClick = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvasPos = screenToCanvas(x, y);
    
    // Check for component
    const component = findComponentAtPosition(canvasPos.x, canvasPos.y);
    if (component) {
      // Open component properties panel
      actions.setUIState({ 
        showProperties: true,
        selectedPropertyTab: 'properties'
      });
      return;
    }
    
    // Check for wire
    const wire = findWireAtPosition(canvasPos.x, canvasPos.y);
    if (wire) {
      // Open wire properties
      actions.selectWire(wire.id, false);
      actions.setUIState({ 
        showProperties: true,
        selectedPropertyTab: 'wire'
      });
    }
  }, [canvasRef, screenToCanvas, findComponentAtPosition, findWireAtPosition, actions]);
  
  // Wheel handler (zoom)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Zoom in/out
    zoomToPoint(x, y, e.deltaY < 0 ? 1 : -1);
  }, [canvasRef, zoomToPoint]);
  
  // Context menu handler
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvasPos = screenToCanvas(x, y);
    
    // Check for component
    const component = findComponentAtPosition(canvasPos.x, canvasPos.y);
    if (component) {
      // Show component context menu
      // This would open a context menu component
      console.log('Context menu for component:', component);
    }
  }, [canvasRef, screenToCanvas, findComponentAtPosition]);
  
  // Keyboard handler
  const handleKeyDown = useCallback((e) => {
    // Don't handle if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    
    // Tool shortcuts
    if (!ctrl && !shift) {
      switch (key) {
        case 'v':
        case '1':
          actions.setTool('select');
          break;
        case 'w':
        case '2':
          actions.setTool('wire');
          break;
        case 'h':
        case '3':
          actions.setTool('pan');
          break;
        case 'escape':
          actions.endWireDrawing();
          actions.setTool('select');
          actions.clearSelection();
          break;
        case 'delete':
        case 'backspace':
          deleteSelected();
          break;
        case 'r':
          rotateSelected();
          break;
        case 'f':
          flipSelected();
          break;
      }
    }
    
    // Ctrl shortcuts
    if (ctrl) {
      switch (key) {
        case 'z':
          e.preventDefault();
          if (shift) {
            actions.redo();
          } else {
            actions.undo();
          }
          break;
        case 'y':
          e.preventDefault();
          actions.redo();
          break;
        case 'c':
          e.preventDefault();
          actions.copyToClipboard();
          break;
        case 'v':
          e.preventDefault();
          actions.pasteFromClipboard();
          break;
        case 'a':
          e.preventDefault();
          selectAll();
          break;
        case 's':
          e.preventDefault();
          // Trigger save
          break;
        case 'o':
          e.preventDefault();
          // Trigger load
          break;
      }
    }
    
    // View shortcuts
    if (!ctrl) {
      switch (key) {
        case '=':
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          canvasUtils.resetView();
          break;
        case 'home':
          canvasUtils.fitToScreen();
          break;
      }
    }
  }, [actions, canvasUtils]);
  
  // Helper functions
  const deleteSelected = useCallback(() => {
    state.selectedComponents.forEach(id => actions.removeComponent(id));
    state.selectedWires.forEach(id => actions.removeWire(id));
    actions.clearSelection();
  }, [state.selectedComponents, state.selectedWires, actions]);
  
  const rotateSelected = useCallback(() => {
    state.selectedComponents.forEach(id => {
      const comp = state.components.find(c => c.id === id);
      if (comp) {
        const newRotation = ((comp.rotation || 0) + 90) % 360;
        actions.updateComponent(id, { rotation: newRotation });
      }
    });
  }, [state.selectedComponents, state.components, actions]);
  
  const flipSelected = useCallback(() => {
    state.selectedComponents.forEach(id => {
      const comp = state.components.find(c => c.id === id);
      if (comp) {
        actions.updateComponent(id, { flipped: !comp.flipped });
      }
    });
  }, [state.selectedComponents, state.components, actions]);
  
  const selectAll = useCallback(() => {
    state.components.forEach(comp => {
      actions.selectComponent(comp.id, true);
    });
  }, [state.components, actions]);
  
  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    zoomToPoint(rect.width / 2, rect.height / 2, 1);
  }, [canvasRef, zoomToPoint]);
  
  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    zoomToPoint(rect.width / 2, rect.height / 2, -1);
  }, [canvasRef, zoomToPoint]);
  
  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp, 
      handleDoubleClick, handleWheel, handleContextMenu, handleKeyDown]);
  
  return {
    findComponentAtPosition,
    findWireAtPosition,
    findTerminalAtPosition,
    deleteSelected,
    rotateSelected,
    flipSelected,
    selectAll,
    zoomIn,
    zoomOut
  };
}

// Helper function: Calculate distance from point to line segment
function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) {
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

export default useSimulatorEvents;
