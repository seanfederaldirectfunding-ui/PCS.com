// VoIPstudio API Service
// Complete integration for making calls through VoIPstudio REST API

interface VoIPConfig {
  apiKey: string
  username: string
  server: string
  password: string
}

interface CallRequest {
  to: string
  from?: string
  callerId?: string
}

interface CallResponse {
  success: boolean
  callId?: string
  status?: string
  error?: string
}

class VoIPStudioService {
  private config: VoIPConfig
  private baseUrl = "https://l7api.com/v1.1/voipstudio"

  constructor() {
    this.config = {
      apiKey: process.env.VOIPSTUDIO_API_KEY || "",
      username: process.env.NEXT_PUBLIC_VOIP_USERNAME || "388778",
      server: process.env.NEXT_PUBLIC_VOIP_SERVER || "amn.sip.ssl7.net",
      password: process.env.VOIP_PASSWORD || "",
    }
  }

  // Make a call through VoIPstudio REST API
  async makeCall(request: CallRequest): Promise<CallResponse> {
    try {
      if (!this.config.apiKey) {
        console.error("[v0] VoIPstudio API key not configured")
        return {
          success: false,
          error: "VoIPstudio API key not configured",
        }
      }

      // Format phone number to E.164 format (remove non-digits and add +)
      const formattedTo = this.formatPhoneNumber(request.to)

      console.log("[v0] Making call via VoIPstudio:", {
        to: formattedTo,
        from: this.config.username,
        server: this.config.server,
      })

      const response = await fetch(`${this.baseUrl}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          to: formattedTo,
          from: request.from || this.config.username,
          caller_id: request.callerId || formattedTo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] VoIPstudio API error:", errorData)
        return {
          success: false,
          error: errorData.message || `API error: ${response.status}`,
        }
      }

      const data = await response.json()
      console.log("[v0] Call initiated successfully:", data)

      return {
        success: true,
        callId: data.call_id || data.id,
        status: "initiated",
      }
    } catch (error) {
      console.error("[v0] VoIPstudio call error:", error)
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

    // If it starts with 1 and has 11 digits, it's already in E.164 format
    if (digits.startsWith("1") && digits.length === 11) {
      return `+${digits}`
    }

    // If it has 10 digits, assume US number and add +1
    if (digits.length === 10) {
      return `+1${digits}`
    }

    // If it already starts with +, return as is
    if (phone.startsWith("+")) {
      return phone
    }

    // Otherwise, add + prefix
    return `+${digits}`
  }

  // Get call status
  async getCallStatus(callId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Error getting call status:", error)
      return null
    }
  }

  // Check if VoIP is configured
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.username && this.config.server)
  }

  // Get connection info
  getConnectionInfo() {
    return {
      server: this.config.server,
      username: this.config.username,
      configured: this.isConfigured(),
    }
  }
}

// Export singleton instance
export const voipService = new VoIPStudioService()
