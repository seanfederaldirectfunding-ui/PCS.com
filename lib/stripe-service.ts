// Stripe Payment Service
// Handles all Stripe payment processing and checkout functionality

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY!

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

const STRIPE_ACCOUNT_ID = process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID!

const STRIPE_CONNECT_ACCOUNT = process.env.STRIPE_CONNECT_ACCOUNT!

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "pending" | "processing" | "succeeded" | "failed"
  customerId: string
  customerName: string
  customerEmail: string
  description: string
  createdAt: Date
  metadata?: Record<string, string>
  stripeAccountId?: string // Added Stripe account ID to payment intent
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

class StripeService {
  private publishableKey: string
  private secretKey: string
  private accountId: string
  private connectAccountId: string

  constructor() {
    this.publishableKey = STRIPE_PUBLISHABLE_KEY
    this.secretKey = STRIPE_SECRET_KEY
    this.accountId = STRIPE_ACCOUNT_ID
    this.connectAccountId = STRIPE_CONNECT_ACCOUNT
    console.log("[v0] Stripe service initialized with account:", this.accountId)
    console.log("[v0] Stripe Connect account:", this.connectAccountId)
  }

  // Get Stripe publishable key
  getPublishableKey(): string {
    return this.publishableKey
  }

  getSecretKey(): string {
    return this.secretKey
  }

  getAccountId(): string {
    return this.accountId
  }

  getConnectAccountId(): string {
    return this.connectAccountId
  }

  // Create a payment intent via API
  async createPaymentIntent(
    amount: number,
    currency = "usd",
    customer: Customer,
    description: string,
    metadata?: Record<string, string>,
  ): Promise<PaymentIntent> {
    try {
      console.log("[v0] Creating payment intent via API:", { amount, currency, customer, description })

      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          customer,
          description,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const data = await response.json()

      const paymentIntent: PaymentIntent = {
        id: data.paymentIntentId,
        amount,
        currency,
        status: "pending",
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        description,
        createdAt: new Date(),
        stripeAccountId: this.accountId,
        metadata: {
          ...metadata,
          clientSecret: data.clientSecret,
        },
      }

      // Store in localStorage
      const payments = this.getPayments()
      payments.push(paymentIntent)
      localStorage.setItem("stripe_payments", JSON.stringify(payments))

      console.log("[v0] Payment intent created:", paymentIntent)
      return paymentIntent
    } catch (error) {
      console.error("[v0] Error creating payment intent:", error)
      throw new Error("Failed to create payment intent")
    }
  }

  // Process a payment via API
  async processPayment(
    paymentIntentId: string,
    paymentMethod: "card" | "ach" | "bank_transfer",
  ): Promise<PaymentIntent> {
    try {
      console.log("[v0] Processing payment via API:", { paymentIntentId, paymentMethod })

      const response = await fetch("/api/stripe/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process payment")
      }

      const result = await response.json()

      const payments = this.getPayments()
      const payment = payments.find((p) => p.id === paymentIntentId)

      if (!payment) {
        throw new Error("Payment intent not found")
      }

      payment.status = result.status === "succeeded" ? "succeeded" : "failed"
      payment.metadata = {
        ...payment.metadata,
        paymentMethod,
        processedAt: result.processedAt,
      }

      localStorage.setItem("stripe_payments", JSON.stringify(payments))

      console.log("[v0] Payment processed:", payment)
      return payment
    } catch (error) {
      console.error("[v0] Error processing payment:", error)
      throw new Error("Failed to process payment")
    }
  }

  // Get all payments
  getPayments(): PaymentIntent[] {
    try {
      const stored = localStorage.getItem("stripe_payments")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("[v0] Error getting payments:", error)
      return []
    }
  }

  // Get payment by ID
  getPaymentById(id: string): PaymentIntent | null {
    const payments = this.getPayments()
    return payments.find((p) => p.id === id) || null
  }

  // Get payments by customer
  getPaymentsByCustomer(customerId: string): PaymentIntent[] {
    const payments = this.getPayments()
    return payments.filter((p) => p.customerId === customerId)
  }

  // Refund a payment via API
  async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent> {
    try {
      console.log("[v0] Refunding payment via API:", { paymentIntentId, amount })

      const response = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId,
          amount,
          reason: "requested_by_customer",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refund payment")
      }

      const result = await response.json()

      const payments = this.getPayments()
      const payment = payments.find((p) => p.id === paymentIntentId)

      if (!payment) {
        throw new Error("Payment intent not found")
      }

      if (payment.status !== "succeeded") {
        throw new Error("Can only refund succeeded payments")
      }

      payment.metadata = {
        ...payment.metadata,
        refunded: "true",
        refundId: result.id,
        refundAmount: (amount || payment.amount).toString(),
        refundedAt: result.created,
      }

      localStorage.setItem("stripe_payments", JSON.stringify(payments))

      console.log("[v0] Payment refunded:", payment)
      return payment
    } catch (error) {
      console.error("[v0] Error refunding payment:", error)
      throw new Error("Failed to refund payment")
    }
  }
}

export const stripeService = new StripeService()
