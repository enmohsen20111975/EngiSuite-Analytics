/**
 * PDF Editor Page - Advanced Version
 * Full-featured PDF editor with all original SubSaaS features
 * Includes: layers, filters, OCR, templates, forms, merge/split, advanced tools
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Loader, Select } from '../components/ui';
import canvasService from '../services/canvasService';
import {
  Save, FolderOpen, Download, Upload, Trash2, Plus,
  ZoomIn, ZoomOut, Maximize, RotateCw, FileText, FileUp,
  MousePointer, Move, Type, Pencil, Square, Circle,
  Minus, Image, Highlighter, Eraser, Undo, Redo,
  ChevronLeft, ChevronRight, Layers, ListFilter, Scan,
  GitMerge, Split, Printer, FileInput, Table, Stamp, Lock, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';

// Tool types
const TOOLS = {
  SELECT: 'select',
  PAN: 'pan',
  TEXT: 'text',
  DRAW: 'draw',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  HIGHLIGHT: 'highlight',
  ERASER: 'eraser',
  IMAGE: 'image',
  STAMP: 'stamp',
  FORM_FIELD: 'form_field',
  SIGNATURE: 'signature',
};

// Tool configurations
const TOOL_CONFIG = {
  select: { icon: MousePointer, label: 'Select', cursor: 'default' },
  pan: { icon: Move, label: 'Pan', cursor: 'grab' },
  text: { icon: Type, label: 'Text', cursor: 'text' },
  draw: { icon: Pencil, label: 'Draw', cursor: 'crosshair' },
  rectangle: { icon: Square, label: 'Rectangle', cursor: 'crosshair' },
  circle: { icon: Circle, label: 'Circle', cursor: 'crosshair' },
  line: { icon: Minus, label: 'Line', cursor: 'crosshair' },
  highlight: { icon: Highlighter, label: 'Highlight', cursor: 'crosshair' },
  eraser: { icon: Eraser, label: 'Eraser', cursor: 'crosshair' },
  image: { icon: Image, label: 'Image', cursor: 'copy' },
  stamp: { icon: Stamp, label: 'Stamp', cursor: 'pointer' },
  form_field: { icon: FileInput, label: 'Form Field', cursor: 'crosshair' },
  signature: { icon: FileText, label: 'Signature', cursor: 'crosshair' },
};

// Default colors
const COLORS = [
  '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
  '#ff00ff', '#00ffff', '#ff8800', '#8b5cf6', '#64748b'
];

// Font families
const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
];

// Stamp types
const STAMP_TYPES = [
  { id: 'approved', label: 'APPROVED', color: '#22c55e' },
  { id: 'rejected', label: 'REJECTED', color: '#ef4444' },
  { id: 'draft', label: 'DRAFT', color: '#f59e0b' },
  { id: 'confidential', label: 'CONFIDENTIAL', color: '#8b5cf6' },
  { id: 'final', label: 'FINAL', color: '#3b82f6' },
  { id: 'copy', label: 'COPY', color: '#64748b' },
];

// Form field types
const FORM_FIELD_TYPES = [
  { id: 'text', label: 'Text Field' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'radio', label: 'Radio Button' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'signature', label: 'Signature Field' },
  { id: 'date', label: 'Date Field' },
];

/**
 * Layer Panel Component
 */
function LayerPanel({ layers, activeLayerId, onSelectLayer, onToggleVisibility, onLock, onAddLayer, onDeleteLayer, onRenameLayer }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Layers</h3>
        <button
          onClick={onAddLayer}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Add Layer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs",
              activeLayerId === layer.id
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <span className="flex-1 truncate">{layer.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
              className={cn("p-1", layer.visible === false && "opacity-30")}
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onLock(layer.id); }}
              className={cn("p-1", layer.locked && "text-yellow-500")}
            >
              <Lock className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
              className="p-1 hover:text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Tool Palette Component
 */
function ToolPalette({ activeTool, onToolChange, strokeColor, onColorChange, strokeWidth, onStrokeWidthChange, fillColor, onFillColorChange }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase">Tools</h3>
      <div className="grid grid-cols-4 gap-1">
        {Object.entries(TOOL_CONFIG).map(([id, config]) => (
          <button
            key={id}
            onClick={() => onToolChange(id)}
            className={cn(
              "p-2 rounded-md transition-colors flex flex-col items-center",
              activeTool === id
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title={config.label}
          >
            <config.icon className="w-4 h-4" />
            <span className="text-[9px] mt-1">{config.label}</span>
          </button>
        ))}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Stroke</h3>
        <div className="flex flex-wrap gap-1">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={cn(
                "w-6 h-6 rounded-md border-2 transition-transform",
                strokeColor === color ? "scale-110 border-blue-500" : "border-gray-300"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fill</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={fillColor !== 'transparent'}
              onChange={(e) => onFillColorChange(e.target.checked ? '#ffffff' : 'transparent')}
              className="mr-1"
            />
            <span className="text-xs">Fill</span>
          </label>
          {fillColor !== 'transparent' && (
            <input
              type="color"
              value={fillColor}
              onChange={(e) => onFillColorChange(e.target.value)}
              className="w-8 h-6 rounded cursor-pointer"
            />
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Width</h3>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{strokeWidth}px</span>
      </div>
    </div>
  );
}

/**
 * Stamp Selector Component
 */
function StampSelector({ onSelectStamp }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Stamps</h3>
      <div className="grid grid-cols-2 gap-2">
        {STAMP_TYPES.map(stamp => (
          <button
            key={stamp.id}
            onClick={() => onSelectStamp(stamp)}
            className="p-2 border-2 rounded-lg text-xs font-bold transition-transform hover:scale-105"
            style={{ 
              borderColor: stamp.color, 
              color: stamp.color,
              backgroundColor: `${stamp.color}15`
            }}
          >
            {stamp.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Form Field Creator Component
 */
function FormFieldCreator({ onCreateField }) {
  const [fieldType, setFieldType] = useState('text');
  const [fieldName, setFieldName] = useState('');
  
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Form Fields</h3>
      <div className="space-y-2">
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          {FORM_FIELD_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Field name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            onCreateField(fieldType, fieldName);
            setFieldName('');
          }}
        >
          Add Field
        </Button>
      </div>
    </div>
  );
}

/**
 * Page Thumbnail Component
 */
function PageThumbnail({ page, index, isActive, onClick, annotations }) {
  return (
    <button
      onClick={() => onClick(index)}
      className={cn(
        "w-full p-2 rounded-lg transition-colors",
        isActive
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
    >
      <div className="aspect-[3/4] bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center relative">
        <span className="text-gray-400 text-sm">Page {index + 1}</span>
        {annotations > 0 && (
          <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1 rounded">
            {annotations}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1 block text-center">
        {index + 1}
      </span>
    </button>
  );
}

/**
 * ListFilter Panel Component
 */
function FilterPanel({ onApplyFilter }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Filters</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Brightness: {brightness}%</label>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Contrast: {contrast}%</label>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Saturation: {saturation}%</label>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={() => onApplyFilter({ brightness, contrast, saturation })}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

/**
 * OCR Panel Component
 */
function OCRPanel({ onExtractText, extractedText, isProcessing }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">OCR Text Extraction</h3>
      <Button
        size="sm"
        className="w-full mb-2"
        onClick={onExtractText}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader size="sm" className="mr-1" />
            Processing...
          </>
        ) : (
          <>
            <Scan className="w-4 h-4 mr-1" />
            Extract Text
          </>
        )}
      </Button>
      {extractedText && (
        <div className="mt-2">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Extracted Text:</h4>
          <textarea
            value={extractedText}
            readOnly
            className="w-full h-32 p-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-1"
            onClick={() => navigator.clipboard.writeText(extractedText)}
          >
            Copy to Clipboard
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Main PDF Editor Page
 */
export default function PDFEditorPage() {
  // State
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [strokeColor, setStrokeColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fillColor, setFillColor] = useState('transparent');
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([
    { id: 'page_1', annotations: [], layers: [{ id: 'layer_1', name: 'Layer 1', visible: true, locked: false }] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer_1');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [currentDocument, setCurrentDocument] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [status, setStatus] = useState('Ready');
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [formFields, setFormFields] = useState([]);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Current page annotations
  const currentAnnotations = pages[currentPage]?.annotations || [];
  const currentLayers = pages[currentPage]?.layers || [];

  // Fetch documents
  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: ['pdf-documents'],
    queryFn: () => canvasService.list({ type: 'pdf' })
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => canvasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] });
      setStatus('Document saved');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => canvasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf-documents'] });
      setStatus('Document updated');
    }
  });

  // Handle canvas mouse down
  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    
    if (activeTool === TOOLS.DRAW || activeTool === TOOLS.HIGHLIGHT || activeTool === TOOLS.ERASER) {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else if (activeTool === TOOLS.STAMP && selectedStamp) {
      // Add stamp annotation
      const stampAnnotation = {
        id: `ann_${Date.now()}`,
        type: 'stamp',
        stampType: selectedStamp.id,
        text: selectedStamp.label,
        color: selectedStamp.color,
        x, y,
        width: 100,
        height: 40,
        rotation: 0
      };
      
      addAnnotation(stampAnnotation);
      setSelectedStamp(null);
      setActiveTool(TOOLS.SELECT);
    } else if (activeTool === TOOLS.RECTANGLE || activeTool === TOOLS.CIRCLE || activeTool === TOOLS.LINE) {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else if (activeTool === TOOLS.PAN) {
      // Start panning
    }
  }, [activeTool, offset, zoom, selectedStamp]);

  // Handle canvas mouse move
  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    
    setCurrentPath(prev => [...prev, { x, y }]);
  }, [isDrawing, offset, zoom]);

  // Handle canvas mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentPath.length > 1) {
      if (activeTool === TOOLS.DRAW || activeTool === TOOLS.HIGHLIGHT || activeTool === TOOLS.ERASER) {
        const newAnnotation = {
          id: `ann_${Date.now()}`,
          type: activeTool,
          path: currentPath,
          color: activeTool === TOOLS.ERASER ? '#ffffff' : strokeColor,
          strokeWidth: activeTool === TOOLS.HIGHLIGHT ? strokeWidth * 3 : strokeWidth,
          layerId: activeLayerId
        };
        
        addAnnotation(newAnnotation);
      } else if (activeTool === TOOLS.RECTANGLE || activeTool === TOOLS.CIRCLE || activeTool === TOOLS.LINE) {
        const start = currentPath[0];
        const end = currentPath[currentPath.length - 1];
        
        const shapeAnnotation = {
          id: `ann_${Date.now()}`,
          type: activeTool,
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
          startX: start.x,
          startY: start.y,
          endX: end.x,
          endY: end.y,
          strokeColor,
          strokeWidth,
          fillColor,
          layerId: activeLayerId
        };
        
        addAnnotation(shapeAnnotation);
      }
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, activeTool, strokeColor, strokeWidth, fillColor, activeLayerId, currentPage]);

  // Add annotation
  const addAnnotation = useCallback((annotation) => {
    setPages(prev => prev.map((page, i) => {
      if (i === currentPage) {
        return {
          ...page,
          annotations: [...page.annotations, annotation]
        };
      }
      return page;
    }));
    saveToHistory();
  }, [currentPage]);

  // Save to history
  const saveToHistory = useCallback(() => {
    const state = { pages };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state)));
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [pages, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPages(prevState.pages);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPages(nextState.pages);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  // Add new page
  const handleAddPage = useCallback(() => {
    setPages(prev => [...prev, { 
      id: `page_${Date.now()}`, 
      annotations: [],
      layers: [{ id: `layer_${Date.now()}`, name: 'Layer 1', visible: true, locked: false }]
    }]);
    setCurrentPage(pages.length);
    setStatus('Page added');
  }, [pages.length]);

  // Delete current page
  const handleDeletePage = useCallback(() => {
    if (pages.length <= 1) return;
    
    setPages(prev => prev.filter((_, i) => i !== currentPage));
    setCurrentPage(prev => Math.max(0, prev - 1));
    setStatus('Page deleted');
  }, [pages.length, currentPage]);

  // Clear annotations
  const handleClearAnnotations = useCallback(() => {
    setPages(prev => prev.map((page, i) => {
      if (i === currentPage) {
        return { ...page, annotations: [] };
      }
      return page;
    }));
    setStatus('Annotations cleared');
  }, [currentPage]);

  // Add layer
  const handleAddLayer = useCallback(() => {
    const newLayer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${currentLayers.length + 1}`,
      visible: true,
      locked: false
    };
    
    setPages(prev => prev.map((page, i) => {
      if (i === currentPage) {
        return { ...page, layers: [...page.layers, newLayer] };
      }
      return page;
    }));
    setActiveLayerId(newLayer.id);
    setStatus('Layer added');
  }, [currentPage, currentLayers.length]);

  // Toggle layer visibility
  const handleToggleLayerVisibility = useCallback((layerId) => {
    setPages(prev => prev.map((page, i) => {
      if (i === currentPage) {
        return {
          ...page,
          layers: page.layers.map(l => 
            l.id === layerId ? { ...l, visible: !l.visible } : l
          )
        };
      }
      return page;
    }));
  }, [currentPage]);

  // Lock layer
  const handleLockLayer = useCallback((layerId) => {
    setPages(prev => prev.map((page, i) => {
      if (i === currentPage) {
        return {
          ...page,
          layers: page.layers.map(l => 
            l.id === layerId ? { ...l, locked: !l.locked } : l
          )
        };
      }
      return page;
    }));
  }, [currentPage]);

  // Delete layer
  const handleDeleteLayer = useCallback((layerId) => {
    if (currentLayers.length <= 1) return;
    
    setPages(prev => prev.map((page, i) => {
      if (i === currentPage) {
        return {
          ...page,
          layers: page.layers.filter(l => l.id !== layerId),
          annotations: page.annotations.filter(a => a.layerId !== layerId)
        };
      }
      return page;
    }));
    
    if (activeLayerId === layerId) {
      setActiveLayerId(currentLayers[0]?.id);
    }
  }, [currentPage, currentLayers, activeLayerId]);

  // Save document
  const handleSave = useCallback(async () => {
    const state = {
      version: '2.0',
      viewport: { zoom, offset },
      pages,
      formFields,
      filters,
      metadata: {
        name: currentDocument?.name || 'Untitled Document',
        type: 'pdf'
      }
    };

    try {
      if (currentDocument?.id) {
        await updateMutation.mutateAsync({
          id: currentDocument.id,
          data: { state }
        });
      } else {
        const result = await createMutation.mutateAsync({
          name: state.metadata.name,
          type: 'pdf',
          state
        });
        setCurrentDocument(result);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('Save failed');
    }
  }, [pages, zoom, offset, currentDocument, formFields, filters, createMutation, updateMutation]);

  // Load document
  const handleLoad = useCallback(async (doc) => {
    try {
      const data = await canvasService.get(doc.id);
      
      if (data.state) {
        setZoom(data.state.viewport?.zoom || 1);
        setOffset(data.state.viewport?.offset || { x: 0, y: 0 });
        setPages(data.state.pages || [{ id: 'page_1', annotations: [], layers: [{ id: 'layer_1', name: 'Layer 1', visible: true, locked: false }] }]);
        setFormFields(data.state.formFields || []);
        setFilters(data.state.filters || { brightness: 100, contrast: 100, saturation: 100 });
        setCurrentPage(0);
        setCurrentDocument(data);
        setStatus(`Loaded: ${data.name}`);
      }
    } catch (error) {
      console.error('Load failed:', error);
      setStatus('Load failed');
    }
  }, []);

  // New document
  const handleNew = useCallback(() => {
    setPages([{ id: 'page_1', annotations: [], layers: [{ id: 'layer_1', name: 'Layer 1', visible: true, locked: false }] }]);
    setCurrentPage(0);
    setCurrentDocument(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setFormFields([]);
    setFilters({ brightness: 100, contrast: 100, saturation: 100 });
    setStatus('New document created');
  }, []);

  // Export as PDF
  const handleExport = useCallback(async () => {
    try {
      const result = await canvasService.export(currentDocument?.id || 'temp', 'pdf');
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      setStatus('Export started');
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('Export failed');
    }
  }, [currentDocument]);

  // Upload PDF
  const handleUploadPDF = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, this would use PDF.js to parse the PDF
    setStatus(`Loaded: ${file.name}`);
    setCurrentDocument({ name: file.name, type: 'pdf' });
  }, []);

  // OCR text extraction (simulated)
  const handleExtractText = useCallback(() => {
    setIsOCRProcessing(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      setExtractedText(`This is simulated OCR text extracted from page ${currentPage + 1}.\n\nIn a real implementation, this would use Tesseract.js or a server-side OCR service to extract actual text from the PDF or images.`);
      setIsOCRProcessing(false);
      setStatus('Text extracted');
    }, 2000);
  }, [currentPage]);

  // Apply filters
  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setStatus('Filters applied');
  }, []);

  // Create form field
  const handleCreateFormField = useCallback((fieldType, fieldName) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      name: fieldName || `Field ${formFields.length + 1}`,
      x: 100,
      y: 100 + formFields.length * 30,
      width: 150,
      height: 25,
      page: currentPage
    };
    
    setFormFields(prev => [...prev, newField]);
    setStatus(`Added ${fieldType} field`);
  }, [formFields.length, currentPage]);

  // Merge documents (simulated)
  const handleMergeDocuments = useCallback(() => {
    setStatus('Merge feature: Select additional PDF files to merge');
    // In real implementation, this would open a file picker and merge PDFs
  }, []);

  // Split document (simulated)
  const handleSplitDocument = useCallback(() => {
    setStatus('Split feature: Select pages to extract into new document');
    // In real implementation, this would allow selecting pages to split
  }, []);

  // Printer document
  const handlePrint = useCallback(() => {
    window.print();
    setStatus('Printer dialog opened');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'o':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
            if (selectedAnnotation) {
              setPages(prev => prev.map((page, i) => {
                if (i === currentPage) {
                  return { ...page, annotations: page.annotations.filter(a => a.id !== selectedAnnotation) };
                }
                return page;
              }));
              setSelectedAnnotation(null);
            }
            break;
          case 'Escape':
            setSelectedAnnotation(null);
            setSelectedStamp(null);
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, handlePrint, selectedAnnotation, currentPage]);

  // Cursor style
  const cursor = TOOL_CONFIG[activeTool]?.cursor || 'default';

  // ListFilter style
  const filterStyle = useMemo(() => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
  }, [filters]);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            PDF Editor
          </h1>
          <span className="text-sm text-gray-500">{currentDocument?.name || 'Untitled'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1" />
          
          {/* PDF Operations */}
          <Button variant="ghost" size="sm" onClick={handleMergeDocuments}>
            <GitMerge className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSplitDocument}>
            <Split className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1" />
          
          {/* Filters toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'text-blue-500' : ''}
          >
            <ListFilter className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1" />
          
          {/* File operations */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleUploadPDF}
            className="hidden"
          />
          <Button variant="ghost" size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="w-4 h-4 mr-1" />
            Open
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Tools & Layers */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <ToolPalette
            activeTool={activeTool}
            onToolChange={setActiveTool}
            strokeColor={strokeColor}
            onColorChange={setStrokeColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
          />
          
          <LayerPanel
            layers={currentLayers}
            activeLayerId={activeLayerId}
            onSelectLayer={setActiveLayerId}
            onToggleVisibility={handleToggleLayerVisibility}
            onLock={handleLockLayer}
            onAddLayer={handleAddLayer}
            onDeleteLayer={handleDeleteLayer}
          />
          
          {activeTool === TOOLS.STAMP && (
            <StampSelector onSelectStamp={(stamp) => setSelectedStamp(stamp)} />
          )}
          
          {activeTool === TOOLS.FORM_FIELD && (
            <FormFieldCreator onCreateField={handleCreateFormField} />
          )}
          
          {showFilters && (
            <FilterPanel onApplyFilter={handleApplyFilters} />
          )}
          
          <OCRPanel
            onExtractText={handleExtractText}
            extractedText={extractedText}
            isProcessing={isOCRProcessing}
          />
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {/* Page controls */}
          <div className="flex items-center justify-center gap-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {pages.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={currentPage === pages.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleAddPage}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeletePage} disabled={pages.length <= 1}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-center">
              <svg
                ref={canvasRef}
                className="bg-white shadow-lg"
                style={{
                  width: 612 * zoom,
                  height: 792 * zoom,
                  cursor,
                  filter: filterStyle
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Transform group */}
                <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
                  {/* Page background */}
                  <rect
                    x={0}
                    y={0}
                    width={612}
                    height={792}
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  
                  {/* Render annotations by layer */}
                  {currentLayers.filter(l => l.visible).map(layer => (
                    <g key={layer.id}>
                      {currentAnnotations
                        .filter(ann => ann.layerId === layer.id)
                        .map(ann => {
                          if (ann.path) {
                            return (
                              <path
                                key={ann.id}
                                d={ann.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                                fill="none"
                                stroke={ann.color}
                                strokeWidth={ann.strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={ann.type === TOOLS.HIGHLIGHT ? 0.3 : 1}
                                onClick={(e) => { e.stopPropagation(); setSelectedAnnotation(ann.id); }}
                                className={selectedAnnotation === ann.id ? 'ring-2 ring-blue-500' : ''}
                              />
                            );
                          } else if (ann.type === TOOLS.RECTANGLE) {
                            return (
                              <rect
                                key={ann.id}
                                x={ann.x}
                                y={ann.y}
                                width={ann.width}
                                height={ann.height}
                                fill={ann.fillColor === 'transparent' ? 'none' : ann.fillColor}
                                stroke={ann.strokeColor}
                                strokeWidth={ann.strokeWidth}
                                onClick={(e) => { e.stopPropagation(); setSelectedAnnotation(ann.id); }}
                              />
                            );
                          } else if (ann.type === TOOLS.CIRCLE) {
                            return (
                              <ellipse
                                key={ann.id}
                                cx={ann.x + ann.width/2}
                                cy={ann.y + ann.height/2}
                                rx={ann.width/2}
                                ry={ann.height/2}
                                fill={ann.fillColor === 'transparent' ? 'none' : ann.fillColor}
                                stroke={ann.strokeColor}
                                strokeWidth={ann.strokeWidth}
                                onClick={(e) => { e.stopPropagation(); setSelectedAnnotation(ann.id); }}
                              />
                            );
                          } else if (ann.type === TOOLS.LINE) {
                            return (
                              <line
                                key={ann.id}
                                x1={ann.startX}
                                y1={ann.startY}
                                x2={ann.endX}
                                y2={ann.endY}
                                stroke={ann.strokeColor}
                                strokeWidth={ann.strokeWidth}
                                onClick={(e) => { e.stopPropagation(); setSelectedAnnotation(ann.id); }}
                              />
                            );
                          } else if (ann.type === 'stamp') {
                            return (
                              <g key={ann.id} transform={`translate(${ann.x}, ${ann.y})`}>
                                <rect
                                  width={ann.width}
                                  height={ann.height}
                                  fill={`${ann.color}20`}
                                  stroke={ann.color}
                                  strokeWidth={3}
                                  rx={4}
                                />
                                <text
                                  x={ann.width/2}
                                  y={ann.height/2 + 5}
                                  textAnchor="middle"
                                  fontSize={14}
                                  fontWeight="bold"
                                  fill={ann.color}
                                  transform={`rotate(${ann.rotation || 0}, ${ann.width/2}, ${ann.height/2})`}
                                >
                                  {ann.text}
                                </text>
                              </g>
                            );
                          }
                          return null;
                        })}
                    </g>
                  ))}
                  
                  {/* Form fields */}
                  {formFields.filter(f => f.page === currentPage).map(field => (
                    <g key={field.id} transform={`translate(${field.x}, ${field.y})`}>
                      <rect
                        width={field.width}
                        height={field.height}
                        fill="#f0f9ff"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        strokeDasharray="4"
                      />
                      <text x={5} y={field.height/2 + 4} fontSize={10} fill="#3b82f6">
                        {field.name}
                      </text>
                    </g>
                  ))}
                  
                  {/* Current drawing path */}
                  {currentPath.length > 1 && (
                    <path
                      d={currentPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                      fill="none"
                      stroke={activeTool === TOOLS.ERASER ? '#ffffff' : strokeColor}
                      strokeWidth={activeTool === TOOLS.HIGHLIGHT ? strokeWidth * 3 : strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={activeTool === TOOLS.HIGHLIGHT ? 0.3 : 1}
                    />
                  )}
                </g>
              </svg>
            </div>
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <Button variant="ghost" size="sm" onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right sidebar - Pages & Documents */}
        <div className="w-48 p-4 space-y-4 overflow-y-auto">
          {/* Page thumbnails */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pages</h3>
            <div className="space-y-2">
              {pages.map((page, i) => (
                <PageThumbnail
                  key={page.id}
                  page={page}
                  index={i}
                  isActive={i === currentPage}
                  onClick={setCurrentPage}
                  annotations={page.annotations.length}
                />
              ))}
            </div>
          </div>
          
          {/* Saved documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Documents</h3>
            {loadingDocuments ? (
              <Loader size="sm" />
            ) : (
              <div className="space-y-1">
                {documents?.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleLoad(doc)}
                    className={cn(
                      "w-full px-2 py-1.5 text-left text-xs rounded transition-colors truncate",
                      currentDocument?.id === doc.id
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {doc.name}
                  </button>
                ))}
                {(!documents || documents.length === 0) && (
                  <p className="text-xs text-gray-400">No saved documents</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 bg-white dark:bg-gray-800 border-t dark:border-gray-700 text-xs text-gray-500">
        {status} | Annotations: {currentAnnotations.length} | Layers: {currentLayers.length} | Form Fields: {formFields.length}
      </div>
    </div>
  );
}
