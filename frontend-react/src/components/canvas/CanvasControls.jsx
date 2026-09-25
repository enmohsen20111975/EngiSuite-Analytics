/**
 * CanvasControls Component
 * Zoom, pan, and other canvas controls
 */
import { useCallback } from 'react';
import { cn } from '../../lib/utils';
import {
  ZoomIn, ZoomOut, Maximize, Undo, Redo,
  Grid3X3, Move, MousePointer, Download,
  Upload, Trash2, Copy, Scissors, Clipboard
} from 'lucide-react';

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200, 300, 400];

export function CanvasControls({
  // Canvas state
  viewport,
  canUndo,
  canRedo,
  selectedCount = 0,
  
  // Actions
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitAll,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleSnap,
  onExport,
  onImport,
  onDelete,
  onDuplicate,
  onCut,
  onCopy,
  onPaste,
  onClear,
  
  // Configuration
  gridEnabled = true,
  snapEnabled = false,
  showZoomControls = true,
  showEditControls = true,
  showFileControls = true,
  showViewControls = true,
  compact = false,
  
  className
}) {
  // Handle zoom to specific level
  const handleZoomTo = useCallback((level) => {
    if (onZoomReset) {
      onZoomReset(level / 100);
    }
  }, [onZoomReset]);
  
  return (
    <div className={cn(
      "flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1.5",
      className
    )}>
      {/* File controls */}
      {showFileControls && (
        <div className="flex items-center gap-1 pr-2 mr-2 border-r border-gray-200 dark:border-gray-700">
          {onImport && (
            <button
              onClick={onImport}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Import"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      {/* Edit controls */}
      {showEditControls && (
        <div className="flex items-center gap-1 pr-2 mr-2 border-r border-gray-200 dark:border-gray-700">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "p-2 rounded-md transition-colors",
              canUndo 
                ? "hover:bg-gray-100 dark:hover:bg-gray-700" 
                : "opacity-50 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "p-2 rounded-md transition-colors",
              canRedo 
                ? "hover:bg-gray-100 dark:hover:bg-gray-700" 
                : "opacity-50 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
          
          {selectedCount > 0 && (
            <>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              
              {onCut && (
                <button
                  onClick={onCut}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              )}
              {onCopy && (
                <button
                  onClick={onCopy}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Duplicate (Ctrl+D)"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                  title="Delete (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      )}
      
      {/* View controls */}
      {showViewControls && (
        <div className="flex items-center gap-1 pr-2 mr-2 border-r border-gray-200 dark:border-gray-700">
          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={cn(
                "p-2 rounded-md transition-colors",
                gridEnabled 
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              title="Toggle grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      {/* Zoom controls */}
      {showZoomControls && (
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          {!compact && (
            <select
              value={Math.round(viewport?.zoom * 100) || 100}
              onChange={(e) => handleZoomTo(parseInt(e.target.value))}
              className="px-2 py-1 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ZOOM_LEVELS.map(level => (
                <option key={level} value={level}>{level}%</option>
              ))}
            </select>
          )}
          
          {compact && (
            <span className="px-2 text-sm text-gray-600 dark:text-gray-400 min-w-[50px] text-center">
              {Math.round(viewport?.zoom * 100) || 100}%
            </span>
          )}
          
          <button
            onClick={onZoomIn}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onFitAll}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Fit to view"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Clear button */}
      {onClear && (
        <div className="flex items-center pl-2 ml-2 border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={onClear}
            className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default CanvasControls;
