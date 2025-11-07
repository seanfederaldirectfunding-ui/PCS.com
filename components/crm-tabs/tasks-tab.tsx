"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Clock } from "lucide-react"

export function TasksTab() {
  const tasks = [
    { id: 1, title: "Follow up with John Smith", priority: "high", dueDate: "Today, 2:00 PM", completed: false },
    { id: 2, title: "Send proposal to Sarah Johnson", priority: "high", dueDate: "Today, 4:30 PM", completed: false },
    {
      id: 3,
      title: "Schedule demo with Mike Davis",
      priority: "medium",
      dueDate: "Tomorrow, 10:00 AM",
      completed: false,
    },
    { id: 4, title: "Review contract with Emily Brown", priority: "low", dueDate: "Dec 28, 3:00 PM", completed: true },
    { id: 5, title: "Update CRM records", priority: "medium", dueDate: "Dec 29, 9:00 AM", completed: false },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-400/30"
      case "medium":
        return "bg-orange-500/20 text-orange-400 border-orange-400/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Task Management</h3>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className={`bg-white/5 border-white/10 p-4 ${task.completed ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-4">
              <Checkbox checked={task.completed} className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h4 className={`font-medium text-white ${task.completed ? "line-through" : ""}`}>{task.title}</h4>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="h-3 w-3" />
                  {task.dueDate}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
