/**
 * Diagram Studio Page - Enhanced Version
 * Full-featured diagram editor with all original SubSaaS features
 * Includes: gradients, 3D effects, animations, alignment, grouping, and more
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Loader, Select } from '../components/ui';
import canvasService from '../services/canvasService';
import {
  Save, FolderOpen, Download, Upload, Trash2, Plus,
  ZoomIn, ZoomOut, Maximize, Grid3x3, CircleQuestionMark,
  MousePointer, Move, Type, Square, Circle, Diamond,
  Copy, Scissors, Clipboard, RotateCcw, RotateCw,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignStartVertical,
  Group, Ungroup, Layers, Palette, Sparkles, Play, Settings,
  Star, Cloud, User, Minus, ArrowRight, Eye, PenTool, Lock, Link2
} from 'lucide-react';
import { cn } from '../lib/utils';

// Shape types with all original shapes
const SHAPE_TYPES = {
  rectangle: { name: 'Rectangle', icon: Square, defaultSize: { width: 120, height: 60 } },
  circle: { name: 'Circle', icon: Circle, defaultSize: { width: 80, height: 80 } },
  diamond: { name: 'Diamond', icon: Diamond, defaultSize: { width: 100, height: 80 } },
  parallelogram: { name: 'Parallelogram', icon: Square, defaultSize: { width: 120, height: 60 } },
  terminator: { name: 'Terminator', icon: Circle, defaultSize: { width: 100, height: 50 } },
  hexagon: { name: 'Hexagon', icon: Square, defaultSize: { width: 100, height: 80 } },
  star: { name: 'Star', icon: Star, defaultSize: { width: 80, height: 80 } },
  cylinder: { name: 'Database', icon: Circle, defaultSize: { width: 80, height: 100 } },
  cloud: { name: 'Cloud', icon: Cloud, defaultSize: { width: 120, height: 80 } },
  actor: { name: 'Actor', icon: User, defaultSize: { width: 60, height: 100 } },
  text: { name: 'Text', icon: Type, defaultSize: { width: 100, height: 40 } },
  line: { name: 'Line', icon: Minus, defaultSize: { width: 100, height: 2 } },
  arrow: { name: 'Arrow', icon: ArrowRight, defaultSize: { width: 100, height: 20 } },
};

// Animation types
const ANIMATION_TYPES = {
  none: 'None',
  fadeIn: 'Fade In',
  slideInLeft: 'Slide In Left',
  slideInRight: 'Slide In Right',
  slideInTop: 'Slide In Top',
  slideInBottom: 'Slide In Bottom',
  bounce: 'Bounce',
  pulse: 'Pulse',
  rotate: 'Rotate',
  zoom: 'Zoom',
};

// Default colors
const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#000000', '#ffffff', '#64748b', '#cbd5e1'
];

// Font families
const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
];

// Practical Example Templates
const DIAGRAM_TEMPLATES = {
  flowchart: {
    name: 'Basic Flowchart',
    description: 'Simple process flow diagram',
    shapes: [
      { id: 't1_start', type: 'terminator', x: 300, y: 30, width: 120, height: 50, text: 'Start', fill: '#22c55e', stroke: '#16a34a' },
      { id: 't1_process1', type: 'rectangle', x: 280, y: 120, width: 160, height: 60, text: 'Process Step 1', fill: '#3b82f6', stroke: '#1e40af' },
      { id: 't1_decision', type: 'diamond', x: 290, y: 230, width: 140, height: 100, text: 'Decision?', fill: '#f59e0b', stroke: '#d97706' },
      { id: 't1_process2a', type: 'rectangle', x: 100, y: 380, width: 160, height: 60, text: 'Yes Path', fill: '#22c55e', stroke: '#16a34a' },
      { id: 't1_process2b', type: 'rectangle', x: 460, y: 380, width: 160, height: 60, text: 'No Path', fill: '#ef4444', stroke: '#dc2626' },
      { id: 't1_end', type: 'terminator', x: 300, y: 500, width: 120, height: 50, text: 'End', fill: '#8b5cf6', stroke: '#7c3aed' },
    ],
    connections: [
      { id: 'c1', from: 't1_start', to: 't1_process1', stroke: '#64748b', arrow: true },
      { id: 'c2', from: 't1_process1', to: 't1_decision', stroke: '#64748b', arrow: true },
      { id: 'c3', from: 't1_decision', to: 't1_process2a', stroke: '#22c55e', arrow: true },
      { id: 'c4', from: 't1_decision', to: 't1_process2b', stroke: '#ef4444', arrow: true },
      { id: 'c5', from: 't1_process2a', to: 't1_end', stroke: '#64748b', arrow: true },
      { id: 'c6', from: 't1_process2b', to: 't1_end', stroke: '#64748b', arrow: true },
    ]
  },
  usecase: {
    name: 'Use Case Diagram',
    description: 'UML Use Case diagram example',
    shapes: [
      { id: 't2_actor1', type: 'actor', x: 60, y: 100, width: 50, height: 80, text: '', fill: '#64748b', stroke: '#475569' },
      { id: 't2_label1', type: 'text', x: 30, y: 200, width: 110, height: 30, text: 'User', fill: 'transparent', stroke: 'transparent', textColor: '#000' },
      { id: 't2_actor2', type: 'actor', x: 60, y: 280, width: 50, height: 80, text: '', fill: '#64748b', stroke: '#475569' },
      { id: 't2_label2', type: 'text', x: 30, y: 380, width: 110, height: 30, text: 'Admin', fill: 'transparent', stroke: 'transparent', textColor: '#000' },
      { id: 't2_system', type: 'rectangle', x: 200, y: 40, width: 400, height: 400, text: 'System', fill: '#f8fafc', stroke: '#94a3b8', strokeWidth: 2 },
      { id: 't2_uc1', type: 'circle', x: 280, y: 100, width: 120, height: 60, text: 'Login', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't2_uc2', type: 'circle', x: 440, y: 100, width: 120, height: 60, text: 'Register', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't2_uc3', type: 'circle', x: 280, y: 200, width: 120, height: 60, text: 'View Data', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't2_uc4', type: 'circle', x: 440, y: 200, width: 120, height: 60, text: 'Edit Data', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't2_uc5', type: 'circle', x: 360, y: 300, width: 120, height: 60, text: 'Manage Users', fill: '#dbeafe', stroke: '#3b82f6' },
    ],
    connections: [
      { id: 'c1', from: 't2_actor1', to: 't2_uc1', stroke: '#64748b', arrow: true },
      { id: 'c2', from: 't2_actor1', to: 't2_uc2', stroke: '#64748b', arrow: true },
      { id: 'c3', from: 't2_actor1', to: 't2_uc3', stroke: '#64748b', arrow: true },
      { id: 'c4', from: 't2_actor2', to: 't2_uc1', stroke: '#64748b', arrow: true },
      { id: 'c5', from: 't2_actor2', to: 't2_uc4', stroke: '#64748b', arrow: true },
      { id: 'c6', from: 't2_actor2', to: 't2_uc5', stroke: '#64748b', arrow: true },
    ]
  },
  erdiagram: {
    name: 'ER Diagram',
    description: 'Entity Relationship diagram',
    shapes: [
      { id: 't3_entity1', type: 'rectangle', x: 100, y: 60, width: 140, height: 50, text: 'Customer', fill: '#3b82f6', stroke: '#1e40af' },
      { id: 't3_attr1', type: 'circle', x: 60, y: 150, width: 80, height: 40, text: 'ID', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't3_attr2', type: 'circle', x: 160, y: 150, width: 80, height: 40, text: 'Name', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't3_rel1', type: 'diamond', x: 280, y: 60, width: 100, height: 60, text: 'Places', fill: '#22c55e', stroke: '#16a34a' },
      { id: 't3_entity2', type: 'rectangle', x: 420, y: 60, width: 140, height: 50, text: 'Order', fill: '#3b82f6', stroke: '#1e40af' },
      { id: 't3_attr3', type: 'circle', x: 380, y: 150, width: 80, height: 40, text: 'Order ID', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't3_attr4', type: 'circle', x: 500, y: 150, width: 80, height: 40, text: 'Date', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't3_rel2', type: 'diamond', x: 600, y: 60, width: 100, height: 60, text: 'Contains', fill: '#22c55e', stroke: '#16a34a' },
      { id: 't3_entity3', type: 'rectangle', x: 740, y: 60, width: 140, height: 50, text: 'Product', fill: '#3b82f6', stroke: '#1e40af' },
      { id: 't3_attr5', type: 'circle', x: 700, y: 150, width: 80, height: 40, text: 'SKU', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't3_attr6', type: 'circle', x: 820, y: 150, width: 80, height: 40, text: 'Price', fill: '#fef3c7', stroke: '#f59e0b' },
    ],
    connections: [
      { id: 'c1', from: 't3_entity1', to: 't3_rel1', stroke: '#64748b', arrow: false },
      { id: 'c2', from: 't3_rel1', to: 't3_entity2', stroke: '#64748b', arrow: false },
      { id: 'c3', from: 't3_entity2', to: 't3_rel2', stroke: '#64748b', arrow: false },
      { id: 'c4', from: 't3_rel2', to: 't3_entity3', stroke: '#64748b', arrow: false },
      { id: 'c5', from: 't3_entity1', to: 't3_attr1', stroke: '#94a3b8', arrow: false },
      { id: 'c6', from: 't3_entity1', to: 't3_attr2', stroke: '#94a3b8', arrow: false },
      { id: 'c7', from: 't3_entity2', to: 't3_attr3', stroke: '#94a3b8', arrow: false },
      { id: 'c8', from: 't3_entity2', to: 't3_attr4', stroke: '#94a3b8', arrow: false },
      { id: 'c9', from: 't3_entity3', to: 't3_attr5', stroke: '#94a3b8', arrow: false },
      { id: 'c10', from: 't3_entity3', to: 't3_attr6', stroke: '#94a3b8', arrow: false },
    ]
  },
  network: {
    name: 'Network Diagram',
    description: 'Network topology diagram',
    shapes: [
      { id: 't4_cloud', type: 'cloud', x: 340, y: 20, width: 140, height: 80, text: 'Internet', fill: '#e0f2fe', stroke: '#0ea5e9' },
      { id: 't4_firewall', type: 'hexagon', x: 355, y: 140, width: 110, height: 60, text: 'Firewall', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't4_router', type: 'cylinder', x: 355, y: 250, width: 110, height: 80, text: 'Router', fill: '#dbeafe', stroke: '#3b82f6' },
      { id: 't4_switch', type: 'rectangle', x: 355, y: 380, width: 110, height: 50, text: 'Switch', fill: '#f3e8ff', stroke: '#a855f7' },
      { id: 't4_server', type: 'rectangle', x: 120, y: 380, width: 100, height: 60, text: 'Server', fill: '#dcfce7', stroke: '#22c55e' },
      { id: 't4_pc1', type: 'rectangle', x: 520, y: 320, width: 80, height: 50, text: 'PC 1', fill: '#f1f5f9', stroke: '#64748b' },
      { id: 't4_pc2', type: 'rectangle', x: 620, y: 320, width: 80, height: 50, text: 'PC 2', fill: '#f1f5f9', stroke: '#64748b' },
      { id: 't4_pc3', type: 'rectangle', x: 520, y: 400, width: 80, height: 50, text: 'PC 3', fill: '#f1f5f9', stroke: '#64748b' },
      { id: 't4_pc4', type: 'rectangle', x: 620, y: 400, width: 80, height: 50, text: 'PC 4', fill: '#f1f5f9', stroke: '#64748b' },
    ],
    connections: [
      { id: 'c1', from: 't4_cloud', to: 't4_firewall', stroke: '#0ea5e9', arrow: false },
      { id: 'c2', from: 't4_firewall', to: 't4_router', stroke: '#3b82f6', arrow: false },
      { id: 'c3', from: 't4_router', to: 't4_switch', stroke: '#a855f7', arrow: false },
      { id: 'c4', from: 't4_switch', to: 't4_server', stroke: '#22c55e', arrow: false },
      { id: 'c5', from: 't4_switch', to: 't4_pc1', stroke: '#64748b', arrow: false },
      { id: 'c6', from: 't4_switch', to: 't4_pc2', stroke: '#64748b', arrow: false },
      { id: 'c7', from: 't4_switch', to: 't4_pc3', stroke: '#64748b', arrow: false },
      { id: 'c8', from: 't4_switch', to: 't4_pc4', stroke: '#64748b', arrow: false },
    ]
  },
  orgchart: {
    name: 'Organization Chart',
    description: 'Company organizational structure',
    shapes: [
      { id: 't5_ceo', type: 'rectangle', x: 340, y: 30, width: 140, height: 50, text: 'CEO', fill: '#3b82f6', stroke: '#1e40af', textColor: '#fff' },
      { id: 't5_cto', type: 'rectangle', x: 140, y: 130, width: 120, height: 45, text: 'CTO', fill: '#22c55e', stroke: '#16a34a', textColor: '#fff' },
      { id: 't5_cfo', type: 'rectangle', x: 350, y: 130, width: 120, height: 45, text: 'CFO', fill: '#22c55e', stroke: '#16a34a', textColor: '#fff' },
      { id: 't5_coo', type: 'rectangle', x: 560, y: 130, width: 120, height: 45, text: 'COO', fill: '#22c55e', stroke: '#16a34a', textColor: '#fff' },
      { id: 't5_dev1', type: 'rectangle', x: 60, y: 230, width: 100, height: 40, text: 'Dev Team', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't5_dev2', type: 'rectangle', x: 180, y: 230, width: 100, height: 40, text: 'QA Team', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't5_fin1', type: 'rectangle', x: 300, y: 230, width: 100, height: 40, text: 'Accounting', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't5_fin2', type: 'rectangle', x: 420, y: 230, width: 100, height: 40, text: 'Treasury', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't5_ops1', type: 'rectangle', x: 540, y: 230, width: 100, height: 40, text: 'Operations', fill: '#fef3c7', stroke: '#f59e0b' },
      { id: 't5_ops2', type: 'rectangle', x: 660, y: 230, width: 100, height: 40, text: 'Support', fill: '#fef3c7', stroke: '#f59e0b' },
    ],
    connections: [
      { id: 'c1', from: 't5_ceo', to: 't5_cto', stroke: '#64748b', arrow: false },
      { id: 'c2', from: 't5_ceo', to: 't5_cfo', stroke: '#64748b', arrow: false },
      { id: 'c3', from: 't5_ceo', to: 't5_coo', stroke: '#64748b', arrow: false },
      { id: 'c4', from: 't5_cto', to: 't5_dev1', stroke: '#64748b', arrow: false },
      { id: 'c5', from: 't5_cto', to: 't5_dev2', stroke: '#64748b', arrow: false },
      { id: 'c6', from: 't5_cfo', to: 't5_fin1', stroke: '#64748b', arrow: false },
      { id: 'c7', from: 't5_cfo', to: 't5_fin2', stroke: '#64748b', arrow: false },
      { id: 'c8', from: 't5_coo', to: 't5_ops1', stroke: '#64748b', arrow: false },
      { id: 'c9', from: 't5_coo', to: 't5_ops2', stroke: '#64748b', arrow: false },
    ]
  },
  swimlane: {
    name: 'Swimlane Diagram',
    description: 'Cross-functional flowchart',
    shapes: [
      { id: 't6_lane1', type: 'rectangle', x: 50, y: 50, width: 700, height: 120, text: '', fill: '#dbeafe', stroke: '#3b82f6', strokeWidth: 1, opacity: 0.3 },
      { id: 't6_label1', type: 'text', x: 60, y: 95, width: 80, height: 30, text: 'Customer', fill: 'transparent', stroke: 'transparent', textColor: '#1e40af', fontSize: 12 },
      { id: 't6_lane2', type: 'rectangle', x: 50, y: 170, width: 700, height: 120, text: '', fill: '#dcfce7', stroke: '#22c55e', strokeWidth: 1, opacity: 0.3 },
      { id: 't6_label2', type: 'text', x: 60, y: 215, width: 80, height: 30, text: 'Sales', fill: 'transparent', stroke: 'transparent', textColor: '#16a34a', fontSize: 12 },
      { id: 't6_lane3', type: 'rectangle', x: 50, y: 290, width: 700, height: 120, text: '', fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1, opacity: 0.3 },
      { id: 't6_label3', type: 'text', x: 60, y: 335, width: 80, height: 30, text: 'Warehouse', fill: 'transparent', stroke: 'transparent', textColor: '#d97706', fontSize: 12 },
      { id: 't6_start', type: 'terminator', x: 180, y: 85, width: 100, height: 40, text: 'Order', fill: '#3b82f6', stroke: '#1e40af' },
      { id: 't6_process1', type: 'rectangle', x: 180, y: 205, width: 100, height: 50, text: 'Review', fill: '#22c55e', stroke: '#16a34a' },
      { id: 't6_decision', type: 'diamond', x: 330, y: 195, width: 80, height: 70, text: 'Stock?', fill: '#f59e0b', stroke: '#d97706' },
      { id: 't6_process2', type: 'rectangle', x: 450, y: 325, width: 100, height: 50, text: 'Ship', fill: '#f59e0b', stroke: '#d97706' },
      { id: 't6_process3', type: 'rectangle', x: 450, y: 205, width: 100, height: 50, text: 'Backorder', fill: '#ef4444', stroke: '#dc2626' },
      { id: 't6_end', type: 'terminator', x: 600, y: 85, width: 100, height: 40, text: 'Complete', fill: '#8b5cf6', stroke: '#7c3aed' },
    ],
    connections: [
      { id: 'c1', from: 't6_start', to: 't6_process1', stroke: '#64748b', arrow: true },
      { id: 'c2', from: 't6_process1', to: 't6_decision', stroke: '#64748b', arrow: true },
      { id: 'c3', from: 't6_decision', to: 't6_process2', stroke: '#22c55e', arrow: true },
      { id: 'c4', from: 't6_decision', to: 't6_process3', stroke: '#ef4444', arrow: true },
      { id: 'c5', from: 't6_process2', to: 't6_end', stroke: '#64748b', arrow: true },
      { id: 'c6', from: 't6_process3', to: 't6_end', stroke: '#64748b', arrow: true },
    ]
  }
};

/**
 * Shape Component with full styling support
 */
function Shape({ shape, isSelected, onClick, onDragStart, onResize, scale = 1 }) {
  const {
    id, type, x, y, width, height, text, fontSize = 14,
    fill, stroke, strokeWidth = 2, opacity = 1,
    // Gradient support
    useGradient, gradientType, gradientColor1, gradientColor2, gradientAngle,
    // 3D effects
    shadow, shadowBlur, shadowColor, shadowOffset,
    bevel, depth3d,
    // Animation
    animation, animationDuration, animationDelay,
    // Text styling
    textColor, textShadow, textOutline, fontFamily
  } = shape;

  // Generate gradient ID
  const gradientId = `gradient-${id}`;
  
  // Calculate gradient colors
  const getGradientColors = () => {
    if (!useGradient) return fill;
    return gradientType === 'radial'
      ? { type: 'radial', colors: [gradientColor1 || fill, gradientColor2 || stroke] }
      : { type: 'linear', angle: gradientAngle || 0, colors: [gradientColor1 || fill, gradientColor2 || stroke] };
  };

  // Animation styles
  const animationStyle = useMemo(() => {
    if (!animation || animation === 'none') return {};
    
    const duration = (animationDuration || 500) / 1000;
    const delay = (animationDelay || 0) / 1000;
    
    return {
      animationName: animation,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      animationFillMode: 'forwards',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }, [animation, animationDuration, animationDelay]);

  // Shadow filter
  const shadowFilter = shadow ? `drop-shadow(${shadowOffset?.x || 2}px ${shadowOffset?.y || 2}px ${shadowBlur || 4}px ${shadowColor || 'rgba(0,0,0,0.3)'})` : '';

  // Render shape path based on type
  const renderShapePath = () => {
    switch (type) {
      case 'circle':
        return <ellipse cx={width/2} cy={height/2} rx={width/2} ry={height/2} />;
      case 'diamond':
        return <polygon points={`${width/2},0 ${width},${height/2} ${width/2},${height} 0,${height/2}`} />;
      case 'parallelogram':
        const skew = 15;
        return <polygon points={`${skew},0 ${width},0 ${width-skew},${height} 0,${height}`} />;
      case 'terminator':
        const r = Math.min(height/2, 20);
        return <rect x="0" y="0" width={width} height={height} rx={r} ry={r} />;
      case 'hexagon':
        const hx = width/4;
        return <polygon points={`${hx},0 ${width-hx},0 ${width},${height/2} ${width-hx},${height} ${hx},${height} 0,${height/2}`} />;
      case 'star':
        const points = [];
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? Math.min(width, height)/2 : Math.min(width, height)/4;
          const angle = (i * 36 - 90) * Math.PI / 180;
          points.push(`${width/2 + radius * Math.cos(angle)},${height/2 + radius * Math.sin(angle)}`);
        }
        return <polygon points={points.join(' ')} />;
      case 'cylinder':
        const cy = height * 0.15;
        return (
          <>
            <ellipse cx={width/2} cy={cy} rx={width/2} ry={cy} />
            <rect x="0" y={cy} width={width} height={height - cy*2} />
            <ellipse cx={width/2} cy={height - cy} rx={width/2} ry={cy} className="fill-current" style={{ fill: useGradient ? `url(#${gradientId})` : fill }} />
          </>
        );
      case 'cloud':
        return (
          <path d={`
            M ${width*0.3},${height*0.7}
            Q ${width*0.1},${height*0.7} ${width*0.1},${height*0.5}
            Q ${width*0.1},${height*0.3} ${width*0.3},${height*0.3}
            Q ${width*0.3},${height*0.1} ${width*0.5},${height*0.1}
            Q ${width*0.7},${height*0.1} ${width*0.7},${height*0.3}
            Q ${width*0.9},${height*0.3} ${width*0.9},${height*0.5}
            Q ${width*0.9},${height*0.7} ${width*0.7},${height*0.7}
            Z
          `} />
        );
      case 'actor':
        return (
          <>
            <circle cx={width/2} cy={height*0.15} r={height*0.1} />
            <line x1={width/2} y1={height*0.25} x2={width/2} y2={height*0.55} strokeWidth={2} />
            <line x1={width*0.15} y1={height*0.35} x2={width*0.85} y2={height*0.35} strokeWidth={2} />
            <line x1={width/2} y1={height*0.55} x2={width*0.2} y2={height*0.9} strokeWidth={2} />
            <line x1={width/2} y1={height*0.55} x2={width*0.8} y2={height*0.9} strokeWidth={2} />
          </>
        );
      case 'line':
        return <line x1="0" y1={height/2} x2={width} y2={height/2} />;
      case 'arrow':
        return (
          <>
            <line x1="0" y1={height/2} x2={width-15} y2={height/2} />
            <polygon points={`${width},${height/2} ${width-15},${height/2-8} ${width-15},${height/2+8}`} />
          </>
        );
      default:
        return <rect width={width} height={height} />;
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      onMouseDown={(e) => onDragStart?.(id, e)}
      className="cursor-move"
      style={{ 
        opacity,
        filter: shadowFilter,
        ...animationStyle
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4"
          rx={4}
        />
      )}
      
      {/* Gradient definition */}
      {useGradient && (
        <defs>
          {gradientType === 'radial' ? (
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={gradientColor1 || fill} />
              <stop offset="100%" stopColor={gradientColor2 || stroke} />
            </radialGradient>
          ) : (
            <linearGradient 
              id={gradientId} 
              x1="0%" y1="0%" 
              x2={`${Math.cos((gradientAngle || 0) * Math.PI / 180) * 50 + 50}%`}
              y2={`${Math.sin((gradientAngle || 0) * Math.PI / 180) * 50 + 50}%`}
            >
              <stop offset="0%" stopColor={gradientColor1 || fill} />
              <stop offset="100%" stopColor={gradientColor2 || stroke} />
            </linearGradient>
          )}
        </defs>
      )}
      
      {/* Bevel effect */}
      {bevel && (
        <>
          <rect
            x={-1}
            y={-1}
            width={width + 2}
            height={height + 2}
            fill="rgba(255,255,255,0.3)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={1}
            rx={2}
          />
        </>
      )}
      
      {/* 3D depth effect */}
      {depth3d > 0 && (
        <rect
          x={depth3d}
          y={depth3d}
          width={width}
          height={height}
          fill="rgba(0,0,0,0.2)"
          rx={2}
        />
      )}
      
      {/* Main shape */}
      <g
        fill={useGradient ? `url(#${gradientId})` : fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      >
        {renderShapePath()}
      </g>
      
      {/* Text */}
      {text && type !== 'line' && type !== 'arrow' && (
        <text
          x={width/2}
          y={height/2 + fontSize/3}
          textAnchor="middle"
          fontSize={fontSize}
          fontFamily={fontFamily || 'Arial'}
          fill={textColor || '#000000'}
          style={{
            textShadow: textShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
            WebkitTextStroke: textOutline ? '0.5px rgba(0,0,0,0.5)' : 'none'
          }}
        >
          {text}
        </text>
      )}
      
      {/* Resize handles */}
      {isSelected && (
        <>
          <rect x={-4} y={-4} width={8} height={8} fill="#3b82f6" className="cursor-nw-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={width/2-4} y={-4} width={8} height={8} fill="#3b82f6" className="cursor-n-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={width-4} y={-4} width={8} height={8} fill="#3b82f6" className="cursor-ne-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={width-4} y={height/2-4} width={8} height={8} fill="#3b82f6" className="cursor-e-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={width-4} y={height-4} width={8} height={8} fill="#3b82f6" className="cursor-se-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={width/2-4} y={height-4} width={8} height={8} fill="#3b82f6" className="cursor-s-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={-4} y={height-4} width={8} height={8} fill="#3b82f6" className="cursor-sw-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
          <rect x={-4} y={height/2-4} width={8} height={8} fill="#3b82f6" className="cursor-w-resize" onMouseDown={(e) => { e.stopPropagation(); onResize?.(id, e); }} />
        </>
      )}
    </g>
  );
}

/**
 * Connection Line Component
 */
function Connection({ connection, shapes, isSelected, onClick }) {
  const fromShape = shapes.find(s => s.id === connection.from);
  const toShape = shapes.find(s => s.id === connection.to);
  
  if (!fromShape || !toShape) return null;
  
  const x1 = fromShape.x + fromShape.width;
  const y1 = fromShape.y + fromShape.height / 2;
  const x2 = toShape.x;
  const y2 = toShape.y + toShape.height / 2;
  
  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  
  return (
    <g onClick={(e) => { e.stopPropagation(); onClick(connection.id); }}>
      <path
        d={path}
        fill="none"
        stroke={isSelected ? '#3b82f6' : connection.stroke || '#64748b'}
        strokeWidth={isSelected ? 3 : 2}
        className="cursor-pointer"
      />
      {connection.arrow && (
        <polygon
          points={`0,-5 10,0 0,5`}
          fill={isSelected ? '#3b82f6' : connection.stroke || '#64748b'}
          transform={`translate(${x2}, ${y2}) rotate(${Math.atan2(y2-y1, x2-x1) * 180 / Math.PI})`}
        />
      )}
    </g>
  );
}

/**
 * Tool Palette Component
 */
function ToolPalette({ activeTool, onToolChange, onAddShape }) {
  return (
    <div className="p-1 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Tools</h3>
      <div className="grid grid-cols-2 gap-0.5 mb-1">
        {[
          { id: 'select', icon: MousePointer, label: 'Select' },
          { id: 'pan', icon: Move, label: 'Pan' },
          { id: 'text', icon: Type, label: 'Text' },
          { id: 'connect', icon: Link2, label: 'Connect' },
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              "p-0.5 rounded text-xs transition-colors flex flex-col items-center",
              activeTool === tool.id
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
            title={tool.label}
          >
            <tool.icon className="w-2.5 h-2.5" />
            <span className="text-[7px] mt-0.5 leading-tight">{tool.label}</span>
          </button>
        ))}
      </div>
      
      <h3 className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Shapes</h3>
      <div className="grid grid-cols-2 gap-0.5 max-h-20 overflow-y-auto">
        {Object.entries(SHAPE_TYPES).map(([type, config]) => (
          <button
            key={type}
            onClick={() => onAddShape(type)}
            className="p-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col items-center transition-colors"
            title={config.name}
          >
            <config.icon className="w-2.5 h-2.5" />
            <span className="text-[6px] mt-0.5 truncate w-full text-center leading-tight">{config.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Properties Panel Component - Full featured
 */
function PropertiesPanel({ selectedShape, onUpdateShape, onDeleteShape }) {
  if (!selectedShape) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <p className="text-sm text-gray-500">Select a shape to edit properties</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdateShape(selectedShape.id, { [key]: value });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Properties</h3>
      
      {/* Basic Properties */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Text</label>
          <input
            type="text"
            value={selectedShape.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">X</label>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={Math.round(selectedShape.width)}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={Math.round(selectedShape.height)}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
      
      {/* Fill & Stroke */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Fill & Stroke</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Fill</label>
            <input
              type="color"
              value={selectedShape.fill || '#3b82f6'}
              onChange={(e) => handleChange('fill', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Stroke</label>
            <input
              type="color"
              value={selectedShape.stroke || '#1e40af'}
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-xs text-gray-500">Stroke Width: {selectedShape.strokeWidth || 2}px</label>
          <input
            type="range"
            min="0"
            max="10"
            value={selectedShape.strokeWidth || 2}
            onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mt-2">
          <label className="text-xs text-gray-500">Opacity: {Math.round((selectedShape.opacity || 1) * 100)}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={(selectedShape.opacity || 1) * 100}
            onChange={(e) => handleChange('opacity', Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Gradient */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-500">Gradient</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedShape.useGradient || false}
              onChange={(e) => handleChange('useGradient', e.target.checked)}
              className="mr-1"
            />
            <span className="text-xs">Enable</span>
          </label>
        </div>
        {selectedShape.useGradient && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-500">Color 1</label>
                <input
                  type="color"
                  value={selectedShape.gradientColor1 || selectedShape.fill || '#3b82f6'}
                  onChange={(e) => handleChange('gradientColor1', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Color 2</label>
                <input
                  type="color"
                  value={selectedShape.gradientColor2 || selectedShape.stroke || '#1e40af'}
                  onChange={(e) => handleChange('gradientColor2', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="text-xs text-gray-500">Type</label>
              <select
                value={selectedShape.gradientType || 'linear'}
                onChange={(e) => handleChange('gradientType', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>
            {selectedShape.gradientType === 'linear' && (
              <div>
                <label className="text-xs text-gray-500">Angle: {selectedShape.gradientAngle || 0}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedShape.gradientAngle || 0}
                  onChange={(e) => handleChange('gradientAngle', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 3D Effects */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">3D Effects</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedShape.shadow || false}
              onChange={(e) => handleChange('shadow', e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Shadow</span>
          </label>
          {selectedShape.shadow && (
            <div>
              <label className="text-xs text-gray-500">Blur: {selectedShape.shadowBlur || 4}px</label>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedShape.shadowBlur || 4}
                onChange={(e) => handleChange('shadowBlur', Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedShape.bevel || false}
              onChange={(e) => handleChange('bevel', e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Bevel</span>
          </label>
          <div>
            <label className="text-xs text-gray-500">3D Depth: {selectedShape.depth3d || 0}px</label>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedShape.depth3d || 0}
              onChange={(e) => handleChange('depth3d', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Text Styling */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Text Styling</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Font Size: {selectedShape.fontSize || 14}px</label>
            <input
              type="range"
              min="8"
              max="72"
              value={selectedShape.fontSize || 14}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Font Family</label>
            <select
              value={selectedShape.fontFamily || 'Arial'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Text Color</label>
            <input
              type="color"
              value={selectedShape.textColor || '#000000'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedShape.textShadow || false}
                onChange={(e) => handleChange('textShadow', e.target.checked)}
                className="mr-1"
              />
              <span className="text-xs">Shadow</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedShape.textOutline || false}
                onChange={(e) => handleChange('textOutline', e.target.checked)}
                className="mr-1"
              />
              <span className="text-xs">Outline</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Animation */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Animation</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <select
              value={selectedShape.animation || 'none'}
              onChange={(e) => handleChange('animation', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(ANIMATION_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          {selectedShape.animation && selectedShape.animation !== 'none' && (
            <>
              <div>
                <label className="text-xs text-gray-500">Duration: {selectedShape.animationDuration || 500}ms</label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={selectedShape.animationDuration || 500}
                  onChange={(e) => handleChange('animationDuration', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Delay: {selectedShape.animationDelay || 0}ms</label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={selectedShape.animationDelay || 0}
                  onChange={(e) => handleChange('animationDelay', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Delete Button */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <button
          onClick={() => onDeleteShape(selectedShape.id)}
          className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
        >
          Delete Shape
        </button>
      </div>
    </div>
  );
}

/**
 * Templates Panel Component - Practical Examples
 */
function TemplatesPanel({ onLoadTemplate }) {
  return (
    <div className="p-1 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Examples</h3>
      <div className="space-y-0.5 max-h-24 overflow-y-auto">
        {Object.entries(DIAGRAM_TEMPLATES).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onLoadTemplate(key)}
            className="w-full px-1 py-0.5 text-left rounded text-[9px] border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div className="font-medium text-gray-700 dark:text-gray-300 truncate text-[9px]">{template.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Layers Panel Component
 */
function LayersPanel({ shapes, selectedId, onSelect, onReorder, onToggleVisibility, onLock }) {
  return (
    <div className="p-1 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Layers</h3>
      <div className="space-y-0.5 max-h-24 overflow-y-auto">
        {[...shapes].reverse().map((shape, index) => (
          <div
            key={shape.id}
            onClick={() => onSelect(shape.id)}
            className={cn(
              "flex items-center gap-0.5 px-1 py-0.5 rounded cursor-pointer text-[8px]",
              selectedId === shape.id
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <span className="flex-1 truncate text-[8px]">{shape.text || shape.type}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(shape.id); }}
              className="p-0.5"
            >
              <Eye className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onLock(shape.id); }}
              className={cn("p-0.5", shape.locked && "text-yellow-500")}
            >
              <Lock className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Diagram Studio Page
 */
export default function DiagramStudioPage() {
  // State
  const [shapes, setShapes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [viewport, setViewport] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [status, setStatus] = useState('Ready');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftPanelState, setLeftPanelState] = useState({ x: 12, y: 84, w: 300, h: 560 });
  const [rightPanelState, setRightPanelState] = useState(() => {
    const fallbackX = 980;
    if (typeof window === 'undefined') {
      return { x: fallbackX, y: 84, w: 360, h: 560 };
    }
    return {
      x: Math.max(window.innerWidth - 380, 560),
      y: 84,
      w: 360,
      h: 560,
    };
  });
  
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const panelDragRef = useRef(null);
  const panelResizeRef = useRef(null);
  const queryClient = useQueryClient();

  // Selected shape for properties panel
  const selectedShape = selectedIds.length === 1 
    ? shapes.find(s => s.id === selectedIds[0]) 
    : null;

  // Fetch diagrams
  const { data: diagrams, isLoading: loadingDiagrams } = useQuery({
    queryKey: ['diagrams'],
    queryFn: () => canvasService.list({ type: 'diagram' })
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => canvasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      setStatus('Diagram saved');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => canvasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      setStatus('Diagram updated');
    }
  });

  // Save to history
  const saveToHistory = useCallback(() => {
    const state = { shapes, connections };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state)));
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [shapes, connections, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setShapes(prevState.shapes);
      setConnections(prevState.connections);
      setHistoryIndex(prev => prev - 1);
      setStatus('Undo');
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setShapes(nextState.shapes);
      setConnections(nextState.connections);
      setHistoryIndex(prev => prev + 1);
      setStatus('Redo');
    }
  }, [history, historyIndex]);

  // Add shape
  const handleAddShape = useCallback((type) => {
    const config = SHAPE_TYPES[type];
    const newShape = {
      id: `shape_${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: config.defaultSize.width,
      height: config.defaultSize.height,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      opacity: 1,
      text: '',
      fontSize: 14,
      fontFamily: 'Arial',
    };
    
    setShapes(prev => [...prev, newShape]);
    setSelectedIds([newShape.id]);
    saveToHistory();
    setStatus(`Added ${config.name}`);
  }, [saveToHistory]);

  // Update shape
  const handleUpdateShape = useCallback((id, updates) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // Delete shape
  const handleDeleteShape = useCallback((id) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    saveToHistory();
    setStatus('Shape deleted');
  }, [saveToHistory]);

  // Delete selected
  const handleDeleteSelected = useCallback(() => {
    setShapes(prev => prev.filter(s => !selectedIds.includes(s.id)));
    setConnections(prev => prev.filter(c => 
      !selectedIds.includes(c.from) && !selectedIds.includes(c.to)
    ));
    setSelectedIds([]);
    saveToHistory();
    setStatus(`Deleted ${selectedIds.length} items`);
  }, [selectedIds, saveToHistory]);

  // Shape click
  const handleShapeClick = useCallback((id) => {
    if (activeTool === 'connect') {
      if (!connectingFrom) {
        setConnectingFrom(id);
        setStatus('Click target shape to connect');
      } else if (connectingFrom !== id) {
        setConnections(prev => [...prev, {
          id: `conn_${Date.now()}`,
          from: connectingFrom,
          to: id,
          stroke: '#64748b',
          arrow: true,
        }]);
        setConnectingFrom(null);
        saveToHistory();
        setStatus('Connection created');
      }
      return;
    }
    if (activeTool === 'select') {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [id]
      );
    }
  }, [activeTool, connectingFrom, saveToHistory]);

  // Shape drag
  const handleShapeDragStart = useCallback((id, e) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.locked) return;

    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      originalX: shape.x,
      originalY: shape.y,
    };
  }, [shapes]);

  // Shape resize (SE corner handle)
  const resizeRef = useRef(null);
  const handleResize = useCallback((id, e) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    e.stopPropagation();
    resizeRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      startW: shape.width,
      startH: shape.height,
    };
  }, [shapes]);

  // Mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragRef.current) {
        const { id, startX, startY, originalX, originalY } = dragRef.current;
        const deltaX = (e.clientX - startX) / viewport.zoom;
        const deltaY = (e.clientY - startY) / viewport.zoom;
        let newX = originalX + deltaX;
        let newY = originalY + deltaY;
        if (snapToGrid) {
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
        }
        setShapes(prev => prev.map(s =>
          s.id === id ? { ...s, x: newX, y: newY } : s
        ));
      } else if (resizeRef.current) {
        const { id, startX, startY, startW, startH } = resizeRef.current;
        const dw = (e.clientX - startX) / viewport.zoom;
        const dh = (e.clientY - startY) / viewport.zoom;
        setShapes(prev => prev.map(s =>
          s.id === id ? { ...s, width: Math.max(20, startW + dw), height: Math.max(20, startH + dh) } : s
        ));
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current || resizeRef.current) {
        saveToHistory();
        dragRef.current = null;
        resizeRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [viewport.zoom, snapToGrid, saveToHistory]);

  // Alignment functions
  const handleAlign = useCallback((alignment) => {
    if (selectedIds.length < 2) return;
    
    const selectedShapes = shapes.filter(s => selectedIds.includes(s.id));
    let updated = false;
    
    switch (alignment) {
      case 'left':
        const minLeft = Math.min(...selectedShapes.map(s => s.x));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, x: minLeft } : s
        ));
        updated = true;
        break;
      case 'center':
        const centerX = selectedShapes.reduce((sum, s) => sum + s.x + s.width/2, 0) / selectedShapes.length;
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, x: centerX - s.width/2 } : s
        ));
        updated = true;
        break;
      case 'right':
        const maxRight = Math.max(...selectedShapes.map(s => s.x + s.width));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, x: maxRight - s.width } : s
        ));
        updated = true;
        break;
      case 'top':
        const minTop = Math.min(...selectedShapes.map(s => s.y));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, y: minTop } : s
        ));
        updated = true;
        break;
      case 'middle':
        const centerY = selectedShapes.reduce((sum, s) => sum + s.y + s.height/2, 0) / selectedShapes.length;
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, y: centerY - s.height/2 } : s
        ));
        updated = true;
        break;
      case 'bottom':
        const maxBottom = Math.max(...selectedShapes.map(s => s.y + s.height));
        setShapes(prev => prev.map(s => 
          selectedIds.includes(s.id) ? { ...s, y: maxBottom - s.height } : s
        ));
        updated = true;
        break;
    }
    
    if (updated) {
      saveToHistory();
      setStatus(`Aligned ${alignment}`);
    }
  }, [selectedIds, shapes, saveToHistory]);

  // Group/Ungroup
  const handleGroup = useCallback(() => {
    if (selectedIds.length < 2) return;
    const groupId = `group_${Date.now()}`;
    setShapes(prev => prev.map(s => 
      selectedIds.includes(s.id) ? { ...s, groupId } : s
    ));
    saveToHistory();
    setStatus('Shapes grouped');
  }, [selectedIds, saveToHistory]);

  const handleUngroup = useCallback(() => {
    const selectedShape = shapes.find(s => selectedIds.includes(s.id));
    if (!selectedShape?.groupId) return;
    
    setShapes(prev => prev.map(s => 
      s.groupId === selectedShape.groupId ? { ...s, groupId: null } : s
    ));
    saveToHistory();
    setStatus('Group ungrouped');
  }, [selectedIds, shapes, saveToHistory]);

  // Copy/Paste
  const [clipboard, setClipboard] = useState([]);
  
  const handleCopy = useCallback(() => {
    const selected = shapes.filter(s => selectedIds.includes(s.id));
    setClipboard(JSON.parse(JSON.stringify(selected)));
    setStatus(`Copied ${selected.length} shapes`);
  }, [shapes, selectedIds]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    
    const newShapes = clipboard.map(s => ({
      ...s,
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: s.x + 20,
      y: s.y + 20,
    }));
    
    setShapes(prev => [...prev, ...newShapes]);
    setSelectedIds(newShapes.map(s => s.id));
    saveToHistory();
    setStatus(`Pasted ${newShapes.length} shapes`);
  }, [clipboard, saveToHistory]);

  // Save diagram
  const handleSave = useCallback(async () => {
    const state = {
      version: '2.0',
      viewport,
      shapes,
      connections,
      metadata: {
        name: currentDiagram?.name || 'Untitled Diagram',
        type: 'diagram'
      }
    };

    try {
      if (currentDiagram?.id) {
        await updateMutation.mutateAsync({
          id: currentDiagram.id,
          data: { state }
        });
      } else {
        const result = await createMutation.mutateAsync({
          name: state.metadata.name,
          type: 'diagram',
          state
        });
        setCurrentDiagram(result);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('Save failed');
    }
  }, [shapes, connections, viewport, currentDiagram, createMutation, updateMutation]);

  // Load diagram
  const handleLoad = useCallback(async (diagram) => {
    try {
      const canvas = await canvasService.get(diagram.id);
      // canvas.data is the parsed state object (service unwraps the API wrapper)
      const state = canvas.data?.state ?? canvas.data ?? {};
      setViewport(state.viewport || { zoom: 1, offset: { x: 0, y: 0 } });
      setShapes(state.shapes || []);
      setConnections(state.connections || []);
      setCurrentDiagram(canvas);
      setSelectedIds([]);
      setStatus(`Loaded: ${canvas.name}`);
    } catch (error) {
      console.error('Load failed:', error);
      setStatus('Load failed');
    }
  }, []);

  // New diagram
  const handleNew = useCallback(() => {
    setShapes([]);
    setConnections([]);
    setSelectedIds([]);
    setCurrentDiagram(null);
    setHistory([]);
    setHistoryIndex(-1);
    setStatus('New diagram created');
  }, []);

  // Load template
  const handleLoadTemplate = useCallback((templateKey) => {
    const template = DIAGRAM_TEMPLATES[templateKey];
    if (!template) return;
    
    // Deep copy template shapes with new IDs
    const idMap = {};
    const newShapes = template.shapes.map(shape => {
      const newId = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMap[shape.id] = newId;
      return { ...shape, id: newId };
    });
    
    // Update connections with new IDs
    const newConnections = template.connections.map(conn => ({
      ...conn,
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: idMap[conn.from] || conn.from,
      to: idMap[conn.to] || conn.to,
    }));
    
    setShapes(newShapes);
    setConnections(newConnections);
    setSelectedIds([]);
    setCurrentDiagram(null);
    setHistory([]);
    setHistoryIndex(-1);
    setStatus(`Loaded template: ${template.name}`);
  }, []);

  // Export as PNG (client-side, no backend needed)
  const handleExport = useCallback(() => {
    const svgEl = canvasRef.current;
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgEl.clientWidth * 2;
      canvas.height = svgEl.clientHeight * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `${currentDiagram?.name || 'diagram'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatus('Exported as PNG');
    };
    img.src = url;
  }, [currentDiagram]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'a':
            e.preventDefault();
            setSelectedIds(shapes.map(s => s.id));
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) handleUngroup();
            else handleGroup();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedIds.length > 0) {
              handleDeleteSelected();
            }
            break;
          case 'Escape':
            setSelectedIds([]);
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleCopy, handlePaste, handleGroup, handleUngroup, handleSave, handleDeleteSelected, selectedIds, shapes]);

  // Play animations
  const handlePlayAnimations = useCallback(() => {
    // Reset and replay all animations
    setShapes(prev => prev.map(s => ({ ...s, animationReset: Date.now() })));
    setStatus('Playing animations');
  }, []);

  const startPanelDrag = useCallback((panel, e) => {
    e.preventDefault();
    const state = panel === 'left' ? leftPanelState : rightPanelState;
    panelDragRef.current = {
      panel,
      startX: e.clientX,
      startY: e.clientY,
      originalX: state.x,
      originalY: state.y,
    };
  }, [leftPanelState, rightPanelState]);

  const startPanelResize = useCallback((panel, e) => {
    e.preventDefault();
    e.stopPropagation();
    const state = panel === 'left' ? leftPanelState : rightPanelState;
    panelResizeRef.current = {
      panel,
      startX: e.clientX,
      startY: e.clientY,
      originalW: state.w,
      originalH: state.h,
    };
  }, [leftPanelState, rightPanelState]);

  useEffect(() => {
    const handlePanelMouseMove = (e) => {
      if (panelDragRef.current) {
        const { panel, startX, startY, originalX, originalY } = panelDragRef.current;
        const nextX = Math.max(0, originalX + (e.clientX - startX));
        const nextY = Math.max(56, originalY + (e.clientY - startY));
        if (panel === 'left') {
          setLeftPanelState(prev => ({ ...prev, x: nextX, y: nextY }));
        } else {
          setRightPanelState(prev => ({ ...prev, x: nextX, y: nextY }));
        }
      }

      if (panelResizeRef.current) {
        const { panel, startX, startY, originalW, originalH } = panelResizeRef.current;
        const nextW = Math.max(240, originalW + (e.clientX - startX));
        const nextH = Math.max(280, originalH + (e.clientY - startY));
        if (panel === 'left') {
          setLeftPanelState(prev => ({ ...prev, w: nextW, h: nextH }));
        } else {
          setRightPanelState(prev => ({ ...prev, w: nextW, h: nextH }));
        }
      }
    };

    const handlePanelMouseUp = () => {
      panelDragRef.current = null;
      panelResizeRef.current = null;
    };

    document.addEventListener('mousemove', handlePanelMouseMove);
    document.addEventListener('mouseup', handlePanelMouseUp);

    return () => {
      document.removeEventListener('mousemove', handlePanelMouseMove);
      document.removeEventListener('mouseup', handlePanelMouseUp);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-500" />
            Diagram Studio
          </h1>
          <span className="text-sm text-gray-500">{currentDiagram?.name || 'Untitled'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <RotateCw className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* Alignment */}
          <Button variant="ghost" size="sm" onClick={() => handleAlign('left')} disabled={selectedIds.length < 2}>
            <AlignStartHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAlign('center')} disabled={selectedIds.length < 2}>
            <AlignCenterHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAlign('right')} disabled={selectedIds.length < 2}>
            <AlignEndHorizontal className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* Group */}
          <Button variant="ghost" size="sm" onClick={handleGroup} disabled={selectedIds.length < 2}>
            <Group className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleUngroup} disabled={selectedIds.length === 0}>
            <Ungroup className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* Play Animations */}
          <Button variant="ghost" size="sm" onClick={handlePlayAnimations}>
            <Play className="w-4 h-4" />
          </Button>
          
          {/* Grid toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGridEnabled(!gridEnabled)}
            className={gridEnabled ? 'text-blue-500' : ''}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2" />
          
          {/* File operations */}
          <Button variant="ghost" size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('svg')}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={canvasRef}
          className="w-full h-full bg-white dark:bg-gray-900 cursor-crosshair"
          onClick={() => setSelectedIds([])}
        >
          {gridEnabled && (
            <defs>
              <pattern
                id="grid"
                width={20 * viewport.zoom}
                height={20 * viewport.zoom}
                patternUnits="userSpaceOnUse"
                x={viewport.offset.x % (20 * viewport.zoom)}
                y={viewport.offset.y % (20 * viewport.zoom)}
              >
                <path
                  d={`M ${20 * viewport.zoom} 0 L 0 0 0 ${20 * viewport.zoom}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-200 dark:text-gray-700"
                />
              </pattern>
            </defs>
          )}
          {gridEnabled && <rect width="100%" height="100%" fill="url(#grid)" />}

          <g transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.zoom})`}>
            {connections.map(conn => (
              <Connection
                key={conn.id}
                connection={conn}
                shapes={shapes}
                isSelected={selectedIds.includes(conn.id)}
                onClick={(id) => setSelectedIds([id])}
              />
            ))}

            {shapes.filter(s => !s.hidden).map(shape => (
              <Shape
                key={shape.id}
                shape={shape}
                isSelected={selectedIds.includes(shape.id)}
                onClick={handleShapeClick}
                onDragStart={handleShapeDragStart}
                onResize={handleResize}
                scale={viewport.zoom}
              />
            ))}
          </g>
        </svg>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow text-sm text-gray-600 dark:text-gray-400 z-20">
          {status} | Shapes: {shapes.length} | Selected: {selectedIds.length}
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow p-1 z-20">
          <button
            onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.25) }))}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm">{Math.round(viewport.zoom * 100)}%</span>
          <button
            onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.25) }))}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport({ zoom: 1, offset: { x: 0, y: 0 } })}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="absolute top-20 left-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 z-30 transition-colors"
          title="Toggle Tools & Layers"
        >
          <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          onClick={() => setShowRightPanel(!showRightPanel)}
          className="absolute top-20 right-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 z-30 transition-colors"
          title="Toggle Properties"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {showLeftPanel && (
          <div
            className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col"
            style={{ left: leftPanelState.x, top: leftPanelState.y, width: leftPanelState.w, height: leftPanelState.h }}
          >
            <div
              className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 cursor-move"
              onMouseDown={(e) => startPanelDrag('left', e)}
            >
              <h3 className="text-xs font-semibold">Tools & Layers</h3>
              <button onClick={() => setShowLeftPanel(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">x</button>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              <ToolPalette
                activeTool={activeTool}
                onToolChange={setActiveTool}
                onAddShape={handleAddShape}
              />
              <TemplatesPanel onLoadTemplate={handleLoadTemplate} />
              <LayersPanel
                shapes={shapes}
                selectedId={selectedIds[0]}
                onSelect={(id) => setSelectedIds([id])}
                onToggleVisibility={(id) => handleUpdateShape(id, { hidden: !shapes.find(s => s.id === id)?.hidden })}
                onLock={(id) => handleUpdateShape(id, { locked: !shapes.find(s => s.id === id)?.locked })}
              />
            </div>
            <button
              onMouseDown={(e) => startPanelResize('left', e)}
              className="absolute right-1 bottom-1 w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm cursor-se-resize"
              title="Resize"
            />
          </div>
        )}

        {showRightPanel && (
          <div
            className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col"
            style={{ left: rightPanelState.x, top: rightPanelState.y, width: rightPanelState.w, height: rightPanelState.h }}
          >
            <div
              className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 cursor-move"
              onMouseDown={(e) => startPanelDrag('right', e)}
            >
              <h3 className="text-xs font-semibold">Properties</h3>
              <button onClick={() => setShowRightPanel(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">x</button>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              <PropertiesPanel
                selectedShape={selectedShape}
                onUpdateShape={handleUpdateShape}
                onDeleteShape={handleDeleteShape}
              />
              <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-2 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Saved Diagrams</h3>
                {loadingDiagrams ? (
                  <Loader size="sm" />
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {diagrams?.map(d => (
                      <button
                        key={d.id}
                        onClick={() => handleLoad(d)}
                        className={cn(
                          "w-full px-2 py-1 text-left text-xs rounded transition-colors",
                          currentDiagram?.id === d.id
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        {d.name}
                      </button>
                    ))}
                    {(!diagrams || diagrams.length === 0) && (
                      <p className="text-sm text-gray-400">No saved diagrams</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onMouseDown={(e) => startPanelResize('right', e)}
              className="absolute right-1 bottom-1 w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm cursor-se-resize"
              title="Resize"
            />
          </div>
        )}
      </div>

    </div>
  );
}
