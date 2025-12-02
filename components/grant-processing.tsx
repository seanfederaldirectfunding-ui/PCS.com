"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Search, Database, Users, RefreshCw, CheckCircle2, Globe } from "lucide-react"

export function GrantProcessing() {
  const [isScraperRunning, setIsScraperRunning] = useState(false)
  const [lastScraped, setLastScraped] = useState("2 hours ago")
  const [clientInfo, setClientInfo] = useState({
    businessType: "",
    industry: "",
    isVeteran: false,
    isMinority: false,
    isFemaleOwned: false,
  })

  const grantSources = [
    { name: "Grants.gov", status: "active", grants: 1247, type: "Federal" },
    { name: "State Grant Portals", status: "active", grants: 892, type: "State" },
    { name: "Local Government", status: "active", grants: 456, type: "Local" },
    { name: "Veterans Affairs", status: "active", grants: 234, type: "Veterans" },
    { name: "Minority Business Dev", status: "active", grants: 178, type: "Minority" },
    { name: "Women's Business Centers", status: "active", grants: 156, type: "Female" },
    { name: "Private Foundations", status: "active", grants: 2341, type: "Foundation" },
    { name: "Corporate Giving", status: "active", grants: 567, type: "Corporate" },
    { name: "Philanthropist Database", status: "active", grants: 423, type: "Individual" },
    { name: "Community Foundations", status: "active", grants: 789, type: "Community" },
  ]

  const availableGrants = [
    {
      name: "Small Business Innovation Grant",
      amount: "$50,000",
      deadline: "Jan 15, 2025",
      match: 95,
      type: "Federal",
      source: "Grants.gov",
    },
    {
      name: "Women Entrepreneurs Fund",
      amount: "$100,000",
      deadline: "Feb 1, 2025",
      match: 92,
      type: "Female",
      source: "Women's Business Centers",
    },
    {
      name: "Veteran Business Startup",
      amount: "$75,000",
      deadline: "Jan 30, 2025",
      match: 89,
      type: "Veterans",
      source: "Veterans Affairs",
    },
    {
      name: "Minority Tech Innovation",
      amount: "$125,000",
      deadline: "Feb 15, 2025",
      match: 87,
      type: "Minority",
      source: "Minority Business Dev",
    },
    {
      name: "State Economic Development",
      amount: "$60,000",
      deadline: "Jan 20, 2025",
      match: 85,
      type: "State",
      source: "State Grant Portals",
    },
    {
      name: "Local Community Growth",
      amount: "$35,000",
      deadline: "Feb 5, 2025",
      match: 82,
      type: "Local",
      source: "Local Government",
    },
    {
      name: "Foundation Innovation Award",
      amount: "$200,000",
      deadline: "Mar 1, 2025",
      match: 78,
      type: "Foundation",
      source: "Private Foundations",
    },
    {
      name: "Philanthropist Matching Fund",
      amount: "$150,000",
      deadline: "Feb 20, 2025",
      match: 75,
      type: "Individual",
      source: "Philanthropist Database",
    },
  ]

  const startScraper = () => {
    setIsScraperRunning(true)
    setTimeout(() => {
      setIsScraperRunning(false)
      setLastScraped("Just now")
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Grant Processing</h2>
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
          <Database className="h-3 w-3 mr-1" />
          {availableGrants.length} Grants Available
        </Badge>
      </div>

      <Tabs defaultValue="grants" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="grants">Available Grants</TabsTrigger>
          <TabsTrigger value="matching">AI Matching</TabsTrigger>
          <TabsTrigger value="scraper">Web Scraper</TabsTrigger>
        </TabsList>

        <TabsContent value="grants" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableGrants.map((grant, index) => (
              <Card key={index} className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-cyan-400" />
                    <Badge variant="outline" className="text-xs">
                      {grant.type}
                    </Badge>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">{grant.match}% Match</Badge>
                </div>
                <h3 className="font-semibold text-white mb-2">{grant.name}</h3>
                <p className="text-2xl font-bold text-cyan-400 mb-2">{grant.amount}</p>
                <p className="text-sm text-white/60 mb-1">Deadline: {grant.deadline}</p>
                <p className="text-xs text-white/40">Source: {grant.source}</p>
                <Button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600">Apply Now</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Client Information for AI Matching
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Business Type</label>
                <Input
                  placeholder="e.g., Technology, Healthcare, Retail"
                  className="bg-white/5 border-white/10 text-white"
                  value={clientInfo.businessType}
                  onChange={(e) => setClientInfo({ ...clientInfo, businessType: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Industry</label>
                <Input
                  placeholder="e.g., Software Development, Medical Services"
                  className="bg-white/5 border-white/10 text-white"
                  value={clientInfo.industry}
                  onChange={(e) => setClientInfo({ ...clientInfo, industry: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={clientInfo.isVeteran ? "default" : "outline"}
                  onClick={() => setClientInfo({ ...clientInfo, isVeteran: !clientInfo.isVeteran })}
                  className={clientInfo.isVeteran ? "bg-cyan-500" : ""}
                >
                  Veteran Owned
                </Button>
                <Button
                  variant={clientInfo.isMinority ? "default" : "outline"}
                  onClick={() => setClientInfo({ ...clientInfo, isMinority: !clientInfo.isMinority })}
                  className={clientInfo.isMinority ? "bg-cyan-500" : ""}
                >
                  Minority Owned
                </Button>
                <Button
                  variant={clientInfo.isFemaleOwned ? "default" : "outline"}
                  onClick={() => setClientInfo({ ...clientInfo, isFemaleOwned: !clientInfo.isFemaleOwned })}
                  className={clientInfo.isFemaleOwned ? "bg-cyan-500" : ""}
                >
                  Female Owned
                </Button>
              </div>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                <Search className="h-4 w-4 mr-2" />
                Find Matching Grants
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-500/10 border-green-500/30 p-6">
              <CheckCircle2 className="h-8 w-8 text-green-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">AI Analysis Complete</h4>
              <p className="text-sm text-white/70">
                Based on your profile, we found {availableGrants.filter((g) => g.match >= 85).length} highly matching
                grants
              </p>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30 p-6">
              <Award className="h-8 w-8 text-cyan-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Total Potential Funding</h4>
              <p className="text-2xl font-bold text-cyan-400">$765,000</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scraper" className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-400" />
                  Continuous Grant Web Scraper
                </h3>
                <p className="text-sm text-white/60">Last updated: {lastScraped}</p>
              </div>
              <Button onClick={startScraper} disabled={isScraperRunning} className="bg-cyan-500 hover:bg-cyan-600">
                {isScraperRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Scraper Now
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {grantSources.map((source, index) => (
                <Card key={index} className="bg-white/5 border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{source.name}</h4>
                    <Badge
                      className={
                        source.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-400/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                      }
                    >
                      {source.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{source.type} Grants</span>
                    <span className="text-lg font-bold text-cyan-400">{source.grants}</span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30 p-6">
            <h4 className="font-semibold text-white mb-3">Scraper Coverage</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Federal grants (Grants.gov, SBA, USDA, DOE, NSF)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                State and local government grant portals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Veterans Affairs and military grants
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Minority and female business grants
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Private foundations and corporate giving programs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Philanthropist databases and donor networks
              </li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
