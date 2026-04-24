"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Platform = "instagram" | "twitter" | "youtube" | "linkedin" | "facebook" | "tiktok"

const PLATFORM_ABBREVS: Record<Platform, string> = {
  instagram: "IG",
  twitter: "X",
  youtube: "YT",
  linkedin: "LI",
  facebook: "FB",
  tiktok: "TT",
}

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  twitter: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  youtube: "bg-red-500/10 text-red-500 border-red-500/20",
  linkedin: "bg-blue-600/10 text-blue-600 border-blue-600/20",
  facebook: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  tiktok: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  draft: { label: "Draft", icon: AlertCircle, color: "text-muted-foreground" },
  scheduled: { label: "Scheduled", icon: Clock, color: "text-yellow-500" },
  published: { label: "Published", icon: CheckCircle2, color: "text-green-500" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-500" },
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface ScheduledPost {
  id: string
  caption: string | null
  platforms: Record<string, boolean> | null
  scheduled_at: string
  status: "draft" | "scheduled" | "publishing" | "published" | "failed" | "cancelled"
  content_ids?: string[]
}

export default function CalendarPage() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState({
    caption: "",
    platforms: {} as Record<Platform, boolean>,
    date: "",
    time: "",
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year

  // Load posts for current month
  const loadPosts = useCallback(async () => {
    setLoading(true)
    const startDate = new Date(year, month, 1).toISOString()
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    const { data } = await supabase
      .from("scheduled_posts")
      .select("*")
      .gte("scheduled_at", startDate)
      .lte("scheduled_at", endDate)
      .order("scheduled_at", { ascending: true })

    setPosts(data || [])
    setLoading(false)
  }, [year, month, supabase])

  // Get posts for a specific day
  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return posts.filter((p) => p.scheduled_at.startsWith(dateStr))
  }

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Create calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const handleSavePost = async () => {
    if (!newPost.caption || !newPost.date || !newPost.time) return

    const selectedPlatforms = Object.entries(newPost.platforms)
      .filter(([, v]) => v)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

    const scheduledAt = `${newPost.date}T${newPost.time}:00`

    const { error } = await supabase.from("scheduled_posts").insert({
      caption: newPost.caption,
      platforms: selectedPlatforms,
      scheduled_at: scheduledAt,
      status: "scheduled",
      workspace_id: member?.workspace_id,
    })

    if (!error) {
      setShowNewPost(false)
      setNewPost({ caption: "", platforms: {} as Record<Platform, boolean>, date: "", time: "" })
      loadPosts()
    }
  }

  return (
    <div className="flex-1 space-y-6 overflow-auto p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Content Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule and manage your content across platforms.</p>
        </div>
        <Button onClick={() => setShowNewPost(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Caption</label>
                <Input
                  value={newPost.caption}
                  onChange={(e) => setNewPost((p) => ({ ...p, caption: e.target.value }))}
                  placeholder="Summer product launch announcement"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newPost.date}
                  onChange={(e) => setNewPost((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newPost.time}
                  onChange={(e) => setNewPost((p) => ({ ...p, time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PLATFORM_ABBREVS) as Platform[]).map((platform) => (
                    <button
                      key={platform}
                      onClick={() =>
                        setNewPost((p) => ({
                          ...p,
                          platforms: { ...p.platforms, [platform]: !p.platforms[platform] },
                        }))
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                        newPost.platforms[platform]
                          ? PLATFORM_COLORS[platform]
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {PLATFORM_ABBREVS[platform]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePost}>Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <CalendarIcon className="h-3 w-3" />
          {posts.length} scheduled
        </Badge>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((day) => (
              <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[120px] border-b border-r border-border bg-muted/20" />
              }

              const dayPosts = getPostsForDay(day)
              const isToday = isCurrentMonth && day === today.getDate()

              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[120px] border-b border-r border-border p-2 transition-colors hover:bg-muted/30",
                    selectedDay === `${year}-${month + 1}-${day}` && "bg-muted/50"
                  )}
                  onClick={() => setSelectedDay(`${year}-${month + 1}-${day}`)}
                >
                  <div
                    className={cn(
                      "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post) => {
                      const StatusIcon = STATUS_CONFIG[post.status]?.icon || AlertCircle
                      const statusColor = STATUS_CONFIG[post.status]?.color || "text-muted-foreground"
                      const platforms = Object.keys(post.platforms || {})
                      const firstPlatform = platforms[0] as Platform | undefined

                      return (
                        <div
                          key={post.id}
                          className={cn(
                            "rounded-md border p-1.5 text-xs",
                            firstPlatform ? PLATFORM_COLORS[firstPlatform] : "border-border"
                          )}
                        >
                          <div className="truncate font-medium">{post.caption}</div>
                          <div className="mt-1 flex items-center gap-1">
                            <StatusIcon className={cn("h-2.5 w-2.5", statusColor)} />
                            <span className={statusColor}>
                              {new Date(post.scheduled_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {dayPosts.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {new Date(selectedDay).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const day = parseInt(selectedDay.split("-")[2])
              const dayPosts = getPostsForDay(day)
              if (dayPosts.length === 0) {
                return <p className="text-sm text-muted-foreground">No posts scheduled for this day.</p>
              }
              return (
                <div className="space-y-3">
                  {dayPosts.map((post) => {
                    const StatusIcon = STATUS_CONFIG[post.status]?.icon || AlertCircle
                    const statusColor = STATUS_CONFIG[post.status]?.color || "text-muted-foreground"
                    const platforms = Object.keys(post.platforms || {}) as Platform[]

                    return (
                      <div key={post.id} className="flex items-start gap-3 rounded-lg border p-3">
                        <div className="flex-1">
                          <p className="font-medium">{post.caption}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{post.caption}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {platforms.map((platform) => (
                                <div
                                  key={platform}
                                  className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full border bg-background text-[8px] font-bold",
                                    PLATFORM_COLORS[platform].split(" ")[1]
                                  )}
                                >
                                  {PLATFORM_ABBREVS[platform]}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {platforms.length} platform{platforms.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={cn("flex items-center gap-1 text-xs", statusColor)}>
                            <StatusIcon className="h-3 w-3" />
                            {STATUS_CONFIG[post.status]?.label}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.scheduled_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
