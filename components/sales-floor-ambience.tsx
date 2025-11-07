"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Building2, DollarSign, FileText, Briefcase, TrendingUp } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Industry {
  id: string
  name: string
  icon: any
  description: string
  color: string
}

const industries: Industry[] = [
  {
    id: "mca",
    name: "Merchant Cash Advance",
    icon: DollarSign,
    description: "Fast business funding sales floor",
    color: "from-green-600 to-emerald-600",
  },
  {
    id: "business-loans",
    name: "Business Loans",
    icon: Building2,
    description: "Term loans and LOC sales environment",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "grant-writing",
    name: "Grant Writing",
    icon: FileText,
    description: "Professional grant consulting office",
    color: "from-purple-600 to-violet-600",
  },
  {
    id: "financial-services",
    name: "Financial Services",
    icon: TrendingUp,
    description: "General financial advisory floor",
    color: "from-orange-600 to-amber-600",
  },
  {
    id: "commercial-lending",
    name: "Commercial Lending",
    icon: Briefcase,
    description: "Commercial finance sales floor",
    color: "from-indigo-600 to-blue-600",
  },
]

export function SalesFloorAmbience() {
  const [isActive, setIsActive] = useState(false)
  const [volume, setVolume] = useState([70])
  const [selectedIndustry, setSelectedIndustry] = useState<string>("mca")
  const [isMuted, setIsMuted] = useState(false)

  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const ambienceGainRef = useRef<GainNode | null>(null)
  const gongIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const phoneIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      ambienceGainRef.current = audioContextRef.current.createGain()
      ambienceGainRef.current.connect(audioContextRef.current.destination)
    }
  }, [])

  // Update volume
  useEffect(() => {
    if (ambienceGainRef.current) {
      ambienceGainRef.current.gain.value = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Play synthesized ambience sound
  const playAmbience = () => {
    if (!audioContextRef.current || !ambienceGainRef.current) return

    const ctx = audioContextRef.current

    // Create brown noise for office ambience
    const bufferSize = 4096
    const brownNoise = ctx.createScriptProcessor(bufferSize, 1, 1)
    let lastOut = 0.0

    brownNoise.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = output[i]
        output[i] *= 0.1 // Reduce volume
      }
    }

    brownNoise.connect(ambienceGainRef.current)

    return brownNoise
  }

  // Play gong sound (deal closed)
  const playGong = () => {
    if (!audioContextRef.current || !ambienceGainRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 2)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2)

    oscillator.connect(gainNode)
    gainNode.connect(ambienceGainRef.current)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 2)

    console.log("[v0] 🎉 Deal closed! Gong sound played")
  }

  // Play phone ring sound
  const playPhoneRing = () => {
    if (!audioContextRef.current || !ambienceGainRef.current) return

    const ctx = audioContextRef.current

    // Create two-tone phone ring
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc1.frequency.value = 440
        osc2.frequency.value = 480
        gainNode.gain.value = 0.1

        osc1.connect(gainNode)
        osc2.connect(gainNode)
        gainNode.connect(ambienceGainRef.current!)

        const startTime = ctx.currentTime
        osc1.start(startTime)
        osc2.start(startTime)
        osc1.stop(startTime + 0.4)
        osc2.stop(startTime + 0.4)
      }, i * 1000)
    }

    console.log("[v0] 📞 Phone ringing in background")
  }

  // Start/stop ambience
  useEffect(() => {
    let noiseNode: ScriptProcessorNode | null = null

    if (isActive) {
      console.log(`[v0] Starting ${selectedIndustry} sales floor ambience`)

      // Start ambience
      noiseNode = playAmbience()

      // Gong every 10 minutes (600000ms)
      gongIntervalRef.current = setInterval(() => {
        playGong()
      }, 600000)

      // Phone ring every 2 minutes (120000ms)
      phoneIntervalRef.current = setInterval(() => {
        playPhoneRing()
      }, 120000)

      // Play initial sounds after 5 seconds
      setTimeout(() => playPhoneRing(), 5000)
    } else {
      // Stop all sounds
      if (noiseNode) {
        noiseNode.disconnect()
      }
      if (gongIntervalRef.current) {
        clearInterval(gongIntervalRef.current)
      }
      if (phoneIntervalRef.current) {
        clearInterval(phoneIntervalRef.current)
      }
      console.log("[v0] Stopped sales floor ambience")
    }

    return () => {
      if (noiseNode) {
        noiseNode.disconnect()
      }
      if (gongIntervalRef.current) {
        clearInterval(gongIntervalRef.current)
      }
      if (phoneIntervalRef.current) {
        clearInterval(phoneIntervalRef.current)
      }
    }
  }, [isActive, selectedIndustry])

  const currentIndustry = industries.find((i) => i.id === selectedIndustry) || industries[0]

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-lg bg-gradient-to-br ${currentIndustry.color} flex items-center justify-center`}
            >
              <currentIndustry.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sales Floor Ambience</h3>
              <p className="text-sm text-slate-400">Realistic office environment sounds</p>
            </div>
          </div>
          <Badge
            className={
              isActive
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Industry Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Select Industry</label>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {industries.map((industry) => (
                <SelectItem key={industry.id} value={industry.id} className="text-white">
                  <div className="flex items-center gap-2">
                    <industry.icon className="h-4 w-4" />
                    <span>{industry.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">{currentIndustry.description}</p>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Volume</label>
            <span className="text-sm text-slate-400">{isMuted ? "Muted" : `${volume[0]}%`}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 hover:bg-slate-800 bg-transparent"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" disabled={isMuted} />
          </div>
        </div>

        {/* Ambience Features */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-800/50 border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-medium text-white">Deal Gong</span>
            </div>
            <p className="text-xs text-slate-400">Every 10 minutes</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-white">Phone Rings</span>
            </div>
            <p className="text-xs text-slate-400">Every 2 minutes</p>
          </Card>
        </div>

        {/* Control Button */}
        <Button
          className={`w-full ${
            isActive ? "bg-red-500 hover:bg-red-600" : `bg-gradient-to-r ${currentIndustry.color} hover:opacity-90`
          } text-white`}
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? "Stop Ambience" : "Start Sales Floor Ambience"}
        </Button>

        {/* Info */}
        {isActive && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Active:</strong> You're now in a realistic{" "}
              {currentIndustry.name.toLowerCase()} sales floor environment. Background office sounds, periodic phone
              rings, and celebration gongs create an authentic work atmosphere.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
