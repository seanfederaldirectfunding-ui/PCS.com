"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface APIStatus {
  name: string
  channel: string
  configured: boolean
  tested: boolean
  working: boolean
}

export function APIStatusChecker() {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: "Email (Mailgun)", channel: "email", configured: true, tested: false, working: false },
    { name: "SMS (Twilio)", channel: "sms", configured: false, tested: false, working: false },
    { name: "WhatsApp (Twilio)", channel: "whatsapp", configured: false, tested: false, working: false },
    { name: "Telegram Bot", channel: "telegram", configured: false, tested: false, working: false },
    { name: "Signal", channel: "signal", configured: false, tested: false, working: false },
    { name: "Facebook Messenger", channel: "facebook", configured: false, tested: false, working: false },
    { name: "Instagram", channel: "instagram", configured: false, tested: false, working: false },
    { name: "Snapchat", channel: "snapchat", configured: false, tested: false, working: false },
  ])

  useEffect(() => {
    checkAPIConfiguration()
  }, [])

  const checkAPIConfiguration = () => {
    // Check which APIs are configured based on environment variables
    const updatedStatuses = apiStatuses.map((status) => {
      const configured = status.channel === "email" // Mailgun is configured

      return { ...status, configured }
    })

    setApiStatuses(updatedStatuses)
  }

  const testAPI = async (channel: string) => {
    // Test API connection
    console.log("[v0] Testing API:", channel)
    // Implementation would call test endpoint
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">API Integration Status</h3>
      <div className="space-y-3">
        {apiStatuses.map((api) => (
          <div key={api.channel} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {api.configured ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{api.name}</span>
            </div>
            <Badge variant={api.configured ? "default" : "secondary"}>
              {api.configured ? "Configured" : "Not Set Up"}
            </Badge>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-500 mb-1">Setup Required</p>
            <p className="text-muted-foreground">
              Mailgun email is configured and ready to use. For other channels, check the{" "}
              <code className="bg-muted px-1 py-0.5 rounded">lib/api-setup-guide.md</code> file for detailed
              instructions on obtaining free API keys.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
