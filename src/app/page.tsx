import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Palette, Music2, Calendar, BarChart3, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            CreateFlow
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          AI-powered creative studio
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Create. Manage.{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            Publish.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          One platform for generating AI content and managing your entire creative workflow.
          Images, videos, music, and copy — all connected to your content library.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              Start Creating Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              See Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Everything you need to create and manage content
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-muted-foreground">
          From AI generation to scheduling and analytics — CreateFlow covers your entire creative pipeline.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Palette className="h-6 w-6" />}
            title="AI Image Generation"
            description="Generate stunning images from text prompts with style control, aspect ratios, and brand-aware generation."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="AI Video & Music"
            description="Create video clips and music tracks with AI. Not just images — full multimedia content generation."
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI Copywriting"
            description="Generate captions, blog posts, and marketing copy that matches your brand voice and tone."
          />
          <FeatureCard
            icon={<Calendar className="h-6 w-6" />}
            title="Scheduling & Publishing"
            description="Schedule content and publish directly to Instagram, TikTok, YouTube, LinkedIn, and more."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Analytics & Insights"
            description="Track performance across all platforms. AI-powered recommendations for optimal posting."
          />
          <FeatureCard
            icon={<Music2 className="h-6 w-6" />}
            title="Brand Kits"
            description="Define your brand voice, colors, and style. AI learns your brand and generates on-brand content."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-2xl border border-border bg-secondary p-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to create?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start with 50 free credits. No credit card required.
          </p>
          <div className="mt-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CreateFlow. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
