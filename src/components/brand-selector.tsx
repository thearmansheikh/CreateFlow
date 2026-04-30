"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Palette, Loader2, Star } from "lucide-react"

interface BrandProfile {
  id: string
  name: string
  description: string | null
  voice_tone: { tone?: string; personality?: string; language?: string } | null
  visual_style: { mood?: string; complexity?: string } | null
  brand_colors: string[] | null
  typography: { primary_font?: string; secondary_font?: string } | null
  logo_url: string | null
  is_default?: boolean
}

interface BrandSelectorProps {
  selectedBrand: BrandProfile | null
  onChange: (brand: BrandProfile | null) => void
  label?: string
}

export function BrandSelector({ selectedBrand, onChange, label = "Brand" }: BrandSelectorProps) {
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Resolve initial brand: honour explicit selectedBrand, otherwise auto-select default
  const resolveInitial = useCallback((brandList: BrandProfile[]) => {
    if (brandList.length === 0) return null
    if (selectedBrand) return selectedBrand
    const defaultBrand = brandList.find((b) => b.is_default)
    if (defaultBrand) {
      onChange(defaultBrand)
    }
    return defaultBrand || null
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadBrands() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from("brand_profiles").select("*").order("created_at", { ascending: false })
        const brandList = (data || []) as BrandProfile[]
        if (!cancelled) {
          setBrands(brandList)
          resolveInitial(brandList)
        }
      } catch (e) {
        console.error("Failed to load brands:", e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadBrands()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/50 p-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading brands...</span>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 p-3 text-center">
        <p className="text-xs text-muted-foreground">
          No brand kits saved yet.{" "}
          <a href="/dashboard/brands" className="text-primary underline-offset-4 hover:underline">
            Create one →
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors",
            !selectedBrand
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          None
        </button>
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onChange(brand)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
              selectedBrand?.id === brand.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {brand.brand_colors && brand.brand_colors.length > 0 && (
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ backgroundColor: brand.brand_colors[0] }}
              />
            )}
            {brand.name}
            {brand.is_default && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          </button>
        ))}
      </div>
    </div>
  )
}
