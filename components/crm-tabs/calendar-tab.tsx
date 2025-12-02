"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, MapPin } from "lucide-react"

export function CalendarTab() {
  const events = [
    { id: 1, title: "Sales Call with John Smith", time: "10:00 AM - 11:00 AM", type: "call", location: "Phone" },
    { id: 2, title: "Demo Presentation", time: "2:00 PM - 3:00 PM", type: "meeting", location: "Zoom" },
    { id: 3, title: "Follow-up Email", time: "4:00 PM - 4:30 PM", type: "task", location: "Office" },
    { id: 4, title: "Team Standup", time: "9:00 AM - 9:30 AM", type: "meeting", location: "Conference Room A" },
  ]

  const getEventColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      case "meeting":
        return "bg-purple-500/20 text-purple-400 border-purple-400/30"
      case "task":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Schedule
        </h3>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-white">{event.title}</h4>
                <Badge className={getEventColor(event.type)}>{event.type}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10">
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Join
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
