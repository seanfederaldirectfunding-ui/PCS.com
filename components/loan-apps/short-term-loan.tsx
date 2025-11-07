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

interface ShortTermLoanAppProps {
  onClose: () => void
}

export function ShortTermLoanApp({ onClose }: ShortTermLoanAppProps) {
  const [formData, setFormData] = useState({
    businessLegalName: "",
    legalEntityType: "",
    dba: "",
    capitalRequested: "",
    physicalAddress: "",
    capitalPurpose: "",
    mailingAddress: "",
    website: "",
    businessPhone: "",
    businessFax: "",
    mobile: "",
    email: "",
    federalTaxId: "",
    businessStartDate: "",
    seasonal: "",
    // Principal 1
    owner1Name: "",
    owner1Ownership: "",
    owner1Address: "",
    owner1Email: "",
    owner1Mobile: "",
    owner1DOB: "",
    owner1SSN: "",
    // Principal 2
    owner2Name: "",
    owner2Ownership: "",
    owner2Address: "",
    owner2Email: "",
    owner2Mobile: "",
    owner2DOB: "",
    owner2SSN: "",
    // Funding Info
    visaMcVolume: "",
    totalMonthlySales: "",
    hasAdvance: "",
    advanceAmount: "",
    advanceBalance: "",
    ccPercentage: "",
    landlordContact: "",
    lastMonth: "",
    twoMonthsAgo: "",
    threeMonthsAgo: "",
    fourMonthsAgo: "",
    tradeReference: "",
    tradeContact: "",
    tradePhone: "",
  })

  const [signature1, setSignature1] = useState<string>("")
  const [signature2, setSignature2] = useState<string>("")
  const [documents, setDocuments] = useState<File[]>([])
  const [bankStatementsLinked, setBankStatementsLinked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sig1Ref = useRef<SignatureCanvas>(null)
  const sig2Ref = useRef<SignatureCanvas>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const applicationData = {
      ...formData,
      signature1,
      signature2,
      documents: documents.map((d) => d.name),
      bankStatementsLinked,
      submittedAt: new Date().toISOString(),
    }

    console.log("[v0] Submitting Short Term Loan Application:", applicationData)

    // API call would go here
    await fetch("/api/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    })

    setIsSubmitting(false)
    onClose()
  }

  const saveSignature1 = () => {
    if (sig1Ref.current) {
      setSignature1(sig1Ref.current.toDataURL())
    }
  }

  const saveSignature2 = () => {
    if (sig2Ref.current) {
      setSignature2(sig2Ref.current.toDataURL())
    }
  }

  const linkBankStatements = async () => {
    console.log("[v0] Linking to Page Bank for bank statements...")
    // Page Bank integration would go here
    setBankStatementsLinked(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Short Term Business Loan Application</h2>
          <p className="text-sm text-white/60">Federal Direct Funding LLC</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
          <FileText className="h-3 w-3 mr-1" />
          Short Term
        </Badge>
      </div>

      {/* Business Information */}
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
            <Label>Legal Entity Type *</Label>
            <Select
              value={formData.legalEntityType}
              onValueChange={(v) => setFormData({ ...formData, legalEntityType: v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="corp">Corporation</SelectItem>
                <SelectItem value="sole">Sole Proprietorship</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>DBA (Doing Business As) *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.dba}
              onChange={(e) => setFormData({ ...formData, dba: e.target.value })}
            />
          </div>
          <div>
            <Label>Capital Requested ($) *</Label>
            <Input
              required
              type="number"
              className="bg-white/5 border-white/10 text-white"
              value={formData.capitalRequested}
              onChange={(e) => setFormData({ ...formData, capitalRequested: e.target.value })}
            />
          </div>
          <div>
            <Label>Physical Address *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.physicalAddress}
              onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
            />
          </div>
          <div>
            <Label>Purpose of Capital *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.capitalPurpose}
              onChange={(e) => setFormData({ ...formData, capitalPurpose: e.target.value })}
            />
          </div>
          <div>
            <Label>Business Phone *</Label>
            <Input
              required
              type="tel"
              className="bg-white/5 border-white/10 text-white"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
            />
          </div>
          <div>
            <Label>Email Address *</Label>
            <Input
              required
              type="email"
              className="bg-white/5 border-white/10 text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <Label>Business Start Date *</Label>
            <Input
              required
              type="date"
              className="bg-white/5 border-white/10 text-white"
              value={formData.businessStartDate}
              onChange={(e) => setFormData({ ...formData, businessStartDate: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Principal Owner 1 */}
      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Principal Owner 1</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1Name}
              onChange={(e) => setFormData({ ...formData, owner1Name: e.target.value })}
            />
          </div>
          <div>
            <Label>% of Ownership *</Label>
            <Input
              required
              type="number"
              max="100"
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1Ownership}
              onChange={(e) => setFormData({ ...formData, owner1Ownership: e.target.value })}
            />
          </div>
          <div>
            <Label>Home Address *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1Address}
              onChange={(e) => setFormData({ ...formData, owner1Address: e.target.value })}
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              required
              type="email"
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1Email}
              onChange={(e) => setFormData({ ...formData, owner1Email: e.target.value })}
            />
          </div>
          <div>
            <Label>Mobile *</Label>
            <Input
              required
              type="tel"
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1Mobile}
              onChange={(e) => setFormData({ ...formData, owner1Mobile: e.target.value })}
            />
          </div>
          <div>
            <Label>Date of Birth *</Label>
            <Input
              required
              type="date"
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1DOB}
              onChange={(e) => setFormData({ ...formData, owner1DOB: e.target.value })}
            />
          </div>
          <div>
            <Label>Social Security # *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.owner1SSN}
              onChange={(e) => setFormData({ ...formData, owner1SSN: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Funding Information */}
      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Funding Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Visa/MasterCard Monthly Volume *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.visaMcVolume}
              onChange={(e) => setFormData({ ...formData, visaMcVolume: e.target.value })}
            />
          </div>
          <div>
            <Label>Total Monthly Sales *</Label>
            <Input
              required
              className="bg-white/5 border-white/10 text-white"
              value={formData.totalMonthlySales}
              onChange={(e) => setFormData({ ...formData, totalMonthlySales: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Page Bank Integration */}
      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Bank Statements</h3>
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Connect to Page Bank to automatically pull your bank statements for faster processing.
          </p>
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

      {/* eSign */}
      <Card className="bg-white/5 border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Owner Signature 1</h3>
        <div className="space-y-4">
          <div className="border border-white/20 rounded bg-white">
            <SignatureCanvas ref={sig1Ref} canvasProps={{ className: "w-full h-40" }} />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => sig1Ref.current?.clear()} variant="outline">
              Clear
            </Button>
            <Button type="button" onClick={saveSignature1} className="bg-green-500 hover:bg-green-600">
              Save Signature
            </Button>
          </div>
          {signature1 && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Signature saved</span>
            </div>
          )}
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !signature1 || !bankStatementsLinked}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}
