"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Phone, Search, Edit, Trash2, Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Contact {
  id: string
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone: string
  company?: string
  status: string
  created_at: string
}

interface ContactsListProps {
  onSelectContact?: (contact: Contact) => void
  onCall?: (phone: string, contact: Contact) => void
}

export function ContactsList({ onSelectContact, onCall }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('limit', '100')

      const response = await fetch(`/api/contacts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch contacts')

      const data = await response.json()
      setContacts(data.contacts || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchContacts()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete contact')

      setContacts(prev => prev.filter(c => c.id !== id))
      setTotal(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'contacted': return 'bg-yellow-500'
      case 'qualified': return 'bg-green-500'
      case 'converted': return 'bg-purple-500'
      case 'dead': return 'bg-gray-500'
      case 'do-not-call': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading && contacts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading contacts...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contacts ({total})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No contacts found.</p>
            <p className="text-sm mt-2">Import contacts using the CSV import feature above.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>{contact.company || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onCall && (
                          <Button
                            size="sm"
                            onClick={() => onCall(contact.phone, contact)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        {onSelectContact && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
