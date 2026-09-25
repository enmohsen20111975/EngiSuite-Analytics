/**
 * VDA Data Context - Shared data management for Visual Data Analysis tools
 * 
 * Storage Strategy:
 * - Subscribed users: Data is stored on the server (user-specific database)
 * - Non-subscribed users: Data is stored locally in browser (localStorage/IndexedDB)
 * 
 * This context provides a centralized way to manage uploaded data sources
 * across Query Builder, Report Builder, Dashboard Builder, and Data Analysis pages.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import vdaService from '../services/vdaService';

// Create the context
const VDADataContext = createContext(null);

// Storage keys for local caching
const STORAGE_KEYS = {
  UPLOADED_FILES: 'vda_uploaded_files',
  ACTIVE_DATA: 'vda_active_data_id',
  SELECTED_SOURCES: 'vda_selected_sources',
  DATA_PREFIX: 'vda_data_',
  USER_PLAN: 'user_plan'
};

// Size limits
const LOCAL_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB limit for localStorage
const MAX_LOCAL_SOURCES = 10; // Max number of local data sources for free users

/**
 * Infer field type from a value
 * @param {*} value - The value to infer type from
 * @returns {string} The inferred type
 */
function inferType(value) {
  if (value === null || value === undefined) return 'text';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (!isNaN(Date.parse(value)) && typeof value === 'string' && value.length > 6) return 'date';
  return 'text';
}

/**
 * Check if user is subscribed
 * @returns {boolean} Whether user has an active subscription
 */
function checkSubscription() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Check various subscription indicators
      return user.subscription?.status === 'active' || 
             user.plan === 'premium' || 
             user.plan === 'pro' ||
             user.isSubscribed === true;
    }
  } catch (e) {
    console.warn('Could not check subscription status:', e);
  }
  return false;
}

/**
 * Estimate size of data
 * @param {*} data - Data to estimate
 * @returns {number} Size in bytes
 */
function estimateSize(data) {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

/**
 * VDA Data Provider Component
 */
export function VDADataProvider({ children }) {
  // State for all uploaded data sources
  const [dataSources, setDataSources] = useState([]);
  
  // State for the currently active/selected data source
  const [activeDataSource, setActiveDataSource] = useState(null);
  
  // State for multi-selected source IDs (for cross-source queries)
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Subscription status
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check subscription and load data on mount
  useEffect(() => {
    const subscribed = checkSubscription();
    setIsSubscribed(subscribed);
    loadDataSources(subscribed);
    loadSelectedSourceIds();
  }, []);
  
  /**
   * Load selected source IDs from sessionStorage
   */
  const loadSelectedSourceIds = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.SELECTED_SOURCES);
      if (saved) {
        setSelectedSourceIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load selected source IDs:', e);
    }
  };
  
  /**
   * Save selected source IDs to sessionStorage
   */
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_SOURCES, JSON.stringify(selectedSourceIds));
    } catch (e) {
      console.warn('Could not save selected source IDs:', e);
    }
  }, [selectedSourceIds]);

  /**
   * Load data sources based on subscription status
   */
  const loadDataSources = async (subscribed = isSubscribed) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (subscribed) {
        // Try to load from server for subscribed users
        try {
          const response = await vdaService.getDatasets();
          if (response.success && response.data) {
            const serverSources = response.data.map(dataset => ({
              id: String(dataset.id),
              name: dataset.name,
              type: dataset.dataType || 'uploaded',
              uploadedAt: dataset.createdAt,
              sheets: parseDatasetSheets(dataset),
              rowCount: dataset.rowCount || 0,
              colCount: dataset.columns ? JSON.parse(dataset.columns).length : 0,
              data: dataset.data ? JSON.parse(dataset.data) : null,
              serverId: dataset.id,
              storedOn: 'server'
            }));
            
            setDataSources(serverSources);
            setActiveFromSources(serverSources);
            return;
          }
        } catch (serverError) {
          console.warn('Server load failed, using local cache:', serverError);
        }
      }
      
      // Load from local storage (for non-subscribed or server fallback)
      const localSources = loadFromLocalStorage();
      setDataSources(localSources);
      setActiveFromSources(localSources);
      
    } catch (err) {
      console.error('Failed to load data sources:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set active data source from list
   */
  const setActiveFromSources = (sources) => {
    if (sources.length > 0) {
      const activeId = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_DATA);
      const activeSource = activeId 
        ? sources.find(s => s.id === activeId) 
        : sources[0];
      setActiveDataSource(activeSource || null);
    }
  };

  /**
   * Parse dataset sheets from server data
   */
  const parseDatasetSheets = (dataset) => {
    if (!dataset.data) return [];
    
    try {
      const data = typeof dataset.data === 'string' ? JSON.parse(dataset.data) : dataset.data;
      
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(h => item[h]));
        
        return [{
          name: dataset.name || 'Data',
          headers,
          rows,
          rowCount: rows.length,
          colCount: headers.length,
          rawData: data
        }];
      }
    } catch (e) {
      console.warn('Failed to parse dataset data:', e);
    }
    
    return [];
  };

  /**
   * Save data sources to local storage
   */
  const saveToLocalStorage = (sources) => {
    try {
      // Save metadata only
      const metadata = sources.map(({ data, sheets, ...meta }) => ({
        ...meta,
        hasData: !!(data || sheets?.length > 0)
      }));
      localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(metadata));
      
      // Save full data separately
      sources.forEach(source => {
        if (source.data || source.sheets) {
          const fullDataKey = STORAGE_KEYS.DATA_PREFIX + source.id;
          const dataToStore = {
            data: source.data,
            sheets: source.sheets
          };
          
          // Check size before saving
          const size = estimateSize(dataToStore);
          if (size > LOCAL_STORAGE_LIMIT / 2) {
            console.warn(`Data source ${source.name} is large (${(size / 1024).toFixed(1)}KB), may impact performance`);
          }
          
          try {
            localStorage.setItem(fullDataKey, JSON.stringify(dataToStore));
          } catch (quotaError) {
            console.error('Storage quota exceeded for:', source.name);
            // Try to save without full data, just metadata
            localStorage.setItem(fullDataKey, JSON.stringify({ 
              truncated: true,
              sheets: source.sheets?.map(s => ({
                name: s.name,
                headers: s.headers,
                rowCount: s.rowCount,
                colCount: s.colCount
              }))
            }));
          }
        }
      });
    } catch (e) {
      console.warn('Could not save to local storage:', e);
    }
  };

  /**
   * Load data sources from local storage
   */
  const loadFromLocalStorage = () => {
    try {
      const savedFiles = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES);
      if (!savedFiles) return [];
      
      const metadata = JSON.parse(savedFiles);
      return metadata.map(meta => {
        const fullDataKey = STORAGE_KEYS.DATA_PREFIX + meta.id;
        const fullData = localStorage.getItem(fullDataKey);
        const parsed = fullData ? JSON.parse(fullData) : {};
        
        return {
          ...meta,
          data: parsed.data || null,
          sheets: parsed.sheets || [],
          storedOn: 'local'
        };
      }).filter(source => source.hasData || source.data || source.sheets?.length > 0);
    } catch (e) {
      console.warn('Could not load from local storage:', e);
      return [];
    }
  };

  // Save active data source ID to sessionStorage
  useEffect(() => {
    if (activeDataSource) {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_DATA, activeDataSource.id);
    }
  }, [activeDataSource]);

  /**
   * Add a new data source
   */
  const addDataSource = useCallback(async (source) => {
    const tempId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the source object
    const newSource = {
      id: tempId,
      name: source.name,
      type: source.type || 'uploaded',
      uploadedAt: new Date().toISOString(),
      sheets: source.sheets || [],
      data: source.data || null,
      rowCount: source.rowCount || 0,
      colCount: source.colCount || 0,
      size: source.size || 0,
      storedOn: 'local'
    };
    
    // Check limits for non-subscribed users
    if (!isSubscribed) {
      const currentCount = dataSources.filter(s => s.storedOn === 'local').length;
      if (currentCount >= MAX_LOCAL_SOURCES) {
        throw new Error(`Free users are limited to ${MAX_LOCAL_SOURCES} data sources. Please upgrade to store more.`);
      }
      
      const dataSize = estimateSize(source.data || source.sheets);
      if (dataSize > LOCAL_STORAGE_LIMIT / 2) {
        console.warn('Large data file may not be stored completely in free tier');
      }
    }
    
    // Optimistically add to local state
    setDataSources(prev => [...prev, newSource]);
    setActiveDataSource(newSource);
    
    try {
      // For subscribed users, try to upload to server
      if (isSubscribed && (source.data || source.sheets?.[0]?.rawData)) {
        const dataToUpload = source.data || source.sheets[0].rawData;
        
        try {
          const response = await vdaService.uploadData({
            name: source.name,
            data: dataToUpload,
            type: source.type
          });
          
          if (response.success && response.data) {
            // Update with server ID
            const serverSource = {
              ...newSource,
              id: String(response.data.id),
              serverId: response.data.id,
              uploadedAt: response.data.createdAt,
              storedOn: 'server'
            };
            
            setDataSources(prev => prev.map(s => 
              s.id === tempId ? serverSource : s
            ));
            setActiveDataSource(serverSource);
            
            return serverSource;
          }
        } catch (serverError) {
          console.warn('Could not upload to server, keeping locally:', serverError);
        }
      }
      
      // Save to local storage
      saveToLocalStorage([newSource, ...dataSources]);
      
      return newSource;
    } catch (err) {
      console.error('Failed to add data source:', err);
      // Remove from state on error
      setDataSources(prev => prev.filter(s => s.id !== tempId));
      throw err;
    }
  }, [dataSources, isSubscribed]);

  /**
   * Remove a data source
   */
  const removeDataSource = useCallback(async (sourceId) => {
    const source = dataSources.find(s => s.id === sourceId);
    
    // Remove from local state
    setDataSources(prev => prev.filter(s => s.id !== sourceId));
    
    // Clear active if removed
    if (activeDataSource?.id === sourceId) {
      const remaining = dataSources.filter(s => s.id !== sourceId);
      setActiveDataSource(remaining.length > 0 ? remaining[0] : null);
    }
    
    // Remove from local storage
    localStorage.removeItem(STORAGE_KEYS.DATA_PREFIX + sourceId);
    const savedFiles = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES);
    if (savedFiles) {
      const metadata = JSON.parse(savedFiles).filter(s => s.id !== sourceId);
      if (metadata.length > 0) {
        localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(metadata));
      } else {
        localStorage.removeItem(STORAGE_KEYS.UPLOADED_FILES);
      }
    }
    
    // Try to remove from server if it was stored there
    if (source?.serverId) {
      try {
        await vdaService.deleteDataset(source.serverId);
      } catch (err) {
        console.warn('Could not delete from server:', err);
      }
    }
  }, [dataSources, activeDataSource]);

  /**
   * Update an existing data source
   */
  const updateDataSource = useCallback((sourceId, updates) => {
    setDataSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, ...updates } : s
    ));
    
    if (activeDataSource?.id === sourceId) {
      setActiveDataSource(prev => prev ? { ...prev, ...updates } : null);
    }
    
    // Update local storage
    const savedFiles = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES);
    if (savedFiles) {
      const metadata = JSON.parse(savedFiles).map(s => 
        s.id === sourceId ? { ...s, ...updates } : s
      );
      localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(metadata));
    }
  }, [activeDataSource]);

  /**
   * Get a data source by ID
   */
  const getDataSource = useCallback((sourceId) => {
    return dataSources.find(s => s.id === sourceId) || null;
  }, [dataSources]);

  /**
   * Select a data source as active
   */
  const selectDataSource = useCallback((sourceId) => {
    const source = dataSources.find(s => s.id === sourceId);
    if (source) {
      setActiveDataSource(source);
    }
  }, [dataSources]);

  /**
   * Clear all data sources
   */
  const clearAllDataSources = useCallback(() => {
    // Remove all from local storage
    dataSources.forEach(source => {
      localStorage.removeItem(STORAGE_KEYS.DATA_PREFIX + source.id);
    });
    localStorage.removeItem(STORAGE_KEYS.UPLOADED_FILES);
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_SOURCES);
    
    setDataSources([]);
    setActiveDataSource(null);
    setSelectedSourceIds([]);
  }, [dataSources]);
  
  /**
   * Toggle a source in multi-selection
   */
  const toggleSourceSelection = useCallback((sourceId) => {
    setSelectedSourceIds(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  }, []);
  
  /**
   * Select all sources for multi-query
   */
  const selectAllSources = useCallback(() => {
    setSelectedSourceIds(dataSources.map(s => s.id));
  }, [dataSources]);
  
  /**
   * Deselect all sources
   */
  const deselectAllSources = useCallback(() => {
    setSelectedSourceIds([]);
  }, []);
  
  /**
   * Get selected sources data
   */
  const getSelectedSources = useCallback(() => {
    return dataSources.filter(s => selectedSourceIds.includes(s.id));
  }, [dataSources, selectedSourceIds]);
  
  /**
   * Get tables/sheets for selected sources only (for multi-source queries)
   */
  const getTablesForSelectedSources = useCallback(() => {
    const selectedSources = dataSources.filter(s => selectedSourceIds.includes(s.id));
    
    return selectedSources.flatMap(source => {
      if (source.sheets && source.sheets.length > 0) {
        return source.sheets.map(sheet => ({
          id: `table_${source.id}_${sheet.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: sheet.name,
          sourceId: source.id,
          sourceName: source.name,
          fields: sheet.headers?.map((h, idx) => ({
            name: h,
            type: inferType(sheet.rows?.[0]?.[idx])
          })) || [],
          rowCount: sheet.rowCount || 0,
          data: sheet.rows || [],
          rawData: sheet.rawData || []
        }));
      }
      // If no sheets, create a single table from the data
      if (source.data && Array.isArray(source.data)) {
        const headers = source.data.length > 0 ? Object.keys(source.data[0]) : [];
        return [{
          id: `table_${source.id}`,
          name: source.name,
          sourceId: source.id,
          sourceName: source.name,
          fields: headers.map(h => ({
            name: h,
            type: inferType(source.data[0]?.[h])
          })),
          rowCount: source.data.length,
          data: source.data.map(row => headers.map(h => row[h])),
          rawData: source.data
        }];
      }
      return [];
    });
  }, [dataSources, selectedSourceIds]);

  /**
   * Get tables/sheets for query builder
   */
  const getTablesForQueryBuilder = useCallback(() => {
    return dataSources.flatMap(source => {
      if (source.sheets && source.sheets.length > 0) {
        return source.sheets.map(sheet => ({
          id: `table_${source.id}_${sheet.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: sheet.name,
          sourceId: source.id,
          sourceName: source.name,
          fields: sheet.headers?.map((h, idx) => ({
            name: h,
            type: inferType(sheet.rows?.[0]?.[idx])
          })) || [],
          rowCount: sheet.rowCount || 0,
          data: sheet.rows || [],
          rawData: sheet.rawData || []
        }));
      }
      // If no sheets, create a single table from the data
      if (source.data && Array.isArray(source.data)) {
        const headers = source.data.length > 0 ? Object.keys(source.data[0]) : [];
        return [{
          id: `table_${source.id}`,
          name: source.name,
          sourceId: source.id,
          sourceName: source.name,
          fields: headers.map(h => ({
            name: h,
            type: inferType(source.data[0]?.[h])
          })),
          rowCount: source.data.length,
          data: source.data.map(row => headers.map(h => row[h])),
          rawData: source.data
        }];
      }
      return [];
    });
  }, [dataSources]);

  /**
   * Refresh data sources
   */
  const refreshDataSources = useCallback(async () => {
    const subscribed = checkSubscription();
    setIsSubscribed(subscribed);
    await loadDataSources(subscribed);
  }, []);

  // Context value
  const value = {
    // State
    dataSources,
    activeDataSource,
    selectedSourceIds,
    isLoading,
    error,
    isSubscribed,
    
    // Actions
    addDataSource,
    removeDataSource,
    updateDataSource,
    getDataSource,
    selectDataSource,
    clearAllDataSources,
    refreshDataSources,
    
    // Multi-select actions
    toggleSourceSelection,
    selectAllSources,
    deselectAllSources,
    getSelectedSources,
    
    // Helpers
    getTablesForQueryBuilder,
    getTablesForSelectedSources,
    
    // Computed
    hasData: dataSources.length > 0,
    sourceCount: dataSources.length,
    selectedCount: selectedSourceIds.length,
    localSourceCount: dataSources.filter(s => s.storedOn === 'local').length,
    serverSourceCount: dataSources.filter(s => s.storedOn === 'server').length,
    maxLocalSources: MAX_LOCAL_SOURCES
  };

  return (
    <VDADataContext.Provider value={value}>
      {children}
    </VDADataContext.Provider>
  );
}

/**
 * Custom hook to use the VDA Data context
 */
export function useVDAData() {
  const context = useContext(VDADataContext);
  if (!context) {
    throw new Error('useVDAData must be used within a VDADataProvider');
  }
  return context;
}

export default VDADataContext;
