"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { stripeService, type Customer } from "@/lib/stripe-service"
import { CreditCard, Building2, Banknote, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function StripeCheckout() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ach" | "bank_transfer">("card")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")

  // Customer Information
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  // Payment Information
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  // Card Information
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  // ACH Information
  const [routingNumber, setRoutingNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking")

  // Address Information
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  })

  const handlePayment = async () => {
    // Validation
    if (!customerName || !customerEmail || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const amountInCents = Math.round(Number.parseFloat(amount) * 100)
    if (isNaN(amountInCents) || amountInCents <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    // Validate payment method specific fields
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        toast({
          title: "Missing Card Information",
          description: "Please fill in all card details",
          variant: "destructive",
        })
        return
      }
    } else if (paymentMethod === "ach") {
      if (!routingNumber || !accountNumber) {
        toast({
          title: "Missing Bank Information",
          description: "Please fill in all bank account details",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    setPaymentStatus("processing")

    try {
      // Create customer object
      const customer: Customer = {
        id: `cus_${Date.now()}`,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: address.line1 ? address : undefined,
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        amountInCents,
        "usd",
        customer,
        description || "Payment",
        {
          paymentMethod,
          source: "checkout_console",
        },
      )

      // Process payment
      const result = await stripeService.processPayment(paymentIntent.id, paymentMethod)

      if (result.status === "succeeded") {
        setPaymentStatus("success")
        toast({
          title: "Payment Successful",
          description: `Payment of $${amount} processed successfully`,
        })

        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm()
        }, 3000)
      } else {
        setPaymentStatus("error")
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      setPaymentStatus("error")
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCustomerName("")
    setCustomerEmail("")
    setCustomerPhone("")
    setAmount("")
    setDescription("")
    setCardNumber("")
    setCardExpiry("")
    setCardCvc("")
    setRoutingNumber("")
    setAccountNumber("")
    setAddress({
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    })
    setPaymentStatus("idle")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Stripe Checkout Console</h2>
          <p className="text-sm text-white/60 mt-1">Process payments securely with Stripe</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Connected</Badge>
            <p className="text-xs text-white/60 mt-1">Account: {stripeService.getAccountId()}</p>
          </div>
        </div>
      </div>

      {paymentStatus === "success" ? (
        <Card className="bg-gradient-to-br from-green-900/40 to-green-600/20 border-green-500/30 backdrop-blur-sm p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-white/80">Your payment of ${amount} has been processed</p>
            </div>
            <Button onClick={resetForm} className="bg-green-500 hover:bg-green-600">
              Process Another Payment
            </Button>
          </div>
        </Card>
      ) : paymentStatus === "error" ? (
        <Card className="bg-gradient-to-br from-red-900/40 to-red-600/20 border-red-500/30 backdrop-blur-sm p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
              <p className="text-white/80">There was an error processing your payment</p>
            </div>
            <Button onClick={() => setPaymentStatus("idle")} className="bg-red-500 hover:bg-red-600">
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-white mb-4">Customer Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="text-white/80">
                  Full Name *
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail" className="text-white/80">
                  Email Address *
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className="text-white/80">
                  Phone Number
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-white/80">
                  Payment Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white/80">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment for services"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>

            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5">
                <TabsTrigger value="card" className="data-[state=active]:bg-cyan-500/20">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="ach" className="data-[state=active]:bg-cyan-500/20">
                  <Building2 className="h-4 w-4 mr-2" />
                  ACH
                </TabsTrigger>
                <TabsTrigger value="bank_transfer" className="data-[state=active]:bg-cyan-500/20">
                  <Banknote className="h-4 w-4 mr-2" />
                  Bank
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-white/80">
                    Card Number *
                  </Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry" className="text-white/80">
                      Expiry Date *
                    </Label>
                    <Input
                      id="cardExpiry"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvc" className="text-white/80">
                      CVC *
                    </Label>
                    <Input
                      id="cardCvc"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ach" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="routingNumber" className="text-white/80">
                    Routing Number *
                  </Label>
                  <Input
                    id="routingNumber"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="110000000"
                    maxLength={9}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber" className="text-white/80">
                    Account Number *
                  </Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="000123456789"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="accountType" className="text-white/80">
                    Account Type *
                  </Label>
                  <Select value={accountType} onValueChange={(v) => setAccountType(v as any)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="bank_transfer" className="space-y-4 mt-4">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-sm text-cyan-300">
                    Bank transfer instructions will be provided after initiating the payment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handlePayment}
              disabled={loading || paymentStatus === "processing"}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {loading || paymentStatus === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${amount || "0.00"}`
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
