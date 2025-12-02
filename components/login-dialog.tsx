"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { PasswordResetForm } from "@/components/auth/password-reset-form"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (username: string, role: string) => void
}

type AuthView = "signin" | "signup" | "reset"

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [view, setView] = useState<AuthView>("signin")

  const handleLoginSuccess = (username: string, role: string) => {
    onLogin(username, role)
    onOpenChange(false)
    setView("signin")
  }

  const handleSignUpSuccess = () => {
    setView("signin")
  }

  const handleResetSuccess = () => {
    setView("signin")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {view === "signin" && "PAGE CRM Sign In"}
            {view === "signup" && "Create Your Account"}
            {view === "reset" && "Reset Password"}
          </DialogTitle>
          <DialogDescription className="text-center text-white/60">
            {view === "signin" && "Enter your credentials to access the system"}
            {view === "signup" && "Join PAGE CRM with up to 10,000 tenant accounts"}
            {view === "reset" && "Reset your password via phone verification"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {view === "signin" && (
            <SignInForm
              onSuccess={handleLoginSuccess}
              onSwitchToSignUp={() => setView("signup")}
              onSwitchToReset={() => setView("reset")}
            />
          )}
          {view === "signup" && (
            <SignUpForm onSuccess={handleSignUpSuccess} onSwitchToSignIn={() => setView("signin")} />
          )}
          {view === "reset" && <PasswordResetForm onSuccess={handleResetSuccess} onCancel={() => setView("signin")} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
