"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import {
  getConnectedPlatforms,
  connectWhatsApp,
  connectTelegram,
  connectSignal,
  connectFacebook,
  connectInstagram,
  connectSnapchat,
  removePlatform,
  updatePlatformStatus,
  getPlatformInstructions,
  type SocialPlatform,
} from "@/lib/social-platform-sync"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const platformIcons = {
  whatsapp: "💬",
  telegram: "✈️",
  signal: "🔒",
  facebook: "👥",
  instagram: "📷",
  snapchat: "👻",
}

const platformColors = {
  whatsapp: "bg-green-500/20 text-green-400 border-green-400/30",
  telegram: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  signal: "bg-indigo-500/20 text-indigo-400 border-indigo-400/30",
  facebook: "bg-blue-600/20 text-blue-400 border-blue-400/30",
  instagram: "bg-pink-500/20 text-pink-400 border-pink-400/30",
  snapchat: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
}

export function SocialPlatformManager() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPlatformType, setSelectedPlatformType] = useState<SocialPlatform["type"] | null>(null)
  const [formData, setFormData] = useState({
    accountName: "",
    phoneNumber: "",
  })

  useEffect(() => {
    loadPlatforms()
    const interval = setInterval(loadPlatforms, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadPlatforms = () => {
    setPlatforms(getConnectedPlatforms())
  }

  const handleConnectPlatform = () => {
    if (!selectedPlatformType || !formData.accountName) return

    let platform: SocialPlatform

    switch (selectedPlatformType) {
      case "whatsapp":
        platform = connectWhatsApp(formData.phoneNumber, formData.accountName)
        break
      case "telegram":
        platform = connectTelegram(formData.phoneNumber, formData.accountName)
        break
      case "signal":
        platform = connectSignal(formData.phoneNumber, formData.accountName)
        break
      case "facebook":
        platform = connectFacebook(formData.accountName)
        break
      case "instagram":
        platform = connectInstagram(formData.accountName)
        break
      case "snapchat":
        platform = connectSnapchat(formData.accountName)
        break
    }

    // Simulate authentication process
    setTimeout(() => {
      updatePlatformStatus(platform.id, "connected")
      loadPlatforms()
    }, 2000)

    setFormData({ accountName: "", phoneNumber: "" })
    setSelectedPlatformType(null)
    setIsAddDialogOpen(false)
  }

  const handleRemovePlatform = (platformId: string) => {
    removePlatform(platformId)
    loadPlatforms()
  }

  const getStatusIcon = (status: SocialPlatform["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "authenticating":
        return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
    }
  }

  const getStatusColor = (status: SocialPlatform["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "disconnected":
        return "bg-red-500/20 text-red-400 border-red-400/30"
      case "authenticating":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
    }
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Social Platform Accounts</h3>
          <p className="text-sm text-white/60">
            Connect your existing personal accounts - No business accounts required
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Connect Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Connect Social Platform</DialogTitle>
              <DialogDescription className="text-white/60">
                Use your existing personal accounts - No paid APIs or business accounts needed
              </DialogDescription>
            </DialogHeader>

            {!selectedPlatformType ? (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {(["whatsapp", "telegram", "signal", "facebook", "instagram", "snapchat"] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedPlatformType(type)}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${platformColors[type]}`}
                  >
                    <span className="text-3xl">{platformIcons[type]}</span>
                    <span className="capitalize font-semibold">{type}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <Tabs defaultValue="connect" className="mt-4">
                <TabsList className="grid w-full grid-cols-2 bg-white/5">
                  <TabsTrigger value="connect">Connect Account</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                </TabsList>

                <TabsContent value="connect" className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-3xl">{platformIcons[selectedPlatformType]}</span>
                    <div>
                      <h4 className="font-semibold text-white capitalize">{selectedPlatformType}</h4>
                      <p className="text-sm text-white/60">Connect your personal account</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name / Username</label>
                    <Input
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      placeholder="Your account name"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  {(selectedPlatformType === "whatsapp" ||
                    selectedPlatformType === "telegram" ||
                    selectedPlatformType === "signal") && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+1234567890"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedPlatformType(null)}
                      variant="outline"
                      className="flex-1 border-white/10 text-white hover:bg-white/10"
                    >
                      Back
                    </Button>
                    <Button onClick={handleConnectPlatform} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                      Connect {selectedPlatformType}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="instructions" className="space-y-4">
                  {(() => {
                    const instructions = getPlatformInstructions(selectedPlatformType)
                    return (
                      <>
                        <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                          <h4 className="font-semibold text-cyan-400 mb-3">{instructions.title}</h4>
                          <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                            {instructions.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">Requirements</h4>
                          <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                            {instructions.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )
                  })()}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {platforms.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No platforms connected</p>
          <p className="text-sm text-white/40">Connect your existing social media accounts to send messages</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{platformIcons[platform.type]}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white capitalize">{platform.type}</h4>
                    <Badge className={getStatusColor(platform.status)}>{platform.status}</Badge>
                  </div>
                  <p className="text-sm text-white/60">{platform.accountName}</p>
                  {platform.phoneNumber && <p className="text-xs text-white/40">{platform.phoneNumber}</p>}
                  <p className="text-xs text-white/40 mt-1">{platform.messagesSent} messages sent</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemovePlatform(platform.id)}
                className="border-red-400/30 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
        <h4 className="font-semibold text-green-400 mb-2">Use Your Existing Personal Accounts</h4>
        <p className="text-sm text-white/70">
          No need for business accounts or paid APIs. Connect your personal WhatsApp, Telegram, Signal, Facebook,
          Instagram, and Snapchat accounts directly to the CRM and send messages through your existing accounts.
        </p>
      </div>
    </Card>
  )
}
