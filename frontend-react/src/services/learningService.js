import { api } from './apiClient';

/**
 * Learning Management System Service
 * Connects to the backend learning API
 */
export const learningService = {
  /**
   * Get all engineering disciplines
   */
  async getDisciplines() {
    const response = await api.get('/learning/disciplines');
    return response.data;
  },

  /**
   * Get a specific discipline by key
   */
  async getDiscipline(disciplineKey) {
    const response = await api.get(`/learning/disciplines/${disciplineKey}`);
    return response.data;
  },

  /**
   * Get chapters for a discipline
   */
  async getChapters(disciplineKey) {
    const response = await api.get(`/learning/chapters/${disciplineKey}`);
    return response.data;
  },

  /**
   * Get lessons for a chapter
   */
  async getLessons(chapterId) {
    const response = await api.get(`/learning/lessons/${chapterId}`);
    return response.data;
  },

  /**
   * Get a specific lesson with full content
   */
  async getLesson(lessonId) {
    const response = await api.get(`/learning/lesson/${lessonId}`);
    return response.data;
  },

  /**
   * Get simulation details
   */
  async getSimulation(simulationId) {
    const response = await api.get(`/learning/simulation/${simulationId}`);
    return response.data;
  },

  /**
   * Submit quiz answers
   */
  async submitQuiz(lessonId, answers) {
    const response = await api.post('/learning/quiz/submit', {
      lessonId,
      answers
    });
    return response.data;
  },

  /**
   * Search lessons
   */
  async searchLessons(query) {
    const response = await api.get('/learning/search', { q: query });
    return response.data;
  },
};

export default learningService;
