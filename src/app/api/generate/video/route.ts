import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'
import { saveGeneration } from '@/lib/save-generation'
import { buildVisualBrandContext, type FullBrandContext } from '@/lib/brand-context'
import { checkGenerationLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/log'
import { moderatePrompt, MODERATION_ERROR_BODY } from '@/lib/moderation'

const BASE_URL = 'https://api.minimax.io'
const API_KEY = process.env.MINIMAX_API_KEY
const MODEL = 'MiniMax-Hailuo-2.3'

async function createVideoTask(prompt: string, duration: number, resolution: string) {
  const body: Record<string, any> = {
    model: MODEL,
    prompt,
    duration,
    resolution,
  }
  const res = await fetch(`${BASE_URL}/v1/video_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.base_resp?.status_msg || `MiniMax API error: ${res.status}`)
  }

  return res.json()
}

async function queryVideoTask(taskId: string) {
  const res = await fetch(`${BASE_URL}/v1/query/video_generation?task_id=${taskId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  if (!res.ok) throw new Error(`Query failed: ${res.status}`)
  return res.json()
}

async function getFileUrl(fileId: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/files/retrieve?file_id=${fileId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  if (!res.ok) throw new Error(`File retrieve failed: ${res.status}`)
  const data = await res.json()
  return data.file?.download_url || data.file?.file_url || data.download_url || ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, duration = 6, resolution = '768P', brandContext, brandProfile, workspaceId } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'MINIMAX_API_KEY not configured' }, { status: 500 })
    }

    // Normalize resolution — UI sends '720p' or '1080p', MiniMax wants '768P' or '1080P'
    const normalizedResolution = resolution.toUpperCase().includes('1080') ? '1080P' : '768P'
    const normalizedDuration = duration === 10 ? 10 : 6

    // Build visual brand context from full profile or fall back to legacy string
    const visualContext = brandProfile
      ? buildVisualBrandContext(brandProfile as FullBrandContext)
      : brandContext

    // Build prompt with full brand context (colors, mood, style, examples)
    const enhancedPrompt = visualContext ? `${prompt}. ${visualContext}` : prompt

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

    const moderation = moderatePrompt(prompt)
    if (!moderation.ok) {
      logger.warn('video prompt blocked', { userId: user.id, category: moderation.category })
      return NextResponse.json(MODERATION_ERROR_BODY(moderation), { status: 400 })
    }

    // Deduct credits before creating task
    const creditResult = await deductCredits(user.id, 'video')
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error, balance: creditResult.balanceAfter }, { status: 402 })
    }

    const { task_id, base_resp } = await createVideoTask(enhancedPrompt, normalizedDuration, normalizedResolution)

    if (base_resp?.status_code !== 0) {
      return NextResponse.json({ error: base_resp.status_msg || 'Failed to create video task' }, { status: 500 })
    }

    logger.debug('video task created', { taskId: task_id })


    // Save generation record (processing)
    await saveGeneration({
      userId: user.id,
      workspaceId,
      type: 'video',
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      prompt: enhancedPrompt,
      modelUsed: MODEL,
      duration: normalizedDuration,
    })
    return NextResponse.json({
      success: true,
      taskId: task_id,
      model: MODEL,
      creditsUsed: CREDIT_COSTS.video,
      balance: creditResult.balanceAfter,
    })
  } catch (error) {
    logger.error('video generation failed', error)
    const message = error instanceof Error ? error.message : 'Failed to generate video'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'MINIMAX_API_KEY not configured' }, { status: 500 })
    }

    const result = await queryVideoTask(taskId)

    const statusStr = (result.status || '').toLowerCase()

    if (statusStr === 'success') {
      const fileId = result.file_id || result.data?.file_id
      if (fileId) {
        const videoUrl = await getFileUrl(fileId)
        return NextResponse.json({
          status: 'success',
          videoUrl,
          model: MODEL,
        })
      }
    }

    if (statusStr === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: result.base_resp?.status_msg || result.status_msg || 'Video generation failed',
      })
    }

    return NextResponse.json({
      status: 'processing',
      progress: result.progress || 0,
    })
  } catch (error) {
    logger.error('video query failed', error)
    const message = error instanceof Error ? error.message : 'Failed to query video task'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
