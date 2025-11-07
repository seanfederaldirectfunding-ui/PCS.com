"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyRound, AlertCircle, CheckCircle, Phone } from "lucide-react"
import { authService } from "@/lib/auth-service"

interface PasswordResetFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PasswordResetForm({ onSuccess, onCancel }: PasswordResetFormProps) {
  const [step, setStep] = useState<"request" | "verify">("request")
  const [identifier, setIdentifier] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = authService.requestPasswordReset(identifier)

      if (result.success && result.phone) {
        console.log("[v0] Reset code requested")
        setPhone(result.phone)
        setStep("verify")
      } else {
        setError(result.error || "Failed to request reset code")
      }
    } catch (err) {
      console.error("[v0] Reset request error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      const result = authService.resetPassword(identifier, resetCode, newPassword)

      if (result.success) {
        console.log("[v0] Password reset successful")
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(result.error || "Failed to reset password")
      }
    } catch (err) {
      console.error("[v0] Password reset error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (step === "request") {
    return (
      <form onSubmit={handleRequestReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-white">
            Email, Username, or Phone
          </Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your email, username, or phone"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            required
            disabled={loading}
          />
          <p className="text-xs text-white/60">We'll send a verification code to your registered phone number</p>
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
          <Phone className="mr-2 h-4 w-4" />
          {loading ? "Sending code..." : "Send Reset Code"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            disabled={loading}
          >
            Back to sign in
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyAndReset} className="space-y-4">
      <Alert className="bg-cyan-500/10 border-cyan-400/30">
        <Phone className="h-4 w-4 text-cyan-400" />
        <AlertDescription className="text-cyan-400 text-sm">A 6-digit code has been sent to {phone}</AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="resetCode" className="text-white">
          Verification Code
        </Label>
        <Input
          id="resetCode"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          maxLength={6}
          required
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-white">
          New Password
        </Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          required
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white">
          Confirm New Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
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
            Password reset successfully! Redirecting to sign in...
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={loading || success}
      >
        <KeyRound className="mr-2 h-4 w-4" />
        {loading ? "Resetting password..." : "Reset Password"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep("request")}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          disabled={loading || success}
        >
          Didn't receive code? Try again
        </button>
      </div>
    </form>
  )
}
