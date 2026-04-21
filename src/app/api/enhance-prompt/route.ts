import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { prompt, brandContext, type = 'image' } = body

  try {
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // If no brand context, return original prompt
    if (!brandContext) {
      return NextResponse.json({ enhancedPrompt: prompt, creditsUsed: 0 })
    }

    const { name, voiceTone, visualStyle, brandColors } = brandContext

    const brandInstructions = `You are enhancing an image generation prompt for the brand "${name}".
Brand voice: ${voiceTone?.tone || 'professional'}, ${voiceTone?.personality || 'friendly'} personality.
Visual style: ${visualStyle?.mood || 'modern'}.
Brand colors: ${brandColors?.join(', ') || 'none specified'}.

Enhance the user's prompt by incorporating these brand characteristics into the visual description.
Make the prompt more detailed and brand-aligned. Return ONLY the enhanced prompt, nothing else.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: brandInstructions,
      messages: [
        { role: 'user', content: `Enhance this ${type} generation prompt for my brand: ${prompt}` },
      ],
    })

    const content = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n')

    return NextResponse.json({
      enhancedPrompt: content.trim() || prompt,
      creditsUsed: 1,
    })
  } catch (error: any) {
    console.error('Prompt enhancement error:', error)
    // Fallback: return original prompt
    return NextResponse.json({ enhancedPrompt: prompt, creditsUsed: 0 })
  }
}
