import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Save, Download, Printer, Plus, Trash2,
  ChevronDown, ChevronRight, X, Check, Settings, Copy,
  Move, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff,
  LayoutTemplate, Type, Image, Table2, ChartColumn, ChartPie, ChartLine,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, Bold, Italic, Underline,
  Palette, Grid3x3, Layers, FileDown, FileSpreadsheet,
  ArrowLeft, ArrowRight, GripVertical, Maximize2, Minimize2,
  Calendar, User, Building, Mail, Phone, Hash, DollarSign,
  Percent, Clock, MapPin, Pencil
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { useVDAData } from '../contexts/VDADataContext';

// Widget Types
const WIDGET_TYPES = {
  header: { icon: Type, label: 'Header', color: 'text-blue-500' },
  text: { icon: FileText, label: 'Text Block', color: 'text-gray-500' },
  table: { icon: Table2, label: 'Data Table', color: 'text-green-500' },
  chart: { icon: ChartColumn, label: 'Chart', color: 'text-purple-500' },
  image: { icon: Image, label: 'Image', color: 'text-orange-500' },
  metric: { icon: Hash, label: 'Metric Card', color: 'text-indigo-500' },
  divider: { icon: Minimize2, label: 'Divider', color: 'text-gray-400' },
  spacer: { icon: Grid3x3, label: 'Spacer', color: 'text-gray-300' }
};

// Chart Types
const CHART_TYPES = {
  bar: { icon: ChartColumn, label: 'Bar Chart' },
  line: { icon: ChartLine, label: 'Line Chart' },
  pie: { icon: ChartPie, label: 'Pie Chart' },
  doughnut: { icon: ChartPie, label: 'Doughnut Chart' }
};

// Report Templates
const REPORT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Report',
    description: 'Start from scratch',
    icon: FileText,
    widgets: []
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview with key metrics',
    icon: LayoutTemplate,
    widgets: [
      { type: 'header', content: 'Executive Summary', style: { fontSize: 24, bold: true } },
      { type: 'metric', content: { label: 'Total Revenue', value: '$125,000', change: '+12%' }, position: { x: 50, y: 100, w: 200, h: 80 } },
      { type: 'metric', content: { label: 'Active Users', value: '1,234', change: '+5%' }, position: { x: 270, y: 100, w: 200, h: 80 } },
      { type: 'metric', content: { label: 'Conversion Rate', value: '3.2%', change: '+0.8%' }, position: { x: 490, y: 100, w: 200, h: 80 } },
      { type: 'chart', content: { chartType: 'bar', title: 'Monthly Performance' }, position: { x: 50, y: 200, w: 640, h: 300 } }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Report',
    description: 'Detailed financial analysis',
    icon: DollarSign,
    widgets: [
      { type: 'header', content: 'Financial Report', style: { fontSize: 24, bold: true } },
      { type: 'text', content: 'Period: Q4 2024', style: { fontSize: 12, italic: true } },
      { type: 'table', content: { title: 'Revenue Breakdown' }, position: { x: 50, y: 120, w: 640, h: 200 } },
      { type: 'chart', content: { chartType: 'pie', title: 'Expense Distribution' }, position: { x: 50, y: 340, w: 300, h: 250 } },
      { type: 'chart', content: { chartType: 'line', title: 'Cash Flow Trend' }, position: { x: 370, y: 340, w: 320, h: 250 } }
    ]
  },
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Sales performance and analytics',
    icon: Percent,
    widgets: [
      { type: 'header', content: 'Sales Performance Report', style: { fontSize: 24, bold: true } },
      { type: 'metric', content: { label: 'Total Sales', value: '$89,432', change: '+18%' }, position: { x: 50, y: 100, w: 150, h: 80 } },
      { type: 'metric', content: { label: 'Orders', value: '456', change: '+23%' }, position: { x: 220, y: 100, w: 150, h: 80 } },
      { type: 'metric', content: { label: 'Avg Order', value: '$196', change: '-2%' }, position: { x: 390, y: 100, w: 150, h: 80 } },
      { type: 'metric', content: { label: 'Customers', value: '312', change: '+15%' }, position: { x: 560, y: 100, w: 150, h: 80 } },
      { type: 'chart', content: { chartType: 'bar', title: 'Sales by Region' }, position: { x: 50, y: 200, w: 660, h: 280 } }
    ]
  }
];

const VisualReportBuilderPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const chartRefs = useRef({});
  
  // Get data from VDA context
  const { dataSources, activeDataSource } = useVDAData();
  
  // State management
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [reportTitle, setReportTitle] = useState('Untitled Report');
  const [reportSubtitle, setReportSubtitle] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [pageWidth] = useState(794); // A4 width in pixels at 96 DPI
  const [pageHeight] = useState(1123); // A4 height in pixels at 96 DPI
  const [savedReports, setSavedReports] = useState([]);

  // Load saved reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vda_saved_reports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  }, []);

  // Add widget to canvas
  const addWidget = (type, position = null) => {
    const newWidget = {
      id: `widget_${Date.now()}`,
      type,
      position: position || { x: 50, y: 100, w: 300, h: 150 },
      content: getDefaultContent(type),
      style: getDefaultStyle(type)
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
  };

  // Get default content for widget type
  const getDefaultContent = (type) => {
    switch (type) {
      case 'header':
        return 'Report Header';
      case 'text':
        return 'Enter your text here...';
      case 'table':
        return {
          title: 'Data Table',
          headers: activeDataSource?.sheets?.[0]?.headers || ['Column 1', 'Column 2', 'Column 3'],
          rows: activeDataSource?.sheets?.[0]?.rows?.slice(0, 10) || [
            ['Data 1', 'Data 2', 'Data 3'],
            ['Data 4', 'Data 5', 'Data 6']
          ]
        };
      case 'chart':
        return {
          chartType: 'bar',
          title: 'Chart Title',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            values: [65, 59, 80, 81, 56]
          }
        };
      case 'metric':
        return { label: 'Metric Label', value: '0', change: '+0%' };
      case 'image':
        return { url: '', alt: 'Image' };
      case 'divider':
        return null;
      case 'spacer':
        return null;
      default:
        return null;
    }
  };

  // Get default style for widget type
  const getDefaultStyle = (type) => {
    switch (type) {
      case 'header':
        return { fontSize: 24, bold: true, color: '#1f2937', align: 'left' };
      case 'text':
        return { fontSize: 14, bold: false, italic: false, color: '#374151', align: 'left' };
      case 'table':
        return { headerBg: '#f3f4f6', borderColor: '#e5e7eb', striped: true };
      case 'chart':
        return { colors: ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#f44336'] };
      case 'metric':
        return { bgColor: '#f8fafc', borderColor: '#667eea', textAlign: 'center' };
      case 'divider':
        return { color: '#e5e7eb', thickness: 1, style: 'solid' };
      default:
        return {};
    }
  };

  // Update widget content
  const updateWidgetContent = (id, content) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, content: { ...w.content, ...content } } : w
    ));
  };

  // Update widget style
  const updateWidgetStyle = (id, style) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, style: { ...w.style, ...style } } : w
    ));
  };

  // Update widget position
  const updateWidgetPosition = (id, position) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, position: { ...w.position, ...position } } : w
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
        id: `widget_${Date.now()}`,
        position: { ...widget.position, x: widget.position.x + 20, y: widget.position.y + 20 }
      };
      setWidgets(prev => [...prev, newWidget]);
    }
  };

  // Handle widget drag
  const handleWidgetMouseDown = (e, widgetId) => {
    e.preventDefault();
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    setIsDragging(true);
    setSelectedWidget(widgetId);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - widget.position.x,
      y: (e.clientY - rect.top) / zoom - widget.position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    if (isDragging && selectedWidget) {
      const newX = Math.max(0, Math.min(pageWidth - 50, x - dragOffset.x));
      const newY = Math.max(0, y - dragOffset.y);
      updateWidgetPosition(selectedWidget, { x: newX, y: newY });
    }
    
    if (isResizing && selectedWidget && resizeHandle) {
      const widget = widgets.find(w => w.id === selectedWidget);
      if (!widget) return;
      
      let newW = widget.position.w;
      let newH = widget.position.h;
      
      if (resizeHandle.includes('e')) {
        newW = Math.max(100, x - widget.position.x);
      }
      if (resizeHandle.includes('s')) {
        newH = Math.max(50, y - widget.position.y);
      }
      
      updateWidgetPosition(selectedWidget, { w: newW, h: newH });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Handle resize
  const handleResizeStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
  };

  // Apply template
  const applyTemplate = (template) => {
    setWidgets(template.widgets.map((w, idx) => ({
      ...w,
      id: `widget_${Date.now()}_${idx}`,
      position: w.position || { x: 50, y: 100 + idx * 100, w: 300, h: 100 },
      style: w.style || getDefaultStyle(w.type)
    })));
    if (template.id === 'executive') setReportTitle('Executive Summary');
    else if (template.id === 'financial') setReportTitle('Financial Report');
    else if (template.id === 'sales') setReportTitle('Sales Report');
  };

  // Save report
  const saveReport = () => {
    const report = {
      id: `report_${Date.now()}`,
      title: reportTitle,
      subtitle: reportSubtitle,
      widgets,
      savedAt: new Date().toISOString()
    };
    
    const updated = [...savedReports.filter(r => r.title !== reportTitle), report];
    setSavedReports(updated);
    localStorage.setItem('vda_saved_reports', JSON.stringify(updated));
  };

  // Load report
  const loadReport = (report) => {
    setReportTitle(report.title);
    setReportSubtitle(report.subtitle || '');
    setWidgets(report.widgets);
  };

  // Export as PDF
  const exportPDF = async () => {
    // This would use jsPDF or html2canvas for actual PDF export
    alert('PDF export would be implemented with jsPDF/html2canvas');
  };

  // Export as HTML
  const exportHTML = () => {
    const html = generateReportHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}.html`;
    a.click();
  };

  // Generate HTML for export
  const generateReportHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${reportTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .report-header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 20px; }
    .report-title { font-size: 28px; font-weight: bold; color: #1f2937; }
    .report-subtitle { font-size: 14px; color: #6b7280; margin-top: 5px; }
    .widget { margin-bottom: 20px; }
    .metric-card { background: #f8fafc; border-left: 4px solid #667eea; padding: 15px; }
    .metric-label { font-size: 12px; color: #6b7280; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">${reportTitle}</div>
    ${reportSubtitle ? `<div class="report-subtitle">${reportSubtitle}</div>` : ''}
    <div class="report-meta">Generated on ${new Date().toLocaleDateString()}</div>
  </div>
  ${widgets.map(w => renderWidgetHTML(w)).join('\n')}
</body>
</html>`;
  };

  // Render widget as HTML
  const renderWidgetHTML = (widget) => {
    switch (widget.type) {
      case 'header':
        return `<h1 style="font-size: ${widget.style?.fontSize || 24}px; color: ${widget.style?.color || '#1f2937'}">${widget.content}</h1>`;
      case 'text':
        return `<p style="font-size: ${widget.style?.fontSize || 14}px; color: ${widget.style?.color || '#374151'}">${widget.content}</p>`;
      case 'table':
        return `
          <div class="widget">
            <h3>${widget.content?.title || 'Table'}</h3>
            <table>
              <thead><tr>${widget.content?.headers?.map(h => `<th>${h}</th>`).join('') || ''}</tr></thead>
              <tbody>${widget.content?.rows?.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('') || ''}</tbody>
            </table>
          </div>`;
      case 'metric':
        return `
          <div class="metric-card">
            <div class="metric-label">${widget.content?.label || 'Metric'}</div>
            <div class="metric-value">${widget.content?.value || '0'}</div>
            <div style="color: ${widget.content?.change?.startsWith('+') ? '#10b981' : '#ef4444'}">${widget.content?.change || ''}</div>
          </div>`;
      default:
        return '';
    }
  };

  // Render chart widget
  const renderChart = (widget) => {
    useEffect(() => {
      const canvas = chartRefs.current[widget.id];
      if (!canvas || !widget.content?.data) return;
      
      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, {
        type: widget.content.chartType || 'bar',
        data: {
          labels: widget.content.data.labels,
          datasets: [{
            label: widget.content.title,
            data: widget.content.data.values,
            backgroundColor: widget.style?.colors || ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#f44336']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: widget.content.chartType === 'pie' || widget.content.chartType === 'doughnut' }
          }
        }
      });
      
      return () => chart.destroy();
    }, [widget]);
    
    return (
      <canvas ref={el => chartRefs.current[widget.id] = el} style={{ width: '100%', height: '100%' }} />
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-700 text-white px-4 py-3 shadow-lg z-50">
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
                <FileText className="w-6 h-6" />
                Report Builder
              </h1>
              <p className="text-xs text-green-200">Design professional reports</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="px-3 py-1.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Report Title"
            />
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 hover:bg-white/20 rounded-lg transition ${showGrid ? 'bg-white/20' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/30 mx-2" />
            <button
              onClick={saveReport}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={exportHTML}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate('/visual-dashboard-builder')}
              className="px-4 py-2 bg-white text-green-700 hover:bg-green-50 rounded-lg flex items-center gap-2 font-medium transition"
            >
              <ChartColumn className="w-4 h-4" />
              Dashboard Builder
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
          className="px-3 py-1.5 text-sm rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium"
        >
          Report Builder
        </a>
        <a
          href="/visual-dashboard-builder"
          className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          Dashboard Builder
        </a>
      </div>

      {/* Main LayoutTemplate */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Widgets & Templates */}
        <div className={`${leftPanelCollapsed ? 'w-0' : 'w-72'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
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
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(WIDGET_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => addWidget(type)}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-2 border-transparent hover:border-indigo-300 transition"
                  >
                    <Icon className={`w-6 h-6 ${config.color}`} />
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
              {REPORT_TEMPLATES.map(template => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-2 border-transparent hover:border-indigo-300 transition text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-indigo-500" />
                      <span className="font-medium text-gray-800 dark:text-white text-sm">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
                  </button>
                );
              })}
            </div>
            
            {/* Saved Reports */}
            {savedReports.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-4 mb-2">Saved Reports</h3>
                <div className="space-y-2">
                  {savedReports.map(report => (
                    <button
                      key={report.id}
                      onClick={() => loadReport(report)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 border border-gray-200 dark:border-gray-600 transition text-left flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{report.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 p-8 flex justify-center">
          <div
            ref={canvasRef}
            className="bg-white shadow-2xl relative"
            style={{
              width: pageWidth * zoom,
              minHeight: pageHeight * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
            )}
            
            {/* Report Header */}
            <div className="p-8 border-b-4 border-indigo-500 bg-gradient-to-r from-gray-50 to-white">
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="text-3xl font-bold text-gray-800 w-full bg-transparent border-none focus:outline-none"
                placeholder="Report Title"
              />
              <input
                type="text"
                value={reportSubtitle}
                onChange={(e) => setReportSubtitle(e.target.value)}
                className="text-sm text-gray-500 mt-1 w-full bg-transparent border-none focus:outline-none"
                placeholder="Subtitle (optional)"
              />
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>Generated: {new Date().toLocaleDateString()}</span>
                {activeDataSource && <span>Data: {activeDataSource.name}</span>}
              </div>
            </div>
            
            {/* Widgets */}
            <div className="p-4">
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className={`absolute cursor-move transition-shadow ${
                    selectedWidget === widget.id ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{
                    left: widget.position.x,
                    top: widget.position.y,
                    width: widget.position.w,
                    minHeight: widget.position.h
                  }}
                  onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedWidget(widget.id); }}
                >
                  {/* Widget Content */}
                  <div className="w-full h-full overflow-hidden">
                    {widget.type === 'header' && (
                      <div
                        style={{
                          fontSize: widget.style?.fontSize || 24,
                          fontWeight: widget.style?.bold ? 'bold' : 'normal',
                          color: widget.style?.color || '#1f2937',
                          textAlign: widget.style?.align || 'left'
                        }}
                      >
                        {widget.content}
                      </div>
                    )}
                    
                    {widget.type === 'text' && (
                      <textarea
                        value={widget.content}
                        onChange={(e) => updateWidgetContent(widget.id, e.target.value)}
                        className="w-full h-full resize-none border-none focus:outline-none"
                        style={{
                          fontSize: widget.style?.fontSize || 14,
                          color: widget.style?.color || '#374151'
                        }}
                      />
                    )}
                    
                    {widget.type === 'table' && (
                      <div className="overflow-auto">
                        <table className="min-w-full border-collapse text-sm">
                          <thead>
                            <tr style={{ backgroundColor: widget.style?.headerBg || '#f3f4f6' }}>
                              {widget.content?.headers?.map((h, i) => (
                                <th key={i} className="border p-2 text-left font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {widget.content?.rows?.map((row, i) => (
                              <tr key={i} className={widget.style?.striped && i % 2 === 0 ? 'bg-gray-50' : ''}>
                                {row.map((cell, j) => (
                                  <td key={j} className="border p-2">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {widget.type === 'chart' && (
                      <div className="w-full h-full">
                        <h4 className="text-sm font-semibold mb-2">{widget.content?.title}</h4>
                        <div className="h-full">
                          <canvas ref={el => {
                            if (el && widget.content?.data) {
                              const ctx = el.getContext('2d');
                              new Chart(ctx, {
                                type: widget.content.chartType || 'bar',
                                data: {
                                  labels: widget.content.data.labels,
                                  datasets: [{
                                    label: widget.content.title,
                                    data: widget.content.data.values,
                                    backgroundColor: widget.style?.colors || ['#667eea', '#764ba2']
                                  }]
                                },
                                options: { responsive: true, maintainAspectRatio: false }
                              });
                            }
                          }} style={{ width: '100%', height: '100%' }} />
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'metric' && (
                      <div
                        className="p-4 rounded-lg h-full flex flex-col justify-center"
                        style={{
                          backgroundColor: widget.style?.bgColor || '#f8fafc',
                          borderLeft: `4px solid ${widget.style?.borderColor || '#667eea'}`
                        }}
                      >
                        <div className="text-xs text-gray-500 uppercase">{widget.content?.label}</div>
                        <div className="text-2xl font-bold text-gray-800">{widget.content?.value}</div>
                        <div className={`text-sm ${widget.content?.change?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {widget.content?.change}
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'divider' && (
                      <hr
                        style={{
                          borderColor: widget.style?.color || '#e5e7eb',
                          borderWidth: widget.style?.thickness || 1,
                          borderStyle: widget.style?.style || 'solid'
                        }}
                      />
                    )}
                    
                    {widget.type === 'spacer' && (
                      <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                        Spacer
                      </div>
                    )}
                  </div>
                  
                  {/* Resize Handles */}
                  {selectedWidget === widget.id && (
                    <>
                      <div
                        className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize bg-indigo-500"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                      />
                      <div
                        className="absolute right-0 top-0 w-4 h-4 cursor-e-resize bg-indigo-500"
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                      />
                      <div
                        className="absolute left-0 bottom-0 w-4 h-4 cursor-s-resize bg-indigo-500"
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                      />
                    </>
                  )}
                  
                  {/* Widget Actions */}
                  {selectedWidget === widget.id && (
                    <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white rounded shadow-lg p-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateWidget(widget.id); }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteWidget(widget.id); }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Empty State */}
              {widgets.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <LayoutTemplate className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Empty Report</h3>
                  <p>Add widgets from the left panel or choose a template</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className={`${rightPanelCollapsed ? 'w-0' : 'w-72'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
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
            {selectedWidget ? (
              <>
                {/* Selected Widget Properties */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    {WIDGET_TYPES[widgets.find(w => w.id === selectedWidget)?.type]?.label} Properties
                  </h3>
                  
                  {/* Position */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Position</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        type="number"
                        value={widgets.find(w => w.id === selectedWidget)?.position.x || 0}
                        onChange={(e) => updateWidgetPosition(selectedWidget, { x: parseInt(e.target.value) })}
                        className="px-2 py-1 text-sm border rounded"
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={widgets.find(w => w.id === selectedWidget)?.position.y || 0}
                        onChange={(e) => updateWidgetPosition(selectedWidget, { y: parseInt(e.target.value) })}
                        className="px-2 py-1 text-sm border rounded"
                        placeholder="Y"
                      />
                    </div>
                  </div>
                  
                  {/* Size */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Size</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        type="number"
                        value={widgets.find(w => w.id === selectedWidget)?.position.w || 0}
                        onChange={(e) => updateWidgetPosition(selectedWidget, { w: parseInt(e.target.value) })}
                        className="px-2 py-1 text-sm border rounded"
                        placeholder="Width"
                      />
                      <input
                        type="number"
                        value={widgets.find(w => w.id === selectedWidget)?.position.h || 0}
                        onChange={(e) => updateWidgetPosition(selectedWidget, { h: parseInt(e.target.value) })}
                        className="px-2 py-1 text-sm border rounded"
                        placeholder="Height"
                      />
                    </div>
                  </div>
                  
                  {/* Type-specific properties */}
                  {widgets.find(w => w.id === selectedWidget)?.type === 'header' && (
                    <>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Text</label>
                        <input
                          type="text"
                          value={widgets.find(w => w.id === selectedWidget)?.content || ''}
                          onChange={(e) => updateWidgetContent(selectedWidget, e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Font Size</label>
                        <input
                          type="number"
                          value={widgets.find(w => w.id === selectedWidget)?.style?.fontSize || 24}
                          onChange={(e) => updateWidgetStyle(selectedWidget, { fontSize: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        />
                      </div>
                    </>
                  )}
                  
                  {widgets.find(w => w.id === selectedWidget)?.type === 'metric' && (
                    <>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Label</label>
                        <input
                          type="text"
                          value={widgets.find(w => w.id === selectedWidget)?.content?.label || ''}
                          onChange={(e) => updateWidgetContent(selectedWidget, { label: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Value</label>
                        <input
                          type="text"
                          value={widgets.find(w => w.id === selectedWidget)?.content?.value || ''}
                          onChange={(e) => updateWidgetContent(selectedWidget, { value: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Change</label>
                        <input
                          type="text"
                          value={widgets.find(w => w.id === selectedWidget)?.content?.change || ''}
                          onChange={(e) => updateWidgetContent(selectedWidget, { change: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        />
                      </div>
                    </>
                  )}
                  
                  {widgets.find(w => w.id === selectedWidget)?.type === 'chart' && (
                    <>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Chart Type</label>
                        <select
                          value={widgets.find(w => w.id === selectedWidget)?.content?.chartType || 'bar'}
                          onChange={(e) => updateWidgetContent(selectedWidget, { chartType: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        >
                          {Object.entries(CHART_TYPES).map(([type, config]) => (
                            <option key={type} value={type}>{config.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Title</label>
                        <input
                          type="text"
                          value={widgets.find(w => w.id === selectedWidget)?.content?.title || ''}
                          onChange={(e) => updateWidgetContent(selectedWidget, { title: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a widget to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualReportBuilderPage;
