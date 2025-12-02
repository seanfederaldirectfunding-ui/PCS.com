"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Phone, Mail, MessageSquare, Plus, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { type Lead, shouldMarkLeadDead, getRecommendedChannels, hasAllDocuments } from "@/lib/lead-lifecycle"

export function LeadsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      status: "hot",
      source: "Website",
      value: "$5,000",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      nextFollowUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      contactAttempts: 8,
      documents: [
        { id: "d1", type: "application", name: "Application Form", uploadedAt: new Date(), status: "received" },
      ],
      activities: [],
      channels: [
        { channel: "email", enabled: true, lastUsed: new Date(), successRate: 0.75, totalAttempts: 5 },
        { channel: "sms", enabled: true, lastUsed: new Date(), successRate: 0.6, totalAttempts: 3 },
        { channel: "voice", enabled: true, lastUsed: null, successRate: 0, totalAttempts: 0 },
      ],
      isDead: false,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 234-5678",
      status: "application",
      source: "Referral",
      value: "$3,500",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      contactAttempts: 12,
      documents: [
        { id: "d2", type: "application", name: "Application", uploadedAt: new Date(), status: "verified" },
        { id: "d3", type: "bank_statement", name: "Bank Statement", uploadedAt: new Date(), status: "pending" },
      ],
      activities: [],
      channels: [
        { channel: "email", enabled: true, lastUsed: new Date(), successRate: 0.8, totalAttempts: 8 },
        { channel: "sms", enabled: true, lastUsed: new Date(), successRate: 0.7, totalAttempts: 4 },
      ],
      isDead: false,
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "+1 (555) 345-6789",
      status: "contacted",
      source: "Cold Call",
      value: "$2,000",
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
      lastContactedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      nextFollowUpAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Overdue
      contactAttempts: 15,
      documents: [],
      activities: [],
      channels: [
        { channel: "email", enabled: true, lastUsed: new Date(), successRate: 0.2, totalAttempts: 10 },
        { channel: "voice", enabled: true, lastUsed: new Date(), successRate: 0.1, totalAttempts: 5 },
      ],
      isDead: false,
    },
  ])

  useEffect(() => {
    const checkDeadLeads = () => {
      setLeads((prevLeads) =>
        prevLeads.map((lead) => {
          if (shouldMarkLeadDead(lead) && !lead.isDead) {
            console.log("[v0] Marking lead as dead:", lead.name)
            return {
              ...lead,
              isDead: true,
              status: "dead" as const,
              deadReason: "6 months of inactivity - no response across all channels",
            }
          }
          return lead
        }),
      )
    }

    checkDeadLeads()
    const interval = setInterval(checkDeadLeads, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-500/20 text-red-400 border-red-400/30"
      case "prospect":
        return "bg-orange-500/20 text-orange-400 border-orange-400/30"
      case "contacted":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      case "application":
        return "bg-purple-500/20 text-purple-400 border-purple-400/30"
      case "doc":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "dead":
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  const getFollowUpStatus = (lead: Lead) => {
    if (lead.isDead) {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">Dead Lead</Badge>
    }

    if (!lead.nextFollowUpAt) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Schedule Follow-up</Badge>
    }

    const now = Date.now()
    const followUpTime = lead.nextFollowUpAt.getTime()

    if (followUpTime < now) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-400/30 animate-pulse">Overdue</Badge>
    } else if (followUpTime < now + 24 * 60 * 60 * 1000) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30">Due Today</Badge>
    } else {
      return <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Scheduled</Badge>
    }
  }

  const getDocumentStatus = (lead: Lead) => {
    if (lead.documents.length === 0) {
      return <AlertCircle className="h-4 w-4 text-red-400" />
    }
    if (hasAllDocuments(lead)) {
      return <CheckCircle className="h-4 w-4 text-green-400" />
    }
    return <Clock className="h-4 w-4 text-yellow-400" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input className="bg-white/5 border-white/10 text-white" placeholder="John Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="bg-white/5 border-white/10 text-white" type="email" placeholder="john@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="bg-white/5 border-white/10 text-white" placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <Label>Source</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold-call">Cold Call</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">Add Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 hover:bg-white/5 border-white/10">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Contact</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Follow-up</TableHead>
              <TableHead className="text-white">Docs</TableHead>
              <TableHead className="text-white">Attempts</TableHead>
              <TableHead className="text-white">Value</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-white">{lead.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm text-white/80">{lead.email}</p>
                    <p className="text-xs text-white/60">{lead.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </TableCell>
                <TableCell>{getFollowUpStatus(lead)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDocumentStatus(lead)}
                    <span className="text-xs text-white/60">{lead.documents.length}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-white/10 text-white/80">{lead.contactAttempts}</Badge>
                </TableCell>
                <TableCell className="text-white font-semibold">{lead.value}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                      disabled={lead.isDead}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                      disabled={lead.isDead}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                      disabled={lead.isDead}
                    >
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedLead.name} - Lead Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60">Status</Label>
                  <Badge className={getStatusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                </div>
                <div>
                  <Label className="text-white/60">Contact Attempts</Label>
                  <p className="text-white">{selectedLead.contactAttempts}</p>
                </div>
                <div>
                  <Label className="text-white/60">Created</Label>
                  <p className="text-white">{selectedLead.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-white/60">Last Contact</Label>
                  <p className="text-white">{selectedLead.lastContactedAt?.toLocaleDateString() || "Never"}</p>
                </div>
              </div>

              <div>
                <Label className="text-white/60">Next Follow-up</Label>
                <p className="text-white">{selectedLead.nextFollowUpAt?.toLocaleString() || "Not scheduled"}</p>
                <p className="text-xs text-white/60 mt-1">
                  Recommended channels: {getRecommendedChannels(selectedLead).join(", ")}
                </p>
              </div>

              <div>
                <Label className="text-white/60">Documents ({selectedLead.documents.length})</Label>
                <div className="space-y-2 mt-2">
                  {selectedLead.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-sm text-white">{doc.name}</p>
                        <p className="text-xs text-white/60">{doc.type}</p>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                    </div>
                  ))}
                  {selectedLead.documents.length === 0 && (
                    <p className="text-sm text-white/60">No documents uploaded yet</p>
                  )}
                </div>
              </div>

              {selectedLead.isDead && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-400 font-medium">Dead Lead</p>
                  <p className="text-xs text-red-300 mt-1">{selectedLead.deadReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
