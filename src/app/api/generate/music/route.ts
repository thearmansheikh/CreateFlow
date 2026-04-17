import { NextRequest, NextResponse } from 'next/server'

// Suno API (not on Replicate, direct API)
const SUNO_API_BASE = 'https://api.suno.ai/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      style = 'electronic',
      instrumental = true,
      duration = 30,
      lyrics, // optional for vocal tracks
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Suno API call
    const response = await fetch(`${SUNO_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        make_instrumental: instrumental,
        style,
        wait_audio: false, // async, we'll poll for status
      }),
    })

    if (!response.ok) {
      throw new Error(`Suno API error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      taskId: data.id,
      model: 'suno-v3.5',
      creditsUsed: 10,
      message: 'Music generation started. Poll /api/generate/music/status/{id} for completion.',
    })
  } catch (error: any) {
    console.error('Music generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate music' },
      { status: 500 }
    )
  }
}

// Status polling endpoint
export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId')
  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${SUNO_API_BASE}/feed/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Suno API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    )
  }
}
