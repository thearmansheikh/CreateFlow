import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { addCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle checkout.session.completed for one-time credit purchases
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    const purchaseType = session.metadata?.type
    const userId = session.metadata?.userId

    if (purchaseType === 'credits' && userId) {
      const creditsAmount = parseInt(session.metadata?.credits || '0', 10)

      if (creditsAmount > 0) {
        await addCredits(
          userId,
          creditsAmount,
          `Purchased ${creditsAmount.toLocaleString()} credits via Stripe`,
          session.id,
          'purchase'
        )
        console.log(`[Stripe Webhook] Added ${creditsAmount} credits to user ${userId}`)
      }
    }
  }

  // Handle subscription events
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any
    const customerId = invoice.customer
    const userId = invoice.metadata?.userId || invoice.subscription_details?.metadata?.userId

    if (userId) {
      // Add monthly credits for subscription
      await addCredits(
        userId,
        200, // 200 credits per month for subscription
        'Monthly subscription credits',
        invoice.id,
        'bonus'
      )
    }
  }

  return NextResponse.json({ received: true })
}
