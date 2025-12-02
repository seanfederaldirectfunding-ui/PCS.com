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
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Send,
  CreditCard,
  Shield,
  Users,
  Mail,
  MessageSquare,
  Settings,
  Save,
  UserCog,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type CollectionMode = "first-party" | "third-party"
type AccountStatus = "active" | "payment-plan" | "settled" | "paid" | "disputed"

interface DebtAccount {
  id: string
  debtorName: string
  debtorPhone: string
  debtorEmail: string
  originalCreditor: string
  balance: number
  originalBalance: number
  daysDelinquent: number
  status: AccountStatus
  lastContact: string
  paymentHistory: Payment[]
  notes: string
}

interface Payment {
  date: string
  amount: number
  method: string
  status: string
}

export function DebtCollection() {
  const [collectionMode, setCollectionMode] = useState<CollectionMode>("third-party")

  const [promptSettings, setPromptSettings] = useState({
    firstParty: {
      greeting:
        "Hello, this is [Agent Name] calling from [Company Name]. I'm calling about your account ending in [last 4 digits]. Your account is currently [days] days past due with a balance of $[balance]. We need to resolve this today.",
      paymentRequest:
        "I need you to make a payment right now to bring your account current. Can you pay the full balance of $[balance] today?",
      objectionHandling:
        "I understand you're having difficulties, but this debt needs to be paid. What amount can you commit to paying today? I can send you a secure payment link right now.",
      negotiation:
        "If you can't pay the full amount, I can set up a payment plan. But I need at least 50% down today. Can you do that?",
      paymentReceived:
        "Thank you for your payment of $[amount]. Your payment has been processed successfully. Your new balance is $[new_balance].",
      noPayment:
        "I'm sending you a payment link to your email and phone right now. You need to complete this payment within the next 24 hours or your account will be escalated. Do you understand?",
      transferToAgent:
        "I need to transfer you to a specialist who can better assist you. Please hold while I connect you.",
    },
    thirdParty: {
      greeting:
        "Hello, this is [Agent Name] calling from [Collection Agency]. This is an attempt to collect a debt. Any information obtained will be used for that purpose. May I speak with [Debtor Name]?",
      validation:
        "You have the right to dispute this debt. If you dispute the validity of this debt within 30 days, we will provide verification. You also have the right to request the name and address of the original creditor.",
      debtInfo:
        "The original creditor is [Original Creditor]. The current balance is $[balance]. This debt has been delinquent for [days] days.",
      paymentOptions:
        "We'd like to help you resolve this debt. We can offer you several payment options including a payment plan, settlement, or full payment. Which option would work best for your situation?",
      paymentReceived:
        "Thank you for your payment of $[amount]. Your payment has been processed and confirmed. Your new balance is $[new_balance]. You will receive a confirmation email shortly.",
      noPayment:
        "I'll send you a payment link to your email. You can make a payment at your convenience. If you have any questions or wish to dispute this debt, please contact us at [phone number]. Thank you for your time.",
      transferToAgent:
        "I'd like to connect you with one of our specialists who can provide you with more options. Please hold for a moment.",
    },
    decisionRules: {
      paymentThreshold: 100,
      escalationDays: 7,
      transferConditions: ["dispute", "hardship", "legal_threat", "payment_plan_request"],
      autoCloseOnPayment: true,
      sendConfirmationEmail: true,
      sendConfirmationSMS: true,
    },
  })

  const [accounts, setAccounts] = useState<DebtAccount[]>([
    {
      id: "ACC001",
      debtorName: "John Smith",
      debtorPhone: "(555) 123-4567",
      debtorEmail: "john.smith@email.com",
      originalCreditor: "ABC Medical Center",
      balance: 2500,
      originalBalance: 3000,
      daysDelinquent: 45,
      status: "active",
      lastContact: "2024-01-15",
      paymentHistory: [{ date: "2024-01-10", amount: 500, method: "Credit Card", status: "Completed" }],
      notes: "Debtor agreed to payment plan of $500/month",
    },
    {
      id: "ACC002",
      debtorName: "Sarah Johnson",
      debtorPhone: "(555) 987-6543",
      debtorEmail: "sarah.j@email.com",
      originalCreditor: "XYZ Dental Clinic",
      balance: 1800,
      originalBalance: 1800,
      daysDelinquent: 90,
      status: "payment-plan",
      lastContact: "2024-01-14",
      paymentHistory: [],
      notes: "Requested hardship program",
    },
  ])
  const [selectedAccount, setSelectedAccount] = useState<DebtAccount | null>(accounts[0])

  const handleSavePromptSettings = () => {
    console.log("[v0] Saving prompt settings:", promptSettings)
    // API call to save prompt settings
    alert("Prompt settings saved successfully!")
  }

  const updatePromptSetting = (mode: "firstParty" | "thirdParty", field: string, value: string) => {
    setPromptSettings((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: value,
      },
    }))
  }

  const updateDecisionRule = (field: string, value: any) => {
    setPromptSettings((prev) => ({
      ...prev,
      decisionRules: {
        ...prev.decisionRules,
        [field]: value,
      },
    }))
  }

  const handleSendPaymentLink = async () => {
    if (!selectedAccount) return
    console.log("[v0] Sending payment link to:", selectedAccount.debtorEmail)
    // API call to send payment link
  }

  const handleMakeCall = async () => {
    if (!selectedAccount) return
    console.log("[v0] Initiating call to:", selectedAccount.debtorPhone)
    // API call to initiate call through VoIPstudio
  }

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case "active":
        return "bg-red-500"
      case "payment-plan":
        return "bg-yellow-500"
      case "settled":
        return "bg-blue-500"
      case "paid":
        return "bg-green-500"
      case "disputed":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Collection Mode Selector */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            Collection Mode
          </CardTitle>
          <CardDescription className="text-slate-300">
            Select collection mode to ensure compliance with applicable laws
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all ${
                collectionMode === "first-party"
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700 hover:border-slate-600"
              }`}
              onClick={() => setCollectionMode("first-party")}
            >
              <CardHeader>
                <CardTitle className="text-white text-lg">First Party Collection</CardTitle>
                <CardDescription className="text-slate-300">
                  Calling as the original creditor (in-house)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>More aggressive collection tactics allowed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Not restricted by FDCPA third-party rules</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Can call more frequently</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <span>Must still follow FTC and state laws</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                collectionMode === "third-party"
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700 hover:border-slate-600"
              }`}
              onClick={() => setCollectionMode("third-party")}
            >
              <CardHeader>
                <CardTitle className="text-white text-lg">Third Party Collection</CardTitle>
                <CardDescription className="text-slate-300">Calling on behalf of another company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <span>Full FDCPA compliance required</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <span>CFPB regulations enforced</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <span>Limited call frequency (max 7 days)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-cyan-400 mt-0.5" />
                    <span>Must provide validation notice</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-cyan-400" />
              Current Mode: {collectionMode === "first-party" ? "First Party" : "Third Party"}
            </h4>
            <p className="text-sm text-slate-300">
              {collectionMode === "first-party"
                ? "GENIUS AI will identify as calling from the original creditor's business. More aggressive tactics are allowed, but must still comply with FTC and state laws."
                : "GENIUS AI will follow strict FDCPA, CFPB, and FTC regulations. All third-party collection laws will be enforced automatically."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account List */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Accounts ({accounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {accounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`cursor-pointer transition-all ${
                      selectedAccount?.id === account.id
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedAccount(account)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{account.debtorName}</span>
                          <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-300">
                          <div>Balance: ${account.balance.toLocaleString()}</div>
                          <div>{account.daysDelinquent} days delinquent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAccount ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-800">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="script">Script</TabsTrigger>
                  <TabsTrigger value="prompts">
                    <Settings className="h-4 w-4 mr-1" />
                    Prompts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Account ID</Label>
                      <Input value={selectedAccount.id} readOnly className="bg-slate-800 text-white" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Status</Label>
                      <Badge className={getStatusColor(selectedAccount.status)}>{selectedAccount.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-slate-300">Debtor Name</Label>
                      <Input value={selectedAccount.debtorName} readOnly className="bg-slate-800 text-white" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Phone</Label>
                      <Input value={selectedAccount.debtorPhone} readOnly className="bg-slate-800 text-white" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Email</Label>
                      <Input value={selectedAccount.debtorEmail} readOnly className="bg-slate-800 text-white" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Original Creditor</Label>
                      <Input value={selectedAccount.originalCreditor} readOnly className="bg-slate-800 text-white" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Current Balance</Label>
                      <Input
                        value={`$${selectedAccount.balance.toLocaleString()}`}
                        readOnly
                        className="bg-slate-800 text-white font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Days Delinquent</Label>
                      <Input
                        value={selectedAccount.daysDelinquent}
                        readOnly
                        className="bg-slate-800 text-white font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Notes</Label>
                    <Textarea value={selectedAccount.notes} readOnly className="bg-slate-800 text-white" rows={4} />
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <div className="space-y-2">
                    {selectedAccount.paymentHistory.length > 0 ? (
                      selectedAccount.paymentHistory.map((payment, index) => (
                        <Card key={index} className="bg-slate-800 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-semibold">${payment.amount.toLocaleString()}</div>
                                <div className="text-sm text-slate-300">
                                  {payment.date} - {payment.method}
                                </div>
                              </div>
                              <Badge className="bg-green-500">{payment.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 py-8">No payment history</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleMakeCall}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Make Call
                    </Button>
                    <Button
                      onClick={handleSendPaymentLink}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Send Payment Link
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                    <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send SMS
                    </Button>
                  </div>

                  <Card className="bg-slate-800 border-cyan-500/20">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Payment Link Generator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Payment Amount</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          className="bg-slate-900 text-white"
                          defaultValue={selectedAccount.balance}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Payment Type</Label>
                        <Select defaultValue="full">
                          <SelectTrigger className="bg-slate-900 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Payment</SelectItem>
                            <SelectItem value="partial">Partial Payment</SelectItem>
                            <SelectItem value="settlement">Settlement Offer</SelectItem>
                            <SelectItem value="plan">Payment Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                        <Send className="mr-2 h-4 w-4" />
                        Generate & Send Link
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="script" className="space-y-4">
                  <Card className="bg-slate-800 border-cyan-500/20">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">
                        {collectionMode === "first-party" ? "First Party" : "Third Party"} Collection Script
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4 text-sm text-slate-300">
                          {collectionMode === "first-party" ? (
                            <>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Opening (Aggressive)</h4>
                                <p>
                                  "Hello, this is [Agent Name] calling from {selectedAccount.originalCreditor}. I'm
                                  calling about your account ending in [last 4 digits]. Your account is currently{" "}
                                  {selectedAccount.daysDelinquent} days past due with a balance of $
                                  {selectedAccount.balance.toLocaleString()}. We need to resolve this today."
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Payment Request</h4>
                                <p>
                                  "I need you to make a payment right now to bring your account current. Can you pay the
                                  full balance of ${selectedAccount.balance.toLocaleString()} today?"
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Objection Handling</h4>
                                <p>
                                  "I understand you're having difficulties, but this debt needs to be paid. What amount
                                  can you commit to paying today? I can send you a secure payment link right now."
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Payment Arrangement</h4>
                                <p>
                                  "If you can't pay the full amount, I can set up a payment plan. But I need at least
                                  50% down today. Can you do that?"
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Closing</h4>
                                <p>
                                  "I'm sending you a payment link to your email and phone right now. You need to
                                  complete this payment within the next 24 hours or your account will be escalated. Do
                                  you understand?"
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Opening (FDCPA Compliant)</h4>
                                <p>
                                  "Hello, this is [Agent Name] calling from [Collection Agency]. This is an attempt to
                                  collect a debt. Any information obtained will be used for that purpose. May I speak
                                  with {selectedAccount.debtorName}?"
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Validation Notice</h4>
                                <p>
                                  "You have the right to dispute this debt. If you dispute the validity of this debt
                                  within 30 days, we will provide verification. You also have the right to request the
                                  name and address of the original creditor."
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Debt Information</h4>
                                <p>
                                  "The original creditor is {selectedAccount.originalCreditor}. The current balance is $
                                  {selectedAccount.balance.toLocaleString()}. This debt has been delinquent for{" "}
                                  {selectedAccount.daysDelinquent} days."
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Payment Options</h4>
                                <p>
                                  "We'd like to help you resolve this debt. We can offer you several payment options
                                  including a payment plan, settlement, or full payment. Which option would work best
                                  for your situation?"
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Closing (Compliant)</h4>
                                <p>
                                  "I'll send you a payment link to your email. You can make a payment at your
                                  convenience. If you have any questions or wish to dispute this debt, please contact us
                                  at [phone number]. Thank you for your time."
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* NEW TAB CONTENT FOR PROMPTS */}
                <TabsContent value="prompts" className="space-y-4">
                  <Card className="bg-slate-800 border-cyan-500/20">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4 text-cyan-400" />
                        AI Prompt Configuration
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Program exactly what GENIUS AI says in every situation. Use variables: [Agent Name], [Company
                        Name], [Debtor Name], [balance], [days], [amount], [new_balance]
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue={collectionMode} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-900">
                          <TabsTrigger value="first-party">First Party</TabsTrigger>
                          <TabsTrigger value="third-party">Third Party</TabsTrigger>
                          <TabsTrigger value="rules">Decision Rules</TabsTrigger>
                        </TabsList>

                        <TabsContent value="first-party" className="space-y-4 mt-4">
                          <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-slate-300 font-semibold">Greeting (Opening)</Label>
                                <Textarea
                                  value={promptSettings.firstParty.greeting}
                                  onChange={(e) => updatePromptSetting("firstParty", "greeting", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Payment Request</Label>
                                <Textarea
                                  value={promptSettings.firstParty.paymentRequest}
                                  onChange={(e) => updatePromptSetting("firstParty", "paymentRequest", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Objection Handling</Label>
                                <Textarea
                                  value={promptSettings.firstParty.objectionHandling}
                                  onChange={(e) =>
                                    updatePromptSetting("firstParty", "objectionHandling", e.target.value)
                                  }
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Negotiation / Payment Plan</Label>
                                <Textarea
                                  value={promptSettings.firstParty.negotiation}
                                  onChange={(e) => updatePromptSetting("firstParty", "negotiation", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Payment Received (Success)</Label>
                                <Textarea
                                  value={promptSettings.firstParty.paymentReceived}
                                  onChange={(e) => updatePromptSetting("firstParty", "paymentReceived", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">No Payment (Escalation)</Label>
                                <Textarea
                                  value={promptSettings.firstParty.noPayment}
                                  onChange={(e) => updatePromptSetting("firstParty", "noPayment", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Transfer to Human Agent</Label>
                                <Textarea
                                  value={promptSettings.firstParty.transferToAgent}
                                  onChange={(e) => updatePromptSetting("firstParty", "transferToAgent", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="third-party" className="space-y-4 mt-4">
                          <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-slate-300 font-semibold">Greeting (FDCPA Compliant)</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.greeting}
                                  onChange={(e) => updatePromptSetting("thirdParty", "greeting", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Validation Notice (Required)</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.validation}
                                  onChange={(e) => updatePromptSetting("thirdParty", "validation", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={4}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Debt Information</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.debtInfo}
                                  onChange={(e) => updatePromptSetting("thirdParty", "debtInfo", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Payment Options</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.paymentOptions}
                                  onChange={(e) => updatePromptSetting("thirdParty", "paymentOptions", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Payment Received (Success)</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.paymentReceived}
                                  onChange={(e) => updatePromptSetting("thirdParty", "paymentReceived", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">No Payment (Compliant Closing)</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.noPayment}
                                  onChange={(e) => updatePromptSetting("thirdParty", "noPayment", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-slate-300 font-semibold">Transfer to Human Agent</Label>
                                <Textarea
                                  value={promptSettings.thirdParty.transferToAgent}
                                  onChange={(e) => updatePromptSetting("thirdParty", "transferToAgent", e.target.value)}
                                  className="bg-slate-900 text-white mt-2"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="rules" className="space-y-4 mt-4">
                          <div className="space-y-4">
                            <Card className="bg-slate-900 border-cyan-500/20">
                              <CardHeader>
                                <CardTitle className="text-white text-sm">Decision Rules & Automation</CardTitle>
                                <CardDescription className="text-slate-300">
                                  Configure when AI makes decisions vs transfers to human agent
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <Label className="text-slate-300">Minimum Payment Threshold</Label>
                                  <Input
                                    type="number"
                                    value={promptSettings.decisionRules.paymentThreshold}
                                    onChange={(e) => updateDecisionRule("paymentThreshold", Number(e.target.value))}
                                    className="bg-slate-800 text-white mt-2"
                                  />
                                  <p className="text-xs text-slate-400 mt-1">
                                    AI will accept payments above this amount automatically
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-slate-300">Escalation Days</Label>
                                  <Input
                                    type="number"
                                    value={promptSettings.decisionRules.escalationDays}
                                    onChange={(e) => updateDecisionRule("escalationDays", Number(e.target.value))}
                                    className="bg-slate-800 text-white mt-2"
                                  />
                                  <p className="text-xs text-slate-400 mt-1">
                                    Days before AI escalates to more aggressive tactics
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-slate-300">Auto-Close on Payment</Label>
                                  <Select
                                    value={promptSettings.decisionRules.autoCloseOnPayment ? "yes" : "no"}
                                    onValueChange={(value) => updateDecisionRule("autoCloseOnPayment", value === "yes")}
                                  >
                                    <SelectTrigger className="bg-slate-800 text-white mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - Close automatically</SelectItem>
                                      <SelectItem value="no">No - Require manual review</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-slate-300">Send Confirmation Email</Label>
                                  <Select
                                    value={promptSettings.decisionRules.sendConfirmationEmail ? "yes" : "no"}
                                    onValueChange={(value) =>
                                      updateDecisionRule("sendConfirmationEmail", value === "yes")
                                    }
                                  >
                                    <SelectTrigger className="bg-slate-800 text-white mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-slate-300">Send Confirmation SMS</Label>
                                  <Select
                                    value={promptSettings.decisionRules.sendConfirmationSMS ? "yes" : "no"}
                                    onValueChange={(value) =>
                                      updateDecisionRule("sendConfirmationSMS", value === "yes")
                                    }
                                  >
                                    <SelectTrigger className="bg-slate-800 text-white mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-yellow-500/20">
                              <CardHeader>
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                  <UserCog className="h-4 w-4 text-yellow-400" />
                                  Transfer to Human Agent Conditions
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                  AI will automatically transfer to human agent when these conditions are detected
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {[
                                    "dispute",
                                    "hardship",
                                    "legal_threat",
                                    "payment_plan_request",
                                    "bankruptcy",
                                    "deceased",
                                    "cease_and_desist",
                                  ].map((condition) => (
                                    <div key={condition} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={promptSettings.decisionRules.transferConditions.includes(condition)}
                                        onChange={(e) => {
                                          const newConditions = e.target.checked
                                            ? [...promptSettings.decisionRules.transferConditions, condition]
                                            : promptSettings.decisionRules.transferConditions.filter(
                                                (c) => c !== condition,
                                              )
                                          updateDecisionRule("transferConditions", newConditions)
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <Label className="text-slate-300 capitalize">
                                        {condition.replace(/_/g, " ")}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <Button
                        onClick={handleSavePromptSettings}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 mt-4"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Prompt Settings
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-slate-400 py-8">Select an account to view details</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
