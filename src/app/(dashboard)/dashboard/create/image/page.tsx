"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { BrandSelector } from "@/components/brand-selector"
import {
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Loader2,
  Square,
  Palette,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandContext {
  id: string
  name: string
  description: string | null
  voice_tone: { tone?: string; personality?: string } | null
  visual_style: { mood?: string; complexity?: string } | null
  brand_colors: string[] | null
  typography: { primary_font?: string; secondary_font?: string } | null
  logo_url: string | null
}

function buildBrandContext(brand: BrandContext | null): string | undefined {
  if (!brand) return undefined
  const parts: string[] = []
  if (brand.description) parts.push(brand.description)
  if (brand.visual_style?.mood) parts.push(`Visual mood: ${brand.visual_style.mood}`)
  if (brand.brand_colors?.length) parts.push(`Colors: ${brand.brand_colors.join(", ")}`)
  return parts.join(". ")
}

const aspectRatios = [
  { label: "1:1", value: "1:1", w: 1024, h: 1024, icon: "⬜" },
  { label: "16:9", value: "16:9", w: 1344, h: 768, icon: "🖼️" },
  { label: "9:16", value: "9:16", w: 768, h: 1344, icon: "📱" },
  { label: "4:3", value: "4:3", w: 1152, h: 896, icon: "📺" },
  { label: "3:2", value: "3:2", w: 1216, h: 832, icon: "📷" },
]

const stylePresets = [
  { label: "Photorealistic", value: "photorealistic", desc: "Lifelike photography" },
  { label: "Digital Art", value: "digital-art", desc: "Stylized illustration" },
  { label: "Anime", value: "anime", desc: "Japanese animation" },
  { label: "Oil Painting", value: "oil-painting", desc: "Classical oil texture" },
  { label: "Watercolor", value: "watercolor", desc: "Soft watercolor wash" },
  { label: "3D Render", value: "3d-render", desc: "CGI 3D look" },
  { label: "Minimalist", value: "minimalist", desc: "Clean, simple" },
  { label: "Cinematic", value: "cinematic", desc: "Dramatic lighting" },
]

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [style, setStyle] = useState<string | null>(null)
  const [numImages, setNumImages] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<BrandContext | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt,
          aspectRatio,
          style,
          numOutputs: numImages,
            brandContext: buildBrandContext(selectedBrand),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Generation failed")
        return
      }

      setGeneratedImages(data.images || [])
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left Panel — Controls */}
        <div className="w-full space-y-4 sm:space-y-6 border-b lg:border-b-0 lg:border-r border-border/50 p-4 sm:p-6 lg:w-96 lg:overflow-auto">
          <div>
            <h1 className="text-xl font-bold">Image Generator</h1>
            <p className="text-sm text-muted-foreground">Create AI images from text prompts</p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label>Prompt</Label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene mountain landscape at golden hour with dramatic clouds..."
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </div>

          {/* Brand Selector */}
          <BrandSelector
            selectedBrand={selectedBrand}
            onChange={setSelectedBrand}
            label="Brand Style"
          />

          {/* Negative prompt */}
          <div className="space-y-2">
            <Label>Negative Prompt (optional)</Label>
            <Input
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, watermark..."
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Style Preset
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {stylePresets.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(style === s.value ? null : s.value)}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-colors",
                    style === s.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Aspect Ratio
            </Label>
            <div className="flex gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors",
                    aspectRatio === ar.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span className="text-sm">{ar.icon}</span>
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Number of images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Number of Images
            </Label>
            <div className="flex gap-2">
              {[1, 2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumImages(n)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm transition-colors",
                    numImages === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Right Panel — Results */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {generatedImages.length === 0 && !isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <ImageIcon className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium">Your creations will appear here</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Enter a prompt and click Generate to create AI images.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "A cozy coffee shop interior, warm lighting",
                  "Futuristic city skyline at night, neon lights",
                  "Abstract geometric patterns in pastel colors",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    <Wand2 className="mr-1.5 inline h-3 w-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Creating your image...</p>
              <p className="mt-1 text-xs text-muted-foreground">This usually takes 10-30 seconds</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {generatedImages.map((url, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative aspect-square bg-secondary">
                    <img src={url} alt={`Generated ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="text-xs text-muted-foreground">
                      {aspectRatio} · {style || "Default"}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={url} download>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
