"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Palette,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Mic2,
  Type,
  Eye,
  Loader2,
    Star,
  Upload,
  FileText,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { brandTemplates, applyBrandTemplate } from "@/lib/brand-templates"

interface BrandProfile {
  id: string
  workspace_id: string
  name: string
  description: string | null
  voice_tone: { tone?: string; personality?: string; language?: string } | null
  visual_style: { mood?: string; complexity?: string } | null
  logo_url: string | null
  brand_colors: string[] | null
  brand_fonts: string[] | null
  brand_examples: string[] | null
  is_default: boolean
  created_at: string
  updated_at: string
}

const presetPalettes = [
  { name: "Violet", colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"] },
  { name: "Ocean", colors: ["#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd"] },
  { name: "Sunset", colors: ["#f43f5e", "#f97316", "#eab308", "#fbbf24", "#fef3c7"] },
  { name: "Forest", colors: ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"] },
  { name: "Midnight", colors: ["#1e1b4b", "#312e81", "#4338ca", "#6366f1", "#818cf8"] },
  { name: "Rose", colors: ["#be123c", "#e11d48", "#f43f5e", "#fb7185", "#fda4af"] },
]

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "playful", label: "Playful" },
  { value: "formal", label: "Formal" },
  { value: "humorous", label: "Humorous" },
  { value: "inspirational", label: "Inspirational" },
]

const personalityOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "warm", label: "Warm" },
  { value: "witty", label: "Witty" },
  { value: "bold", label: "Bold" },
  { value: "minimal", label: "Minimal" },
]

export default function BrandsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [editingBrand, setEditingBrand] = useState<BrandProfile | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  const loadBrands = useCallback(async () => {
    setLoading(true)

    // Get user's workspace
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/sign-in")
      return
    }

    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single() as any

    if (!member) {
      setLoading(false)
      return
    }

    setWorkspaceId(member.workspace_id)

    const { data } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("workspace_id", member.workspace_id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    setBrands((data || []) as BrandProfile[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  const handleSave = async (brandData: Partial<BrandProfile>) => {
    if (!workspaceId) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      workspace_id: workspaceId,
      name: brandData.name || "",
      description: brandData.description || null,
      voice_tone: brandData.voice_tone || null,
      visual_style: brandData.visual_style || null,
      logo_url: brandData.logo_url || null,
      brand_colors: brandData.brand_colors || null,
      brand_fonts: brandData.brand_fonts || null,
      brand_examples: brandData.brand_examples || null,
      is_default: brandData.is_default || false,
    }

    if (brandData.id) {
      // Update existing
      const { error } = await (supabase.from("brand_profiles") as any)
        .update(payload)
        .eq("id", brandData.id)

      if (!error) {
        setEditingBrand(null)
        setIsCreating(false)
        loadBrands()
      }
    } else {
      // Create new
      const { error } = await (supabase.from("brand_profiles") as any)
        .insert(payload)

      if (!error) {
        setEditingBrand(null)
        setIsCreating(false)
        loadBrands()
      }
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from("brand_profiles").delete().eq("id", id)
    loadBrands()
  }

  const handleExampleUpload = async (files: File[]) => {
    if (!workspaceId) {
      setUploadError("No workspace found")
      return []
    }

    setUploading(true)
    setUploadError(null)
    const uploadedUrls: string[] = []
    const ALLOWED = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/markdown",
      "application/msword",
    ]

    try {
      for (const file of files) {
        if (!ALLOWED.includes(file.type)) {
          setUploadError(`"${file.name}" is not a supported file type (TXT, PDF, DOCX, MD)`)
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`"${file.name}" exceeds the 10 MB limit`)
          continue
        }

        const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
        const timestamp = Date.now()
        const storagePath = `brand_examples/${workspaceId}/${timestamp}_${safeName}`

        const { error: uploadErr } = await supabase.storage
          .from("content")
          .upload(storagePath, file, { cacheControl: "3600" })

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage
          .from("content")
          .getPublicUrl(storagePath)

        uploadedUrls.push(publicUrl)
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }

    return uploadedUrls
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 overflow-auto p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Brand Kits</h1>
          <p className="mt-1 text-muted-foreground">Define your brand voice, visual style, and assets.</p>
        </div>
        <Button onClick={() => { setIsCreating(true); setEditingBrand(null) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {(isCreating || editingBrand) && (
        <BrandForm
          brand={editingBrand}
          onSave={handleSave}
          onCancel={() => { setEditingBrand(null); setIsCreating(false) }}
          onExampleUpload={handleExampleUpload}
          uploading={uploading}
          uploadError={uploadError}
          clearUploadError={() => setUploadError(null)}
        />
      )}

      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Palette className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium">No brand kits yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first brand kit to define your voice and visual style.
            </p>
            <Button className="mt-4" onClick={() => { setIsCreating(true); setEditingBrand(null) }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Brand Kit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id} className="group relative transition-all hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {brand.name}
                      {brand.is_default && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Default
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{brand.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Colors */}
                {brand.brand_colors && brand.brand_colors.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Brand Colors</p>
                    <div className="flex gap-1.5">
                      {brand.brand_colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full border border-border/50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice */}
                {brand.voice_tone && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Voice & Tone</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                        <Mic2 className="mr-1 inline h-3 w-3" />
                        {brand.voice_tone.tone}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                        {brand.voice_tone.personality}
                      </span>
                    </div>
                  </div>
                )}

                {/* Fonts */}
                {brand.brand_fonts && brand.brand_fonts.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Typography</p>
                    <div className="flex flex-wrap gap-1.5">
                      {brand.brand_fonts.map((font) => (
                        <span key={font} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          <Type className="mr-1 inline h-3 w-3" />
                          {font}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 border-t border-border/50 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setEditingBrand(brand); setIsCreating(false) }}
                >
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(brand.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function BrandForm({
  brand,
  onSave,
  onCancel,
  onExampleUpload,
  uploading,
  uploadError,
  clearUploadError,
}: {
  brand: BrandProfile | null
  onSave: (brand: Partial<BrandProfile>) => void
  onCancel: () => void
  onExampleUpload: (files: File[]) => Promise<string[]>
  uploading: boolean
  uploadError: string | null
  clearUploadError: () => void
}) {
  const [name, setName] = useState(brand?.name || "")
  const [description, setDescription] = useState(brand?.description || "")
  const [tone, setTone] = useState(brand?.voice_tone?.tone || "professional")
  const [personality, setPersonality] = useState(brand?.voice_tone?.personality || "friendly")
  const [mood, setMood] = useState(brand?.visual_style?.mood || "modern")
  const [colors, setColors] = useState<string[]>(brand?.brand_colors || [])
  const [fonts, setFonts] = useState<string>(brand?.brand_fonts?.join(", ") || "")
  const [logoUrl, setLogoUrl] = useState(brand?.logo_url || "")
  const [brandExamples, setBrandExamples] = useState<string[]>(brand?.brand_examples || [])
  const [exampleInput, setExampleInput] = useState("")
  const [industryTemplate, setIndustryTemplate] = useState<string | null>(null)

  const handleApplyTemplate = (template: import("@/lib/brand-templates").BrandTemplate) => {
    const applied = applyBrandTemplate(template)
    setColors(applied.colors)
    setTone(applied.tone)
    setPersonality(applied.personality)
    setMood(applied.mood)
    setFonts(applied.fonts)
    setBrandExamples(applied.examples)
    setDescription(applied.suggestedDescription)
    setIndustryTemplate(template.id)
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: brand?.id,
      name: name.trim(),
      description: description.trim(),
      voice_tone: { tone, personality, language: "en" },
      visual_style: { mood },
      brand_colors: colors,
      brand_fonts: fonts.split(",").map((f) => f.trim()).filter(Boolean),
      logo_url: logoUrl.trim(),
      brand_examples: brandExamples,
    })
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{brand ? "Edit Brand" : "New Brand Kit"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name & Description */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Studio" />
          </div>
          <div className="space-y-2">
            <Label>Logo URL (optional)</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Modern tech brand with a playful tone" />
        </div>

        {/* Voice & Tone */}
        <div className="rounded-lg border border-border p-4 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Mic2 className="h-4 w-4" />
            Voice & Tone
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {toneOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Personality</Label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {personalityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visual Style */}
        <div className="rounded-lg border border-border p-4 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="h-4 w-4" />
            Visual Style
          </h3>
          <div className="space-y-2">
            <Label>Mood</Label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {["modern", "classic", "minimal", "bold", "playful", "elegant", "rugged", "organic"].map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Industry Template Presets */}
        <div className="rounded-lg border border-border p-4 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Palette className="h-4 w-4" />
            Industry Presets
          </h3>
          <p className="text-xs text-muted-foreground">
            Start with a pre-built industry template, then customize. This gives you colours, voice, fonts, and example copy in one click.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {brandTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-all",
                  "hover:border-primary/60 hover:bg-primary/5",
                )}
                title={tpl.description}
              >
                <span className="text-lg">{tpl.emoji}</span>
                <span className="text-xs font-medium leading-tight">{tpl.label}</span>
                <div className="flex gap-0.5">
                  {tpl.colors.slice(0, 5).map((c, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand Colors
          </Label>
          <p className="text-xs text-muted-foreground">Choose a preset palette or add custom colors</p>
          <div className="space-y-2">
            {presetPalettes.map((palette) => (
              <button
                key={palette.name}
                onClick={() => setColors(palette.colors)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-2.5 transition-colors",
                  JSON.stringify(colors) === JSON.stringify(palette.colors)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex gap-1">
                  {palette.colors.map((c, i) => (
                    <div key={i} className="h-5 w-5 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-sm">{palette.name}</span>
                {JSON.stringify(colors) === JSON.stringify(palette.colors) && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Custom color add */}
          <div className="flex items-center gap-2">
            <Input
              type="color"
              className="h-9 w-14 p-1"
              onChange={(e) => {
                if (e.target.value && colors.length < 6) {
                  setColors((prev) => [...prev, e.target.value])
                }
              }}
              value="#8b5cf6"
            />
            <span className="text-xs text-muted-foreground">Click to add a color ({colors.length}/6)</span>
          </div>
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-xs font-mono">{c}</span>
                  <button onClick={() => setColors((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fonts */}
        <div className="space-y-2">
          <Label>Brand Fonts (comma-separated)</Label>
          <Input value={fonts} onChange={(e) => setFonts(e.target.value)} placeholder="Inter, Geist, System UI" />
        </div>

        {/* Brand Examples */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Type className="h-4 w-4" />
            Brand Examples
          </h3>
          <p className="text-xs text-muted-foreground">Paste examples of your brand's copy or upload documents (TXT, PDF, DOCX, MD) so AI can learn your voice</p>
          
          {/* File Upload Zone */}
          <div className="space-y-2">
            <label
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault()
                clearUploadError()
                const files = Array.from(e.dataTransfer.files)
                if (files.length > 0) {
                  const urls = await onExampleUpload(files)
                  if (urls.length > 0) {
                    setBrandExamples(prev => [...prev, ...urls])
                  }
                }
              }}
            >
              <input
                type="file"
                className="hidden"
                accept=".txt,.pdf,.docx,.md,.doc"
                multiple
                onChange={async (e) => {
                  clearUploadError()
                  const files = Array.from(e.target.files || [])
                  if (files.length > 0) {
                    const urls = await onExampleUpload(files)
                    if (urls.length > 0) {
                      setBrandExamples(prev => [...prev, ...urls])
                    }
                    e.target.value = ""
                  }
                }}
              />
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Drop files here or <span className="text-primary underline">browse</span>
                  </span>
                  <span className="text-xs text-muted-foreground">TXT, PDF, DOCX, MD — max 10 MB each</span>
                </div>
              )}
            </label>
            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {uploadError}
              </div>
            )}
          </div>
          
          {/* Manual paste input */}
          <div className="flex gap-2">
            <Input
              value={exampleInput}
              onChange={(e) => setExampleInput(e.target.value)}
              placeholder="Paste a sample post or tagline..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && exampleInput.trim()) {
                  setBrandExamples(prev => [...prev, exampleInput.trim()])
                  setExampleInput("")
                }
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!exampleInput.trim()}
              onClick={() => {
                if (exampleInput.trim()) {
                  setBrandExamples(prev => [...prev, exampleInput.trim()])
                  setExampleInput("")
                }
              }}
            >
              Add
            </Button>
          </div>
          {brandExamples.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-auto">
              {brandExamples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md bg-secondary p-2 text-sm">
                  {ex.startsWith("http") ? (
                    <>
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate text-xs">{ex.split("/").pop()}</span>
                    </>
                  ) : (
                    <span className="flex-1 break-words">{ex}</span>
                  )}
                  <button onClick={() => setBrandExamples(prev => prev.filter((_, idx) => idx !== i))} className="shrink-0">
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry Template Presets */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">Quick Start — Industry Templates</h3>
          <p className="text-xs text-muted-foreground">Pick an industry to auto-fill common brand settings</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[
              { id: "saas", label: "SaaS", emoji: "💻", colors: ["#6366f1", "#8b5cf6", "#a78bfa"], tone: "professional", personality: "authoritative", mood: "modern" },
              { id: "food", label: "Food", emoji: "🍽️", colors: ["#f97316", "#ef4444", "#eab308"], tone: "casual", personality: "friendly", mood: "playful" },
              { id: "fashion", label: "Fashion", emoji: "👗", colors: ["#18181b", "#d4a574", "#f5f5f5"], tone: "formal", personality: "minimal", mood: "elegant" },
              { id: "fitness", label: "Fitness", emoji: "💪", colors: ["#22c55e", "#16a34a", "#1e3a2f"], tone: "inspirational", personality: "bold", mood: "bold" },
              { id: "beauty", label: "Beauty", emoji: "✨", colors: ["#f43f5e", "#fb7185", "#fda4af"], tone: "playful", personality: "warm", mood: "modern" },
            ].map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setColors(template.colors)
                  setTone(template.tone)
                  setPersonality(template.personality)
                  setMood(template.mood)
                  setIndustryTemplate(template.id)
                }}
                className={cn(
                  "rounded-lg border p-3 text-center transition-all hover:border-primary/50",
                  industryTemplate === template.id ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <span className="text-xl">{template.emoji}</span>
                <p className="text-xs mt-1">{template.label}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 border-t border-border/50">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          <Check className="mr-1.5 h-4 w-4" />
          Save Brand Kit
        </Button>
      </CardFooter>
    </Card>
  )
}
