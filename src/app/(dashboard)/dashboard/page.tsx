import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Image, Video, Music, FileText, FolderOpen, Calendar, Zap, TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"

interface Workspace { id: string; name: string; plan: string }
interface UserProfile { full_name: string | null; credits_balance: number; total_credits_used: number; subscription_tier: string }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  // Get user profile
  const profileResult = await supabase
    .from("users")
    .select("full_name, credits_balance, total_credits_used, subscription_tier")
    .eq("id", user.id)
  const profile = profileResult.data?.[0] as UserProfile | undefined

  // Get user's workspace
  const workspaceResult = await supabase
    .from("workspaces")
    .select("id, name, plan")
    .eq("owner_id", user.id)
  const workspace = workspaceResult.data?.[0] as Workspace | undefined
  const workspaceId = workspace?.id || ""

  // Stats scoped to workspace
  const { count: totalContent } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)

  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { count: thisMonthContent } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", firstOfMonth)

  const { count: totalGenerations } = await supabase
    .from("generation_tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)

  const { count: scheduledCount } = await supabase
    .from("scheduled_posts")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["draft", "scheduled"])

  // Recent activity
  const { data: recentItems } = await supabase
    .from("content_items")
    .select("id, type, title, ai_model_used, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {profile?.full_name || user.email?.split("@")[0] || "Creator"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {workspace?.name ? `${workspace.name} • ` : ""}{profile?.subscription_tier || "free"} plan
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Credits Remaining"
          value={profile?.credits_balance ?? 0}
          subtitle={`${profile?.subscription_tier || "free"} tier`}
          icon={Zap}
        />
        <StatCard
          title="Total Content"
          value={totalContent ?? 0}
          subtitle={`${thisMonthContent ?? 0} this month`}
          icon={Image}
        />
        <StatCard
          title="Generations"
          value={totalGenerations ?? 0}
          subtitle={`${profile?.total_credits_used ?? 0} credits used`}
          icon={TrendingUp}
        />
        <StatCard
          title="Scheduled"
          value={scheduledCount ?? 0}
          subtitle="Pending posts"
          icon={Calendar}
        />
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

      {/* Recent Activity */}
      {recentItems && recentItems.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/library">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {recentItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 ${
                    index < recentItems.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      item.type === "image"
                        ? "bg-blue-500/20 text-blue-400"
                        : item.type === "video"
                        ? "bg-violet-500/20 text-violet-400"
                        : item.type === "music"
                        ? "bg-pink-500/20 text-pink-400"
                        : item.type === "copy"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {item.type === "image" && <Image className="h-5 w-5" />}
                    {item.type === "video" && <Video className="h-5 w-5" />}
                    {item.type === "music" && <Music className="h-5 w-5" />}
                    {item.type === "copy" && <FileText className="h-5 w-5" />}
                    {item.type === "upload" && <FolderOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.title || `Untitled ${item.type}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.ai_model_used || "Unknown"} • {timeAgo(item.created_at)}
                    </p>
                  </div>
                  <span className="text-xs uppercase text-muted-foreground px-2 py-1 rounded bg-secondary">
                    {item.type}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function ActionCard({
  title,
  desc,
  href,
  icon: Icon,
  accent,
}: {
  title: string
  desc: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div
            className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white`}
          >
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

function timeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
    }
  }
  return "just now"
}
