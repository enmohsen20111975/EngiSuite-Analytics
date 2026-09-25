/**
 * SimulatorCanvas Component
 * Main canvas component for hydraulic circuit simulator
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/Canvas.js
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useSimulatorCanvas } from './hooks/useCanvasRender';
import { useSimulatorEvents } from './hooks/useCanvasEvents';
import * as ComponentRenderer from '../components/ComponentRenderer';
import * as WireRenderer from '../wires/WireRenderer';

export function SimulatorCanvas({ className = '', onRender }) {
  const canvasRef = useRef(null);
  const { state, actions } = useSimulator();
  
  // Canvas utilities
  const canvasUtils = useSimulatorCanvas(canvasRef, state, actions.dispatch, actions);
  
  // Event handlers
  const eventHandlers = useSimulatorEvents(canvasRef, state, actions, canvasUtils);
  
  // Render loop
  const render = useCallback(() => {
    const ctx = canvasUtils.getContext();
    if (!ctx) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Set background
    ctx.fillStyle = state.settings.theme === 'dark' ? '#1a1a2e' : '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw grid
    canvasUtils.drawGrid(ctx);
    
    // Apply transformations
    canvasUtils.applyTransform(ctx);
    
    // Draw wires (behind components)
    state.wires.forEach(wire => {
      WireRenderer.render(ctx, wire, state, {
        isSelected: state.selectedWires.includes(wire.id)
      });
    });
    
    // Draw wire being created
    if (state.tool.drawingWire && state.tool.wirePoints.length > 0) {
      WireRenderer.renderPreview(ctx, state.tool.wirePoints);
    }
    
    // Draw components
    state.components.forEach(component => {
      ComponentRenderer.render(ctx, component, state, {
        isSelected: state.selectedComponents.includes(component.id)
      });
    });
    
    // Draw selection rectangle if dragging
    // (This would be implemented in a selection tool)
    
    // Restore transformations
    canvasUtils.restoreTransform(ctx);
    
    // Call onRender callback if provided
    if (onRender) {
      onRender(ctx, state);
    }
  }, [state, canvasUtils, onRender]);
  
  // Render on state changes
  useEffect(() => {
    render();
  }, [render, state.components, state.wires, state.selectedComponents, state.selectedWires,
      state.canvas.offset, state.canvas.zoom, state.settings.theme, state.tool]);
  
  // Animation frame for simulation
  useEffect(() => {
    if (!state.simulation.isRunning) return;
    
    let animationId;
    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [state.simulation.isRunning, render]);
  
  // Canvas container style
  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    cursor: getCursor(state.tool.current)
  }), [state.tool.current]);
  
  // Canvas style
  const canvasStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    display: 'block'
  }), []);
  
  return (
    <div className={`simulator-canvas-container ${className}`} style={containerStyle}>
      <canvas
        ref={canvasRef}
        className="simulator-canvas"
        style={canvasStyle}
        tabIndex={0}
      />
      
      {/* Canvas overlay for status */}
      <div className="canvas-overlay" style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        display: 'flex',
        gap: '15px',
        fontSize: '12px',
        color: state.settings.theme === 'dark' ? '#888' : '#666',
        pointerEvents: 'none'
      }}>
        <span>Zoom: {Math.round(state.canvas.zoom * 100)}%</span>
        <span>Components: {state.components.length}</span>
        <span>Wires: {state.wires.length}</span>
        {state.simulation.isRunning && (
          <span style={{ color: '#4CAF50' }}>● Simulation Running</span>
        )}
      </div>
    </div>
  );
}

// Get cursor based on current tool
function getCursor(tool) {
  switch (tool) {
    case 'select':
      return 'default';
    case 'wire':
      return 'crosshair';
    case 'pan':
      return 'grab';
    case 'component':
      return 'copy';
    default:
      return 'default';
  }
}

export default SimulatorCanvas;
