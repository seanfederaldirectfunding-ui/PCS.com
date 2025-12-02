"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Plus, Trash2, CheckCircle2, XCircle, Circle, QrCode, Copy, Download } from "lucide-react"
import {
  getConnectedPhones,
  registerPhone,
  removePhone,
  generateConnectionCode,
  type ConnectedPhone,
} from "@/lib/standalone-phone-sync"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PhoneManager() {
  const [phones, setPhones] = useState<ConnectedPhone[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPhone, setNewPhone] = useState({
    name: "",
    phoneNumber: "",
  })
  const [selectedPhone, setSelectedPhone] = useState<ConnectedPhone | null>(null)
  const [connectionCode, setConnectionCode] = useState("")

  useEffect(() => {
    loadPhones()
    // Refresh phone list every 10 seconds
    const interval = setInterval(loadPhones, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadPhones = () => {
    setPhones(getConnectedPhones())
  }

  const handleAddPhone = () => {
    if (!newPhone.name || !newPhone.phoneNumber) return

    const phone = registerPhone(newPhone.name, newPhone.phoneNumber)
    const code = generateConnectionCode(phone.id)
    setConnectionCode(code)
    setSelectedPhone(phone)

    setNewPhone({
      name: "",
      phoneNumber: "",
    })
    loadPhones()
  }

  const handleRemovePhone = (phoneId: string) => {
    removePhone(phoneId)
    loadPhones()
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(connectionCode)
  }

  const handleShowCode = (phone: ConnectedPhone) => {
    const code = generateConnectionCode(phone.id)
    setConnectionCode(code)
    setSelectedPhone(phone)
  }

  const getStatusIcon = (status: ConnectedPhone["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "busy":
        return <Circle className="h-4 w-4 text-yellow-400 animate-pulse" />
    }
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
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Connected Phones</h3>
          <p className="text-sm text-white/60">Manage phones for free SMS sending - No third-party services required</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Phone
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Connect New Phone</DialogTitle>
              <DialogDescription className="text-white/60">
                Add a phone to send SMS through your existing cell service - completely free
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="register" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="register">Register Phone</TabsTrigger>
                <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
              </TabsList>

              <TabsContent value="register" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Name</label>
                  <Input
                    value={newPhone.name}
                    onChange={(e) => setNewPhone({ ...newPhone, name: e.target.value })}
                    placeholder="My iPhone"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={newPhone.phoneNumber}
                    onChange={(e) => setNewPhone({ ...newPhone, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Button onClick={handleAddPhone} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                  Register Phone
                </Button>

                {connectionCode && selectedPhone && (
                  <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                    <h4 className="font-semibold text-cyan-400 mb-3">Connection Code for {selectedPhone.name}</h4>
                    <div className="bg-black/40 p-3 rounded font-mono text-sm text-white break-all mb-3">
                      {connectionCode}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCopyCode} className="flex-1 bg-white/10 hover:bg-white/20 text-white">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                      >
                        Done
                      </Button>
                    </div>
                    <p className="text-xs text-white/60 mt-3">
                      Enter this code in the PAGE CRM Phone App to connect your phone
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="instructions" className="space-y-4">
                <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-400 mb-3">How to Connect Your Phone</h4>
                  <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                    <li>Register your phone in the "Register Phone" tab</li>
                    <li>Copy the connection code provided</li>
                    <li>Install the PAGE CRM Phone App on your Android device</li>
                    <li>Open the app and enter the connection code</li>
                    <li>Grant SMS permissions when prompted</li>
                    <li>Your phone will connect automatically and appear online</li>
                  </ol>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Download Phone App</h4>
                  <p className="text-sm text-white/60 mb-3">
                    The companion app runs on your Android phone and connects to this CRM to send/receive SMS
                  </p>
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download Android App (Coming Soon)
                  </Button>
                  <p className="text-xs text-white/40 mt-2">
                    For now, use the web interface to simulate phone connections
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {phones.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No phones connected</p>
          <p className="text-sm text-white/40">Add a phone to start sending free SMS through your cell service</p>
        </div>
      ) : (
        <div className="space-y-3">
          {phones.map((phone) => (
            <div
              key={phone.id}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Smartphone className="h-8 w-8 text-cyan-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{phone.name}</h4>
                    <Badge className={getStatusColor(phone.status)}>{phone.status}</Badge>
                  </div>
                  <p className="text-sm text-white/60">{phone.phoneNumber}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {phone.messagesSent} messages sent • Last used: {new Date(phone.lastUsed).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowCode(phone)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemovePhone(phone.id)}
                  className="border-red-400/30 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
        <h4 className="font-semibold text-green-400 mb-2">100% Free - No Third-Party Services</h4>
        <p className="text-sm text-white/70">
          This system connects directly to your phones via a companion app. No Pushbullet, Twilio, or any paid service
          required. Send unlimited SMS using your existing cell phone plan.
        </p>
      </div>
    </Card>
  )
}
