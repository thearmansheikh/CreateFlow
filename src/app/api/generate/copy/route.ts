import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'
import { saveGeneration } from '@/lib/save-generation'
import { buildVoiceBrandContext, type FullBrandContext } from '@/lib/brand-context'
import { checkGenerationLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/log'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      type = 'caption', // caption, blog, tweet, email, product-description
      tone = 'professional',
      brandContext, // legacy: string-only brand context
      brandProfile, // new: full brand profile object
      maxLength = 500,
      workspaceId,
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = checkGenerationLimit(user.id)
    if (!limit.ok) {
      return NextResponse.json(limit.body, { status: limit.status, headers: limit.headers })
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, 'copy')
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error, balance: creditResult.balanceAfter }, { status: 402 })
    }

    // Build rich brand context from full profile if available, fall back to legacy string
    const richBrandContext = brandProfile
      ? buildVoiceBrandContext(brandProfile as FullBrandContext)
      : brandContext

    const systemPrompt = `You are a professional copywriter specializing in ${type === 'caption' ? 'social media content' : type === 'blog' ? 'long-form blog content' : type === 'tweet' ? 'Twitter/X posts' : type === 'email' ? 'email marketing' : 'product descriptions'}. 
${richBrandContext ? `Match the brand voice and style: ${richBrandContext}.` : 'Use a professional and engaging tone.'}
${!richBrandContext ? `Tone: ${tone}.` : tone !== 'professional' ? `Tone should be: ${tone}.` : ''}
Keep responses under ${maxLength} characters unless the type requires longer content.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: Math.min(maxLength + 200, 4000),
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Write a ${type} for the following: ${prompt}` },
      ],
    })

    const content = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n')

    // Save generation record
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`

    await saveGeneration({
      userId: user.id,
      workspaceId,
      type: 'copy',
      title,
      prompt,
      outputText: content,
      modelUsed: 'claude-sonnet-4-20250514',
      mimeType: 'text/plain',
    })

    return NextResponse.json({
      success: true,
      content,
      model: 'claude-sonnet-4-20250514',
      creditsUsed: CREDIT_COSTS.copy,
      balance: creditResult.balanceAfter,
    })
  } catch (error: any) {
    console.error('Copy generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate copy' },
      { status: 500 }
    )
  }
}
