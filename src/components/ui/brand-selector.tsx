"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"

export interface BrandContext {
  id: string
  name: string
  voice: string | null
  visualStyle: string | null
  tone: string | null
  brandColors: string | null
}

interface BrandSelectorProps {
  onBrandChange: (brand: BrandContext | null) => void
  className?: string
}

export function BrandSelector({ onBrandChange, className }: BrandSelectorProps) {
  const [brands, setBrands] = useState<BrandContext[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("brand_profiles").select("*")
      setBrands(data || [])
      setLoading(false)
    }
    fetchBrands()
  }, [])

  const handleSelect = useCallback((brandId: string) => {
    if (brandId === "none") {
      setSelectedId(null)
      onBrandChange(null)
    } else {
      const brand = brands.find((b) => b.id === brandId) || null
      setSelectedId(brandId)
      onBrandChange(brand)
    }
  }, [brands, onBrandChange])

  if (loading || brands.length === 0) return null

  return (
    <div className={className}>
      <Label>Brand Voice (optional)</Label>
      <select
        value={selectedId || "none"}
        onChange={(e) => handleSelect(e.target.value)}
        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="none">No brand</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
      {brands.find((b) => b.id === selectedId) && (
        <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          {brands.find((b) => b.id === selectedId)?.tone && <div className="mb-1"><strong>Tone:</strong> {brands.find((b) => b.id === selectedId)?.tone}</div>}
          {brands.find((b) => b.id === selectedId)?.voice && <div className="mb-1"><strong>Voice:</strong> {brands.find((b) => b.id === selectedId)?.voice}</div>}
          {brands.find((b) => b.id === selectedId)?.visualStyle && <div className="mb-1"><strong>Visual style:</strong> {brands.find((b) => b.id === selectedId)?.visualStyle}</div>}
          {brands.find((b) => b.id === selectedId)?.brandColors && <div className="mb-1"><strong>Colors:</strong> {brands.find((b) => b.id === selectedId)?.brandColors}</div>}
        </div>
      )}
    </div>
  )
}

export function buildBrandContext(brand: BrandContext | null): string | undefined {
  if (!brand) return undefined
  const parts: string[] = []
  if (brand.tone) parts.push(`Tone: ${brand.tone}`)
  if (brand.voice) parts.push(`Voice: ${brand.voice}`)
  if (brand.visualStyle) parts.push(`Visual style: ${brand.visualStyle}`)
  if (brand.brandColors) parts.push(`Colors: ${brand.brandColors}`)
  return parts.join(". ")
}
