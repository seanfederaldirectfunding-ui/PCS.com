// Twilio API Service
// Complete integration for making calls through Twilio REST API

interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
}

interface CallRequest {
  to: string
  from?: string
}

interface CallResponse {
  success: boolean
  callId?: string
  status?: string
  error?: string
}

class TwilioService {
  private config: TwilioConfig
  private baseUrl: string

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || "", // Your Twilio number
    }
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}`
  }

  // Make a call through Twilio REST API
  async makeCall(request: CallRequest): Promise<CallResponse> {
    try {
      if (!this.isConfigured()) {
        console.error("[Twilio] API credentials not configured")
        return {
          success: false,
          error: "Twilio credentials not configured",
        }
      }

      // Format phone number to E.164 format
      const formattedTo = this.formatPhoneNumber(request.to)
      const formattedFrom = request.from || this.config.phoneNumber

      console.log("[Twilio] Making call:", {
        to: formattedTo,
        from: formattedFrom,
      })

      // Create the request body (URL-encoded for Twilio)
      const params = new URLSearchParams({
        To: formattedTo,
        From: formattedFrom,
        // TwiML instructions - you'll need to set up a TwiML Bin or webhook URL
        Url: process.env.TWILIO_TWIML_URL || "http://demo.twilio.com/docs/voice.xml",
      })

      // Create Basic Auth header
      const credentials = btoa(`${this.config.accountSid}:${this.config.authToken}`)

      const response = await fetch(`${this.baseUrl}/Calls.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Twilio] API error:", errorData)
        return {
          success: false,
          error: errorData.message || `API error: ${response.status}`,
        }
      }

      const data = await response.json()
      console.log("[Twilio] Call initiated successfully:", data)

      return {
        success: true,
        callId: data.sid,
        status: data.status,
      }
    } catch (error) {
      console.error("[Twilio] Call error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Format phone number to E.164 format
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "")

    // If it already starts with +, return as is
    if (phone.startsWith("+")) {
      return phone
    }

    // If it starts with 1 and has 11 digits, it's already in E.164 format
    if (digits.startsWith("1") && digits.length === 11) {
      return `+${digits}`
    }

    // If it has 10 digits, assume US number and add +1
    if (digits.length === 10) {
      return `+1${digits}`
    }

    // Otherwise, add + prefix
    return `+${digits}`
  }

  // Get call status
  async getCallStatus(callId: string): Promise<any> {
    try {
      const credentials = btoa(`${this.config.accountSid}:${this.config.authToken}`)

      const response = await fetch(`${this.baseUrl}/Calls/${callId}.json`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[Twilio] Error getting call status:", error)
      return null
    }
  }

  // End/hangup a call
  async endCall(callId: string): Promise<boolean> {
    try {
      const credentials = btoa(`${this.config.accountSid}:${this.config.authToken}`)

      const params = new URLSearchParams({
        Status: "completed",
      })

      const response = await fetch(`${this.baseUrl}/Calls/${callId}.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: params.toString(),
      })

      return response.ok
    } catch (error) {
      console.error("[Twilio] Error ending call:", error)
      return false
    }
  }

  // Check if Twilio is configured
  isConfigured(): boolean {
    return !!(
      this.config.accountSid &&
      this.config.authToken &&
      this.config.phoneNumber
    )
  }

  // Get connection info
  getConnectionInfo() {
    return {
      accountSid: this.config.accountSid,
      phoneNumber: this.config.phoneNumber,
      configured: this.isConfigured(),
    }
  }
}

// Export singleton instance
export const twilioService = new TwilioService()