/**
 * SelectionTool
 * Handles selection and manipulation of components
 */

import React, { useCallback, useRef } from 'react';

export function SelectionTool({ canvas, state, actions }) {
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  const handleMouseDown = useCallback((e, canvasPos) => {
    dragStartRef.current = canvasPos;
    isDraggingRef.current = false;
  }, []);
  
  const handleMouseMove = useCallback((e, canvasPos) => {
    if (!dragStartRef.current) return;
    
    const dx = canvasPos.x - dragStartRef.current.x;
    const dy = canvasPos.y - dragStartRef.current.y;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isDraggingRef.current = true;
      
      // Move selected components
      if (state.selectedComponents.length > 0) {
        state.selectedComponents.forEach(id => {
          const comp = state.components.find(c => c.id === id);
          if (comp) {
            actions.moveComponent(id, comp.x + dx, comp.y + dy);
          }
        });
        dragStartRef.current = canvasPos;
      }
    }
  }, [state.selectedComponents, state.components, actions]);
  
  const handleMouseUp = useCallback((e, canvasPos) => {
    dragStartRef.current = null;
    isDraggingRef.current = false;
  }, []);
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}

export default SelectionTool;
