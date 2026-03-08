import { api } from './apiClient';

/**
 * Learning Management System Service
 * Connects to the backend learning API
 * Based on https://github.com/enmohsen20111975/courses-for-my-app-
 */
export const learningService = {
  /**
   * Get all courses (new API)
   */
  async getCourses() {
    const response = await api.get('/learning/courses');
    return response.data;
  },

  /**
   * Get a specific course by ID with modules
   */
  async getCourse(courseId) {
    const response = await api.get(`/learning/courses/${courseId}`);
    return response.data;
  },

  /**
   * Get modules for a course
   */
  async getModules(courseId) {
    const response = await api.get(`/learning/modules/${courseId}`);
    return response.data;
  },

  /**
   * Get chapters for a module
   */
  async getChaptersByModule(moduleId) {
    const response = await api.get(`/learning/chapters/module/${moduleId}`);
    return response.data;
  },

  /**
   * Get lessons for a chapter
   */
  async getLessonsByChapter(chapterId) {
    const response = await api.get(`/learning/lessons/chapter/${chapterId}`);
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
   * Get quiz for a lesson
   */
  async getQuiz(lessonId) {
    const response = await api.get(`/learning/quiz/${lessonId}`);
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
    const response = await api.get('/learning/search', { params: { q: query } });
    return response.data;
  },

  // ==========================================
  // LEGACY COMPATIBILITY METHODS
  // These maintain backward compatibility with existing frontend
  // ==========================================

  /**
   * Get all engineering disciplines (legacy - maps to courses)
   */
  async getDisciplines() {
    const response = await api.get('/learning/disciplines');
    return response.data;
  },

  /**
   * Get a specific discipline by key (legacy - maps to course)
   */
  async getDiscipline(disciplineKey) {
    const response = await api.get(`/learning/disciplines/${disciplineKey}`);
    return response.data;
  },

  /**
   * Get chapters for a discipline (legacy - maps to modules)
   */
  async getChapters(disciplineKey) {
    const response = await api.get(`/learning/chapters/${disciplineKey}`);
    return response.data;
  },

  /**
   * Get lessons for a chapter (legacy)
   */
  async getLessons(chapterId) {
    const response = await api.get(`/learning/lessons/${chapterId}`);
    return response.data;
  },

  /**
   * Get simulation details (placeholder)
   */
  async getSimulation(simulationId) {
    // Simulations are now embedded in lesson content
    return { id: simulationId };
  },

  /**
   * Get user progress (placeholder - uses localStorage)
   */
  async getUserProgress() {
    return null;
  },

  /**
   * Update lesson progress (placeholder - uses localStorage)
   */
  async updateLessonProgress(lessonId, progress) {
    return { success: true };
  },
};

export default learningService;
