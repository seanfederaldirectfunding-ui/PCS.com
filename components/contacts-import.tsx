"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, Download, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CsvColumn {
  index: number
  name: string
  sample: string
}

interface FieldMapping {
  [key: string]: number | null
}

const CONTACT_FIELDS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'full_name', label: 'Full Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone *', required: true },
  { value: 'secondary_phone', label: 'Secondary Phone' },
  { value: 'company', label: 'Company' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'industry', label: 'Industry' },
  { value: 'address_line1', label: 'Address Line 1' },
  { value: 'address_line2', label: 'Address Line 2' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'ZIP Code' },
  { value: 'country', label: 'Country' },
  { value: 'source', label: 'Source' },
  { value: 'notes', label: 'Notes' },
  { value: 'skip', label: '-- Skip Column --' }
]

export function ContactsImport() {
  const [csvData, setCsvData] = useState<string[][] | null>(null)
  const [columns, setColumns] = useState<CsvColumn[]>([])
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = text.split('\n').map(row => {
        // Handle CSV parsing (basic, can be improved with a library)
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        return matches ? matches.map(val => val.replace(/^"|"$/g, '').trim()) : []
      }).filter(row => row.length > 0)

      if (rows.length < 2) {
        setResult({ success: false, message: 'CSV file must have at least a header row and one data row' })
        return
      }

      const headers = rows[0]
      const dataRows = rows.slice(1)

      const cols: CsvColumn[] = headers.map((name, index) => ({
        index,
        name,
        sample: dataRows[0]?.[index] || ''
      }))

      setColumns(cols)
      setCsvData(rows)
      
      // Auto-map common fields
      const autoMapping: FieldMapping = {}
      cols.forEach(col => {
        const normalized = col.name.toLowerCase().replace(/[_\s-]/g, '')
        
        if (normalized.includes('firstname') || normalized === 'fname') {
          autoMapping['first_name'] = col.index
        } else if (normalized.includes('lastname') || normalized === 'lname') {
          autoMapping['last_name'] = col.index
        } else if (normalized.includes('fullname') || normalized === 'name') {
          autoMapping['full_name'] = col.index
        } else if (normalized.includes('email')) {
          autoMapping['email'] = col.index
        } else if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('cell')) {
          if (!autoMapping['phone']) {
            autoMapping['phone'] = col.index
          } else {
            autoMapping['secondary_phone'] = col.index
          }
        } else if (normalized.includes('company') || normalized.includes('business')) {
          autoMapping['company'] = col.index
        } else if (normalized.includes('title') || normalized.includes('position')) {
          autoMapping['job_title'] = col.index
        } else if (normalized.includes('city')) {
          autoMapping['city'] = col.index
        } else if (normalized.includes('state')) {
          autoMapping['state'] = col.index
        } else if (normalized.includes('zip') || normalized.includes('postal')) {
          autoMapping['zip_code'] = col.index
        }
      })

      setFieldMapping(autoMapping)
      setResult(null)
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvData || csvData.length < 2) {
      setResult({ success: false, message: 'No data to import' })
      return
    }

    // Check if phone field is mapped
    if (fieldMapping['phone'] === null || fieldMapping['phone'] === undefined) {
      setResult({ success: false, message: 'Phone number field is required. Please map a column to Phone.' })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const headers = csvData[0]
      const dataRows = csvData.slice(1)

      // Transform CSV data based on field mapping
      const contacts = dataRows.map(row => {
        const contact: any = {}
        
        Object.entries(fieldMapping).forEach(([field, columnIndex]) => {
          if (columnIndex !== null && columnIndex !== undefined && field !== 'skip') {
            const value = row[columnIndex]?.trim()
            if (value) {
              contact[field] = value
            }
          }
        })

        return contact
      }).filter(contact => contact.phone) // Only include contacts with phone numbers

      if (contacts.length === 0) {
        setResult({ success: false, message: 'No valid contacts found. Make sure phone numbers are mapped correctly.' })
        setImporting(false)
        return
      }

      // Import contacts
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult({ 
        success: true, 
        message: `Successfully imported ${data.imported} contacts!` 
      })
      
      // Reset form
      setTimeout(() => {
        setCsvData(null)
        setColumns([])
        setFieldMapping({})
      }, 2000)

    } catch (error: any) {
      console.error('Import error:', error)
      setResult({ 
        success: false, 
        message: error.message || 'Failed to import contacts' 
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadSample = () => {
    const sampleCsv = `First Name,Last Name,Email,Phone,Company,Job Title,City,State
John,Doe,john@example.com,2125551234,Acme Corp,Sales Manager,New York,NY
Jane,Smith,jane@example.com,3105555678,Tech Inc,CEO,Los Angeles,CA
Bob,Johnson,bob@example.com,4155559876,StartUp LLC,Developer,San Francisco,CA`

    const blob = new Blob([sampleCsv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-contacts.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Contacts from CSV</CardTitle>
        <CardDescription>
          Upload a CSV file and map the columns to contact fields
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!csvData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label
                htmlFor="csv-upload"
                className="flex-1 flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-cyan-500 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="text-sm font-medium">Click to upload CSV file</span>
                <span className="text-xs text-gray-500">or drag and drop</span>
              </Label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Button
              variant="outline"
              onClick={downloadSample}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                Found {csvData.length - 1} contacts in CSV. Map the columns below:
              </AlertDescription>
            </Alert>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {columns.map((col) => (
                <div key={col.index} className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <Label className="text-sm font-medium">{col.name}</Label>
                    <p className="text-xs text-gray-500 mt-1">Sample: {col.sample}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <Select
                      value={
                        Object.entries(fieldMapping).find(([_, idx]) => idx === col.index)?.[0] || 'skip'
                      }
                      onValueChange={(value) => {
                        setFieldMapping(prev => {
                          // Remove this column index from all mappings
                          const newMapping: FieldMapping = {}
                          Object.entries(prev).forEach(([field, idx]) => {
                            if (idx !== col.index) {
                              newMapping[field] = idx
                            }
                          })
                          
                          // Add new mapping if not skip
                          if (value !== 'skip') {
                            newMapping[value] = col.index
                          }
                          
                          return newMapping
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="flex-1"
              >
                {importing ? 'Importing...' : `Import ${csvData.length - 1} Contacts`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCsvData(null)
                  setColumns([])
                  setFieldMapping({})
                  setResult(null)
                }}
                disabled={importing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
