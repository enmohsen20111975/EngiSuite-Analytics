import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Table2, Play, Save, Download, Trash2, Plus,
  ChevronDown, ChevronRight, X, Check, ListFilter, ArrowUpAZ, ArrowDownAZ,
  ChartColumn, ChartPie, ChartLine, TrendingUp, Layers,
  Move, ZoomIn, ZoomOut, RotateCcw, Settings, Copy,
  FileCode, FileSpreadsheet, Eye, EyeOff, CircleAlert, CircleCheck,
  GripVertical, ArrowRight, ArrowLeft, Minus, Equal,
  Group, Hash, TrendingDown, Search
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { useVDAData } from '../contexts/VDADataContext';

// SQL Operators
const SQL_OPERATORS = {
  '=': { label: '=', icon: Equal },
  '!=': { label: '!=', icon: X },
  '>': { label: '>', icon: ArrowRight },
  '<': { label: '<', icon: ArrowLeft },
  '>=': { label: '>=', icon: ArrowRight },
  '<=': { label: '<=', icon: ArrowLeft },
  'LIKE': { label: 'LIKE', icon: Search },
  'IN': { label: 'IN', icon: Database },
  'BETWEEN': { label: 'BETWEEN', icon: Move },
  'IS NULL': { label: 'IS NULL', icon: Minus },
  'IS NOT NULL': { label: 'IS NOT NULL', icon: Check }
};

// Aggregate Functions
const AGGREGATE_FUNCTIONS = {
  'SUM': { label: 'SUM', icon: Hash, color: 'text-blue-500' },
  'AVG': { label: 'AVG', icon: ChartColumn, color: 'text-green-500' },
  'COUNT': { label: 'COUNT', icon: Hash, color: 'text-purple-500' },
  'MAX': { label: 'MAX', icon: TrendingUp, color: 'text-orange-500' },
  'MIN': { label: 'MIN', icon: TrendingDown, color: 'text-red-500' }
};

// Join Types
const JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'];

const VisualQueryBuilderPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  // Get data from VDA context
  const { dataSources, activeDataSource, getTablesForQueryBuilder } = useVDAData();
  
  // State management
  const [tables, setTables] = useState([]);
  const [canvasTables, setCanvasTables] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [orderBy, setOrderBy] = useState([]);
  const [aggregates, setAggregates] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('results'); // results, sql, chart, stats
  const [chartType, setChartType] = useState('bar');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const [showFunctionLibrary, setShowFunctionLibrary] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({
    string: true,
    numeric: true,
    date: true,
    aggregate: true
  });

  // Load data from VDA context
  useEffect(() => {
    const contextTables = getTablesForQueryBuilder();
    if (contextTables && contextTables.length > 0) {
      setTables(contextTables);
      setCanvasTables(contextTables.map((t, idx) => ({
        ...t,
        position: { x: 50 + idx * 300, y: 50 }
      })));
    }
  }, [dataSources, activeDataSource]);

  // Infer field type from value
  const inferType = (value) => {
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'text';
  };

  // Generate SQL Query
  useEffect(() => {
    generateSQL();
  }, [selectedFields, filters, groupBy, orderBy, aggregates, canvasTables, connections]);

  const generateSQL = () => {
    if (selectedFields.length === 0 && aggregates.length === 0) {
      setSqlQuery('-- Select fields to build query');
      return;
    }

    let query = 'SELECT\n  ';
    
    // Select clause
    const selectParts = [];
    
    selectedFields.forEach(field => {
      selectParts.push(`${field.table}.${field.name}`);
    });
    
    aggregates.forEach(agg => {
      selectParts.push(`${agg.function}(${agg.table}.${agg.field}) AS ${agg.alias}`);
    });
    
    query += selectParts.join(',\n  ');
    
    // From clause
    if (canvasTables.length > 0) {
      query += `\nFROM ${canvasTables[0].name}`;
      
      // Joins
      connections.forEach(conn => {
        const joinTable = canvasTables.find(t => t.id === conn.to.tableId);
        if (joinTable) {
          query += `\n  INNER JOIN ${joinTable.name} ON ${conn.from.tableId}.${conn.from.field} = ${conn.to.tableId}.${conn.to.field}`;
        }
      });
    }
    
    // Where clause
    if (filters.length > 0) {
      query += '\nWHERE ';
      const whereParts = filters.map(f => {
        const value = f.type === 'number' ? f.value : `'${f.value}'`;
        return `${f.table}.${f.field} ${f.operator} ${value}`;
      });
      query += whereParts.join('\n  AND ');
    }
    
    // Group By clause
    if (groupBy.length > 0) {
      query += '\nGROUP BY ';
      query += groupBy.map(g => `${g.table}.${g.field}`).join(', ');
    }
    
    // Order By clause
    if (orderBy.length > 0) {
      query += '\nORDER BY ';
      query += orderBy.map(o => `${o.table}.${o.field} ${o.direction}`).join(', ');
    }
    
    setSqlQuery(query);
  };

  // Execute Query (simulated)
  const executeQuery = () => {
    setIsExecuting(true);
    
    setTimeout(() => {
      // Simulate query execution on available data
      const firstTable = canvasTables[0];
      if (firstTable && firstTable.data) {
        let results = [...firstTable.data];
        
        // Apply filters
        filters.forEach(filter => {
          results = results.filter(row => {
            const colIndex = firstTable.fields.findIndex(f => f.name === filter.field);
            const value = row[colIndex];
            switch (filter.operator) {
              case '=': return value == filter.value;
              case '!=': return value != filter.value;
              case '>': return value > filter.value;
              case '<': return value < filter.value;
              case '>=': return value >= filter.value;
              case '<=': return value <= filter.value;
              case 'LIKE': return String(value).toLowerCase().includes(filter.value.toLowerCase());
              default: return true;
            }
          });
        });
        
        // Apply grouping and aggregates
        if (groupBy.length > 0 && aggregates.length > 0) {
          const groupMap = new Map();
          const groupField = groupBy[0].field;
          const groupColIndex = firstTable.fields.findIndex(f => f.name === groupField);
          
          results.forEach(row => {
            const key = row[groupColIndex];
            if (!groupMap.has(key)) {
              groupMap.set(key, []);
            }
            groupMap.get(key).push(row);
          });
          
          results = Array.from(groupMap.entries()).map(([key, rows]) => {
            const result = { [groupField]: key };
            aggregates.forEach(agg => {
              const colIndex = firstTable.fields.findIndex(f => f.name === agg.field);
              const values = rows.map(r => r[colIndex]).filter(v => typeof v === 'number');
              switch (agg.function) {
                case 'SUM': result[agg.alias] = values.reduce((a, b) => a + b, 0); break;
                case 'AVG': result[agg.alias] = values.reduce((a, b) => a + b, 0) / values.length; break;
                case 'COUNT': result[agg.alias] = rows.length; break;
                case 'MAX': result[agg.alias] = Math.max(...values); break;
                case 'MIN': result[agg.alias] = Math.min(...values); break;
              }
            });
            return result;
          });
        }
        
        // Apply ordering
        if (orderBy.length > 0) {
          const orderField = orderBy[0].field;
          const orderColIndex = firstTable.fields.findIndex(f => f.name === orderField);
          results.sort((a, b) => {
            const aVal = a[orderField] ?? a[orderColIndex];
            const bVal = b[orderField] ?? b[orderColIndex];
            if (orderBy[0].direction === 'ASC') {
              return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
          });
        }
        
        // Convert to array format for display
        if (results.length > 0 && !Array.isArray(results[0])) {
          // Object format (from grouping)
          const headers = Object.keys(results[0]);
          setQueryResults({
            headers,
            rows: results.map(r => headers.map(h => r[h]))
          });
        } else {
          setQueryResults({
            headers: selectedFields.map(f => f.name) || firstTable.fields.map(f => f.name),
            rows: results.slice(0, 100).map(row => 
              selectedFields.map(f => row[firstTable.fields.findIndex(field => field.name === f.name)])
            )
          });
        }
        
        setActiveTab('results');
      }
      setIsExecuting(false);
    }, 500);
  };

  // Add table to canvas
  const addTableToCanvas = (table) => {
    if (!canvasTables.find(t => t.id === table.id)) {
      setCanvasTables(prev => [...prev, {
        ...table,
        position: { x: 100 + prev.length * 50, y: 100 + prev.length * 30 }
      }]);
    }
  };

  // Toggle field selection
  const toggleFieldSelection = (tableId, fieldName) => {
    const table = canvasTables.find(t => t.id === tableId);
    if (!table) return;
    
    const field = table.fields.find(f => f.name === fieldName);
    if (!field) return;
    
    const isSelected = selectedFields.some(f => f.table === tableId && f.field === fieldName);
    
    if (isSelected) {
      setSelectedFields(prev => prev.filter(f => !(f.table === tableId && f.field === fieldName)));
    } else {
      setSelectedFields(prev => [...prev, { table: tableId, field: fieldName, name: fieldName }]);
    }
  };

  // Add filter
  const addFilter = (tableId, fieldName, fieldType) => {
    setFilters(prev => [...prev, {
      id: Date.now(),
      table: tableId,
      field: fieldName,
      type: fieldType,
      operator: '=',
      value: ''
    }]);
  };

  // Update filter
  const updateFilter = (id, key, value) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  // Remove filter
  const removeFilter = (id) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  // Add aggregate
  const addAggregate = (tableId, fieldName, func) => {
    setAggregates(prev => [...prev, {
      id: Date.now(),
      table: tableId,
      field: fieldName,
      function: func,
      alias: `${func.toLowerCase()}_${fieldName}`
    }]);
  };

  // Add group by
  const addGroupBy = (tableId, fieldName) => {
    if (!groupBy.some(g => g.table === tableId && g.field === fieldName)) {
      setGroupBy(prev => [...prev, { table: tableId, field: fieldName }]);
    }
  };

  // Add order by
  const addOrderBy = (tableId, fieldName) => {
    if (!orderBy.some(o => o.table === tableId && o.field === fieldName)) {
      setOrderBy(prev => [...prev, { table: tableId, field: fieldName, direction: 'ASC' }]);
    }
  };

  // Start connection
  const startConnection = (tableId, fieldName) => {
    setConnecting({ tableId, fieldName });
  };

  // Complete connection
  const completeConnection = (tableId, fieldName) => {
    if (connecting && connecting.tableId !== tableId) {
      setConnections(prev => [...prev, {
        id: Date.now(),
        from: { tableId: connecting.tableId, field: connecting.fieldName },
        to: { tableId, field: fieldName }
      }]);
    }
    setConnecting(null);
  };

  // Handle table drag
  const handleTableDragStart = (e, tableId) => {
    setIsDragging(true);
    setDragTarget(tableId);
  };

  const handleTableDrag = (e) => {
    if (!isDragging || !dragTarget) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;
    
    setCanvasTables(prev => prev.map(t => 
      t.id === dragTarget ? { ...t, position: { x, y } } : t
    ));
  };

  const handleTableDragEnd = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  // Render chart
  useEffect(() => {
    if (activeTab === 'chart' && queryResults.headers && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      const labels = queryResults.rows.map(r => r[0]);
      const data = queryResults.rows.map(r => r[1] || 0);
      
      chartInstanceRef.current = new Chart(ctx, {
        type: chartType,
        data: {
          labels,
          datasets: [{
            label: queryResults.headers[1] || 'Value',
            data,
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(118, 75, 162, 0.8)',
              'rgba(76, 175, 80, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(244, 67, 54, 0.8)',
              'rgba(33, 150, 243, 0.8)'
            ],
            borderColor: [
              'rgb(102, 126, 234)',
              'rgb(118, 75, 162)',
              'rgb(76, 175, 80)',
              'rgb(255, 152, 0)',
              'rgb(244, 67, 54)',
              'rgb(33, 150, 243)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: chartType === 'pie' || chartType === 'doughnut' }
          }
        }
      });
    }
  }, [activeTab, queryResults, chartType]);

  // Calculate statistics
  const calculateStats = () => {
    if (!queryResults.rows || queryResults.rows.length === 0) return null;
    
    const numericCol = 1; // Assume second column is numeric
    const values = queryResults.rows.map(r => r[numericCol]).filter(v => typeof v === 'number');
    
    if (values.length === 0) return null;
    
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const stats = calculateStats();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-3 shadow-lg z-50">
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
                <Database className="w-6 h-6" />
                Visual Query Builder
              </h1>
              <p className="text-xs text-indigo-200">Build SQL queries visually</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/30 mx-2" />
            <button
              onClick={executeQuery}
              disabled={isExecuting || selectedFields.length === 0}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 font-medium transition"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/visual-report-builder')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Report Builder
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
          className="px-3 py-1.5 text-sm rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
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
          className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          Dashboard Builder
        </a>
      </div>

      {/* Main LayoutTemplate */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tables & Functions */}
        <div className={`${leftPanelCollapsed ? 'w-0' : 'w-72'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white">Tables</h2>
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Tables List */}
          <div className="flex-1 overflow-y-auto p-2">
            {tables.map(table => (
              <div
                key={table.id}
                className="mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-grab hover:border-indigo-400 transition"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('tableId', table.id);
                  addTableToCanvas(table);
                }}
              >
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-t-lg flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-indigo-800 dark:text-indigo-200 text-sm">{table.name}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{table.rowCount} rows</span>
                </div>
                <div className="p-1">
                  {table.fields.slice(0, 5).map(field => (
                    <div
                      key={field.name}
                      className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        field.type === 'number' ? 'bg-blue-500' :
                        field.type === 'text' ? 'bg-green-500' :
                        field.type === 'date' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-gray-700 dark:text-gray-300 flex-1 truncate">{field.name}</span>
                      <span className="text-xs text-gray-400">{field.type}</span>
                    </div>
                  ))}
                  {table.fields.length > 5 && (
                    <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                      +{table.fields.length - 5} more fields
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Function Library */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowFunctionLibrary(!showFunctionLibrary)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <span className="font-semibold text-gray-800 dark:text-white">Function Library</span>
              {showFunctionLibrary ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {showFunctionLibrary && (
              <div className="p-2 max-h-48 overflow-y-auto">
                {/* Aggregate Functions */}
                <div className="mb-2">
                  <button
                    onClick={() => setExpandedCategories(prev => ({ ...prev, aggregate: !prev.aggregate }))}
                    className="w-full flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase p-1"
                  >
                    {expandedCategories.aggregate ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    Aggregate
                  </button>
                  {expandedCategories.aggregate && (
                    <div className="space-y-1">
                      {Object.entries(AGGREGATE_FUNCTIONS).map(([key, func]) => {
                        const Icon = func.icon;
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('function', key)}
                          >
                            <Icon className={`w-4 h-4 ${func.color}`} />
                            <span className="font-mono text-gray-700 dark:text-gray-300">{func.label}()</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-gray-50 dark:bg-gray-900"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
          onMouseMove={handleTableDrag}
          onMouseUp={handleTableDragEnd}
          onMouseLeave={handleTableDragEnd}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map(conn => {
              const fromTable = canvasTables.find(t => t.id === conn.from.tableId);
              const toTable = canvasTables.find(t => t.id === conn.to.tableId);
              if (!fromTable || !toTable) return null;
              
              const fromFieldIdx = fromTable.fields.findIndex(f => f.name === conn.from.field);
              const toFieldIdx = toTable.fields.findIndex(f => f.name === conn.to.field);
              
              const x1 = (fromTable.position.x + 250) * zoom + pan.x;
              const y1 = (fromTable.position.y + 40 + fromFieldIdx * 28) * zoom + pan.y;
              const x2 = toTable.position.x * zoom + pan.x;
              const y2 = (toTable.position.y + 40 + toFieldIdx * 28) * zoom + pan.y;
              
              const midX = (x1 + x2) / 2;
              
              return (
                <path
                  key={conn.id}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#667eea"
                  strokeWidth={2}
                  className="pointer-events-auto cursor-pointer hover:stroke-red-500"
                  onClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))}
                />
              );
            })}
            
            {/* Drawing connection line */}
            {connecting && (
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={0}
                stroke="#667eea"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Canvas Tables */}
          {canvasTables.map(table => (
            <div
              key={table.id}
              className={`absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-shadow ${
                selectedTable === table.id ? 'border-indigo-500 shadow-xl' : 'border-gray-200 dark:border-gray-600'
              }`}
              style={{
                left: table.position.x * zoom + pan.x,
                top: table.position.y * zoom + pan.y,
                minWidth: 250 * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                zIndex: selectedTable === table.id ? 10 : 1
              }}
              onClick={() => setSelectedTable(table.id)}
            >
              {/* Table Header */}
              <div
                className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg flex items-center gap-2 cursor-move"
                onMouseDown={(e) => handleTableDragStart(e, table.id)}
              >
                <Table2 className="w-4 h-4" />
                <span className="font-semibold flex-1">{table.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCanvasTables(prev => prev.filter(t => t.id !== table.id));
                  }}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              {/* Table Fields */}
              <div className="max-h-80 overflow-y-auto">
                {table.fields.map((field, idx) => {
                  const isSelected = selectedFields.some(f => f.table === table.id && f.field === field.name);
                  const isConnecting = connecting?.tableId === table.id && connecting?.fieldName === field.name;
                  
                  return (
                    <div
                      key={field.name}
                      className={`flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      } ${isConnecting ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFieldSelection(table.id, field.name);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (connecting) {
                          completeConnection(table.id, field.name);
                        } else {
                          startConnection(table.id, field.name);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className={`w-2 h-2 rounded-full ${
                        field.type === 'number' ? 'bg-blue-500' :
                        field.type === 'text' ? 'bg-green-500' :
                        field.type === 'date' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-mono">{field.name}</span>
                      <span className="text-xs text-gray-400">{field.type}</span>
                      
                      {/* Connection point */}
                      <div
                        className="w-3 h-3 bg-indigo-500 rounded-full cursor-crosshair hover:scale-125 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (connecting) {
                            completeConnection(table.id, field.name);
                          } else {
                            startConnection(table.id, field.name);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {canvasTables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Tables on Canvas</h3>
                <p>Drag tables from the left panel to start building your query</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Query Options */}
        <div className={`${rightPanelCollapsed ? 'w-0' : 'w-80'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white">Query Options</h2>
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {rightPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Filters Panel */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4" />
                  Filters
                </span>
                <button
                  onClick={() => selectedTable && addFilter(selectedTable, '', 'text')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 space-y-2">
                {filters.map(filter => (
                  <div key={filter.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-2">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                        className="flex-1 text-xs p-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                      >
                        <option value="">Field</option>
                        {canvasTables.flatMap(t => t.fields.map(f => (
                          <option key={`${t.id}-${f.name}`} value={f.name}>{t.name}.{f.name}</option>
                        )))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                        className="w-20 text-xs p-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                      >
                        {Object.keys(SQL_OPERATORS).map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type={filter.type === 'number' ? 'number' : 'text'}
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 text-xs p-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                      />
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filters.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                    No filters added
                  </p>
                )}
              </div>
            </div>

            {/* Group By Panel */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Group className="w-4 h-4" />
                Group By
              </div>
              <div className="p-2">
                {groupBy.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded mb-1">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{g.table}.{g.field}</span>
                    <button
                      onClick={() => setGroupBy(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggregates Panel */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Aggregates
              </div>
              <div className="p-2">
                {aggregates.map(agg => (
                  <div key={agg.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                      {agg.function}({agg.field})
                    </span>
                    <input
                      type="text"
                      value={agg.alias}
                      onChange={(e) => setAggregates(prev => prev.map(a => 
                        a.id === agg.id ? { ...a, alias: e.target.value } : a
                      ))}
                      className="w-20 text-xs p-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                    />
                    <button
                      onClick={() => setAggregates(prev => prev.filter(a => a.id !== agg.id))}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order By Panel */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ArrowUpAZ className="w-4 h-4" />
                Order By
              </div>
              <div className="p-2">
                {orderBy.map((o, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded mb-1">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{o.table}.{o.field}</span>
                    <button
                      onClick={() => setOrderBy(prev => prev.map((item, i) => 
                        i === idx ? { ...item, direction: item.direction === 'ASC' ? 'DESC' : 'ASC' } : item
                      ))}
                      className={`p-1 rounded ${o.direction === 'ASC' ? 'text-green-500' : 'text-orange-500'}`}
                    >
                      {o.direction === 'ASC' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setOrderBy(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Results */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700" style={{ height: bottomPanelHeight }}>
        {/* Panel Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {[
              { id: 'results', label: 'Results', icon: Table2 },
              { id: 'sql', label: 'SQL', icon: FileCode },
              { id: 'chart', label: 'Chart', icon: ChartColumn },
              { id: 'stats', label: 'Statistics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {/* Chart Type Selector */}
          {activeTab === 'chart' && (
            <div className="flex items-center gap-1 px-2">
              {['bar', 'line', 'pie', 'doughnut'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-2 rounded ${chartType === type ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {type === 'bar' && <ChartColumn className="w-4 h-4" />}
                  {type === 'line' && <ChartLine className="w-4 h-4" />}
                  {type === 'pie' && <ChartPie className="w-4 h-4" />}
                  {type === 'doughnut' && <ChartPie className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
          {/* Resize Handle */}
          <div
            className="h-full w-2 cursor-ns-resize hover:bg-indigo-200 dark:hover:bg-indigo-800"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startHeight = bottomPanelHeight;
              const handleMove = (e) => {
                const newHeight = startHeight - (e.clientY - startY);
                setBottomPanelHeight(Math.max(100, Math.min(500, newHeight)));
              };
              const handleUp = () => {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
              };
              document.addEventListener('mousemove', handleMove);
              document.addEventListener('mouseup', handleUp);
            }}
          />
        </div>

        {/* Tab Content */}
        <div className="overflow-auto" style={{ height: bottomPanelHeight - 41 }}>
          {activeTab === 'results' && (
            <div className="p-4">
              {queryResults.headers && queryResults.headers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {queryResults.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {queryResults.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                            {cell?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Table2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Execute a query to see results</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="p-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto">
                {sqlQuery}
              </pre>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(sqlQuery)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy SQL
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([sqlQuery], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'query.sql';
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="p-4 h-full">
              {queryResults.headers && queryResults.headers.length > 0 ? (
                <div className="h-full">
                  <canvas ref={chartRef} style={{ maxHeight: bottomPanelHeight - 100 }} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ChartColumn className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Execute a query with grouping to see charts</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="p-4">
              {stats ? (
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">Count</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.count}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-xs text-green-600 dark:text-green-400 uppercase font-semibold">Sum</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.sum.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-xs text-purple-600 dark:text-purple-400 uppercase font-semibold">Average</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.avg.toFixed(2)}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold">Min</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.min.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-xs text-red-600 dark:text-red-400 uppercase font-semibold">Max</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.max.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Execute a query with numeric data to see statistics</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualQueryBuilderPage;
