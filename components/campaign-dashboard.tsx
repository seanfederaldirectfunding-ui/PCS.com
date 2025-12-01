"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Play, Pause, Square, Phone, Users, Clock, TrendingUp, 
  MessageSquare, Target, Zap, Activity, CheckCircle, XCircle,
  Loader2, Settings, BarChart3, User, Building, Mail
} from "lucide-react"
import { campaignAPI } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"

interface Contact {
  contact_id: string
  name: string
  phone: string
  email?: string
  company?: string
}

interface CampaignDashboardProps {
  selectedContacts: Contact[]
  onClose: () => void
}

export function CampaignDashboard({ selectedContacts, onClose }: CampaignDashboardProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(true)
  const [activeCampaign, setActiveCampaign] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeCalls, setActiveCalls] = useState<any[]>([])
  const [hangupLoading, setHangupLoading] = useState<string | null>(null)
  const [campaignCompleted, setCampaignCompleted] = useState(false)

  // Campaign Creation Form
  const [campaignName, setCampaignName] = useState("")
  const [callsPerHour, setCallsPerHour] = useState(60)
  const [maxConcurrentCalls, setMaxConcurrentCalls] = useState(1)
  const [amdEnabled, setAmdEnabled] = useState(true)
  const [voicemailAction, setVoicemailAction] = useState("leave_message")
  const [voicemailMessages, setVoicemailMessages] = useState<any[]>([])
  const [selectedVoicemail, setSelectedVoicemail] = useState("")

  const currentUser = authService.getCurrentUser()

  // Load voicemail messages
  useEffect(() => {
    loadVoicemailMessages()
  }, [])

  // Poll campaign stats and active calls
  useEffect(() => {
    if (activeCampaign?.campaign_id && activeCampaign.status === 'active') {
      const interval = setInterval(() => {
        loadCampaignStats()
        loadActiveCalls()
        checkCampaignCompletion()
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [activeCampaign])

  // FIXED: Improved campaign completion check
  const checkCampaignCompletion = () => {
    if (stats && activeCampaign) {
      const totalContacts = stats.total_contacts || selectedContacts.length
      const completedContacts = stats.completed_contacts || 0
      const failedContacts = stats.failed_contacts || 0
      const processedContacts = completedContacts + failedContacts
      
      console.log(`[Frontend] Campaign progress: ${processedContacts}/${totalContacts} processed, ${activeCalls.length} active calls`)
      
      // Campaign is complete when all contacts are processed AND no active calls
      if (processedContacts >= totalContacts && activeCalls.length === 0) {
        console.log('[Frontend] Campaign should auto-complete - all contacts processed')
        setCampaignCompleted(true)
        // Auto close after 3 seconds
        setTimeout(() => {
          onClose()
        }, 3000)
      }
    }
  }

  const loadVoicemailMessages = async () => {
    try {
      const response = await campaignAPI.getVoicemailMessages()
      if (response.data.success) {
        setVoicemailMessages(response.data.messages)
      }
    } catch (error) {
      console.error('Failed to load voicemail messages:', error)
    }
  }

  const loadCampaignStats = async () => {
    if (!activeCampaign) return

    try {
      const response = await campaignAPI.getStats(activeCampaign.campaign_id)
      if (response.data.success) {
        setStats(response.data.stats)
        // Update active campaign with current dialing contact
        if (response.data.activeCampaign?.currentDialingContact) {
          setActiveCampaign((prev: any) => ({
            ...prev,
            currentDialingContact: response.data.activeCampaign.currentDialingContact
          }))
        } else {
          // Clear current dialing contact if none
          setActiveCampaign((prev: any) => ({
            ...prev,
            currentDialingContact: null
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadActiveCalls = async () => {
    if (!activeCampaign) return
    try {
      const response = await campaignAPI.getActiveCalls(activeCampaign.campaign_id)
      if (response.data.success) {
        setActiveCalls(response.data.activeCalls)
      }
    } catch (error) {
      console.error('Failed to load active calls:', error)
    }
  }

  const createAndStartCampaign = async () => {
    if (!currentUser || !campaignName) {
      alert("Please enter a campaign name")
      return
    }

    setLoading(true)

    try {
      // Create campaign
      const createResponse = await campaignAPI.create({
        name: campaignName,
        type: 'power',
        contactIds: selectedContacts.map(c => c.contact_id),
        callsPerHour,
        maxConcurrentCalls,
        amdEnabled,
        voicemailAction,
        voicemailMessageId: selectedVoicemail || null
      })

      if (!createResponse.data.success) {
        throw new Error('Failed to create campaign')
      }

      const campaign = createResponse.data.campaign

      // Start campaign
      const startResponse = await campaignAPI.start({
        campaignId: campaign.campaign_id,
        agentId: currentUser.userId
      })

      if (startResponse.data.success) {
        setActiveCampaign(startResponse.data.campaign)
        setShowCreateDialog(false)
      }

    } catch (error: any) {
      console.error('Failed to start campaign:', error)
      alert(error.response?.data?.error || 'Failed to start campaign')
    } finally {
      setLoading(false)
    }
  }

  const pauseCampaign = async () => {
    if (!activeCampaign) return

    try {
      await campaignAPI.pause({ campaignId: activeCampaign.campaign_id })
      setActiveCampaign({ ...activeCampaign, status: 'paused' })
    } catch (error) {
      console.error('Failed to pause campaign:', error)
    }
  }

  const resumeCampaign = async () => {
    if (!activeCampaign) return

    try {
      await campaignAPI.resume({ campaignId: activeCampaign.campaign_id })
      setActiveCampaign({ ...activeCampaign, status: 'active' })
    } catch (error) {
      console.error('Failed to resume campaign:', error)
    }
  }

  const stopCampaign = async () => {
    if (!activeCampaign) return

    if (!confirm('Are you sure you want to stop this campaign?')) return

    try {
      await campaignAPI.stop({ campaignId: activeCampaign.campaign_id })
      setActiveCampaign(null)
      onClose()
    } catch (error) {
      console.error('Failed to stop campaign:', error)
    }
  }

  const hangupCall = async (callSid: string) => {
    if (!activeCampaign) return
    
    setHangupLoading(callSid)
    try {
      await campaignAPI.hangupCall({
        callSid,
        campaignId: activeCampaign.campaign_id
      })
      // The status callback will update the UI automatically
    } catch (error) {
      console.error('Failed to hang up call:', error)
      alert('Failed to hang up call')
    } finally {
      setHangupLoading(null)
    }
  }

  const calculateProgress = () => {
    if (!stats) return 0
    const total = stats.total_contacts || selectedContacts.length
    const completed = stats.completed_contacts || 0
    const failed = stats.failed_contacts || 0
    const processed = completed + failed
    return total > 0 ? Math.round((processed / total) * 100) : 0
  }

  const calculateDialRate = () => {
    if (!stats || !activeCampaign) return 0
    const elapsed = (Date.now() - new Date(activeCampaign.startedAt).getTime()) / 1000 / 3600
    return elapsed > 0 ? Math.round((stats.contacts_called || 0) / elapsed) : 0
  }

  const getCallDuration = (startTime: string) => {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    return Math.floor((now - start) / 1000)
  }

  return (
    <>
      {/* Campaign Creation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-white text-lg text-center">
              Create Power Dialer Campaign
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-2">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label className="text-white text-sm">Campaign Name</Label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q4 Sales Outreach"
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>

            {/* Contacts Summary */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-cyan-400 font-semibold text-sm">
                    {selectedContacts.length} Contacts Selected
                  </p>
                  <p className="text-xs text-cyan-300">
                    Ready to dial
                  </p>
                </div>
              </div>
            </div>

            {/* Call Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white text-sm">Calls Per Hour</Label>
                <Input
                  type="number"
                  value={callsPerHour}
                  onChange={(e) => setCallsPerHour(parseInt(e.target.value) || 60)}
                  min={10}
                  max={200}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
                <p className="text-xs text-white/60">
                  60-90 recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">Concurrent Lines</Label>
                <Input
                  type="number"
                  value={maxConcurrentCalls}
                  onChange={(e) => setMaxConcurrentCalls(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
                <p className="text-xs text-white/60">
                  Simultaneous calls
                </p>
              </div>
            </div>

            {/* AMD Settings */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={amdEnabled}
                  onChange={(e) => setAmdEnabled(e.target.checked)}
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                />
                <div className="space-y-1">
                  <Label className="text-white text-sm">Enable Answering Machine Detection</Label>
                  <p className="text-xs text-white/60">
                    Automatically detect voicemails
                  </p>
                </div>
              </div>

              {amdEnabled && (
                <div className="ml-6 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Voicemail Action</Label>
                    <Select value={voicemailAction} onValueChange={setVoicemailAction}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="leave_message" className="text-sm">Leave Pre-recorded Message</SelectItem>
                        <SelectItem value="hangup" className="text-sm">Hang Up Immediately</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {voicemailAction === 'leave_message' && (
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Voicemail Message</Label>
                      <Select value={selectedVoicemail} onValueChange={setSelectedVoicemail}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                          <SelectValue placeholder="Select a message" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 max-h-60">
                          {voicemailMessages.map((msg) => (
                            <SelectItem key={msg.message_id} value={msg.message_id} className="text-sm">
                              {msg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/60">
                        Message dropped automatically
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Performance Estimate */}
            <div className="p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <p className="text-green-400 font-semibold text-sm">Performance Estimate</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-white/60">Dial Rate</p>
                  <p className="text-green-400 font-semibold">{callsPerHour}/hour</p>
                </div>
                <div>
                  <p className="text-white/60">Est. Duration</p>
                  <p className="text-green-400 font-semibold">
                    {Math.round(selectedContacts.length / callsPerHour * 60)} min
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Contact Rate</p>
                  <p className="text-green-400 font-semibold">~35%</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                onClose()
              }}
              className="bg-white/5 border-white/10 text-white h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={createAndStartCampaign}
              disabled={loading || !campaignName}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white h-9 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Start Campaign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Campaign Dashboard */}
      {activeCampaign && !showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-white/10 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{campaignName}</h2>
                  <p className="text-white/60 text-sm">Power Dialer Campaign</p>
                </div>
                <div className="flex items-center gap-3">
                  {campaignCompleted && (
                    <Badge className="bg-green-500/20 text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  <Badge className={
                    activeCampaign.status === 'active' ? "bg-green-500/20 text-green-400" :
                    activeCampaign.status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-gray-500/20 text-gray-400"
                  }>
                    <Activity className="h-3 w-3 mr-1" />
                    {activeCampaign.status}
                  </Badge>
                </div>
              </div>

              {/* Campaign Completed Message */}
              {campaignCompleted && (
                <Card className="bg-green-500/10 border-green-400/30 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-semibold">Campaign Completed!</p>
                      <p className="text-green-300 text-sm">All contacts have been processed. Closing automatically...</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Currently Dialing Contact - Only show when there's actually a contact being dialed */}
              {activeCampaign.currentDialingContact && (
                <Card className="bg-cyan-500/10 border-cyan-400/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-400 animate-pulse" />
                      <h3 className="text-cyan-400 font-semibold text-sm">Currently Dialing...</h3>
                    </div>
                    {activeCalls.length > 0 && (
                      <Button
                        onClick={() => hangupCall(activeCalls[0].callSid)}
                        disabled={hangupLoading === activeCalls[0].callSid}
                        className="bg-red-500/20 border-red-400/30 text-red-400 h-7 text-xs"
                        size="sm"
                      >
                        {hangupLoading === activeCalls[0].callSid ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Square className="h-3 w-3 mr-1" />
                        )}
                        Hang Up
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-cyan-300" />
                      <div>
                        <p className="text-xs text-cyan-300">Contact</p>
                        <p className="text-white font-semibold text-sm">{activeCampaign.currentDialingContact.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-cyan-300" />
                      <div>
                        <p className="text-xs text-cyan-300">Phone</p>
                        <p className="text-white font-semibold text-sm">{activeCampaign.currentDialingContact.phone}</p>
                      </div>
                    </div>
                    {activeCampaign.currentDialingContact.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-cyan-300" />
                        <div>
                          <p className="text-xs text-cyan-300">Company</p>
                          <p className="text-white font-semibold text-sm">{activeCampaign.currentDialingContact.company}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {activeCampaign.currentDialingContact.email && (
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="h-3 w-3 text-cyan-300" />
                      <div>
                        <p className="text-xs text-cyan-300">Email</p>
                        <p className="text-white font-semibold text-sm">{activeCampaign.currentDialingContact.email}</p>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Active Calls Section */}
              {activeCalls.length > 0 && (
                <Card className="bg-purple-500/10 border-purple-400/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="h-4 w-4 text-purple-400" />
                    <h3 className="text-purple-400 font-semibold text-sm">Active Calls</h3>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                      {activeCalls.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {activeCalls.map((call) => (
                      <div key={call.callSid} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-purple-300" />
                          <div>
                            <p className="text-white text-sm font-semibold">{call.contact.name}</p>
                            <p className="text-white/60 text-xs">{call.contact.phone}</p>
                            {call.startTime && (
                              <p className="text-white/40 text-xs">
                                Duration: {getCallDuration(call.startTime)}s
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            {call.status}
                          </Badge>
                          <Button
                            onClick={() => hangupCall(call.callSid)}
                            disabled={hangupLoading === call.callSid}
                            className="bg-red-500/20 border-red-400/30 text-red-400 h-6 text-xs"
                            size="sm"
                          >
                            {hangupLoading === call.callSid ? (
                              <Loader2 className="h-2 w-2 mr-1 animate-spin" />
                            ) : (
                              <Square className="h-2 w-2 mr-1" />
                            )}
                            Hang Up
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">Campaign Progress</p>
                  <p className="text-sm font-semibold text-cyan-400">{calculateProgress()}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                  <span>{stats?.contacts_called || 0} / {stats?.total_contacts || selectedContacts.length} contacts called</span>
                  <span>{stats?.contacts_reached || 0} reached</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-white/5 border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-cyan-500/20 rounded">
                      <Phone className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Dial Rate</p>
                      <p className="text-lg font-bold text-cyan-400">{calculateDialRate()}</p>
                      <p className="text-xs text-white/60">calls/hour</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-500/20 rounded">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Connected</p>
                      <p className="text-lg font-bold text-green-400">{stats?.connected_calls || 0}</p>
                      <p className="text-xs text-white/60">
                        {stats?.total_calls > 0 ? Math.round((stats?.connected_calls / stats?.total_calls) * 100) : 0}% rate
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-purple-500/20 rounded">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Voicemails</p>
                      <p className="text-lg font-bold text-purple-400">{stats?.voicemails || 0}</p>
                      <p className="text-xs text-white/60">
                        {stats?.voicemail_dropped || 0} msgs dropped
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-yellow-500/20 rounded">
                      <Target className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Qualified</p>
                      <p className="text-lg font-bold text-yellow-400">{stats?.qualified_leads || 0}</p>
                      <p className="text-xs text-white/60">
                        {stats?.converted_leads || 0} converted
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Real-time Activity Feed */}
              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-semibold text-white text-sm">Live Activity</h3>
                </div>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {stats?.recent_calls?.slice(0, 8).map((call: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-white/60" />
                        <div>
                          <span className="text-white">{call.name}</span>
                          {call.company && (
                            <span className="text-xs text-white/60 ml-2">({call.company})</span>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        call.result === 'connected' ? "bg-green-500/20 text-green-400 text-xs" :
                        call.result === 'voicemail' ? "bg-purple-500/20 text-purple-400 text-xs" :
                        call.result === 'unverified_number' ? "bg-red-500/20 text-red-400 text-xs" :
                        call.result === 'failed' ? "bg-red-500/20 text-red-400 text-xs" :
                        "bg-gray-500/20 text-gray-400 text-xs"
                      }>
                        {call.result === 'unverified_number' ? 'unverified' : call.result}
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-white/60 text-center py-4">
                      Waiting for calls to start...
                    </p>
                  )}
                </div>
              </Card>

              {/* Campaign Controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                {activeCampaign.status === 'active' ? (
                  <Button
                    onClick={pauseCampaign}
                    className="flex-1 bg-yellow-500/20 border-yellow-400/30 text-yellow-400 h-9 text-sm"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause Campaign
                  </Button>
                ) : (
                  <Button
                    onClick={resumeCampaign}
                    className="flex-1 bg-green-500/20 border-green-400/30 text-green-400 h-9 text-sm"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume Campaign
                  </Button>
                )}
                
                <Button
                  onClick={stopCampaign}
                  className="flex-1 bg-red-500/20 border-red-400/30 text-red-400 h-9 text-sm"
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop Campaign
                </Button>

                <Button
                  onClick={() => {
                    loadCampaignStats()
                    loadActiveCalls()
                  }}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}