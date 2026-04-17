"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          <Video className="h-3.5 w-3.5 text-violet-400" />
          Video Generator
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Video Generator</h1>
        <p className="mt-1 text-muted-foreground">Create short video clips from text prompts or images.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prompt</CardTitle>
            <CardDescription>Describe the video you want to create</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A slow-motion wave crashing on a tropical beach at sunset..."
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" value="5" defaultChecked className="accent-primary" />
                5s
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" value="10" className="accent-primary" />
                10s
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="resolution" value="720p" defaultChecked className="accent-primary" />
                720p
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="resolution" value="1080p" className="accent-primary" />
                1080p
              </label>
            </div>
            <Button
              onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 5000) }}
              disabled={!prompt.trim() || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Video"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Your generated video will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
              {isGenerating ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <Video className="h-10 w-10 text-muted-foreground/30" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
