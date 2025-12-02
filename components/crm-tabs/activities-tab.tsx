"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MessageSquare, FileText, Calendar, User } from "lucide-react"
import type { Activity } from "@/lib/lead-lifecycle"

export function ActivitiesTab() {
  const [filterChannel, setFilterChannel] = useState<string>("all")
  const [filterOutcome, setFilterOutcome] = useState<string>("all")

  const activities: Activity[] = [
    {
      id: "1",
      type: "call",
      channel: "voice",
      description: "Called John Smith - Discussed application requirements",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      outcome: "success",
      notes: "Very interested, will submit documents by Friday",
    },
    {
      id: "2",
      type: "email",
      channel: "email",
      description: "Sent follow-up email to Sarah Johnson",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      outcome: "delivered",
    },
    {
      id: "3",
      type: "sms",
      channel: "sms",
      description: "SMS reminder sent to Mike Davis",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      outcome: "read",
    },
    {
      id: "4",
      type: "whatsapp",
      channel: "whatsapp",
      description: "WhatsApp message to Emily Brown",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      outcome: "replied",
      notes: "Requested more information about rates",
    },
    {
      id: "5",
      type: "document",
      channel: "email",
      description: "Bank statement received from Sarah Johnson",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      outcome: "success",
    },
    {
      id: "6",
      type: "call",
      channel: "voice",
      description: "Attempted call to Mike Davis",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      outcome: "no_answer",
    },
    {
      id: "7",
      type: "telegram",
      channel: "telegram",
      description: "Telegram message to David Wilson",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      outcome: "delivered",
    },
    {
      id: "8",
      type: "facebook",
      channel: "facebook",
      description: "Facebook Messenger to Lisa Chen",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      outcome: "read",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "sms":
      case "whatsapp":
      case "telegram":
      case "signal":
      case "facebook":
      case "instagram":
      case "snapchat":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getActivityColor = (channel: string) => {
    switch (channel) {
      case "voice":
        return "bg-blue-500/20 text-blue-400"
      case "email":
        return "bg-purple-500/20 text-purple-400"
      case "sms":
        return "bg-green-500/20 text-green-400"
      case "whatsapp":
        return "bg-emerald-500/20 text-emerald-400"
      case "telegram":
        return "bg-sky-500/20 text-sky-400"
      case "signal":
        return "bg-indigo-500/20 text-indigo-400"
      case "facebook":
        return "bg-blue-600/20 text-blue-400"
      case "instagram":
        return "bg-pink-500/20 text-pink-400"
      case "snapchat":
        return "bg-yellow-400/20 text-yellow-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "success":
      case "replied":
      case "read":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "delivered":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      case "no_answer":
      case "voicemail":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
      case "bounced":
        return "bg-red-500/20 text-red-400 border-red-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  const filteredActivities = activities.filter((activity) => {
    if (filterChannel !== "all" && activity.channel !== filterChannel) return false
    if (filterOutcome !== "all" && activity.outcome !== filterOutcome) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>

        <div className="flex items-center gap-2">
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="signal">Signal</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="snapchat">Snapchat</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOutcome} onValueChange={setFilterOutcome}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="All Outcomes" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="bg-white/5 border-white/10 p-4">
            <div className="flex items-start gap-4">
              <div
                className={`h-10 w-10 rounded-lg ${getActivityColor(activity.channel)} flex items-center justify-center flex-shrink-0`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white">{activity.description}</p>
                  <Badge className={getOutcomeColor(activity.outcome)}>{activity.outcome}</Badge>
                </div>

                {activity.notes && <p className="text-xs text-white/60 mt-2 italic">{activity.notes}</p>}

                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-white/60">
                    {activity.timestamp.toLocaleTimeString()} - {activity.timestamp.toLocaleDateString()}
                  </p>
                  <Badge className="bg-white/10 text-white/80 text-xs capitalize">{activity.channel}</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredActivities.length === 0 && (
          <Card className="bg-white/5 border-white/10 p-8 text-center">
            <p className="text-white/60">No activities found matching the selected filters</p>
          </Card>
        )}
      </div>
    </div>
  )
}
