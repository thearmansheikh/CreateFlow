import Replicate from "replicate"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deductCredits, CREDIT_COSTS } from "@/lib/credits"
import { saveGeneration } from "@/lib/save-generation"
import { buildVisualBrandContext, type FullBrandContext } from "@/lib/brand-context"
import { checkGenerationLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/log"
import { moderatePrompt, MODERATION_ERROR_BODY } from "@/lib/moderation"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: false,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, aspectRatio, style, numOutputs = 1, workspaceId, brandContext, brandProfile } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Auth & workspace check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const limit = checkGenerationLimit(user.id)
    if (!limit.ok) {
      return NextResponse.json(limit.body, { status: limit.status, headers: limit.headers })
    }

    const moderation = moderatePrompt(prompt)
    if (!moderation.ok) {
      logger.warn("image prompt blocked", { userId: user.id, category: moderation.category })
      return NextResponse.json(MODERATION_ERROR_BODY(moderation), { status: 400 })
    }

    // Deduct credits before generating
    const creditResult = await deductCredits(user.id, "image")
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, balance: creditResult.balanceAfter },
        { status: 402 }
      )
    }

    // Build rich visual brand context from full profile or fall back to legacy context string
    const visualContext = brandProfile
      ? buildVisualBrandContext(brandProfile as FullBrandContext)
      : undefined

    // Enhance prompt with full brand context (colors, mood, fonts, examples)
    let enhancedPrompt = prompt
    if (visualContext) {
      enhancedPrompt = `${prompt}. ${visualContext}`
    } else if (brandContext) {
      // Legacy: brandContext was just a string
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

    logger.debug("image generation start", {
      aspectRatio,
      width: dim.width,
      height: dim.height,
      numOutputs,
    })

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

    logger.debug("image generation complete", { count: images.length })

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
      enhancedPrompt: enhancedPrompt !== prompt ? enhancedPrompt : undefined,
    })
  } catch (error) {
    logger.error("image generation failed", error)
    const message = error instanceof Error ? error.message : "Failed to generate image"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
