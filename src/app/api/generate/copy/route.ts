import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
      brandContext, // optional brand voice context
      maxLength = 500,
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = `You are a professional copywriter specializing in ${type === 'caption' ? 'social media content' : type === 'blog' ? 'long-form blog content' : type === 'tweet' ? 'Twitter/X posts' : type === 'email' ? 'email marketing' : 'product descriptions'}. 
${brandContext ? `Match the brand voice: ${brandContext}.` : 'Use a professional and engaging tone.'}
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

    return NextResponse.json({
      success: true,
      content,
      model: 'claude-sonnet-4-20250514',
      creditsUsed: 1,
    })
  } catch (error: any) {
    console.error('Copy generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate copy' },
      { status: 500 }
    )
  }
}
