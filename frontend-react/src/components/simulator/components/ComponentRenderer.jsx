/**
 * ComponentRenderer
 * Renders hydraulic components on the canvas
 * 
 * Converted from: external/Hydraulic-Simulator_JS/modules/core/ComponentRenderer.js
 */

import React from 'react';

// Color schemes for different themes
const COLORS = {
  light: {
    component: '#ffffff',
    stroke: '#333333',
    selected: '#2196F3',
    hover: '#e3f2fd',
    terminal: '#4CAF50',
    terminalHover: '#81C784',
    text: '#333333',
    label: '#666666',
    hydraulic: '#2196F3',
    pneumatic: '#FF9800'
  },
  dark: {
    component: '#2a2a3e',
    stroke: '#888888',
    selected: '#64B5F6',
    hover: '#3d3d5c',
    terminal: '#81C784',
    terminalHover: '#A5D6A7',
    text: '#ffffff',
    label: '#aaaaaa',
    hydraulic: '#64B5F6',
    pneumatic: '#FFB74D'
  }
};

// Render component on canvas
export function render(ctx, component, state, options = {}) {
  const { isSelected = false, isHovered = false } = options;
  const theme = state.settings.theme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  
  ctx.save();
  
  // Apply component transformations
  ctx.translate(component.x, component.y);
  
  if (component.rotation) {
    const centerX = (component.width || 60) / 2;
    const centerY = (component.height || 40) / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((component.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }
  
  if (component.flipped) {
    ctx.scale(-1, 1);
    ctx.translate(-(component.width || 60), 0);
  }
  
  // Draw selection highlight
  if (isSelected) {
    ctx.shadowColor = colors.selected;
    ctx.shadowBlur = 10;
  }
  
  // Draw component based on type
  const type = component.type;
  const renderFn = componentRenderers[type];
  
  if (renderFn) {
    renderFn(ctx, component, colors, state);
  } else {
    // Default component rendering
    renderDefaultComponent(ctx, component, colors);
  }
  
  // Reset shadow
  ctx.shadowBlur = 0;
  
  // Draw component label
  if (component.name) {
    ctx.fillStyle = colors.label;
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(component.name, (component.width || 60) / 2, (component.height || 40) + 12);
  }
  
  // Draw terminals
  renderTerminals(ctx, component, colors, state);
  
  ctx.restore();
}

// Render component terminals
function renderTerminals(ctx, component, colors, state) {
  const terminals = component.terminals || [];
  const terminalRadius = 4;
  
  terminals.forEach(terminal => {
    ctx.beginPath();
    ctx.arc(terminal.x, terminal.y, terminalRadius, 0, Math.PI * 2);
    
    // Color based on terminal type
    switch (terminal.type) {
      case 'pressure_in':
      case 'PRESSURE_IN':
        ctx.fillStyle = colors.hydraulic;
        break;
      case 'pressure_out':
      case 'PRESSURE_OUT':
        ctx.fillStyle = '#4CAF50';
        break;
      case 'return':
      case 'RETURN':
        ctx.fillStyle = '#FFA726';
        break;
      case 'drain':
      case 'DRAIN':
        ctx.fillStyle = '#78909C';
        break;
      case 'pilot':
      case 'PILOT':
      case 'control':
      case 'CONTROL':
        ctx.fillStyle = '#AB47BC';
        break;
      default:
        ctx.fillStyle = colors.terminal;
    }
    
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// Default component rendering (rectangle with label)
function renderDefaultComponent(ctx, component, colors) {
  const width = component.width || 60;
  const height = component.height || 40;
  
  // Draw body
  ctx.fillStyle = colors.component;
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 4);
  ctx.fill();
  ctx.stroke();
  
  // Draw type label
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(component.type, width / 2, height / 2);
}

// ==================== SPECIFIC COMPONENT RENDERERS ====================

const componentRenderers = {
  // PUMP
  PUMP: (ctx, comp, colors, state) => {
    const w = comp.width || 60;
    const h = comp.height || 50;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 5;
    
    // Draw circle body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.component;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw triangle (pump symbol)
    ctx.beginPath();
    ctx.moveTo(cx - r/2, cy - r/3);
    ctx.lineTo(cx + r/2, cy);
    ctx.lineTo(cx - r/2, cy + r/3);
    ctx.closePath();
    ctx.fillStyle = colors.hydraulic;
    ctx.fill();
    ctx.stroke();
    
    // Draw rotation arrow
    ctx.beginPath();
    ctx.arc(cx, cy, r - 5, -Math.PI/4, Math.PI/4);
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    const arrowX = cx + (r - 5) * Math.cos(Math.PI/4);
    const arrowY = cy + (r - 5) * Math.sin(Math.PI/4);
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 5, arrowY - 5);
    ctx.lineTo(arrowX - 5, arrowY + 3);
    ctx.fill();
  },
  
  // VARIABLE DISPLACEMENT PUMP
  VARIABLE_DISPLACEMENT_PUMP: (ctx, comp, colors, state) => {
    const w = comp.width || 70;
    const h = comp.height || 50;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 5;
    
    // Draw circle body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.component;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw variable triangle
    ctx.beginPath();
    ctx.moveTo(cx - r/2, cy - r/3);
    ctx.lineTo(cx + r/2, cy);
    ctx.lineTo(cx - r/2, cy + r/3);
    ctx.closePath();
    ctx.fillStyle = colors.hydraulic;
    ctx.fill();
    ctx.stroke();
    
    // Draw arrow indicating variable
    ctx.beginPath();
    ctx.moveTo(cx + r/3, cy - r/2);
    ctx.lineTo(cx + r/3, cy + r/2);
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Arrow heads
    ctx.beginPath();
    ctx.moveTo(cx + r/3 - 4, cy - r/2 + 6);
    ctx.lineTo(cx + r/3, cy - r/2);
    ctx.lineTo(cx + r/3 + 4, cy - r/2 + 6);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + r/3 - 4, cy + r/2 - 6);
    ctx.lineTo(cx + r/3, cy + r/2);
    ctx.lineTo(cx + r/3 + 4, cy + r/2 - 6);
    ctx.stroke();
  },
  
  // TANK / RESERVOIR
  TANK: (ctx, comp, colors, state) => {
    const w = comp.width || 80;
    const h = comp.height || 50;
    
    // Draw tank body (dashed top)
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(w - 5, 5);
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Solid sides and bottom
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(5, h - 5);
    ctx.lineTo(w - 5, h - 5);
    ctx.lineTo(w - 5, 5);
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill level
    const level = comp.state?.currentLevel || comp.properties?.fluidLevel?.value || 80;
    const fillHeight = ((h - 10) * level) / 100;
    
    ctx.fillStyle = state.settings.theme === 'dark' 
      ? 'rgba(33, 150, 243, 0.3)' 
      : 'rgba(33, 150, 243, 0.2)';
    ctx.fillRect(6, h - 5 - fillHeight, w - 11, fillHeight);
    
    // Fluid line
    ctx.beginPath();
    ctx.moveTo(6, h - 5 - fillHeight);
    ctx.lineTo(w - 6, h - 5 - fillHeight);
    ctx.strokeStyle = colors.hydraulic;
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  
  // PRESSURE SOURCE
  PRESSURE_SOURCE: (ctx, comp, colors, state) => {
    const w = comp.width || 40;
    const h = comp.height || 40;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 3;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.component;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw plus sign (pressure)
    ctx.beginPath();
    ctx.moveTo(cx - r/2, cy);
    ctx.lineTo(cx + r/2, cy);
    ctx.moveTo(cx, cy - r/2);
    ctx.lineTo(cx, cy + r/2);
    ctx.strokeStyle = colors.hydraulic;
    ctx.lineWidth = 2;
    ctx.stroke();
  },
  
  // DIRECTIONAL VALVE 4/3
  DIRECTIONAL_VALVE_4_3: (ctx, comp, colors, state) => {
    const w = comp.width || 80;
    const h = comp.height || 60;
    const boxW = w / 3;
    const boxH = h - 10;
    
    // Draw three boxes
    for (let i = 0; i < 3; i++) {
      const x = 5 + i * boxW;
      const y = 5;
      
      ctx.fillStyle = colors.component;
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(x, y, boxW - 2, boxH);
      ctx.fill();
      ctx.stroke();
      
      // Draw flow paths based on position
      const position = comp.state?.position || 0;
      const isActive = (position === -1 && i === 0) || 
                       (position === 0 && i === 1) ||
                       (position === 1 && i === 2);
      
      if (isActive) {
        ctx.fillStyle = state.settings.theme === 'dark'
          ? 'rgba(76, 175, 80, 0.3)'
          : 'rgba(76, 175, 80, 0.2)';
        ctx.fillRect(x + 1, y + 1, boxW - 4, boxH - 2);
      }
    }
    
    // Draw internal flow paths (simplified)
    drawValvePaths(ctx, 5, 5, boxW, boxH, comp.state?.position || 0);
  },
  
  // CHECK VALVE
  CHECK_VALVE: (ctx, comp, colors, state) => {
    const w = comp.width || 40;
    const h = comp.height || 30;
    
    // Draw valve body
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w * 0.3, 0);
    ctx.lineTo(w * 0.3, h);
    ctx.closePath();
    ctx.fillStyle = colors.component;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Second triangle
    ctx.beginPath();
    ctx.moveTo(w * 0.3, 0);
    ctx.lineTo(w, h/2);
    ctx.lineTo(w * 0.3, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Flow direction arrow
    if (comp.state?.isOpen) {
      ctx.beginPath();
      ctx.moveTo(w * 0.4, h/2);
      ctx.lineTo(w * 0.8, h/2);
      ctx.strokeStyle = colors.hydraulic;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(w * 0.8, h/2);
      ctx.lineTo(w * 0.7, h/2 - 4);
      ctx.lineTo(w * 0.7, h/2 + 4);
      ctx.closePath();
      ctx.fillStyle = colors.hydraulic;
      ctx.fill();
    }
  },
  
  // PRESSURE RELIEF VALVE
  PRESSURE_RELIEF_VALVE: (ctx, comp, colors, state) => {
    const w = comp.width || 50;
    const h = comp.height || 40;
    
    // Draw square body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(5, 5, w - 10, h - 10);
    ctx.fill();
    ctx.stroke();
    
    // Draw spring symbol
    ctx.beginPath();
    ctx.moveTo(w/2, 5);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(w/2 + (i % 2 === 0 ? 5 : -5), 5 + (i + 1) * 5);
    }
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(w/2, h - 5);
    ctx.lineTo(w/2, h - 15);
    ctx.strokeStyle = colors.hydraulic;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(w/2, h - 5);
    ctx.lineTo(w/2 - 4, h - 12);
    ctx.lineTo(w/2 + 4, h - 12);
    ctx.closePath();
    ctx.fillStyle = colors.hydraulic;
    ctx.fill();
    
    // Open indicator
    if (comp.state?.isOpen) {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(w - 10, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  // FLOW CONTROL VALVE
  FLOW_CONTROL_VALVE: (ctx, comp, colors, state) => {
    const w = comp.width || 50;
    const h = comp.height || 40;
    
    // Draw body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(5, 5, w - 10, h - 10, 3);
    ctx.fill();
    ctx.stroke();
    
    // Draw adjustable arrow
    ctx.beginPath();
    ctx.moveTo(w/2 - 10, h/2);
    ctx.lineTo(w/2 + 10, h/2);
    ctx.strokeStyle = colors.hydraulic;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Adjustment handle
    ctx.beginPath();
    ctx.moveTo(w/2, 5);
    ctx.lineTo(w/2, h/2 - 5);
    ctx.strokeStyle = colors.stroke;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(w/2, 5, 5, 0, Math.PI);
    ctx.stroke();
  },
  
  // CYLINDER DOUBLE ACTING
  CYLINDER_DOUBLE: (ctx, comp, colors, state) => {
    const w = comp.width || 100;
    const h = comp.height || 40;
    const pistonPos = comp.state?.position || 0;
    const stroke = w * 0.6;
    const pistonX = 20 + (pistonPos / 100) * stroke * 0.8;
    
    // Draw cylinder body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(15, 8, stroke, h - 16);
    ctx.fill();
    ctx.stroke();
    
    // Draw piston
    ctx.fillStyle = state.settings.theme === 'dark' ? '#444' : '#ddd';
    ctx.beginPath();
    ctx.rect(pistonX, 10, 8, h - 20);
    ctx.fill();
    ctx.stroke();
    
    // Draw rod
    ctx.beginPath();
    ctx.rect(pistonX + 8, h/2 - 3, w - pistonX - 20, 6);
    ctx.fill();
    ctx.stroke();
    
    // Draw end caps
    ctx.fillStyle = colors.component;
    ctx.beginPath();
    ctx.rect(10, 5, 8, h - 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(15 + stroke, 5, 8, h - 10);
    ctx.fill();
    ctx.stroke();
  },
  
  // CYLINDER SINGLE ACTING
  CYLINDER_SINGLE: (ctx, comp, colors, state) => {
    const w = comp.width || 100;
    const h = comp.height || 40;
    const pistonPos = comp.state?.position || 0;
    const stroke = w * 0.6;
    const pistonX = 20 + (pistonPos / 100) * stroke * 0.8;
    
    // Draw cylinder body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(15, 8, stroke, h - 16);
    ctx.fill();
    ctx.stroke();
    
    // Draw piston
    ctx.fillStyle = state.settings.theme === 'dark' ? '#444' : '#ddd';
    ctx.beginPath();
    ctx.rect(pistonX, 10, 8, h - 20);
    ctx.fill();
    ctx.stroke();
    
    // Draw rod
    ctx.beginPath();
    ctx.rect(pistonX + 8, h/2 - 3, w - pistonX - 20, 6);
    ctx.fill();
    ctx.stroke();
    
    // Draw spring
    ctx.beginPath();
    ctx.moveTo(10, h/2);
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(10 + (i % 2 === 0 ? 5 : -5), h/2 + (i + 1) * 3 - 7);
    }
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },
  
  // HYDRAULIC MOTOR
  HYDRAULIC_MOTOR: (ctx, comp, colors, state) => {
    const w = comp.width || 60;
    const h = comp.height || 50;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 5;
    
    // Draw circle body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.component;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw M for motor
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', cx, cy);
    
    // Draw rotation if running
    if (comp.state?.speed > 0) {
      const direction = comp.state?.direction || 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 3, 0, Math.PI * 1.5);
      ctx.strokeStyle = colors.hydraulic;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Arrow head
      const angle = Math.PI * 1.5 * direction;
      const ax = cx + (r + 3) * Math.cos(angle);
      const ay = cy + (r + 3) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 5 * direction, ay - 5);
      ctx.lineTo(ax - 5 * direction, ay + 5);
      ctx.fillStyle = colors.hydraulic;
      ctx.fill();
    }
  },
  
  // PRESSURE GAUGE
  PRESSURE_GAUGE: (ctx, comp, colors, state) => {
    const w = comp.width || 30;
    const h = comp.height || 30;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 3;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.component;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw scale marks
    for (let i = 0; i <= 10; i++) {
      const angle = (Math.PI * 0.75) + (i / 10) * Math.PI * 1.5;
      const innerR = r - 4;
      const outerR = r - (i % 5 === 0 ? 2 : 4);
      
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.5;
      ctx.stroke();
    }
    
    // Draw needle
    const pressure = comp.state?.pressure || 0;
    const maxPressure = comp.properties?.range?.value || 250;
    const needleAngle = (Math.PI * 0.75) + (pressure / maxPressure) * Math.PI * 1.5;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r - 6) * Math.cos(needleAngle), cy + (r - 6) * Math.sin(needleAngle));
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#f44336';
    ctx.fill();
  },
  
  // FLOW METER
  FLOW_METER: (ctx, comp, colors, state) => {
    const w = comp.width || 40;
    const h = comp.height || 30;
    
    // Draw body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(5, 5, w - 10, h - 10, 3);
    ctx.fill();
    ctx.stroke();
    
    // Draw flow indicator
    const flow = comp.state?.flow || 0;
    ctx.fillStyle = colors.text;
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(flow)}`, w/2, h/2 - 3);
    ctx.font = '6px Arial';
    ctx.fillText('L/min', w/2, h/2 + 5);
  },
  
  // FILTER
  FILTER: (ctx, comp, colors, state) => {
    const w = comp.width || 40;
    const h = comp.height || 50;
    
    // Draw body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(5, 5, w - 10, h - 10, 3);
    ctx.fill();
    ctx.stroke();
    
    // Draw filter lines
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 12 + i * 7;
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }
    
    // Clogging indicator
    const clogging = comp.state?.clogging || 0;
    if (clogging > 70) {
      ctx.fillStyle = '#f44336';
      ctx.beginPath();
      ctx.arc(w - 8, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  // ACCUMULATOR
  ACCUMULATOR: (ctx, comp, colors, state) => {
    const w = comp.width || 50;
    const h = comp.height || 70;
    const cx = w / 2;
    
    // Draw outer shell
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.3, w/2 - 5, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw bottom half
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.3, w/2 - 5, h * 0.25, 0, 0, Math.PI);
    ctx.lineTo(5, h - 10);
    ctx.quadraticCurveTo(cx, h - 5, w - 5, h - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Gas side indicator
    ctx.fillStyle = state.settings.theme === 'dark' 
      ? 'rgba(255, 152, 0, 0.3)' 
      : 'rgba(255, 152, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.25, w/2 - 8, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // N2 label
    ctx.fillStyle = colors.text;
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N₂', cx, h * 0.25);
  },
  
  // TEE JUNCTION
  TEE: (ctx, comp, colors, state) => {
    const w = comp.width || 40;
    const h = comp.height || 40;
    
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 3;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(w/2, h/2);
    ctx.lineTo(w/2, h);
    ctx.stroke();
    
    // Junction dot
    ctx.beginPath();
    ctx.arc(w/2, h/2, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors.stroke;
    ctx.fill();
  },
  
  // CROSS JUNCTION
  CROSS: (ctx, comp, colors, state) => {
    const w = comp.width || 40;
    const h = comp.height || 40;
    
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 3;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.stroke();
    
    // Junction dot
    ctx.beginPath();
    ctx.arc(w/2, h/2, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors.stroke;
    ctx.fill();
  },
  
  // MANIFOLD
  MANIFOLD: (ctx, comp, colors, state) => {
    const w = comp.width || 60;
    const h = comp.height || 80;
    
    // Draw body
    ctx.fillStyle = colors.component;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(10, 5, w - 20, h - 10);
    ctx.fill();
    ctx.stroke();
    
    // Draw internal lines
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(10, 5 + i * (h - 10) / 4);
      ctx.lineTo(w - 10, 5 + i * (h - 10) / 4);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }
};

// Draw valve internal paths (helper for directional valves)
function drawValvePaths(ctx, x, y, w, h, position) {
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  
  // Simplified flow paths
  // Left box (position -1)
  ctx.beginPath();
  ctx.moveTo(x + w/4, y + 5);
  ctx.lineTo(x + w/4, y + h/2);
  ctx.lineTo(x + 3*w/4, y + h/2);
  ctx.lineTo(x + 3*w/4, y + h - 5);
  ctx.stroke();
  
  // Middle box (position 0)
  ctx.beginPath();
  ctx.moveTo(x + w + w/4, y + 5);
  ctx.lineTo(x + w + w/4, y + h - 5);
  ctx.moveTo(x + w + 3*w/4, y + 5);
  ctx.lineTo(x + w + 3*w/4, y + h - 5);
  ctx.stroke();
  
  // Right box (position 1)
  ctx.beginPath();
  ctx.moveTo(x + 2*w + w/4, y + 5);
  ctx.lineTo(x + 2*w + w/4, y + h/2);
  ctx.lineTo(x + 2*w + 3*w/4, y + h/2);
  ctx.lineTo(x + 2*w + 3*w/4, y + h - 5);
  ctx.stroke();
}

export default { render };
