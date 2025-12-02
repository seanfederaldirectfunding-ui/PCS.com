"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, QrCode, CheckCircle2, MessageSquare, Download, Copy, RefreshCw } from "lucide-react"
import {
  getConnectedPhones,
  registerPhone,
  removePhone,
  generateConnectionCode,
  type ConnectedPhone,
} from "@/lib/standalone-phone-sync"

export function PhoneSyncHub() {
  const [phones, setPhones] = useState<ConnectedPhone[]>([])
  const [newPhoneName, setNewPhoneName] = useState("")
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [connectionCode, setConnectionCode] = useState("")
  const [selectedPhone, setSelectedPhone] = useState<ConnectedPhone | null>(null)

  useEffect(() => {
    loadPhones()
    const interval = setInterval(loadPhones, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadPhones = () => {
    setPhones(getConnectedPhones())
  }

  const handleRegisterPhone = () => {
    if (!newPhoneName || !newPhoneNumber) return

    const phone = registerPhone(newPhoneName, newPhoneNumber)
    const code = generateConnectionCode(phone.id)
    setConnectionCode(code)
    setSelectedPhone(phone)
    setNewPhoneName("")
    setNewPhoneNumber("")
    loadPhones()
  }

  const handleRemovePhone = (phoneId: string) => {
    removePhone(phoneId)
    loadPhones()
  }

  const handleShowCode = (phone: ConnectedPhone) => {
    const code = generateConnectionCode(phone.id)
    setConnectionCode(code)
    setSelectedPhone(phone)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(connectionCode)
  }

  const getStatusColor = (status: ConnectedPhone["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "offline":
        return "bg-red-500/20 text-red-400 border-red-400/30"
      case "busy":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Phone Sync</h2>
          <p className="text-white/60 mt-1">
            Connect your cell phone to send SMS, WhatsApp, Telegram, Signal & Snapchat - No API keys needed
          </p>
        </div>
        <Button
          onClick={loadPhones}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10 bg-transparent"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="phones" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="phones" className="data-[state=active]:bg-cyan-500">
            <Smartphone className="h-4 w-4 mr-2" />
            Connected Phones ({phones.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="data-[state=active]:bg-cyan-500">
            <QrCode className="h-4 w-4 mr-2" />
            Add New Phone
          </TabsTrigger>
          <TabsTrigger value="setup" className="data-[state=active]:bg-cyan-500">
            <Download className="h-4 w-4 mr-2" />
            Setup Guide
          </TabsTrigger>
        </TabsList>

        {/* Connected Phones Tab */}
        <TabsContent value="phones" className="space-y-4">
          {phones.length === 0 ? (
            <Card className="bg-white/5 border-white/10 p-12 text-center">
              <Smartphone className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Phones Connected</h3>
              <p className="text-white/60 mb-4">
                Connect your cell phone to start sending messages through your existing services
              </p>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                <QrCode className="h-4 w-4 mr-2" />
                Add Your First Phone
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {phones.map((phone) => (
                <Card key={phone.id} className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{phone.name}</h3>
                          <Badge className={getStatusColor(phone.status)}>{phone.status}</Badge>
                        </div>
                        <p className="text-white/60">{phone.phoneNumber}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
                          <span>{phone.messagesSent} messages sent</span>
                          <span>•</span>
                          <span>Last used: {new Date(phone.lastUsed).toLocaleString()}</span>
                        </div>

                        {/* Supported Services */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-white/40">Synced Services:</span>
                          <Badge className="bg-green-500/20 text-green-400 text-xs">SMS</Badge>
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">WhatsApp</Badge>
                          <Badge className="bg-sky-500/20 text-sky-400 text-xs">Telegram</Badge>
                          <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">Signal</Badge>
                          <Badge className="bg-yellow-400/20 text-yellow-400 text-xs">Snapchat</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleShowCode(phone)}
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-white hover:bg-white/10"
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Show Code
                      </Button>
                      <Button
                        onClick={() => handleRemovePhone(phone.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-400/30 text-red-400 hover:bg-red-500/20"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Connection Code Display */}
          {connectionCode && selectedPhone && (
            <Card className="bg-cyan-500/10 border-cyan-400/30 p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Connection Code for {selectedPhone.name}</h3>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-white text-center text-lg mb-4">
                {connectionCode}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyCode}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  onClick={() => {
                    setConnectionCode("")
                    setSelectedPhone(null)
                  }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Done
                </Button>
              </div>
              <p className="text-xs text-white/60 mt-3 text-center">
                Enter this code in the PAGE CRM Phone App to sync your phone
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Add New Phone Tab */}
        <TabsContent value="add" className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Register New Phone</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Name</label>
                <Input
                  value={newPhoneName}
                  onChange={(e) => setNewPhoneName(e.target.value)}
                  placeholder="My iPhone / My Android"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                <Input
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleRegisterPhone}
                disabled={!newPhoneName || !newPhoneNumber}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Register Phone
              </Button>
            </div>
          </Card>

          {connectionCode && selectedPhone && (
            <Card className="bg-cyan-500/10 border-cyan-400/30 p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Connection Code for {selectedPhone.name}</h3>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-white text-center text-lg mb-4">
                {connectionCode}
              </div>
              <Button onClick={handleCopyCode} className="w-full bg-white/10 hover:bg-white/20 text-white">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <p className="text-xs text-white/60 mt-3 text-center">
                Enter this code in the PAGE CRM Phone App to sync your phone
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Setup Guide Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How Phone Sync Works</h3>
            <div className="space-y-4 text-white/70">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Register Your Phone</h4>
                  <p className="text-sm">
                    Add your phone in the "Add New Phone" tab. You'll receive a unique connection code.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Install PAGE CRM Phone App</h4>
                  <p className="text-sm">
                    Download and install the companion app on your Android or iOS device (links below).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Enter Connection Code</h4>
                  <p className="text-sm">
                    Open the app, enter your connection code, and grant permissions for SMS, WhatsApp, Telegram, Signal,
                    and Snapchat.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Start Sending Messages</h4>
                  <p className="text-sm">
                    Your phone will sync automatically. Send messages through SMS, WhatsApp, Telegram, Signal, and
                    Snapchat using your existing services - no API keys required!
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-green-500/10 border-green-400/30 p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Download Phone App</h3>
            <p className="text-white/70 mb-4">
              The companion app runs on your phone and syncs with PAGE CRM to send/receive messages through your
              existing services.
            </p>
            <div className="grid gap-3">
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                <Download className="h-4 w-4 mr-2" />
                Download for Android (Coming Soon)
              </Button>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                <Download className="h-4 w-4 mr-2" />
                Download for iOS (Coming Soon)
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-3 text-center">
              For now, use the web interface to simulate phone connections
            </p>
          </Card>

          <Card className="bg-cyan-500/10 border-cyan-400/30 p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">What Gets Synced?</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-400" />
                <span className="text-white/70 text-sm">SMS Messages</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span className="text-white/70 text-sm">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-sky-400" />
                <span className="text-white/70 text-sm">Telegram</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-white/70 text-sm">Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-yellow-400" />
                <span className="text-white/70 text-sm">Snapchat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span className="text-white/70 text-sm">All Free!</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
