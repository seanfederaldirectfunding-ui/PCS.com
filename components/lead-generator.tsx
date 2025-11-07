"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Mail,
  Target,
  TrendingUp,
  Zap,
  Users,
  Building2,
  Globe,
  BarChart3,
  Filter,
  Download,
  Play,
  Eye,
  MousePointerClick,
  Sparkles,
  Scan,
  FileSpreadsheet,
  Loader2,
} from "lucide-react"

export function LeadGenerator() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [scrapeType, setScrapeType] = useState<"general" | "ucc">("general")
  const [scrapeQuery, setScrapeQuery] = useState("")
  const [uccTimeframe, setUccTimeframe] = useState("30")
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv")
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeResults, setScrapeResults] = useState<any[]>([])

  const handleScrape = async () => {
    setIsScraping(true)
    setScrapeResults([])

    try {
      const response = await fetch("/api/lead-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: scrapeType,
          query: scrapeQuery,
          timeframe: scrapeType === "ucc" ? uccTimeframe : undefined,
          format: exportFormat,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setScrapeResults(data.results)

        // Auto-download the file
        if (data.downloadUrl) {
          const link = document.createElement("a")
          link.href = data.downloadUrl
          link.download = `leads_${Date.now()}.${exportFormat}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    } catch (error) {
      console.error("[v0] Scraping error:", error)
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Lead Generator</h2>
          <p className="text-white/60 mt-1">
            All-in-one lead generation combining HubSpot, Apollo.io, ZoomInfo, Semrush & OptinMonster
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowScrapeModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            <Scan className="mr-2 h-4 w-4" />
            SCRAPE/REFINE
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Lead Finder
          </Button>
        </div>
      </div>

      <Dialog open={showScrapeModal} onOpenChange={setShowScrapeModal}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Scan className="h-6 w-6 text-purple-400" />
              AI Web Scraper & Refiner
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Scrape Type Selection */}
            <div className="space-y-2">
              <Label>Scrape Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={scrapeType === "general" ? "default" : "outline"}
                  className={
                    scrapeType === "general"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "border-white/10 text-white hover:bg-white/5 bg-transparent"
                  }
                  onClick={() => setScrapeType("general")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  General Web Scrape
                </Button>
                <Button
                  variant={scrapeType === "ucc" ? "default" : "outline"}
                  className={
                    scrapeType === "ucc"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "border-white/10 text-white hover:bg-white/5 bg-transparent"
                  }
                  onClick={() => setScrapeType("ucc")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  UCC Records Scrape
                </Button>
              </div>
            </div>

            {/* Scrape Query */}
            <div className="space-y-2">
              <Label>{scrapeType === "general" ? "What do you want to scrape?" : "UCC Search Query"}</Label>
              <Textarea
                placeholder={
                  scrapeType === "general"
                    ? "Example: construction companies across America"
                    : "Example: recent UCC filings in California"
                }
                value={scrapeQuery}
                onChange={(e) => setScrapeQuery(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
              />
              <p className="text-xs text-white/60">
                {scrapeType === "general"
                  ? "The AI will scrape and extract: company name, annual revenue, owner's name, email, phone, and social media (Facebook, IG, Telegram, Signal, Snapchat)"
                  : "The AI will scrape UCC records, then search for company details online and provide comprehensive data"}
              </p>
            </div>

            {/* UCC Timeframe (only for UCC scrape) */}
            {scrapeType === "ucc" && (
              <div className="space-y-2">
                <Label>Timeframe (days)</Label>
                <Select value={uccTimeframe} onValueChange={setUccTimeframe}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  className={
                    exportFormat === "csv"
                      ? "bg-green-500 hover:bg-green-600"
                      : "border-white/10 text-white hover:bg-white/5 bg-transparent"
                  }
                  onClick={() => setExportFormat("csv")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  className={
                    exportFormat === "excel"
                      ? "bg-green-500 hover:bg-green-600"
                      : "border-white/10 text-white hover:bg-white/5 bg-transparent"
                  }
                  onClick={() => setExportFormat("excel")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Results Preview */}
            {scrapeResults.length > 0 && (
              <div className="space-y-2">
                <Label>Results Preview ({scrapeResults.length} leads found)</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {scrapeResults.slice(0, 5).map((result, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 p-3">
                      <div className="text-sm">
                        <p className="font-semibold text-white">{result.companyName}</p>
                        <p className="text-white/60 text-xs">
                          {result.email} • {result.phone}
                        </p>
                      </div>
                    </Card>
                  ))}
                  {scrapeResults.length > 5 && (
                    <p className="text-xs text-white/60 text-center">+{scrapeResults.length - 5} more results</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleScrape}
                disabled={!scrapeQuery || isScraping}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping & Refining...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Start Scraping
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScrapeModal(false)}
                className="border-white/10 text-white hover:bg-white/5 bg-transparent"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="database" className="data-[state=active]:bg-cyan-500/20">
            <Users className="mr-2 h-4 w-4" />
            Lead Database
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-cyan-500/20">
            <Mail className="mr-2 h-4 w-4" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="landing" className="data-[state=active]:bg-cyan-500/20">
            <MousePointerClick className="mr-2 h-4 w-4" />
            Landing Pages
          </TabsTrigger>
          <TabsTrigger value="ads" className="data-[state=active]:bg-cyan-500/20">
            <Target className="mr-2 h-4 w-4" />
            Paid Ads
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-cyan-500/20">
            <TrendingUp className="mr-2 h-4 w-4" />
            SEO & Competitors
          </TabsTrigger>
          <TabsTrigger value="intent" className="data-[state=active]:bg-cyan-500/20">
            <Eye className="mr-2 h-4 w-4" />
            Buyer Intent
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-cyan-500/20">
            <Zap className="mr-2 h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* Lead Database Tab (Apollo.io + ZoomInfo) */}
        <TabsContent value="database" className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Search by company, title, industry, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-4 gap-3">
                <Input placeholder="Job Title" className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Company Size" className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Industry" className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Revenue Range" className="bg-white/5 border-white/10 text-white" />
              </div>

              {/* Lead Results */}
              <div className="space-y-3">
                {[
                  {
                    name: "Sarah Johnson",
                    title: "VP of Marketing",
                    company: "TechCorp Inc",
                    email: "sarah.j@techcorp.com",
                    phone: "+1 (555) 123-4567",
                    score: 95,
                    intent: "High",
                  },
                  {
                    name: "Michael Chen",
                    title: "Director of Sales",
                    company: "Growth Solutions",
                    email: "m.chen@growthsol.com",
                    phone: "+1 (555) 234-5678",
                    score: 88,
                    intent: "Medium",
                  },
                  {
                    name: "Emily Rodriguez",
                    title: "CEO",
                    company: "StartupXYZ",
                    email: "emily@startupxyz.com",
                    phone: "+1 (555) 345-6789",
                    score: 92,
                    intent: "High",
                  },
                ].map((lead, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{lead.name}</h4>
                          <p className="text-sm text-white/60">{lead.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="h-3 w-3 text-cyan-400" />
                            <span className="text-xs text-white/60">{lead.company}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-white/80">{lead.email}</p>
                          <p className="text-sm text-white/60">{lead.phone}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400">{lead.score}</div>
                          <p className="text-xs text-white/60">Lead Score</p>
                        </div>
                        <Badge
                          className={
                            lead.intent === "High"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {lead.intent} Intent
                        </Badge>
                        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                          Add to Campaign
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <p className="text-white/60">Showing 3 of 1,247 leads</p>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export All
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email Campaigns Tab (HubSpot + Apollo.io) */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <Mail className="h-8 w-8 text-cyan-400" />
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome Series</h3>
              <p className="text-white/60 text-sm mb-4">5-email nurture sequence</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Sent:</span>
                  <span className="text-white font-semibold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Open Rate:</span>
                  <span className="text-green-400 font-semibold">42.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Click Rate:</span>
                  <span className="text-cyan-400 font-semibold">18.3%</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600">View Campaign</Button>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-purple-400" />
                <Badge className="bg-blue-500/20 text-blue-400">Scheduled</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Product Launch</h3>
              <p className="text-white/60 text-sm mb-4">3-email announcement</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Recipients:</span>
                  <span className="text-white font-semibold">5,678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Start Date:</span>
                  <span className="text-white font-semibold">Dec 15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status:</span>
                  <span className="text-blue-400 font-semibold">Ready</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600">
                <Play className="mr-2 h-4 w-4" />
                Launch Now
              </Button>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6 border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Create New Campaign</h3>
                <p className="text-white/60 text-sm">AI-powered email sequences</p>
              </div>
            </Card>
          </div>

          {/* Email Sequence Builder */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Email Sequence Builder</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                    {step}
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={`Email ${step} Subject Line`}
                      className="bg-white/5 border-white/10 text-white mb-2"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Wait time (days)"
                        className="bg-white/5 border-white/10 text-white w-32"
                        defaultValue={step === 1 ? "0" : step === 2 ? "3" : "7"}
                      />
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">
                        Edit Content
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </Card>
        </TabsContent>

        {/* Landing Pages Tab (HubSpot + OptinMonster) */}
        <TabsContent value="landing" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Product Demo", visitors: 2345, conversions: 18.5, exitIntent: true },
              { name: "Free Trial Signup", visitors: 5678, conversions: 24.3, exitIntent: true },
              { name: "Webinar Registration", visitors: 1234, conversions: 32.1, exitIntent: false },
              { name: "eBook Download", visitors: 3456, conversions: 41.2, exitIntent: true },
            ].map((page, i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{page.name}</h3>
                  {page.exitIntent && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Exit-Intent®</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{page.visitors.toLocaleString()}</p>
                    <p className="text-xs text-white/60">Visitors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{page.conversions}%</p>
                    <p className="text-xs text-white/60">Conversion</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">
                      {Math.round(page.visitors * (page.conversions / 100))}
                    </p>
                    <p className="text-xs text-white/60">Leads</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">Edit Page</Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* A/B Testing */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">A/B Testing Dashboard</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Variant A (Control)</span>
                  <Badge className="bg-blue-500/20 text-blue-400">50% Traffic</Badge>
                </div>
                <div className="h-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                  <p className="text-white/60">Original Headline</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Conversion:</span>
                  <span className="text-white font-semibold">18.5%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Variant B (Test)</span>
                  <Badge className="bg-green-500/20 text-green-400">50% Traffic</Badge>
                </div>
                <div className="h-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                  <p className="text-white/60">New Headline</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Conversion:</span>
                  <span className="text-green-400 font-semibold">24.3% ↑</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4 bg-green-500 hover:bg-green-600">Declare Winner: Variant B</Button>
          </Card>
        </TabsContent>

        {/* Paid Ads Tab (Google/Meta Ads) */}
        <TabsContent value="ads" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { platform: "Google Ads", spend: "$2,450", leads: 145, cpl: "$16.90" },
              { platform: "Facebook Ads", spend: "$1,890", leads: 203, cpl: "$9.31" },
              { platform: "LinkedIn Ads", spend: "$3,200", leads: 89, cpl: "$35.96" },
              { platform: "Instagram Ads", spend: "$1,120", leads: 167, cpl: "$6.71" },
            ].map((ad, i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">{ad.platform}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-white">{ad.spend}</p>
                    <p className="text-xs text-white/60">Total Spend</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{ad.leads}</p>
                    <p className="text-xs text-white/60">Leads Generated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{ad.cpl}</p>
                    <p className="text-xs text-white/60">Cost Per Lead</p>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600">Manage Campaign</Button>
              </Card>
            ))}
          </div>

          {/* Lead Form Builder */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">In-Platform Lead Forms</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Form Fields</h4>
                {["Full Name", "Email Address", "Phone Number", "Company Name", "Job Title"].map((field, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span className="text-white">{field}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Targeting Options</h4>
                <Input placeholder="Age Range" className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Location" className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Interests" className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Job Title" className="bg-white/5 border-white/10 text-white" />
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Target className="mr-2 h-4 w-4" />
                  Launch Ad Campaign
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* SEO & Competitors Tab (Semrush) */}
        <TabsContent value="seo" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 p-6">
              <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
              <p className="text-3xl font-bold text-white mb-2">12,345</p>
              <p className="text-white/60">Organic Keywords</p>
              <p className="text-green-400 text-sm mt-2">↑ 23% this month</p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <Globe className="h-8 w-8 text-cyan-400 mb-4" />
              <p className="text-3xl font-bold text-white mb-2">45,678</p>
              <p className="text-white/60">Monthly Traffic</p>
              <p className="text-cyan-400 text-sm mt-2">↑ 18% this month</p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <BarChart3 className="h-8 w-8 text-purple-400 mb-4" />
              <p className="text-3xl font-bold text-white mb-2">67</p>
              <p className="text-white/60">Domain Authority</p>
              <p className="text-purple-400 text-sm mt-2">↑ 3 points</p>
            </Card>
          </div>

          {/* Competitor Analysis */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Competitor Analysis</h3>
            <div className="space-y-3">
              {[
                { name: "Competitor A", keywords: 8234, traffic: 34567, da: 72 },
                { name: "Competitor B", keywords: 6789, traffic: 28901, da: 65 },
                { name: "Competitor C", keywords: 5432, traffic: 23456, da: 58 },
              ].map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
                      {comp.name.charAt(11)}
                    </div>
                    <span className="font-semibold text-white">{comp.name}</span>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{comp.keywords.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Keywords</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-cyan-400">{comp.traffic.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Traffic</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">{comp.da}</p>
                      <p className="text-xs text-white/60">DA</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                  >
                    Analyze
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Keyword Research */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Keyword Research</h3>
            <div className="flex gap-3 mb-4">
              <Input placeholder="Enter keyword or topic..." className="flex-1 bg-white/5 border-white/10 text-white" />
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
                <Search className="mr-2 h-4 w-4" />
                Research
              </Button>
            </div>
            <div className="space-y-2">
              {[
                { keyword: "crm software", volume: 12000, difficulty: 68, cpc: "$45.20" },
                { keyword: "lead generation tools", volume: 8500, difficulty: 54, cpc: "$32.10" },
                { keyword: "sales automation", volume: 6700, difficulty: 61, cpc: "$38.50" },
              ].map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <span className="text-white font-medium">{kw.keyword}</span>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{kw.volume.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Volume</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-yellow-400">{kw.difficulty}</p>
                      <p className="text-xs text-white/60">Difficulty</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-400">{kw.cpc}</p>
                      <p className="text-xs text-white/60">CPC</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Buyer Intent Tab (ZoomInfo) */}
        <TabsContent value="intent" className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">High-Intent Signals</h3>
            <div className="space-y-3">
              {[
                {
                  company: "TechCorp Inc",
                  signal: "Visited pricing page 5 times",
                  score: 95,
                  activity: "Last 24 hours",
                },
                {
                  company: "Growth Solutions",
                  signal: "Downloaded 3 whitepapers",
                  score: 88,
                  activity: "Last 48 hours",
                },
                {
                  company: "StartupXYZ",
                  signal: "Attended webinar + demo request",
                  score: 92,
                  activity: "Last 12 hours",
                },
                {
                  company: "Enterprise Co",
                  signal: "Multiple team members researching",
                  score: 87,
                  activity: "Last week",
                },
              ].map((intent, i) => (
                <Card key={i} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{intent.company}</h4>
                        <p className="text-sm text-white/60">{intent.signal}</p>
                        <p className="text-xs text-cyan-400 mt-1">{intent.activity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{intent.score}</div>
                        <p className="text-xs text-white/60">Intent Score</p>
                      </div>
                      <Button className="bg-green-500 hover:bg-green-600">
                        <Zap className="mr-2 h-4 w-4" />
                        Contact Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Company Intelligence */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Technographic Data</h3>
              <div className="space-y-3">
                {["Salesforce CRM", "HubSpot Marketing", "Slack", "Zoom", "AWS"].map((tech, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-white text-sm">{tech}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400">Active</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Firmographic Data</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Industry:</span>
                  <span className="text-white font-semibold">Technology</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Employees:</span>
                  <span className="text-white font-semibold">500-1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Revenue:</span>
                  <span className="text-white font-semibold">$50M-$100M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Location:</span>
                  <span className="text-white font-semibold">San Francisco, CA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Founded:</span>
                  <span className="text-white font-semibold">2015</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab (HubSpot Workflows) */}
        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Lead Scoring Automation", triggers: 12, actions: 8, status: "Active" },
              { name: "Email Nurture Workflow", triggers: 5, actions: 15, status: "Active" },
              { name: "Sales Notification System", triggers: 8, actions: 6, status: "Active" },
              { name: "Re-engagement Campaign", triggers: 3, actions: 10, status: "Paused" },
            ].map((workflow, i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8 text-yellow-400" />
                  <Badge
                    className={
                      workflow.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }
                  >
                    {workflow.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{workflow.name}</h3>
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{workflow.triggers}</p>
                    <p className="text-xs text-white/60">Triggers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{workflow.actions}</p>
                    <p className="text-xs text-white/60">Actions</p>
                  </div>
                </div>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">Edit Workflow</Button>
              </Card>
            ))}
          </div>

          {/* Workflow Builder */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Workflow Builder</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="font-semibold text-white">Trigger: Form Submission</span>
                </div>
                <p className="text-sm text-white/60 ml-11">When a lead fills out the contact form</p>
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-0.5 bg-white/20"></div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="font-semibold text-white">Action: Send Welcome Email</span>
                </div>
                <p className="text-sm text-white/60 ml-11">Immediately send personalized welcome email</p>
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-0.5 bg-white/20"></div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="font-semibold text-white">Action: Assign to Sales Rep</span>
                </div>
                <p className="text-sm text-white/60 ml-11">Route lead to appropriate sales team member</p>
              </div>

              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                <Sparkles className="mr-2 h-4 w-4" />
                Add More Actions
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
