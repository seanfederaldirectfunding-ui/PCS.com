"use client"

export interface User {
  id: string
  email: string
  username: string
  phone?: string
  role: "Master Admin" | "Admin" | "Manager" | "Agent" | "Tenant"
  tenantId: string
  createdAt?: string
  lastLogin?: string
  isActive?: boolean
}

export interface AuthSession {
  userId: string
  email: string
  username: string
  role: string
  tenantId: string
  loginTime: string
}

class AuthService {
  private sessionCache: AuthSession | null = null

  // Login with email or username
  async login(identifier: string, password: string): Promise<{ success: boolean; user?: AuthSession; error?: string }> {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Create session from response
      const session: AuthSession = {
        userId: data.user.id,
        email: data.user.email,
        username: data.user.username,
        role: data.user.role,
        tenantId: data.user.tenantId,
        loginTime: new Date().toISOString(),
      }

      this.sessionCache = session
      console.log("[AuthService] Login successful:", session.username)

      return { success: true, user: session }
    } catch (error) {
      console.error("[AuthService] Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  // Register new tenant user
  async register(
    email: string,
    username: string,
    password: string,
    phone: string,
    role: "Admin" | "Manager" | "Agent" | "Tenant" = "Tenant",
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, phone, role }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' }
      }

      console.log("[AuthService] User registered successfully:", username)
      return { success: true, user: data.user }
    } catch (error) {
      console.error("[AuthService] Registration error:", error)
      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      this.sessionCache = null
      console.log("[AuthService] Logout successful")
    } catch (error) {
      console.error("[AuthService] Logout error:", error)
    }
  }

  // Get current session
  async getCurrentSession(): Promise<AuthSession | null> {
    if (this.sessionCache) {
      return this.sessionCache
    }

    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.success && data.authenticated) {
        this.sessionCache = {
          userId: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
          tenantId: data.user.tenantId,
          loginTime: new Date().toISOString(),
        }
        return this.sessionCache
      }

      return null
    } catch (error) {
      console.error("[AuthService] Get session error:", error)
      return null
    }
  }

  // Check if user is logged in
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return session !== null
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (data.success) {
        return data.users || []
      }

      return []
    } catch (error) {
      console.error("[AuthService] Error fetching users:", error)
      return []
    }
  }

  // Get user count
  async getUserCount(): Promise<number> {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (data.success) {
        return data.count || 0
      }

      return 0
    } catch (error) {
      console.error("[AuthService] Error getting user count:", error)
      return 0
    }
  }

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Update failed' }
      }

      return { success: true }
    } catch (error) {
      console.error("[AuthService] Update user error:", error)
      return { success: false, error: "Failed to update user" }
    }
  }

  // Deactivate user
  async deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateUser(userId, { isActive: false })
  }

  // Delete user
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Delete failed' }
      }

      return { success: true }
    } catch (error) {
      console.error("[AuthService] Delete user error:", error)
      return { success: false, error: "Failed to delete user" }
    }
  }

  // Password reset methods (kept for compatibility, will need to implement reset API endpoints later)
  requestPasswordReset(identifier: string): { success: boolean; phone?: string; error?: string } {
    console.warn("[AuthService] Password reset not yet implemented with API")
    return { success: false, error: "Password reset not yet implemented" }
  }

  resetPassword(identifier: string, code: string, newPassword: string): { success: boolean; error?: string } {
    console.warn("[AuthService] Password reset not yet implemented with API")
    return { success: false, error: "Password reset not yet implemented" }
  }
}

// Export singleton instance
export const authService = new AuthService()
