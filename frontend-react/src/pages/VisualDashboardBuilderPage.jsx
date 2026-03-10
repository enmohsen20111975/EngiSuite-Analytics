import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Save, Download, Plus, Trash2,
  ChevronDown, ChevronRight, X, Settings, Copy, RefreshCw,
  Move, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff,
  ChartColumn, ChartPie, ChartLine, TrendingUp, TrendingDown,
  Table2, Type, Hash, Percent, DollarSign, Calendar,
  Clock, Users, Activity, CircleAlert, CircleCheck,
  ArrowLeft, ArrowRight, GripVertical, Maximize2, Minimize2,
  Grid3x3, Layers, ListFilter, Search, Bell, Menu, EllipsisVertical,
  Gauge, Target, Zap, Star, Heart
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { useVDAData } from '../contexts/VDADataContext';

// Widget Types
const WIDGET_TYPES = {
  chart: { icon: ChartColumn, label: 'Chart', color: 'text-purple-500', defaultSize: { w: 4, h: 2 } },
  metric: { icon: Hash, label: 'KPI Card', color: 'text-blue-500', defaultSize: { w: 2, h: 1 } },
  table: { icon: Table2, label: 'Data Table', color: 'text-green-500', defaultSize: { w: 4, h: 2 } },
  text: { icon: Type, label: 'Text', color: 'text-gray-500', defaultSize: { w: 2, h: 1 } },
  gauge: { icon: Gauge, label: 'Gauge', color: 'text-orange-500', defaultSize: { w: 2, h: 2 } },
  target: { icon: Target, label: 'Target', color: 'text-red-500', defaultSize: { w: 2, h: 1 } }
};

// Chart Types
const CHART_TYPES = {
  bar: { icon: ChartColumn, label: 'Bar Chart' },
  line: { icon: ChartLine, label: 'Line Chart' },
  pie: { icon: ChartPie, label: 'Pie Chart' },
  doughnut: { icon: ChartPie, label: 'Doughnut' },
  area: { icon: TrendingUp, label: 'Area Chart' },
  radar: { icon: Activity, label: 'Radar Chart' }
};

// Dashboard Templates
const DASHBOARD_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Dashboard',
    description: 'Start from scratch',
    icon: LayoutDashboard,
    widgets: []
  },
  {
    id: 'sales',
    name: 'Sales Dashboard',
    description: 'Track sales performance',
    icon: DollarSign,
    widgets: [
      { type: 'metric', title: 'Total Revenue', value: '$125,430', change: '+12.5%', trend: 'up', position: { x: 0, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Orders', value: '1,234', change: '+8.2%', trend: 'up', position: { x: 3, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Avg Order Value', value: '$101.65', change: '-2.1%', trend: 'down', position: { x: 6, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Conversion Rate', value: '3.24%', change: '+0.8%', trend: 'up', position: { x: 9, y: 0, w: 3, h: 1 } },
      { type: 'chart', chartType: 'line', title: 'Revenue Trend', position: { x: 0, y: 1, w: 8, h: 2 } },
      { type: 'chart', chartType: 'pie', title: 'Sales by Category', position: { x: 8, y: 1, w: 4, h: 2 } },
      { type: 'table', title: 'Recent Orders', position: { x: 0, y: 3, w: 12, h: 2 } }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Website and user analytics',
    icon: Activity,
    widgets: [
      { type: 'metric', title: 'Page Views', value: '45,678', change: '+15.3%', trend: 'up', position: { x: 0, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Unique Visitors', value: '12,345', change: '+9.8%', trend: 'up', position: { x: 3, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Bounce Rate', value: '42.3%', change: '-3.2%', trend: 'down', position: { x: 6, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Avg Session', value: '4m 32s', change: '+12s', trend: 'up', position: { x: 9, y: 0, w: 3, h: 1 } },
      { type: 'chart', chartType: 'area', title: 'Traffic Overview', position: { x: 0, y: 1, w: 8, h: 2 } },
      { type: 'chart', chartType: 'doughnut', title: 'Traffic Sources', position: { x: 8, y: 1, w: 4, h: 2 } },
      { type: 'chart', chartType: 'bar', title: 'Top Pages', position: { x: 0, y: 3, w: 6, h: 2 } },
      { type: 'table', title: 'Recent Activity', position: { x: 6, y: 3, w: 6, h: 2 } }
    ]
  },
  {
    id: 'executive',
    name: 'Executive Dashboard',
    description: 'High-level business overview',
    icon: Star,
    widgets: [
      { type: 'metric', title: 'Revenue', value: '$1.2M', change: '+18.5%', trend: 'up', position: { x: 0, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Profit', value: '$342K', change: '+22.1%', trend: 'up', position: { x: 3, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'Customers', value: '8,543', change: '+5.6%', trend: 'up', position: { x: 6, y: 0, w: 3, h: 1 } },
      { type: 'metric', title: 'NPS Score', value: '72', change: '+4', trend: 'up', position: { x: 9, y: 0, w: 3, h: 1 } },
      { type: 'chart', chartType: 'line', title: 'Revenue vs Target', position: { x: 0, y: 1, w: 6, h: 2 } },
      { type: 'chart', chartType: 'bar', title: 'Department Performance', position: { x: 6, y: 1, w: 6, h: 2 } },
      { type: 'gauge', title: 'Overall Progress', value: 78, position: { x: 0, y: 3, w: 3, h: 2 } },
      { type: 'target', title: 'Q4 Target', current: 78, target: 100, position: { x: 3, y: 3, w: 3, h: 2 } },
      { type: 'chart', chartType: 'pie', title: 'Revenue by Region', position: { x: 6, y: 3, w: 6, h: 2 } }
    ]
  }
];

// Grid Configuration
const GRID_COLS = 12;
const GRID_ROW_HEIGHT = 100;
const GAP = 16;

const VisualDashboardBuilderPage = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const chartRefs = useRef({});
  
  // Get data from VDA context
  const { dataSources, activeDataSource } = useVDAData();
  
  // State management
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragWidget, setDragWidget] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState('Untitled Dashboard');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [editMode, setEditMode] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load saved dashboards from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vda_saved_dashboards');
    if (saved) {
      setSavedDashboards(JSON.parse(saved));
    }
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Generate unique ID
  const generateId = () => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add widget
  const addWidget = (type, position = null) => {
    const config = WIDGET_TYPES[type];
    const defaultSize = config?.defaultSize || { w: 2, h: 1 };
    
    const newWidget = {
      id: generateId(),
      type,
      title: `${config?.label || 'Widget'} ${widgets.length + 1}`,
      position: position || findEmptyPosition(defaultSize),
      ...getDefaultWidgetContent(type)
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
  };

  // Find empty position in grid
  const findEmptyPosition = (size) => {
    const occupied = new Set();
    widgets.forEach(w => {
      for (let x = w.position.x; x < w.position.x + w.position.w; x++) {
        for (let y = w.position.y; y < w.position.y + w.position.h; y++) {
          occupied.add(`${x},${y}`);
        }
      }
    });
    
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= GRID_COLS - size.w; x++) {
        let canPlace = true;
        for (let dx = 0; dx < size.w && canPlace; dx++) {
          for (let dy = 0; dy < size.h && canPlace; dy++) {
            if (occupied.has(`${x + dx},${y + dy}`)) {
              canPlace = false;
            }
          }
        }
        if (canPlace) return { x, y, ...size };
      }
    }
    return { x: 0, y: Math.max(...widgets.map(w => w.position.y + w.position.h), 0), ...size };
  };

  // Get default widget content
  const getDefaultWidgetContent = (type) => {
    switch (type) {
      case 'chart':
        return {
          chartType: 'bar',
          dataSource: 'sample',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [65, 59, 80, 81, 56, 55]
          },
          colors: ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#f44336', '#2196f3']
        };
      case 'metric':
        return {
          value: '0',
          change: '+0%',
          trend: 'up',
          format: 'number',
          prefix: '',
          suffix: ''
        };
      case 'table':
        return {
          headers: activeDataSource?.sheets?.[0]?.headers || ['Column 1', 'Column 2', 'Column 3'],
          rows: activeDataSource?.sheets?.[0]?.rows?.slice(0, 5) || [
            ['Data 1', 'Data 2', 'Data 3'],
            ['Data 4', 'Data 5', 'Data 6']
          ],
          striped: true,
          hoverable: true
        };
      case 'text':
        return {
          content: 'Enter text here...',
          fontSize: 14,
          fontWeight: 'normal',
          textAlign: 'left'
        };
      case 'gauge':
        return {
          value: 75,
          min: 0,
          max: 100,
          thresholds: [
            { value: 33, color: '#ef4444' },
            { value: 66, color: '#f59e0b' },
            { value: 100, color: '#10b981' }
          ]
        };
      case 'target':
        return {
          current: 75,
          target: 100,
          unit: '%'
        };
      default:
        return {};
    }
  };

  // Update widget
  const updateWidget = (id, updates) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  };

  // Delete widget
  const deleteWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  };

  // Duplicate widget
  const duplicateWidget = (id) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      const newWidget = {
        ...widget,
        id: generateId(),
        position: {
          ...widget.position,
          x: Math.min(widget.position.x + 1, GRID_COLS - widget.position.w),
          y: widget.position.y
        }
      };
      setWidgets(prev => [...prev, newWidget]);
    }
  };

  // Handle drag start
  const handleDragStart = (e, widgetId) => {
    if (!editMode) return;
    e.preventDefault();
    setIsDragging(true);
    setDragWidget(widgetId);
    setSelectedWidget(widgetId);
    
    const widget = widgets.find(w => w.id === widgetId);
    const dashboard = dashboardRef.current;
    const rect = dashboard.getBoundingClientRect();
    
    const cellWidth = (rect.width - GAP * (GRID_COLS + 1)) / GRID_COLS;
    const cellHeight = GRID_ROW_HEIGHT;
    
    setDragOffset({
      x: (e.clientX - rect.left - GAP - widget.position.x * (cellWidth + GAP)) / (cellWidth + GAP),
      y: (e.clientY - rect.top - GAP - widget.position.y * (cellHeight + GAP)) / (cellHeight + GAP)
    });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!editMode) return;
    
    const dashboard = dashboardRef.current;
    if (!dashboard) return;
    
    const rect = dashboard.getBoundingClientRect();
    const cellWidth = (rect.width - GAP * (GRID_COLS + 1)) / GRID_COLS;
    const cellHeight = GRID_ROW_HEIGHT;
    
    if (isDragging && dragWidget) {
      const widget = widgets.find(w => w.id === dragWidget);
      if (!widget) return;
      
      const x = Math.round((e.clientX - rect.left - GAP - dragOffset.x * (cellWidth + GAP)) / (cellWidth + GAP));
      const y = Math.round((e.clientY - rect.top - GAP - dragOffset.y * (cellHeight + GAP)) / (cellHeight + GAP));
      
      const newX = Math.max(0, Math.min(GRID_COLS - widget.position.w, x));
      const newY = Math.max(0, y);
      
      updateWidget(dragWidget, {
        position: { ...widget.position, x: newX, y: newY }
      });
    }
    
    if (isResizing && selectedWidget && resizeHandle) {
      const widget = widgets.find(w => w.id === selectedWidget);
      if (!widget) return;
      
      const newW = Math.round((e.clientX - rect.left - GAP - widget.position.x * (cellWidth + GAP)) / cellWidth);
      const newH = Math.round((e.clientY - rect.top - GAP - widget.position.y * (cellHeight + GAP)) / cellHeight);
      
      updateWidget(selectedWidget, {
        position: {
          ...widget.position,
          w: Math.max(1, Math.min(GRID_COLS - widget.position.x, newW)),
          h: Math.max(1, newH)
        }
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragWidget(null);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Handle resize start
  const handleResizeStart = (e, handle) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
  };

  // Apply template
  const applyTemplate = (template) => {
    setWidgets(template.widgets.map((w, idx) => ({
      id: generateId(),
      ...w,
      ...getDefaultWidgetContent(w.type)
    })));
    setDashboardTitle(template.name);
  };

  // Save dashboard
  const saveDashboard = () => {
    const dashboard = {
      id: `dashboard_${Date.now()}`,
      title: dashboardTitle,
      widgets,
      savedAt: new Date().toISOString(),
      autoRefresh,
      refreshInterval
    };
    
    const updated = [...savedDashboards.filter(d => d.title !== dashboardTitle), dashboard];
    setSavedDashboards(updated);
    localStorage.setItem('vda_saved_dashboards', JSON.stringify(updated));
  };

  // Load dashboard
  const loadDashboard = (dashboard) => {
    setDashboardTitle(dashboard.title);
    setWidgets(dashboard.widgets);
    setAutoRefresh(dashboard.autoRefresh || false);
    setRefreshInterval(dashboard.refreshInterval || 30);
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    // This would refresh data from the data source
    console.log('Refreshing dashboard data...');
  };

  // Export dashboard
  const exportDashboard = () => {
    const html = generateDashboardHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboardTitle.replace(/\s+/g, '_')}.html`;
    a.click();
  };

  // Generate HTML for export
  const generateDashboardHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${dashboardTitle}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; }
    .dashboard { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
    .widget { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric { text-align: center; }
    .metric-value { font-size: 32px; font-weight: bold; color: #1f2937; }
    .metric-label { font-size: 14px; color: #6b7280; }
    .metric-change { font-size: 12px; margin-top: 4px; }
    .up { color: #10b981; }
    .down { color: #ef4444; }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>${dashboardTitle}</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    <div class="grid">
      ${widgets.map(w => renderWidgetExportHTML(w)).join('\n')}
    </div>
  </div>
</body>
</html>`;
  };

  // Render widget for export
  const renderWidgetExportHTML = (widget) => {
    const colSpan = widget.position.w;
    const rowSpan = widget.position.h;
    
    let content = '';
    
    switch (widget.type) {
      case 'metric':
        content = `
          <div class="metric">
            <div class="metric-label">${widget.title}</div>
            <div class="metric-value">${widget.prefix || ''}${widget.value}${widget.suffix || ''}</div>
            <div class="metric-change ${widget.trend}">${widget.change}</div>
          </div>`;
        break;
      case 'chart':
        content = `<canvas id="chart_${widget.id}"></canvas>`;
        break;
      case 'table':
        content = `
          <h3 style="margin-bottom: 12px">${widget.title}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead><tr>${widget.headers?.map(h => `<th style="padding: 8px; background: #f3f4f6; text-align: left; border-bottom: 2px solid #e5e7eb;">${h}</th>`).join('')}</tr></thead>
            <tbody>${widget.rows?.map(row => `<tr>${row.map(cell => `<td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>`;
        break;
      default:
        content = `<p>${widget.content || widget.title}</p>`;
    }
    
    return `<div class="widget" style="grid-column: span ${colSpan}; grid-row: span ${rowSpan};">${content}</div>`;
  };

  // Render chart
  const renderChartWidget = (widget) => {
    useEffect(() => {
      const canvas = chartRefs.current[widget.id];
      if (!canvas || !widget.data) return;
      
      const ctx = canvas.getContext('2d');
      
      const chartConfig = {
        type: widget.chartType === 'area' ? 'line' : widget.chartType,
        data: {
          labels: widget.data.labels,
          datasets: [{
            label: widget.title,
            data: widget.data.values,
            backgroundColor: widget.chartType === 'line' || widget.chartType === 'area' 
              ? `${widget.colors?.[0] || '#667eea'}33`
              : widget.colors || ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#f59e0b', '#ef4444'],
            borderColor: widget.colors?.[0] || '#667eea',
            borderWidth: 2,
            fill: widget.chartType === 'area'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: ['pie', 'doughnut'].includes(widget.chartType) }
          },
          scales: ['pie', 'doughnut', 'radar'].includes(widget.chartType) ? {} : {
            y: { beginAtZero: true }
          }
        }
      };
      
      const chart = new Chart(ctx, chartConfig);
      return () => chart.destroy();
    }, [widget]);
    
    return (
      <canvas 
        ref={el => chartRefs.current[widget.id] = el} 
        style={{ width: '100%', height: '100%' }} 
      />
    );
  };

  // Render gauge widget
  const renderGaugeWidget = (widget) => {
    const percentage = (widget.value / widget.max) * 100;
    const threshold = widget.thresholds?.find(t => widget.value <= t.value);
    const color = threshold?.color || '#667eea';
    
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={`${percentage * 3.52} 352`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{widget.value}%</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">{widget.title}</p>
      </div>
    );
  };

  // Render target widget
  const renderTargetWidget = (widget) => {
    const percentage = (widget.current / widget.target) * 100;
    
    return (
      <div className="flex flex-col justify-center h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{widget.title}</span>
          <span className="text-sm font-medium text-gray-700">{widget.current}/{widget.target}{widget.unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
          <span className={`text-xs ${percentage >= 100 ? 'text-green-500' : 'text-gray-400'}`}>
            {percentage >= 100 ? 'Target reached!' : `${(widget.target - widget.current).toFixed(0)} ${widget.unit} to go`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/data-upload')}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6" />
                Dashboard Builder
              </h1>
              <p className="text-xs text-purple-200">Create interactive dashboards</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={dashboardTitle}
              onChange={(e) => setDashboardTitle(e.target.value)}
              className="px-3 py-1.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Dashboard Title"
            />
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Clock className="w-4 h-4 text-purple-200" />
              <span className="text-sm">{currentTime.toLocaleTimeString()}</span>
            </div>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
                editMode ? 'bg-white text-purple-700' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {editMode ? <Eye className="w-4 h-4" /> : <EditIcon className="w-4 h-4" />}
              {editMode ? 'View' : 'Pencil'}
            </button>
            
            <button
              onClick={refreshDashboard}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-white/30 mx-1" />
            
            <button
              onClick={saveDashboard}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button
              onClick={exportDashboard}
              className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-2 font-medium transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <a
          href="/data-upload"
          className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          Data Upload
        </a>
        <a
          href="/visual-query-builder"
          className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          Query Builder
        </a>
        <a
          href="/visual-report-builder"
          className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          Report Builder
        </a>
        <a
          href="/visual-dashboard-builder"
          className="px-3 py-1.5 text-sm rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium"
        >
          Dashboard Builder
        </a>
      </div>

      {/* Main LayoutTemplate */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Widgets & Templates */}
        {editMode && (
          <div className={`${leftPanelCollapsed ? 'w-0' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-white">Widgets</h2>
              <button
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Widget Types */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Add Widgets</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(WIDGET_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => addWidget(type)}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 border-2 border-transparent hover:border-purple-300 transition"
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-300">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Templates */}
            <div className="flex-1 overflow-y-auto p-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Templates</h3>
              <div className="space-y-2">
                {DASHBOARD_TEMPLATES.map(template => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 border-2 border-transparent hover:border-purple-300 transition text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-gray-800 dark:text-white text-sm">{template.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
                    </button>
                  );
                })}
              </div>
              
              {/* Saved Dashboards */}
              {savedDashboards.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-4 mb-2">Saved</h3>
                  <div className="space-y-2">
                    {savedDashboards.map(dashboard => (
                      <button
                        key={dashboard.id}
                        onClick={() => loadDashboard(dashboard)}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-gray-200 dark:border-gray-600 transition text-left flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{dashboard.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className="flex-1 overflow-auto p-4">
          <div
            ref={dashboardRef}
            className="min-h-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gap: `${GAP}px`,
              gridAutoRows: `${GRID_ROW_HEIGHT}px`
            }}
          >
            {/* Grid Background */}
            {showGrid && editMode && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: `calc((100% - ${GAP * (GRID_COLS + 1)}px) / ${GRID_COLS} + ${GAP}px) ${GRID_ROW_HEIGHT + GAP}px`
                }}
              />
            )}
            
            {/* Widgets */}
            {widgets.map(widget => (
              <div
                key={widget.id}
                className={`
                  bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all overflow-hidden
                  ${selectedWidget === widget.id && editMode ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : 'border-gray-200 dark:border-gray-700'}
                  ${editMode ? 'cursor-move hover:shadow-md' : ''}
                `}
                style={{
                  gridColumn: `span ${widget.position.w}`,
                  gridRow: `span ${widget.position.h}`,
                  position: 'relative'
                }}
                onMouseDown={(e) => handleDragStart(e, widget.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedWidget(widget.id); }}
              >
                {/* Widget Header */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{widget.title}</h3>
                  {editMode && selectedWidget === widget.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateWidget(widget.id); }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Copy className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteWidget(widget.id); }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Widget Content */}
                <div className="p-4 h-full">
                  {widget.type === 'chart' && renderChartWidget(widget)}
                  
                  {widget.type === 'metric' && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        {widget.prefix}{widget.value}{widget.suffix}
                      </span>
                      <span className={`text-sm mt-1 flex items-center gap-1 ${widget.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {widget.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {widget.change}
                      </span>
                    </div>
                  )}
                  
                  {widget.type === 'table' && (
                    <div className="overflow-auto h-full">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50">
                            {widget.headers?.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {widget.rows?.map((row, i) => (
                            <tr key={i} className={`border-b border-gray-100 dark:border-gray-700 ${widget.striped && i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}>
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2 text-gray-700 dark:text-gray-300">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {widget.type === 'text' && (
                    <div 
                      className="h-full"
                      style={{ 
                        fontSize: widget.fontSize,
                        fontWeight: widget.fontWeight,
                        textAlign: widget.textAlign
                      }}
                    >
                      {widget.content}
                    </div>
                  )}
                  
                  {widget.type === 'gauge' && renderGaugeWidget(widget)}
                  
                  {widget.type === 'target' && renderTargetWidget(widget)}
                </div>
                
                {/* Resize Handle */}
                {editMode && selectedWidget === widget.id && (
                  <div
                    className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize bg-purple-500 rounded-tl"
                    onMouseDown={(e) => handleResizeStart(e, 'se')}
                  />
                )}
              </div>
            ))}
            
            {/* Empty State */}
            {widgets.length === 0 && (
              <div 
                className="col-span-12 flex flex-col items-center justify-center py-16 text-gray-400"
                style={{ gridRow: 'span 4' }}
              >
                <LayoutDashboard className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Empty Dashboard</h3>
                <p>Add widgets from the left panel or choose a template</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {editMode && selectedWidget && (
          <div className={`${rightPanelCollapsed ? 'w-0' : 'w-64'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-white">Properties</h2>
              <button
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {rightPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {(() => {
                const widget = widgets.find(w => w.id === selectedWidget);
                if (!widget) return null;
                
                return (
                  <>
                    {/* Title */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Title</label>
                      <input
                        type="text"
                        value={widget.title}
                        onChange={(e) => updateWidget(selectedWidget, { title: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                      />
                    </div>
                    
                    {/* Size */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Size (columns × rows)</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input
                          type="number"
                          value={widget.position.w}
                          onChange={(e) => updateWidget(selectedWidget, { 
                            position: { ...widget.position, w: parseInt(e.target.value) || 1 }
                          })}
                          className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          min={1}
                          max={12}
                        />
                        <input
                          type="number"
                          value={widget.position.h}
                          onChange={(e) => updateWidget(selectedWidget, { 
                            position: { ...widget.position, h: parseInt(e.target.value) || 1 }
                          })}
                          className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          min={1}
                        />
                      </div>
                    </div>
                    
                    {/* Widget-specific properties */}
                    {widget.type === 'metric' && (
                      <>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Value</label>
                          <input
                            type="text"
                            value={widget.value}
                            onChange={(e) => updateWidget(selectedWidget, { value: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Change</label>
                          <input
                            type="text"
                            value={widget.change}
                            onChange={(e) => updateWidget(selectedWidget, { change: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Trend</label>
                          <select
                            value={widget.trend}
                            onChange={(e) => updateWidget(selectedWidget, { trend: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                          >
                            <option value="up">Up</option>
                            <option value="down">Down</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Prefix</label>
                            <input
                              type="text"
                              value={widget.prefix}
                              onChange={(e) => updateWidget(selectedWidget, { prefix: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Suffix</label>
                            <input
                              type="text"
                              value={widget.suffix}
                              onChange={(e) => updateWidget(selectedWidget, { suffix: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {widget.type === 'chart' && (
                      <>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Chart Type</label>
                          <select
                            value={widget.chartType}
                            onChange={(e) => updateWidget(selectedWidget, { chartType: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                          >
                            {Object.entries(CHART_TYPES).map(([type, config]) => (
                              <option key={type} value={type}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    
                    {widget.type === 'gauge' && (
                      <>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Value</label>
                          <input
                            type="number"
                            value={widget.value}
                            onChange={(e) => updateWidget(selectedWidget, { value: parseInt(e.target.value) })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                            min={widget.min}
                            max={widget.max}
                          />
                        </div>
                      </>
                    )}
                    
                    {widget.type === 'target' && (
                      <>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Current</label>
                          <input
                            type="number"
                            value={widget.current}
                            onChange={(e) => updateWidget(selectedWidget, { current: parseInt(e.target.value) })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Target</label>
                          <input
                            type="number"
                            value={widget.target}
                            onChange={(e) => updateWidget(selectedWidget, { target: parseInt(e.target.value) })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
                          />
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Pencil Icon component
const EditIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default VisualDashboardBuilderPage;
