import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'
import { moderatePrompt, MODERATION_ERROR_BODY } from '@/lib/moderation'
import { logger } from '@/lib/log'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Repurpose templates define how source content transforms into new formats
const REPURPOSE_TEMPLATES: Record<string, { systemPrompt: string; outputFormat: string }> = {
  'blog-to-twitter': {
    systemPrompt: `You are a social media expert. Transform the provided content into engaging Twitter/X threads.
Rules:
- Maximum 280 characters per tweet
- Use line breaks and emojis strategically
- Keep the core message but make it punchy and conversational
- Include relevant hashtags (2-3 max)
- If the source is long, create a thread of 3-7 tweets`,
    outputFormat: 'thread',
  },
  'blog-to-linkedin': {
    systemPrompt: `You are a LinkedIn content strategist. Transform the provided content into a professional LinkedIn post.
Rules:
- Hook in the first line (bold statement or question)
- Use short paragraphs (1-2 lines each)
- Professional but conversational tone
- Include a clear call-to-action at the end
- Add 3-5 relevant hashtags`,
    outputFormat: 'post',
  },
  'blog-to-instagram': {
    systemPrompt: `You are an Instagram content creator. Transform the provided content into an engaging Instagram caption.
Rules:
- Start with a strong hook
- Use line breaks and emojis for readability
- Keep it engaging and visual
- Include a call-to-action (save, share, comment)
- Add 5-10 relevant hashtags at the end`,
    outputFormat: 'caption',
  },
  'blog-to-newsletter': {
    systemPrompt: `You are an email marketing specialist. Transform the provided content into a compelling newsletter email.
Rules:
- Start with a catchy subject line
- Personal greeting
- Structure with clear sections
- Include a clear CTA button text suggestion
- Professional yet warm tone
- Add a P.S. section for extra engagement`,
    outputFormat: 'email',
  },
  'blog-to-youtube': {
    systemPrompt: `You are a YouTube content strategist. Transform the provided content into a YouTube video script and metadata.
Rules:
- Write a compelling video title
- Create a 60-second hook/intro
- Outline the main points as script segments
- Suggest a video description (SEO optimized)
- Include chapter markers with timestamps`,
    outputFormat: 'script',
  },
  'video-to-blog': {
    systemPrompt: `You are a content writer. Transform the provided video transcript/description into a comprehensive blog post.
Rules:
- Create a compelling title
- Write an engaging introduction
- Structure with clear H2/H3 headings
- Use bullet points and numbered lists where appropriate
- Include a strong conclusion with CTA
- Add a TL;DR summary at the top`,
    outputFormat: 'article',
  },
  'image-to-copy': {
    systemPrompt: `You are a copywriter. Based on the provided image description, generate marketing copy.
Rules:
- Create 3 variations of headline copy
- Write supporting body copy for each
- Adapt tone for social media platforms
- Include CTAs for each variation`,
    outputFormat: 'variations',
  },
  'music-to-promo': {
    systemPrompt: `You are a music marketing specialist. Based on the provided music track details, create promotional content.
Rules:
- Write a Spotify-style track description
- Create social media posts for the release
- Write a press release blurb
- Generate platform-specific captions (Instagram, Twitter, TikTok)`,
    outputFormat: 'promo-pack',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceContent, sourceType, template, brandContext } = body

    if (!sourceContent) {
      return NextResponse.json(
        { error: 'Source content is required' },
        { status: 400 }
      )
    }

    if (!template || !REPURPOSE_TEMPLATES[template]) {
      return NextResponse.json(
        { error: 'Invalid template. Choose a valid repurpose format.' },
        { status: 400 }
      )
    }

    const tpl = REPURPOSE_TEMPLATES[template]

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moderation = moderatePrompt(sourceContent)
    if (!moderation.ok) {
      logger.warn('repurpose source blocked', { userId: user.id, category: moderation.category })
      return NextResponse.json(MODERATION_ERROR_BODY(moderation), { status: 400 })
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, 'copy')
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, balance: creditResult.balanceAfter },
        { status: 402 }
      )
    }

    // Build system prompt with optional brand context
    let systemPrompt = tpl.systemPrompt
    if (brandContext) {
      systemPrompt += `\n\nBrand context: ${brandContext}`
    }

    // Call Claude to repurpose
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the source content (${sourceType}) to repurpose:\n\n${sourceContent}`,
        },
      ],
    })

    const repurposedContent = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n')

    // Save to generation_tasks table
    const { data: workspaceMember } = await (supabase as any)
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single()

    await (supabase as any).from('generation_tasks').insert({
      user_id: user.id,
      workspace_id: workspaceMember?.workspace_id ?? null,
      type: 'copy',
      prompt: `Repurpose ${sourceType} using ${template} template`,
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
      model_used: 'claude-sonnet-4-6',
      credits_used: CREDIT_COSTS.copy,
      parameters: {
        kind: 'repurpose',
        template,
        output_format: tpl.outputFormat,
        source_type: sourceType,
        source_content: sourceContent.substring(0, 2000),
        output: repurposedContent,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        repurposedContent,
        outputFormat: tpl.outputFormat,
        template,
      },
      creditsUsed: CREDIT_COSTS.copy,
      balance: creditResult.balanceAfter,
    })
  } catch (error: any) {
    console.error('Repurpose error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to repurpose content' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return available templates
  const templates = Object.entries(REPURPOSE_TEMPLATES).map(([key, tpl]) => ({
    id: key,
    name: key.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' → '),
    outputFormat: tpl.outputFormat,
  }))

  return NextResponse.json({ success: true, data: { templates } })
}
