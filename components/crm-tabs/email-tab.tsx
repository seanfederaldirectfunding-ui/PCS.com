"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, Inbox } from "lucide-react"

export function EmailTab() {
  const emails = [
    {
      id: 1,
      from: "John Smith",
      subject: "Re: Proposal Discussion",
      preview: "Thanks for sending over the proposal...",
      time: "10:30 AM",
      unread: true,
    },
    {
      id: 2,
      from: "Sarah Johnson",
      subject: "Meeting Follow-up",
      preview: "It was great meeting with you yesterday...",
      time: "9:15 AM",
      unread: true,
    },
    {
      id: 3,
      from: "Mike Davis",
      subject: "Question about pricing",
      preview: "I have a few questions regarding...",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 4,
      from: "Emily Brown",
      subject: "Contract Review",
      preview: "I have reviewed the contract and...",
      time: "Dec 25",
      unread: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Email List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Inbox
          </h3>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">4</Badge>
        </div>

        <div className="space-y-2">
          {emails.map((email) => (
            <Card
              key={email.id}
              className={`p-4 cursor-pointer transition-colors ${email.unread ? "bg-cyan-500/10 border-cyan-400/30" : "bg-white/5 border-white/10"} hover:bg-white/10`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium ${email.unread ? "text-white" : "text-white/80"}`}>{email.from}</p>
                  <p className="text-xs text-white/60">{email.time}</p>
                </div>
                <p className={`text-sm ${email.unread ? "text-white font-medium" : "text-white/70"}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-white/60 line-clamp-2">{email.preview}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Compose Email */}
      <div className="lg:col-span-2">
        <Card className="bg-white/5 border-white/10 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">To</label>
                <Input
                  placeholder="recipient@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Subject</label>
                <Input
                  placeholder="Email subject"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Message</label>
                <Textarea
                  placeholder="Write your message here..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[300px]"
                />
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                  Save Draft
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
