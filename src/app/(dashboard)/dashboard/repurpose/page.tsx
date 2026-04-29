"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BrandSelector } from "@/components/brand-selector"
import {
  RefreshCw,
  FileText,
  X,
  Globe,
  MessageSquare,
  Mail,
  PlayCircle,
  Video,
  Image as ImageIcon,
  Music as MusicIcon,
  Loader2,
  Copy,
  Check,
  Sparkles,
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

const sourceTypes = [
  { value: "blog", label: "Blog / Article", icon: FileText },
  { value: "video", label: "Video Transcript", icon: Video },
  { value: "image", label: "Image / Visual", icon: ImageIcon },
  { value: "music", label: "Music Track", icon: MusicIcon },
]

const templates = [
  { id: "blog-to-twitter", label: "Twitter/X Thread", icon: X, from: "blog" },
  { id: "blog-to-linkedin", label: "LinkedIn Post", icon: Globe, from: "blog" },
  { id: "blog-to-instagram", label: "Instagram Caption", icon: MessageSquare, from: "blog" },
  { id: "blog-to-newsletter", label: "Newsletter Email", icon: Mail, from: "blog" },
  { id: "blog-to-youtube", label: "YouTube Script", icon: PlayCircle, from: "blog" },
  { id: "video-to-blog", label: "Blog Post", icon: FileText, from: "video" },
  { id: "image-to-copy", label: "Marketing Copy", icon: FileText, from: "image" },
  { id: "music-to-promo", label: "Promo Pack", icon: FileText, from: "music" },
]

export default function RepurposePage() {
  const [sourceType, setSourceType] = useState("blog")
  const [sourceContent, setSourceContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<BrandContext | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [outputFormat, setOutputFormat] = useState<string | null>(null)

  const filteredTemplates = templates.filter((t) => t.from === sourceType)

  const handleGenerate = useCallback(async () => {
    if (!sourceContent.trim() || !selectedTemplate) return
    setIsGenerating(true)
    setError(null)
    setOutput("")

    try {
      const brandCtx = selectedBrand
        ? `${selectedBrand.name}: ${selectedBrand.description || ""}`
        : undefined

      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent: sourceContent.trim(),
          sourceType,
          template: selectedTemplate,
          brandContext: brandCtx,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 402) {
          setError(`Insufficient credits. Balance: ${data.balance ?? 0}`)
          setBalance(data.balance)
        } else {
          setError(data.error || "Failed to repurpose content")
        }
        return
      }

      setOutput(data.data.repurposedContent)
      setOutputFormat(data.data.outputFormat)
      setBalance(data.balance)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }, [sourceContent, sourceType, selectedTemplate, selectedBrand])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left Panel — Controls */}
        <div className="w-full border-r border-border/50 lg:w-96 xl:w-[28rem]">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-border/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Repurpose Engine</h1>
                  <p className="text-sm text-muted-foreground">
                    Transform content across platforms
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Source Type */}
              <div className="space-y-2">
                <Label>Source Content Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {sourceTypes.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.value}
                        onClick={() => {
                          setSourceType(t.value)
                          setSelectedTemplate(null)
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                          sourceType === t.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Source Content */}
              <div className="space-y-2">
                <Label>Source Content</Label>
                <Textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder={
                    sourceType === "blog"
                      ? "Paste your blog post or article content here..."
                      : sourceType === "video"
                        ? "Paste your video transcript or description..."
                        : sourceType === "image"
                          ? "Describe the image or paste its metadata..."
                          : "Describe your music track, genre, mood..."
                  }
                  className="min-h-[180px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {sourceContent.length} characters
                </p>
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <Label>Transform To</Label>
                <div className="grid grid-cols-1 gap-2">
                  {filteredTemplates.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                          selectedTemplate === t.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {t.label}
                      </button>
                    )
                  })}
                  {filteredTemplates.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No templates available for this source type yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Brand Selector */}
              <BrandSelector
                selectedBrand={selectedBrand}
                onChange={setSelectedBrand}
                label="Brand Voice"
              />
            </div>

            {/* Generate Button */}
            <div className="border-t border-border/50 p-6">
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !sourceContent.trim() ||
                  !selectedTemplate
                }
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Repurposing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Repurpose Content
                  </>
                )}
              </Button>
              {error && (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              )}
              {balance !== null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Balance: {balance} credits
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Output */}
        <div className="flex-1 p-6">
          {!output && !isGenerating && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Ready to repurpose
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a source type, paste your content, choose a template, and
                  generate.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                {filteredTemplates.map((t) => {
                  const Icon = t.icon
                  return (
                    <span
                      key={t.id}
                      className="flex items-center gap-1 rounded-full border px-2 py-1"
                    >
                      <Icon className="h-3 w-3" />
                      {t.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Repurposing your content...
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI is transforming your content into a new format
                </p>
              </div>
            </div>
          )}

          {output && !isGenerating && (
            <div className="flex h-full flex-col">
              {/* Output Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Output</h2>
                  {outputFormat && (
                    <p className="text-xs text-muted-foreground capitalize">
                      Format: {outputFormat.replace("-", " ")}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Output Content */}
              <Card className="flex-1 overflow-auto">
                <CardContent className="p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {output}
                  </pre>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOutput("")
                    setOutputFormat(null)
                  }}
                >
                  Clear Output
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating || !sourceContent.trim() || !selectedTemplate}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
