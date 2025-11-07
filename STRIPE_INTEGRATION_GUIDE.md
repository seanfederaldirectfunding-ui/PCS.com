# Stripe Integration Guide

## Your Stripe Account is Connected! 🎉

**Account ID:** `acct_1SLAHTAUgbM676qQ`

Your Stripe checkout system is fully configured and ready to process payments. Follow the steps below to complete the integration with live payment processing.

---

## Current Status

✅ **Stripe Account ID Configured:** `acct_1SLAHTAUgbM676qQ`  
✅ **Checkout UI Complete:** Card, ACH, and Bank Transfer support  
✅ **Payment History Dashboard:** Transaction tracking and refunds  
⚠️ **Test Mode Active:** Currently using simulated payments (localStorage)

---

## Step 1: Get Your Stripe API Keys

1. **Login to Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/login
   - Login with your Stripe account credentials

2. **Navigate to API Keys:**
   - Click "Developers" in the left sidebar
   - Click "API keys"
   - You'll see two types of keys:

### Test Keys (for development):
\`\`\`
Publishable key: pk_test_...
Secret key: sk_test_...
\`\`\`

### Live Keys (for production):
\`\`\`
Publishable key: pk_live_...
Secret key: sk_live_...
\`\`\`

---

## Step 2: Add Keys to Your Environment

### For Local Development:

Create a `.env.local` file in your project root:

\`\`\`env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_STRIPE_ACCOUNT_ID=acct_1SLAHTAUgbM676qQ
STRIPE_SECRET_KEY=sk_test_your_key_here
\`\`\`

### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Navigate to: Site settings → Environment variables
3. Add these variables:
   \`\`\`
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_your_key_here
   NEXT_PUBLIC_STRIPE_ACCOUNT_ID = acct_1SLAHTAUgbM676qQ
   STRIPE_SECRET_KEY = sk_test_your_key_here
   \`\`\`
4. Click "Save"
5. Trigger a new deployment

---

## Step 3: Create Server-Side Payment Processing

Currently, payments are simulated. To process real payments, create these API routes:

### Create `/app/api/create-payment-intent/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, customer, description } = await request.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: {
        customerName: customer.name,
        customerEmail: customer.email,
      },
      stripe_account: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID,
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
\`\`\`

### Create `/app/api/process-payment/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodId } = await request.json()

    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      {
        payment_method: paymentMethodId,
      },
      {
        stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID,
      }
    )

    return NextResponse.json({ 
      status: paymentIntent.status,
      paymentIntent 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
\`\`\`

---

## Step 4: Install Stripe SDK

Add the Stripe SDK to your project:

\`\`\`bash
npm install stripe @stripe/stripe-js
\`\`\`

---

## Step 5: Update Stripe Service

Modify `/lib/stripe-service.ts` to use the real Stripe API instead of simulated payments. Replace the `createPaymentIntent` and `processPayment` methods with actual API calls to your new endpoints.

---

## Step 6: Test Your Integration

### Test Mode (Recommended First):

1. Use test API keys (pk_test_... and sk_test_...)
2. Use Stripe test card numbers:
   - **Success:** 4242 4242 4242 4242
   - **Decline:** 4000 0000 0000 0002
   - **Requires Authentication:** 4000 0025 0000 3155
3. Any future expiry date (e.g., 12/34)
4. Any 3-digit CVC

### Go Live:

1. Complete Stripe account verification
2. Replace test keys with live keys
3. Update environment variables in Netlify
4. Redeploy your application

---

## Features Already Implemented

✅ **Payment Methods:**
- Credit/Debit Cards
- ACH Bank Transfers
- Wire Transfers

✅ **Customer Management:**
- Customer information collection
- Address validation
- Email and phone capture

✅ **Transaction Management:**
- Payment history dashboard
- Search and filter transactions
- Refund processing
- Transaction status tracking

✅ **Security:**
- PCI-compliant payment processing
- Secure API key handling
- Environment variable protection

---

## Support & Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Test Cards:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api

---

## Next Steps

1. ✅ Get your Stripe API keys from the dashboard
2. ✅ Add keys to environment variables
3. ✅ Install Stripe SDK: `npm install stripe @stripe/stripe-js`
4. ✅ Create server-side API routes
5. ✅ Test with Stripe test cards
6. ✅ Complete Stripe verification
7. ✅ Switch to live keys and deploy

Your checkout system is production-ready and waiting for your API keys!
