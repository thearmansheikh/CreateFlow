import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/database"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  // Fetch user profile with credits
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single() as { data: UserProfile | null }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "Creator"}
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your workspace.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Credits Remaining" value={profile?.credits_balance ?? 0} subtitle="Free tier: 50 credits" />
        <StatCard title="Total Content" value="0" subtitle="Images, videos, music, copy" />
        <StatCard title="Scheduled" value="0" subtitle="Pending posts" />
        <StatCard title="Published" value="0" subtitle="This month" />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="Generate Image"
          description="Create AI images from text prompts"
          href="/dashboard/create/image"
          icon="🎨"
        />
        <QuickActionCard
          title="Generate Video"
          description="Create short video clips with AI"
          href="/dashboard/create/video"
          icon="🎬"
        />
        <QuickActionCard
          title="Generate Music"
          description="Create AI music tracks"
          href="/dashboard/create/music"
          icon="🎵"
        />
        <QuickActionCard
          title="Write Copy"
          description="Generate marketing copy and captions"
          href="/dashboard/create/copy"
          icon="✍️"
        />
        <QuickActionCard
          title="Browse Library"
          description="View and manage all your content"
          href="/dashboard/library"
          icon="📁"
        />
        <QuickActionCard
          title="Schedule Post"
          description="Plan and schedule your content"
          href="/dashboard/calendar"
          icon="📅"
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle: string
}) {
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

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="font-semibold transition-colors group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </a>
  )
}
