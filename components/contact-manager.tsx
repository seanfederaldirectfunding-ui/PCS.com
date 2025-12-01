"use client"

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload, Users, User, Bot, Search, Phone, Download, Trash2,
  Play, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2
} from "lucide-react"
import { contactsAPI } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"

// ============================================
// TYPES
// ============================================

export interface Contact {
  contact_id: string
  name: string
  phone: string
  email?: string
  company?: string
  status: "new" | "contacted" | "qualified" | "converted" | "unreachable"
  lead_score: number
  assigned_to: "unassigned" | "ai" | "human"
}

interface ContactManagerProps {
  onStartCampaign: (contacts: Contact[]) => void
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Memoized Contact Row Component
const ContactRow = memo(({ 
  contact, 
  isSelected, 
  onToggle 
}: {
  contact: Contact
  isSelected: boolean
  onToggle: (id: string) => void
}) => {
  const statusColors = {
    new: "bg-blue-500/20 text-blue-400 border-blue-400/30",
    contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
    qualified: "bg-purple-500/20 text-purple-400 border-purple-400/30",
    converted: "bg-green-500/20 text-green-400 border-green-400/30",
    unreachable: "bg-red-500/20 text-red-400 border-red-400/30"
  }

  const assignmentColors = {
    unassigned: "bg-gray-500/20 text-gray-400 border-gray-400/30",
    ai: "bg-purple-500/20 text-purple-400 border-purple-400/30",
    human: "bg-green-500/20 text-green-400 border-green-400/30"
  }

  const handleCheckboxChange = useCallback(() => {
    onToggle(contact.contact_id)
  }, [contact.contact_id, onToggle])

  return (
    <div className={`grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-lg items-center hover:bg-white/10 transition-colors ${
      isSelected ? 'ring-2 ring-cyan-400' : ''
    }`}>
      <div className="col-span-1">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={handleCheckboxChange}
        />
      </div>
      
      <div className="col-span-3">
        <p className="font-semibold text-white truncate">{contact.name}</p>
        {contact.company && (
          <p className="text-sm text-white/60 truncate">{contact.company}</p>
        )}
      </div>
      
      <div className="col-span-3">
        <p className="text-white flex items-center gap-2">
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{contact.phone}</span>
        </p>
        {contact.email && (
          <p className="text-sm text-white/60 truncate">{contact.email}</p>
        )}
      </div>
      
      <div className="col-span-2">
        <Badge className={statusColors[contact.status]}>
          {contact.status}
        </Badge>
      </div>
      
      <div className="col-span-2">
        <Badge className={assignmentColors[contact.assigned_to]}>
          {contact.assigned_to === "ai" && <Bot className="h-3 w-3 mr-1" />}
          {contact.assigned_to === "human" && <User className="h-3 w-3 mr-1" />}
          {contact.assigned_to}
        </Badge>
      </div>

      <div className="col-span-1">
        <span className="text-cyan-400 font-semibold">{contact.lead_score}</span>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return (
    prevProps.contact.contact_id === nextProps.contact.contact_id &&
    prevProps.isSelected === nextProps.isSelected
  )
})

ContactRow.displayName = 'ContactRow'

// ============================================
// MAIN COMPONENT
// ============================================

export function ContactManager({ onStartCampaign }: ContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assignmentFilter, setAssignmentFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUser = authService.getCurrentUser()

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Load contacts with pagination
  const loadContacts = useCallback(async (page: number = 1) => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      const response = await contactsAPI.getContacts({
        userId: currentUser.userId,
        page,
        limit: 50,
        search: debouncedSearchTerm,
        status: statusFilter !== 'all' ? statusFilter : ''
      })

      if (response.data.success) {
        setContacts(response.data.contacts)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, debouncedSearchTerm, statusFilter])

  // Load contacts when filters change
  useEffect(() => {
    loadContacts(1)
  }, [loadContacts])

  // Memoized filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      if (assignmentFilter !== "all" && contact.assigned_to !== assignmentFilter) {
        return false
      }
      return true
    })
  }, [contacts, assignmentFilter])

  // Toggle selection handlers
  const toggleSelectAll = useCallback(() => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.contact_id)))
    }
  }, [filteredContacts, selectedContacts.size])

  const toggleContactSelection = useCallback((contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }, [])

  // CSV Upload Handler
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    console.log(`[CSV] Starting upload: ${file.name}`)
    setUploading(true)

    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        console.log(`[CSV] File loaded, size: ${text.length} chars`)
        
        const lines = text.split("\n").filter(line => line.trim())
        console.log(`[CSV] Found ${lines.length} lines`)
        
        if (lines.length === 0) {
          alert("No data found in CSV")
          setUploading(false)
          return
        }

        // Parse CSV headers - handle both comma and tab delimiters
        const firstLine = lines[0]
        const delimiter = firstLine.includes('\t') ? '\t' : ','
        const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim())
        
        console.log(`[CSV] Headers:`, headers)
        console.log(`[CSV] Delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`)

        // Find column indices
        const nameIdx = headers.findIndex(h => 
          h.includes('name') || h.includes('contact') || h.includes('full')
        )
        const phoneIdx = headers.findIndex(h => 
          h.includes('phone') || h.includes('mobile') || h.includes('tel') || h.includes('cell')
        )
        const emailIdx = headers.findIndex(h => 
          h.includes('email') || h.includes('mail')
        )
        const companyIdx = headers.findIndex(h => 
          h.includes('company') || h.includes('organization') || h.includes('business')
        )

        console.log(`[CSV] Column indices:`, { nameIdx, phoneIdx, emailIdx, companyIdx })

        if (phoneIdx === -1) {
          alert("CSV must have a 'phone' column")
          setUploading(false)
          return
        }

        // Parse contacts
        const parsedContacts = lines.slice(1)
          .map((line, index) => {
            const values = line.split(delimiter).map(v => {
              let value = v.trim()
              // Remove quotes
              if ((value.startsWith('"') && value.endsWith('"')) || 
                  (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
              }
              return value
            })

            const phone = values[phoneIdx]?.trim() || ""
            
            // Skip if no phone
            if (!phone) {
              console.log(`[CSV] Skipping row ${index + 1}: No phone number`)
              return null
            }

            // Calculate lead score
            let leadScore = 0
            if (phone) leadScore += 40
            if (emailIdx >= 0 && values[emailIdx]) leadScore += 30
            if (nameIdx >= 0 && values[nameIdx] && values[nameIdx] !== `Contact ${index + 1}`) leadScore += 20
            if (companyIdx >= 0 && values[companyIdx]) leadScore += 10

            const contact = {
              name: nameIdx >= 0 && values[nameIdx] ? values[nameIdx] : `Contact ${index + 1}`,
              phone,
              email: emailIdx >= 0 ? values[emailIdx] : "",
              company: companyIdx >= 0 ? values[companyIdx] : "",
              leadScore
            }

            console.log(`[CSV] Parsed contact ${index + 1}:`, contact)
            return contact
          })
          .filter(Boolean)

        console.log(`[CSV] Successfully parsed ${parsedContacts.length} contacts`)

        if (parsedContacts.length === 0) {
          alert("No valid contacts found. Make sure CSV has phone numbers.")
          setUploading(false)
          return
        }

        // Upload to backend
        console.log(`[CSV] Uploading ${parsedContacts.length} contacts to backend...`)
        const response = await contactsAPI.uploadContacts({
          userId: currentUser.userId,
          contacts: parsedContacts
        })

        if (response.data.success) {
          const stats = response.data.stats
          alert(`✅ Successfully uploaded!\n\nSaved: ${stats.successful}\nDuplicates skipped: ${stats.duplicatesSkipped || 0}`)
          loadContacts(1)
        }

      } catch (error) {
        console.error("[CSV] Parse error:", error)
        alert("Error parsing CSV file. Please check the format.")
      } finally {
        setUploading(false)
        e.target.value = ""
      }
    }
    
    reader.onerror = () => {
      console.error("[CSV] Error reading file")
      alert("Error reading file. Please try again.")
      setUploading(false)
    }
    
    reader.readAsText(file)
  }, [currentUser, loadContacts])

  // Assign contacts
  const handleAssign = useCallback(async (assignTo: "ai" | "human") => {
    if (!currentUser || selectedContacts.size === 0) return

    try {
      await contactsAPI.assignContacts({
        userId: currentUser.userId,
        contactIds: Array.from(selectedContacts),
        assignTo
      })

      setSelectedContacts(new Set())
      loadContacts(pagination.currentPage)
    } catch (error) {
      console.error('Failed to assign contacts:', error)
      alert('Failed to assign contacts')
    }
  }, [currentUser, selectedContacts, loadContacts, pagination.currentPage])

  // Delete contacts
  const handleDelete = useCallback(async () => {
    if (!currentUser || selectedContacts.size === 0) return

    if (!confirm(`Delete ${selectedContacts.size} contacts?`)) return

    try {
      await contactsAPI.deleteContacts({
        userId: currentUser.userId,
        contactIds: Array.from(selectedContacts)
      })

      setSelectedContacts(new Set())
      loadContacts(1)
    } catch (error) {
      console.error('Failed to delete contacts:', error)
      alert('Failed to delete contacts')
    }
  }, [currentUser, selectedContacts, loadContacts])

  // Start campaign
  const handleStartCampaign = useCallback(() => {
    if (selectedContacts.size === 0) {
      alert("Please select contacts")
      return
    }

    const selectedContactObjects = contacts.filter(c => 
      selectedContacts.has(c.contact_id)
    )
    
    onStartCampaign(selectedContactObjects)
    setSelectedContacts(new Set())
  }, [selectedContacts, contacts, onStartCampaign])

  // Export CSV
  const exportContacts = useCallback(() => {
    const headers = ['Name', 'Phone', 'Email', 'Company', 'Status', 'Lead Score']
    const csvContent = [
      headers.join(','),
      ...contacts.map(c => [
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.email || ''}"`,
        `"${c.company || ''}"`,
        `"${c.status}"`,
        `"${c.lead_score}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [contacts])

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Contact Manager</h3>
          <p className="text-sm text-white/60">
            {loading ? "Loading..." : `${pagination.totalCount} total contacts`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
            disabled={uploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {uploading ? "Processing..." : "Upload CSV"}
          </Button>
          <Button
            onClick={exportContacts}
            className="bg-green-500/20 border-green-400/30 text-green-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
        </select>

        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded"
        >
          <option value="all">All Assignments</option>
          <option value="unassigned">Unassigned</option>
          <option value="ai">AI Assigned</option>
          <option value="human">Human Assigned</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg mb-6">
          <p className="text-cyan-400 font-semibold flex-1">
            {selectedContacts.size} selected
          </p>
          <Button
            onClick={() => handleAssign("ai")}
            className="bg-purple-500/20 text-purple-400"
            size="sm"
          >
            <Bot className="h-4 w-4 mr-2" />
            Assign to AI
          </Button>
          <Button
            onClick={() => handleAssign("human")}
            className="bg-green-500/20 text-green-400"
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            Assign to Human
          </Button>
          <Button
            onClick={handleStartCampaign}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Campaign
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-500/20 text-red-400"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-lg text-sm font-semibold text-white/80">
          <div className="col-span-1">
            <Checkbox
              checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
              onCheckedChange={toggleSelectAll}
            />
          </div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Contact Info</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Assignment</div>
          <div className="col-span-1">Score</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white/60">Loading contacts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No contacts found</p>
          </div>
        )}

        {/* Contact Rows */}
        {!loading && filteredContacts.map((contact) => (
          <ContactRow
            key={contact.contact_id}
            contact={contact}
            isSelected={selectedContacts.has(contact.contact_id)}
            onToggle={toggleContactSelection}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadContacts(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
              className="bg-white/5 border-white/10 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadContacts(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className="bg-white/5 border-white/10 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}