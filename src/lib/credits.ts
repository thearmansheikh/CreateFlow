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

type UserCreditsRow = {
  id: string
  credits_balance: number
  total_credits_used: number | null
}

export async function deductCredits(
  userId: string,
  type: GenerationType,
  generationId?: string
): Promise<CreditDeductionResult> {
  const supabase = await createClient()
  const cost = CREDIT_COSTS[type]

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, credits_balance, total_credits_used')
    .eq('id', userId)
    .single() as unknown as { data: UserCreditsRow | null; error: Error | null }

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
  const totalUsed = (user.total_credits_used ?? 0) + cost

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('users')
    .update({
      credits_balance: newBalance,
      total_credits_used: totalUsed,
    })
    .eq('id', userId)

  if (updateError) {
    return { success: false, balanceAfter: user.credits_balance, error: 'Failed to deduct credits' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('credit_transactions')
    .insert({
      user_id: userId,
      workspace_id: member?.workspace_id || null,
      type: 'usage',
      amount: -cost,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} generation (-${cost} credits)`,
      related_generation_id: generationId || null,
    })

  return { success: true, balanceAfter: newBalance }
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  stripePaymentId?: string,
  type: 'purchase' | 'bonus' | 'refund' | 'trial' = 'purchase'
): Promise<boolean> {
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single() as unknown as { data: { credits_balance: number } | null; error: Error | null }

  if (userError || !user) return false

  const newBalance = user.credits_balance + amount

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('users')
    .update({
      credits_balance: newBalance,
    })
    .eq('id', userId)

  if (updateError) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('credit_transactions')
    .insert({
      user_id: userId,
      workspace_id: member?.workspace_id || null,
      type,
      amount,
      description,
      stripe_payment_id: stripePaymentId || null,
    })

  return true
}
