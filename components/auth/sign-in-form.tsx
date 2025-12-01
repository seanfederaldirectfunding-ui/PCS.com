"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, AlertCircle } from "lucide-react"
import { authAPI } from "@/lib/api-service"

interface SignInFormProps {
  onSuccess: (username: string, role: string) => void
  onSwitchToSignUp: () => void
  onSwitchToReset: () => void
}

export function SignInForm({ onSuccess, onSwitchToSignUp, onSwitchToReset }: SignInFormProps) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // ✅ Now using Express backend
      const response = await authAPI.login({ identifier, password })

      if (response.data.success && response.data.user) {
        console.log("[Express] Sign in successful")
        
        // Store user data in localStorage
        localStorage.setItem('page_user', JSON.stringify(response.data.user))
        localStorage.setItem('page_userId', response.data.user.userId)
        
        onSuccess(response.data.user.username, response.data.user.role)
      } else {
        setError(response.data.error || "Login failed")
      }
    } catch (error: any) {
      console.error("[Express] Sign in error:", error)
      setError(error.response?.data?.error || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-white">
          Email or Username
        </Label>
        <Input
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter email or username"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <button
            type="button"
            onClick={onSwitchToReset}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <Alert className="bg-red-500/10 border-red-400/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={loading}
      >
        <LogIn className="mr-2 h-4 w-4" />
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  )
}