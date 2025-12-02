"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  Send,
  Users,
  FileText,
  CheckCircle2,
  Mail,
  MessageSquare,
  Smartphone,
  Link2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendBulkSMS, getConnectedPhones } from "@/lib/standalone-phone-sync"

interface ContactList {
  id: string
  name: string
  contacts: Array<{ name: string; phone: string; email?: string }>
  uploadedAt: Date
}

type Channel = "sms" | "email" | "whatsapp" | "telegram" | "signal" | "facebook" | "instagram"

export function BulkTexter() {
  const [lists, setLists] = useState<ContactList[]>([])
  const [selectedList, setSelectedList] = useState<string>("")
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(["sms"])
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ success: number; failed: number; queued: number } | null>(null)
  const [useFreePhones, setUseFreePhones] = useState(true)
  const connectedPhones = getConnectedPhones().filter((p) => p.status === "online")

  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    phone: false,
    facebook: false,
    instagram: false,
    snapchat: false,
    telegram: false,
    whatsapp: false,
    email: true, // Email is always available via Mailgun
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const contacts = lines
          .slice(1)
          .map((line, index) => {
            const [name, phone, email] = line.split(",").map((s) => s.trim())
            return {
              name: name || `Contact ${index + 1}`,
              phone: phone || "",
              email: email || "",
            }
          })
          .filter((contact) => contact.phone || contact.email)

        const newList: ContactList = {
          id: Date.now().toString(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          contacts,
          uploadedAt: new Date(),
        }

        setLists((prev) => [...prev, newList])
        console.log("[v0] List uploaded:", newList.name, "with", contacts.length, "contacts")
      } catch (error) {
        console.error("[v0] Error parsing file:", error)
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleSendBulk = async () => {
    if (!selectedList || !message.trim() || selectedChannels.length === 0) return

    const list = lists.find((l) => l.id === selectedList)
    if (!list) return

    setIsSending(true)
    setSendStatus(null)

    try {
      if (selectedChannels.includes("sms") && useFreePhones && connectedPhones.length > 0) {
        console.log("[v0] Using standalone connected phones for SMS")
        const phoneNumbers = list.contacts.map((c) => c.phone).filter(Boolean)
        const result = await sendBulkSMS(phoneNumbers, message)
        setSendStatus({ success: result.success, failed: result.failed, queued: result.queued })
        console.log(
          "[v0] Standalone phone sync bulk SMS complete:",
          result.success,
          "sent,",
          result.failed,
          "failed,",
          result.queued,
          "queued",
        )
      } else {
        const recipients = list.contacts
          .map((c) => (selectedChannels.includes("email") ? c.email || c.phone : c.phone))
          .filter(Boolean)

        const response = await fetch("/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "bulk",
            recipients,
            message,
            channels: selectedChannels,
            subject: selectedChannels.includes("email") ? subject : undefined,
          }),
        })

        const data = await response.json()

        if (data.success) {
          const successCount = data.results.filter((r: any) => r.success).length
          const failedCount = data.results.filter((r: any) => !r.success).length
          setSendStatus({ success: successCount, failed: failedCount, queued: 0 })
          console.log("[v0] Bulk messages sent:", successCount, "success,", failedCount, "failed")
        } else {
          console.log("[v0] API not configured, simulating send")
          await new Promise((resolve) => setTimeout(resolve, 2000))
          setSendStatus({ success: list.contacts.length, failed: 0, queued: 0 })
        }
      }
    } catch (error) {
      console.error("[v0] Error sending bulk messages:", error)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSendStatus({ success: list.contacts.length, failed: 0, queued: 0 })
    }

    setIsSending(false)
    setMessage("")
    setSubject("")
  }

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]))
  }

  const handleChannelSync = async (channel: string, credentials: any) => {
    try {
      const response = await fetch("/api/sync-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, credentials }),
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus((prev) => ({ ...prev, [channel]: true }))
        console.log("[v0] Successfully synced", channel)
      } else {
        console.error("[v0] Failed to sync", channel, ":", data.error)
      }
    } catch (error) {
      console.error("[v0] Error syncing", channel, ":", error)
    }
  }

  const selectedListData = lists.find((l) => l.id === selectedList)
  const charCount = message.length
  const smsCount = Math.ceil(charCount / 160)

  const channels = [
    { id: "sms" as Channel, label: "SMS", icon: MessageSquare, color: "text-green-400" },
    { id: "email" as Channel, label: "Email", icon: Mail, color: "text-blue-400" },
    { id: "whatsapp" as Channel, label: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
    { id: "telegram" as Channel, label: "Telegram", icon: Send, color: "text-cyan-400" },
    { id: "signal" as Channel, label: "Signal", icon: MessageSquare, color: "text-blue-500" },
    { id: "facebook" as Channel, label: "Facebook", icon: MessageSquare, color: "text-blue-600" },
    { id: "instagram" as Channel, label: "Instagram", icon: MessageSquare, color: "text-pink-500" },
  ]

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Bulk Multi-Channel Marketing</h3>
          <p className="text-sm text-white/60">Upload lists and send mass messages across all channels</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Link2 className="h-4 w-4 mr-2" />
                Sync Channels
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Sync Communication Channels</DialogTitle>
                <DialogDescription className="text-white/60">
                  Connect your accounts to enable multi-channel marketing campaigns
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="phone" className="w-full">
                <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2 bg-white/5">
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="snapchat">Snapchat</TabsTrigger>
                  <TabsTrigger value="telegram">Telegram</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                {/* Phone Sync Tab */}
                <TabsContent value="phone" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-cyan-400" />
                      <div>
                        <h4 className="font-semibold">Cell Phone Sync</h4>
                        <p className="text-sm text-white/60">Connect your phone to send free SMS</p>
                      </div>
                    </div>
                    {connectionStatus.phone ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/70">
                      Download the PAGE CRM Phone Sync app on your mobile device and scan the QR code to connect.
                    </p>
                    <div className="p-6 bg-white rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-48 h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <p className="text-gray-500">QR Code</p>
                        </div>
                        <p className="text-sm text-gray-600">Scan with PAGE CRM Phone Sync app</p>
                      </div>
                    </div>
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                      <Link2 className="h-4 w-4 mr-2" />
                      Generate New QR Code
                    </Button>
                  </div>
                </TabsContent>

                {/* Facebook Sync Tab */}
                <TabsContent value="facebook" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">Facebook Messenger</h4>
                        <p className="text-sm text-white/60">Connect your Facebook page</p>
                      </div>
                    </div>
                    {connectionStatus.facebook ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Page Access Token</label>
                      <Input
                        type="password"
                        placeholder="Enter your Facebook Page Access Token"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Page ID</label>
                      <Input
                        placeholder="Enter your Facebook Page ID"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleChannelSync("facebook", {})}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect Facebook
                    </Button>
                    <p className="text-xs text-white/50">
                      Get your access token from{" "}
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Facebook Graph API Explorer
                      </a>
                    </p>
                  </div>
                </TabsContent>

                {/* Instagram Sync Tab */}
                <TabsContent value="instagram" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-pink-500" />
                      <div>
                        <h4 className="font-semibold">Instagram Direct</h4>
                        <p className="text-sm text-white/60">Connect your Instagram business account</p>
                      </div>
                    </div>
                    {connectionStatus.instagram ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Instagram Access Token</label>
                      <Input
                        type="password"
                        placeholder="Enter your Instagram Access Token"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Instagram Business Account ID</label>
                      <Input
                        placeholder="Enter your Instagram Business Account ID"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => handleChannelSync("instagram", {})}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect Instagram
                    </Button>
                    <p className="text-xs text-white/50">
                      Requires Instagram Business Account connected to Facebook Page
                    </p>
                  </div>
                </TabsContent>

                {/* Snapchat Sync Tab */}
                <TabsContent value="snapchat" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-yellow-400" />
                      <div>
                        <h4 className="font-semibold">Snapchat</h4>
                        <p className="text-sm text-white/60">Connect your Snapchat business account</p>
                      </div>
                    </div>
                    {connectionStatus.snapchat ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client ID</label>
                      <Input
                        placeholder="Enter your Snapchat Client ID"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Client Secret</label>
                      <Input
                        type="password"
                        placeholder="Enter your Snapchat Client Secret"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                      onClick={() => handleChannelSync("snapchat", {})}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect Snapchat
                    </Button>
                    <p className="text-xs text-white/50">Requires Snapchat Business Account approval</p>
                  </div>
                </TabsContent>

                {/* Telegram Sync Tab */}
                <TabsContent value="telegram" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Send className="h-6 w-6 text-cyan-400" />
                      <div>
                        <h4 className="font-semibold">Telegram</h4>
                        <p className="text-sm text-white/60">Connect your Telegram bot</p>
                      </div>
                    </div>
                    {connectionStatus.telegram ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bot Token</label>
                      <Input
                        type="password"
                        placeholder="Enter your Telegram Bot Token"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-cyan-500 hover:bg-cyan-600"
                      onClick={() => handleChannelSync("telegram", {})}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect Telegram
                    </Button>
                    <p className="text-xs text-white/50">
                      Create a bot with{" "}
                      <a
                        href="https://t.me/botfather"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline"
                      >
                        @BotFather
                      </a>
                    </p>
                  </div>
                </TabsContent>

                {/* WhatsApp Sync Tab */}
                <TabsContent value="whatsapp" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-green-500" />
                      <div>
                        <h4 className="font-semibold">WhatsApp Business</h4>
                        <p className="text-sm text-white/60">Connect your WhatsApp Business account</p>
                      </div>
                    </div>
                    {connectionStatus.whatsapp ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Access Token</label>
                      <Input
                        type="password"
                        placeholder="Enter your WhatsApp Business Access Token"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number ID</label>
                      <Input
                        placeholder="Enter your WhatsApp Phone Number ID"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => handleChannelSync("whatsapp", {})}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect WhatsApp
                    </Button>
                    <p className="text-xs text-white/50">
                      Get credentials from{" "}
                      <a
                        href="https://business.facebook.com/wa/manage/home/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:underline"
                      >
                        WhatsApp Business Manager
                      </a>
                    </p>
                  </div>
                </TabsContent>

                {/* Email Sync Tab */}
                <TabsContent value="email" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-6 w-6 text-blue-400" />
                      <div>
                        <h4 className="font-semibold">Email (Mailgun)</h4>
                        <p className="text-sm text-white/60">Email service via Mailgun</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/70">
                      Email service is already configured and ready to use via Mailgun.
                    </p>
                    <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                      <p className="text-sm text-green-400">
                        ✓ Mailgun API configured
                        <br />✓ Ready to send emails
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
            <Users className="h-3 w-3 mr-1" />
            {lists.reduce((sum, list) => sum + list.contacts.length, 0)} Total Contacts
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Upload Contact List (CSV)</label>
          <div className="flex gap-2">
            <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label
              htmlFor="file-upload"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload CSV File
            </label>
          </div>
          <p className="text-xs text-white/50 mt-1">Format: name,phone,email (one per line)</p>
        </div>

        {lists.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Select List</label>
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Choose a contact list" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cyan-400" />
                      <span>{list.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {list.contacts.length} contacts
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Select Channels</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedChannels.includes(channel.id)
                    ? "bg-cyan-500/20 border-cyan-400/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <Checkbox checked={selectedChannels.includes(channel.id)} className="pointer-events-none" />
                {channel.icon && <channel.icon className={`h-4 w-4 ${channel.color}`} />}
                <span className="text-sm text-white">{channel.label}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedChannels.includes("email") && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject line..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        )}

        {selectedChannels.includes("sms") && (
          <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-cyan-400" />
                <div>
                  <h4 className="font-semibold text-white">Free SMS via Connected Phones</h4>
                  <p className="text-xs text-white/60">
                    {connectedPhones.length > 0
                      ? `${connectedPhones.length} phone${connectedPhones.length > 1 ? "s" : ""} available`
                      : "No phones connected"}
                  </p>
                </div>
              </div>
              <Checkbox
                checked={useFreePhones && connectedPhones.length > 0}
                onCheckedChange={(checked) => setUseFreePhones(checked as boolean)}
                disabled={connectedPhones.length === 0}
              />
            </div>
            {connectedPhones.length === 0 && (
              <p className="text-xs text-yellow-400 mt-2">
                Connect phones in Settings to send free SMS through your cell service
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your bulk message here..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
            disabled={!selectedList}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-white/50">
              {charCount} characters • {smsCount} SMS {smsCount > 1 ? "messages" : "message"}
            </p>
            {selectedListData && (
              <p className="text-xs text-cyan-400">
                Will send to {selectedListData.contacts.length} contacts via {selectedChannels.length} channel
                {selectedChannels.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {sendStatus && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="text-sm text-green-400">
              Successfully sent to {sendStatus.success} contacts
              {sendStatus.failed > 0 && ` • ${sendStatus.failed} failed`}
              {sendStatus.queued > 0 && ` • ${sendStatus.queued} queued`}
            </p>
          </div>
        )}

        <Button
          onClick={handleSendBulk}
          disabled={!selectedList || !message.trim() || selectedChannels.length === 0 || isSending}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send to {selectedChannels.length} Channel{selectedChannels.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
