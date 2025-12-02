import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethod } = await request.json()

    // Validate required fields
    if (!paymentIntentId || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Processing payment:", { paymentIntentId, paymentMethod })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate 95% success rate
    const success = Math.random() > 0.05

    const result = {
      paymentIntentId,
      status: success ? "succeeded" : "failed",
      paymentMethod,
      processedAt: new Date().toISOString(),
      account_id: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID,
    }

    console.log("[v0] Payment processed:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
