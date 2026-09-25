import { api } from './apiClient';

/**
 * AI Service
 * Handles all AI assistant-related API calls
 */
export const aiService = {
  /**
   * Send chat message
   */
  async sendMessage(message, context = {}) {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  },
  
  /**
   * Get chat history
   */
  async getChatHistory(sessionId) {
    const response = await api.get(`/ai/chat/${sessionId}/history`);
    return response.data;
  },
  
  /**
   * Get suggestions
   */
  async getSuggestions(context) {
    const response = await api.post('/ai/suggestions', { context });
    return response.data;
  },
  
  /**
   * Analyze calculation
   */
  async analyzeCalculation(calculationData) {
    const response = await api.post('/ai/analyze', calculationData);
    return response.data;
  },
  
  /**
   * Generate report
   */
  async generateReport(data) {
    const response = await api.post('/ai/generate-report', data);
    return response.data;
  },
  
  /**
   * Get AI capabilities
   */
  async getCapabilities() {
    const response = await api.get('/ai/capabilities');
    return response.data;
  },
  
  /**
   * Stream chat response
   */
  async streamMessage(message, onChunk, context = {}) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ message, context }),
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  },
};

export default aiService;
