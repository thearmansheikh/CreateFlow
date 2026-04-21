"use client"

import { useState, useCallback } from "react"
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
  Music,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Demo data
const demoBrands = [
  {
    id: "b1",
    name: "Acme Studio",
    description: "Modern tech brand with a playful tone",
    voiceTone: { tone: "professional", personality: "friendly", language: "en" },
    visualStyle: { mood: "modern", complexity: "minimal" },
    brandColors: ["#8b5cf6", "#06b6d4", "#f59e0b"],
    brandFonts: ["Inter", "Geist"],
    isDefault: true,
  },
  {
    id: "b2",
    name: "Sunrise Coffee",
    description: "Warm, cozy café brand",
    voiceTone: { tone: "casual", personality: "warm", language: "en" },
    visualStyle: { mood: "warm", complexity: "detailed" },
    brandColors: ["#92400e", "#d97706", "#fef3c7"],
    brandFonts: ["Georgia", "Playfair Display"],
    isDefault: false,
  },
]

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
  const [brands, setBrands] = useState(demoBrands)
  const [editingBrand, setEditingBrand] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSave = (brand: any) => {
    if (brand.id) {
      setBrands((prev) => prev.map((b) => (b.id === brand.id ? brand : b)))
    } else {
      const newBrand = { ...brand, id: `b${Date.now()}` }
      setBrands((prev) => [...prev, newBrand])
    }
    setEditingBrand(null)
    setIsCreating(false)
  }

  const handleDelete = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
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
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Card key={brand.id} className="group relative transition-all hover:border-primary/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {brand.name}
                    {brand.isDefault && (
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
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Brand Colors</p>
                <div className="flex gap-1.5">
                  {brand.brandColors.map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Voice */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Voice & Tone</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                    <Mic2 className="mr-1 inline h-3 w-3" />
                    {brand.voiceTone?.tone}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                    {brand.voiceTone?.personality}
                  </span>
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Typography</p>
                <div className="flex flex-wrap gap-1.5">
                  {brand.brandFonts?.map((font) => (
                    <span key={font} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      <Type className="mr-1 inline h-3 w-3" />
                      {font}
                    </span>
                  ))}
                </div>
              </div>
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
    </div>
  )
}

function BrandForm({ brand, onSave, onCancel }: {
  brand: any
  onSave: (brand: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(brand?.name || "")
  const [description, setDescription] = useState(brand?.description || "")
  const [tone, setTone] = useState(brand?.voiceTone?.tone || "professional")
  const [personality, setPersonality] = useState(brand?.voiceTone?.personality || "friendly")
  const [mood, setMood] = useState(brand?.visualStyle?.mood || "modern")
  const [colors, setColors] = useState<string[]>(brand?.brandColors || [])
  const [fonts, setFonts] = useState<string>(brand?.brandFonts?.join(", ") || "")
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || "")

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      ...brand,
      name: name.trim(),
      description: description.trim(),
      voiceTone: { tone, personality, language: "en" },
      visualStyle: { mood },
      brandColors: colors,
      brandFonts: fonts.split(",").map((f) => f.trim()).filter(Boolean),
      logoUrl: logoUrl.trim(),
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
