import { type NextRequest, NextResponse } from "next/server"
import { sendMessage, sendBulkMessages } from "@/lib/multi-channel-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...payload } = body

    if (type === "bulk") {
      const { recipients, message, channels, subject } = payload
      const results = await sendBulkMessages(recipients, message, channels, subject)
      return NextResponse.json({ success: true, results })
    } else {
      const result = await sendMessage(payload)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
