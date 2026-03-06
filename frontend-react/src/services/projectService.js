import { api } from './apiClient';

export const projectService = {
  async getTemplates() {
    const response = await api.get('/projects/templates');
    return response.data;
  },

  async getProjects() {
    const response = await api.get('/projects/');
    return response.data;
  },

  async createProject(data) {
    const response = await api.post('/projects/', data);
    return response.data;
  },

  async getProject(projectId) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  async getTasks(projectId) {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  async getKanban(projectId) {
    const response = await api.get(`/projects/${projectId}/kanban`);
    return response.data;
  },

  async createTask(projectId, data) {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  async updateTask(taskId, data) {
    const response = await api.patch(`/projects/tasks/${taskId}`, data);
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.post(`/projects/tasks/${taskId}/status`, { status });
    return response.data;
  },

  async updateProject(projectId, data) {
    const response = await api.patch(`/projects/${projectId}`, data);
    return response.data;
  },

  async deleteProject(projectId) {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  async getDashboardWidgets() {
    const response = await api.get('/projects/dashboard/widgets');
    return response.data;
  },
};

export default projectService;
