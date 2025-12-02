"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Users, DollarSign, Phone, MessageSquare } from "lucide-react"

interface AnalyticsDashboardProps {
  user: any
}

const conversionData = [
  { month: "Jan", leads: 120, conversions: 45 },
  { month: "Feb", leads: 150, conversions: 58 },
  { month: "Mar", leads: 180, conversions: 72 },
  { month: "Apr", leads: 165, conversions: 65 },
  { month: "May", leads: 200, conversions: 85 },
  { month: "Jun", leads: 220, conversions: 95 },
]

const sourceData = [
  { name: "Website", value: 35, color: "#3b82f6" },
  { name: "Referral", value: 25, color: "#14b8a6" },
  { name: "LinkedIn", value: 20, color: "#06b6d4" },
  { name: "Facebook", value: 12, color: "#6366f1" },
  { name: "Cold Call", value: 8, color: "#8b5cf6" },
]

const activityData = [
  { day: "Mon", calls: 24, sms: 45, emails: 32 },
  { day: "Tue", calls: 28, sms: 52, emails: 38 },
  { day: "Wed", calls: 32, sms: 48, emails: 42 },
  { day: "Thu", calls: 26, sms: 55, emails: 36 },
  { day: "Fri", calls: 30, sms: 60, emails: 40 },
  { day: "Sat", calls: 18, sms: 35, emails: 25 },
  { day: "Sun", calls: 15, sms: 28, emails: 20 },
]

export function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const isManager = user.role === "Manager"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">{isManager ? "Team performance metrics" : "Your performance metrics"}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                12%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">1,247</p>
            <p className="text-sm text-slate-600 mt-1">Total Leads</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                18%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">$127K</p>
            <p className="text-sm text-slate-600 mt-1">Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 text-cyan-600" />
              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <TrendingDown className="h-4 w-4" />
                3%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">892</p>
            <p className="text-sm text-slate-600 mt-1">Calls Made</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                25%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">1,543</p>
            <p className="text-sm text-slate-600 mt-1">Messages Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Trend */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#14b8a6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Overview */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="#3b82f6" />
                <Bar dataKey="sms" fill="#14b8a6" />
                <Bar dataKey="emails" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
