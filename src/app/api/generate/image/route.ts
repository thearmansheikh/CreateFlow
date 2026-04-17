import Replicate from "replicate"
import { NextRequest, NextResponse } from "next/server"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, aspectRatio, style, numOutputs = 1 } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let enhancedPrompt = prompt
    if (style) {
      enhancedPrompt = `${prompt}, ${style}`
    }
    if (negativePrompt) {
      enhancedPrompt = `${enhancedPrompt} --no ${negativePrompt}`
    }

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: enhancedPrompt,
          width: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1344 : aspectRatio === "9:16" ? 768 : 1152,
          height: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 768 : aspectRatio === "9:16" ? 1344 : 896,
          num_outputs: numOutputs,
          output_format: "webp",
          output_quality: 90,
        },
      }
    )

    return NextResponse.json({ success: true, images: output, model: "flux-schnell", creditsUsed: numOutputs })
  } catch (error: any) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}
