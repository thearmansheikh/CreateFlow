/**
 * Industry-specific brand template presets — pre-configured brand kits
 * for common industries. Each preset includes colours, typography,
 * voice & tone, visual mood, and starter copy examples.
 */

export interface BrandTemplate {
  id: string
  label: string
  emoji: string
  description: string
  colors: string[]
  tone: string
  personality: string
  mood: string
  fonts: string[]
  examples: string[]
  suggestedDescription: string
}

export const brandTemplates: BrandTemplate[] = [
  {
    id: "saas",
    label: "SaaS / Tech",
    emoji: "💻",
    description: "Clean, modern, and authoritative — builds trust through clarity",
    colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#e0e7ff", "#f8fafc"],
    tone: "professional",
    personality: "authoritative",
    mood: "modern",
    fonts: ["Inter", "Geist", "System UI"],
    examples: [
      "Ship faster. Scale smarter. Build with confidence.",
      "Everything your team needs, nothing it doesn't.",
    ],
    suggestedDescription: "Modern SaaS platform with clean, data-driven communication",
  },
  {
    id: "food",
    label: "Food & Beverage",
    emoji: "🍽️",
    description: "Warm, appetizing, and casual — makes people hungry",
    colors: ["#f97316", "#ef4444", "#eab308", "#fef3c7", "#fff7ed"],
    tone: "casual",
    personality: "friendly",
    mood: "playful",
    fonts: ["Poppins", "Nunito", "System UI"],
    examples: [
      "Fresh ingredients, bold flavors, made with love.",
      "From farm to fork — taste the difference.",
    ],
    suggestedDescription: "Food brand with vibrant, appetizing visual identity",
  },
  {
    id: "fashion",
    label: "Fashion & Lifestyle",
    emoji: "👗",
    description: "Elegant, minimal, and aspirational — luxury without shouting",
    colors: ["#18181b", "#d4a574", "#f5f5f5", "#e8e0d8", "#fafaf9"],
    tone: "formal",
    personality: "minimal",
    mood: "elegant",
    fonts: ["Playfair Display", "Cormorant", "Inter"],
    examples: [
      "Effortless style for the modern wardrobe.",
      "Designed to be noticed. Crafted to be remembered.",
    ],
    suggestedDescription: "High-end fashion brand with understated elegance",
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    emoji: "💪",
    description: "Bold, energetic, and motivational — pushes people to act",
    colors: ["#22c55e", "#16a34a", "#1e3a2f", "#0f172a", "#f0fdf4"],
    tone: "inspirational",
    personality: "bold",
    mood: "bold",
    fonts: ["Montserrat", "Roboto Condensed", "Inter"],
    examples: [
      "Your body can stand almost anything. It's your mind you have to convince.",
      "Stronger every day. No excuses.",
    ],
    suggestedDescription: "Fitness brand with high-energy, motivational messaging",
  },
  {
    id: "beauty",
    label: "Beauty & Skincare",
    emoji: "✨",
    description: "Soft, warm, and inviting — feels personal and nurturing",
    colors: ["#f43f5e", "#fb7185", "#fda4af", "#fff1f2", "#fdf2f8"],
    tone: "playful",
    personality: "warm",
    mood: "modern",
    fonts: ["Quicksand", "Lato", "System UI"],
    examples: [
      "Glow from the inside out.",
      "Skincare that loves you back.",
    ],
    suggestedDescription: "Beauty brand with playful, nurturing voice and soft palette",
  },
  {
    id: "finance",
    label: "Finance & Fintech",
    emoji: "🏦",
    description: "Trustworthy, stable, and professional — money matters demand confidence",
    colors: ["#0c4a6e", "#0369a1", "#0ea5e9", "#e0f2fe", "#f8fafc"],
    tone: "professional",
    personality: "authoritative",
    mood: "minimal",
    fonts: ["Inter", "Source Sans Pro", "System UI"],
    examples: [
      "Smart money management, simplified.",
      "Your financial future, in your hands.",
    ],
    suggestedDescription: "Financial services brand built on trust and clarity",
  },
  {
    id: "education",
    label: "Education & EdTech",
    emoji: "📚",
    description: "Encouraging, clear, and growth-focused — makes learning accessible",
    colors: ["#2563eb", "#3b82f6", "#93c5fd", "#dbeafe", "#eff6ff"],
    tone: "casual",
    personality: "friendly",
    mood: "modern",
    fonts: ["Open Sans", "Nunito", "Inter"],
    examples: [
      "Learn at your pace. Grow at your speed.",
      "Education that adapts to you.",
    ],
    suggestedDescription: "Education platform with accessible, encouraging tone",
  },
  {
    id: "travel",
    label: "Travel & Adventure",
    emoji: "✈️",
    description: "Inspiring, vibrant, and wanderlust-driven — paints a picture of escape",
    colors: ["#0891b2", "#06b6d4", "#67e8f9", "#ecfeff", "#f0fdfa"],
    tone: "inspirational",
    personality: "warm",
    mood: "bold",
    fonts: ["Poppins", "Raleway", "System UI"],
    examples: [
      "Where will your next adventure take you?",
      "Explore more. Worry less.",
    ],
    suggestedDescription: "Travel brand that inspires exploration and adventure",
  },
  {
    id: "agency",
    label: "Creative Agency",
    emoji: "🎨",
    description: "Bold, creative, and confident — showcases design expertise",
    colors: ["#ec4899", "#f43f5e", "#f97316", "#fef2f2", "#fdf4ff"],
    tone: "casual",
    personality: "witty",
    mood: "bold",
    fonts: ["Space Grotesk", "Inter", "System UI"],
    examples: [
      "We make brands people can't ignore.",
      "Creative that converts. Design that delivers.",
    ],
    suggestedDescription: "Creative agency with bold, confident brand presence",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    emoji: "🏥",
    description: "Calm, trustworthy, and caring — puts patients at ease",
    colors: ["#0d9488", "#14b8a6", "#99f6e4", "#f0fdfa", "#f8fafc"],
    tone: "professional",
    personality: "warm",
    mood: "minimal",
    fonts: ["Inter", "Source Sans Pro", "System UI"],
    examples: [
      "Caring for your health, every step of the way.",
      "Trusted care. Modern medicine.",
    ],
    suggestedDescription: "Healthcare brand with calm, professional, caring voice",
  },
  {
    id: "realestate",
    label: "Real Estate",
    emoji: "🏠",
    description: "Premium, reliable, and lifestyle-focused — sells a dream",
    colors: ["#1e3a5f", "#3b82f6", "#d4a574", "#f8f5f0", "#fafaf9"],
    tone: "formal",
    personality: "authoritative",
    mood: "elegant",
    fonts: ["Playfair Display", "Lato", "Inter"],
    examples: [
      "Find your place. Build your future.",
      "Luxury living, reimagined.",
    ],
    suggestedDescription: "Premium real estate brand with elegant, trustworthy positioning",
  },
  {
    id: "ecommerce",
    label: "E-Commerce / Retail",
    emoji: "🛍️",
    description: "Vibrant, action-oriented, and customer-first — drives purchases",
    colors: ["#dc2626", "#f59e0b", "#16a34a", "#fef2f2", "#f0fdf4"],
    tone: "casual",
    personality: "friendly",
    mood: "modern",
    fonts: ["Inter", "Poppins", "System UI"],
    examples: [
      "Shop the latest. Get it fast. Love it forever.",
      "Deals you'll love, delivered to your door.",
    ],
    suggestedDescription: "E-commerce brand with vibrant, conversion-focused identity",
  },
]

/**
 * Find a template by its ID.
 */
export function getBrandTemplate(id: string): BrandTemplate | undefined {
  return brandTemplates.find((t) => t.id === id)
}

/**
 * Apply a template to form state, returning the values to set.
 */
export function applyBrandTemplate(template: BrandTemplate) {
  return {
    colors: [...template.colors],
    tone: template.tone,
    personality: template.personality,
    mood: template.mood,
    fonts: template.fonts.join(", "),
    examples: [...template.examples],
    suggestedDescription: template.suggestedDescription,
  }
}
