"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PipelineTab() {
  const stages = [
    {
      name: "New Leads",
      count: 12,
      value: "$45,000",
      deals: [
        { name: "Acme Corp", value: "$15,000", contact: "John Smith" },
        { name: "Tech Solutions", value: "$12,000", contact: "Sarah Johnson" },
        { name: "Global Industries", value: "$18,000", contact: "Mike Davis" },
      ],
    },
    {
      name: "Qualified",
      count: 8,
      value: "$67,500",
      deals: [
        { name: "Enterprise Co", value: "$25,000", contact: "Emily Brown" },
        { name: "Startup Inc", value: "$22,500", contact: "David Wilson" },
        { name: "Big Business", value: "$20,000", contact: "Lisa Chen" },
      ],
    },
    {
      name: "Proposal",
      count: 5,
      value: "$89,000",
      deals: [
        { name: "MegaCorp", value: "$45,000", contact: "Robert Taylor" },
        { name: "Innovation Labs", value: "$24,000", contact: "Jennifer Lee" },
        { name: "Future Tech", value: "$20,000", contact: "Michael Brown" },
      ],
    },
    {
      name: "Closed Won",
      count: 15,
      value: "$234,500",
      deals: [
        { name: "Success Corp", value: "$85,000", contact: "Amanda White" },
        { name: "Victory Inc", value: "$75,500", contact: "James Anderson" },
        { name: "Winner LLC", value: "$74,000", contact: "Patricia Martinez" },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Sales Pipeline</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <Card key={stage.name} className="bg-white/5 border-white/10 p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{stage.name}</h4>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">{stage.count}</Badge>
                </div>
                <p className="text-2xl font-bold text-cyan-400">{stage.value}</p>
              </div>

              <div className="space-y-2">
                {stage.deals.map((deal, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-white">{deal.name}</p>
                      <p className="text-sm font-semibold text-green-400">{deal.value}</p>
                    </div>
                    <p className="text-xs text-white/60">{deal.contact}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
