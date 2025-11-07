import { type NextRequest, NextResponse } from "next/server"
import { voipService } from "@/lib/voipstudio-service"

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    const { phoneNumber, to } = params

    const targetNumber = phoneNumber || to

    if (!targetNumber) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
    }

    console.log("[v0] GENIUS making call:", targetNumber)

    const result = await voipService.makeCall({
      to: targetNumber,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
      message: "Call initiated successfully via VoIPstudio",
    })
  } catch (error) {
    console.error("[v0] GENIUS call error:", error)
    return NextResponse.json({ success: false, error: "Failed to make call" }, { status: 500 })
  }
}
