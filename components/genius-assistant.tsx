"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Minimize2,
  X,
  Send,
  FileText,
  Download,
  Calendar,
  Zap,
  Globe,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ScheduledTask {
  id: string
  description: string
  scheduledTime: Date
  status: "pending" | "running" | "completed" | "failed"
  type: "email" | "call" | "sms" | "web-automation" | "custom"
}

interface PageMasterStep {
  id: string
  description: string
  location: string
  status: "pending" | "in-progress" | "waiting" | "completed" | "error"
  action?: string
  requiresConfirmation: boolean
}

export function GeniusAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [notepadContent, setNotepadContent] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isLearning, setIsLearning] = useState(false)
  const [isVoiceActivationEnabled, setIsVoiceActivationEnabled] = useState(false)
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false)
  const [isWakeWordRecognitionActive, setIsWakeWordRecognitionActive] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt" | "checking">(
    "checking",
  )
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // PageMaster states
  const [url, setUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState<PageMasterStep | null>(null)
  const [steps, setSteps] = useState<PageMasterStep[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [scrapeUrl, setScrapeUrl] = useState("")
  const [scrapeInstructions, setScrapeInstructions] = useState("")
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedData, setScrapedData] = useState<any[]>([])
  const [scrapeProgress, setScrapeProgress] = useState("")
  const [automationInputMode, setAutomationInputMode] = useState<"text" | "voice">("text")
  const [scraperInputMode, setScraperInputMode] = useState<"text" | "voice">("text")
  const [isAutomationVoiceActive, setIsAutomationVoiceActive] = useState(false)
  const [isScraperVoiceActive, setIsScraperVoiceActive] = useState(false)

  const recognitionRef = useRef<any>(null)
  const wakeWordRecognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldRetryWakeWordRef = useRef(false)

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.15
      utterance.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Samantha") ||
          voice.name.includes("Karen") ||
          voice.name.includes("Female") ||
          voice.name.includes("Woman"),
      )
      utterance.voice = preferredVoice || voices.find((voice) => voice.lang.includes("en")) || null

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)

      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
      console.log("[v0] GENIUS speaking:", text)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      console.log("[v0] GENIUS stopped listening")
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      console.log("[v0] GENIUS started listening")
      speak("Yes, I'm listening. How can I help you?")
    }
  }

  const toggleSpeaking = () => {
    if (isSpeaking && synthRef.current) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleTranscription = () => {
    if (!recognitionRef.current) return

    if (isTranscribing) {
      recognitionRef.current.stop()
      setIsTranscribing(false)
      setIsListening(false)
      console.log("[v0] GENIUS stopped transcribing")
      speak("Transcription stopped.")
    } else {
      recognitionRef.current.start()
      setIsTranscribing(true)
      setIsListening(true)
      setActiveTab("notepad")
      console.log("[v0] GENIUS started transcribing")
      speak("I'm ready to transcribe. Start speaking, and I'll write everything you say.")
    }
  }

  const downloadNotepad = () => {
    const blob = new Blob([notepadContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `genius-document-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    speak("Your document has been downloaded.")
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
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
        if (data.steps[0]) {
          processNextStep(data.steps[0])
        }
      } else {
        addLog(`[Error] ${data.error}`)
        speak(`Error: ${data.error}`)
        setIsRunning(false)
      }
    } catch (error) {
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
      speak("Please confirm to continue")
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
    speak("Automation completed successfully")
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
        speak(`Successfully extracted ${data.results.length} records`)
      } else {
        setScrapeProgress(`Error: ${data.error}`)
        addLog(`[Error] ${data.error}`)
        speak(`Error: ${data.error}`)
      }
    } catch (error) {
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

  const handleSendMessage = async (text?: string) => {
    const messageText = text || message
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsProcessing(true)

    if (messageText.toLowerCase().includes("learn") || messageText.toLowerCase().includes("research")) {
      setIsLearning(true)
    }

    console.log("[v0] GENIUS processing:", messageText)

    try {
      const response = await fetch("/api/genius/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: messages,
          context: {
            scheduledTasks,
            availableFunctions: [
              "send_email",
              "make_call",
              "send_sms",
              "schedule_task",
              "use_pagemaster",
              "manage_leads",
            ],
          },
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      speak(data.response)

      if (data.scheduledTask) {
        setScheduledTasks((prev) => [...prev, data.scheduledTask])
      }
    } catch (error) {
      console.error("[v0] GENIUS error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      speak("I apologize, but I encountered an error")
    } finally {
      setIsProcessing(false)
      setIsLearning(false)
    }
  }

  const checkMicrophonePermission = async () => {
    try {
      setMicrophonePermission("checking")
      setPermissionError(null)

      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setMicrophonePermission(permissionStatus.state as "granted" | "denied" | "prompt")

        permissionStatus.onchange = () => {
          setMicrophonePermission(permissionStatus.state as "granted" | "denied" | "prompt")
          if (permissionStatus.state === "granted" && isVoiceActivationEnabled) {
            shouldRetryWakeWordRef.current = true
            startWakeWordRecognition()
          }
        }

        return permissionStatus.state === "granted"
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream.getTracks().forEach((track) => track.stop())
          setMicrophonePermission("granted")
          return true
        } catch (error) {
          setMicrophonePermission("denied")
          setPermissionError("Microphone access denied")
          return false
        }
      }
    } catch (error) {
      console.error("[v0] GENIUS permission check error:", error)
      setMicrophonePermission("denied")
      setPermissionError("Unable to check microphone permissions")
      return false
    }
  }

  const startWakeWordRecognition = async () => {
    if (!isVoiceActivationEnabled || !shouldRetryWakeWordRef.current) return

    const hasPermission = await checkMicrophonePermission()
    if (!hasPermission) {
      console.log("[v0] GENIUS wake word detection disabled - no permission")
      return
    }

    if (!wakeWordRecognitionRef.current) return

    try {
      wakeWordRecognitionRef.current.start()
      console.log("[v0] GENIUS wake word detection started")
    } catch (e: any) {
      if (e.error !== "already-started") {
        console.error("[v0] GENIUS wake word startup error:", e)
      }
    }
  }

  const toggleWakeWord = async () => {
    if (isVoiceActivationEnabled) {
      setIsVoiceActivationEnabled(false)
      shouldRetryWakeWordRef.current = false
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.stop()
      }
      setIsWakeWordRecognitionActive(false)
      setIsListeningForWakeWord(false)
      speak("Wake word detection disabled")
    } else {
      const hasPermission = await checkMicrophonePermission()
      if (hasPermission) {
        setIsVoiceActivationEnabled(true)
        shouldRetryWakeWordRef.current = true
        startWakeWordRecognition()
        speak("Wake word detection enabled. Say 'Hey Genius' to activate me.")
      } else {
        speak("Please grant microphone permission first")
      }
    }
  }

  const handleVoiceActivation = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase()

    if (lowerTranscript.includes("hey genius") || lowerTranscript.includes("talk to me genius")) {
      console.log("[v0] GENIUS wake word detected:", transcript)
      setIsOpen(true)
      setIsMinimized(false)
      speak("Yes, I'm here! How can I help you?")
    }

    if (lowerTranscript.includes("chill genius") || lowerTranscript.includes("genius chill")) {
      console.log("[v0] GENIUS sleep word detected:", transcript)
      speak("Okay, I'll be here if you need me")
      setTimeout(() => {
        setIsOpen(false)
        setIsListening(false)
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }, 2000)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition

      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        console.log("[v0] GENIUS heard:", transcript)

        if (activeTab === "notepad" && isTranscribing) {
          setNotepadContent((prev) => prev + " " + transcript)
        } else {
          setMessage(transcript)
          if (event.results[event.results.length - 1].isFinal) {
            if (isListeningForWakeWord) {
              handleVoiceActivation(transcript)
            } else {
              handleSendMessage(transcript)
            }
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] GENIUS speech recognition error:", event.error)
        if (event.error === "not-allowed" || event.error === "audio-capture") {
          setPermissionError("Microphone access denied")
          setIsListening(false)
          setIsTranscribing(false)
          setIsListeningForWakeWord(false)
          setIsWakeWordRecognitionActive(false)
        }
      }

      wakeWordRecognitionRef.current = new SpeechRecognition()
      wakeWordRecognitionRef.current.continuous = true
      wakeWordRecognitionRef.current.interimResults = false

      wakeWordRecognitionRef.current.onstart = () => {
        setIsWakeWordRecognitionActive(true)
        setIsListeningForWakeWord(true)
        setPermissionError(null)
        console.log("[v0] GENIUS wake word detection active")
      }

      wakeWordRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        console.log("[v0] GENIUS wake word listener heard:", transcript)
        handleVoiceActivation(transcript)
      }

      wakeWordRecognitionRef.current.onerror = (event: any) => {
        if (event.error === "no-speech") {
          return
        }

        if (event.error === "not-allowed" || event.error === "audio-capture") {
          console.error("[v0] GENIUS wake word permission error:", event.error)
          setPermissionError("Microphone access denied")
          setMicrophonePermission("denied")
          shouldRetryWakeWordRef.current = false
          setIsWakeWordRecognitionActive(false)
          setIsListeningForWakeWord(false)
          setIsVoiceActivationEnabled(false)
          return
        }

        console.error("[v0] GENIUS wake word recognition error:", event.error)
        setIsWakeWordRecognitionActive(false)
      }

      wakeWordRecognitionRef.current.onend = () => {
        setIsWakeWordRecognitionActive(false)

        if (isVoiceActivationEnabled && shouldRetryWakeWordRef.current && !isWakeWordRecognitionActive) {
          setTimeout(() => {
            try {
              if (wakeWordRecognitionRef.current && !isWakeWordRecognitionActive && shouldRetryWakeWordRef.current) {
                wakeWordRecognitionRef.current.start()
              }
            } catch (e: any) {
              if (e.error !== "already-started") {
                console.log("[v0] GENIUS wake word restart skipped:", e.message)
              }
            }
          }, 1000)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (wakeWordRecognitionRef.current) {
        shouldRetryWakeWordRef.current = false
        wakeWordRecognitionRef.current.stop()
        setIsWakeWordRecognitionActive(false)
      }
    }
  }, [activeTab, isTranscribing, isVoiceActivationEnabled, isListeningForWakeWord])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <>
      {/* Floating GENIUS Icon */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <div className="relative">
            <Sparkles className="h-8 w-8 text-white" />
            {isLearning && <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse" />}
            {(isListening || isListeningForWakeWord) && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
            {(isRunning || isScraping) && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-cyan-500 rounded-full animate-pulse" />
            )}
            {scheduledTasks.filter((t) => t.status === "pending").length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                {scheduledTasks.filter((t) => t.status === "pending").length}
              </Badge>
            )}
          </div>
        </Button>
        {isListeningForWakeWord && !isOpen && microphonePermission === "granted" && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            🎤 Listening
          </div>
        )}
      </div>

      {/* GENIUS Chat Interface */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-[9998] w-[900px] max-w-[90vw] transition-all duration-300 ${
            isMinimized ? "h-14" : "h-[700px]"
          }`}
        >
          <Card className="h-full bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-rose-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-300" />
                <div>
                  <h3 className="text-lg font-bold text-white">GENIUS with PAGEMASTER</h3>
                  <p className="text-xs text-purple-300">Your AI Assistant & Web Automation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Wake Word Toggle */}
                <Button
                  onClick={toggleWakeWord}
                  size="sm"
                  variant={isVoiceActivationEnabled ? "default" : "outline"}
                  className={
                    isVoiceActivationEnabled
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                  }
                >
                  {isVoiceActivationEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  <span className="ml-2 text-xs">Wake Word {isVoiceActivationEnabled ? "ON" : "OFF"}</span>
                </Button>

                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  size="sm"
                  variant="ghost"
                  className="text-purple-300 hover:bg-purple-500/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  variant="ghost"
                  className="text-purple-300 hover:bg-purple-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Permission Error Banner */}
                {permissionError && (
                  <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-300" />
                      <p className="text-sm text-yellow-300">{permissionError}</p>
                    </div>
                    <Button
                      onClick={() => checkMicrophonePermission()}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="bg-purple-800/50 border-b border-purple-500/30 rounded-none">
                    <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="notepad" className="data-[state=active]:bg-purple-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Notepad
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="data-[state=active]:bg-cyan-600">
                      <Zap className="h-4 w-4 mr-2" />
                      PageMaster Automation
                    </TabsTrigger>
                    <TabsTrigger value="scraper" className="data-[state=active]:bg-cyan-600">
                      <Globe className="h-4 w-4 mr-2" />
                      Scraper
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Tasks ({scheduledTasks.filter((t) => t.status === "pending").length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-purple-600 text-white"
                                : "bg-purple-800/50 text-purple-100 border border-purple-500/30"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-purple-800/50 text-purple-100 border border-purple-500/30 p-3 rounded-lg">
                            <p className="text-sm">Thinking...</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300"
                      />
                      <Button
                        onClick={toggleListening}
                        size="icon"
                        variant={isListening ? "default" : "outline"}
                        className={
                          isListening
                            ? "bg-red-500 hover:bg-red-600"
                            : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                        }
                      >
                        {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={toggleSpeaking}
                        size="icon"
                        variant={isSpeaking ? "default" : "outline"}
                        className={
                          isSpeaking
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                        }
                      >
                        {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={() => handleSendMessage()}
                        size="icon"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Notepad Tab */}
                  <TabsContent value="notepad" className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-semibold">Voice-to-Text Notepad</h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={toggleTranscription}
                          size="sm"
                          variant={isTranscribing ? "default" : "outline"}
                          className={
                            isTranscribing
                              ? "bg-red-500 hover:bg-red-600"
                              : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                          }
                        >
                          {isTranscribing ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                          {isTranscribing ? "Stop" : "Start"} Transcription
                        </Button>
                        <Button
                          onClick={downloadNotepad}
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={notepadContent}
                      onChange={(e) => setNotepadContent(e.target.value)}
                      placeholder="Start transcribing or type here..."
                      className="flex-1 bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300 resize-none"
                    />
                  </TabsContent>

                  {/* PageMaster Automation Tab */}
                  <TabsContent value="automation" className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-center justify-between bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30">
                      <h4 className="text-white font-semibold">Input Mode</h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setAutomationInputMode("text")}
                          size="sm"
                          variant={automationInputMode === "text" ? "default" : "outline"}
                          className={
                            automationInputMode === "text"
                              ? "bg-cyan-600 hover:bg-cyan-700"
                              : "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                          }
                        >
                          Text Input
                        </Button>
                        <Button
                          onClick={() => {
                            setAutomationInputMode("voice")
                            setIsAutomationVoiceActive(!isAutomationVoiceActive)
                            if (!isAutomationVoiceActive) {
                              speak("Voice mode activated for automation. Say your commands.")
                            }
                          }}
                          size="sm"
                          variant={automationInputMode === "voice" ? "default" : "outline"}
                          className={
                            automationInputMode === "voice"
                              ? "bg-red-500 hover:bg-red-600"
                              : "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                          }
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Input
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to automate"
                        className="bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300"
                      />
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username (optional)"
                        className="bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300"
                      />
                      <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Password (optional)"
                        className="bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleStart}
                        disabled={isRunning || !url}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Automation
                      </Button>
                      {isRunning && (
                        <>
                          <Button
                            onClick={isPaused ? handleContinue : handlePause}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </Button>
                          {currentStep?.requiresConfirmation && (
                            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {currentStep && (
                      <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30">
                        <p className="text-cyan-300 text-sm font-semibold">Current Step:</p>
                        <p className="text-white">{currentStep.description}</p>
                        <p className="text-cyan-300 text-xs mt-1">Location: {currentStep.location}</p>
                      </div>
                    )}

                    <div className="flex-1 bg-purple-800/30 rounded-lg p-3 overflow-y-auto border border-purple-500/30">
                      <p className="text-purple-300 text-sm font-semibold mb-2">Logs:</p>
                      {logs.map((log, i) => (
                        <p key={i} className="text-xs text-purple-200 font-mono">
                          {log}
                        </p>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Scraper Tab */}
                  <TabsContent value="scraper" className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-center justify-between bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30">
                      <h4 className="text-white font-semibold">Input Mode</h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setScraperInputMode("text")}
                          size="sm"
                          variant={scraperInputMode === "text" ? "default" : "outline"}
                          className={
                            scraperInputMode === "text"
                              ? "bg-cyan-600 hover:bg-cyan-700"
                              : "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                          }
                        >
                          Text Input
                        </Button>
                        <Button
                          onClick={() => {
                            setScraperInputMode("voice")
                            setIsScraperVoiceActive(!isScraperVoiceActive)
                            if (!isScraperVoiceActive) {
                              speak("Voice mode activated for scraper. Say your commands.")
                            }
                          }}
                          size="sm"
                          variant={scraperInputMode === "voice" ? "default" : "outline"}
                          className={
                            scraperInputMode === "voice"
                              ? "bg-red-500 hover:bg-red-600"
                              : "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                          }
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Input
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        placeholder="Enter URL to scrape"
                        className="bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300"
                      />
                      <Textarea
                        value={scrapeInstructions}
                        onChange={(e) => setScrapeInstructions(e.target.value)}
                        placeholder="What data do you want to extract? (e.g., business names, emails, phone numbers)"
                        className="bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300 h-24"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleStartScraping}
                        disabled={isScraping || !scrapeUrl || !scrapeInstructions}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {isScraping ? "Scraping..." : "Start Scraping"}
                      </Button>
                      {scrapedData.length > 0 && (
                        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      )}
                    </div>

                    {scrapeProgress && (
                      <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30">
                        <p className="text-cyan-300 text-sm">{scrapeProgress}</p>
                      </div>
                    )}

                    {scrapedData.length > 0 && (
                      <div className="flex-1 bg-purple-800/30 rounded-lg p-3 overflow-y-auto border border-purple-500/30">
                        <p className="text-purple-300 text-sm font-semibold mb-2">
                          Scraped Data ({scrapedData.length} records):
                        </p>
                        <div className="space-y-2">
                          {scrapedData.slice(0, 10).map((item, i) => (
                            <div key={i} className="bg-purple-900/50 p-2 rounded text-xs text-purple-200">
                              <pre>{JSON.stringify(item, null, 2)}</pre>
                            </div>
                          ))}
                          {scrapedData.length > 10 && (
                            <p className="text-purple-300 text-xs">... and {scrapedData.length - 10} more records</p>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {scheduledTasks.length === 0 ? (
                      <div className="text-center text-purple-300 py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No scheduled tasks yet</p>
                      </div>
                    ) : (
                      scheduledTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-purple-800/30 p-3 rounded-lg border border-purple-500/30 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white font-semibold">{task.description}</p>
                            <p className="text-purple-300 text-xs">
                              {task.scheduledTime.toLocaleString()} • {task.type}
                            </p>
                          </div>
                          <Badge
                            className={
                              task.status === "completed"
                                ? "bg-green-500"
                                : task.status === "failed"
                                  ? "bg-red-500"
                                  : task.status === "running"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
