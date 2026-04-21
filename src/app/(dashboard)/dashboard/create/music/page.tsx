"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Music,
  Sparkles,
  Wand2,
  Download,
  Loader2,
  Headphones,
  Mic,
  Sliders,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react"

const musicGenres = [
  { label: "Pop", value: "pop", desc: "Catchy, mainstream" },
  { label: "Electronic", value: "electronic", desc: "Synths & beats" },
  { label: "Rock", value: "rock", desc: "Guitars & energy" },
  { label: "Lo-Fi", value: "lo-fi", desc: "Chill, relaxed" },
  { label: "Classical", value: "classical", desc: "Orchestral, elegant" },
  { label: "Hip-Hop", value: "hip-hop", desc: "Beats & rhythm" },
  { label: "Jazz", value: "jazz", desc: "Smooth, improvisational" },
  { label: "Ambient", value: "ambient", desc: "Atmospheric, calm" },
  { label: "Cinematic", value: "cinematic", desc: "Epic, dramatic" },
  { label: "R&B", value: "rnb", desc: "Soulful, groovy" },
  { label: "Country", value: "country", desc: "Acoustic, storytelling" },
  { label: "Folk", value: "folk", desc: "Simple, organic" },
]

const musicMoods = [
  "Happy & Uplifting",
  "Dark & Moody",
  "Energetic & Powerful",
  "Calm & Relaxing",
  "Mysterious & Ethereal",
  "Nostalgic & Warm",
  "Aggressive & Intense",
  "Dreamy & Floaty",
]

export default function MusicGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState<string | null>(null)
  const [mood, setMood] = useState<string | null>(null)
  const [instrumental, setInstrumental] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  // Build enhanced prompt from genre + mood
  const enhancedPrompt = (() => {
    const parts: string[] = []
    if (genre) parts.push(`${genre} genre`)
    if (mood) parts.push(`${mood.toLowerCase()} mood`)
    if (prompt.trim()) parts.push(prompt.trim())
    return parts.join(", ") || prompt
  })()

  const handleGenerate = async () => {
    if (!enhancedPrompt.trim()) return
    setIsGenerating(true)
    setError(null)
    setGeneratedAudio(null)
    setIsPlaying(false)
    setCurrentTime(0)

    try {
      const res = await fetch("/api/generate/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          lyrics: lyrics.trim() || undefined,
          instrumental,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Music generation failed")
        return
      }

      if (data.audioUrl) {
        setGeneratedAudio(data.audioUrl)
        setDuration(data.duration || 0)
      } else {
        setError("No audio returned from API")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audioRef.current.currentTime = pct * audioRef.current.duration
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left Panel — Controls */}
        <div className="w-full space-y-6 border-r border-border/50 p-6 lg:w-96 lg:overflow-auto">
          <div>
            <h1 className="text-xl font-bold">Music Generator</h1>
            <p className="text-sm text-muted-foreground">Create original music with MiniMax AI</p>
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Genre
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {musicGenres.map((g) => (
                <button
                  key={g.value}
                  onClick={() => {
                    setGenre(genre === g.value ? null : g.value)
                    if (!instrumental) setInstrumental(false)
                  }}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-colors",
                    genre === g.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="text-xs font-medium">{g.label}</p>
                  <p className="text-[10px] text-muted-foreground">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Mood
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {musicMoods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? null : m)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs transition-colors",
                    mood === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label>Additional Description (optional)</Label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="With a driving bassline, shimmering synths, and a powerful drop..."
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </div>

          {/* Lyrics toggle */}
          <div className="space-y-2">
            <button
              onClick={() => setInstrumental(!instrumental)}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className={cn(
                  "h-5 w-9 rounded-full border transition-colors",
                  instrumental ? "border-primary bg-primary/30" : "border-border"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full bg-foreground transition-transform",
                    instrumental ? "translate-x-4" : "translate-x-0"
                  )}
                  style={{ marginTop: 1, marginLeft: 1 }}
                />
              </div>
              {instrumental ? (
                <span className="text-muted-foreground">Instrumental only</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5" />
                  Include lyrics
                </span>
              )}
            </button>
          </div>

          {/* Lyrics */}
          {!instrumental && (
            <div className="space-y-2">
              <Label>Lyrics (optional)</Label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Leave blank for AI-generated lyrics, or write your own..."
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
            </div>
          )}

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!enhancedPrompt.trim() || isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Music...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Music
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Costs 5 credits per generation
          </p>
        </div>

        {/* Right Panel — Results */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!generatedAudio && !isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <Music className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium">Your music will appear here</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Choose a genre and mood, then generate original music in seconds.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "A chill lo-fi hip-hop beat for studying",
                  "An epic cinematic orchestral piece",
                  "Upbeat electronic dance music with a heavy drop",
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
              <p className="text-sm text-muted-foreground">Composing your track...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This usually takes 30-60 seconds
              </p>
            </div>
          ) : generatedAudio ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-xl space-y-6">
                {/* Waveform visualization placeholder */}
                <div className="rounded-2xl border border-border/50 bg-secondary/50 p-8">
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const h = Math.random() * 40 + 10
                      const isNearPlayhead = Math.abs(i / 60 - (currentTime / (duration || 1))) < 0.05
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-1 rounded-full transition-all",
                            isNearPlayhead ? "bg-primary" : "bg-primary/30"
                          )}
                          style={{ height: `${h}px` }}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Player controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = 0
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>

                  <span className="text-sm text-muted-foreground tabular-nums ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Seek bar */}
                <div
                  className="relative h-2 rounded-full bg-white/10 cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 8px)` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                    <a href={generatedAudio} download="createflow-track.mp3">
                      <Download className="h-3.5 w-3.5" />
                      Download MP3
                    </a>
                  </Button>
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={generatedAudio}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  hidden
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
