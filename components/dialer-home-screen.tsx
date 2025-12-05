"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SoftPhone } from "@/components/soft-phone"
import { BulkTexter } from "@/components/bulk-texter"
import { SMSResponsePanel } from "@/components/sms-response-panel"
import { StripeCheckout } from "@/components/stripe-checkout"
import { PaymentHistory } from "@/components/payment-history"
import { ContactsImport } from "@/components/contacts-import"
import { ContactsList } from "@/components/contacts-list"
import { Bot, User, Zap, Phone, Mail, MessageSquare, Send, CreditCard, DollarSign, CheckCircle, Users } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesFloorAmbience } from "@/components/sales-floor-ambience"

export function DialerHomeScreen() {
  const [activeTab, setActiveTab] = useState("dialer")
  const [selectedContact, setSelectedContact] = useState<any>(null)

  const handleCall = async (phone: string, contact?: any) => {
    console.log('[Dialer] Making call to:', phone, contact)
    try {
      const response = await fetch('/api/dialer/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: phone,
          from: process.env.NEXT_PUBLIC_VOIPSTUDIO_CALLER_ID || '',
          contactId: contact?.id,
          campaignId: null
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Call initiated to ${phone}${contact?.first_name ? ` (${contact.first_name} ${contact.last_name})` : ''}`)
      } else {
        alert(`Failed to make call: ${data.error}`)
      }
    } catch (error) {
      console.error('[Dialer] Call error:', error)
      alert('Failed to initiate call. Check console for details.')
    }
  }

  const stats = [
    { label: "Contacts Queued", value: "247", color: "text-cyan-400" },
    { label: "Prospects Today", value: "12", color: "text-green-400" },
    { label: "Hot Leads", value: "7", color: "text-orange-400" },
    { label: "Applications", value: "3", color: "text-purple-400" },
  ]

  const channels = [
    { name: "Email", icon: Mail, color: "bg-blue-500" },
    { name: "SMS", icon: MessageSquare, color: "bg-green-500" },
    { name: "Voice", icon: Phone, color: "bg-purple-500" },
    { name: "WhatsApp", icon: MessageSquare, color: "bg-emerald-500" },
    { name: "Telegram", icon: Send, color: "bg-sky-500" },
    { name: "Signal", icon: MessageSquare, color: "bg-indigo-500" },
    { name: "Facebook", icon: MessageSquare, color: "bg-blue-600" },
    { name: "Instagram", icon: MessageSquare, color: "bg-pink-500" },
    { name: "Snapchat", icon: MessageSquare, color: "bg-yellow-400" },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30 backdrop-blur-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Complete Business Solution</h3>
            <p className="text-white/80">
              Power dialer, CRM, bulk messaging, payment processing, and automation - all in one platform
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "AI-Powered Dialing",
              "Multi-Channel Messaging",
              "Stripe Payments",
              "Lead Automation",
              "Document Collection",
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
          <TabsTrigger value="dialer" className="data-[state=active]:bg-cyan-500/20">
            <Phone className="h-4 w-4 mr-2" />
            Dialer & Messaging
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-cyan-500/20">
            <Users className="h-4 w-4 mr-2" />
            Contacts
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

        <TabsContent value="dialer" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="bg-black/40 border-white/10 backdrop-blur-sm p-4">
                    <p className="text-xs text-white/60 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Select Dialing Mode</h2>

                <Card className="bg-gradient-to-br from-purple-900/40 to-purple-600/20 border-purple-500/30 backdrop-blur-sm p-6 hover:border-purple-400/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Unattended AI</h3>
                        <p className="text-sm text-purple-300">Fully automated calling</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">AI Powered</Badge>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      AI cold calls automatically
                    </li>
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      Pre-screens leads intelligently
                    </li>
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      Collects documents automatically
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    Start AI Only
                  </Button>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/40 to-green-600/20 border-green-500/30 backdrop-blur-sm p-6 hover:border-green-400/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Human Only</h3>
                        <p className="text-sm text-green-300">Manual agent control</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Agent Control</Badge>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Power dialer for agents
                    </li>
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Predictive mode available
                    </li>
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Full agent control
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    Start Human
                  </Button>
                </Card>

                <Card className="bg-gradient-to-br from-orange-900/40 to-orange-600/20 border-orange-500/30 backdrop-blur-sm p-6 hover:border-orange-400/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Hybrid Mode</h3>
                        <p className="text-sm text-orange-300">Best of both worlds</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">Recommended</Badge>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      Agent dials out manually
                    </li>
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      AI handles incoming calls
                    </li>
                    <li className="text-sm text-white/80 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      Best of both worlds
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    Start Hybrid
                  </Button>
                </Card>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-lg font-bold text-white mb-4">Multi-Channel Auto-Send</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {channels.map((channel) => (
                    <div key={channel.name} className="relative">
                      <div
                        className={`${channel.color} rounded-lg p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer`}
                      >
                        <channel.icon className="h-5 w-5 text-white" />
                        <span className="text-xs text-white font-medium">{channel.name}</span>
                      </div>
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5">
                        Auto
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <SoftPhone />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BulkTexter />
            <SMSResponsePanel />
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          <ContactsImport />
          <ContactsList 
            onSelectContact={setSelectedContact}
            onCall={handleCall}
          />
        </TabsContent>

        <TabsContent value="checkout" className="mt-6">
          <StripeCheckout />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentHistory />
        </TabsContent>
      </Tabs>

      <SalesFloorAmbience />
    </div>
  )
}
