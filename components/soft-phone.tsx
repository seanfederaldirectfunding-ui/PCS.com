"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Wifi, WifiOff, Loader2 } from "lucide-react"
import { dialerAPI } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"

// Declare Twilio types since we're dynamically importing
declare global {
  interface Window {
    Twilio?: any;
  }
}

export function SoftPhone() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [currentCall, setCurrentCall] = useState<any>(null)
  const [device, setDevice] = useState<any>(null)
  
  const callDurationRef = useRef<NodeJS.Timeout>()

  const currentUser = authService.getCurrentUser()

  // Initialize Twilio device
  useEffect(() => {
    initializeTwilioDevice()
    return () => {
      if (device) {
        device.destroy()
      }
    }
  }, [])

  // Call timer
  useEffect(() => {
    if (callState === "connected") {
      callDurationRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (callDurationRef.current) {
        clearInterval(callDurationRef.current)
      }
      setCallDuration(0)
    }

    return () => {
      if (callDurationRef.current) {
        clearInterval(callDurationRef.current)
      }
    }
  }, [callState])

  const initializeTwilioDevice = async () => {
    if (!currentUser) return

    try {
      setConnectionStatus("connecting")
      
      // Get token from backend
      const response = await dialerAPI.getToken(currentUser.userId)
      
      if (!response.data.success) {
        throw new Error('Failed to get token')
      }

      // Dynamically import Twilio SDK
      const { Device } = await import('@twilio/voice-sdk')
      
      const newDevice = new Device(response.data.token, {
        codecPreferences: ['opus', 'pcmu'],
        fakeLocalDTMF: true,
        enableRingingState: true,
        logLevel: 1
      })

      newDevice.on('registered', () => {
        console.log('[Twilio] Device registered and ready')
        setConnectionStatus("connected")
      })

      newDevice.on('error', (error: any) => {
        console.error('[Twilio] Device error:', error)
        setConnectionStatus("disconnected")
      })

      newDevice.on('incoming', (call: any) => {
        console.log('[Twilio] Incoming call:', call)
        // Handle incoming calls if needed
      })

      newDevice.on('cancel', () => {
        console.log('[Twilio] Call canceled')
        setCallState("idle")
        setCurrentCall(null)
      })

      await newDevice.register()
      setDevice(newDevice)

    } catch (error) {
      console.error('[Twilio] Initialization failed:', error)
      setConnectionStatus("disconnected")
    }
  }

  const handleDialPad = (digit: string) => {
    setPhoneNumber(prev => prev + digit)
  }

  const makeCall = async () => {
    if (!phoneNumber || !device) return

    try {
      setCallState("calling")
      
      // Make the call through Twilio device
      const call = await device.connect({
        params: {
          To: phoneNumber,
          From: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER
        }
      })

      setCurrentCall(call)

      // Set up call event handlers
      call.on('accept', () => {
        console.log('[Twilio] Call accepted')
        setCallState("connected")
        
        // Log the successful call
        if (currentUser) {
          dialerAPI.logCall({
            userId: currentUser.userId,
            phoneNumber,
            callSid: call.parameters.CallSid
          }).catch(console.error)
        }
      })

      call.on('disconnect', () => {
        console.log('[Twilio] Call disconnected')
        setCallState("idle")
        setCurrentCall(null)
      })

      call.on('ringing', () => {
        console.log('[Twilio] Call ringing')
        setCallState("ringing")
      })

      call.on('cancel', () => {
        console.log('[Twilio] Call canceled')
        setCallState("idle")
        setCurrentCall(null)
      })

      call.on('error', (error: any) => {
        console.error('[Twilio] Call error:', error)
        setCallState("idle")
        setCurrentCall(null)
      })

    } catch (error) {
      console.error('[Twilio] Failed to make call:', error)
      setCallState("idle")
      alert("Failed to make call. Please check your connection.")
    }
  }

  const hangUpCall = () => {
    if (currentCall) {
      currentCall.disconnect()
    }
    setCallState("idle")
    setCurrentCall(null)
  }

  const toggleMute = () => {
    if (currentCall) {
      if (!isMuted) {
        currentCall.mute()
        setIsMuted(true)
      } else {
        currentCall.mute(false)
        setIsMuted(false)
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getCallStateMessage = () => {
    switch (callState) {
      case "calling":
        return "Connecting..."
      case "ringing":
        return "Ringing..."
      case "connected":
        return "Call connected"
      default:
        return ""
    }
  }

  const isInCall = callState !== "idle"

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6 sticky top-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-white">Browser Phone</h3>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">Ready</Badge>
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <Wifi className="h-4 w-4 text-yellow-400 animate-pulse" />
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30 text-xs">Connecting...</Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-400" />
                <Badge className="bg-red-500/20 text-red-400 border-red-400/30 text-xs">Offline</Badge>
              </>
            )}
          </div>
        </div>

        {/* Connection Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-400">🎧 Browser Calling Mode</p>
            <p className="text-xs text-blue-300">
              • Speak through microphone<br/>
              • Listen through speakers<br/>
              • No physical phone needed!
            </p>
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
            <div className="text-center space-y-2">
              {callState === "calling" && (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <p className="text-sm text-cyan-400">{getCallStateMessage()}</p>
                </div>
              )}
              
              {callState === "ringing" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 animate-pulse text-yellow-400" />
                    <p className="text-sm text-yellow-400">{getCallStateMessage()}</p>
                  </div>
                  <p className="text-xs text-white/40">Calling {phoneNumber}</p>
                </div>
              )}
              
              {callState === "connected" && (
                <div className="space-y-1">
                  <p className="text-sm text-green-400">{getCallStateMessage()}</p>
                  <p className="text-2xl font-bold text-cyan-400">{formatDuration(callDuration)}</p>
                </div>
              )}
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
              onClick={makeCall}
              disabled={!phoneNumber || connectionStatus !== "connected"}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
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
                onClick={hangUpCall}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End
              </Button>
            </>
          )}
        </div>

        {/* Call Status Info */}
        {isInCall && (
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
            <p className="text-xs text-cyan-400 text-center">
              💡 You are speaking through your browser microphone
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}



