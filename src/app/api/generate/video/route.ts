// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'

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
    const { prompt, duration = 6, resolution = '768P' } = body

    // Normalize resolution
    const normalizedResolution = resolution === '1080p' ? '1080P' : '768P'
    const normalizedDuration = duration === 10 ? 10 : 6

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'MINIMAX_API_KEY not configured' }, { status: 500 })
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deduct credits before creating task
    const creditResult = await deductCredits(user.id, 'video')
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error, balance: creditResult.balanceAfter }, { status: 402 })
    }

    const { task_id, base_resp } = await createVideoTask(prompt, normalizedDuration, normalizedResolution)

    if (base_resp?.status_code !== 0) {
      return NextResponse.json({ error: base_resp.status_msg || 'Failed to create video task' }, { status: 500 })
    }

    console.log(`[MiniMax Video] Task created: ${task_id}`)

    return NextResponse.json({
      success: true,
      taskId: task_id,
      model: MODEL,
      creditsUsed: CREDIT_COSTS.video,
      balance: creditResult.balanceAfter,
    })
  } catch (error: any) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    )
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
  } catch (error: any) {
    console.error('Video query error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to query video task' },
      { status: 500 }
    )
  }
}
