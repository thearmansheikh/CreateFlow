import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Image, Video, Music, FileText, FolderOpen, Calendar } from "lucide-react"
import type { Database } from "@/types/database"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, credits_balance")
    .eq("id", user.id)
    .single() as { data: UserProfile | null }

  // Get recent content count
  const { count: contentCount } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {profile?.full_name || user.email?.split("@")[0] || "Creator"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Credits Remaining" value={profile?.credits_balance ?? 50} subtitle="Free tier" />
        <StatCard title="Total Content" value={contentCount ?? 0} subtitle="Images, videos, music, copy" />
        <StatCard title="Scheduled" value="0" subtitle="Pending posts" />
        <StatCard title="Published" value="0" subtitle="This month" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard title="Generate Image" desc="Create AI images from text prompts" href="/dashboard/create/image" icon={Image} accent="from-blue-500 to-cyan-500" />
          <ActionCard title="Generate Video" desc="Create short video clips with AI" href="/dashboard/create/video" icon={Video} accent="from-violet-500 to-purple-500" />
          <ActionCard title="Generate Music" desc="Create AI music tracks" href="/dashboard/create/music" icon={Music} accent="from-pink-500 to-rose-500" />
          <ActionCard title="Write Copy" desc="Generate marketing copy and captions" href="/dashboard/create/copy" icon={FileText} accent="from-amber-500 to-orange-500" />
          <ActionCard title="Browse Library" desc="View and manage all your content" href="/dashboard/library" icon={FolderOpen} accent="from-emerald-500 to-teal-500" />
          <ActionCard title="Schedule Post" desc="Plan and schedule your content" href="/dashboard/calendar" icon={Calendar} accent="from-indigo-500 to-blue-500" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function ActionCard({ title, desc, href, icon: Icon, accent }: {
  title: string; desc: string; href: string; icon: React.ComponentType<{ className?: string }>; accent: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
