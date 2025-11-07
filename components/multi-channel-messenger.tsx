"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, MessageSquare, QrCode, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { MessagingCenter } from "@/components/messaging-center"

export function MultiChannelMessenger() {
  const [phoneConnected, setPhoneConnected] = useState(false)
  const [connectionCode, setConnectionCode] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  // Mock phone sync status
  const [syncStatus, setSyncStatus] = useState({
    sms: true,
    whatsapp: true,
    telegram: false,
    signal: false,
    snapchat: false,
  })

  const handleGenerateCode = () => {
    setIsConnecting(true)
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setConnectionCode(code)

    // Simulate connection after 3 seconds
    setTimeout(() => {
      setPhoneConnected(true)
      setIsConnecting(false)
    }, 3000)
  }

  const handleDisconnect = () => {
    setPhoneConnected(false)
    setConnectionCode("")
    setSyncStatus({
      sms: false,
      whatsapp: false,
      telegram: false,
      signal: false,
      snapchat: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Multi-Channel Messenger</h2>
          <p className="text-white/70 mt-1">Unified inbox for all your messaging channels</p>
        </div>
        {phoneConnected && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Phone Connected
          </Badge>
        )}
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="bg-black/40 border border-cyan-500/30">
          <TabsTrigger value="inbox" className="data-[state=active]:bg-cyan-500/20">
            <MessageSquare className="h-4 w-4 mr-2" />
            Unified Inbox
          </TabsTrigger>
          <TabsTrigger value="phone-sync" className="data-[state=active]:bg-cyan-500/20">
            <Smartphone className="h-4 w-4 mr-2" />
            Phone Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 mt-4">
          {!phoneConnected ? (
            <Card className="bg-black/40 border-cyan-500/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                    <Smartphone className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Connect Your Phone First</h3>
                    <p className="text-white/70 text-sm mt-1">
                      Please connect your phone in the Phone Sync tab to start receiving messages
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const phoneSyncTab = document.querySelector('[value="phone-sync"]') as HTMLElement
                      phoneSyncTab?.click()
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Go to Phone Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <MessagingCenter />
          )}
        </TabsContent>

        <TabsContent value="phone-sync" className="space-y-4 mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Connection Status Card */}
            <Card className="bg-black/40 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Phone Connection
                </CardTitle>
                <CardDescription className="text-white/70">
                  Connect your cell phone to sync messaging services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!phoneConnected ? (
                  <>
                    {!connectionCode ? (
                      <div className="space-y-4">
                        <p className="text-sm text-white/70">
                          Click the button below to generate a connection code. You'll use this code in the PAGE CRM
                          mobile app to sync your phone.
                        </p>
                        <Button onClick={handleGenerateCode} className="w-full bg-cyan-500 hover:bg-cyan-600">
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate Connection Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-6 text-center">
                          <p className="text-sm text-white/70 mb-2">Your Connection Code:</p>
                          <p className="text-4xl font-bold text-cyan-400 tracking-wider">{connectionCode}</p>
                        </div>
                        {isConnecting && (
                          <div className="flex items-center justify-center gap-2 text-cyan-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Waiting for phone connection...</span>
                          </div>
                        )}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <p className="text-sm text-white/90 font-medium mb-2">Next Steps:</p>
                          <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
                            <li>Open PAGE CRM app on your phone</li>
                            <li>Go to Settings → Connect to Desktop</li>
                            <li>Enter the code above</li>
                            <li>Grant permissions for messaging apps</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Phone Connected Successfully</p>
                        <p className="text-xs text-white/70">Your phone is synced and ready to send/receive messages</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                    >
                      Disconnect Phone
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Synced Services Card */}
            <Card className="bg-black/40 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Synced Services
                </CardTitle>
                <CardDescription className="text-white/70">Messaging services available on your phone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "SMS", key: "sms", color: "green" },
                  { name: "WhatsApp", key: "whatsapp", color: "green" },
                  { name: "Telegram", key: "telegram", color: "blue" },
                  { name: "Signal", key: "signal", color: "blue" },
                  { name: "Snapchat", key: "snapchat", color: "yellow" },
                ].map((service) => {
                  const isActive = phoneConnected && syncStatus[service.key as keyof typeof syncStatus]
                  return (
                    <div
                      key={service.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <span className="text-white font-medium">{service.name}</span>
                      {isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-white/20 text-white/50">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Setup Guide */}
          <Card className="bg-black/40 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
              <CardDescription className="text-white/70">
                Connect your phone to send and receive messages through your existing apps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-white">Install Mobile App</h4>
                  <p className="text-sm text-white/70">Download PAGE CRM mobile app from App Store or Google Play</p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-white">Connect & Sync</h4>
                  <p className="text-sm text-white/70">
                    Use the connection code to link your phone and grant permissions
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-white">Start Messaging</h4>
                  <p className="text-sm text-white/70">
                    Send and receive messages from all your apps in one unified inbox
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
