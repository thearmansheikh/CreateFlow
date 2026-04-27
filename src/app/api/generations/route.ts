import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient() as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')

  let query = supabase
    .from('generation_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tasks: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient() as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    type,
    prompt,
    enhancedPrompt,
    parameters,
    workspaceId,
    creditsCost,
  } = body

  // Check credits balance
  const { data: profile } = await supabase
    .from('users')
    .select('credits_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits_balance < (creditsCost ?? 1)) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // Create generation task
  const { data: task, error } = await supabase
    .from('generation_tasks')
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      type,
      prompt,
      enhanced_prompt: enhancedPrompt,
      parameters,
      status: 'pending',
      credits_used: creditsCost ?? 1,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Deduct credits
  await supabase
    .from('users')
    .update({ credits_balance: profile.credits_balance - (creditsCost ?? 1) })
    .eq('id', user.id)

  await supabase.from('credit_transactions').insert({
    user_id: user.id,
    workspace_id: workspaceId,
    type: 'usage',
    amount: -(creditsCost ?? 1),
    description: `${type} generation`,
    related_generation_id: task.id,
  })

  return NextResponse.json({ task })
}
