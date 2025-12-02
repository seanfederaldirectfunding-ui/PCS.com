"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, MessageSquare, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

interface DashboardOverviewProps {
  user: any
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const isManager = user.role === "Manager"

  const stats = isManager
    ? [
        { label: "Total Leads", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
        { label: "Active Campaigns", value: "8", change: "+2", icon: TrendingUp, color: "text-teal-600" },
        { label: "Calls Today", value: "156", change: "+23%", icon: Phone, color: "text-cyan-600" },
        { label: "Messages Sent", value: "892", change: "+18%", icon: MessageSquare, color: "text-indigo-600" },
      ]
    : [
        { label: "My Leads", value: user.badge.split(" ")[0], change: "+5", icon: Users, color: "text-blue-600" },
        { label: "Calls Today", value: "12", change: "+3", icon: Phone, color: "text-teal-600" },
        { label: "Messages", value: "28", change: "+8", icon: MessageSquare, color: "text-cyan-600" },
        { label: "Conversions", value: "7", change: "+2", icon: CheckCircle2, color: "text-indigo-600" },
      ]

  const recentActivity = [
    { type: "call", lead: "John Anderson", time: "5 min ago", status: "completed" },
    { type: "sms", lead: "Sarah Miller", time: "12 min ago", status: "sent" },
    { type: "call", lead: "Mike Johnson", time: "23 min ago", status: "missed" },
    { type: "sms", lead: "Emma Davis", time: "1 hour ago", status: "delivered" },
    { type: "call", lead: "Robert Wilson", time: "2 hours ago", status: "completed" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(" ")[0]}!</h1>
        <p className="text-slate-600 mt-1">
          {isManager ? "Here's your team overview" : "Here's your performance today"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {activity.type === "call" ? (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-teal-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{activity.lead}</p>
                    <p className="text-sm text-slate-600">{activity.time}</p>
                  </div>
                </div>
                <Badge
                  variant={activity.status === "completed" || activity.status === "delivered" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
