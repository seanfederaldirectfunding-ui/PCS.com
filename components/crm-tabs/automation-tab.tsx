"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Plus, Play, Mail, MessageSquare, Phone, Clock, AlertCircle } from "lucide-react"

export function AutomationTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const workflows = [
    {
      id: 1,
      name: "New Lead Multi-Channel Outreach",
      trigger: "New Lead Created",
      actions: 5,
      active: true,
      runs: 247,
      channels: ["email", "sms"],
      description: "Immediate email + SMS welcome sequence",
    },
    {
      id: 2,
      name: "3-Day Follow-up Escalation",
      trigger: "No Response in 3 Days",
      actions: 4,
      active: true,
      runs: 89,
      channels: ["voice", "email", "whatsapp"],
      description: "Voice call + Email + WhatsApp follow-up",
    },
    {
      id: 3,
      name: "Hot Lead Immediate Action",
      trigger: "Lead Status = Hot",
      actions: 6,
      active: true,
      runs: 34,
      channels: ["voice", "sms", "email"],
      description: "Instant call attempt + SMS + Email notification",
    },
    {
      id: 4,
      name: "Document Collection Reminder",
      trigger: "Application Status - Missing Docs",
      actions: 5,
      active: true,
      runs: 67,
      channels: ["email", "sms", "whatsapp"],
      description: "Daily reminders across all channels until docs received",
    },
    {
      id: 5,
      name: "Weekly Prospect Nurture",
      trigger: "Lead Status = Prospect (7 days)",
      actions: 3,
      active: true,
      runs: 156,
      channels: ["email", "telegram"],
      description: "Weekly educational content via email and Telegram",
    },
    {
      id: 6,
      name: "Dead Lead Prevention",
      trigger: "No Contact in 30 Days",
      actions: 7,
      active: true,
      runs: 45,
      channels: ["email", "sms", "voice", "whatsapp", "facebook"],
      description: "Aggressive multi-channel re-engagement campaign",
    },
    {
      id: 7,
      name: "6-Month Dead Lead Marker",
      trigger: "No Response in 180 Days",
      actions: 2,
      active: true,
      runs: 12,
      channels: [],
      description: "Automatically mark lead as dead and stop all outreach",
    },
  ]

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-3 w-3" />
      case "sms":
      case "whatsapp":
      case "telegram":
      case "facebook":
        return <MessageSquare className="h-3 w-3" />
      case "voice":
        return <Phone className="h-3 w-3" />
      default:
        return <Zap className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            Automation Workflows
          </h3>
          <p className="text-sm text-white/60 mt-1">Automated multi-channel follow-up system</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Workflow Name</Label>
                <Input className="bg-white/5 border-white/10 text-white" placeholder="My Automation" />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="new-lead">New Lead Created</SelectItem>
                    <SelectItem value="no-response-3">No Response in 3 Days</SelectItem>
                    <SelectItem value="no-response-7">No Response in 7 Days</SelectItem>
                    <SelectItem value="status-hot">Lead Status = Hot</SelectItem>
                    <SelectItem value="status-application">Lead Status = Application</SelectItem>
                    <SelectItem value="missing-docs">Missing Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Channels (Select multiple)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Email", "SMS", "Voice", "WhatsApp", "Telegram", "Signal", "Facebook", "Instagram", "Snapchat"].map(
                    (channel) => (
                      <label
                        key={channel}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                      >
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-white">{channel}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">Create Workflow</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/40 to-green-600/20 border-green-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-300">Active Workflows</p>
              <p className="text-2xl font-bold text-green-400">6</p>
            </div>
            <Zap className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-600/20 border-blue-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-300">Total Runs Today</p>
              <p className="text-2xl font-bold text-blue-400">89</p>
            </div>
            <Play className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-600/20 border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-300">Success Rate</p>
              <p className="text-2xl font-bold text-purple-400">73%</p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-600/20 border-orange-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-300">Scheduled</p>
              <p className="text-2xl font-bold text-orange-400">34</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="bg-white/5 border-white/10 p-6 hover:bg-white/[0.07] transition-colors">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white text-lg">{workflow.name}</h4>
                    <Switch checked={workflow.active} />
                  </div>
                  <p className="text-sm text-white/80 mb-2">{workflow.description}</p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Clock className="h-3 w-3" />
                    <span>Trigger: {workflow.trigger}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
                  {workflow.actions} actions
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">{workflow.runs} runs</Badge>
                {workflow.active && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Active</Badge>
                )}
              </div>

              {workflow.channels.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/60">Channels:</span>
                  {workflow.channels.map((channel) => (
                    <Badge key={channel} className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 text-xs">
                      <span className="mr-1">{getChannelIcon(channel)}</span>
                      {channel}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10">
                  View Logs
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Play className="mr-2 h-3 w-3" />
                  Test Run
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Automated Lead Lifecycle Management</h4>
            <p className="text-sm text-white/80 mb-3">
              The system automatically follows up with leads across all channels until they convert to full applications
              (DOC status) or are marked dead after 6 months of no response. Each workflow triggers based on lead status
              and engagement patterns.
            </p>
            <ul className="space-y-1 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Multi-channel outreach (Email, SMS, Voice, WhatsApp, Telegram, Signal, Facebook, Instagram, Snapchat)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Automatic status progression based on engagement
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Document collection reminders until all required docs received
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Dead lead detection after 180 days of inactivity
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
