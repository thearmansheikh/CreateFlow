import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildVisualBrandContext, type FullBrandContext } from '@/lib/brand-context'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { prompt, brandContext, brandProfile, type = 'image' } = body

  try {
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // If no brand context, return original prompt
    if (!brandContext && !brandProfile) {
      return NextResponse.json({ enhancedPrompt: prompt, creditsUsed: 0 })
    }

    // Build rich brand context from full profile if available, fall back to legacy object
    const visualContext = brandProfile
      ? buildVisualBrandContext(brandProfile as FullBrandContext)
      : buildLegacyContext(brandContext)

    const brandInstructions = `You are enhancing a ${type} generation prompt for the brand.
${visualContext ? `${visualContext}.` : ''}

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

/** Build context string from legacy brand context object (for backward compat) */
function buildLegacyContext(ctx?: { name?: string; voiceTone?: any; visualStyle?: any; brandColors?: string[]; brandFonts?: string[]; brandExamples?: string[]; description?: string }): string | undefined {
  if (!ctx) return undefined
  const parts: string[] = []
  if (ctx.name) parts.push(`Brand: "${ctx.name}"`)
  if (ctx.description) parts.push(`About: ${ctx.description}`)
  if (ctx.voiceTone?.tone) parts.push(`Tone: ${ctx.voiceTone.tone}`)
  if (ctx.voiceTone?.personality) parts.push(`Personality: ${ctx.voiceTone.personality}`)
  if (ctx.visualStyle?.mood) parts.push(`Visual mood: ${ctx.visualStyle.mood}`)
  if (ctx.visualStyle?.complexity) parts.push(`Complexity: ${ctx.visualStyle.complexity}`)
  if (ctx.brandColors?.length) parts.push(`Brand colors: ${ctx.brandColors.join(', ')}`)
  if (ctx.brandFonts?.length) parts.push(`Typography: ${ctx.brandFonts.join(', ')}`)
  if (ctx.brandExamples?.length) parts.push(`Style references: ${ctx.brandExamples.join('; ')}`)
  return parts.length > 0 ? parts.join('. ') : undefined
}
