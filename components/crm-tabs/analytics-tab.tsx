"use client"

import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

export function AnalyticsTab() {
  const metrics = [
    { label: "Total Revenue", value: "$234,500", change: "+12.5%", trend: "up", icon: DollarSign },
    { label: "Active Leads", value: "247", change: "+8.3%", trend: "up", icon: Users },
    { label: "Conversion Rate", value: "24.8%", change: "+3.2%", trend: "up", icon: TrendingUp },
    { label: "Avg Deal Size", value: "$15,633", change: "-2.1%", trend: "down", icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-white/5 border-white/10 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">{metric.label}</p>
                <metric.icon className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
              <p className={`text-sm font-medium ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                {metric.change} from last month
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="font-semibold text-white mb-4">Lead Sources</h4>
          <div className="space-y-3">
            {[
              { source: "Website", count: 89, percentage: 36 },
              { source: "Referrals", count: 67, percentage: 27 },
              { source: "Cold Calls", count: 45, percentage: 18 },
              { source: "LinkedIn", count: 32, percentage: 13 },
              { source: "Email Campaign", count: 14, percentage: 6 },
            ].map((item) => (
              <div key={item.source} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{item.source}</span>
                  <span className="text-white font-medium">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="font-semibold text-white mb-4">Monthly Performance</h4>
          <div className="space-y-3">
            {[
              { month: "December", revenue: "$89,500", deals: 23 },
              { month: "November", revenue: "$76,200", deals: 19 },
              { month: "October", revenue: "$68,800", deals: 17 },
            ].map((item) => (
              <div key={item.month} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{item.month}</p>
                  <p className="text-xs text-white/60">{item.deals} deals closed</p>
                </div>
                <p className="text-lg font-bold text-green-400">{item.revenue}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
