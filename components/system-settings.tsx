"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings,
  Phone,
  Bot,
  Scale,
  DollarSign,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  Save,
  AlertTriangle,
  Copy,
  Headphones,
  Globe,
  Building2,
  BookOpen,
  Sparkles,
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  type: "sales" | "lead_gathering" | "debt_collection" | "custom"
  mode: "ai" | "human" | "hybrid"
  status: "active" | "paused" | "scheduled"
  script: string
  complianceRules: string[]
  targetList: string
  callsPerHour: number
  channels: string[]
  surveyQuestions?: string[]
  productService?: string
}

interface ClientProfile {
  id: string
  companyName: string
  industry: string
  websiteUrl: string
  productDescription: string
  serviceMode: "sales" | "customer_service" | "both"
  faqs: { question: string; answer: string }[]
  knowledgeBase: string
  trainingStatus: "pending" | "training" | "ready"
  lastTrained: string
}

const campaignTemplates = {
  mca: {
    name: "MCA (Merchant Cash Advance)",
    type: "sales" as const,
    productService: "Merchant Cash Advance",
    script: `Hi, this is [NAME] calling from PAGE CRM. I'm reaching out to business owners who may need quick access to working capital. We specialize in Merchant Cash Advances - fast funding based on your daily credit card sales, typically funded within 24-48 hours.

Are you currently looking for business financing? [WAIT FOR RESPONSE]

Great! With an MCA, you can get $5,000 to $500,000 based on your monthly revenue. There's no collateral required, and approval is based on your sales, not your credit score.

What's your average monthly revenue? [WAIT FOR RESPONSE]

Perfect! Based on that, you could qualify for [AMOUNT]. The process is simple - we just need 3 months of bank statements and we can have an offer to you within hours.

Can I send you a quick application to get started?`,
    surveyQuestions: [
      "What is your average monthly revenue?",
      "How long have you been in business?",
      "Do you accept credit cards?",
      "Have you used business financing before?",
    ],
  },
  termLoan: {
    name: "Bank Term Loan",
    type: "sales" as const,
    productService: "Bank Term Loan",
    script: `Hello, this is [NAME] from PAGE CRM. I'm calling business owners about our competitive term loan programs. We work with multiple lenders to get you the best rates and terms for your business.

Are you currently in the market for business financing? [WAIT FOR RESPONSE]

Excellent! Our term loans range from $25,000 to $5 million with terms up to 10 years. Rates start as low as 6% APR for qualified borrowers.

What would you use the funding for? [WAIT FOR RESPONSE]

That's a great use of capital. For [PURPOSE], we typically recommend a [TERM] term loan.

Can you tell me about your business - how long have you been operating and what's your annual revenue? [WAIT FOR RESPONSE]

Based on what you've shared, you should qualify. I'd like to send you our simple application - it takes about 5 minutes to complete. Can I get your email?`,
    surveyQuestions: [
      "What is your annual revenue?",
      "How long have you been in business?",
      "What is your credit score range?",
      "What will you use the funds for?",
    ],
  },
  bankLOC: {
    name: "Bank Line of Credit",
    type: "sales" as const,
    productService: "Bank Line of Credit",
    script: `Hi, this is [NAME] calling from PAGE CRM. I specialize in helping businesses establish lines of credit for ongoing working capital needs.

Do you currently have a business line of credit? [WAIT FOR RESPONSE]

A line of credit gives you access to funds whenever you need them - you only pay interest on what you use. It's perfect for managing cash flow, covering unexpected expenses, or taking advantage of opportunities.

Our lines range from $10,000 to $250,000 with rates starting at 8% APR. You can draw funds as needed and pay them back on your schedule.

What's your typical monthly revenue? [WAIT FOR RESPONSE]

Based on that, you could qualify for a line up to [AMOUNT]. The application is quick - we just need basic business information and 3 months of bank statements.

Would you like me to send you the application link?`,
    surveyQuestions: [
      "What is your monthly revenue?",
      "Do you have existing business credit?",
      "How long have you been in business?",
      "What would you use the line of credit for?",
    ],
  },
  equipmentFinancing: {
    name: "Equipment Financing",
    type: "sales" as const,
    productService: "Equipment Financing",
    script: `Hello, this is [NAME] from PAGE CRM. I'm reaching out to business owners about equipment financing options. We help businesses acquire the equipment they need without large upfront costs.

Are you looking to purchase or upgrade any business equipment? [WAIT FOR RESPONSE]

Great! We finance all types of equipment - from vehicles and machinery to computers and office equipment. Amounts range from $5,000 to $5 million with terms up to 7 years.

What type of equipment are you looking to finance? [WAIT FOR RESPONSE]

Perfect! For [EQUIPMENT TYPE], we typically offer [TERMS]. The equipment itself serves as collateral, so approval is easier than traditional loans. Rates start at 7% APR.

Do you have a quote or know the approximate cost? [WAIT FOR RESPONSE]

Excellent! I can get you pre-qualified today. The application takes just a few minutes. Can I send it to your email?`,
    surveyQuestions: [
      "What type of equipment do you need?",
      "What is the approximate cost?",
      "How long have you been in business?",
      "What is your monthly revenue?",
    ],
  },
  grants: {
    name: "Grant Matching Services",
    type: "lead_gathering" as const,
    productService: "Grant Matching & Application Services",
    script: `Hi, this is [NAME] calling from PAGE CRM. We help businesses find and apply for grants - free money that doesn't need to be repaid.

Are you aware that your business may qualify for federal, state, or private grants? [WAIT FOR RESPONSE]

Most business owners don't realize there are thousands of grants available. We have a database of over 10,000 grant opportunities and we match businesses to grants they qualify for.

Let me ask you a few quick questions to see what you might qualify for:

Are you a minority-owned business, veteran-owned, or woman-owned? [WAIT FOR RESPONSE]
What industry are you in? [WAIT FOR RESPONSE]
What would you use grant funding for? [WAIT FOR RESPONSE]

Based on your answers, you could qualify for [NUMBER] different grants totaling up to [AMOUNT]. Our service includes finding grants, helping with applications, and following up until you're funded.

Would you like me to send you a free grant eligibility report?`,
    surveyQuestions: [
      "Are you minority-owned, veteran-owned, or woman-owned?",
      "What industry is your business in?",
      "What would you use grant funding for?",
      "What is your annual revenue?",
      "How many employees do you have?",
    ],
  },
  debtCollection: {
    name: "Pre-Collection Service",
    type: "debt_collection" as const,
    productService: "Debt Collection Services",
    script: `Hello, may I speak with [DEBTOR NAME]? [WAIT FOR RESPONSE]

This is [NAME] calling from [CLIENT COMPANY]. This is an attempt to collect a debt. Any information obtained will be used for that purpose.

I'm calling regarding account number [ACCOUNT]. Our records show a balance of [AMOUNT] that is currently [DAYS] days past due.

I want to help you resolve this matter today. Can you bring this account current? [WAIT FOR RESPONSE]

I understand financial difficulties happen. Let me see what options we have available:

1. We can set up a payment plan - as low as [AMOUNT] per month
2. We may be able to offer a settlement for [REDUCED AMOUNT]
3. If you're experiencing hardship, we have programs that can help

Which option works best for your situation? [WAIT FOR RESPONSE]

Great! Let me get that set up for you right now. I'll need to verify some information...

[PROCESS PAYMENT OR ARRANGEMENT]

You'll receive a confirmation email within 24 hours. Is there anything else I can help you with today?`,
    surveyQuestions: [
      "Can you make a payment today?",
      "What payment amount can you afford?",
      "Are you experiencing financial hardship?",
      "When can you make your next payment?",
    ],
  },
  customSales: {
    name: "Custom Product/Service Sales",
    type: "custom" as const,
    productService: "Custom Product or Service",
    script: `Hi, this is [NAME] calling from [COMPANY]. I'm reaching out to [TARGET AUDIENCE] about [PRODUCT/SERVICE].

Are you currently [PAIN POINT OR NEED]? [WAIT FOR RESPONSE]

Great! [PRODUCT/SERVICE] helps [TARGET AUDIENCE] by [KEY BENEFIT]. Our clients typically see [RESULT] within [TIMEFRAME].

Let me tell you how it works: [BRIEF EXPLANATION]

The investment is [PRICE] and includes [WHAT'S INCLUDED].

Does this sound like something that could help your [BUSINESS/SITUATION]? [WAIT FOR RESPONSE]

Excellent! I'd love to [NEXT STEP - send info, schedule demo, etc.]. What's the best email address for you?`,
    surveyQuestions: [
      "What is your biggest challenge with [TOPIC]?",
      "Have you tried [COMPETITOR/ALTERNATIVE]?",
      "What is your budget for [SOLUTION]?",
      "When are you looking to make a decision?",
    ],
  },
  customerService: {
    name: "Customer Service Mode",
    type: "custom" as const,
    productService: "Customer Service & Support",
    script: `Hello! Thank you for calling [COMPANY]. This is [NAME], how can I help you today? [WAIT FOR RESPONSE]

I understand you're [ISSUE/QUESTION]. Let me help you with that right away.

[LISTEN ACTIVELY AND TAKE NOTES]

I apologize for any inconvenience this has caused. Here's what I can do for you: [SOLUTION]

Does that resolve your concern? [WAIT FOR RESPONSE]

Great! Is there anything else I can help you with today? [WAIT FOR RESPONSE]

Thank you for choosing [COMPANY]. Have a wonderful day!

[FOLLOW-UP ACTIONS]:
- Log the interaction in CRM
- Send confirmation email if applicable
- Schedule follow-up if needed
- Escalate to supervisor if unresolved`,
    surveyQuestions: [
      "How would you rate your experience today? (1-10)",
      "Was your issue resolved?",
      "Is there anything else we can help you with?",
      "May we follow up with you to ensure satisfaction?",
    ],
  },
}

export function SystemSettings() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "MCA Sales Campaign",
      type: "sales",
      mode: "ai",
      status: "active",
      script: campaignTemplates.mca.script,
      complianceRules: ["TCPA", "FTC"],
      targetList: "Business Owners - High Revenue",
      callsPerHour: 100,
      channels: ["voice", "sms", "email"],
      surveyQuestions: campaignTemplates.mca.surveyQuestions,
      productService: campaignTemplates.mca.productService,
    },
  ])

  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([])
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null)
  const [isCreatingClient, setIsCreatingClient] = useState(false)

  // PAGEMASTER and GENIUS AI configuration
  const [customerServicePrompts, setCustomerServicePrompts] = useState({
    greeting: "Hello! Thank you for calling [COMPANY]. This is [AGENT_NAME], how can I help you today?",
    productInquiry:
      "I'd be happy to help you learn more about [PRODUCT]. Let me pull up that information for you right now...",
    technicalSupport:
      "I understand you're experiencing [ISSUE]. Let me help you resolve that. Can you tell me more about what's happening?",
    billing: "I can help you with your billing question. Let me access your account information...",
    complaint:
      "I sincerely apologize for the inconvenience. Your satisfaction is our priority. Let me see how I can make this right for you.",
    offScript:
      "That's a great question. Let me check on that for you. PAGEMASTER is accessing the latest information from our website...",
    escalation:
      "I want to make sure you get the best possible help. Let me connect you with a specialist who can assist you further.",
    closing: "Is there anything else I can help you with today? Thank you for choosing [COMPANY]!",
    pagemasterAccess: "One moment while I access our knowledge base to get you the most accurate information...",
  })

  const [pagemasterConfig, setPagemasterConfig] = useState({
    autoScrape: true,
    updateFrequency: "daily",
    learnDepth: "comprehensive",
    realTimeAccess: true,
  })

  const complianceRules = {
    FDCPA: {
      name: "Fair Debt Collection Practices Act",
      rules: [
        "No calls before 8 AM or after 9 PM",
        "Must identify as debt collector",
        "Cannot use abusive language",
        "Must cease contact if requested",
        "Cannot contact at work if prohibited",
      ],
    },
    TCPA: {
      name: "Telephone Consumer Protection Act",
      rules: [
        "Obtain prior express consent",
        "Maintain Do Not Call list",
        "Provide opt-out mechanism",
        "No automated calls to cell phones without consent",
        "Honor opt-out requests immediately",
      ],
    },
    FTC: {
      name: "Federal Trade Commission Rules",
      rules: [
        "No deceptive practices",
        "Clear disclosure of terms",
        "Honor consumer requests",
        "Maintain accurate records",
        "No unfair business practices",
      ],
    },
    CFPB: {
      name: "Consumer Financial Protection Bureau",
      rules: [
        "Fair lending practices",
        "Clear communication",
        "Respect consumer rights",
        "Proper documentation",
        "Complaint resolution process",
      ],
    },
  }

  const dialerModes = [
    {
      id: "full_blast",
      name: "Full Blast Sales Mode",
      description: "Maximum call volume, aggressive sales approach",
      callsPerHour: 150,
      icon: "🚀",
    },
    {
      id: "lead_gathering",
      name: "Lead Gathering Mode",
      description: "Survey-based qualification, builds prospect database",
      callsPerHour: 100,
      icon: "📊",
    },
    {
      id: "nurture",
      name: "Nurture Mode",
      description: "Gentle follow-up, relationship building",
      callsPerHour: 50,
      icon: "🌱",
    },
    {
      id: "debt_collection",
      name: "Pre-Collection Mode",
      description: "FDCPA compliant debt resolution",
      callsPerHour: 75,
      icon: "💰",
    },
  ]

  const createNewCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: "New Campaign",
      type: "custom",
      mode: "ai",
      status: "paused",
      script: "",
      complianceRules: ["TCPA", "FTC"],
      targetList: "",
      callsPerHour: 50,
      channels: ["voice"],
    }
    setCampaigns([...campaigns, newCampaign])
    setEditingCampaign(newCampaign)
    setIsCreating(true)
  }

  const createNewClientProfile = () => {
    const newClient: ClientProfile = {
      id: Date.now().toString(),
      companyName: "",
      industry: "",
      websiteUrl: "",
      productDescription: "",
      serviceMode: "customer_service",
      faqs: [],
      knowledgeBase: "",
      trainingStatus: "pending",
      lastTrained: "",
    }
    setClientProfiles([...clientProfiles, newClient])
    setEditingClient(newClient)
    setIsCreatingClient(true)
  }

  const createFromTemplate = (templateKey: keyof typeof campaignTemplates) => {
    const template = campaignTemplates[templateKey]
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: template.name,
      type: template.type,
      mode: "ai",
      status: "paused",
      script: template.script,
      complianceRules: template.type === "debt_collection" ? ["FDCPA", "TCPA", "FTC", "CFPB"] : ["TCPA", "FTC"],
      targetList: "",
      callsPerHour: template.type === "debt_collection" ? 50 : 100,
      channels: ["voice", "sms", "email"],
      surveyQuestions: template.surveyQuestions,
      productService: template.productService,
    }
    setCampaigns([...campaigns, newCampaign])
    setEditingCampaign(newCampaign)
    setIsCreating(true)
    setShowTemplates(false)
  }

  const saveCampaign = () => {
    if (editingCampaign) {
      setCampaigns(campaigns.map((c) => (c.id === editingCampaign.id ? editingCampaign : c)))
      setEditingCampaign(null)
      setIsCreating(false)
    }
  }

  const saveClientProfile = async () => {
    if (editingClient) {
      // Update training status to "training"
      const updatedClient = {
        ...editingClient,
        trainingStatus: "training" as const,
        lastTrained: new Date().toISOString(),
      }
      setClientProfiles(clientProfiles.map((c) => (c.id === updatedClient.id ? updatedClient : c)))

      // Simulate PAGEMASTER learning the website
      console.log("[v0] PAGEMASTER learning website:", editingClient.websiteUrl)
      console.log("[v0] Training AI on product:", editingClient.productDescription)
      console.log("[v0] Service mode:", editingClient.serviceMode)

      // After 2 seconds, mark as ready
      setTimeout(() => {
        setClientProfiles((prev) =>
          prev.map((c) => (c.id === updatedClient.id ? { ...c, trainingStatus: "ready" as const } : c)),
        )
      }, 2000)

      setEditingClient(null)
      setIsCreatingClient(false)
    }
  }

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== id))
  }

  const deleteClientProfile = (id: string) => {
    setClientProfiles(clientProfiles.filter((c) => c.id !== id))
  }

  const addFAQ = () => {
    if (editingClient) {
      setEditingClient({
        ...editingClient,
        faqs: [...editingClient.faqs, { question: "", answer: "" }],
      })
    }
  }

  const removeFAQ = (index: number) => {
    if (editingClient) {
      setEditingClient({
        ...editingClient,
        faqs: editingClient.faqs.filter((_, i) => i !== index),
      })
    }
  }

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(
      campaigns.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)),
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Settings className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">System Settings</h2>
              <p className="text-white/80">Configure dialer, campaigns, AI training, and compliance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowTemplates(!showTemplates)}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Copy className="mr-2 h-4 w-4" />
              Use Template
            </Button>
            <Button
              onClick={createNewCampaign}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>
      </Card>

      {showTemplates && (
        <Card className="bg-white/5 border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Select Campaign Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              onClick={() => createFromTemplate("mca")}
              className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 p-4 cursor-pointer hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">MCA (Merchant Cash Advance)</h4>
                  <p className="text-xs text-white/70">Fast funding based on daily sales</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-400/30 text-xs">Sales Mode</Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("termLoan")}
              className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30 p-4 cursor-pointer hover:border-blue-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">🏦</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Bank Term Loan</h4>
                  <p className="text-xs text-white/70">Traditional business loans with competitive rates</p>
                  <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs">Sales Mode</Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("bankLOC")}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 p-4 cursor-pointer hover:border-purple-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">💳</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Bank Line of Credit</h4>
                  <p className="text-xs text-white/70">Flexible access to working capital</p>
                  <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-400/30 text-xs">
                    Sales Mode
                  </Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("equipmentFinancing")}
              className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-500/30 p-4 cursor-pointer hover:border-orange-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">🚜</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Equipment Financing</h4>
                  <p className="text-xs text-white/70">Finance vehicles, machinery, and equipment</p>
                  <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-400/30 text-xs">
                    Sales Mode
                  </Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("grants")}
              className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-500/30 p-4 cursor-pointer hover:border-yellow-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎁</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Grant Matching</h4>
                  <p className="text-xs text-white/70">Find and apply for business grants</p>
                  <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-400/30 text-xs">
                    Lead Gathering
                  </Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("debtCollection")}
              className="bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-500/30 p-4 cursor-pointer hover:border-red-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">⚖️</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Debt Collection</h4>
                  <p className="text-xs text-white/70">FDCPA-compliant pre-collection service</p>
                  <Badge className="mt-2 bg-red-500/20 text-red-400 border-red-400/30 text-xs">Collection Mode</Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("customSales")}
              className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border-indigo-500/30 p-4 cursor-pointer hover:border-indigo-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Custom Sales</h4>
                  <p className="text-xs text-white/70">Sell any product or service for clients</p>
                  <Badge className="mt-2 bg-indigo-500/20 text-indigo-400 border-indigo-400/30 text-xs">
                    Custom Mode
                  </Badge>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => createFromTemplate("customerService")}
              className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-teal-500/30 p-4 cursor-pointer hover:border-teal-400/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  <Headphones className="h-8 w-8 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Customer Service</h4>
                  <p className="text-xs text-white/70">AI-powered customer support and service</p>
                  <Badge className="mt-2 bg-teal-500/20 text-teal-400 border-teal-400/30 text-xs">Service Mode</Badge>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      )}

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="bg-black/40 border border-white/10 backdrop-blur-sm">
          <TabsTrigger value="campaigns">
            <Phone className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="client-services">
            <Headphones className="h-4 w-4 mr-2" />
            Client Services
          </TabsTrigger>
          <TabsTrigger value="customer-service-prompts">
            <Sparkles className="h-4 w-4 mr-2" />
            Customer Service Prompts
          </TabsTrigger>
          <TabsTrigger value="dialer">
            <Settings className="h-4 w-4 mr-2" />
            Dialer Settings
          </TabsTrigger>
          <TabsTrigger value="ai-training">
            <Bot className="h-4 w-4 mr-2" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Scale className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="debt-collection">
            <DollarSign className="h-4 w-4 mr-2" />
            Debt Collection
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-white/5 border-white/10 p-6">
                {editingCampaign?.id === campaign.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Campaign Name</Label>
                        <Input
                          value={editingCampaign.name}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Campaign Type</Label>
                        <Select
                          value={editingCampaign.type}
                          onValueChange={(value: any) => setEditingCampaign({ ...editingCampaign, type: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-white/10">
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="lead_gathering">Lead Gathering</SelectItem>
                            <SelectItem value="debt_collection">Debt Collection</SelectItem>
                            <SelectItem value="custom">Custom Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Dialer Mode</Label>
                        <Select
                          value={editingCampaign.mode}
                          onValueChange={(value: any) => setEditingCampaign({ ...editingCampaign, mode: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-white/10">
                            <SelectItem value="ai">AI Only</SelectItem>
                            <SelectItem value="human">Human Only</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Calls Per Hour</Label>
                        <Input
                          type="number"
                          value={editingCampaign.callsPerHour}
                          onChange={(e) =>
                            setEditingCampaign({ ...editingCampaign, callsPerHour: Number.parseInt(e.target.value) })
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Target List</Label>
                      <Input
                        value={editingCampaign.targetList}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, targetList: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="e.g., Business Owners, Past Due Accounts"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Product/Service to Sell</Label>
                      <Input
                        value={editingCampaign.productService || ""}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, productService: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="e.g., Business Loans, Grants, Debt Collection Services"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Call Script</Label>
                      <Textarea
                        value={editingCampaign.script}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, script: e.target.value })}
                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        placeholder="Enter your call script here..."
                      />
                    </div>

                    <div>
                      <Label className="text-white">Survey Questions (one per line)</Label>
                      <Textarea
                        value={editingCampaign.surveyQuestions?.join("\n") || ""}
                        onChange={(e) =>
                          setEditingCampaign({
                            ...editingCampaign,
                            surveyQuestions: e.target.value.split("\n").filter((q) => q.trim()),
                          })
                        }
                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        placeholder="Do you need business financing?&#10;What is your monthly revenue?&#10;Are you a veteran?"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Compliance Rules</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(complianceRules).map((rule) => (
                          <label
                            key={rule}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                          >
                            <input
                              type="checkbox"
                              checked={editingCampaign.complianceRules.includes(rule)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    complianceRules: [...editingCampaign.complianceRules, rule],
                                  })
                                } else {
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    complianceRules: editingCampaign.complianceRules.filter((r) => r !== rule),
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-white">{rule}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Communication Channels</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["voice", "sms", "email", "whatsapp", "telegram"].map((channel) => (
                          <label
                            key={channel}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                          >
                            <input
                              type="checkbox"
                              checked={editingCampaign.channels.includes(channel)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    channels: [...editingCampaign.channels, channel],
                                  })
                                } else {
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    channels: editingCampaign.channels.filter((c) => c !== channel),
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-white capitalize">{channel}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={saveCampaign}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Campaign
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingCampaign(null)
                          if (isCreating) {
                            deleteCampaign(campaign.id)
                            setIsCreating(false)
                          }
                        }}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                          <Badge
                            className={`${
                              campaign.status === "active"
                                ? "bg-green-500/20 text-green-400 border-green-400/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                            }`}
                          >
                            {campaign.status}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30 capitalize">
                            {campaign.type.replace("_", " ")}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 capitalize">
                            {campaign.mode} Mode
                          </Badge>
                        </div>
                        <p className="text-sm text-white/80 mb-2">{campaign.script.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span>📞 {campaign.callsPerHour} calls/hour</span>
                          <span>📋 {campaign.targetList}</span>
                          <span>🎯 {campaign.productService}</span>
                        </div>
                        {campaign.surveyQuestions && campaign.surveyQuestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-white/60 mb-1">Survey Questions:</p>
                            <ul className="text-xs text-white/80 space-y-1">
                              {campaign.surveyQuestions.slice(0, 2).map((q, i) => (
                                <li key={i}>• {q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {campaign.complianceRules.map((rule) => (
                        <Badge key={rule} className="bg-orange-500/20 text-orange-400 border-orange-400/30 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {rule}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {campaign.channels.map((channel) => (
                        <Badge key={channel} className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className={`flex-1 ${
                          campaign.status === "active"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        }`}
                      >
                        {campaign.status === "active" ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setEditingCampaign(campaign)}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteCampaign(campaign.id)}
                        variant="outline"
                        className="bg-red-500/20 border-red-400/30 hover:bg-red-500/30 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="client-services" className="space-y-4 mt-6">
          <Card className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border-teal-500/30 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Client Service Profiles</h2>
                  <p className="text-white/80">Configure AI for third-party customer service and sales</p>
                </div>
              </div>
              <Button
                onClick={createNewClientProfile}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {clientProfiles.map((client) => (
              <Card key={client.id} className="bg-white/5 border-white/10 p-6">
                {editingClient?.id === client.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Company Name</Label>
                        <Input
                          value={editingClient.companyName}
                          onChange={(e) => setEditingClient({ ...editingClient, companyName: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="e.g., Acme Corporation"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Industry</Label>
                        <Input
                          value={editingClient.industry}
                          onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="e.g., E-commerce, SaaS, Healthcare"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Website URL (PAGEMASTER will learn this)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={editingClient.websiteUrl}
                          onChange={(e) => setEditingClient({ ...editingClient, websiteUrl: e.target.value })}
                          className="bg-white/5 border-white/10 text-white flex-1"
                          placeholder="https://example.com"
                        />
                        <Button
                          onClick={() => {
                            console.log("[v0] PAGEMASTER scraping website:", editingClient.websiteUrl)
                            alert("PAGEMASTER is learning the website...")
                          }}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Learn Website
                        </Button>
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        PAGEMASTER will scrape and learn all content, products, and services from this website
                      </p>
                    </div>

                    <div>
                      <Label className="text-white">Service Mode</Label>
                      <Select
                        value={editingClient.serviceMode}
                        onValueChange={(value: any) => setEditingClient({ ...editingClient, serviceMode: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10">
                          <SelectItem value="sales">Sales Mode - AI will actively sell products</SelectItem>
                          <SelectItem value="customer_service">Customer Service - AI will provide support</SelectItem>
                          <SelectItem value="both">Both - Sales & Customer Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Product/Service Description</Label>
                      <Textarea
                        value={editingClient.productDescription}
                        onChange={(e) => setEditingClient({ ...editingClient, productDescription: e.target.value })}
                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        placeholder="Describe the products/services in detail. Include features, benefits, pricing, and key selling points..."
                      />
                      <p className="text-xs text-white/60 mt-1">
                        The more detail you provide, the better GENIUS AI can sell or support customers
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white">Frequently Asked Questions</Label>
                        <Button
                          onClick={addFAQ}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add FAQ
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {editingClient.faqs.map((faq, index) => (
                          <Card key={index} className="bg-white/5 border-white/10 p-3">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <Input
                                  value={faq.question}
                                  onChange={(e) => {
                                    const newFaqs = [...editingClient.faqs]
                                    newFaqs[index].question = e.target.value
                                    setEditingClient({ ...editingClient, faqs: newFaqs })
                                  }}
                                  className="bg-white/5 border-white/10 text-white flex-1"
                                  placeholder="Question..."
                                />
                                <Button
                                  onClick={() => removeFAQ(index)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500/20 border-red-400/30 hover:bg-red-500/30 text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <Textarea
                                value={faq.answer}
                                onChange={(e) => {
                                  const newFaqs = [...editingClient.faqs]
                                  newFaqs[index].answer = e.target.value
                                  setEditingClient({ ...editingClient, faqs: newFaqs })
                                }}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Answer..."
                                rows={2}
                              />
                            </div>
                          </Card>
                        ))}
                        {editingClient.faqs.length === 0 && (
                          <p className="text-sm text-white/60 text-center py-4">
                            No FAQs added yet. Click "Add FAQ" to get started.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Additional Knowledge Base</Label>
                      <Textarea
                        value={editingClient.knowledgeBase}
                        onChange={(e) => setEditingClient({ ...editingClient, knowledgeBase: e.target.value })}
                        className="bg-white/5 border-white/10 text-white min-h-[150px]"
                        placeholder="Add any additional information, policies, procedures, or knowledge that GENIUS AI should know about this client..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={saveClientProfile}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save & Train AI
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingClient(null)
                          if (isCreatingClient) {
                            deleteClientProfile(client.id)
                            setIsCreatingClient(false)
                          }
                        }}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="h-5 w-5 text-teal-400" />
                          <h3 className="text-xl font-bold text-white">{client.companyName || "Unnamed Client"}</h3>
                          <Badge
                            className={`${
                              client.trainingStatus === "ready"
                                ? "bg-green-500/20 text-green-400 border-green-400/30"
                                : client.trainingStatus === "training"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                                  : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                            }`}
                          >
                            {client.trainingStatus === "ready" && <Sparkles className="h-3 w-3 mr-1" />}
                            {client.trainingStatus}
                          </Badge>
                          <Badge className="bg-teal-500/20 text-teal-400 border-teal-400/30 capitalize">
                            {client.serviceMode.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Globe className="h-4 w-4 text-teal-400" />
                            <a
                              href={client.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {client.websiteUrl || "No website"}
                            </a>
                          </div>
                          <p className="text-sm text-white/70">{client.industry}</p>
                          <p className="text-sm text-white/70">{client.productDescription.substring(0, 150)}...</p>
                          {client.faqs.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <BookOpen className="h-3 w-3" />
                              <span>{client.faqs.length} FAQs configured</span>
                            </div>
                          )}
                          {client.lastTrained && (
                            <p className="text-xs text-white/60">
                              Last trained: {new Date(client.lastTrained).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {client.trainingStatus === "ready" && (
                        <Button
                          onClick={() => {
                            console.log("[v0] Deploying AI for client:", client.companyName)
                            alert(`GENIUS AI is now ready to handle ${client.serviceMode} for ${client.companyName}!`)
                          }}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Deploy AI
                        </Button>
                      )}
                      <Button
                        onClick={() => setEditingClient(client)}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteClientProfile(client.id)}
                        variant="outline"
                        className="bg-red-500/20 border-red-400/30 hover:bg-red-500/30 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {clientProfiles.length === 0 && !isCreatingClient && (
              <Card className="bg-white/5 border-white/10 p-12 text-center">
                <Headphones className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Client Profiles Yet</h3>
                <p className="text-sm text-white/60 mb-4">
                  Add client profiles to offer AI-powered sales and customer service for third-party companies
                </p>
                <Button
                  onClick={createNewClientProfile}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Client
                </Button>
              </Card>
            )}
          </div>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">How It Works</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">1.</span>
                    <span>
                      <strong>Add Client Info:</strong> Enter company name, website, and product details
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">2.</span>
                    <span>
                      <strong>PAGEMASTER Learns:</strong> AI scrapes and learns everything from the client's website
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">3.</span>
                    <span>
                      <strong>Configure FAQs:</strong> Add common questions and answers for better customer service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">4.</span>
                    <span>
                      <strong>Choose Mode:</strong> Sales (actively sell), Customer Service (support), or Both
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">5.</span>
                    <span>
                      <strong>Deploy:</strong> GENIUS AI handles calls with almost live person experience
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Customer Service Prompts Tab */}
        <TabsContent value="customer-service-prompts" className="space-y-4 mt-6">
          <Card className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border-teal-500/30 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Customer Service AI Prompts</h2>
                  <p className="text-white/80">
                    Program GENIUS AI with PAGEMASTER assistance for 110% customer service
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">GENIUS + PAGEMASTER = 110% Customer Service</h3>
                <p className="text-sm text-white/80 mb-3">
                  GENIUS AI handles customer conversations while PAGEMASTER provides real-time access to any information
                  from the client's website. Together, they can answer ANY question about ANY product or service.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">GENIUS AI</h4>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• Natural conversation flow</li>
                      <li>• Empathy & professionalism</li>
                      <li>• Problem resolution</li>
                      <li>• Escalation handling</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">PAGEMASTER</h4>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• Learns entire website</li>
                      <li>• Real-time information access</li>
                      <li>• Product knowledge</li>
                      <li>• Policy & procedure lookup</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">PAGEMASTER Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Auto-Scrape Client Websites</p>
                  <p className="text-xs text-white/60">
                    Automatically learn and update information from client websites
                  </p>
                </div>
                <Switch
                  checked={pagemasterConfig.autoScrape}
                  onCheckedChange={(checked) => setPagemasterConfig({ ...pagemasterConfig, autoScrape: checked })}
                />
              </div>

              <div>
                <Label className="text-white">Update Frequency</Label>
                <Select
                  value={pagemasterConfig.updateFrequency}
                  onValueChange={(value) => setPagemasterConfig({ ...pagemasterConfig, updateFrequency: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="hourly">Hourly - Real-time updates</SelectItem>
                    <SelectItem value="daily">Daily - Once per day</SelectItem>
                    <SelectItem value="weekly">Weekly - Once per week</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60 mt-1">How often PAGEMASTER re-scans client websites for updates</p>
              </div>

              <div>
                <Label className="text-white">Learning Depth</Label>
                <Select
                  value={pagemasterConfig.learnDepth}
                  onValueChange={(value) => setPagemasterConfig({ ...pagemasterConfig, learnDepth: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="basic">Basic - Main pages only</SelectItem>
                    <SelectItem value="standard">Standard - All public pages</SelectItem>
                    <SelectItem value="comprehensive">
                      Comprehensive - Everything including docs, FAQs, blogs
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60 mt-1">How deeply PAGEMASTER learns the client's website</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Real-Time Access During Calls</p>
                  <p className="text-xs text-white/60">GENIUS can query PAGEMASTER during live customer calls</p>
                </div>
                <Switch
                  checked={pagemasterConfig.realTimeAccess}
                  onCheckedChange={(checked) => setPagemasterConfig({ ...pagemasterConfig, realTimeAccess: checked })}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">AI Conversation Prompts</h3>
            <p className="text-sm text-white/70 mb-4">
              Program exactly what GENIUS AI says in different customer service scenarios. GENIUS can go off-script when
              needed and will access PAGEMASTER for real-time information.
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Greeting</Label>
                <Textarea
                  value={customerServicePrompts.greeting}
                  onChange={(e) => setCustomerServicePrompts({ ...customerServicePrompts, greeting: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">First thing GENIUS says when answering a call</p>
              </div>

              <div>
                <Label className="text-white">Product Inquiry</Label>
                <Textarea
                  value={customerServicePrompts.productInquiry}
                  onChange={(e) =>
                    setCustomerServicePrompts({ ...customerServicePrompts, productInquiry: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">When customer asks about products or services</p>
              </div>

              <div>
                <Label className="text-white">Technical Support</Label>
                <Textarea
                  value={customerServicePrompts.technicalSupport}
                  onChange={(e) =>
                    setCustomerServicePrompts({ ...customerServicePrompts, technicalSupport: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">When customer needs technical help</p>
              </div>

              <div>
                <Label className="text-white">Billing Questions</Label>
                <Textarea
                  value={customerServicePrompts.billing}
                  onChange={(e) => setCustomerServicePrompts({ ...customerServicePrompts, billing: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">When customer has billing or payment questions</p>
              </div>

              <div>
                <Label className="text-white">Complaint Handling</Label>
                <Textarea
                  value={customerServicePrompts.complaint}
                  onChange={(e) => setCustomerServicePrompts({ ...customerServicePrompts, complaint: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">When customer is upset or has a complaint</p>
              </div>

              <div>
                <Label className="text-white">Off-Script / Unknown Question</Label>
                <Textarea
                  value={customerServicePrompts.offScript}
                  onChange={(e) => setCustomerServicePrompts({ ...customerServicePrompts, offScript: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">
                  When GENIUS needs to access PAGEMASTER for information not in training
                </p>
              </div>

              <div>
                <Label className="text-white">PAGEMASTER Access Prompt</Label>
                <Textarea
                  value={customerServicePrompts.pagemasterAccess}
                  onChange={(e) =>
                    setCustomerServicePrompts({ ...customerServicePrompts, pagemasterAccess: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">
                  What GENIUS says while accessing PAGEMASTER for real-time information
                </p>
              </div>

              <div>
                <Label className="text-white">Escalation to Human Agent</Label>
                <Textarea
                  value={customerServicePrompts.escalation}
                  onChange={(e) => setCustomerServicePrompts({ ...customerServicePrompts, escalation: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">When GENIUS needs to transfer to a human agent</p>
              </div>

              <div>
                <Label className="text-white">Closing</Label>
                <Textarea
                  value={customerServicePrompts.closing}
                  onChange={(e) => setCustomerServicePrompts({ ...customerServicePrompts, closing: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
                <p className="text-xs text-white/60 mt-1">How GENIUS ends the call</p>
              </div>

              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Save className="mr-2 h-4 w-4" />
                Save Customer Service Prompts
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">How GENIUS + PAGEMASTER Work Together</h3>
                <div className="space-y-3 text-sm text-white/80">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">1.</span>
                    <span>
                      <strong>Customer calls:</strong> GENIUS answers with your custom greeting
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">2.</span>
                    <span>
                      <strong>Customer asks question:</strong> GENIUS uses trained knowledge to respond
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">3.</span>
                    <span>
                      <strong>Question goes off-script:</strong> GENIUS accesses PAGEMASTER in real-time
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">4.</span>
                    <span>
                      <strong>PAGEMASTER searches:</strong> Finds answer from client's website, docs, or knowledge base
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">5.</span>
                    <span>
                      <strong>GENIUS responds:</strong> Provides accurate answer with natural conversation flow
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">6.</span>
                    <span>
                      <strong>Issue resolved:</strong> Customer satisfied, call ends professionally
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-white/80">
                    <strong>Result:</strong> Between GENIUS AI's conversation skills and PAGEMASTER's comprehensive
                    knowledge of the client's business, there should be NO customer service issue that cannot be handled
                    from A-Z, start to finish.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Available Variables</h3>
            <p className="text-sm text-white/70 mb-3">Use these variables in your prompts for dynamic content:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { var: "[COMPANY]", desc: "Client company name" },
                { var: "[AGENT_NAME]", desc: "AI agent name" },
                { var: "[CUSTOMER_NAME]", desc: "Customer's name" },
                { var: "[PRODUCT]", desc: "Product being discussed" },
                { var: "[ISSUE]", desc: "Customer's issue/question" },
                { var: "[ACCOUNT]", desc: "Customer account number" },
              ].map((item) => (
                <div key={item.var} className="bg-white/5 rounded p-2">
                  <code className="text-xs text-cyan-400">{item.var}</code>
                  <p className="text-xs text-white/60 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Dialer Settings Tab */}
        <TabsContent value="dialer" className="space-y-4 mt-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Dialer Mode Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dialerModes.map((mode) => (
                <Card key={mode.id} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{mode.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{mode.name}</h4>
                      <p className="text-sm text-white/70 mb-2">{mode.description}</p>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 text-xs">
                        {mode.callsPerHour} calls/hour
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Advanced Dialer Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Auto-Retry Failed Calls</p>
                  <p className="text-xs text-white/60">Automatically retry calls that don't connect</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Voicemail Detection</p>
                  <p className="text-xs text-white/60">Skip to next call when voicemail detected</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Call Recording</p>
                  <p className="text-xs text-white/60">Record all calls for quality assurance</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Multi-Channel Follow-up</p>
                  <p className="text-xs text-white/60">Send SMS/Email after missed calls</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* AI Training Tab */}
        <TabsContent value="ai-training" className="space-y-4 mt-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">GENIUS AI Compliance Training</h3>
            <p className="text-sm text-white/80 mb-4">
              GENIUS AI is trained on all major compliance regulations to ensure legal and ethical operations.
            </p>
            <div className="space-y-4">
              {Object.entries(complianceRules).map(([key, rule]) => (
                <Card key={key} className="bg-white/5 border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">{rule.name}</h4>
                      <ul className="space-y-1">
                        {rule.rules.map((r, i) => (
                          <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Trained</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Custom AI Training</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Additional Training Data</Label>
                <Textarea
                  className="bg-white/5 border-white/10 text-white min-h-[150px]"
                  placeholder="Add custom scripts, objection handling, or specific product knowledge..."
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <Bot className="mr-2 h-4 w-4" />
                Train AI
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4 mt-6">
          <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Compliance Monitoring Active</h3>
                <p className="text-sm text-white/80">
                  All campaigns are monitored for compliance with FDCPA, TCPA, FTC, and CFPB regulations. The system
                  automatically enforces calling hours, opt-out requests, and required disclosures.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 p-6">
              <h4 className="font-semibold text-white mb-4">Do Not Call List</h4>
              <div className="space-y-3">
                <Input placeholder="Add phone number..." className="bg-white/5 border-white/10 text-white" />
                <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                  Add to DNC List
                </Button>
                <p className="text-xs text-white/60">Current DNC entries: 1,247</p>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h4 className="font-semibold text-white mb-4">Calling Hours</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-white text-xs">Start Time</Label>
                    <Input type="time" defaultValue="08:00" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-white text-xs">End Time</Label>
                    <Input type="time" defaultValue="21:00" className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white/60">FDCPA compliant: 8 AM - 9 PM local time</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Debt Collection Tab */}
        <TabsContent value="debt-collection" className="space-y-4 mt-6">
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Pre-Collection Service</h3>
                <p className="text-sm text-white/80 mb-4">
                  Fully automated FDCPA-compliant debt collection service. GENIUS AI prompts customers to resolution
                  with empathy and professionalism.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-400">73%</p>
                    <p className="text-xs text-white/60">Resolution Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">$247K</p>
                    <p className="text-xs text-white/60">Collected This Month</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">100%</p>
                    <p className="text-xs text-white/60">FDCPA Compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Collection Script Templates</h3>
            <div className="space-y-3">
              <Card className="bg-white/5 border-white/10 p-4">
                <h4 className="font-semibold text-white mb-2">Initial Contact</h4>
                <p className="text-sm text-white/70">
                  "This is a courtesy call regarding your account. We'd like to help you resolve this matter. Can we
                  discuss payment options that work for you?"
                </p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-4">
                <h4 className="font-semibold text-white mb-2">Payment Arrangement</h4>
                <p className="text-sm text-white/70">
                  "We understand financial difficulties happen. Let's work together to create a payment plan that fits
                  your budget."
                </p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-4">
                <h4 className="font-semibold text-white mb-2">Final Notice</h4>
                <p className="text-sm text-white/70">
                  "This is a final courtesy call before this matter is escalated. We strongly encourage you to contact
                  us to resolve this today."
                </p>
              </Card>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Resolution Options</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                Payment Plan
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Settlement Offer
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                Hardship Program
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                Full Payment
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
