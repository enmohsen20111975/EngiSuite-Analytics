/**
 * VDA (Visual Data Analysis) Service
 * Handles all API calls for data upload, query builder, report builder, and dashboard builder
 */

const API_BASE = '/api/vda';

/**
 * Upload data to the server
 * @param {Object} params - Upload parameters
 * @param {string} params.name - Name of the dataset
 * @param {Array|Object} params.data - The data to upload
 * @param {string} params.type - Type of data (csv, excel, json)
 * @returns {Promise<Object>} The created dataset
 */
export async function uploadData({ name, data, type }) {
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, data, type, dataType: type }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upload data');
  }

  return response.json();
}

/**
 * Get all datasets for the current user
 * @returns {Promise<Array>} List of datasets
 */
export async function getDatasets() {
  const response = await fetch(`${API_BASE}/datasets`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch datasets');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Get a single dataset by ID
 * @param {string} id - Dataset ID
 * @returns {Promise<Object>} The dataset
 */
export async function getDataset(id) {
  const response = await fetch(`${API_BASE}/datasets/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch dataset');
  }

  return response.json();
}

/**
 * Analyze data
 * @param {Object} params - Analysis parameters
 * @param {string} params.datasetId - Dataset ID
 * @param {string} params.analysisType - Type of analysis (statistics, correlation)
 * @param {Array} params.columns - Columns to analyze
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeData({ datasetId, analysisType, columns }) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ datasetId, analysisType, columns }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to analyze data');
  }

  return response.json();
}

/**
 * Generate chart data
 * @param {Object} params - Chart parameters
 * @param {string} params.datasetId - Dataset ID
 * @param {string} params.chartType - Type of chart (line, bar, pie, scatter)
 * @param {string} params.xAxis - X-axis column
 * @param {string} params.yAxis - Y-axis column
 * @returns {Promise<Object>} Chart data
 */
export async function generateChart({ datasetId, chartType, xAxis, yAxis }) {
  const response = await fetch(`${API_BASE}/chart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ datasetId, chartType, xAxis, yAxis }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to generate chart');
  }

  return response.json();
}

/**
 * Delete a dataset
 * @param {string} id - Dataset ID
 * @returns {Promise<void>}
 */
export async function deleteDataset(id) {
  const response = await fetch(`${API_BASE}/datasets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete dataset');
  }

  return response.json();
}

/**
 * Parse file content locally before uploading
 * @param {File} file - The file to parse
 * @returns {Promise<Object>} Parsed data with sheets
 */
export async function parseFileLocally(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileType = getFileType(file.name);
    
    reader.onload = async (e) => {
      try {
        let result = { sheets: [], type: fileType };
        
        if (fileType === 'xlsx' || fileType === 'csv') {
          const { default: XLSX } = await import('xlsx');
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
}

/**
 * Get file type from filename
 * @param {string} filename - The filename
 * @returns {string} The file type
 */
function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['xlsx', 'xls'].includes(ext)) return 'xlsx';
  if (ext === 'csv') return 'csv';
  if (ext === 'json') return 'json';
  if (['db', 'sqlite', 'sqlite3'].includes(ext)) return 'db';
  return 'csv';
}

export default {
  uploadData,
  getDatasets,
  getDataset,
  analyzeData,
  generateChart,
  deleteDataset,
  parseFileLocally,
};
