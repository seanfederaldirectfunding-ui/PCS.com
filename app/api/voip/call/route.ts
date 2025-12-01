import { type NextRequest, NextResponse } from "next/server"
import { twilioService } from "@/lib/twilio-service" // CHANGE THIS LINE ONLY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, from, callerId } = body

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      )
    }

    console.log("[v0] API: Making call to:", to)

    const result = await twilioService.makeCall({  // CHANGE voipService to twilioService
      to,
      from,
      callerId,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
      status: result.status,
      message: "Call initiated successfully",
    })
  } catch (error) {
    console.error("[v0] API: Call error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to make call" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // If the service exposes an async connection check, await it.
    const connectionInfo: { server?: string } = twilioService.getConnectionInfo ? await twilioService.getConnectionInfo() : {}

    // detect both Twilio and VoIPstudio config (support switching between them)
    const twilioConfigured = Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    )
    const voipstudioConfigured = Boolean(process.env.VOIPSTUDIO_API_KEY)
    const configured = twilioConfigured || voipstudioConfigured

    const voip = {
      configured,
      // prefer Twilio phone number when Twilio is configured, fall back to VoIP server or service-provided info
      server:
        (twilioConfigured ? process.env.TWILIO_PHONE_NUMBER : null) ??
        process.env.NEXT_PUBLIC_VOIP_SERVER ??
        connectionInfo.server ??
        null,
      ...connectionInfo,
    }

    return NextResponse.json({
      success: true,
      voip,
    })
  } catch (error) {
    console.error("[v0] API: VoIP status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get VoIP status" },
      { status: 500 }
    )
  }
}