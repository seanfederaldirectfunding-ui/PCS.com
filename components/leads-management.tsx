"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Phone, MessageSquare, Mail, MoreVertical } from "lucide-react"

interface LeadsManagementProps {
  user: any
}

const mockLeads = [
  {
    id: 1,
    name: "John Anderson",
    email: "john.a@email.com",
    phone: "(555) 123-4567",
    status: "new",
    source: "Website",
    value: "$5,200",
  },
  {
    id: 2,
    name: "Sarah Miller",
    email: "sarah.m@email.com",
    phone: "(555) 234-5678",
    status: "contacted",
    source: "Referral",
    value: "$3,800",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@email.com",
    phone: "(555) 345-6789",
    status: "qualified",
    source: "LinkedIn",
    value: "$7,500",
  },
  {
    id: 4,
    name: "Emma Davis",
    email: "emma.d@email.com",
    phone: "(555) 456-7890",
    status: "proposal",
    source: "Website",
    value: "$4,200",
  },
  {
    id: 5,
    name: "Robert Wilson",
    email: "robert.w@email.com",
    phone: "(555) 567-8901",
    status: "negotiation",
    source: "Cold Call",
    value: "$9,100",
  },
  {
    id: 6,
    name: "Lisa Brown",
    email: "lisa.b@email.com",
    phone: "(555) 678-9012",
    status: "new",
    source: "Facebook",
    value: "$2,900",
  },
  {
    id: 7,
    name: "David Martinez",
    email: "david.m@email.com",
    phone: "(555) 789-0123",
    status: "contacted",
    source: "Website",
    value: "$6,300",
  },
  {
    id: 8,
    name: "Jennifer Taylor",
    email: "jennifer.t@email.com",
    phone: "(555) 890-1234",
    status: "qualified",
    source: "Referral",
    value: "$5,700",
  },
]

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-teal-100 text-teal-700",
  proposal: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
}

export function LeadsManagement({ user }: LeadsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-slate-600 mt-1">Manage and track your leads</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">+ Add New Lead</Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Lead Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500">
                    <AvatarFallback className="text-white font-semibold">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                    <p className="text-sm text-slate-600 truncate">{lead.email}</p>
                    <p className="text-sm text-slate-600">{lead.phone}</p>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  <div>
                    <p className="text-xs text-slate-500">Source</p>
                    <p className="text-sm font-medium text-slate-900">{lead.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Value</p>
                    <p className="text-sm font-semibold text-slate-900">{lead.value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <Badge className={`capitalize ${statusColors[lead.status]}`}>{lead.status}</Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Call</span>
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">SMS</span>
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
