import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, Video, Music, FileText, ArrowRight, Sparkles } from "lucide-react"

export default function CreatePage() {
  const generators = [
    {
      title: "Image Generator",
      description: "Create stunning images from text prompts with style control and brand-aware generation.",
      href: "/dashboard/create/image",
      icon: Image,
      gradient: "from-blue-500 to-cyan-500",
      features: ["Text-to-image", "Style presets", "Multiple aspect ratios", "Brand voice integration"],
    },
    {
      title: "Video Generator",
      description: "Generate short video clips and animations from prompts or existing images.",
      href: "/dashboard/create/video",
      icon: Video,
      gradient: "from-violet-500 to-purple-500",
      features: ["Text-to-video", "Image-to-video", "Motion control", "Duration options"],
    },
    {
      title: "Music Generator",
      description: "Create original music tracks, jingles, and audio content with AI.",
      href: "/dashboard/create/music",
      icon: Music,
      gradient: "from-pink-500 to-rose-500",
      features: ["Text-to-music", "Genre selection", "Duration control", "Instrumental or vocal"],
    },
    {
      title: "Copy Generator",
      description: "Generate marketing copy, social captions, and blog content in your brand voice.",
      href: "/dashboard/create/copy",
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      features: ["Caption writing", "Blog posts", "Brand tone matching", "Multi-platform formats"],
    },
  ]

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Generation Suite
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create</h1>
        <p className="mt-1 text-muted-foreground">Choose what you want to generate.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {generators.map((gen) => (
          <Link key={gen.title} href={gen.href} className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gen.gradient} text-white`}>
                  <gen.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{gen.title}</CardTitle>
                <CardDescription>{gen.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {gen.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open generator <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
