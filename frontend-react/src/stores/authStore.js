import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

/**
 * Auth store with Zustand
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      /**
       * Initialize auth state from storage
       */
      init: () => {
        const user = authService.getStoredUser();
        const token = authService.getStoredToken();
        set({
          user,
          token,
          isAuthenticated: !!token,
        });
      },
      
      /**
       * Login action
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.login(email, password);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.detail || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },
      
      /**
       * Register action
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(userData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.detail || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },
      
      /**
       * Logout action
       */
      logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
      
      /**
       * Update user profile
       */
      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.updateProfile(userData);
          set({ user, isLoading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.detail || 'Update failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },
      
      /**
       * Clear error
       */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
