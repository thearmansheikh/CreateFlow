import Replicate from 'replicate'
import { NextRequest, NextResponse } from 'next/server'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      negativePrompt,
      duration = 5,
      resolution = '720p',
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const output = await replicate.run(
      'kingfischer/kling-1.5',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt || '',
          duration,
          resolution: resolution === '1080p' ? '1080p' : '720p',
          mode: 'std',
        },
      }
    )

    const videoUrl = Array.isArray(output) ? output[0] : typeof output === 'string' ? output : String(output)

    return NextResponse.json({
      success: true,
      videoUrl,
      model: 'kling-1.5',
      creditsUsed: 10,
    })
  } catch (error: any) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    )
  }
}
