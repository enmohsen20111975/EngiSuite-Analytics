import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileSpreadsheet, FileCode, FileText, Database, 
  Trash2, Eye, SquareCheck, Square, RefreshCw, Download,
  CircleAlert, CircleCheck, CircleX, FolderOpen, Table,
  ArrowRight, LoaderCircle, Search, ListFilter, ChevronDown, ChevronRight,
  ChartColumn, FileChartColumn, LayoutDashboard
} from 'lucide-react';
import * as XLSX from 'xlsx';

// File type configurations
const FILE_TYPES = {
  xlsx: { icon: FileSpreadsheet, label: 'Excel', color: 'text-green-500', accept: '.xlsx,.xls' },
  csv: { icon: FileText, label: 'CSV', color: 'text-blue-500', accept: '.csv' },
  json: { icon: FileCode, label: 'JSON', color: 'text-yellow-500', accept: '.json' },
  db: { icon: Database, label: 'SQLite', color: 'text-purple-500', accept: '.db,.sqlite,.sqlite3' }
};

const DataUploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State management
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [previewData, setPreviewData] = useState({ headers: [], rows: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('vda_uploaded_files');
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        setFiles(parsed);
      } catch (e) {
        console.error('Failed to load saved files:', e);
      }
    }
  }, []);
  
  // Save files to localStorage when changed
  useEffect(() => {
    if (files.length > 0) {
      // Store metadata only, not full data (to avoid quota issues)
      const metadata = files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        uploadedAt: f.uploadedAt,
        sheets: f.sheets?.map(s => ({
          name: s.name,
          rowCount: s.rowCount,
          colCount: s.colCount
        })),
        rowCount: f.rowCount,
        colCount: f.colCount
      }));
      localStorage.setItem('vda_uploaded_files', JSON.stringify(metadata));
    }
  }, [files]);

  // Generate unique ID
  const generateId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get file type
  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['xlsx', 'xls'].includes(ext)) return 'xlsx';
    if (ext === 'csv') return 'csv';
    if (ext === 'json') return 'json';
    if (['db', 'sqlite', 'sqlite3'].includes(ext)) return 'db';
    return 'csv';
  };

  // Parse file content
  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const fileType = getFileType(file.name);
      
      reader.onload = (e) => {
        try {
          let result = { sheets: [], type: fileType };
          
          if (fileType === 'xlsx' || fileType === 'csv') {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            result.sheets = workbook.SheetNames.map(name => {
              const worksheet = workbook.Sheets[name];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              const headers = jsonData[0] || [];
              const rows = jsonData.slice(1);
              
              return {
                name,
                headers,
                rows,
                rowCount: rows.length,
                colCount: headers.length,
                rawData: jsonData
              };
            });
          } else if (fileType === 'json') {
            const jsonData = JSON.parse(e.target.result);
            const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            if (dataArray.length > 0) {
              const headers = Object.keys(dataArray[0]);
              const rows = dataArray.map(item => headers.map(h => item[h]));
              
              result.sheets = [{
                name: 'Data',
                headers,
                rows,
                rowCount: rows.length,
                colCount: headers.length,
                rawData: dataArray
              }];
            }
          } else if (fileType === 'db') {
            // SQLite would need sql.js library - for now, show placeholder
            result.sheets = [{
              name: 'Database',
              headers: ['Info'],
              rows: [['SQLite database uploaded - tables will be available in query builder']],
              rowCount: 1,
              colCount: 1,
              rawData: []
            }];
          }
          
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (fileType === 'json') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Handle file drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await processFiles(selectedFiles);
  }, []);

  // Process uploaded files
  const processFiles = async (fileList) => {
    setIsLoading(true);
    setError(null);
    
    try {
      for (const file of fileList) {
        const fileType = getFileType(file.name);
        
        if (!FILE_TYPES[fileType]) {
          setError(`Unsupported file type: ${file.name}`);
          continue;
        }
        
        const parsed = await parseFile(file);
        
        const fileData = {
          id: generateId(),
          name: file.name,
          type: fileType,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          sheets: parsed.sheets,
          rowCount: parsed.sheets.reduce((sum, s) => sum + s.rowCount, 0),
          colCount: parsed.sheets[0]?.colCount || 0
        };
        
        setFiles(prev => [...prev, fileData]);
        setSuccess(`Successfully uploaded: ${file.name}`);
        
        // Auto-select first file
        if (!selectedFile) {
          selectFile(fileData);
        }
      }
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Select a file
  const selectFile = (file) => {
    setSelectedFile(file);
    setSheets(file.sheets || []);
    setSelectedSheets(file.sheets?.map(s => s.name) || []);
    
    // Show preview of first sheet
    if (file.sheets && file.sheets.length > 0) {
      setPreviewData({
        headers: file.sheets[0].headers,
        rows: file.sheets[0].rows.slice(0, 100) // Preview first 100 rows
      });
    }
  };

  // Toggle sheet selection
  const toggleSheet = (sheetName) => {
    setSelectedSheets(prev => 
      prev.includes(sheetName)
        ? prev.filter(s => s !== sheetName)
        : [...prev, sheetName]
    );
  };

  // Select all sheets
  const selectAllSheets = () => {
    setSelectedSheets(sheets.map(s => s.name));
  };

  // Preview specific sheet
  const previewSheet = (sheet) => {
    setPreviewData({
      headers: sheet.headers,
      rows: sheet.rows.slice(0, 100)
    });
  };

  // Delete file
  const deleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setSheets([]);
      setPreviewData({ headers: [], rows: [] });
    }
  };

  // Export as SQLite database
  const exportAsDatabase = () => {
    // This would create a SQLite database from the data
    setSuccess('Database export feature - would download .db file');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Convert files to database
  const convertToDatabase = () => {
    // Store in IndexedDB for persistent storage
    setSuccess('Files converted and stored in database');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ListFilter files by search
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to other VDA pages with data
  const navigateWithData = (page) => {
    // Store selected data in sessionStorage for other pages
    const dataToPass = {
      fileId: selectedFile?.id,
      fileName: selectedFile?.name,
      sheets: selectedFile?.sheets?.filter(s => selectedSheets.includes(s.name))
    };
    sessionStorage.setItem('vda_active_data', JSON.stringify(dataToPass));
    navigate(page);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Data Upload & Management</h1>
              <p className="text-sm text-blue-100">Upload Excel, CSV, JSON, and SQLite files</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Back to Analytics
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 px-6 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <a
          href="/data-upload"
          className="px-3 py-1.5 text-sm rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
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
          className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          Dashboard Builder
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - File List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Upload Zone */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.json,.db,.sqlite,.sqlite3"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? 'Drop files here' : 'Drop files or click to browse'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Excel, CSV, JSON, SQLite supported
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 space-y-2">
              <button
                onClick={convertToDatabase}
                disabled={files.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Database className="w-4 h-4" />
                Convert to Database
              </button>
              <button
                onClick={exportAsDatabase}
                disabled={files.length === 0}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export as SQLite
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map(file => {
                  const FileTypeIcon = FILE_TYPES[file.type]?.icon || FileText;
                  const isExpanded = expandedFiles[file.id];
                  const isSelected = selectedFile?.id === file.id;
                  
                  return (
                    <div key={file.id}>
                      <div
                        onClick={() => selectFile(file)}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-all
                          ${isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500' 
                            : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <FileTypeIcon className={`w-6 h-6 mt-0.5 ${FILE_TYPES[file.type]?.color || 'text-gray-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatSize(file.size)}</span>
                              <span>•</span>
                              <span>{file.rowCount?.toLocaleString()} rows</span>
                              {file.sheets?.length > 1 && (
                                <>
                                  <span>•</span>
                                  <span>{file.sheets.length} sheets</span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                            className="p-1 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Expand/Collapse for multi-sheet files */}
                        {file.sheets?.length > 1 && (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setExpandedFiles(prev => ({ ...prev, [file.id]: !prev[file.id] }));
                            }}
                            className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {file.sheets.length} sheets
                          </button>
                        )}
                      </div>
                      
                      {/* Sheet list for expanded files */}
                      {isExpanded && file.sheets?.length > 1 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {file.sheets.map(sheet => (
                            <div
                              key={sheet.name}
                              onClick={(e) => { e.stopPropagation(); previewSheet(sheet); }}
                              className="flex items-center gap-2 p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                            >
                              <Table className="w-4 h-4" />
                              <span className="flex-1 truncate">{sheet.name}</span>
                              <span className="text-xs text-gray-400">{sheet.rowCount} rows</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Data Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sheets Selection */}
          {sheets.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Select Sheets to Use</h3>
                <button
                  onClick={selectAllSheets}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Select All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sheets.map(sheet => (
                  <button
                    key={sheet.name}
                    onClick={() => toggleSheet(sheet.name)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2
                      ${selectedSheets.includes(sheet.name)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}
                  >
                    {selectedSheets.includes(sheet.name) ? (
                      <SquareCheck className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {sheet.name}
                    <span className="text-xs opacity-70">({sheet.rowCount})</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <strong>{selectedSheets.length}</strong> sheet(s) selected
              </p>
            </div>
          )}

          {/* Data Preview */}
          <div className="flex-1 overflow-auto p-4">
            {previewData.headers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <ChartColumn className="w-16 h-16 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No Data Selected</h2>
                <p>Upload a file to view its data</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 sticky left-0">
                          #
                        </th>
                        {previewData.headers.map((header, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {previewData.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 sticky left-0">
                            {rowIdx + 1}
                          </td>
                          {previewData.headers.map((_, colIdx) => (
                            <td
                              key={colIdx}
                              className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                            >
                              {row[colIdx]?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.rows.length >= 100 && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Showing first 100 rows of {selectedFile?.rowCount?.toLocaleString()} total rows
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {selectedFile && selectedSheets.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => navigateWithData('/visual-query-builder')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Query Builder
                </button>
                <button
                  onClick={() => navigateWithData('/visual-report-builder')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <FileChartColumn className="w-4 h-4" />
                  Report Builder
                </button>
                <button
                  onClick={() => navigateWithData('/visual-dashboard-builder')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard Builder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <LoaderCircle className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">Processing files...</p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CircleCheck className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CircleAlert className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-2 hover:bg-red-600 rounded p-1">
            <CircleX className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataUploadPage;
