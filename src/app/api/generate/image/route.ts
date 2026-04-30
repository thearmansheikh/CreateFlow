import Replicate from "replicate"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deductCredits, CREDIT_COSTS } from "@/lib/credits"
import { saveGeneration } from "@/lib/save-generation"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: false,
})

export async function POST(req: NextRequest) {
  console.log("=== IMAGE GEN ROUTE STARTED ===")

  try {
    const body = await req.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const { prompt, aspectRatio, style, numOutputs = 1, workspaceId, brandContext } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Auth & workspace check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Deduct credits before generating
    const creditResult = await deductCredits(user.id, "image")
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, balance: creditResult.balanceAfter },
        { status: 402 }
      )
    }

    // Build prompt with optional brand context
    let enhancedPrompt = prompt
    if (brandContext) {
        enhancedPrompt = `${prompt}. ${brandContext}`
      } else if (style) {
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

    // Save to database
    await saveGeneration({
      userId: user.id,
      workspaceId,
      type: "image",
      title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
      prompt: enhancedPrompt,
      outputUrl: images[0],
      modelUsed: "flux-schnell",
      mimeType: "image/png",
      width: dim.width,
      height: dim.height,
    })

    return NextResponse.json({
      success: true,
      images,
      model: "flux-schnell",
      creditsUsed: 3,
      balance: creditResult.balanceAfter,
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
