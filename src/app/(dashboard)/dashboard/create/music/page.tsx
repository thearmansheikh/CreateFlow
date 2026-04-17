"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Sparkles, Loader2 } from "lucide-react"

export default function MusicGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          <Music className="h-3.5 w-3.5 text-pink-400" />
          Music Generator
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Music Generator</h1>
        <p className="mt-1 text-muted-foreground">Create original music tracks with AI.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Prompt</CardTitle><CardDescription>Describe the music you want</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="An upbeat electronic track with a driving bassline..." className="min-h-[120px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y" />
            <Button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 5000) }} disabled={!prompt.trim() || isGenerating} className="w-full gap-2">{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{isGenerating ? "Generating..." : "Generate Music"}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle><CardDescription>Your generated track will appear here</CardDescription></CardHeader>
          <CardContent>
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10">
              {isGenerating ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Music className="h-10 w-10 text-muted-foreground/30" />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
