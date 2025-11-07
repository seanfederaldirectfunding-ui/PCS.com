"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, CheckCircle, LinkIcon } from "lucide-react"
import SignatureCanvas from "react-signature-canvas"

interface BankTermLoanAppProps {
  onClose: () => void
}

export function BankTermLoanApp({ onClose }: BankTermLoanAppProps) {
  const [formData, setFormData] = useState({
    businessLegalName: "",
    loanType: "",
    loanAmount: "",
    loanPurpose: "",
    businessAddress: "",
    businessPhone: "",
    email: "",
    federalTaxId: "",
    yearsInBusiness: "",
    annualRevenue: "",
    ownerName: "",
    ownerSSN: "",
    ownerDOB: "",
    creditScore: "",
  })

  const [signature, setSignature] = useState<string>("")
  const [bankStatementsLinked, setBankStatementsLinked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sigRef = useRef<SignatureCanvas>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const applicationData = {
      ...formData,
      signature,
      bankStatementsLinked,
      submittedAt: new Date().toISOString(),
    }

    console.log("[v0] Submitting Bank Term Loan Application:", applicationData)

    await fetch("/api/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    })

    setIsSubmitting(false)
    onClose()
  }

  const saveSignature = () => {
    if (sigRef.current) {
      setSignature(sigRef.current.toDataURL())
    }
  }

  const linkBankStatements = async () => {
    console.log("[v0] Linking to Page Bank for bank statements...")
    setBankStatementsLinked(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bank Term Loan / Line of Credit Application</h2>
          <p className="text-sm text-white/60">Traditional Bank Financing</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
          <FileText className="h-3 w-3 mr-1" />
          Bank Term / LOC
        </Badge>
      </div>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Loan Type *</Label>
            <Select value={formData.loanType} onValueChange={(v) => setFormData({ ...formData, loanType: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="term">Term Loan</SelectItem>
                <SelectItem value="loc">Line of Credit</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Loan Amount ($) *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.loanAmount}
              onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Loan Purpose *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.loanPurpose}
              onChange={(e) => setFormData({ ...formData, loanPurpose: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Business Legal Name *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.businessLegalName}
              onChange={(e) => setFormData({ ...formData, businessLegalName: e.target.value })}
            />
          </div>
          <div>
            <Label>Federal Tax ID *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.federalTaxId}
              onChange={(e) => setFormData({ ...formData, federalTaxId: e.target.value })}
            />
          </div>
          <div>
            <Label>Years in Business *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.yearsInBusiness}
              onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
            />
          </div>
          <div>
            <Label>Annual Revenue ($) *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.annualRevenue}
              onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Bank Statements</h3>
        <div className="space-y-4">
          <p className="text-sm text-white/60">Connect to Page Bank to automatically pull your bank statements.</p>
          {bankStatementsLinked ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Bank statements linked successfully</span>
            </div>
          ) : (
            <Button type="button" onClick={linkBankStatements} className="bg-blue-500 hover:bg-blue-600">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link Bank Statements via Page Bank
            </Button>
          )}
        </div>
      </Card>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Owner Signature</h3>
        <div className="space-y-4">
          <div className="border border-white/20 rounded bg-white">
            <SignatureCanvas ref={sigRef} canvasProps={{ className: "w-full h-40" }} />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => sigRef.current?.clear()} variant="outline">
              Clear
            </Button>
            <Button type="button" onClick={saveSignature} className="bg-green-500 hover:bg-green-600">
              Save Signature
            </Button>
          </div>
          {signature && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Signature saved</span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !signature || !bankStatementsLinked}
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}
