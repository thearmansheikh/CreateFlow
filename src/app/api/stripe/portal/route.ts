import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const NEXT_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() as unknown as { data: { stripe_customer_id: string | null } | null }

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      )
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${NEXT_URL}/dashboard/settings/billing`,
    })

    return NextResponse.json({ portalUrl: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to open portal'
    console.error('Portal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
