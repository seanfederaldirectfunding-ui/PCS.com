import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "usd", customer, description, metadata } = await request.json()

    // Validate required fields
    if (!amount || !customer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For now, we'll use the Stripe SDK when it's installed
    // This is a placeholder that returns a mock payment intent
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: "requires_payment_method",
      customer: {
        id: customer.id || `cus_${Date.now()}`,
        name: customer.name,
        email: customer.email,
      },
      description,
      metadata: {
        ...metadata,
        account_id: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID,
      },
    }

    console.log("[v0] Payment intent created:", paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentIntent,
    })
  } catch (error) {
    console.error("[v0] Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
