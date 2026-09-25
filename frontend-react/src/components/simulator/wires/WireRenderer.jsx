/**
 * WireRenderer
 * Renders hydraulic pipe connections on the canvas
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/ConnectionRenderer.js
 */

import React from 'react';

// Color schemes for different themes
const COLORS = {
  light: {
    wire: '#2196F3',
    wireSelected: '#1976D2',
    wireHover: '#64B5F6',
    pressureHigh: '#f44336',
    pressureMedium: '#FF9800',
    pressureLow: '#4CAF50',
    terminal: '#4CAF50',
    flow: '#2196F3'
  },
  dark: {
    wire: '#64B5F6',
    wireSelected: '#90CAF9',
    wireHover: '#BBDEFB',
    pressureHigh: '#EF5350',
    pressureMedium: '#FFA726',
    pressureLow: '#66BB6A',
    terminal: '#81C784',
    flow: '#64B5F6'
  }
};

/**
 * Render a wire on the canvas
 */
export function render(ctx, wire, state, options = {}) {
  const { isSelected = false, isHovered = false } = options;
  const theme = state.settings.theme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  
  if (!wire.route || wire.route.length < 2) return;
  
  ctx.save();
  
  // Get wire color based on pressure/flow
  const wireColor = getWireColor(wire, state, colors, isSelected);
  
  // Draw wire shadow for selected
  if (isSelected) {
    ctx.shadowColor = colors.wireSelected;
    ctx.shadowBlur = 8;
  }
  
  // Draw main wire
  ctx.beginPath();
  ctx.moveTo(wire.route[0].x, wire.route[0].y);
  
  for (let i = 1; i < wire.route.length; i++) {
    ctx.lineTo(wire.route[i].x, wire.route[i].y);
  }
  
  ctx.strokeStyle = wireColor;
  ctx.lineWidth = isSelected ? 4 : 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowBlur = 0;
  
  // Draw flow animation if simulation is running
  if (state.simulation.isRunning && wire.state?.flow > 0) {
    drawFlowAnimation(ctx, wire, colors);
  }
  
  // Draw junction dots at corners
  if (state.settings.showJunctionDots) {
    drawJunctionDots(ctx, wire, colors);
  }
  
  // Draw waypoints if wire is selected
  if (isSelected && state.settings.showWireWaypoints) {
    drawWaypoints(ctx, wire, colors);
  }
  
  ctx.restore();
}

/**
 * Render wire preview while drawing
 */
export function renderPreview(ctx, points) {
  if (points.length < 2) return;
  
  ctx.save();
  
  // Draw preview line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.lineCap = 'round';
  ctx.stroke();
  
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Get wire color based on state
 */
function getWireColor(wire, state, colors, isSelected) {
  if (isSelected) return colors.wireSelected;
  
  // Color based on pressure
  const pressure = wire.state?.pressure || 0;
  
  if (pressure > 200) return colors.pressureHigh;
  if (pressure > 100) return colors.pressureMedium;
  if (pressure > 0) return colors.pressureLow;
  
  return colors.wire;
}

/**
 * Draw flow animation on wire
 */
function drawFlowAnimation(ctx, wire, colors) {
  const flow = wire.state?.flow || 0;
  if (flow <= 0) return;
  
  const route = wire.route;
  if (route.length < 2) return;
  
  // Calculate total length
  let totalLength = 0;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i].x - route[i-1].x;
    const dy = route[i].y - route[i-1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  
  // Animation parameters
  const time = Date.now() / 1000;
  const speed = flow / 20; // Animation speed based on flow
  const dashLength = 10;
  const gapLength = 10;
  const offset = (time * speed * 50) % (dashLength + gapLength);
  
  // Draw animated dashes
  ctx.save();
  ctx.setLineDash([dashLength, gapLength]);
  ctx.lineDashOffset = -offset;
  
  ctx.beginPath();
  ctx.moveTo(route[0].x, route[0].y);
  for (let i = 1; i < route.length; i++) {
    ctx.lineTo(route[i].x, route[i].y);
  }
  
  ctx.strokeStyle = colors.flow;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw junction dots at wire corners
 */
function drawJunctionDots(ctx, wire, colors) {
  const route = wire.route;
  if (route.length < 3) return;
  
  // Draw dots at intermediate points
  for (let i = 1; i < route.length - 1; i++) {
    const point = route[i];
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = colors.wire;
    ctx.fill();
  }
}

/**
 * Draw waypoints for selected wire
 */
function drawWaypoints(ctx, wire, colors) {
  const route = wire.route;
  
  route.forEach((point, index) => {
    // Draw waypoint circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#2196F3';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw waypoint number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(index.toString(), point.x, point.y);
  });
}

/**
 * Draw wire labels (pressure, flow)
 */
export function drawWireLabels(ctx, wire, state, colors) {
  if (!state.settings.showPressures && !state.settings.showFlows) return;
  
  const route = wire.route;
  if (route.length < 2) return;
  
  // Find midpoint
  const midIndex = Math.floor(route.length / 2);
  const p1 = route[midIndex - 1];
  const p2 = route[midIndex];
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  
  // Draw label background
  ctx.fillStyle = state.settings.theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
  const labelWidth = 50;
  const labelHeight = 20;
  ctx.fillRect(midX - labelWidth/2, midY - labelHeight/2, labelWidth, labelHeight);
  
  // Draw label text
  ctx.fillStyle = state.settings.theme === 'dark' ? '#fff' : '#333';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let label = '';
  if (state.settings.showPressures && wire.state?.pressure) {
    label += `${Math.round(wire.state.pressure)} bar`;
  }
  if (state.settings.showFlows && wire.state?.flow) {
    if (label) label += ' | ';
    label += `${Math.round(wire.state.flow)} L/min`;
  }
  
  ctx.fillText(label, midX, midY);
}

/**
 * Calculate wire bounding box
 */
export function getWireBounds(wire) {
  if (!wire.route || wire.route.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  wire.route.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Check if point is near wire
 */
export function isPointNearWire(x, y, wire, threshold = 5) {
  if (!wire.route || wire.route.length < 2) return false;
  
  for (let i = 1; i < wire.route.length; i++) {
    const p1 = wire.route[i - 1];
    const p2 = wire.route[i];
    const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
    
    if (distance < threshold) return true;
  }
  
  return false;
}

/**
 * Calculate distance from point to line segment
 */
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

export default { 
  render, 
  renderPreview, 
  drawWireLabels, 
  getWireBounds, 
  isPointNearWire 
};
