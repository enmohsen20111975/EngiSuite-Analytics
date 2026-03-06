import { useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Database, Upload, ChartColumnIncreasing, Table2, LayoutDashboard,
  Play, Download, FileText, RefreshCw, Plus, X, ChevronDown,
  Server, HardDrive, Wifi, Clock, CircleCheck, CircleAlert
} from 'lucide-react';

// Sample data for charts
const sampleLineData = [
  { name: 'Jan', value: 65, value2: 45 },
  { name: 'Feb', value: 59, value2: 52 },
  { name: 'Mar', value: 80, value2: 61 },
  { name: 'Apr', value: 81, value2: 70 },
  { name: 'May', value: 56, value2: 65 },
  { name: 'Jun', value: 55, value2: 78 },
  { name: 'Jul', value: 72, value2: 85 },
  { name: 'Aug', value: 88, value2: 92 },
];

const sampleBarData = [
  { name: 'Electrical', value: 12345, lastYear: 10200 },
  { name: 'Mechanical', value: 9876, lastYear: 8500 },
  { name: 'Civil', value: 8567, lastYear: 7800 },
  { name: 'Chemical', value: 6543, lastYear: 5900 },
  { name: 'Structural', value: 5432, lastYear: 4800 },
];

const samplePieData = [
  { name: 'Electrical', value: 35, color: '#3b82f6' },
  { name: 'Mechanical', value: 25, color: '#10b981' },
  { name: 'Civil', value: 20, color: '#f59e0b' },
  { name: 'Chemical', value: 12, color: '#ef4444' },
  { name: 'Other', value: 8, color: '#8b5cf6' },
];

const sampleRadarData = [
  { category: 'Speed', value: 85 },
  { category: 'Accuracy', value: 92 },
  { category: 'Efficiency', value: 78 },
  { category: 'Quality', value: 88 },
  { category: 'Reliability', value: 95 },
  { category: 'Cost', value: 70 },
];

const samplePivotData = [
  { category: 'Electrical', y2023: 12345, y2024: 15678, total: 28023 },
  { category: 'Mechanical', y2023: 9876, y2024: 11234, total: 21110 },
  { category: 'Civil', y2023: 8567, y2024: 10456, total: 19023 },
  { category: 'Total', y2023: 30788, y2024: 37368, total: 68156 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const tabs = [
  { id: 'query-builder', label: 'Query Builder', icon: Database },
  { id: 'data-upload', label: 'Data Upload', icon: Upload },
  { id: 'data-analysis', label: 'Data Analysis', icon: ChartColumnIncreasing },
  { id: 'pivot-table', label: 'Pivot Table', icon: Table2 },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('query-builder');
  const [loading, setLoading] = useState(false);
  
  // Query Builder State
  const [dbConfig, setDbConfig] = useState({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    name: 'engineering_db',
    user: 'root',
    password: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [queryStats, setQueryStats] = useState({ count: 0, time: 0 });
  const [dbTables, setDbTables] = useState([]);
  
  // Data Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Data Analysis State
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [chartType, setChartType] = useState('line');
  const [chartData, setChartData] = useState(sampleLineData);
  
  // Pivot Table State
  const [pivotRows, setPivotRows] = useState(['category']);
  const [pivotColumns, setPivotColumns] = useState(['year']);
  const [pivotValue, setPivotValue] = useState('count');
  
  // Dashboard State
  const [dateRange, setDateRange] = useState('30d');

  // Database connection handler
  const handleConnect = async () => {
    setLoading(true);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnected(true);
    setDbTables([
      { name: 'equations', rows: 1250 },
      { name: 'calculations', rows: 5432 },
      { name: 'users', rows: 89 },
      { name: 'projects', rows: 156 },
      { name: 'reports', rows: 423 },
    ]);
    setLoading(false);
  };

  // Query execution handler
  const handleExecuteQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate results
    setQueryResults([
      { id: 1, name: 'Sample Data 1', value: 123.45, date: '2024-01-15' },
      { id: 2, name: 'Sample Data 2', value: 678.90, date: '2024-01-16' },
      { id: 3, name: 'Sample Data 3', value: 234.56, date: '2024-01-17' },
      { id: 4, name: 'Sample Data 4', value: 567.89, date: '2024-01-18' },
    ]);
    setQueryStats({ count: Math.floor(Math.random() * 1000) + 1, time: (Math.random() * 2).toFixed(2) });
    setLoading(false);
  };

  // File upload handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, status: 'pending' }))]);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, status: 'pending' }))]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
    setLoading(false);
  };

  // Chart generation
  const generateChart = () => {
    setLoading(true);
    setTimeout(() => {
      setChartData([...sampleLineData]);
      setLoading(false);
    }, 1000);
  };

  // Render chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="value2" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sampleBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="This Year" />
              <Bar dataKey="lastYear" fill="#94a3b8" name="Last Year" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={samplePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {samplePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="value2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sampleRadarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#6b7280" />
              <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Comprehensive data analysis and visualization tools
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Query Builder Tab */}
        {activeTab === 'query-builder' && (
          <div className="space-y-6">
            {/* Database Connection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                Database Connection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Database Type
                  </label>
                  <select
                    value={dbConfig.type}
                    onChange={(e) => setDbConfig({ ...dbConfig, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                    placeholder="3306"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Database
                  </label>
                  <input
                    type="text"
                    value={dbConfig.name}
                    onChange={(e) => setDbConfig({ ...dbConfig, name: e.target.value })}
                    placeholder="engineering_db"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={dbConfig.user}
                    onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                    placeholder="root"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Button onClick={handleConnect} disabled={loading}>
                  {loading ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
                </Button>
                {isConnected && (
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CircleCheck className="w-4 h-4" />
                    Connected to {dbConfig.name}
                  </span>
                )}
              </div>
            </Card>

            {/* Query Section */}
            {isConnected && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Database Tables */}
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Database Tables
                    </h4>
                    <ul className="space-y-2">
                      {dbTables.map((table) => (
                        <li
                          key={table.name}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          onClick={() => setQuery(`SELECT * FROM ${table.name} LIMIT 100;`)}
                        >
                          <span className="text-gray-700 dark:text-gray-300">{table.name}</span>
                          <span className="text-xs text-gray-500">{table.rows} rows</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Query Editor */}
                  <div className="lg:col-span-3 space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Query Editor</h4>
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter SQL query here..."
                        className="w-full h-40 px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="mt-3 flex gap-2">
                        <Button onClick={handleExecuteQuery} disabled={loading || !query.trim()}>
                          <Play className="w-4 h-4 mr-2" />
                          {loading ? 'Executing...' : 'Execute'}
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Results
                        </Button>
                      </div>
                    </Card>

                    {/* Query Results */}
                    {queryResults.length > 0 && (
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">Query Results</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{queryStats.count} results</span>
                            <span>{queryStats.time} seconds</span>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                {Object.keys(queryResults[0]).map((key) => (
                                  <th
                                    key={key}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                  >
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {queryResults.map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row).map((value, i) => (
                                    <td
                                      key={i}
                                      className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                                    >
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Data Upload Tab */}
        {activeTab === 'data-upload' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Upload CSV, Excel, or JSON files for analysis
            </p>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Drag and drop files here
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                or click to browse
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                Supports CSV, XLSX, XLS, JSON
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Selected Files</h4>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'processed' && (
                        <CircleCheck className="w-5 h-5 text-green-500" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={processFiles}
                  disabled={loading || uploadedFiles.length === 0}
                  className="mt-4"
                >
                  {loading ? 'Processing...' : 'Process Files'}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Data Analysis Tab */}
        {activeTab === 'data-analysis' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Analysis</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Analyze your data with powerful visualization tools
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Dataset
                  </label>
                  <select
                    value={selectedDataset}
                    onChange={(e) => setSelectedDataset(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Dataset --</option>
                    <option value="calculations">Calculations Data</option>
                    <option value="projects">Project Data</option>
                    <option value="users">User Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Column
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Column --</option>
                    <option value="value">Value</option>
                    <option value="count">Count</option>
                    <option value="average">Average</option>
                    <option value="min">Minimum</option>
                    <option value="max">Maximum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="radar">Radar Chart</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={generateChart} disabled={loading || !selectedDataset}>
                    {loading ? 'Generating...' : 'Generate Chart'}
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Chart Display */}
            <Card className="p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg">
                {renderChart()}
              </div>
            </Card>
          </div>
        )}

        {/* Pivot Table Tab */}
        {activeTab === 'pivot-table' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pivot Table</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create dynamic pivot tables for data summarization
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rows
                  </label>
                  <select
                    multiple
                    value={pivotRows}
                    onChange={(e) => setPivotRows(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-24"
                  >
                    <option value="category">Category</option>
                    <option value="region">Region</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Columns
                  </label>
                  <select
                    multiple
                    value={pivotColumns}
                    onChange={(e) => setPivotColumns(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-24"
                  >
                    <option value="year">Year</option>
                    <option value="quarter">Quarter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value
                  </label>
                  <select
                    value={pivotValue}
                    onChange={(e) => setPivotValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="count">Count</option>
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Pivot Table Display */}
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">2023</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">2024</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {samplePivotData.map((row, index) => (
                      <tr key={index} className={row.category === 'Total' ? 'bg-gray-50 dark:bg-gray-800 font-bold' : ''}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {row.y2023.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {row.y2024.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {row.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400">Real-time analytics overview</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ChartColumnIncreasing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Calculations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12,456</p>
                    <p className="text-xs text-green-500">+12.5% from last period</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CircleCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
                    <p className="text-xs text-green-500">+2.3% from last period</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">245ms</p>
                    <p className="text-xs text-green-500">-15ms from last period</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Wifi className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                    <p className="text-xs text-green-500">+8.1% from last period</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Calculations Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sampleLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Calculations by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sampleBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Pie Chart */}
            <Card className="p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Distribution by Engineering Domain</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={samplePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {samplePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
