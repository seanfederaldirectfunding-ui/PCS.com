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
    const apiKey = process.env.VOIPSTUDIO_API_KEY;
    const username = process.env.NEXT_PUBLIC_VOIP_USERNAME;
    const server = process.env.NEXT_PUBLIC_VOIP_SERVER;
    const password = process.env.VOIP_PASSWORD;

    if (!apiKey) {
      console.error("[VoIP] VOIPSTUDIO_API_KEY environment variable is missing");
    }
    if (!username) {
      console.error("[VoIP] NEXT_PUBLIC_VOIP_USERNAME environment variable is missing");
    }
    if (!server) {
      console.error("[VoIP] NEXT_PUBLIC_VOIP_SERVER environment variable is missing");
    }
    if (!password) {
      console.error("[VoIP] VOIP_PASSWORD environment variable is missing");
    }

    this.config = {
      apiKey: apiKey || "",
      username: username || "",
      server: server || "",
      password: password || "",
    }

    console.log("[VoIP] Service initialized with:", {
      hasApiKey: !!apiKey,
      username: username || 'MISSING',
      server: server || 'MISSING',
      hasPassword: !!password
    });
  }


  // Make a call through VoIPstudio REST API
  async makeCall(request: CallRequest): Promise<CallResponse> {
    try {
      // Validate configuration
      if (!this.config.apiKey) {
        console.error("[VoIP] API key not configured")
        return {
          success: false,
          error: "VoIPstudio API key not configured. Please set VOIPSTUDIO_API_KEY environment variable.",
        }
      }

      if (!this.config.username || !this.config.server) {
        console.error("[VoIP] Username or server not configured")
        return {
          success: false,
          error: "VoIP credentials not configured. Please check environment variables.",
        }
      }

      // Format phone number to E.164 format (remove non-digits and add +)
      const formattedTo = this.formatPhoneNumber(request.to)
      const formattedFrom = request.from ? this.formatPhoneNumber(request.from) : this.config.username

      const requestBody = {
        to: formattedTo,
        from: formattedFrom,
        caller_id: request.callerId || formattedFrom,
      };

      console.log("[VoIP] Making call via VoIPstudio:", {
        to: formattedTo,
        from: formattedFrom,
        server: this.config.server,
        apiUrl: `${this.baseUrl}/calls`,
        apiKeyLength: this.config.apiKey.length,
        apiKeyPrefix: this.config.apiKey.substring(0, 10)
      })

      console.log("[VoIP] Request body:", JSON.stringify(requestBody, null, 2))
      console.log("[VoIP] Full Authorization header:", `Bearer ${this.config.apiKey.substring(0, 15)}...`)

      const response = await fetch(`${this.baseUrl}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log("[VoIP] API Response:", { 
        status: response.status, 
        statusText: response.statusText,
        body: responseText 
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          errorData = { message: responseText || response.statusText }
        }
        
        console.error("[VoIP] API error:", errorData)
        return {
          success: false,
          error: errorData.message || `API error: ${response.status} ${response.statusText}`,
        }
      }

      const data = JSON.parse(responseText)
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
