"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Sparkles,
  GripVertical,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react"

interface PageMasterStep {
  id: string
  description: string
  location: string
  status: "pending" | "in-progress" | "waiting" | "completed" | "error"
  action?: string
  requiresConfirmation: boolean
}

export function PageMaster() {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [url, setUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStep, setCurrentStep] = useState<PageMasterStep | null>(null)
  const [steps, setSteps] = useState<PageMasterStep[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [scrapeUrl, setScrapeUrl] = useState("")
  const [scrapeInstructions, setScrapeInstructions] = useState("")
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedData, setScrapedData] = useState<any[]>([])
  const [scrapeProgress, setScrapeProgress] = useState("")

  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const [isHeaderFocused, setIsHeaderFocused] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedPosition = localStorage.getItem("pagemaster-position")
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition))
    } else {
      // Default position: center-right of screen
      setPosition({
        x: window.innerWidth - 450,
        y: 100,
      })
    }
  }, [])

  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem("pagemaster-position", JSON.stringify(position))
    }
  }, [position])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Keep within viewport bounds
        const maxX = window.innerWidth - 400
        const maxY = window.innerHeight - 100

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHeaderFocused) return

      const step = e.shiftKey ? 50 : 10 // Larger steps with Shift key
      let newX = position.x
      let newY = position.y

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          newX = Math.max(0, position.x - step)
          break
        case "ArrowRight":
          e.preventDefault()
          newX = Math.min(window.innerWidth - 400, position.x + step)
          break
        case "ArrowUp":
          e.preventDefault()
          newY = Math.max(0, position.y - step)
          break
        case "ArrowDown":
          e.preventDefault()
          newY = Math.min(window.innerHeight - 100, position.y + step)
          break
        case "Escape":
          e.preventDefault()
          setIsHeaderFocused(false)
          headerRef.current?.blur()
          break
        default:
          return
      }

      setPosition({ x: newX, y: newY })
    }

    if (isHeaderFocused) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isHeaderFocused, position])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        addLog(`[Voice Command] ${transcript}`)
        processVoiceCommand(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        addLog(`[Error] Voice recognition: ${event.error}`)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)

      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
      addLog(`[Speaking] ${text}`)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addLog("[Error] Speech recognition not supported")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      addLog("[Voice] Stopped listening")
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      addLog("[Voice] Started listening")
      speak("I'm listening for your commands")
    }
  }

  const toggleSpeaking = () => {
    if (isSpeaking && synthRef.current) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("start") || lowerCommand.includes("begin")) {
      handleStart()
    } else if (lowerCommand.includes("pause") || lowerCommand.includes("stop")) {
      handlePause()
    } else if (lowerCommand.includes("continue") || lowerCommand.includes("resume")) {
      handleContinue()
    } else if (lowerCommand.includes("confirm") || lowerCommand.includes("yes")) {
      handleConfirm()
    } else {
      speak("I didn't understand that command. Try saying start, pause, continue, or confirm.")
    }
  }

  const handleStart = async () => {
    if (!url) {
      speak("Please enter a URL first")
      return
    }

    setIsRunning(true)
    setIsPaused(false)
    addLog(`[Starting] Navigating to ${url}`)
    speak(`Starting automation for ${url}`)

    try {
      const response = await fetch("/api/pagemaster/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setSteps(data.steps)
        processNextStep(data.steps[0])
      } else {
        addLog(`[Error] ${data.error}`)
        speak(`Error: ${data.error}`)
        setIsRunning(false)
      }
    } catch (error) {
      console.error("[v0] PageMaster start error:", error)
      addLog(`[Error] Failed to start automation`)
      speak("Failed to start automation")
      setIsRunning(false)
    }
  }

  const processNextStep = (step: PageMasterStep) => {
    setCurrentStep(step)
    addLog(`[Step] ${step.description}`)
    speak(`I'm now at ${step.location}. ${step.description}`)

    if (step.requiresConfirmation) {
      setIsPaused(true)
      speak("Please confirm to continue by clicking the confirm button or saying confirm")
    } else {
      setTimeout(() => {
        handleContinue()
      }, 2000)
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    addLog("[Paused] Automation paused")
    speak("Automation paused")
  }

  const handleContinue = async () => {
    if (!currentStep) return

    setIsPaused(false)
    addLog("[Continuing] Moving to next step")

    try {
      const response = await fetch("/api/pagemaster/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: currentStep.id }),
      })

      const data = await response.json()

      if (data.nextStep) {
        processNextStep(data.nextStep)
      } else if (data.completed) {
        handleComplete()
      }
    } catch (error) {
      console.error("[v0] PageMaster continue error:", error)
      addLog(`[Error] Failed to continue`)
    }
  }

  const handleConfirm = () => {
    if (currentStep?.requiresConfirmation) {
      addLog("[Confirmed] User confirmed action")
      speak("Confirmed. Continuing to next step")
      handleContinue()
    }
  }

  const handleComplete = () => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentStep(null)
    addLog("[Completed] Automation completed successfully")
    speak("Automation completed successfully. All tasks are done.")
  }

  const handleStartScraping = async () => {
    if (!scrapeUrl || !scrapeInstructions) {
      speak("Please enter both URL and instructions")
      return
    }

    setIsScraping(true)
    setScrapeProgress("Initializing web scraper...")
    addLog(`[Scraping] Starting data extraction from ${scrapeUrl}`)
    speak("Starting web scraping and data extraction")

    try {
      const response = await fetch("/api/pagemaster/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: scrapeUrl,
          instructions: scrapeInstructions,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setScrapedData(data.results)
        setScrapeProgress(`Extracted ${data.results.length} records successfully`)
        addLog(`[Success] Extracted ${data.results.length} records`)
        speak(`Successfully extracted ${data.results.length} records. Ready to export to CSV.`)
      } else {
        setScrapeProgress(`Error: ${data.error}`)
        addLog(`[Error] ${data.error}`)
        speak(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Scraping error:", error)
      setScrapeProgress("Failed to scrape data")
      addLog("[Error] Failed to scrape data")
      speak("Failed to scrape data")
    } finally {
      setIsScraping(false)
    }
  }

  const handleExportCSV = () => {
    if (scrapedData.length === 0) {
      speak("No data to export")
      return
    }

    const headers = [
      "Business Name",
      "Owner Name",
      "Owner Email",
      "Company Email",
      "Owner Phone",
      "Company Phone",
      "WhatsApp",
      "Telegram",
      "Signal",
      "Facebook",
      "Instagram",
      "LinkedIn",
      "Twitter",
      "TikTok",
      "Snapchat",
    ]

    const csvContent = [
      headers.join(","),
      ...scrapedData.map((row) =>
        [
          row.businessName || "",
          row.ownerName || "",
          row.ownerEmail || "",
          row.companyEmail || "",
          row.ownerPhone || "",
          row.companyPhone || "",
          row.whatsapp || "",
          row.telegram || "",
          row.signal || "",
          row.facebook || "",
          row.instagram || "",
          row.linkedin || "",
          row.twitter || "",
          row.tiktok || "",
          row.snapchat || "",
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `scraped_data_${Date.now()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addLog(`[Export] Downloaded CSV with ${scrapedData.length} records`)
    speak(`CSV file downloaded with ${scrapedData.length} records`)
  }

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="PageMaster AI Automation Panel"
          aria-modal="false"
          className="fixed z-[9999] bg-gradient-to-br from-slate-900/98 via-blue-900/98 to-slate-900/98 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-2xl"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: isMinimized ? "400px" : "800px",
            maxWidth: "90vw",
            maxHeight: isMinimized ? "auto" : "80vh",
          }}
        >
          <div
            ref={headerRef}
            role="region"
            aria-label="Draggable header - Use arrow keys to move, Escape to release"
            tabIndex={0}
            className="flex items-center justify-between p-4 border-b border-cyan-500/30 cursor-move bg-gradient-to-r from-cyan-900/50 to-blue-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            onMouseDown={handleMouseDown}
            onFocus={() => setIsHeaderFocused(true)}
            onBlur={() => setIsHeaderFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setIsHeaderFocused(true)
              }
            }}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-cyan-400" aria-hidden="true" />
              <Bot className="h-6 w-6 text-cyan-400" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-bold text-white">PAGEMASTER AI</h2>
                <p className="text-xs text-cyan-400">
                  {isHeaderFocused ? "Use arrow keys to move (Shift for faster)" : "Click or press Enter to drag"}
                </p>
              </div>
              {isRunning && (
                <Badge variant="outline" className="border-green-500 text-green-400" aria-live="polite">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" aria-hidden="true" />
                  Running
                </Badge>
              )}
              {isScraping && (
                <Badge variant="outline" className="border-purple-500 text-purple-400" aria-live="polite">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" aria-hidden="true" />
                  Scraping
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-cyan-500/20"
                aria-label={isMinimized ? "Maximize panel" : "Minimize panel"}
                aria-pressed={isMinimized}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-500/20"
                aria-label="Close PageMaster panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
              <Tabs defaultValue="automation" className="w-full">
                <TabsList className="bg-black/40 border border-cyan-500/30">
                  <TabsTrigger value="automation" className="data-[state=active]:bg-cyan-500/20">
                    <Bot className="h-4 w-4 mr-2" aria-hidden="true" />
                    Web Automation
                  </TabsTrigger>
                  <TabsTrigger value="scraper" className="data-[state=active]:bg-purple-500/20">
                    <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                    Create Anything
                  </TabsTrigger>
                </TabsList>

                {/* Web Automation Tab */}
                <TabsContent value="automation" className="mt-4 space-y-4">
                  <Card className="bg-black/40 border-cyan-500/30 p-4 space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="target-url" className="text-sm text-cyan-400">
                        Target URL
                      </label>
                      <Input
                        id="target-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-black/40 border-cyan-500/30 text-white"
                        disabled={isRunning}
                        aria-required="true"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm text-cyan-400">
                          Username
                        </label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Optional"
                          className="bg-black/40 border-cyan-500/30 text-white"
                          disabled={isRunning}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm text-cyan-400">
                          Password
                        </label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Optional"
                          className="bg-black/40 border-cyan-500/30 text-white"
                          disabled={isRunning}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isRunning ? (
                        <Button
                          onClick={handleStart}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          aria-label="Start web automation"
                        >
                          <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                          Start
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handlePause}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                            disabled={isPaused}
                            aria-label="Pause automation"
                            aria-pressed={isPaused}
                          >
                            <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                            Pause
                          </Button>
                          <Button
                            onClick={handleContinue}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={!isPaused}
                            aria-label="Continue automation"
                          >
                            <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                            Continue
                          </Button>
                        </>
                      )}
                    </div>

                    {currentStep?.requiresConfirmation && (
                      <Button
                        onClick={handleConfirm}
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        aria-label="Confirm current action"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                        Confirm Action
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={toggleListening}
                        variant="outline"
                        className={`flex-1 ${isListening ? "border-red-500 text-red-400" : "border-cyan-500/30"}`}
                        aria-label={isListening ? "Stop voice commands" : "Start voice commands"}
                        aria-pressed={isListening}
                      >
                        {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                        {isListening ? "Stop" : "Voice"}
                      </Button>
                      <Button
                        onClick={toggleSpeaking}
                        variant="outline"
                        className={`flex-1 ${isSpeaking ? "border-red-500 text-red-400" : "border-cyan-500/30"}`}
                        aria-label={isSpeaking ? "Mute speaker" : "Enable speaker"}
                        aria-pressed={isSpeaking}
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                        {isSpeaking ? "Mute" : "Speaker"}
                      </Button>
                    </div>
                  </Card>

                  {/* Current Step Display */}
                  {currentStep && (
                    <Card className="bg-black/40 border-cyan-500/30 p-4" role="status" aria-live="polite">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Current Step</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {currentStep.status === "in-progress" && (
                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin mt-1" aria-hidden="true" />
                          )}
                          {currentStep.status === "waiting" && (
                            <AlertCircle className="h-5 w-5 text-yellow-400 mt-1" aria-hidden="true" />
                          )}
                          {currentStep.status === "completed" && (
                            <CheckCircle className="h-5 w-5 text-green-400 mt-1" aria-hidden="true" />
                          )}
                          <div className="flex-1">
                            <p className="text-white font-medium">{currentStep.description}</p>
                            <p className="text-sm text-cyan-400 mt-1">Location: {currentStep.location}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Activity Log */}
                  <Card className="bg-black/40 border-cyan-500/30 p-4">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Activity Log</h3>
                    <ScrollArea className="h-[200px]" aria-live="polite" aria-atomic="false">
                      <div className="space-y-1">
                        {logs.map((log, index) => (
                          <p key={index} className="text-xs text-gray-300 font-mono">
                            {log}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>

                {/* Create Anything Tab */}
                <TabsContent value="scraper" className="mt-4 space-y-4">
                  <Card className="bg-black/40 border-purple-500/30 p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-purple-400" aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-purple-400">Create Anything</h3>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="scrape-url" className="text-sm text-purple-400">
                        Target URL or Website
                      </label>
                      <Input
                        id="scrape-url"
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-black/40 border-purple-500/30 text-white"
                        disabled={isScraping}
                        aria-required="true"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="scrape-instructions" className="text-sm text-purple-400">
                        What do you want to extract?
                      </label>
                      <Textarea
                        id="scrape-instructions"
                        value={scrapeInstructions}
                        onChange={(e) => setScrapeInstructions(e.target.value)}
                        placeholder="Example: Find all businesses with contact info"
                        className="bg-black/40 border-purple-500/30 text-white min-h-[100px]"
                        disabled={isScraping}
                        aria-required="true"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleStartScraping}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        disabled={isScraping || !scrapeUrl || !scrapeInstructions}
                        aria-label="Start web scraping"
                      >
                        {isScraping ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                            Scraping...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                            Start Scraping
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleExportCSV}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={scrapedData.length === 0}
                        aria-label={`Export ${scrapedData.length} records to CSV`}
                      >
                        <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                        Export CSV
                      </Button>
                    </div>

                    {scrapeProgress && (
                      <div
                        className="bg-black/40 border border-purple-500/30 rounded p-3"
                        role="status"
                        aria-live="polite"
                      >
                        <p className="text-sm text-purple-300">{scrapeProgress}</p>
                      </div>
                    )}
                  </Card>

                  {/* Scraped Data Preview */}
                  {scrapedData.length > 0 && (
                    <Card className="bg-black/40 border-purple-500/30 p-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-4">
                        Extracted Data ({scrapedData.length} records)
                      </h3>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {scrapedData.slice(0, 5).map((record, index) => (
                            <div key={index} className="bg-black/40 border border-purple-500/20 rounded p-2">
                              <p className="font-semibold text-white text-sm">{record.businessName || "N/A"}</p>
                              <p className="text-xs text-gray-400">{record.ownerEmail || record.companyEmail}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[9998] gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-2xl hover:shadow-cyan-500/50 transition-all duration-200 h-14 px-8 text-lg font-bold border-2 border-cyan-400/50"
        size="lg"
        aria-label={isOpen ? "Close PageMaster panel" : "Open PageMaster panel"}
        aria-pressed={isOpen}
      >
        <Bot className="h-6 w-6" aria-hidden="true" />
        <span className="font-semibold">PAGEMASTER</span>
      </Button>
    </>
  )
}
