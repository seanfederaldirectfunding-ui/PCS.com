"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Headphones,
  Building2,
  Globe,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  Settings,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServiceClient {
  id: string
  companyName: string
  industry: string
  website: string
  status: "active" | "training" | "paused"
  callsHandled: number
  satisfaction: number
  productInfo: string
  trainingStatus: string
}

export function CustomerServiceHub() {
  const [clients, setClients] = useState<ServiceClient[]>([
    {
      id: "CS001",
      companyName: "TechStart Solutions",
      industry: "SaaS",
      website: "https://techstart.example.com",
      status: "active",
      callsHandled: 1247,
      satisfaction: 4.8,
      productInfo: "Cloud-based project management software",
      trainingStatus: "Fully Trained",
    },
    {
      id: "CS002",
      companyName: "HealthCare Plus",
      industry: "Healthcare",
      website: "https://healthcareplus.example.com",
      status: "training",
      callsHandled: 0,
      satisfaction: 0,
      productInfo: "Telemedicine platform",
      trainingStatus: "In Progress - 65%",
    },
  ])
  const [selectedClient, setSelectedClient] = useState<ServiceClient | null>(clients[0])
  const [newClientForm, setNewClientForm] = useState({
    companyName: "",
    industry: "",
    website: "",
    productInfo: "",
  })

  const [prompts, setPrompts] = useState({
    greeting:
      "Hello! Thank you for contacting [Company Name]. My name is [Agent Name], and I'm here to help you today. How can I assist you?",
    productInquiry:
      "I'd be happy to help you learn more about [Product Name]. Let me pull up that information for you. [Product Name] is designed to [Key Benefit]. What specific questions do you have?",
    technicalSupport:
      "I understand you're experiencing an issue with [Product/Service]. Let me help you resolve this. Can you describe what's happening in more detail?",
    billing:
      "I can help you with your billing question. Let me access your account information. For security purposes, can you verify [Verification Method]?",
    complaint:
      "I sincerely apologize for the inconvenience you've experienced. Your satisfaction is our top priority, and I want to make this right. Can you tell me more about what happened?",
    escalation:
      "I understand this is important to you. Let me connect you with a specialist who can provide additional assistance. Please hold for just a moment.",
    closing:
      "Is there anything else I can help you with today? Thank you for contacting [Company Name]. We appreciate your business!",
    offScript:
      "I understand your situation is unique. Let me see what I can do to help you with this specific request.",
    pagemasterAssist:
      "Let me check the latest information on our website for you. I'm accessing our knowledge base now to give you the most accurate answer.",
  })

  const [aiConfig, setAiConfig] = useState({
    flexibility: "balanced", // strict, balanced, flexible
    escalationTriggers: ["angry", "legal threat", "refund request", "technical issue beyond scope"],
    knowledgeBase: "",
    customInstructions: "",
    pagemasterEnabled: true,
    pagemasterAutoScrape: true,
    pagemasterUpdateFrequency: "daily", // hourly, daily, weekly
  })

  const handleAddClient = () => {
    const newClient: ServiceClient = {
      id: `CS${String(clients.length + 1).padStart(3, "0")}`,
      companyName: newClientForm.companyName,
      industry: newClientForm.industry,
      website: newClientForm.website,
      status: "training",
      callsHandled: 0,
      satisfaction: 0,
      productInfo: newClientForm.productInfo,
      trainingStatus: "Initializing...",
    }
    setClients([...clients, newClient])
    setNewClientForm({ companyName: "", industry: "", website: "", productInfo: "" })
    console.log("[v0] New customer service client added:", newClient.companyName)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "training":
        return "bg-yellow-500"
      case "paused":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Headphones className="h-5 w-5 text-cyan-400" />
            Customer Service Hub
          </CardTitle>
          <CardDescription className="text-slate-300">
            Manage third-party customer service clients and AI training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Active Clients</p>
                    <p className="text-2xl font-bold text-white">
                      {clients.filter((c) => c.status === "active").length}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Calls</p>
                    <p className="text-2xl font-bold text-white">
                      {clients.reduce((sum, c) => sum + c.callsHandled, 0).toLocaleString()}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Avg Satisfaction</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        clients.filter((c) => c.satisfaction > 0).reduce((sum, c) => sum + c.satisfaction, 0) /
                        clients.filter((c) => c.satisfaction > 0).length
                      ).toFixed(1)}
                      /5.0
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">In Training</p>
                    <p className="text-2xl font-bold text-white">
                      {clients.filter((c) => c.status === "training").length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Service Clients ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {clients.map((client) => (
                  <Card
                    key={client.id}
                    className={`cursor-pointer transition-all ${
                      selectedClient?.id === client.id
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{client.companyName}</span>
                          <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-300">
                          <div>{client.industry}</div>
                          {client.status === "active" && (
                            <div className="text-green-400">{client.callsHandled} calls handled</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-400" />
              Client Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="new">Add New</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {selectedClient ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Client ID</Label>
                        <Input value={selectedClient.id} readOnly className="bg-slate-800 text-white" />
                      </div>
                      <div>
                        <Label className="text-slate-300">Status</Label>
                        <Badge className={getStatusColor(selectedClient.status)}>{selectedClient.status}</Badge>
                      </div>
                      <div>
                        <Label className="text-slate-300">Company Name</Label>
                        <Input value={selectedClient.companyName} readOnly className="bg-slate-800 text-white" />
                      </div>
                      <div>
                        <Label className="text-slate-300">Industry</Label>
                        <Input value={selectedClient.industry} readOnly className="bg-slate-800 text-white" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-slate-300">Website</Label>
                        <Input value={selectedClient.website} readOnly className="bg-slate-800 text-white" />
                      </div>
                      <div>
                        <Label className="text-slate-300">Calls Handled</Label>
                        <Input
                          value={selectedClient.callsHandled.toLocaleString()}
                          readOnly
                          className="bg-slate-800 text-white font-bold"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Satisfaction Score</Label>
                        <Input
                          value={selectedClient.satisfaction > 0 ? `${selectedClient.satisfaction}/5.0` : "N/A"}
                          readOnly
                          className="bg-slate-800 text-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Product/Service Information</Label>
                      <Textarea
                        value={selectedClient.productInfo}
                        readOnly
                        className="bg-slate-800 text-white"
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-8">Select a client to view details</div>
                )}
              </TabsContent>

              <TabsContent value="training" className="space-y-4">
                {selectedClient ? (
                  <>
                    <Card className="bg-slate-800 border-cyan-500/20">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-cyan-400" />
                          AI Training Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Training Progress</span>
                          <Badge
                            className={
                              selectedClient.trainingStatus === "Fully Trained" ? "bg-green-500" : "bg-yellow-500"
                            }
                          >
                            {selectedClient.trainingStatus}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-slate-300">Website scraped and analyzed</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-slate-300">Product knowledge base created</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-slate-300">FAQs imported and processed</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {selectedClient.status === "active" ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-slate-600 rounded-full" />
                            )}
                            <span className="text-slate-300">GENIUS AI ready for deployment</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-cyan-500/20">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">PAGEMASTER Website Learning</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-slate-300">Website URL</Label>
                          <Input value={selectedClient.website} readOnly className="bg-slate-900 text-white" />
                        </div>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
                          <Globe className="mr-2 h-4 w-4" />
                          Re-scan Website
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-8">Select a client to view training status</div>
                )}
              </TabsContent>

              <TabsContent value="prompts" className="space-y-4">
                {selectedClient ? (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4 pr-4">
                      {/* PAGEMASTER Integration Card */}
                      <Card className="bg-gradient-to-br from-purple-900/50 to-slate-800 border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <Globe className="h-4 w-4 text-purple-400" />
                            PAGEMASTER Integration
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            GENIUS AI has full access to PAGEMASTER for real-time website learning and navigation
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-400" />
                              PAGEMASTER Capabilities
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>Automatically scrapes and learns client website content</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>Navigates complex website structures to find information</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>Extracts product details, pricing, FAQs, and documentation</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>Updates knowledge base automatically when website changes</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>Provides real-time answers from live website data</span>
                              </li>
                            </ul>
                          </div>

                          <div>
                            <Label className="text-slate-300">Enable PAGEMASTER Assistance</Label>
                            <Select
                              value={aiConfig.pagemasterEnabled ? "enabled" : "disabled"}
                              onValueChange={(value) =>
                                setAiConfig({ ...aiConfig, pagemasterEnabled: value === "enabled" })
                              }
                            >
                              <SelectTrigger className="bg-slate-900 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enabled">Enabled - GENIUS can command PAGEMASTER</SelectItem>
                                <SelectItem value="disabled">Disabled - Manual knowledge base only</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-400 mt-1">
                              When enabled, GENIUS AI can command PAGEMASTER to scrape websites and retrieve real-time
                              information during customer calls
                            </p>
                          </div>

                          <div>
                            <Label className="text-slate-300">Auto-Scrape Website Updates</Label>
                            <Select
                              value={aiConfig.pagemasterAutoScrape ? "yes" : "no"}
                              onValueChange={(value) =>
                                setAiConfig({ ...aiConfig, pagemasterAutoScrape: value === "yes" })
                              }
                            >
                              <SelectTrigger className="bg-slate-900 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes - Auto-update knowledge base</SelectItem>
                                <SelectItem value="no">No - Manual updates only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-slate-300">Update Frequency</Label>
                            <Select
                              value={aiConfig.pagemasterUpdateFrequency}
                              onValueChange={(value) => setAiConfig({ ...aiConfig, pagemasterUpdateFrequency: value })}
                            >
                              <SelectTrigger className="bg-slate-900 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly - Maximum freshness</SelectItem>
                                <SelectItem value="daily">Daily - Recommended</SelectItem>
                                <SelectItem value="weekly">Weekly - Stable content</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-slate-300">PAGEMASTER Assist Prompt</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={3}
                              value={prompts.pagemasterAssist}
                              onChange={(e) => setPrompts({ ...prompts, pagemasterAssist: e.target.value })}
                            />
                            <p className="text-xs text-slate-400 mt-1">
                              What GENIUS says when accessing PAGEMASTER for real-time information
                            </p>
                          </div>

                          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              GENIUS + PAGEMASTER = 100% Customer Service Coverage
                            </h4>
                            <p className="text-sm text-slate-300">
                              With PAGEMASTER integration, GENIUS AI can handle ANY customer service question by
                              accessing real-time website data, navigating documentation, and learning product
                              information on-demand. No question goes unanswered.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-cyan-500/20">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <Settings className="h-4 w-4 text-cyan-400" />
                            AI Behavior Configuration
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            Control how GENIUS AI handles customer service calls for {selectedClient.companyName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Conversation Flexibility</Label>
                            <Select
                              value={aiConfig.flexibility}
                              onValueChange={(value) => setAiConfig({ ...aiConfig, flexibility: value })}
                            >
                              <SelectTrigger className="bg-slate-900 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="strict">Strict - Follow scripts exactly</SelectItem>
                                <SelectItem value="balanced">Balanced - Adapt when needed</SelectItem>
                                <SelectItem value="flexible">Flexible - Natural conversation flow</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-400 mt-1">
                              {aiConfig.flexibility === "strict" &&
                                "AI will strictly follow prompts and escalate if customer goes off-script"}
                              {aiConfig.flexibility === "balanced" &&
                                "AI can adapt to customer needs while maintaining structure"}
                              {aiConfig.flexibility === "flexible" &&
                                "AI has full autonomy to handle unique situations naturally"}
                            </p>
                          </div>

                          <div>
                            <Label className="text-slate-300">Custom Instructions for GENIUS AI</Label>
                            <Textarea
                              placeholder="Add specific instructions for how GENIUS should handle this client's customers..."
                              className="bg-slate-900 text-white"
                              rows={4}
                              value={aiConfig.customInstructions}
                              onChange={(e) => setAiConfig({ ...aiConfig, customInstructions: e.target.value })}
                            />
                            <p className="text-xs text-slate-400 mt-1">
                              Example: "Always offer a discount code for first-time customers" or "Prioritize technical
                              support over sales"
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-cyan-500/20">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">Customer Service Prompts</CardTitle>
                          <CardDescription className="text-slate-400">
                            Customize what GENIUS AI says in different scenarios
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Greeting</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={2}
                              value={prompts.greeting}
                              onChange={(e) => setPrompts({ ...prompts, greeting: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label className="text-slate-300">Product Inquiry</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={3}
                              value={prompts.productInquiry}
                              onChange={(e) => setPrompts({ ...prompts, productInquiry: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label className="text-slate-300">Technical Support</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={3}
                              value={prompts.technicalSupport}
                              onChange={(e) => setPrompts({ ...prompts, technicalSupport: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label className="text-slate-300">Billing Questions</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={3}
                              value={prompts.billing}
                              onChange={(e) => setPrompts({ ...prompts, billing: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label className="text-slate-300">Complaint Handling</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={3}
                              value={prompts.complaint}
                              onChange={(e) => setPrompts({ ...prompts, complaint: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label className="text-slate-300">Off-Script Situations</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={2}
                              value={prompts.offScript}
                              onChange={(e) => setPrompts({ ...prompts, offScript: e.target.value })}
                            />
                            <p className="text-xs text-slate-400 mt-1">
                              Used when customer has unique situation not covered by standard prompts
                            </p>
                          </div>

                          <div>
                            <Label className="text-slate-300">Escalation to Human Agent</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={2}
                              value={prompts.escalation}
                              onChange={(e) => setPrompts({ ...prompts, escalation: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label className="text-slate-300">Closing</Label>
                            <Textarea
                              className="bg-slate-900 text-white"
                              rows={2}
                              value={prompts.closing}
                              onChange={(e) => setPrompts({ ...prompts, closing: e.target.value })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-slate-400 py-8">Select a client to configure prompts</div>
                )}
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <Card className="bg-slate-800 border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Add New Customer Service Client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Company Name</Label>
                      <Input
                        placeholder="Enter company name"
                        className="bg-slate-900 text-white"
                        value={newClientForm.companyName}
                        onChange={(e) => setNewClientForm({ ...newClientForm, companyName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Industry</Label>
                      <Input
                        placeholder="e.g., SaaS, Healthcare, E-commerce"
                        className="bg-slate-900 text-white"
                        value={newClientForm.industry}
                        onChange={(e) => setNewClientForm({ ...newClientForm, industry: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Website URL</Label>
                      <Input
                        placeholder="https://example.com"
                        className="bg-slate-900 text-white"
                        value={newClientForm.website}
                        onChange={(e) => setNewClientForm({ ...newClientForm, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Product/Service Description</Label>
                      <Textarea
                        placeholder="Describe the client's products or services..."
                        className="bg-slate-900 text-white"
                        rows={4}
                        value={newClientForm.productInfo}
                        onChange={(e) => setNewClientForm({ ...newClientForm, productInfo: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handleAddClient}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      disabled={!newClientForm.companyName || !newClientForm.website}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Add Client & Start Training
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
