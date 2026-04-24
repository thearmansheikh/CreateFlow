import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const NEXT_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const CREDIT_PRICES: Record<number, number> = {
  100: 500,    // $5.00 in cents
  500: 2000,   // $20.00
  1500: 5000,  // $50.00
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, priceId, credits } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripe()

    // One-time credit purchase
    if (type === 'credits') {
      const creditAmount = credits as number
      const priceCents = CREDIT_PRICES[creditAmount]

      if (!priceCents) {
        return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${creditAmount.toLocaleString()} Credits`,
                description: 'CreateFlow credits for AI content generation',
              },
              unit_amount: priceCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${NEXT_URL}/dashboard/credits?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${NEXT_URL}/dashboard/credits`,
        metadata: {
          userId: user.id,
          type: 'credits',
          credits: creditAmount.toString(),
        },
      })

      return NextResponse.json({ checkoutUrl: session.url })
    }

    // Subscription purchase
    if (type === 'subscription' && priceId) {
      // Get user's email
      const { data: userProfile } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: userProfile?.email || user.email,
        metadata: { userId: user.id },
      })

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: customer.id,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${NEXT_URL}/dashboard/credits?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${NEXT_URL}/dashboard/credits`,
        metadata: {
          userId: user.id,
          type: 'subscription',
        },
      })

      return NextResponse.json({ checkoutUrl: session.url })
    }

    return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
