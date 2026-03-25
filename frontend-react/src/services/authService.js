import apiClient from './apiClient';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const USE_SERVER_REDIRECT_OAUTH = false; // Set to false to use Google Identity Services (server-side route not implemented)

/**
 * Authentication service
 * Handles login, register, OAuth, and session management
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data.data || response.data; // Backend returns nested data
    
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Also set cookie for cross-page auth
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=lax`;
    
    return { user, token };
  },

  /**
   * Register new user
   */
  async register(email, password, fullName) {
    const response = await apiClient.post('/auth/register', { 
      email, 
      password, 
      name: fullName 
    });
    const { token, user } = response.data.data || response.data; // Backend returns nested data
    
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Also set cookie for cross-page auth
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=lax`;
    
    return { user, token };
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear cookie
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=lax';
    }
  },

  /**
   * Get current user from API
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data) {
    const response = await apiClient.put('/auth/profile', data);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  /**
   * Login with Google - Server-side redirect (like old frontend)
   * This redirects to backend which handles the full OAuth flow
   * IMPORTANT: Must go directly to backend (not through Vite proxy)
   * to ensure cookies are set correctly for the OAuth callback
   */
  loginWithGoogle(redirect = null) {
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    // Go directly to backend to ensure cookie domain matches for OAuth callback
    const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    window.location.href = `${backendUrl}/auth/google/login${redirectParam}`;
  },

  /**
   * Initialize Google OAuth (for GIS client-side flow)
   */
  initGoogleAuth() {
    return new Promise((resolve, reject) => {
      // Check if Google script is already loaded
      if (window.google) {
        resolve(window.google);
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
      document.head.appendChild(script);
    });
  },

  /**
   * Sign in with Google (using OAuth 2.0 popup flow)
   */
  async signInWithGoogle() {
    // Use server-side redirect if configured
    if (USE_SERVER_REDIRECT_OAUTH) {
      this.loginWithGoogle(window.location.pathname);
      return; // Will redirect, so no return value needed
    }
    
    // Check if Google Client ID is configured for client-side flow
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-google-client-id')) {
      throw new Error('Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend-react/.env');
    }
    
    // Use direct OAuth 2.0 popup flow (more reliable than One Tap)
    return this.signInWithGooglePopup();
  },

  /**
   * Sign in with Google using popup (fallback method)
   */
  async signInWithGooglePopup(google) {
    return new Promise((resolve, reject) => {
      // Create a unique state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'email profile';
      
      // Build OAuth URL
      const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      oauthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      oauthUrl.searchParams.set('redirect_uri', redirectUri);
      oauthUrl.searchParams.set('response_type', 'token id_token');
      oauthUrl.searchParams.set('scope', scope);
      oauthUrl.searchParams.set('state', state);
      oauthUrl.searchParams.set('prompt', 'select_account');
      
      // Open popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        oauthUrl.toString(),
        'GoogleSignIn',
        `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
      );
      
      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for Google Sign-In.'));
        return;
      }
      
      // Listen for messages from popup
      const messageHandler = async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          try {
            // Send credential to backend
            const result = await apiClient.post('/auth/google', {
              idToken: event.data.idToken,
            });
            
            const { token, user } = result.data.data || result.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=lax`;
            
            resolve({ user, token });
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Google authentication failed'));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Sign-in was cancelled'));
        }
      }, 500);
    });
  },

  /**
   * Render Google Sign-In button (for GIS client-side flow)
   */
  async renderGoogleButton(elementId, options = {}) {
    // Use server-side redirect if configured
    if (USE_SERVER_REDIRECT_OAUTH) {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('click', () => this.loginWithGoogle(window.location.pathname));
      }
      return;
    }
    
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-google-client-id')) {
      options.onError?.(new Error('Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend-react/.env'));
      return;
    }
    
    try {
      const google = await this.initGoogleAuth();
      
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response.credential && options.onSuccess) {
            try {
              const result = await apiClient.post('/auth/google', {
                idToken: response.credential,
              });
              
              const { token, user } = result.data.data || result.data;
              
              // Store token
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=lax`;
              
              options.onSuccess({ user, token });
            } catch (error) {
              options.onError?.(error);
            }
          }
        },
      });

      google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: options.theme || 'outline',
          size: options.size || 'large',
          width: options.width,
          text: options.text || 'signin_with',
          shape: options.shape || 'rectangular',
        }
      );
    } catch (error) {
      console.error('Error rendering Google button:', error);
      options.onError?.(error);
    }
  },

  /**
   * Check if Google OAuth is available (checks both server-side and client-side)
   */
  isGoogleOAuthConfigured() {
    // Server-side redirect is always available if enabled
    if (USE_SERVER_REDIRECT_OAUTH) {
      return true;
    }
    // Otherwise check if client-side is configured
    return this.isGoogleClientSideConfigured();
  },

  /**
   * Check if Google Client ID is configured for client-side flow
   */
  isGoogleClientSideConfigured() {
    return GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('your-google-client-id');
  },

  /**
   * Get stored user
   */
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Get stored token (from localStorage or cookie)
   */
  getStoredToken() {
    // Get token from localStorage first
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken) {
      return localStorageToken;
    }

    // Fallback to getting token from cookie (set by Google OAuth callback)
    const name = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        const token = c.substring(name.length, c.length);
        // Save to localStorage for future use
        localStorage.setItem('token', token);
        return token;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getStoredToken();
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    const { token } = response.data.data || response.data;
    localStorage.setItem('token', token);
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=lax`;
    return token;
  },

  /**
   * Delete account
   */
  async deleteAccount(password) {
    const response = await apiClient.delete('/auth/account', {
      data: { password },
    });
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=lax';
    
    return response.data;
  },
};

export default authService;
