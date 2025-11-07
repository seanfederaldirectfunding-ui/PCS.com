"use client"

import { useState, useEffect } from "react"
import { DialerHomeScreen } from "@/components/dialer-home-screen"
import { CRMDashboard } from "@/components/crm-dashboard"
import { BackOffice } from "@/components/back-office"
import { LeadGenerator } from "@/components/lead-generator"
import { GrantProcessing } from "@/components/grant-processing"
import { Applications } from "@/components/applications"
import { Pricing } from "@/components/pricing"
import { LoginDialog } from "@/components/login-dialog"
import { GeniusAssistant } from "@/components/genius-assistant"
import { SystemSettings } from "@/components/system-settings"
import { DebtCollection } from "@/components/debt-collection"
import { CustomerServiceHub } from "@/components/customer-service-hub"
import { MultiChannelMessenger } from "@/components/multi-channel-messenger"
import { Button } from "@/components/ui/button"
import { LogIn, Phone, Users, BarChart3, MessageSquare, Zap, DollarSign, Headphones } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { SameRoom } from "@/components/sameroom"
import { FundingResources } from "@/components/funding-resources"

type Tab =
  | "dialer"
  | "crm"
  | "backoffice"
  | "scraper"
  | "grants"
  | "funding" // Added funding tab type
  | "applications"
  | "settings"
  | "pricing"
  | "debt-collection"
  | "customer-service"
  | "messaging"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dialer")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const session = authService.getCurrentSession()
    if (session) {
      setIsLoggedIn(true)
      setUser({ username: session.username, role: session.role })
      console.log("[v0] Session restored:", session.username)
    }
  }, [])

  const handleLogin = (username: string, role: string) => {
    setIsLoggedIn(true)
    setUser({ username, role })
    setShowLogin(false)
    console.log("[v0] User logged in:", username)
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setUser(null)
    console.log("[v0] User logged out")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <SameRoom />
            </div>

            <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white text-xl">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PAGE CRM</h1>
                <p className="text-xs text-cyan-400">Communication System</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              {isLoggedIn && user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-xs text-cyan-400">{user.role}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 bg-transparent"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              All-In-One Office Dialer, CRM & Back Office
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Everything you need to run your business in one powerful platform. Advanced dialing, complete CRM, payment
              processing, and all essential business tools.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto pt-4">
              {[
                { icon: Phone, label: "Smart Dialer" },
                { icon: Users, label: "Full CRM" },
                { icon: MessageSquare, label: "Multi-Channel" },
                { icon: BarChart3, label: "Analytics" },
                { icon: Zap, label: "Automation" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3"
                >
                  {feature.icon && <feature.icon className="h-6 w-6 text-cyan-300" />}
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto items-center">
            {[
              { id: "dialer", label: "Dialer", icon: Phone },
              { id: "crm", label: "CRM", icon: Users },
              { id: "backoffice", label: "Back Office", icon: BarChart3 },
              { id: "scraper", label: "Lead Generator", icon: Zap },
              { id: "grants", label: "Grant Processing", icon: Zap },
              { id: "funding", label: "💰 Funding Resources", icon: DollarSign }, // Added Funding Resources between grants and applications
              { id: "applications", label: "Applications", icon: Zap },
              { id: "debt-collection", label: "💰 Debt Collection", icon: DollarSign },
              { id: "customer-service", label: "🎧 Customer Service", icon: Headphones },
              { id: "messaging", label: "📱 Messaging", icon: MessageSquare },
              { id: "settings", label: "⚙️ Settings", icon: null },
              { id: "pricing", label: "Pricing", icon: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {activeTab === "dialer" && <DialerHomeScreen />}
        {activeTab === "crm" && <CRMDashboard />}
        {activeTab === "backoffice" && <BackOffice />}
        {activeTab === "scraper" && <LeadGenerator />}
        {activeTab === "grants" && <GrantProcessing />}
        {activeTab === "funding" && <FundingResources />} {/* Added Funding Resources component */}
        {activeTab === "applications" && <Applications />}
        {activeTab === "debt-collection" && <DebtCollection />}
        {activeTab === "customer-service" && <CustomerServiceHub />}
        {activeTab === "messaging" && <MultiChannelMessenger />}
        {activeTab === "settings" && <SystemSettings />}
        {activeTab === "pricing" && <Pricing />}
      </main>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onLogin={handleLogin} />

      <GeniusAssistant />
    </div>
  )
}
