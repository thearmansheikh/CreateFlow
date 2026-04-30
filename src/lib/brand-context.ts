/**
 * Brand context utilities — build rich, structured brand context
 * from a brand profile for use in AI generation prompts.
 */

export interface FullBrandContext {
  id: string
  name: string
  description: string | null
  voice_tone: { tone?: string; personality?: string; language?: string } | null
  visual_style: { mood?: string; complexity?: string } | null
  brand_colors: string[] | null
  brand_fonts: string[] | null
  brand_examples: string[] | null
  logo_url: string | null
}

/**
 * Build a rich brand context string for AI prompts.
 * Includes voice, tone, personality, visual style, colors, fonts,
 * and example references when available.
 */
export function buildFullBrandContext(brand: FullBrandContext | null): string | undefined {
  if (!brand) return undefined

  const sections: string[] = []

  // Brand identity
  sections.push(`Brand: "${brand.name}"`)
  if (brand.description) {
    sections.push(`About: ${brand.description}`)
  }

  // Voice & tone
  const voiceParts: string[] = []
  if (brand.voice_tone?.tone) voiceParts.push(`Tone: ${brand.voice_tone.tone}`)
  if (brand.voice_tone?.personality) voiceParts.push(`Personality: ${brand.voice_tone.personality}`)
  if (brand.voice_tone?.language) voiceParts.push(`Language: ${brand.voice_tone.language}`)
  if (voiceParts.length > 0) {
    sections.push(`Voice: ${voiceParts.join(", ")}`)
  }

  // Visual style
  const visualParts: string[] = []
  if (brand.visual_style?.mood) visualParts.push(`Mood: ${brand.visual_style.mood}`)
  if (brand.visual_style?.complexity) visualParts.push(`Complexity: ${brand.visual_style.complexity}`)
  if (visualParts.length > 0) {
    sections.push(`Visual style: ${visualParts.join(", ")}`)
  }

  // Colors
  if (brand.brand_colors && brand.brand_colors.length > 0) {
    sections.push(`Brand colors: ${brand.brand_colors.join(", ")}`)
  }

  // Fonts
  if (brand.brand_fonts && brand.brand_fonts.length > 0) {
    sections.push(`Typography: ${brand.brand_fonts.join(", ")}`)
  }

  // Examples (references for style matching)
  if (brand.brand_examples && brand.brand_examples.length > 0) {
    sections.push(
      `Style examples (match these aesthetics): ${brand.brand_examples.join("; ")}`
    )
  }

  return sections.join(". ")
}

/**
 * Build a visual-specific brand context for image/video generation.
 * Focuses on colors, visual style, mood, and example aesthetics.
 */
export function buildVisualBrandContext(brand: FullBrandContext | null): string | undefined {
  if (!brand) return undefined

  const sections: string[] = []

  if (brand.visual_style?.mood) {
    sections.push(`Overall mood: ${brand.visual_style.mood}`)
  }
  if (brand.visual_style?.complexity) {
    sections.push(`Visual complexity: ${brand.visual_style.complexity}`)
  }
  if (brand.brand_colors && brand.brand_colors.length > 0) {
    sections.push(`Use these colors: ${brand.brand_colors.join(", ")}`)
  }
  if (brand.brand_fonts && brand.brand_fonts.length > 0) {
    sections.push(`Typography style: ${brand.brand_fonts.join(", ")}`)
  }
  if (brand.brand_examples && brand.brand_examples.length > 0) {
    sections.push(
      `Reference examples (match this visual style): ${brand.brand_examples.join("; ")}`
    )
  }

  if (sections.length === 0) return undefined
  return sections.join(". ")
}

/**
 * Build a voice-specific brand context for copy/music generation.
 * Focuses on tone, personality, language, and voice description.
 */
export function buildVoiceBrandContext(brand: FullBrandContext | null): string | undefined {
  if (!brand) return undefined

  const sections: string[] = []

  if (brand.description) {
    sections.push(`Brand description: ${brand.description}`)
  }
  const voiceParts: string[] = []
  if (brand.voice_tone?.tone) voiceParts.push(brand.voice_tone.tone)
  if (brand.voice_tone?.personality) voiceParts.push(`${brand.voice_tone.personality} personality`)
  if (voiceParts.length > 0) {
    sections.push(`Voice: ${voiceParts.join(", ")}`)
  }
  if (brand.voice_tone?.language) {
    sections.push(`Language: ${brand.voice_tone.language}`)
  }
  if (brand.brand_examples && brand.brand_examples.length > 0) {
    sections.push(
      `Reference examples (match this voice/style): ${brand.brand_examples.join("; ")}`
    )
  }

  if (sections.length === 0) return undefined
  return sections.join(". ")
}
