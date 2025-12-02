"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Phone, Video, MoreVertical, Search, Mail, MessageSquare, Check, CheckCheck } from "lucide-react"
import { sendMessage } from "@/lib/multi-channel-api"
import { sendSMS, getIncomingSMS } from "@/lib/standalone-phone-sync"

interface MessagingCenterProps {
  user: any
}

type Channel = "sms" | "whatsapp" | "telegram" | "signal" | "snapchat" | "email" | "facebook" | "instagram"

interface UnifiedMessage {
  id: string
  conversationId: string
  sender: "me" | "them"
  text: string
  time: string
  timestamp: Date
  channel: Channel
  status: "sent" | "delivered" | "read" | "failed"
}

interface Conversation {
  id: string
  name: string
  phone: string
  lastMessage: string
  time: string
  timestamp: Date
  unread: number
  avatar: string
  channel: Channel
  messages: UnifiedMessage[]
  online: boolean
}

const channelConfig = {
  sms: { icon: MessageSquare, color: "bg-blue-500", label: "SMS" },
  whatsapp: { icon: MessageSquare, color: "bg-green-500", label: "WhatsApp" },
  telegram: { icon: Send, color: "bg-cyan-500", label: "Telegram" },
  signal: { icon: MessageSquare, color: "bg-indigo-500", label: "Signal" },
  snapchat: { icon: MessageSquare, color: "bg-yellow-500", label: "Snapchat" },
  email: { icon: Mail, color: "bg-red-500", label: "Email" },
  facebook: { icon: MessageSquare, color: "bg-blue-600", label: "Facebook" },
  instagram: { icon: MessageSquare, color: "bg-pink-500", label: "Instagram" },
}

export function MessagingCenter({ user }: MessagingCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadConversations()
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadConversations = () => {
    const incomingSMS = getIncomingSMS()

    const mockConversations: Conversation[] = [
      {
        id: "conv_1",
        name: "John Anderson",
        phone: "(555) 123-4567",
        lastMessage: "Thanks for the follow-up!",
        time: "2m ago",
        timestamp: new Date(Date.now() - 120000),
        unread: 2,
        avatar: "JA",
        channel: "sms",
        online: true,
        messages: [
          {
            id: "msg_1",
            conversationId: "conv_1",
            sender: "them",
            text: "Hi! I received your email about the service",
            time: "10:30 AM",
            timestamp: new Date(Date.now() - 600000),
            channel: "sms",
            status: "read",
          },
          {
            id: "msg_2",
            conversationId: "conv_1",
            sender: "me",
            text: "Great! Do you have any questions?",
            time: "10:32 AM",
            timestamp: new Date(Date.now() - 480000),
            channel: "sms",
            status: "read",
          },
          {
            id: "msg_3",
            conversationId: "conv_1",
            sender: "them",
            text: "Thanks for the follow-up!",
            time: "10:40 AM",
            timestamp: new Date(Date.now() - 120000),
            channel: "sms",
            status: "delivered",
          },
        ],
      },
      {
        id: "conv_2",
        name: "Sarah Miller",
        phone: "+1 555-234-5678",
        lastMessage: "Can we schedule a call?",
        time: "15m ago",
        timestamp: new Date(Date.now() - 900000),
        unread: 0,
        avatar: "SM",
        channel: "whatsapp",
        online: true,
        messages: [
          {
            id: "msg_4",
            conversationId: "conv_2",
            sender: "them",
            text: "Can we schedule a call?",
            time: "9:45 AM",
            timestamp: new Date(Date.now() - 900000),
            channel: "whatsapp",
            status: "read",
          },
        ],
      },
      {
        id: "conv_3",
        name: "Mike Johnson",
        phone: "@mikej",
        lastMessage: "Sounds good, talk soon",
        time: "1h ago",
        timestamp: new Date(Date.now() - 3600000),
        unread: 1,
        avatar: "MJ",
        channel: "telegram",
        online: false,
        messages: [
          {
            id: "msg_5",
            conversationId: "conv_3",
            sender: "them",
            text: "Sounds good, talk soon",
            time: "9:00 AM",
            timestamp: new Date(Date.now() - 3600000),
            channel: "telegram",
            status: "delivered",
          },
        ],
      },
      {
        id: "conv_4",
        name: "Emma Davis",
        phone: "+1 555-345-6789",
        lastMessage: "I received the proposal",
        time: "3h ago",
        timestamp: new Date(Date.now() - 10800000),
        unread: 0,
        avatar: "ED",
        channel: "signal",
        online: true,
        messages: [
          {
            id: "msg_6",
            conversationId: "conv_4",
            sender: "them",
            text: "I received the proposal",
            time: "7:00 AM",
            timestamp: new Date(Date.now() - 10800000),
            channel: "signal",
            status: "read",
          },
        ],
      },
      {
        id: "conv_5",
        name: "Robert Wilson",
        phone: "robert@email.com",
        lastMessage: "Let me think about it",
        time: "5h ago",
        timestamp: new Date(Date.now() - 18000000),
        unread: 0,
        avatar: "RW",
        channel: "email",
        online: false,
        messages: [
          {
            id: "msg_7",
            conversationId: "conv_5",
            sender: "them",
            text: "Let me think about it",
            time: "5:00 AM",
            timestamp: new Date(Date.now() - 18000000),
            channel: "email",
            status: "read",
          },
        ],
      },
    ]

    setConversations(mockConversations)
    if (!selectedConversation && mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0])
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)
    console.log("[v0] Sending message via", selectedConversation.channel, "to", selectedConversation.phone)

    try {
      let result

      if (selectedConversation.channel === "sms") {
        result = await sendSMS(selectedConversation.phone, messageText)
      } else {
        result = await sendMessage({
          to: selectedConversation.phone,
          message: messageText,
          channel: selectedConversation.channel,
        })
      }

      if (result.success) {
        const newMessage: UnifiedMessage = {
          id: `msg_${Date.now()}`,
          conversationId: selectedConversation.id,
          sender: "me",
          text: messageText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: new Date(),
          channel: selectedConversation.channel,
          status: "sent",
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: messageText,
                  timestamp: new Date(),
                }
              : conv,
          ),
        )

        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMessage],
                lastMessage: messageText,
                timestamp: new Date(),
              }
            : null,
        )

        setMessageText("")
      } else {
        alert(`Failed to send message: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations
    .filter((conv) => {
      const matchesSearch =
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesChannel = channelFilter === "all" || conv.channel === channelFilter
      return matchesSearch && matchesChannel
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Unified Inbox</h1>
          <p className="text-slate-600 mt-1">All your messages from all channels in one place</p>
        </div>
        {totalUnread > 0 && <Badge className="bg-red-500 text-white text-lg px-4 py-2">{totalUnread} unread</Badge>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={channelFilter === "all" ? "default" : "outline"}
          onClick={() => setChannelFilter("all")}
          className={channelFilter === "all" ? "bg-slate-900" : ""}
        >
          All Channels
        </Button>
        {Object.entries(channelConfig).map(([channel, config]) => {
          const Icon = config.icon
          const count = conversations.filter((c) => c.channel === channel).length
          return (
            <Button
              key={channel}
              size="sm"
              variant={channelFilter === channel ? "default" : "outline"}
              onClick={() => setChannelFilter(channel as Channel)}
              className={channelFilter === channel ? config.color : ""}
            >
              <Icon className="h-4 w-4 mr-1" />
              {config.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Messaging Interface */}
      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-20rem)]">
        {/* Conversations List */}
        <Card className="border-slate-200 lg:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 p-0 h-8"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-0">
              {filteredConversations.map((conv) => {
                const ChannelIcon = channelConfig[conv.channel].icon
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                      selectedConversation?.id === conv.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500">
                        <AvatarFallback className="text-white font-semibold">{conv.avatar}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 ${channelConfig[conv.channel].color} rounded-full p-1`}
                      >
                        <ChannelIcon className="h-3 w-3 text-white" />
                      </div>
                      {conv.online && (
                        <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-900 truncate">{conv.name}</p>
                        {conv.unread > 0 && (
                          <Badge className="bg-blue-600 text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">{conv.time}</p>
                        <Badge variant="outline" className="text-xs">
                          {channelConfig[conv.channel].label}
                        </Badge>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations found</p>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="border-slate-200 lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500">
                        <AvatarFallback className="text-white font-semibold">
                          {selectedConversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{selectedConversation.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-600">{selectedConversation.phone}</p>
                        <Badge className={`${channelConfig[selectedConversation.channel].color} text-white text-xs`}>
                          {channelConfig[selectedConversation.channel].label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === "me" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className={`text-xs ${message.sender === "me" ? "text-blue-100" : "text-slate-500"}`}>
                            {message.time}
                          </p>
                          {message.sender === "me" && (
                            <>
                              {message.status === "sent" && <Check className="h-3 w-3" />}
                              {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                              {message.status === "read" && <CheckCheck className="h-3 w-3 text-blue-300" />}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Type your message via ${channelConfig[selectedConversation.channel].label}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={sending}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 self-end"
                  >
                    {sending ? "Sending..." : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Sending via {channelConfig[selectedConversation.channel].label} •{" "}
                  {selectedConversation.online ? "Contact is online" : "Contact is offline"}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
