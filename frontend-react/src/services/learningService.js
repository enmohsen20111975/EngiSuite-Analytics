import { api } from './apiClient';

const MODULE_UNAVAILABLE = 404;

function isModuleUnavailable(err) {
  const status = err?.response?.status;
  const code = err?.response?.data?.error?.code;
  return status === MODULE_UNAVAILABLE || code === 'MODULE_FROZEN' || code === 'NOT_FOUND';
}

async function learningGet(path, fallback = [], config) {
  try {
    const response = await api.get(path, config);
    return response.data;
  } catch (err) {
    if (isModuleUnavailable(err)) return fallback;
    throw err;
  }
}

async function learningPost(path, payload, fallback = null) {
  try {
    const response = await api.post(path, payload);
    return response.data;
  } catch (err) {
    if (isModuleUnavailable(err)) return fallback;
    throw err;
  }
}

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
    return learningGet('/learning/courses', []);
  },

  /**
   * Get a specific course by ID with modules
   */
  async getCourse(courseId) {
    return learningGet(`/learning/courses/${courseId}`, null);
  },

  /**
   * Get modules for a course
   */
  async getModules(courseId) {
    return learningGet(`/learning/modules/${courseId}`, []);
  },

  /**
   * Get chapters for a module
   */
  async getChaptersByModule(moduleId) {
    return learningGet(`/learning/chapters/module/${moduleId}`, []);
  },

  /**
   * Get lessons for a chapter
   */
  async getLessonsByChapter(chapterId) {
    return learningGet(`/learning/lessons/chapter/${chapterId}`, []);
  },

  /**
   * Get a specific lesson with full content
   */
  async getLesson(lessonId) {
    return learningGet(`/learning/lesson/${lessonId}`, null);
  },

  /**
   * Get quiz for a lesson
   */
  async getQuiz(lessonId) {
    return learningGet(`/learning/quiz/${lessonId}`, null);
  },

  /**
   * Submit quiz answers
   */
  async submitQuiz(lessonId, answers) {
    return learningPost('/learning/quiz/submit', { lessonId, answers }, null);
  },

  /**
   * Search lessons
   */
  async searchLessons(query) {
    return learningGet('/learning/search', [], { params: { q: query } });
  },

  // ==========================================
  // LEGACY COMPATIBILITY METHODS
  // These maintain backward compatibility with existing frontend
  // ==========================================

  /**
   * Get all engineering disciplines (legacy - maps to courses)
   */
  async getDisciplines() {
    return learningGet('/learning/disciplines', []);
  },

  /**
   * Get a specific discipline by key (legacy - maps to course)
   */
  async getDiscipline(disciplineKey) {
    return learningGet(`/learning/disciplines/${disciplineKey}`, null);
  },

  /**
   * Get chapters for a discipline (legacy - maps to modules)
   */
  async getChapters(disciplineKey) {
    return learningGet(`/learning/chapters/${disciplineKey}`, []);
  },

  /**
   * Get lessons for a chapter (legacy)
   */
  async getLessons(chapterId) {
    return learningGet(`/learning/lessons/${chapterId}`, []);
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
