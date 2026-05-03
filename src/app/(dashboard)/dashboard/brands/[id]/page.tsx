import Link from "next/link"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit2,
  Palette,
  Mic2,
  Type as TypeIcon,
  Eye,
  FileText,
  ExternalLink,
  Star,
} from "lucide-react"

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

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: brand } = (await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", id)
    .single()) as unknown as { data: BrandProfile | null }

  if (!brand) notFound()

  const tone = brand.voice_tone?.tone
  const personality = brand.voice_tone?.personality
  const mood = brand.visual_style?.mood
  const fonts = brand.brand_fonts ?? []
  const colors = brand.brand_colors ?? []
  const examples = brand.brand_examples ?? []

  const textExamples = examples.filter((e) => !e.startsWith("http"))
  const fileExamples = examples.filter((e) => e.startsWith("http"))

  return (
    <div className="flex-1 space-y-8 overflow-auto p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/brands"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to brands
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            {brand.logo_url ? (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-secondary">
                <Image
                  src={brand.logo_url}
                  alt={`${brand.name} logo`}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-secondary">
                <Palette className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {brand.name}
                </h1>
                {brand.is_default && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Star className="h-3 w-3" />
                    Default
                  </span>
                )}
              </div>
              {brand.description && (
                <p className="mt-1 text-muted-foreground">{brand.description}</p>
              )}
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href="/dashboard/brands">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-muted-foreground" />
              Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {colors.map((color, i) => (
                <div
                  key={`${color}-${i}`}
                  className="overflow-hidden rounded-lg border"
                >
                  <div
                    className="h-20 w-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="p-2">
                    <p className="font-mono text-xs uppercase">{color}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice & Tone */}
      {(tone || personality) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic2 className="h-4 w-4 text-muted-foreground" />
              Voice &amp; Tone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {tone && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tone
                  </p>
                  <p className="mt-1 text-lg font-medium capitalize">{tone}</p>
                </div>
              )}
              {personality && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Personality
                  </p>
                  <p className="mt-1 text-lg font-medium capitalize">
                    {personality}
                  </p>
                </div>
              )}
              {brand.voice_tone?.language && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Language
                  </p>
                  <p className="mt-1 text-lg font-medium uppercase">
                    {brand.voice_tone.language}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Style */}
      {mood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Visual Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Mood
              </p>
              <p className="mt-1 text-lg font-medium capitalize">{mood}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typography */}
      {fonts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TypeIcon className="h-4 w-4 text-muted-foreground" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fonts.map((font) => (
              <div key={font} className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {font}
                </p>
                <p
                  className="mt-2 text-3xl"
                  style={{ fontFamily: `"${font}", system-ui, sans-serif` }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <p
                  className="mt-1 text-sm text-muted-foreground"
                  style={{ fontFamily: `"${font}", system-ui, sans-serif` }}
                >
                  abcdefghijklmnopqrstuvwxyz · 0123456789
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Brand Examples */}
      {(textExamples.length > 0 || fileExamples.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Brand Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {textExamples.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Sample Copy
                </p>
                <ul className="space-y-2">
                  {textExamples.map((ex, i) => (
                    <li
                      key={i}
                      className="rounded-md border bg-secondary/40 p-3 text-sm"
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fileExamples.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Reference Documents
                </p>
                <ul className="space-y-2">
                  {fileExamples.map((url, i) => {
                    const fileName = url.split("/").pop() ?? "Document"
                    return (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-secondary/40"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{fileName}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty hint */}
      {colors.length === 0 &&
        !tone &&
        !personality &&
        !mood &&
        fonts.length === 0 &&
        examples.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              This brand kit has no details yet.{" "}
              <Link href="/dashboard/brands" className="text-primary underline">
                Add some
              </Link>
              .
            </CardContent>
          </Card>
        )}
    </div>
  )
}
