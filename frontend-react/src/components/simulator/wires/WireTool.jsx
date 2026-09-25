/**
 * WireTool
 * Handles wire drawing between components
 */

import React, { useCallback, useRef, useState } from 'react';
import { routeWire } from './WireRouter';

export function WireTool({ canvas, state, actions, canvasUtils }) {
  const wireStartRef = useRef(null);
  const currentPointsRef = useRef([]);
  
  const handleMouseDown = useCallback((e, canvasPos) => {
    // Find terminal at position
    const terminal = findTerminalAtPosition(canvasPos, state.components);
    
    if (terminal) {
      wireStartRef.current = {
        componentId: terminal.component.id,
        terminalId: terminal.terminal.id,
        x: terminal.component.x + terminal.terminal.x,
        y: terminal.component.y + terminal.terminal.y
      };
      
      currentPointsRef.current = [
        { x: wireStartRef.current.x, y: wireStartRef.current.y }
      ];
      
      actions.startWireDrawing(wireStartRef.current);
    }
  }, [state.components, actions]);
  
  const handleMouseMove = useCallback((e, canvasPos) => {
    if (!wireStartRef.current) return;
    
    // Update current wire points
    const lastPoint = currentPointsRef.current[currentPointsRef.current.length - 1];
    
    // Add intermediate points for orthogonal routing
    const dx = canvasPos.x - lastPoint.x;
    const dy = canvasPos.y - lastPoint.y;
    
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      // Simple orthogonal preview
      currentPointsRef.current = [
        { x: wireStartRef.current.x, y: wireStartRef.current.y },
        { x: canvasPos.x, y: wireStartRef.current.y },
        { x: canvasPos.x, y: canvasPos.y }
      ];
    }
  }, [state.components, actions]);
  
  const handleMouseUp = useCallback((e, canvasPos) => {
    if (!wireStartRef.current) return;
    
    // Find terminal at position
    const terminal = findTerminalAtPosition(canvasPos, state.components);
    
    if (terminal && terminal.component.id !== wireStartRef.current.componentId) {
      // Complete wire
      const endX = terminal.component.x + terminal.terminal.x;
      const endY = terminal.component.y + terminal.terminal.y;
      
      // Route wire
      const obstacles = state.components.map(c => ({
        x: c.x,
        y: c.y,
        width: c.width || 60,
        height: c.height || 40,
        id: c.id
      })).filter(o => o.id !== wireStartRef.current.componentId && o.id !== terminal.component.id);
      
      const route = routeWire(
        { x: wireStartRef.current.x, y: wireStartRef.current.y },
        { x: endX, y: endY },
        obstacles,
        { algorithm: 'orthogonal', gridSize: 10, clearance: 15 }
      );
      
      const wire = {
        from: {
          componentId: wireStartRef.current.componentId,
          terminalId: wireStartRef.current.terminalId
        },
        to: {
          componentId: terminal.component.id,
          terminalId: terminal.terminal.id
        },
        route
      };
      
      actions.addWire(wire);
    }
    
    // Reset
    wireStartRef.current = null;
    currentPointsRef.current = [];
    actions.endWireDrawing();
  }, [state.components, actions]);
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    currentPoints: currentPointsRef.current
  };
}

/**
 * Find terminal at canvas position
 */
function findTerminalAtPosition(pos, components) {
  const threshold = 8;
  
  for (const comp of components) {
    const terminals = comp.terminals || [];
    for (const terminal of terminals) {
      const tx = comp.x + terminal.x;
      const ty = comp.y + terminal.y;
      const distance = Math.sqrt((pos.x - tx) ** 2 + (pos.y - ty) ** 2);
      
      if (distance < threshold) {
        return { component: comp, terminal };
      }
    }
  }
  
  return null;
}

export default WireTool;
