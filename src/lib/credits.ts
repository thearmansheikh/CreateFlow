import { createClient } from './supabase/server'

export type GenerationType = 'image' | 'video' | 'music' | 'copy'

export const CREDIT_COSTS: Record<GenerationType, number> = {
  image: 3,
  video: 5,
  music: 3,
  copy: 1,
}

export interface CreditDeductionResult {
  success: boolean
  balanceAfter: number
  error?: string
}

/**
 * Deduct credits from a user's balance.
 * Fetches the user's default workspace server-side — no workspaceId needed from client.
 */
export async function deductCredits(
  userId: string,
  type: GenerationType,
  generationId?: string
): Promise<CreditDeductionResult> {
  const supabase = await createClient()
  const cost = CREDIT_COSTS[type]

  // Get current balance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credits_balance, total_credits_used')
    .eq('id', userId)
    .single() as any

  if (userError || !user) {
    return { success: false, balanceAfter: 0, error: 'Could not fetch user balance' }
  }

  if (user.credits_balance < cost) {
    return {
      success: false,
      balanceAfter: user.credits_balance,
      error: `Insufficient credits. Need ${cost}, have ${user.credits_balance}. Buy more credits to continue.`,
    }
  }

  const newBalance = user.credits_balance - cost

  // Get user's default workspace for transaction record
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single() as any

  // Deduct balance
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits_balance: newBalance, total_credits_used: (user.total_credits_used ?? 0) + cost })
    .eq('id', userId)

  if (updateError) {
    return { success: false, balanceAfter: user.credits_balance, error: 'Failed to deduct credits' }
  }

  // Record the transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    workspace_id: member?.workspace_id || null,
    type: 'usage',
    amount: -cost,
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} generation (-${cost} credits)`,
    related_generation_id: generationId || null,
  })

  return { success: true, balanceAfter: newBalance }
}

/**
 * Add credits to a user's balance. Used for purchases, bonuses, refunds.
 */
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  stripePaymentId?: string,
  type: 'purchase' | 'bonus' | 'refund' | 'trial' = 'purchase'
): Promise<boolean> {
  const supabase = await createClient()

  // Get workspace for transaction record
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single() as any

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single() as any

  if (userError || !user) return false

  const newBalance = user.credits_balance + amount

  const { error: updateError } = await supabase
    .from('users')
    .update({ credits_balance: newBalance })
    .eq('id', userId)

  if (updateError) return false

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    workspace_id: member?.workspace_id || null,
    type,
    amount,
    description,
    stripe_payment_id: stripePaymentId || null,
  })

  return true
}
