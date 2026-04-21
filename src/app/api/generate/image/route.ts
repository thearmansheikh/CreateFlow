import Replicate from "replicate"
import { NextRequest, NextResponse } from "next/server"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: false,
})

export async function POST(req: NextRequest) {
  console.log("=== IMAGE GEN ROUTE STARTED ===")

  try {
    const body = await req.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const { prompt, aspectRatio, style, numOutputs = 1 } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Build prompt
    let enhancedPrompt = prompt
    if (style) {
      enhancedPrompt = `${prompt}, ${style} style`
    }

    // Dimensions
    const dimensions: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1344, height: 768 },
      "9:16": { width: 768, height: 1344 },
      "4:3": { width: 1152, height: 896 },
      "3:2": { width: 1216, height: 832 },
    }
    const dim = dimensions[aspectRatio] || dimensions["1:1"]

    console.log("Calling Replicate with prompt:", enhancedPrompt)
    console.log("Dimensions:", dim.width, "x", dim.height)

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: enhancedPrompt,
          width: dim.width,
          height: dim.height,
          num_outputs: Math.min(numOutputs, 4),
        },
      }
    )

    console.log("Raw Replicate output type:", typeof output)
    console.log("Raw output (first 200 chars):", JSON.stringify(output).slice(0, 200))

    // Normalize
    const images: string[] = Array.isArray(output)
      ? output
          .map((item: any) => {
            if (typeof item === "string") return item
            if (item?.url) return item.url
            return String(item)
          })
          .filter(Boolean)
      : typeof output === "string"
        ? [output]
        : []

    console.log("Normalized images:", images)

    return NextResponse.json({
      success: true,
      images,
      model: "flux-schnell",
    })
  } catch (error: any) {
    console.error("=== IMAGE GEN ERROR ===")
    console.error("Error:", error.message)
    console.error("Stack:", error.stack)
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    )
  }
}
