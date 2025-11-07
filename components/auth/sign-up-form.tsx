"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react"
import { authService } from "@/lib/auth-service"

interface SignUpFormProps {
  onSuccess: () => void
  onSwitchToSignIn: () => void
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      // Validate phone format
      const phoneRegex = /^\d{10}$/
      const cleanPhone = phone.replace(/\D/g, "")
      if (!phoneRegex.test(cleanPhone)) {
        setError("Phone must be 10 digits")
        setLoading(false)
        return
      }

      const result = authService.register(email, username, password, cleanPhone)

      if (result.success) {
        console.log("[v0] Registration successful")
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      console.error("[v0] Sign up error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const userCount = authService.getUserCount()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="text-white">
          Username
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="2016404635"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading || success}
        />
        <p className="text-xs text-white/60">Used for password reset verification</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading || success}
        />
      </div>

      {error && (
        <Alert className="bg-red-500/10 border-red-400/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-400/30">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400 text-sm">
            Account created successfully! Redirecting to sign in...
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={loading || success}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          disabled={loading || success}
        >
          Already have an account? Sign in
        </button>
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/60 text-center">Tenant Accounts: {userCount} / 10,000</p>
      </div>
    </form>
  )
}
