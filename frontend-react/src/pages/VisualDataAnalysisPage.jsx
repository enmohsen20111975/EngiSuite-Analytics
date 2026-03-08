/**
 * Visual Data Analysis Page - Advanced Version
 * Full-featured data analysis and visualization tool with all original VDA features
 * Includes: Query builder, data upload, dashboard builder, report builder, multiple chart types
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Input, Loader, Select } from '../components/ui';
import canvasService from '../services/canvasService';
import {
  Save, FolderOpen, Download, Upload, Trash2, Plus,
  ZoomIn, ZoomOut, Maximize, ChartColumn, ChartLine,
  ChartPie, TrendingUp, Grid3x3, Settings, Table,
  MousePointer, Move, Type, Square, Circle, Database,
  ListFilter, RefreshCw, Share2, FileSpreadsheet, FileText,
  Layers, Play, Pause, Calculator, Search
} from 'lucide-react';
import { cn } from '../lib/utils';

// Chart types
const CHART_TYPES = {
  BAR: { name: 'Bar Chart', icon: ChartColumn, color: '#3b82f6' },
  LINE: { name: 'Line Chart', icon: ChartLine, color: '#22c55e' },
  PIE: { name: 'Pie Chart', icon: ChartPie, color: '#f59e0b' },
  AREA: { name: 'Area Chart', icon: TrendingUp, color: '#8b5cf6' },
  SCATTER: { name: 'Scatter Plot', icon: Circle, color: '#ec4899' },
  DOUGHNUT: { name: 'Doughnut Chart', icon: Circle, color: '#06b6d4' },
  RADAR: { name: 'Radar Chart', icon: Grid3x3, color: '#84cc16' },
  HORIZONTAL_BAR: { name: 'Horizontal Bar', icon: ChartColumn, color: '#f97316' },
};

// Widget types
const WIDGET_TYPES = {
  CHART: 'chart',
  METRIC: 'metric',
  TABLE: 'table',
  TEXT: 'text',
  FILTER: 'filter',
  PIVOT: 'pivot',
};

// Data source types
const DATA_SOURCE_TYPES = {
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json',
  DATABASE: 'database',
  API: 'api',
};

/**
 * Chart Widget Component
 */
function ChartWidget({ widget, data, isSelected, onClick, onResize, onConfigure }) {
  const { x, y, width, height, chartType, title, config } = widget;
  const chartConfig = CHART_TYPES[chartType] || CHART_TYPES.BAR;
  
  // Generate visualization
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <chartConfig.icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
            <Button size="sm" variant="ghost" onClick={() => onConfigure?.(widget.id)} className="mt-2">
              Configure
            </Button>
          </div>
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(d => d.value || 0));
    const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    
    switch (chartType) {
      case 'BAR':
        return (
          <div className="flex items-end justify-around h-full p-2 gap-1">
            {data.slice(0, 10).map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${maxValue > 0 ? (d.value / maxValue) * 80 : 0}%`,
                    backgroundColor: chartConfig.color,
                    minHeight: d.value > 0 ? 4 : 0
                  }}
                  title={`${d.label}: ${d.value}`}
                />
                <span className="text-[8px] text-gray-500 mt-1 truncate w-full text-center">
                  {d.label?.slice(0, 4)}
                </span>
              </div>
            ))}
          </div>
        );
      case 'LINE':
        const linePoints = data.slice(0, 10).map((d, i) => {
          const xPos = (i / Math.max(data.length - 1, 1)) * 100;
          const yPos = maxValue > 0 ? 100 - (d.value / maxValue) * 80 : 100;
          return `${xPos},${yPos}`;
        }).join(' ');
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={linePoints}
              fill="none"
              stroke={chartConfig.color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {data.slice(0, 10).map((d, i) => {
              const xPos = (i / Math.max(data.length - 1, 1)) * 100;
              const yPos = maxValue > 0 ? 100 - (d.value / maxValue) * 80 : 100;
              return (
                <circle key={i} cx={xPos} cy={yPos} r="3" fill={chartConfig.color} />
              );
            })}
          </svg>
        );
      case 'PIE':
        let currentAngle = 0;
        const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {data.slice(0, 8).map((d, i) => {
              const angle = total > 0 ? (d.value / total) * 360 : 0;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (currentAngle - 90) * Math.PI / 180;
              
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={i}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[i % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        );
      case 'DOUGHNUT':
        let doughnutAngle = 0;
        const doughnutColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {data.slice(0, 6).map((d, i) => {
              const angle = total > 0 ? (d.value / total) * 360 : 0;
              const startAngle = doughnutAngle;
              doughnutAngle += angle;
              
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (doughnutAngle - 90) * Math.PI / 180;
              
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={i}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={doughnutColors[i % doughnutColors.length]}
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
        );
      case 'AREA':
        const areaPoints = data.slice(0, 10).map((d, i) => {
          const xPos = (i / Math.max(data.length - 1, 1)) * 100;
          const yPos = maxValue > 0 ? 100 - (d.value / maxValue) * 80 : 100;
          return `${xPos},${yPos}`;
        }).join(' ');
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points={`0,100 ${areaPoints} 100,100`}
              fill={`${chartConfig.color}40`}
              stroke={chartConfig.color}
              strokeWidth="1"
            />
          </svg>
        );
      case 'SCATTER':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {data.slice(0, 20).map((d, i) => {
              const x = (d.x || Math.random() * 80) + 10;
              const y = maxValue > 0 ? 90 - (d.value / maxValue) * 80 : 50;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={chartConfig.color}
                  className="hover:r-6 transition-all"
                />
              );
            })}
          </svg>
        );
      case 'RADAR':
        const radarData = data.slice(0, 6);
        const radarMax = Math.max(...radarData.map(d => d.value || 0));
        const angleStep = (2 * Math.PI) / radarData.length;
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Grid lines */}
            {[20, 40, 60, 80].map(r => (
              <polygon
                key={r}
                points={radarData.map((_, i) => {
                  const angle = i * angleStep - Math.PI / 2;
                  return `${50 + r * Math.cos(angle) / 2},${50 + r * Math.sin(angle) / 2}`;
                }).join(' ')}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            ))}
            {/* Data polygon */}
            <polygon
              points={radarData.map((d, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = radarMax > 0 ? (d.value / radarMax) * 40 : 0;
                return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
              }).join(' ')}
              fill={`${chartConfig.color}40`}
              stroke={chartConfig.color}
              strokeWidth="2"
            />
          </svg>
        );
      case 'HORIZONTAL_BAR':
        return (
          <div className="flex flex-col justify-around h-full p-2 gap-1">
            {data.slice(0, 6).map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500 w-12 truncate">{d.label}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${maxValue > 0 ? (d.value / maxValue) * 100 : 0}%`,
                      backgroundColor: chartConfig.color
                    }}
                  />
                </div>
                <span className="text-[9px] text-gray-600">{d.value}</span>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <chartConfig.icon className="w-8 h-8" />
          </div>
        );
    }
  };
  
  return (
    <div
      className={cn(
        "absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-move",
        isSelected && "ring-2 ring-blue-500"
      )}
      style={{ left: x, top: y, width, height }}
      onClick={(e) => { e.stopPropagation(); onClick(widget.id); }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium truncate">{title || 'Chart'}</span>
        <chartConfig.icon className="w-4 h-4" style={{ color: chartConfig.color }} />
      </div>
      
      {/* Content */}
      <div className="p-2 h-[calc(100%-40px)]">
        {renderChart()}
      </div>
      
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => { e.stopPropagation(); onResize?.(widget.id, e); }}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400" />
      </div>
    </div>
  );
}

/**
 * Metric Widget Component
 */
function MetricWidget({ widget, data, isSelected, onClick }) {
  const { x, y, width, height, title, metricField, format } = widget;
  
  const value = data?.[0]?.[metricField] || data?.[0]?.value || 0;
  const formattedValue = typeof value === 'number' 
    ? (format === 'currency' ? `$${value.toLocaleString()}` : 
       format === 'percent' ? `${value.toFixed(1)}%` : 
       value.toLocaleString())
    : value;
  
  return (
    <div
      className={cn(
        "absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 cursor-move",
        isSelected && "ring-2 ring-blue-500"
      )}
      style={{ left: x, top: y, width, height }}
      onClick={(e) => { e.stopPropagation(); onClick(widget.id); }}
    >
      <div className="text-sm text-gray-500 mb-1">{title || 'Metric'}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {formattedValue}
      </div>
    </div>
  );
}

/**
 * Table Widget Component
 */
function TableWidget({ widget, data, isSelected, onClick }) {
  const { x, y, width, height, title, columns } = widget;
  
  return (
    <div
      className={cn(
        "absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-move",
        isSelected && "ring-2 ring-blue-500"
      )}
      style={{ left: x, top: y, width, height }}
      onClick={(e) => { e.stopPropagation(); onClick(widget.id); }}
    >
      <div className="px-3 py-2 border-b dark:border-gray-700">
        <span className="text-sm font-medium">{title || 'Data Table'}</span>
      </div>
      <div className="overflow-auto h-[calc(100%-40px)]">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              {(columns || Object.keys(data?.[0] || {})).slice(0, 5).map((col, i) => (
                <th key={i} className="px-2 py-1 text-left font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data || []).slice(0, 10).map((row, i) => (
              <tr key={i} className="border-b dark:border-gray-700">
                {Object.values(row).slice(0, 5).map((val, j) => (
                  <td key={j} className="px-2 py-1">{String(val).slice(0, 20)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Widget Palette Component
 */
function WidgetPalette({ onAddWidget }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Add Widget</h3>
      
      <div className="space-y-2">
        <div className="text-xs text-gray-400 font-medium">Charts</div>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
          {Object.entries(CHART_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => onAddWidget('chart', { chartType: type })}
              className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
            >
              <config.icon className="w-4 h-4" style={{ color: config.color }} />
              <span className="truncate">{config.name}</span>
            </button>
          ))}
        </div>
        
        <div className="text-xs text-gray-400 font-medium mt-3">Other</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => onAddWidget('metric', {})}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
          >
            <Database className="w-4 h-4 text-gray-500" />
            Metric
          </button>
          <button
            onClick={() => onAddWidget('table', {})}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
          >
            <Table className="w-4 h-4 text-gray-500" />
            Table
          </button>
          <button
            onClick={() => onAddWidget('text', {})}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
          >
            <Type className="w-4 h-4 text-gray-500" />
            Text
          </button>
          <button
            onClick={() => onAddWidget('filter', {})}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
          >
            <ListFilter className="w-4 h-4 text-gray-500" />
            ListFilter
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Data Upload Panel Component
 */
function DataUploadPanel({ onDataUpload, dataSources, activeSource, onSelectSource }) {
  const fileInputRef = useRef(null);
  
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let data;
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const { default: Papa } = await import('papaparse');
        const text = await file.text();
        const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
        data = result.data;
      } else if (file.name.match(/\.xlsx?$/)) {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      } else {
        console.error('Unsupported file type');
        return;
      }
      onDataUpload(file.name, data);
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };
  
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Data Sources</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Upload Data"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {dataSources?.map(source => (
          <button
            key={source.id}
            onClick={() => onSelectSource(source)}
            className={cn(
              "w-full px-2 py-1.5 text-left text-xs rounded transition-colors truncate",
              activeSource?.id === source.id
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <Database className="w-3 h-3 inline mr-1" />
            {source.name}
          </button>
        ))}
        {(!dataSources || dataSources.length === 0) && (
          <p className="text-xs text-gray-400">Upload CSV or JSON data</p>
        )}
      </div>
    </div>
  );
}

/**
 * Query Builder Panel Component
 */
function QueryBuilderPanel({ dataSource, onQuery, result }) {
  const [selectedFields, setSelectedFields] = useState([]);
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('eq');
  const [filterValue, setFilterValue] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [aggregation, setAggregation] = useState('sum');
  
  const fields = dataSource?.fields || [];
  
  const handleRunQuery = () => {
    onQuery({
      fields: selectedFields,
      filter: filterField ? { field: filterField, operator: filterOperator, value: filterValue } : null,
      groupBy,
      aggregation
    });
  };
  
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Query Builder</h3>
      
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-500">Fields</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {fields.slice(0, 6).map(field => (
              <button
                key={field}
                onClick={() => setSelectedFields(prev => 
                  prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
                )}
                className={cn(
                  "px-2 py-0.5 text-xs rounded",
                  selectedFields.includes(field)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700"
                )}
              >
                {field}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs text-gray-500">ListFilter</label>
          <div className="flex gap-1 mt-1">
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="flex-1 px-1 py-0.5 text-xs border rounded dark:bg-gray-700"
            >
              <option value="">Select field</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              className="w-16 px-1 py-0.5 text-xs border rounded dark:bg-gray-700"
            >
              <option value="eq">=</option>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
              <option value="contains">~</option>
            </select>
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Value"
              className="flex-1 px-1 py-0.5 text-xs border rounded dark:bg-gray-700"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-1 py-0.5 text-xs border rounded dark:bg-gray-700 mt-1"
            >
              <option value="">None</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Aggregate</label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              className="w-full px-1 py-0.5 text-xs border rounded dark:bg-gray-700 mt-1"
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
              <option value="max">Max</option>
              <option value="min">Min</option>
            </select>
          </div>
        </div>
        
        <Button size="sm" className="w-full" onClick={handleRunQuery}>
          <Play className="w-3 h-3 mr-1" />
          Run Query
        </Button>
      </div>
    </div>
  );
}

/**
 * Main Visual Data Analysis Page
 */
export default function VisualDataAnalysisPage() {
  // State
  const [widgets, setWidgets] = useState([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [viewport, setViewport] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [status, setStatus] = useState('Ready');
  const [dataSources, setDataSources] = useState([
    { id: 'sample_1', name: 'Sample Sales Data', type: 'sample', fields: ['category', 'value', 'date', 'region'] },
    { id: 'sample_2', name: 'Sample Analytics', type: 'sample', fields: ['metric', 'count', 'timestamp'] }
  ]);
  const [activeDataSource, setActiveDataSource] = useState(null);
  const [widgetData, setWidgetData] = useState({});
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch dashboards
  const { data: dashboards, isLoading: loadingDashboards } = useQuery({
    queryKey: ['dashboards'],
    queryFn: () => canvasService.list({ type: 'dashboard' })
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => canvasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      setStatus('Dashboard saved');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => canvasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      setStatus('Dashboard updated');
    }
  });

  // Generate sample data for widgets
  const generateSampleData = useCallback((chartType) => {
    const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return categories.map(label => ({
      label,
      value: Math.floor(Math.random() * 1000) + 100,
      x: Math.random() * 100,
      category: label
    }));
  }, []);

  // Add widget
  const handleAddWidget = useCallback((type, options = {}) => {
    const newWidget = {
      id: `widget_${Date.now()}`,
      type,
      x: 20 + (widgets.length % 3) * 220,
      y: 20 + Math.floor(widgets.length / 3) * 180,
      width: type === 'metric' ? 150 : type === 'table' ? 300 : 200,
      height: type === 'metric' ? 80 : type === 'table' ? 200 : 150,
      title: options.title || `${type.charAt(0).toUpperCase() + type.slice(1)} ${widgets.length + 1}`,
      ...options
    };
    
    setWidgets(prev => [...prev, newWidget]);
    
    // Generate sample data for the widget
    if (type === 'chart') {
      setWidgetData(prev => ({
        ...prev,
        [newWidget.id]: generateSampleData(options.chartType)
      }));
    } else if (type === 'table') {
      setWidgetData(prev => ({
        ...prev,
        [newWidget.id]: [
          { id: 1, name: 'Item 1', value: 100 },
          { id: 2, name: 'Item 2', value: 200 },
          { id: 3, name: 'Item 3', value: 300 },
        ]
      }));
    }
    
    setStatus(`Added ${type} widget`);
  }, [widgets.length, generateSampleData]);

  // Handle widget click
  const handleWidgetClick = useCallback((widgetId) => {
    setSelectedWidgetId(widgetId);
  }, []);

  // Handle widget resize
  const handleWidgetResize = useCallback((widgetId, startEvent) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const startWidth = widget.width;
    const startHeight = widget.height;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setWidgets(prev => prev.map(w => {
        if (w.id === widgetId) {
          return {
            ...w,
            width: Math.max(100, startWidth + deltaX),
            height: Math.max(80, startHeight + deltaY)
          };
        }
        return w;
      }));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [widgets]);

  // Delete selected widget
  const handleDeleteSelected = useCallback(() => {
    if (!selectedWidgetId) return;
    
    setWidgets(prev => prev.filter(w => w.id !== selectedWidgetId));
    setWidgetData(prev => {
      const newData = { ...prev };
      delete newData[selectedWidgetId];
      return newData;
    });
    setSelectedWidgetId(null);
    setStatus('Widget deleted');
  }, [selectedWidgetId]);

  // Save dashboard
  const handleSave = useCallback(async () => {
    const state = {
      version: '2.0',
      viewport,
      widgets,
      widgetData,
      dataSources,
      metadata: {
        name: currentDashboard?.name || 'Untitled Dashboard',
        type: 'dashboard'
      }
    };

    try {
      if (currentDashboard?.id) {
        await updateMutation.mutateAsync({
          id: currentDashboard.id,
          data: { state }
        });
      } else {
        const result = await createMutation.mutateAsync({
          name: state.metadata.name,
          type: 'dashboard',
          state
        });
        setCurrentDashboard(result);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('Save failed');
    }
  }, [widgets, widgetData, viewport, currentDashboard, dataSources, createMutation, updateMutation]);

  // Load dashboard
  const handleLoad = useCallback(async (dashboard) => {
    try {
      const canvas = await canvasService.get(dashboard.id);
      const state = canvas.data?.state ?? canvas.data ?? {};
      setViewport(state.viewport || { zoom: 1, offset: { x: 0, y: 0 } });
      setWidgets(state.widgets || []);
      setWidgetData(state.widgetData || {});
      setDataSources(state.dataSources || dataSources);
      setCurrentDashboard(canvas);
      setSelectedWidgetId(null);
      setStatus(`Loaded: ${canvas.name}`);
    } catch (error) {
      console.error('Load failed:', error);
      setStatus('Load failed');
    }
  }, [dataSources]);

  // New dashboard
  const handleNew = useCallback(() => {
    setWidgets([]);
    setWidgetData({});
    setSelectedWidgetId(null);
    setCurrentDashboard(null);
    setStatus('New dashboard created');
  }, []);

  // Export dashboard
  const handleExport = useCallback(async () => {
    try {
      const result = await canvasService.export(currentDashboard?.id || 'temp', 'png');
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      setStatus('Export started');
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('Export failed');
    }
  }, [currentDashboard]);

  // Handle data upload
  const handleDataUpload = useCallback((name, data) => {
    const newSource = {
      id: `data_${Date.now()}`,
      name,
      type: 'uploaded',
      data,
      fields: Object.keys(data?.[0] || {})
    };
    
    setDataSources(prev => [...prev, newSource]);
    setActiveDataSource(newSource);
    setStatus(`Uploaded: ${name}`);
  }, []);

  // Handle query
  const handleQuery = useCallback((query) => {
    if (!activeDataSource?.data) return;
    
    let result = [...activeDataSource.data];
    
    // Apply filter
    if (query.filter?.field && query.filter?.value) {
      result = result.filter(row => {
        const val = row[query.filter.field];
        switch (query.filter.operator) {
          case 'eq': return String(val) === query.filter.value;
          case 'gt': return Number(val) > Number(query.filter.value);
          case 'lt': return Number(val) < Number(query.filter.value);
          case 'contains': return String(val).includes(query.filter.value);
          default: return true;
        }
      });
    }
    
    // Apply group by
    if (query.groupBy) {
      const groups = {};
      result.forEach(row => {
        const key = row[query.groupBy];
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      
      result = Object.entries(groups).map(([key, rows]) => {
        const valueField = Object.keys(rows[0]).find(k => typeof rows[0][k] === 'number');
        let value;
        switch (query.aggregation) {
          case 'sum': value = rows.reduce((s, r) => s + (Number(r[valueField]) || 0), 0); break;
          case 'avg': value = rows.reduce((s, r) => s + (Number(r[valueField]) || 0), 0) / rows.length; break;
          case 'count': value = rows.length; break;
          case 'max': value = Math.max(...rows.map(r => Number(r[valueField]) || 0)); break;
          case 'min': value = Math.min(...rows.map(r => Number(r[valueField]) || 0)); break;
          default: value = rows.length;
        }
        return { label: key, value };
      });
    }
    
    // Update selected widget with query result
    if (selectedWidgetId) {
      setWidgetData(prev => ({
        ...prev,
        [selectedWidgetId]: result
      }));
      setStatus('Query applied');
    }
  }, [activeDataSource, selectedWidgetId]);

  // Canvas click
  const handleCanvasClick = useCallback(() => {
    setSelectedWidgetId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedWidgetId) {
            handleDeleteSelected();
          }
          break;
        case 'Escape':
          setSelectedWidgetId(null);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWidgetId, handleDeleteSelected]);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <ChartColumn className="w-5 h-5 text-purple-500" />
            Visual Data Analysis
          </h1>
          <span className="text-sm text-gray-500">{currentDashboard?.name || 'Untitled'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQueryBuilder(!showQueryBuilder)}
            className={showQueryBuilder ? 'text-blue-500' : ''}
          >
            <Search className="w-4 h-4 mr-1" />
            Query
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1" />
          
          <Button variant="ghost" size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeleteSelected} disabled={!selectedWidgetId}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 dark:bg-gray-850 border-b dark:border-gray-700">
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
          className="px-3 py-1.5 text-sm rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
        >
          Dashboard Builder
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <WidgetPalette onAddWidget={handleAddWidget} />
          <DataUploadPanel
            onDataUpload={handleDataUpload}
            dataSources={dataSources}
            activeSource={activeDataSource}
            onSelectSource={setActiveDataSource}
          />
          {showQueryBuilder && activeDataSource && (
            <QueryBuilderPanel
              dataSource={activeDataSource}
              onQuery={handleQuery}
            />
          )}
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full"
            onClick={handleCanvasClick}
          >
            {/* Grid background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            
            {/* Widgets */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${viewport.offset.x}px, ${viewport.offset.y}px) scale(${viewport.zoom})`,
                transformOrigin: '0 0'
              }}
            >
              {widgets.map(widget => {
                switch (widget.type) {
                  case 'chart':
                    return (
                      <ChartWidget
                        key={widget.id}
                        widget={widget}
                        data={widgetData[widget.id]}
                        isSelected={selectedWidgetId === widget.id}
                        onClick={handleWidgetClick}
                        onResize={handleWidgetResize}
                      />
                    );
                  case 'metric':
                    return (
                      <MetricWidget
                        key={widget.id}
                        widget={widget}
                        data={widgetData[widget.id]}
                        isSelected={selectedWidgetId === widget.id}
                        onClick={handleWidgetClick}
                      />
                    );
                  case 'table':
                    return (
                      <TableWidget
                        key={widget.id}
                        widget={widget}
                        data={widgetData[widget.id]}
                        isSelected={selectedWidgetId === widget.id}
                        onClick={handleWidgetClick}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
          
          {/* Empty state */}
          {widgets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <ChartColumn className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No widgets yet</p>
                <p className="text-sm">Add charts and metrics from the sidebar</p>
              </div>
            </div>
          )}
          
          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow p-1">
            <button
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.25) }))}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{Math.round(viewport.zoom * 100)}%</span>
            <button
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(2, prev.zoom + 0.25) }))}
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
          
          {/* Status bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow text-sm text-gray-600 dark:text-gray-400">
            {status} | Widgets: {widgets.length}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 p-4 space-y-4 overflow-y-auto">
          {/* Properties panel */}
          {selectedWidgetId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Properties</h3>
              {(() => {
                const widget = widgets.find(w => w.id === selectedWidgetId);
                if (!widget) return null;
                
                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Title</label>
                      <input
                        type="text"
                        value={widget.title}
                        onChange={(e) => {
                          setWidgets(prev => prev.map(w => 
                            w.id === selectedWidgetId 
                              ? { ...w, title: e.target.value }
                              : w
                          ));
                        }}
                        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    {widget.type === 'chart' && (
                      <div>
                        <label className="text-xs text-gray-500">Chart Type</label>
                        <select
                          value={widget.chartType}
                          onChange={(e) => {
                            setWidgets(prev => prev.map(w => 
                              w.id === selectedWidgetId 
                                ? { ...w, chartType: e.target.value }
                                : w
                            ));
                            setWidgetData(prev => ({
                              ...prev,
                              [selectedWidgetId]: generateSampleData(e.target.value)
                            }));
                          }}
                          className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                          {Object.entries(CHART_TYPES).map(([type, config]) => (
                            <option key={type} value={type}>{config.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Width</label>
                        <input
                          type="number"
                          value={widget.width}
                          onChange={(e) => {
                            setWidgets(prev => prev.map(w => 
                              w.id === selectedWidgetId 
                                ? { ...w, width: Number(e.target.value) }
                                : w
                            ));
                          }}
                          className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Height</label>
                        <input
                          type="number"
                          value={widget.height}
                          onChange={(e) => {
                            setWidgets(prev => prev.map(w => 
                              w.id === selectedWidgetId 
                                ? { ...w, height: Number(e.target.value) }
                                : w
                            ));
                          }}
                          className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* Saved dashboards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Saved Dashboards</h3>
            {loadingDashboards ? (
              <Loader size="sm" />
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {dashboards?.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleLoad(d)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-md transition-colors",
                      currentDashboard?.id === d.id
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {d.name}
                  </button>
                ))}
                {(!dashboards || dashboards.length === 0) && (
                  <p className="text-sm text-gray-400">No saved dashboards</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
