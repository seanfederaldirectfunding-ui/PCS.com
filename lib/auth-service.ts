import { authAPI } from './api-service';

export interface User {
  userId: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    if (typeof window === 'undefined') return;
    
    const userStr = localStorage.getItem('page_user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearStorage();
      }
    }
  }

  private clearStorage() {
    localStorage.removeItem('page_user');
    localStorage.removeItem('page_userId');
    this.currentUser = null;
  }

  // ✅ These methods now just check localStorage since API calls happen in components
  async register(email: string, username: string, password: string, phone: string): Promise<AuthResponse> {
    // This is now handled by the component directly calling authAPI
    return { success: false, error: 'Use authAPI.register directly' };
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    // This is now handled by the component directly calling authAPI
    return { success: false, error: 'Use authAPI.login directly' };
  }

  logout() {
    this.clearStorage();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Simple user count for demo
  getUserCount(): number {
    return Math.floor(Math.random() * 100) + 50; // Mock count
  }

  getCurrentSession() {
    const user = this.getCurrentUser();
    if (!user) return null;

    return {
      username: user.username,
      role: user.role
    };
  }
}

export const authService = new AuthService();