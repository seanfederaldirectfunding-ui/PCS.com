"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react"

export function SoftPhone() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)

  const recentCalls = [
    { name: "Sarah Mitchell", number: "+1 (555) 123-4567", time: "2m ago", type: "outgoing" },
    { name: "Mike Roberts", number: "+1 (555) 234-5678", time: "15m ago", type: "incoming" },
    { name: "Lisa Chen", number: "+1 (555) 345-6789", time: "1h ago", type: "missed" },
  ]

  useEffect(() => {
    const checkVoIPConnection = async () => {
      try {
        setConnectionStatus("connecting")
        const response = await fetch("/api/voip/call")
        const data = await response.json()

        if (data.success && data.voip.configured) {
          setIsConnected(true)
          setConnectionStatus("connected")
          console.log("[v0] VoIPstudio connected:", data.voip.server)
        } else {
          setConnectionStatus("disconnected")
          console.log("[v0] VoIPstudio not configured")
        }
      } catch (error) {
        setConnectionStatus("disconnected")
        console.error("[v0] VoIPstudio connection check failed:", error)
      }
    }

    checkVoIPConnection()
  }, [])

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [isInCall])

  const handleDialPad = (digit: string) => {
    setPhoneNumber((prev) => prev + digit)
  }

  const handleCall = async () => {
    if (!phoneNumber) return

    try {
      console.log("[v0] Initiating call to:", phoneNumber)
      setIsInCall(true)

      const response = await fetch("/api/voip/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentCallId(data.callId)
        console.log("[v0] Call initiated successfully:", data.callId)
      } else {
        console.error("[v0] Call failed:", data.error)
        setIsInCall(false)
        alert(`Call failed: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Call error:", error)
      setIsInCall(false)
      alert("Failed to make call. Please check your VoIP configuration.")
    }
  }

  const handleHangup = () => {
    setIsInCall(false)
    setPhoneNumber("")
    setIsMuted(false)
    setCurrentCallId(null)
    console.log("[v0] Call ended")
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6 sticky top-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-white">Soft Phone</h3>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">VoIPstudio Ready</Badge>
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <Wifi className="h-4 w-4 text-yellow-400 animate-pulse" />
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30 text-xs">Connecting...</Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-400" />
                <Badge className="bg-red-500/20 text-red-400 border-red-400/30 text-xs">Not Connected</Badge>
              </>
            )}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-center text-lg"
            disabled={isInCall}
          />
          {isInCall && (
            <div className="text-center">
              <p className="text-sm text-white/60">Call in progress</p>
              <p className="text-2xl font-bold text-cyan-400">{formatDuration(callDuration)}</p>
              {currentCallId && <p className="text-xs text-white/40">Call ID: {currentCallId}</p>}
            </div>
          )}
        </div>

        {/* Dial Pad */}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
            <Button
              key={digit}
              onClick={() => handleDialPad(digit)}
              variant="outline"
              className="h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white font-semibold"
              disabled={isInCall}
            >
              {digit}
            </Button>
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex gap-2">
          {!isInCall ? (
            <Button
              onClick={handleCall}
              disabled={!phoneNumber || !isConnected}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                className={`flex-1 ${isMuted ? "bg-red-500/20 border-red-400/30" : "bg-white/5 border-white/10"}`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                variant="outline"
                className={`flex-1 ${!isSpeakerOn ? "bg-red-500/20 border-red-400/30" : "bg-white/5 border-white/10"}`}
              >
                {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleHangup}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End
              </Button>
            </>
          )}
        </div>

        {/* Recent Calls */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white/80">Recent Calls</h4>
          <div className="space-y-2">
            {recentCalls.map((call, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => setPhoneNumber(call.number)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{call.name}</p>
                  <p className="text-xs text-white/60">{call.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60">{call.time}</p>
                  <Badge
                    className={`text-xs ${
                      call.type === "outgoing"
                        ? "bg-blue-500/20 text-blue-400"
                        : call.type === "incoming"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {call.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VoIP Status */}
        {!isConnected && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
            <p className="text-xs text-yellow-400 text-center">
              VoIPstudio API key required. Add VOIPSTUDIO_API_KEY to environment variables.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
