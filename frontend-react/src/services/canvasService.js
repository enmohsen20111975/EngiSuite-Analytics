/**
 * Canvas Service
 * API client for canvas state management
 */
import api from './apiClient';

const BASE_URL = '/canvas';

/**
 * Canvas API Service
 */
export const canvasService = {
  /**
   * Create a new canvas
   * @param {Object} data - Canvas creation data
   * @returns {Promise<Object>} Created canvas
   */
  async create(data) {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  /**
   * List user's canvases
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of canvases
   */
  async list(params = {}) {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get a specific canvas
   * @param {number} id - Canvas ID
   * @returns {Promise<Object>} Canvas data
   */
  async get(id) {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Update a canvas
   * @param {number} id - Canvas ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated canvas
   */
  async update(id, data) {
    const response = await api.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a canvas
   * @param {number} id - Canvas ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await api.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Duplicate a canvas
   * @param {number} id - Canvas ID to duplicate
   * @returns {Promise<Object>} Duplicated canvas
   */
  async duplicate(id) {
    const response = await api.post(`${BASE_URL}/${id}/duplicate`);
    return response.data;
  },

  /**
   * Export a canvas
   * @param {number} id - Canvas ID
   * @param {string} format - Export format (json, svg, png)
   * @returns {Promise<Object>} Export data
   */
  async export(id, format = 'json') {
    const response = await api.post(`${BASE_URL}/export`, { canvas_id: id, format });
    return response.data;
  },

  /**
   * Get canvas templates
   * @param {string} type - Template type filter
   * @returns {Promise<Array>} List of templates
   */
  async getTemplates(type = null) {
    const params = type ? { type } : {};
    const response = await api.get(`${BASE_URL}/templates/list`, { params });
    return response.data;
  },

  /**
   * Save canvas state
   * @param {number} id - Canvas ID
   * @param {Object} state - Canvas state
   * @param {string} thumbnail - Optional base64 thumbnail
   * @returns {Promise<Object>} Updated canvas
   */
  async saveState(id, state, thumbnail = null) {
    return this.update(id, { state, thumbnail });
  },

  /**
   * Auto-save canvas (debounced)
   * @param {Function} saveFn - Save function
   * @param {number} delay - Debounce delay in ms
   * @returns {Function} Debounced save function
   */
  createAutoSave(saveFn, delay = 2000) {
    let timeoutId = null;
    
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        saveFn(...args);
        timeoutId = null;
      }, delay);
    };
  }
};

export default canvasService;
