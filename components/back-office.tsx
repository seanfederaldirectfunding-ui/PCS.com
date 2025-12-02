"use client"

import { Card } from "@/components/ui/card"
import { Users, DollarSign, FileText, Settings } from "lucide-react"

export function BackOffice() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Back Office</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "User Management", value: "45 Users" },
          { icon: DollarSign, label: "Billing", value: "$12,450/mo" },
          { icon: FileText, label: "Reports", value: "23 Reports" },
          { icon: Settings, label: "System Config", value: "Active" },
        ].map((item, index) => (
          <Card
            key={index}
            className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <item.icon className="h-8 w-8 text-cyan-400 mb-3" />
            <p className="text-sm text-white/60 mb-1">{item.label}</p>
            <p className="text-xl font-bold text-white">{item.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
