import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, TrendingUp, Zap, Image, Video, Music, FileText, Activity, Clock } from "lucide-react"
import { AnalyticsChart } from "./analytics-chart"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  // Get user's workspace
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single() as any

  if (!member) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">No workspace found. Create one to see analytics.</p>
      </div>
    )
  }

  const workspaceId = member.workspace_id

  // Fetch all analytics data in parallel
  const [
    totalGenerations,
    generationsByType,
    creditStats,
    recentActivity,
    recentContent,
    platformStats,
  ] = await Promise.all([
    // Total generations
    supabase
      .from("generation_tasks")
      .select("*", { count: "exact", head: false })
      .eq("workspace_id", workspaceId)
      .eq("status", "completed"),

    // Generations by type
    supabase
      .from("generation_tasks")
      .select("type")
      .eq("workspace_id", workspaceId)
      .eq("status", "completed"),

    // Credit usage
    supabase
      .from("credit_transactions")
      .select("amount, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),

    // Recent activity (last 10 generation tasks)
    supabase
      .from("generation_tasks")
      .select("id, type, status, created_at, prompt")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Recent content items
    supabase
      .from("content_items")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Platform distribution
    supabase
      .from("scheduled_posts")
      .select("platforms")
      .eq("workspace_id", workspaceId),
  ])

  // Process generations by type
  const typeCounts: Record<string, number> = { image: 0, video: 0, music: 0, copy: 0 }
  generationsByType.data?.forEach((g: { type: string }) => {
    if (g.type in typeCounts) typeCounts[g.type]++
  })

  // Process credit data
  const totalCreditsUsed = creditStats.data
    ?.filter((t: { amount: number }) => t.amount < 0)
    .reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0) ?? 0

  const totalCreditsPurchased = creditStats.data
    ?.filter((t: { amount: number }) => t.amount > 0 && t.amount > 0)
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) ?? 0

  // Credits used by day (last 7 days)
  const creditsByDay: Record<string, number> = {}
  creditStats.data?.forEach((t: { amount: number; created_at: string }) => {
    if (t.amount < 0) {
      const day = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      creditsByDay[day] = (creditsByDay[day] ?? 0) + Math.abs(t.amount)
    }
  })

  // Platform distribution
  const platformCounts: Record<string, number> = {}
  platformStats.data?.forEach((p: { platforms: Record<string, unknown> }) => {
    if (p.platforms) {
      Object.keys(p.platforms).forEach((platform) => {
        platformCounts[platform] = (platformCounts[platform] ?? 0) + 1
      })
    }
  })

  const hasData = totalGenerations.count !== 0 || totalCreditsUsed > 0 || recentContent.data?.length

  return (
    <div className="flex-1 space-y-8 overflow-auto p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Insights into your content creation and performance.</p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium">No data yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start creating content to see your analytics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGenerations.count ?? 0}</div>
                <p className="text-xs text-muted-foreground">AI-powered content pieces</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCreditsUsed}</div>
                <p className="text-xs text-muted-foreground">{totalCreditsPurchased} purchased</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Items</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentContent.count ?? 0}</div>
                <p className="text-xs text-muted-foreground">In your library</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platformStats.data?.filter((p: { platforms: Record<string, unknown> }) => Object.keys(p.platforms).length > 0).length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Posts queued</p>
              </CardContent>
            </Card>
          </div>

          {/* Generations by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Generations by Type</CardTitle>
              <CardDescription>Breakdown of your AI-generated content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { type: "image", label: "Images", icon: Image, count: typeCounts.image, color: "text-blue-500" },
                  { type: "video", label: "Videos", icon: Video, count: typeCounts.video, color: "text-purple-500" },
                  { type: "music", label: "Music", icon: Music, count: typeCounts.music, color: "text-green-500" },
                  { type: "copy", label: "Copy", icon: FileText, count: typeCounts.copy, color: "text-orange-500" },
                ].map((item) => {
                  const Icon = item.icon
                  const total = Object.values(typeCounts).reduce((a, b) => a + b, 0)
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                  return (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="text-2xl font-bold">{item.count}</div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${item.color.replace("text-", "bg-")}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{pct}% of total</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Credits Used by Day */}
          {Object.keys(creditsByDay).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Credit Usage</CardTitle>
                <CardDescription>Credits consumed per day</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={creditsByDay} />
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {recentActivity.data && recentActivity.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest generation tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.data.slice(0, 8).map((task: { id: string; type: string; status: string; created_at: string; prompt: string }) => {
                    const Icon = task.type === "image" ? Image : task.type === "video" ? Video : task.type === "music" ? Music : FileText
                    return (
                      <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {task.prompt?.substring(0, 60)}{task.prompt?.length > 60 ? "..." : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.type} · {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          task.status === "completed" ? "bg-green-500/10 text-green-500" :
                          task.status === "failed" ? "bg-red-500/10 text-red-500" :
                          "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Distribution */}
          {Object.keys(platformCounts).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Where your content is scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(platformCounts).map(([platform, count]) => (
                    <div key={platform} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">{platform}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
