"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
  Wand2,
} from "lucide-react"
import { GeniusAssistant } from "@/components/genius-assistant"
import { PageMaster } from "@/components/pagemaster"

interface User {
  name: string
  email: string
  role: string
  initials: string
  color: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPageMaster, setShowPageMaster] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: Users },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "PageMaster", href: "#", icon: Wand2, onClick: () => setShowPageMaster(!showPageMaster) },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  useEffect(() => {
    console.log(
      "[v0] Navigation items loaded:",
      navigation.map((item) => item.name),
    )
    console.log("[v0] Total navigation items:", navigation.length)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900">PAGE CRM</h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Avatar className={user.color}>
                <AvatarFallback className="text-white font-semibold">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-600 truncate">{user.email}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              console.log(`[v0] Rendering nav item: ${item.name}`)

              if (item.onClick) {
                return (
                  <Button
                    key={item.name}
                    variant={showPageMaster && item.name === "PageMaster" ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      showPageMaster && item.name === "PageMaster"
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "text-slate-700"
                    }`}
                    onClick={item.onClick}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                )
              }
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">VoIP</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">SMS</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      <GeniusAssistant />
      {showPageMaster && <PageMaster />}
    </div>
  )
}
