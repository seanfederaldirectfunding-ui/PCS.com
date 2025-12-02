"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Clock, CheckCircle, XCircle, Plus, Send, Mail, MessageSquare } from "lucide-react"
import { ShortTermLoanApp } from "@/components/loan-apps/short-term-loan"
import { BankTermLoanApp } from "@/components/loan-apps/bank-term-loan"
import { CommercialRealEstateApp } from "@/components/loan-apps/commercial-real-estate"

export function Applications() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)

  const applications = [
    {
      id: 1,
      name: "John Smith - Business Loan",
      status: "approved",
      date: "Dec 20, 2024",
      amount: "$50,000",
      type: "short-term",
      signed: true,
    },
    {
      id: 2,
      name: "Sarah Johnson - Grant Application",
      status: "pending",
      date: "Dec 22, 2024",
      amount: "$25,000",
      type: "grant",
      signed: false,
    },
    {
      id: 3,
      name: "Mike Davis - Equipment Financing",
      status: "review",
      date: "Dec 23, 2024",
      amount: "$35,000",
      type: "bank-term",
      signed: true,
    },
    {
      id: 4,
      name: "Emily Brown - Working Capital",
      status: "rejected",
      date: "Dec 19, 2024",
      amount: "$40,000",
      type: "commercial",
      signed: false,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "review":
        return <FileText className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
      case "review":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  const sendApplication = async (appId: number, method: "email" | "sms") => {
    console.log(`[v0] Sending application ${appId} via ${method}`)
    // API call would go here
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Applications</h2>
        <Button onClick={() => setShowNewAppDialog(true)} className="bg-cyan-500 hover:bg-cyan-600">
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="unsigned">Unsigned</TabsTrigger>
          <TabsTrigger value="signed">Signed</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="bg-white/5 border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{app.name}</h3>
                    {app.signed && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Signed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{app.date}</span>
                    <span className="font-semibold text-cyan-400">{app.amount}</span>
                    <span className="capitalize">{app.type.replace("-", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10"
                    onClick={() => sendApplication(app.id, "email")}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10"
                    onClick={() => sendApplication(app.id, "sms")}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Badge className={`${getStatusColor(app.status)} flex items-center gap-2`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unsigned" className="space-y-4">
          {applications
            .filter((app) => !app.signed)
            .map((app) => (
              <Card key={app.id} className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{app.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{app.date}</span>
                      <span className="font-semibold text-cyan-400">{app.amount}</span>
                    </div>
                  </div>
                  <Button className="bg-yellow-500 hover:bg-yellow-600">
                    <Send className="h-4 w-4 mr-2" />
                    Send for Signature
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="signed" className="space-y-4">
          {applications
            .filter((app) => app.signed)
            .map((app) => (
              <Card key={app.id} className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{app.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{app.date}</span>
                      <span className="font-semibold text-cyan-400">{app.amount}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Signed & Processing
                  </Badge>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {applications
            .filter((app) => app.status === "approved")
            .map((app) => (
              <Card key={app.id} className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{app.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{app.date}</span>
                      <span className="font-semibold text-cyan-400">{app.amount}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approved
                  </Badge>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* New Application Dialog */}
      <Dialog open={showNewAppDialog} onOpenChange={setShowNewAppDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Application Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="bg-white/5 border-white/10 p-6 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedApp("short-term")}
            >
              <FileText className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Short Term Business Loan</h3>
              <p className="text-sm text-white/60">Fast business funding application</p>
            </Card>
            <Card
              className="bg-white/5 border-white/10 p-6 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedApp("bank-term")}
            >
              <FileText className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Bank Term Loan / LOC</h3>
              <p className="text-sm text-white/60">Traditional bank financing</p>
            </Card>
            <Card
              className="bg-white/5 border-white/10 p-6 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedApp("commercial")}
            >
              <FileText className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Commercial Real Estate</h3>
              <p className="text-sm text-white/60">Commercial property financing</p>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Forms */}
      {selectedApp === "short-term" && (
        <Dialog open={true} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
            <ShortTermLoanApp onClose={() => setSelectedApp(null)} />
          </DialogContent>
        </Dialog>
      )}

      {selectedApp === "bank-term" && (
        <Dialog open={true} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
            <BankTermLoanApp onClose={() => setSelectedApp(null)} />
          </DialogContent>
        </Dialog>
      )}

      {selectedApp === "commercial" && (
        <Dialog open={true} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
            <CommercialRealEstateApp onClose={() => setSelectedApp(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
