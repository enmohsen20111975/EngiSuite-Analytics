import { api } from './apiClient';

/**
 * Blog Service
 * Handles all blog-related API calls
 * Uses the /api/posts endpoint from social_posts router
 */
export const blogService = {
  /**
   * Get all posts
   */
  async getAllPosts(params = {}) {
    const response = await api.get('/api/posts', { params });
    return response.data;
  },
  
  /**
   * Get post by ID
   */
  async getPostById(postId) {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  },
  
  /**
   * Get post by slug (uses ID for now)
   */
  async getPostBySlug(slug) {
    // The backend uses numeric IDs, try to fetch by ID
    const response = await api.get(`/api/posts/${slug}`);
    return response.data;
  },
  
  /**
   * Get posts by category
   * Note: Backend doesn't have category filtering, returns all posts
   */
  async getPostsByCategory(category) {
    const response = await api.get('/api/posts', { params: { category } });
    return response.data;
  },
  
  /**
   * Get featured posts
   * Returns recent posts as "featured"
   */
  async getFeaturedPosts() {
    const response = await api.get('/api/posts', { params: { limit: 5 } });
    return response.data;
  },
  
  /**
   * Search posts
   * Note: Client-side filtering for now
   */
  async searchPosts(query) {
    const response = await api.get('/api/posts', { params: { search: query } });
    return response.data;
  },
  
  /**
   * Get categories
   * Returns engineering categories for blog
   */
  async getCategories() {
    // Return default engineering categories
    return [
      { id: 'all', name: 'All Posts', slug: 'all' },
      { id: 'electrical', name: 'Electrical Engineering', slug: 'electrical' },
      { id: 'mechanical', name: 'Mechanical Engineering', slug: 'mechanical' },
      { id: 'civil', name: 'Civil Engineering', slug: 'civil' },
      { id: 'updates', name: 'Product Updates', slug: 'updates' },
      { id: 'tutorials', name: 'Tutorials', slug: 'tutorials' },
    ];
  },
  
  /**
   * Add comment
   */
  async addComment(postId, content) {
    const response = await api.post(`/api/page-comments`, {
      page_type: 'blog',
      page_id: postId,
      content
    });
    return response.data;
  },
  
  /**
   * Get comments
   */
  async getComments(postId) {
    const response = await api.get(`/api/page-comments`, {
      params: { page_type: 'blog', page_id: postId }
    });
    return response.data;
  },
};

export default blogService;
