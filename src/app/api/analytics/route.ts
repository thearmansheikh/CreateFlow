import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const range = searchParams.get("range") || "30";

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(range, 10));
  const since = daysAgo.toISOString();

  // Fetch summary counts in parallel
  const [
    contentResult,
    generationResult,
    postsResult,
    analyticsEventsResult,
    creditUsageResult,
    contentByTypeResult,
    generationByStatusResult,
    postsByPlatformResult,
    engagementByTypeResult,
    dailyContentResult,
    dailyEngagementResult,
    topModelsResult,
  ] = await Promise.all([
    // Total content items created
    supabase
      .from("content_items")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", since),

    // Total generation tasks
    supabase
      .from("generation_tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", since),

    // Scheduled posts stats
    supabase
      .from("scheduled_posts")
      .select("id, status, published_at")
      .eq("workspace_id", workspaceId)
      .gte("scheduled_at", since),

    // Analytics events (engagement data)
    supabase
      .from("analytics_events")
      .select("event_type, event_value, platform, recorded_at")
      .eq("workspace_id", workspaceId)
      .gte("recorded_at", since),

    // Credit usage
    supabase
      .from("credit_transactions")
      .select("amount, type, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", since),

    // Content by type
    supabase
      .from("content_items")
      .select("type")
      .eq("workspace_id", workspaceId)
      .gte("created_at", since),

    // Generation by status
    supabase
      .from("generation_tasks")
      .select("status")
      .eq("workspace_id", workspaceId)
      .gte("created_at", since),

    // Posts by platform (from platforms JSON)
    supabase
      .from("scheduled_posts")
      .select("platforms")
      .eq("workspace_id", workspaceId)
      .gte("scheduled_at", since),

    // Engagement by type
    supabase
      .from("analytics_events")
      .select("event_type, event_value")
      .eq("workspace_id", workspaceId)
      .gte("recorded_at", since),

    // Daily content creation (for trend chart)
    supabase
      .from("content_items")
      .select("created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", since)
      .order("created_at", { ascending: true }),

    // Daily engagement (for trend chart)
    supabase
      .from("analytics_events")
      .select("event_value, recorded_at")
      .eq("workspace_id", workspaceId)
      .gte("recorded_at", since)
      .order("recorded_at", { ascending: true }),

    // Top AI models used
    supabase
      .from("generation_tasks")
      .select("model_used, type")
      .eq("workspace_id", workspaceId)
      .eq("status", "completed")
      .gte("created_at", since),
  ]);

  // ---- Compute content metrics ----
  const totalContent = contentResult.count ?? 0;
  const contentByType = ((contentByTypeResult.data ?? []) as { type: string }[]).reduce(
    (acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // ---- Compute generation metrics ----
  const totalGenerations = generationResult.count ?? 0;
  const generationStatuses = ((generationByStatusResult.data ?? []) as { status: string }[]).reduce(
    (acc: Record<string, number>, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const successRate =
    totalGenerations > 0
      ? Math.round(((generationStatuses.completed ?? 0) / totalGenerations) * 100)
      : 0;

  // Top models
  const modelCounts: Record<string, number> = {};
  for (const g of ((topModelsResult.data ?? []) as any[])) {
    const key = g.model_used || "unknown";
    modelCounts[key] = (modelCounts[key] || 0) + 1;
  }
  const topModels = Object.entries(modelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // ---- Compute publishing metrics ----
  const posts = (postsResult.data ?? []) as any[];
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const failedCount = posts.filter((p) => p.status === "failed").length;
  const publishRate =
    posts.length > 0 ? Math.round((publishedCount / posts.length) * 100) : 0;

  // Platform breakdown
  const platformCounts: Record<string, number> = {};
  for (const post of posts) {
    if (post.platforms && typeof post.platforms === "object") {
      for (const platform of Object.keys(post.platforms)) {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      }
    }
  }

  // ---- Compute engagement metrics ----
  const events = (analyticsEventsResult.data ?? []) as any[];
  const totalImpressions = events
    .filter((e) => e.event_type === "impression")
    .reduce((sum, e) => sum + (e.event_value ?? 1), 0);
  const totalEngagements = events
    .filter((e) => ["like", "comment", "share", "save"].includes(e.event_type))
    .reduce((sum, e) => sum + (e.event_value ?? 1), 0);
  const totalClicks = events
    .filter((e) => e.event_type === "click")
    .reduce((sum, e) => sum + (e.event_value ?? 1), 0);
  const engagementRate =
    totalImpressions > 0
      ? ((totalEngagements / totalImpressions) * 100).toFixed(2)
      : "0";

  const engagementByType = ((engagementByTypeResult.data ?? []) as any[]).reduce(
    (acc: Record<string, number>, item) => {
      acc[item.event_type] = (acc[item.event_type] || 0) + (item.event_value ?? 1);
      return acc;
    },
    {} as Record<string, number>
  );

  // ---- Compute credit metrics ----
  const creditsUsed = ((creditUsageResult.data ?? []) as any[])
    .filter((t) => t.type === "usage")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const creditsPurchased = ((creditUsageResult.data ?? []) as any[])
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + t.amount, 0);
  const avgCostPerGeneration =
    totalGenerations > 0 ? Math.round((creditsUsed / totalGenerations) * 100) / 100 : 0;

  // ---- Compute daily trends ----
  const dailyContentMap: Record<string, number> = {};
  for (const item of ((dailyContentResult.data ?? []) as any[])) {
    const day = new Date(item.created_at).toISOString().split("T")[0];
    dailyContentMap[day] = (dailyContentMap[day] || 0) + 1;
  }
  const dailyContent = Object.entries(dailyContentMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const dailyEngagementMap: Record<string, number> = {};
  for (const item of ((dailyEngagementResult.data ?? []) as any[])) {
    const day = new Date(item.recorded_at).toISOString().split("T")[0];
    dailyEngagementMap[day] =
      (dailyEngagementMap[day] || 0) + (item.event_value ?? 1);
  }
  const dailyEngagement = Object.entries(dailyEngagementMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    summary: {
      totalContent,
      totalGenerations,
      publishedPosts: publishedCount,
      scheduledPosts: scheduledCount,
      totalImpressions,
      totalEngagements,
      totalClicks,
      engagementRate: parseFloat(engagementRate),
      creditsUsed,
      creditsPurchased,
      avgCostPerGeneration,
    },
    content: {
      byType: contentByType,
      daily: dailyContent,
    },
    generation: {
      successRate,
      byStatus: generationStatuses,
      topModels,
    },
    publishing: {
      published: publishedCount,
      scheduled: scheduledCount,
      failed: failedCount,
      publishRate,
      byPlatform: platformCounts,
    },
    engagement: {
      byType: engagementByType,
      daily: dailyEngagement,
    },
    credits: {
      used: creditsUsed,
      purchased: creditsPurchased,
      avgCostPerGeneration,
    },
  });
}
