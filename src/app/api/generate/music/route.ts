import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'

const BASE_URL = 'https://api.minimax.io'
const API_KEY = process.env.MINIMAX_API_KEY
const MODEL = 'music-2.6-free'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, lyrics, instrumental = false } = body

    if (!prompt && !lyrics) {
      return NextResponse.json({ error: 'Prompt or lyrics are required' }, { status: 400 })
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

    // Deduct credits before generating
    const creditResult = await deductCredits(user.id, 'music')
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error, balance: creditResult.balanceAfter }, { status: 402 })
    }

    // Music generation is synchronous — returns hex-encoded audio
    const res = await fetch(`${BASE_URL}/v1/music_generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt || undefined,
        lyrics: lyrics || undefined,
        is_instrumental: instrumental,
        output_format: 'hex',
        lyrics_optimizer: !lyrics && !instrumental,
        audio_setting: {
          sample_rate: 44100,
          bitrate: 256000,
          format: 'mp3',
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.base_resp?.status_msg || `MiniMax API error: ${res.status}` },
        { status: 500 }
      )
    }

    const data = await res.json()

    if (data.base_resp?.status_code !== 0) {
      return NextResponse.json({ error: data.base_resp.status_msg || 'Music generation failed' }, { status: 500 })
    }

    if (data.data?.status !== 2) {
      return NextResponse.json({ error: 'Music generation incomplete' }, { status: 500 })
    }

    const hexAudio = data.data.audio
    if (!hexAudio) {
      return NextResponse.json({ error: 'No audio data returned' }, { status: 500 })
    }

    // Convert hex to base64 for browser audio playback
    const buffer = Buffer.from(hexAudio, 'hex')
    const base64 = buffer.toString('base64')
    const dataUrl = `data:audio/mp3;base64,${base64}`

    return NextResponse.json({
      success: true,
      audioUrl: dataUrl,
      model: MODEL,
      duration: data.extra_info?.music_duration || 0,
      creditsUsed: CREDIT_COSTS.music,
      balance: creditResult.balanceAfter,
    })
  } catch (error: any) {
    console.error('Music generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate music' },
      { status: 500 }
    )
  }
}
