"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Video as VideoIcon,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Loader2,
  Clock,
  Monitor,
  Film,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandSelector } from "@/components/brand-selector"

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

const durations = [
  { label: "6s", value: 6 },
  { label: "10s", value: 10 },
]

const resolutions = [
  { label: "720p", value: "720p" },
  { label: "1080p", value: "1080p" },
]

const videoStyles = [
  { label: "Cinematic", value: "cinematic", desc: "Dramatic film look" },
  { label: "Anime", value: "anime", desc: "Japanese animation" },
  { label: "Realistic", value: "realistic", desc: "Lifelike footage" },
  { label: "Slow Motion", value: "slow-motion", desc: "High-speed capture" },
  { label: "Timelapse", value: "timelapse", desc: "Time-compressed" },
  { label: "Surreal", value: "surreal", desc: "Dreamlike visuals" },
]

const stylePrompts: Record<string, string> = {
  cinematic: "cinematic film quality, dramatic lighting, depth of field",
  anime: "anime style, vibrant colors, cel shaded",
  realistic: "photorealistic, 4k footage, natural lighting",
  "slow-motion": "slow motion capture, high frame rate, smooth",
  timelapse: "timelapse footage, time-lapse, dynamic",
  surreal: "surreal dreamlike, otherworldly, ethereal",
}

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [duration, setDuration] = useState(6)
  const [resolution, setResolution] = useState("768P")
  const [style, setStyle] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [pollStatus, setPollStatus] = useState("idle") // idle | polling | success | failed
  const [pollProgress, setPollProgress] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [cancelMessage, setCancelMessage] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<BrandContext | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (elapsedRef.current) clearInterval(elapsedRef.current)
    }
  }, [])

  // Format elapsed time as MM:SS
  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  // Status message based on elapsed time
  const getStatusMessage = () => {
    if (elapsedSeconds < 15) return "Submitting to MiniMax..."
    if (elapsedSeconds < 45) return "AI is analyzing your prompt..."
    if (elapsedSeconds < 90) return "Generating video frames..."
    if (elapsedSeconds < 180) return "Rendering final video..."
    return "Almost there, finishing up..."
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setError(null)
    setGeneratedVideo(null)
    setPollStatus("polling")
    setPollProgress(0)
    setElapsedSeconds(0)
    setCancelMessage(null)

    try {
      const enhancedPrompt = style && stylePrompts[style]
        ? `${prompt.trim()}, ${stylePrompts[style]}`
        : prompt.trim()

      // Step 1: Create task
      const createRes = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          negativePrompt: negativePrompt || undefined,
          duration,
          resolution,
          brandContext: selectedBrand ? `${selectedBrand.name}: ${selectedBrand.description || ""}` : undefined,
        }),
      })

      const createData = await createRes.json()

      if (!createRes.ok) {
        setError(createData.error || "Failed to start video generation")
        setIsGenerating(false)
        setPollStatus("failed")
        if (elapsedRef.current) clearInterval(elapsedRef.current)
        return
      }

      setTaskId(createData.taskId)

      // Elapsed time counter
      elapsedRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)

      // Step 2: Poll for results every 5 seconds (faster feedback)
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/generate/video?taskId=${createData.taskId}`)
          const pollData = await pollRes.json()

          if (pollData.status === "success") {
            if (pollRef.current) clearInterval(pollRef.current)
            if (elapsedRef.current) clearInterval(elapsedRef.current)
            setGeneratedVideo(pollData.videoUrl)
            setPollStatus("success")
            setIsGenerating(false)
          } else if (pollData.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current)
            if (elapsedRef.current) clearInterval(elapsedRef.current)
            setError(pollData.error || "Video generation failed")
            setPollStatus("failed")
            setIsGenerating(false)
          } else {
            setPollProgress(pollData.progress || 0)
            if (pollData.message) {
              // Use API status message if available
            }
          }
        } catch {
          // Network error — keep polling
        }
      }, 5000)
    } catch {
      setError("Network error. Please try again.")
      setIsGenerating(false)
      setPollStatus("failed")
      if (elapsedRef.current) clearInterval(elapsedRef.current)
    }
  }

  const handleCancel = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (elapsedRef.current) clearInterval(elapsedRef.current)
    setIsGenerating(false)
    setPollStatus("idle")
    setCancelMessage("Video generation cancelled. Credits were already used.")
    setTaskId(null)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left Panel — Controls */}
        <div className="w-full space-y-4 sm:space-y-6 border-b lg:border-b-0 lg:border-r border-border/50 p-4 sm:p-6 lg:w-96 lg:overflow-auto">
          <div>
            <h1 className="text-xl font-bold">Video Generator</h1>
            <p className="text-sm text-muted-foreground">Create AI video clips with MiniMax</p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label>Prompt</Label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A slow-motion wave crashing on a tropical beach at sunset..."
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </div>

          {/* Negative prompt */}
          <div className="space-y-2">
            <Label>Negative Prompt (optional)</Label>
            <Input
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, watermark, text..."
            />
          </div>
          {/* Brand Selector */}
          <BrandSelector
            selectedBrand={selectedBrand}
            onChange={setSelectedBrand}
            label="Brand Style"
          />


          {/* Style Presets */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Video Style
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {videoStyles.map((s) => (
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

          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm transition-colors",
                    duration === d.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Resolution
            </Label>
            <div className="flex gap-2">
              {resolutions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setResolution(r.value)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm transition-colors",
                    resolution === r.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {r.label}
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
                Generating Video...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>

          {/* Cost note */}
          <p className="text-center text-xs text-muted-foreground">
            Costs 10 credits per generation
          </p>
        </div>

        {/* Right Panel — Results */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!generatedVideo && !isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <VideoIcon className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium">Your video will appear here</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Describe a scene and generate AI video clips in seconds.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Aerial drone shot over snow-capped mountains at sunrise",
                  "Ocean waves crashing on rocks in slow motion",
                  "Time-lapse of a flower blooming in a garden",
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
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <VideoIcon className="h-10 w-10 text-primary animate-pulse" />
                </div>
                {/* Subtle ring animation */}
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
              </div>
              <h3 className="text-lg font-medium">{getStatusMessage()}</h3>
              {/* Elapsed time */}
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>{formatElapsed(elapsedSeconds)}</span>
                <span className="text-xs text-muted-foreground/60">·</span>
                <span className="text-xs text-muted-foreground/60">est. 2-5 min</span>
              </div>
              {/* Progress bar */}
              {pollProgress > 0 && (
                <div className="mt-6 w-64">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.min(pollProgress, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    {pollProgress}% complete
                  </p>
                </div>
              )}
              {/* Cancel button */}
              <button
                onClick={handleCancel}
                className="mt-6 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Cancel (credits already used)
              </button>
              {taskId && (
                <p className="mt-4 text-[10px] text-muted-foreground font-mono opacity-50">
                  ID: {taskId.slice(0, 16)}
                </p>
              )}
            </div>
          ) : cancelMessage ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-500/10">
                <svg className="h-10 w-10 text-yellow-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm text-yellow-400">{cancelMessage}</p>
              <button
                onClick={() => setCancelMessage(null)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Generate another
              </button>
            </div>
          ) : generatedVideo ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-2xl space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-secondary">
                  <video
                    src={generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {duration}s · {resolution} · {style || "Default style"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                      <a href={generatedVideo} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
