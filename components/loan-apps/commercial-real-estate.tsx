"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle, LinkIcon } from "lucide-react"
import SignatureCanvas from "react-signature-canvas"

interface CommercialRealEstateAppProps {
  onClose: () => void
}

export function CommercialRealEstateApp({ onClose }: CommercialRealEstateAppProps) {
  const [formData, setFormData] = useState({
    mortgageType: "",
    loanAmount: "",
    interestRate: "",
    numberOfMonths: "",
    amortizationType: "",
    propertyAddress: "",
    numberOfUnits: "",
    legalDescription: "",
    yearBuilt: "",
    loanPurpose: "",
    propertyType: "",
    borrowerName: "",
    borrowerSSN: "",
    borrowerPhone: "",
    borrowerDOB: "",
    borrowerEmail: "",
    presentAddress: "",
    yearsAtAddress: "",
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

    console.log("[v0] Submitting Commercial Real Estate Application:", applicationData)

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
          <h2 className="text-2xl font-bold text-white">Commercial Real Estate Loan Application</h2>
          <p className="text-sm text-white/60">Federal Direct Funding Commercial Loan</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
          <FileText className="h-3 w-3 mr-1" />
          Commercial RE
        </Badge>
      </div>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Type of Mortgage and Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mortgage Type *</Label>
            <Select value={formData.mortgageType} onValueChange={(v) => setFormData({ ...formData, mortgageType: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="conventional">Conventional</SelectItem>
                <SelectItem value="fha">FHA</SelectItem>
                <SelectItem value="va">VA</SelectItem>
                <SelectItem value="usda">USDA/Rural Housing</SelectItem>
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
          <div>
            <Label>Interest Rate (%) *</Label>
            <Input
              required
              type="number"
              step="0.01"
              className="bg-white/5 border-white/10 text-white"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            />
          </div>
          <div>
            <Label>Number of Months *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.numberOfMonths}
              onChange={(e) => setFormData({ ...formData, numberOfMonths: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Property Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Subject Property Address *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            />
          </div>
          <div>
            <Label>Number of Units *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.numberOfUnits}
              onChange={(e) => setFormData({ ...formData, numberOfUnits: e.target.value })}
            />
          </div>
          <div>
            <Label>Year Built *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.yearBuilt}
              onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Legal Description *</Label>
            <Textarea
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.legalDescription}
              onChange={(e) => setFormData({ ...formData, legalDescription: e.target.value })}
            />
          </div>
          <div>
            <Label>Purpose of Loan *</Label>
            <Select value={formData.loanPurpose} onValueChange={(v) => setFormData({ ...formData, loanPurpose: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="refinance">Refinance</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Property Type *</Label>
            <Select value={formData.propertyType} onValueChange={(v) => setFormData({ ...formData, propertyType: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="primary">Primary Residence</SelectItem>
                <SelectItem value="secondary">Secondary Residence</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Borrower Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Borrower Name *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
            />
          </div>
          <div>
            <Label>Social Security Number *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.borrowerSSN}
              onChange={(e) => setFormData({ ...formData, borrowerSSN: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone *</Label>
            <Input
              required
              type="tel"
              className="bg-white/5 border-white/10 text-white"
              value={formData.borrowerPhone}
              onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
            />
          </div>
          <div>
            <Label>Date of Birth *</Label>
            <Input
              required
              type="date"
              className="bg-white/5 border-white/10 text-white"
              value={formData.borrowerDOB}
              onChange={(e) => setFormData({ ...formData, borrowerDOB: e.target.value })}
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              required
              type="email"
              className="bg-white/5 border-white/10 text-white"
              value={formData.borrowerEmail}
              onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
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
        <h3 className="text-lg font-semibold text-white mb-4">Borrower Signature</h3>
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
          className="flex-1 bg-purple-500 hover:bg-purple-600"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}
