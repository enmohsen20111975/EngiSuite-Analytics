// Authentication Service - Google OAuth + Email/Password
class AuthService {
    constructor() {
        this.baseUrl = '';
        this.user = null;
    }

    getToken() {
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
    }

    setToken(token) {
        localStorage.setItem('token', token);
        document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=lax`;
    }

    removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'access_token=; path=/; max-age=0; SameSite=lax';
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    loginWithGoogle(redirect = null) {
        const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
        window.location.href = `${this.baseUrl}/auth/google/login${redirectParam}`;
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();

            if (data.access_token) {
                this.setToken(data.access_token);
            }

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                this.user = data.user;
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(email, password, name) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            const data = await response.json();

            if (data.access_token) {
                this.setToken(data.access_token);
            }

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                this.user = data.user;
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await fetch(`${this.baseUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
        } catch (e) {
            // Continue with client-side cleanup even if server call fails
        }
        this.removeToken();
        window.location.href = 'login.html';
    }

    async getCurrentUser() {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                this.removeToken();
                return null;
            }

            const user = await response.json();
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/auth/check`, {
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Auth check error:', error);
            return { authenticated: false };
        }
    }

    async getUserProfile() {
        return this.getCurrentUser();
    }

    async updateProfile(data) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Profile update failed');
            }

            const user = await response.json();
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }

    async updatePreferences(preferences) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Preferences update failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Preferences update error:', error);
            throw error;
        }
    }

    getStoredUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

// Initialize authentication service
window.AuthService = AuthService;
const authService = new AuthService();
window.authService = authService;
