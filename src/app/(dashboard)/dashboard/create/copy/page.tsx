"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Sparkles,
  Wand2,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  Send,
  Mail,
  ShoppingBag,
  PenTool,
} from "lucide-react"
import { cn } from "@/lib/utils"

const contentTypes = [
  { label: "Caption", value: "caption", icon: MessageSquare, desc: "Social media captions" },
  { label: "Blog Post", value: "blog", icon: PenTool, desc: "Long-form articles" },
  { label: "Tweet", value: "tweet", icon: Send, desc: "X/Twitter posts" },
  { label: "Email", value: "email", icon: Mail, desc: "Email marketing" },
  { label: "Product Desc", value: "product-description", icon: ShoppingBag, desc: "E-commerce listings" },
]

const tones = [
  { label: "Professional", value: "professional" },
  { label: "Casual", value: "casual" },
  { label: "Witty", value: "witty" },
  { label: "Persuasive", value: "persuasive" },
  { label: "Friendly", value: "friendly" },
  { label: "Bold", value: "bold" },
]

const suggestions = {
  caption: [
    "Coffee shop morning routine post with latte art",
    "Behind-the-scenes at our design studio",
    "Product launch teaser for sustainable sneakers",
  ],
  blog: [
    "10 ways AI is changing content creation in 2025",
    "Why every small business needs a content strategy",
    "The ultimate guide to building a brand on Instagram",
  ],
  tweet: [
    "Hot take on remote work productivity",
    "Thread starter about building in public",
    "Quick tip for better content planning",
  ],
  email: [
    "Welcome email for new newsletter subscribers",
    "Flash sale announcement — 48 hours only",
    "Monthly product update for SaaS customers",
  ],
  "product-description": [
    "Wireless noise-cancelling headphones, premium audio",
    "Handmade ceramic coffee mug, artisan craftsmanship",
    "Minimalist leather backpack for professionals",
  ],
}

const maxLengthDefaults: Record<string, number> = {
  caption: 500,
  blog: 2000,
  tweet: 280,
  email: 1000,
  "product-description": 500,
}

export default function CopyGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState("caption")
  const [tone, setTone] = useState("professional")
  const [brandContext, setBrandContext] = useState("")
  const [maxLength, setMaxLength] = useState(500)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleTypeChange = (type: string) => {
    setContentType(type)
    setMaxLength(maxLengthDefaults[type] ?? 500)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/generate/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: contentType,
          tone,
          brandContext: brandContext.trim() || undefined,
          maxLength,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Generation failed")
        return
      }

      setResult(data.content || "")
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentSuggestions = suggestions[contentType as keyof typeof suggestions] ?? suggestions.caption
  const TypeIcon = contentTypes.find((t) => t.value === contentType)?.icon ?? FileText

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left Panel — Controls */}
        <div className="w-full space-y-6 border-r border-border/50 p-6 lg:w-96 lg:overflow-auto">
          <div>
            <h1 className="text-xl font-bold">Copy Generator</h1>
            <p className="text-sm text-muted-foreground">Write marketing copy and content with AI</p>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4" />
              Content Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.value}
                    onClick={() => handleTypeChange(t.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2.5 text-left transition-colors",
                      contentType === t.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    tone === t.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label>Prompt</Label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                contentType === "caption"
                  ? "Write an engaging Instagram caption for our new product launch..."
                  : contentType === "blog"
                    ? "A comprehensive guide about content strategy for small businesses..."
                    : contentType === "tweet"
                      ? "Share a quick tip about time management for creators..."
                      : contentType === "email"
                        ? "Welcome new subscribers and introduce our brand..."
                        : "Describe a premium leather notebook for creative professionals..."
              }
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </div>

          {/* Brand Context */}
          <div className="space-y-2">
            <Label>Brand Voice Context (optional)</Label>
            <textarea
              value={brandContext}
              onChange={(e) => setBrandContext(e.target.value)}
              placeholder="Our brand is youthful, bold, and sustainability-focused. We speak directly to Gen Z..."
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </div>

          {/* Max Length */}
          <div className="space-y-2">
            <Label>Max Length: {maxLength} chars</Label>
            <Input
              type="range"
              min={100}
              max={maxLengthDefaults[contentType] ? Math.min(maxLengthDefaults[contentType] * 3, 4000) : 4000}
              step={50}
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value))}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>100</span>
              <span>{Math.min((maxLengthDefaults[contentType] ?? 500) * 3, 4000)}</span>
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
                Writing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Copy
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

          {!result && !isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium">Your copy will appear here</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Describe what you need and click Generate to create AI-written copy.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {currentSuggestions.map((suggestion) => (
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
              <p className="text-sm text-muted-foreground">Writing your copy...</p>
              <p className="mt-1 text-xs text-muted-foreground">This usually takes a few seconds</p>
            </div>
          ) : result ? (
            <Card className="max-w-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {contentTypes.find((t) => t.value === contentType)?.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {tone} · {result.length} chars
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardContent className="p-5">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{result}</pre>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
