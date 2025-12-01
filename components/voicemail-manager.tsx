"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  MessageSquare, Upload, Play, Pause, Trash2, Download,
  Mic, Square, Loader2, Check, X
} from "lucide-react"
import { campaignAPI } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"

interface VoicemailMessage {
  message_id: string
  name: string
  description: string
  audio_url: string
  duration: number
  is_active: boolean
  created_at: string
}

export function VoicemailManager() {
  const [messages, setMessages] = useState<VoicemailMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout>()

  // Playback state
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await campaignAPI.getVoicemailMessages()
      if (response.data.success) {
        setMessages(response.data.messages)
      }
    } catch (error) {
      console.error('Failed to load voicemail messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'voicemail.wav', { type: 'audio/wav' })
        setAudioFile(audioFile)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      // Timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file)
      } else {
        alert('Please select an audio file (MP3, WAV, etc.)')
      }
    }
  }

  const createMessage = async () => {
    if (!currentUser || !name || !audioFile) {
      alert('Please provide a name and audio file')
      return
    }

    setUploading(true)

    try {
      // Upload audio file first
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('userId', currentUser.userId)

      const response = await campaignAPI.createVoicemailMessage(formData)

      if (response.data.success) {
        alert('Voicemail message created successfully!')
        setShowCreateDialog(false)
        resetForm()
        loadMessages()
      }

    } catch (error) {
      console.error('Failed to create voicemail message:', error)
      alert('Failed to create voicemail message')
    } finally {
      setUploading(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this voicemail message?')) return

    try {
      await campaignAPI.deleteVoicemailMessage(messageId)
      loadMessages()
    } catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }

  const togglePlay = (message: VoicemailMessage) => {
    if (playingId === message.message_id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = message.audio_url
        audioRef.current.play()
        setPlayingId(message.message_id)
      }
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setAudioFile(null)
    setRecordingDuration(0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
      {/* Hidden audio element for playback */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-cyan-400" />
            Voicemail Messages
          </h3>
          <p className="text-sm text-white/60">
            Pre-recorded messages for answering machines
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
        >
          <Upload className="h-4 w-4 mr-2" />
          Create Message
        </Button>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/60">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No voicemail messages yet</p>
          <p className="text-sm text-white/40">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Card key={message.message_id} className="bg-white/5 border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">{message.name}</h4>
                    <Badge className={
                      message.is_active 
                        ? "bg-green-500/20 text-green-400 border-green-400/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                    }>
                      {message.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                      {formatDuration(message.duration)}
                    </Badge>
                  </div>
                  {message.description && (
                    <p className="text-sm text-white/60">{message.description}</p>
                  )}
                  <p className="text-xs text-white/40 mt-1">
                    Created {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => togglePlay(message)}
                    size="sm"
                    className="bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
                  >
                    {playingId === message.message_id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={() => window.open(message.audio_url, '_blank')}
                    size="sm"
                    className="bg-white/5 border-white/10 text-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => deleteMessage(message.message_id)}
                    size="sm"
                    className="bg-red-500/20 border-red-400/30 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Message Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create Voicemail Message</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div>
              <Label className="text-white mb-2 block">Message Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Follow-up Message"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-white mb-2 block">Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this message..."
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>

            {/* Audio Input Methods */}
            <div className="space-y-4">
              <Label className="text-white">Audio Message</Label>

              {/* Recording Section */}
              <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-purple-400">Record Message</p>
                    <p className="text-xs text-purple-300">Record directly from your microphone</p>
                  </div>
                  {isRecording && (
                    <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                      Recording: {formatDuration(recordingDuration)}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="flex-1 bg-red-500/20 border-red-400/30 text-red-400"
                      disabled={!!audioFile}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="flex-1 bg-red-500/20 border-red-400/30 text-red-400"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>

              {/* Upload Section */}
              <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <div className="mb-3">
                  <p className="font-semibold text-blue-400">Upload Audio File</p>
                  <p className="text-xs text-blue-300">MP3, WAV, or other audio format</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="audio/*"
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-500/20 border-blue-400/30 text-blue-400"
                  disabled={isRecording}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Audio File
                </Button>
              </div>

              {/* Selected File Display */}
              {audioFile && (
                <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-semibold">{audioFile.name}</p>
                        <p className="text-xs text-green-300">
                          {(audioFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setAudioFile(null)}
                      size="sm"
                      className="bg-red-500/20 border-red-400/30 text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tips
            <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-400 font-semibold mb-2">💡 Recording Tips</p>
              <ul className="text-xs text-yellow-300 space-y-1">
                <li>• Keep messages under 30 seconds for best results</li>
                <li>• Speak clearly and at a normal pace</li>
                <li>• Include your name, company, and callback number</li>
                <li>• Test your message before using in campaigns</li>
              </ul>
            </div> */}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
              className="bg-white/5 border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={createMessage}
              disabled={uploading || !name || !audioFile}
              className="bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}