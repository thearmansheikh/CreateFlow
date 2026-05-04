import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { addCredits } from '@/lib/credits'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

async function setSubscriptionTier(
  userId: string,
  tier: 'free' | 'pro' | 'business' | 'enterprise',
) {
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('users').update({ subscription_tier: tier }).eq('id', userId)
}

async function persistStripeCustomer(userId: string, customerId: string) {
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('users').update({ stripe_customer_id: customerId }).eq('id', userId)
}

// The Stripe Customer Portal uses `cancel_at` (timestamp) for scheduled
// cancellations; the legacy boolean `cancel_at_period_end` is left false.
// Treat either as a pending cancellation.
function isCancelScheduled(sub: { cancel_at_period_end?: boolean | null; cancel_at?: number | null }): boolean {
  return Boolean(sub.cancel_at_period_end) || (typeof sub.cancel_at === 'number' && sub.cancel_at > 0)
}

async function upsertSubscription(params: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: string
  currentPeriodStart: number | null
  currentPeriodEnd: number | null
  cancelAtPeriodEnd: boolean
}) {
  const supabase = createAdminClient()
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', params.userId)
    .single() as unknown as { data: { workspace_id: string } | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: existing } = await sb
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', params.stripeSubscriptionId)
    .maybeSingle()

  const row = {
    user_id: params.userId,
    workspace_id: member?.workspace_id ?? null,
    stripe_customer_id: params.stripeCustomerId,
    stripe_subscription_id: params.stripeSubscriptionId,
    plan: 'pro' as const,
    status: params.status,
    current_period_start: params.currentPeriodStart
      ? new Date(params.currentPeriodStart * 1000).toISOString()
      : null,
    current_period_end: params.currentPeriodEnd
      ? new Date(params.currentPeriodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: params.cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    await sb.from('subscriptions').update(row).eq('id', existing.id)
  } else {
    await sb.from('subscriptions').insert(row)
  }

  // Mirror the Stripe subscription ID on the user for quick lookups.
  await sb
    .from('users')
    .update({ stripe_subscription_id: params.stripeSubscriptionId })
    .eq('id', params.userId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const stripe = getStripe()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
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
        }
      }

      if (purchaseType === 'subscription' && userId) {
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id

        if (customerId) {
          await persistStripeCustomer(userId, customerId)
        }

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          await upsertSubscription({
            userId,
            stripeCustomerId: customerId ?? (sub.customer as string),
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodStart: (sub as unknown as { current_period_start: number }).current_period_start,
            currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
            cancelAtPeriodEnd: isCancelScheduled(sub),
          })
        }

        await setSubscriptionTier(userId, 'pro')
        await addCredits(
          userId,
          500,
          'Pro subscription — 500 credits/month',
          session.id,
          'bonus'
        )
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId =
        typeof (invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription === 'string'
          ? ((invoice as unknown as { subscription: string }).subscription)
          : (invoice as unknown as { subscription?: Stripe.Subscription }).subscription?.id

      // Skip the very first invoice — checkout.session.completed already credited it.
      const billingReason = (invoice as unknown as { billing_reason?: string }).billing_reason
      if (billingReason === 'subscription_create') {
        return NextResponse.json({ received: true })
      }

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (userId) {
          await upsertSubscription({
            userId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodStart: (sub as unknown as { current_period_start: number }).current_period_start,
            currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
            cancelAtPeriodEnd: isCancelScheduled(sub),
          })
          await setSubscriptionTier(userId, 'pro')
          await addCredits(
            userId,
            500,
            'Monthly subscription renewal — 500 credits',
            invoice.id ?? undefined,
            'bonus'
          )
        }
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (userId) {
        await upsertSubscription({
          userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: (sub as unknown as { current_period_start: number }).current_period_start,
          currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        // If past_due / unpaid, keep them on pro until canceled; downgrade only on terminal states.
        if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
          await setSubscriptionTier(userId, 'free')
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (userId) {
        await upsertSubscription({
          userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          status: 'canceled',
          currentPeriodStart: (sub as unknown as { current_period_start: number }).current_period_start,
          currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        await setSubscriptionTier(userId, 'free')
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId =
        typeof (invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription === 'string'
          ? ((invoice as unknown as { subscription: string }).subscription)
          : (invoice as unknown as { subscription?: Stripe.Subscription }).subscription?.id
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (userId) {
          await upsertSubscription({
            userId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodStart: (sub as unknown as { current_period_start: number }).current_period_start,
            currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
            cancelAtPeriodEnd: isCancelScheduled(sub),
          })
        }
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
