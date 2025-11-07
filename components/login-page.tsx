"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const demoAccounts = [
  {
    name: "Sarah Williams",
    email: "manager@pcs-pcrm.com",
    role: "Manager",
    initials: "SW",
    username: "manager",
    password: "manager123",
    badge: "Full Access",
    color: "bg-blue-500",
  },
  {
    name: "John Smith",
    email: "agent1@pcs-pcrm.com",
    role: "Agent",
    initials: "JS",
    username: "agent1",
    password: "agent123",
    badge: "45 Leads",
    color: "bg-teal-500",
  },
  {
    name: "Emily Johnson",
    email: "agent2@pcs-pcrm.com",
    role: "Agent",
    initials: "EJ",
    username: "agent2",
    password: "agent123",
    badge: "38 Leads",
    color: "bg-cyan-500",
  },
  {
    name: "Michael Davis",
    email: "agent3@pcs-pcrm.com",
    role: "Agent",
    initials: "MD",
    username: "agent3",
    password: "agent123",
    badge: "52 Leads",
    color: "bg-indigo-500",
  },
]

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const account = demoAccounts.find((acc) => acc.username === username && acc.password === password)
    if (account) {
      localStorage.setItem("user", JSON.stringify(account))
      router.push("/dashboard")
    }
  }

  const handleDemoLogin = (account: (typeof demoAccounts)[0]) => {
    localStorage.setItem("user", JSON.stringify(account))
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">PAGE CRM</h1>
            <p className="text-lg text-slate-600">Multi-Channel Lead Generation & Follow-up System</p>
          </div>

          <Card className="shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Demo Accounts */}
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Demo Accounts</h2>
          <p className="text-slate-600 mb-6">Click to login with demo credentials</p>

          <div className="space-y-4">
            {demoAccounts.map((account) => (
              <Card
                key={account.username}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-slate-200"
                onClick={() => handleDemoLogin(account)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className={`h-12 w-12 ${account.color}`}>
                      <AvatarFallback className="text-white font-semibold">{account.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{account.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {account.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{account.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Username: <span className="font-mono font-semibold">{account.username}</span> • Password:{" "}
                        <span className="font-mono font-semibold">{account.password}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Access Info */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👑</span> Manager Access
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 text-slate-700">
                <p>✅ View all leads and campaigns</p>
                <p>✅ Assign leads to agents</p>
                <p>✅ Manage team members</p>
                <p>✅ Access full analytics</p>
                <p>✅ Configure system settings</p>
                <p>✅ Export data & reports</p>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-teal-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👤</span> Agent Access
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 text-slate-700">
                <p>✅ View assigned leads only</p>
                <p>✅ Make calls via VoIP</p>
                <p>✅ Send SMS messages</p>
                <p>✅ Update lead status</p>
                <p>✅ Add notes and activities</p>
                <p>✅ Track personal performance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
