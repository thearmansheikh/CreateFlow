import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, BarChart3, TrendingUp, Activity } from "lucide-react"
import { AnalyticsChart } from "./analytics-chart"

type Params = Promise<{ workspace: string }>
type SearchParams = Promise<{ range?: string }>

export default async function AnalyticsPage(props: { params: Params; searchParams: SearchParams }) {
  const params = await props.params
  const searchParams = await props.searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const range = searchParams.range ?? "30"
  const daysAgo = new Date()
  daysAgo.setDate(daysAgo.getDate() - parseInt(range, 10))
  const since = daysAgo.toISOString()

  const workspaceId = params.workspace

  // --- Content metrics ---
  const { count: totalContent } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", since)

  const { data: contentByTypeRaw } = await supabase
    .from("content_items")
    .select("type")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since)

  const typeCounts: Record<string, number> = {}
  for (const item of (contentByTypeRaw as any[] ?? [])) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
  }

  // --- Generation metrics ---
  const { count: totalGenerations } = await supabase
    .from("generation_tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", since)

  const { data: genTasksRaw } = await supabase
    .from("generation_tasks")
    .select("status, model_used, type, tokens_used")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since)

  const completedGens = ((genTasksRaw as any[]) ?? []).filter(
    (t: any) => t.status === "completed"
  )
  const failedGens = ((genTasksRaw as any[]) ?? []).filter(
    (t: any) => t.status === "failed"
  )
  const successRate =
    genTasksRaw && (genTasksRaw as any[]).length > 0
      ? Math.round((completedGens.length / (genTasksRaw as any[]).length) * 100)
      : 0

  const modelCounts: Record<string, number> = {}
  for (const t of completedGens) {
    if (t.model_used) {
      modelCounts[t.model_used] = (modelCounts[t.model_used] || 0) + 1
    }
  }
  const topModels = Object.entries(modelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // --- Publishing metrics ---
  const { data: postsRaw } = await supabase
    .from("scheduled_posts")
    .select("status, published_at, platforms")
    .eq("workspace_id", workspaceId)
    .gte("scheduled_at", since)

  const publishedPosts = ((postsRaw as any[]) ?? []).filter(
    (p: any) => p.status === "published"
  ).length
  const scheduledPostsCount = ((postsRaw as any[]) ?? []).filter(
    (p: any) => p.status === "scheduled"
  ).length
  const failedPosts = ((postsRaw as any[]) ?? []).filter(
    (p: any) => p.status === "failed"
  ).length
  const publishRate =
    postsRaw && (postsRaw as any[]).length > 0
      ? Math.round((publishedPosts / (postsRaw as any[]).length) * 100)
      : 0

  // Platform breakdown from posts
  const platformCounts: Record<string, number> = {}
  for (const post of (postsRaw as any[] ?? [])) {
    if (post.platforms && typeof post.platforms === "object") {
      for (const platform of Object.keys(post.platforms)) {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1
      }
    }
  }

  // --- Engagement metrics ---
  const { data: eventsRaw } = await supabase
    .from("analytics_events")
    .select("event_type, event_value, platform, recorded_at")
    .eq("workspace_id", workspaceId)
    .gte("recorded_at", since)

  const events = (eventsRaw as any[]) ?? []

  const totalImpressions = events
    .filter((e: any) => e.event_type === "impression")
    .reduce((sum: number, e: any) => sum + (e.event_value ?? 1), 0)

  const totalEngagements = events
    .filter((e: any) => ["like", "comment", "share", "save"].includes(e.event_type))
    .reduce((sum: number, e: any) => sum + (e.event_value ?? 1), 0)

  const totalClicks = events
    .filter((e: any) => e.event_type === "click")
    .reduce((sum: number, e: any) => sum + (e.event_value ?? 1), 0)

  const engagementRate =
    totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(2) : "0"

  const engagementByType: Record<string, number> = {}
  for (const e of events) {
    if (["like", "comment", "share", "save", "click", "impression"].includes(e.event_type)) {
      engagementByType[e.event_type] =
        (engagementByType[e.event_type] || 0) + (e.event_value ?? 1)
    }
  }

  // Daily engagement trend
  const dailyEngagementMap: Record<string, number> = {}
  for (const e of events) {
    const day = new Date(e.recorded_at).toISOString().split("T")[0]
    dailyEngagementMap[day] = (dailyEngagementMap[day] || 0) + (e.event_value ?? 1)
  }
  const dailyEngagement = Object.entries(dailyEngagementMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // --- Credit metrics ---
  const { data: creditRaw } = await supabase
    .from("credit_transactions")
    .select("amount, type, created_at")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since)

  const creditsUsed = ((creditRaw as any[]) ?? [])
    .filter((t: any) => t.type === "usage")
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)

  const creditsPurchased = ((creditRaw as any[]) ?? [])
    .filter((t: any) => t.type === "purchase")
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  const avgCostPerGeneration =
    totalGenerations && totalGenerations > 0
      ? Math.round((creditsUsed / totalGenerations) * 100) / 100
      : 0

  // --- Daily content creation trend ---
  const { data: dailyContentRaw } = await supabase
    .from("content_items")
    .select("created_at")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since)
    .order("created_at", { ascending: true })

  const dailyContentMap: Record<string, number> = {}
  for (const item of (dailyContentRaw as any[] ?? [])) {
    const day = new Date(item.created_at).toISOString().split("T")[0]
    dailyContentMap[day] = (dailyContentMap[day] || 0) + 1
  }
  const dailyContent = Object.entries(dailyContentMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Performance insights across your workspace</p>
        </div>
        <Badge variant="outline">Last {range} days</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Content</CardDescription>
            <CardTitle className="text-3xl">{totalContent ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>Created this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Generations</CardDescription>
            <CardTitle className="text-3xl">{totalGenerations ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>{successRate}% success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published Posts</CardDescription>
            <CardTitle className="text-3xl">{publishedPosts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>{scheduledPostsCount} scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Engagement Rate</CardDescription>
            <CardTitle className="text-3xl">{engagementRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>{totalEngagements.toLocaleString()} engagements</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Content by Type
            </CardTitle>
            <CardDescription>Distribution of content created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(typeCounts).length > 0 ? (
                Object.entries(typeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {type}
                    </Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No content created in this period</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Generation Performance
            </CardTitle>
            <CardDescription>AI model usage and success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-bold text-lg">{successRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-medium text-green-600">{completedGens.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed</span>
                <span className="font-medium text-red-600">{failedGens.length}</span>
              </div>
              {topModels.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Top Models</p>
                  {topModels.map((m) => (
                    <div key={m.name} className="flex items-center justify-between py-1">
                      <span className="text-sm">{m.name}</span>
                      <Badge variant="outline">{m.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publishing Pipeline & Credit Usage */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Publishing Pipeline
            </CardTitle>
            <CardDescription>Post scheduling and publishing stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="font-medium text-green-600">{publishedPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="font-medium text-blue-600">{scheduledPostsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed</span>
                <span className="font-medium text-red-600">{failedPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Publish Rate</span>
                <span className="font-bold">{publishRate}%</span>
              </div>
              {Object.keys(platformCounts).length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">By Platform</p>
                  {Object.entries(platformCounts).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between py-1">
                      <span className="text-sm capitalize">{platform}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Credit Usage
            </CardTitle>
            <CardDescription>Credit consumption and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Credits Used</span>
                <span className="font-bold text-red-600">{creditsUsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Credits Purchased</span>
                <span className="font-bold text-green-600">{creditsPurchased}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Balance</span>
                <span className="font-bold">{creditsPurchased - creditsUsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Cost/Generation</span>
                <span className="font-medium">{avgCostPerGeneration} credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement & Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
            <CardDescription>How your audience interacts with content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(engagementByType).length > 0 ? (
                Object.entries(engagementByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <span className="font-medium">{count.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No engagement data recorded yet. Tracking begins when posts are published.
                </p>
              )}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Impressions</span>
                  <span className="font-medium">{totalImpressions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Total Clicks</span>
                  <span className="font-medium">{totalClicks.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Content creation over time</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyContent.length > 0 ? (
              <AnalyticsChart
                data={Object.fromEntries(dailyContent.map((d) => [d.date, d.count]))}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                No content creation data for this period.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trend */}
      {dailyEngagement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
            <CardDescription>Daily engagement volume</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={Object.fromEntries(dailyEngagement.map((d) => [d.date, d.count]))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
