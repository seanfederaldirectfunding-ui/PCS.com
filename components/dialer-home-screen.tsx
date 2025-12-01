"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SoftPhone } from "@/components/soft-phone"
import { BulkTexter } from "@/components/bulk-texter"
import { SMSResponsePanel } from "@/components/sms-response-panel"
import { StripeCheckout } from "@/components/stripe-checkout"
import { PaymentHistory } from "@/components/payment-history"
import { ContactManager } from "@/components/contact-manager"
import { CampaignDashboard } from "@/components/campaign-dashboard"
import { VoicemailManager } from "@/components/voicemail-manager"
import { CampaignHistory } from "@/components/campaign-history" // ✅ NEW
import { Bot, User, Zap, Phone, MessageSquare, CreditCard, DollarSign, CheckCircle, Users, Settings, History } from "lucide-react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesFloorAmbience } from "@/components/sales-floor-ambience"
import { contactsAPI } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"

interface Contact {
  contact_id: string
  name: string
  phone: string
  email?: string
  company?: string
  status: "new" | "contacted" | "qualified" | "converted" | "unreachable"
  lead_score: number
  assigned_to: "unassigned" | "ai" | "human"
}

export function DialerHomeScreen() {
  const [activeTab, setActiveTab] = useState("contacts")
  const [stats, setStats] = useState({
    total_contacts: 0,
    ai_assigned: 0,
    human_assigned: 0,
    unassigned: 0,
    new_contacts: 0,
    contacted: 0,
    qualified: 0,
    converted: 0
  })
  
  const [showCampaignDashboard, setShowCampaignDashboard] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  
  const currentUser = authService.getCurrentUser()

  // Load stats
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    if (!currentUser) return
    try {
      const response = await contactsAPI.getStats(currentUser.userId)
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // Handle campaign start
  const handleStartCampaign = (contacts: Contact[]) => {
    setSelectedContacts(contacts)
    setShowCampaignDashboard(true)
  }

  // Handle campaign close
  const handleCloseCampaign = () => {
    setShowCampaignDashboard(false)
    setSelectedContacts([])
    loadStats() // Refresh stats after campaign
  }

  const statsCards = [
    { 
      label: "Total Contacts", 
      value: stats.total_contacts.toString(), 
      color: "text-cyan-400",
      icon: Users,
      description: "All contacts in system"
    },
    { 
      label: "AI Assigned", 
      value: stats.ai_assigned.toString(), 
      color: "text-purple-400",
      icon: Bot,
      description: "Ready for AI campaigns"
    },
    { 
      label: "Human Assigned", 
      value: stats.human_assigned.toString(), 
      color: "text-green-400",
      icon: User,
      description: "Ready for human calls"
    },
    { 
      label: "Unassigned", 
      value: stats.unassigned.toString(), 
      color: "text-orange-400",
      icon: Zap,
      description: "Need assignment"
    },
  ]

  const statusCards = [
    {
      label: "New Contacts",
      value: stats.new_contacts.toString(),
      color: "text-blue-400",
      icon: Users,
      description: "Never contacted"
    },
    {
      label: "Contacted",
      value: stats.contacted.toString(),
      color: "text-yellow-400",
      icon: Phone,
      description: "Successfully reached"
    },
    {
      label: "Qualified",
      value: stats.qualified.toString(),
      color: "text-purple-400",
      icon: CheckCircle,
      description: "Promising leads"
    },
    {
      label: "Converted",
      value: stats.converted.toString(),
      color: "text-green-400",
      icon: DollarSign,
      description: "Successful conversions"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30 backdrop-blur-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional Power Dialer</h3>
            <p className="text-white/80">
              Multi-agent call center with AMD, voicemail drop, and real-time analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "Answering Machine Detection",
              "Voicemail Drop",
              "Call Pacing Control",
              "Real-time Analytics",
              "Multi-Agent Support",
            ].map((feature) => (
              <Badge key={feature} className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-white/10 backdrop-blur-sm">
          <TabsTrigger value="contacts" className="data-[state=active]:bg-cyan-500/20">
            <Users className="h-4 w-4 mr-2" />
            Contact Manager
          </TabsTrigger>
          <TabsTrigger value="voicemail" className="data-[state=active]:bg-cyan-500/20">
            <MessageSquare className="h-4 w-4 mr-2" />
            Voicemail Messages
          </TabsTrigger>
          <TabsTrigger value="dialer" className="data-[state=active]:bg-cyan-500/20">
            <Phone className="h-4 w-4 mr-2" />
            Manual Dialer
          </TabsTrigger>
          <TabsTrigger value="campaign-history" className="data-[state=active]:bg-cyan-500/20"> {/* ✅ NEW TAB */}
            <History className="h-4 w-4 mr-2" />
            Campaign History
          </TabsTrigger>
          <TabsTrigger value="checkout" className="data-[state=active]:bg-cyan-500/20">
            <CreditCard className="h-4 w-4 mr-2" />
            Stripe Checkout
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-500/20">
            <DollarSign className="h-4 w-4 mr-2" />
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Contact Manager Tab */}
        <TabsContent value="contacts" className="mt-6">
          <ContactManager 
            onStartCampaign={handleStartCampaign}
          />
        </TabsContent>

        {/* Voicemail Messages Tab */}
        <TabsContent value="voicemail" className="mt-6">
          <VoicemailManager />
        </TabsContent>

        {/* Manual Dialer & Messaging Tab */}
        <TabsContent value="dialer" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats and Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsCards.map((stat) => (
                  <Card key={stat.label} className="bg-black/40 border-white/10 backdrop-blur-sm p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/5`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-white/40 mt-1">{stat.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Status Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statusCards.map((stat) => (
                  <Card key={stat.label} className="bg-black/40 border-white/10 backdrop-blur-sm p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/5`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-white/40 mt-1">{stat.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white h-16"
                    onClick={() => setActiveTab("contacts")}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Start New Campaign
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-16"
                    onClick={() => setActiveTab("voicemail")}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Manage Voicemails
                  </Button>
                </div>
              </Card>
            </div>

            {/* Soft Phone Widget */}
            <div className="lg:col-span-1">
              <SoftPhone />
            </div>
          </div>

          {/* Messaging Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BulkTexter />
            <SMSResponsePanel />
          </div>
        </TabsContent>

        {/* ✅ NEW: Campaign History Tab */}
        <TabsContent value="campaign-history" className="mt-6">
          <CampaignHistory />
        </TabsContent>

        {/* Stripe Checkout Tab */}
        <TabsContent value="checkout" className="mt-6">
          <StripeCheckout />
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="mt-6">
          <PaymentHistory />
        </TabsContent>
      </Tabs>

      <SalesFloorAmbience />

      {/* Campaign Dashboard Modal */}
      {showCampaignDashboard && (
        <CampaignDashboard 
          selectedContacts={selectedContacts}
          onClose={handleCloseCampaign}
        />
      )}
    </div>
  )
}