"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { stripeService, type PaymentIntent } from "@/lib/stripe-service"
import { Search, RefreshCw, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PaymentHistory() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<PaymentIntent[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentIntent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = payments.filter(
        (p) =>
          p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPayments(filtered)
    } else {
      setFilteredPayments(payments)
    }
  }, [searchTerm, payments])

  const loadPayments = () => {
    const allPayments = stripeService.getPayments()
    setPayments(allPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  }

  const handleRefund = async (paymentId: string) => {
    setLoading(true)
    try {
      await stripeService.refundPayment(paymentId)
      toast({
        title: "Refund Successful",
        description: "Payment has been refunded",
      })
      loadPayments()
    } catch (error) {
      toast({
        title: "Refund Failed",
        description: error instanceof Error ? error.message : "Failed to refund payment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Succeeded</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Failed</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Processing</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">Pending</Badge>
    }
  }

  const totalAmount = payments.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount, 0)

  const totalTransactions = payments.length
  const successfulTransactions = payments.filter((p) => p.status === "succeeded").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment History</h2>
          <p className="text-sm text-white/60 mt-1">View and manage all transactions</p>
        </div>
        <Button onClick={loadPayments} variant="outline" className="border-white/10 bg-transparent">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">${(totalAmount / 100).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Successful</p>
              <p className="text-2xl font-bold text-cyan-400">{successfulTransactions}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Total Transactions</p>
              <p className="text-2xl font-bold text-purple-400">{totalTransactions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, email, or payment ID..."
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Payments Table */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/80">Payment ID</TableHead>
              <TableHead className="text-white/80">Customer</TableHead>
              <TableHead className="text-white/80">Amount</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80">Date</TableHead>
              <TableHead className="text-white/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-white/60 py-8">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-sm text-white/80">{payment.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{payment.customerName}</p>
                      <p className="text-xs text-white/60">{payment.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-semibold">${(payment.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/80">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payment.status === "succeeded" && !payment.metadata?.refunded && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefund(payment.id)}
                        disabled={loading}
                        className="border-white/10 text-white/80 hover:bg-white/5"
                      >
                        Refund
                      </Button>
                    )}
                    {payment.metadata?.refunded && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">Refunded</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
