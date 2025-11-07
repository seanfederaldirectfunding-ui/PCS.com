import { type NextRequest, NextResponse } from "next/server"
import { voipService } from "@/lib/voipstudio-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, from, callerId } = body

    if (!to) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
    }

    console.log("[v0] API: Making call to:", to)

    const result = await voipService.makeCall({
      to,
      from,
      callerId,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
      status: result.status,
      message: "Call initiated successfully",
    })
  } catch (error) {
    console.error("[v0] API: Call error:", error)
    return NextResponse.json({ success: false, error: "Failed to make call" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const connectionInfo = voipService.getConnectionInfo()

    return NextResponse.json({
      success: true,
      voip: connectionInfo,
    })
  } catch (error) {
    console.error("[v0] API: VoIP status error:", error)
    return NextResponse.json({ success: false, error: "Failed to get VoIP status" }, { status: 500 })
  }
}
