"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Phone, User, Clock } from "lucide-react"

interface SMSConversation {
  id: string
  contact: string
  phone: string
  lastMessage: string
  timestamp: Date
  unread: boolean
  messages: Array<{
    id: string
    text: string
    sender: "contact" | "agent"
    timestamp: Date
  }>
}

export function SMSResponsePanel() {
  const [conversations, setConversations] = useState<SMSConversation[]>([
    {
      id: "1",
      contact: "John Smith",
      phone: "(555) 123-4567",
      lastMessage: "Hi, I'm interested in your services",
      timestamp: new Date(Date.now() - 300000),
      unread: true,
      messages: [
        {
          id: "1",
          text: "Hi, I'm interested in your services",
          sender: "contact",
          timestamp: new Date(Date.now() - 300000),
        },
      ],
    },
    {
      id: "2",
      contact: "Sarah Johnson",
      phone: "(555) 234-5678",
      lastMessage: "Thanks for the information!",
      timestamp: new Date(Date.now() - 600000),
      unread: false,
      messages: [
        {
          id: "1",
          text: "Can you send me more details?",
          sender: "contact",
          timestamp: new Date(Date.now() - 900000),
        },
        {
          id: "2",
          text: "I'll send you our brochure right away.",
          sender: "agent",
          timestamp: new Date(Date.now() - 700000),
        },
        {
          id: "3",
          text: "Thanks for the information!",
          sender: "contact",
          timestamp: new Date(Date.now() - 600000),
        },
      ],
    },
    {
      id: "3",
      contact: "Mike Davis",
      phone: "(555) 345-6789",
      lastMessage: "When can we schedule a call?",
      timestamp: new Date(Date.now() - 1200000),
      unread: true,
      messages: [
        {
          id: "1",
          text: "When can we schedule a call?",
          sender: "contact",
          timestamp: new Date(Date.now() - 1200000),
        },
      ],
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const handleSendReply = () => {
    if (!selectedConversation || !replyText.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      text: replyText,
      sender: "agent" as const,
      timestamp: new Date(),
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: replyText,
              timestamp: new Date(),
              unread: false,
            }
          : conv,
      ),
    )

    setReplyText("")
    console.log("[v0] SMS reply sent to conversation:", selectedConversation)
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation)
  const unreadCount = conversations.filter((c) => c.unread).length

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">SMS Inbox</h3>
        </div>
        {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount} unread</Badge>}
      </div>

      <div className="grid grid-cols-5 h-[500px]">
        {/* Conversations List */}
        <ScrollArea className="col-span-2 border-r border-white/10">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedConversation === conv.id ? "bg-cyan-500/20 border border-cyan-400/30" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{conv.contact}</p>
                      <p className="text-xs text-white/50">{conv.phone}</p>
                    </div>
                  </div>
                  {conv.unread && <div className="h-2 w-2 rounded-full bg-red-500" />}
                </div>
                <p className="text-xs text-white/60 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-white/40 mt-1">{formatTime(conv.timestamp)}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Conversation View */}
        <div className="col-span-3 flex flex-col">
          {selectedConv ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{selectedConv.contact}</p>
                  <p className="text-sm text-white/60">{selectedConv.phone}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 bg-transparent"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedConv.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === "agent" ? "bg-cyan-500 text-white" : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 opacity-60" />
                          <p className="text-xs opacity-60">{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    placeholder="Type your reply..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
