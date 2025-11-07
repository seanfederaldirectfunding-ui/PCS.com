"use client"

export interface User {
  id: string
  email: string
  username: string
  password: string
  phone: string
  role: "Master Admin" | "Admin" | "Manager" | "Agent" | "Tenant"
  tenantId: string
  createdAt: string
  lastLogin: string
  isActive: boolean
}

export interface AuthSession {
  userId: string
  email: string
  username: string
  role: string
  tenantId: string
  loginTime: string
}

const STORAGE_KEYS = {
  USERS: "page_crm_users",
  SESSION: "page_crm_session",
  RESET_CODES: "page_crm_reset_codes",
}

// Initialize with master admin account
const MASTER_ADMIN: User = {
  id: "master-admin-001",
  email: "sean.federaldirectfunding.@gmail.com",
  username: "demo",
  password: "demo123",
  phone: "2016404635",
  role: "Master Admin",
  tenantId: "master",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
}

class AuthService {
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private initialize() {
    if (this.initialized) return

    try {
      const users = this.getUsers()
      // Add master admin if not exists
      if (!users.find((u) => u.email === MASTER_ADMIN.email)) {
        users.push(MASTER_ADMIN)
        this.saveUsers(users)
      }
      this.initialized = true
      console.log("[v0] Auth service initialized successfully")
    } catch (error) {
      console.error("[v0] Auth initialization error:", error)
    }
  }

  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("[v0] Error reading users:", error)
      return []
    }
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    } catch (error) {
      console.error("[v0] Error saving users:", error)
      throw new Error("Failed to save user data")
    }
  }

  private getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("[v0] Error reading session:", error)
      return null
    }
  }

  private saveSession(session: AuthSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION)
      }
    } catch (error) {
      console.error("[v0] Error saving session:", error)
    }
  }

  // Login with email or username
  login(identifier: string, password: string): { success: boolean; user?: AuthSession; error?: string } {
    try {
      const users = this.getUsers()
      const user = users.find(
        (u) =>
          (u.email.toLowerCase() === identifier.toLowerCase() ||
            u.username.toLowerCase() === identifier.toLowerCase()) &&
          u.password === password &&
          u.isActive,
      )

      if (!user) {
        return { success: false, error: "Invalid credentials" }
      }

      // Update last login
      user.lastLogin = new Date().toISOString()
      this.saveUsers(users)

      // Create session
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
        loginTime: new Date().toISOString(),
      }

      this.saveSession(session)
      console.log("[v0] Login successful:", user.username)

      return { success: true, user: session }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  // Register new tenant user
  register(
    email: string,
    username: string,
    password: string,
    phone: string,
    role: "Admin" | "Manager" | "Agent" | "Tenant" = "Tenant",
  ): { success: boolean; user?: User; error?: string } {
    try {
      const users = this.getUsers()

      // Check if we've reached the 10,000 user limit
      if (users.length >= 10000) {
        return { success: false, error: "Maximum user limit reached (10,000 users)" }
      }

      // Check if email or username already exists
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Email already registered" }
      }

      if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, error: "Username already taken" }
      }

      // Validate password strength
      if (password.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" }
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        username,
        password,
        phone,
        role,
        tenantId: `tenant-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      }

      users.push(newUser)
      this.saveUsers(users)
      console.log("[v0] User registered successfully:", username)

      return { success: true, user: newUser }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  // Logout
  logout(): void {
    try {
      this.saveSession(null)
      console.log("[v0] Logout successful")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  // Get current session
  getCurrentSession(): AuthSession | null {
    return this.getSession()
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  // Request password reset code via phone
  requestPasswordReset(identifier: string): { success: boolean; phone?: string; error?: string } {
    try {
      const users = this.getUsers()
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === identifier.toLowerCase() ||
          u.username.toLowerCase() === identifier.toLowerCase() ||
          u.phone === identifier,
      )

      if (!user) {
        return { success: false, error: "User not found" }
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
      const resetCodes = this.getResetCodes()

      resetCodes[user.email] = {
        code: resetCode,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        phone: user.phone,
      }

      this.saveResetCodes(resetCodes)

      // In production, this would send SMS to user.phone
      console.log(`[v0] Reset code for ${user.phone}: ${resetCode}`)

      return {
        success: true,
        phone: user.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3"),
      }
    } catch (error) {
      console.error("[v0] Password reset request error:", error)
      return { success: false, error: "Failed to request password reset" }
    }
  }

  // Verify reset code and reset password
  resetPassword(identifier: string, code: string, newPassword: string): { success: boolean; error?: string } {
    try {
      const users = this.getUsers()
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase(),
      )

      if (!user) {
        return { success: false, error: "User not found" }
      }

      const resetCodes = this.getResetCodes()
      const resetData = resetCodes[user.email]

      if (!resetData) {
        return { success: false, error: "No reset code requested" }
      }

      if (Date.now() > resetData.expiresAt) {
        delete resetCodes[user.email]
        this.saveResetCodes(resetCodes)
        return { success: false, error: "Reset code expired" }
      }

      if (resetData.code !== code) {
        return { success: false, error: "Invalid reset code" }
      }

      // Validate new password
      if (newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" }
      }

      // Update password
      user.password = newPassword
      this.saveUsers(users)

      // Clear reset code
      delete resetCodes[user.email]
      this.saveResetCodes(resetCodes)

      console.log("[v0] Password reset successful for:", user.username)

      return { success: true }
    } catch (error) {
      console.error("[v0] Password reset error:", error)
      return { success: false, error: "Failed to reset password" }
    }
  }

  private getResetCodes(): Record<string, { code: string; expiresAt: number; phone: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESET_CODES)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("[v0] Error reading reset codes:", error)
      return {}
    }
  }

  private saveResetCodes(codes: Record<string, { code: string; expiresAt: number; phone: string }>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESET_CODES, JSON.stringify(codes))
    } catch (error) {
      console.error("[v0] Error saving reset codes:", error)
    }
  }

  // Get all users (admin only)
  getAllUsers(): User[] {
    return this.getUsers()
  }

  // Get user count
  getUserCount(): number {
    return this.getUsers().length
  }

  // Update user
  updateUser(userId: string, updates: Partial<User>): { success: boolean; error?: string } {
    try {
      const users = this.getUsers()
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        return { success: false, error: "User not found" }
      }

      users[userIndex] = { ...users[userIndex], ...updates }
      this.saveUsers(users)

      return { success: true }
    } catch (error) {
      console.error("[v0] Update user error:", error)
      return { success: false, error: "Failed to update user" }
    }
  }

  // Deactivate user
  deactivateUser(userId: string): { success: boolean; error?: string } {
    return this.updateUser(userId, { isActive: false })
  }
}

// Export singleton instance
export const authService = new AuthService()
