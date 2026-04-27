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

  // One-time credit purchases
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
          `Purchased ${creditsAmount.toLocaleString()} credits`,
          session.id,
          'purchase'
        )
        console.log(`[Webhook] Added ${creditsAmount} credits to ${userId}`)
      }
    }

    // Subscription completed
    if (purchaseType === 'subscription' && userId) {
      await addCredits(
        userId,
        500, // Pro plan = 500 credits/month
        'Pro subscription — 500 credits/month',
        session.id,
        'bonus'
      )
      console.log(`[Webhook] Pro subscription activated for ${userId}`)
    }
  }

  // Subscription renewal — add credits each billing cycle
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any
    const subscriptionId = invoice.subscription

    // Get subscription to find the customer and metadata
    if (subscriptionId) {
      const stripe = getStripe()
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.userId
        if (userId) {
          await addCredits(
            userId,
            500,
            'Monthly subscription renewal — 500 credits',
            invoice.id,
            'bonus'
          )
          console.log(`[Webhook] Renewal credits for ${userId}`)
        }
      } catch (e) {
        console.error('Failed to retrieve subscription:', e)
      }
    }
  }

  return NextResponse.json({ received: true })
}
