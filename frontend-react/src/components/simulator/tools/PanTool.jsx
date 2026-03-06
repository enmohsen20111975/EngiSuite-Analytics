/**
 * PanTool
 * Handles canvas panning
 */

import React, { useCallback, useRef } from 'react';

export function PanTool({ canvas, state, actions }) {
  const lastPosRef = useRef(null);
  
  const handleMouseDown = useCallback((e, canvasPos) => {
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  
  const handleMouseMove = useCallback((e, canvasPos) => {
    if (!lastPosRef.current) return;
    
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    
    actions.panCanvas(dx, dy);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [actions]);
  
  const handleMouseUp = useCallback((e, canvasPos) => {
    lastPosRef.current = null;
  }, []);
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}

export default PanTool;
