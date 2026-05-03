import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, credits_balance, total_credits_used, subscription_tier')
    .eq('id', user.id)
    .single() as unknown as {
      data: {
        id: string
        full_name: string | null
        credits_balance: number
        total_credits_used: number
        subscription_tier: 'free' | 'pro' | 'business' | 'enterprise'
      } | null
    }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ ...profile, email: user.email ?? null })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { full_name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : ''
  if (!fullName) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
  }
  if (fullName.length > 100) {
    return NextResponse.json({ error: 'Full name is too long' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('users')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, full_name: fullName })
}
