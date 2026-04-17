"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Grid3X3,
  List,
  Filter,
  Star,
  StarOff,
  Trash2,
  FolderPlus,
  Upload,
  MoreVertical,
  Image,
  Video,
  Music,
  FileText,
  FolderOpen,
  ChevronDown,
  Check,
  X,
  FolderInput,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"]

const typeIcons = {
  image: Image,
  video: Video,
  music: Music,
  copy: FileText,
  upload: FolderOpen,
}

const typeColors = {
  image: "from-blue-500 to-cyan-500",
  video: "from-violet-500 to-purple-500",
  music: "from-pink-500 to-rose-500",
  copy: "from-amber-500 to-orange-500",
  upload: "from-emerald-500 to-teal-500",
}

// Demo data until Supabase is connected
const demoContent: ContentItem[] = [
  {
    id: "1", workspace_id: "ws-1", user_id: "user-1", type: "image",
    title: "Summer Campaign Hero", description: "AI-generated summer campaign image",
    file_url: null, thumbnail_url: null, file_size: null, mime_type: "image/png",
    width: 1920, height: 1080, duration: null, tags: ["campaign", "summer"],
    folder_id: null, brand_profile_id: null, is_favorite: true,
    ai_model_used: "flux-pro-1.1", original_prompt: "A vibrant summer scene with tropical colors",
    created_at: "2025-04-15T10:00:00Z", updated_at: "2025-04-15T10:00:00Z",
  },
  {
    id: "2", workspace_id: "ws-1", user_id: "user-1", type: "video",
    title: "Product Reel - Sneakers", description: null,
    file_url: null, thumbnail_url: null, file_size: null, mime_type: "video/mp4",
    width: 1080, height: 1920, duration: 15, tags: ["product", "reel"],
    folder_id: null, brand_profile_id: null, is_favorite: false,
    ai_model_used: "kling-1.5", original_prompt: "Sneaker product reveal with dynamic lighting",
    created_at: "2025-04-14T14:00:00Z", updated_at: "2025-04-14T14:00:00Z",
  },
  {
    id: "3", workspace_id: "ws-1", user_id: "user-1", type: "music",
    title: "Upbeat Podcast Intro", description: null,
    file_url: null, thumbnail_url: null, file_size: null, mime_type: "audio/mp3",
    width: null, height: null, duration: 30, tags: ["podcast", "intro"],
    folder_id: null, brand_profile_id: null, is_favorite: false,
    ai_model_used: "suno-v3.5", original_prompt: "Upbeat electronic podcast intro, 30 seconds",
    created_at: "2025-04-13T09:00:00Z", updated_at: "2025-04-13T09:00:00Z",
  },
  {
    id: "4", workspace_id: "ws-1", user_id: "user-1", type: "copy",
    title: "Instagram Caption - Launch", description: null,
    file_url: null, thumbnail_url: null, file_size: null, mime_type: null,
    width: null, height: null, duration: null, tags: ["social", "launch"],
    folder_id: null, brand_profile_id: null, is_favorite: true,
    ai_model_used: "claude-3.5-sonnet", original_prompt: "Write an engaging Instagram caption for a product launch",
    created_at: "2025-04-12T16:00:00Z", updated_at: "2025-04-12T16:00:00Z",
  },
  {
    id: "5", workspace_id: "ws-1", user_id: "user-1", type: "image",
    title: "Brand Mood Board", description: null,
    file_url: null, thumbnail_url: null, file_size: null, mime_type: "image/png",
    width: 1200, height: 800, duration: null, tags: ["brand", "mood"],
    folder_id: null, brand_profile_id: null, is_favorite: false,
    ai_model_used: "flux-pro-1.1", original_prompt: "Minimalist brand mood board with earth tones",
    created_at: "2025-04-11T11:00:00Z", updated_at: "2025-04-11T11:00:00Z",
  },
  {
    id: "6", workspace_id: "ws-1", user_id: "user-1", type: "image",
    title: "Social Media Post - Quote", description: null,
    file_url: null, thumbnail_url: null, file_size: null, mime_type: "image/png",
    width: 1080, height: 1080, duration: null, tags: ["social", "quote"],
    folder_id: null, brand_profile_id: null, is_favorite: false,
    ai_model_used: "flux-pro-1.1", original_prompt: "Motivational quote on dark gradient background",
    created_at: "2025-04-10T08:00:00Z", updated_at: "2025-04-10T08:00:00Z",
  },
]

const demoFolders = [
  { id: "f1", name: "Campaigns", color: "#3b82f6", icon: "📁", count: 12 },
  { id: "f2", name: "Social Posts", color: "#8b5cf6", icon: "📱", count: 8 },
  { id: "f3", name: "Brand Assets", color: "#ec4899", icon: "🎨", count: 24 },
  { id: "f4", name: "Music & Audio", color: "#f59e0b", icon: "🎵", count: 5 },
]

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return demoContent.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchesType = typeFilter === "all" || item.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [search, typeFilter])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)))
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Folder Sidebar */}
      <div className="hidden w-56 border-r border-border/50 bg-card/30 p-4 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Folders</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setActiveFolder(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              !activeFolder ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            All Files
            <span className="ml-auto text-xs">{demoContent.length}</span>
          </button>
          {demoFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                activeFolder === folder.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <span>{folder.icon}</span>
              {folder.name}
              <span className="ml-auto text-xs">{folder.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-border/50 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filter
            </Button>

            <div className="flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
              <Check className="h-4 w-4" />
              {selectedIds.size} selected
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6 text-primary hover:bg-primary/20"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
            <span className="text-xs text-muted-foreground">Type:</span>
            {["all", "image", "video", "music", "copy"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  typeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 border-b border-border/50 bg-secondary px-4 py-2">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="h-4 w-px bg-border" />
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <FolderInput className="mr-1.5 h-3.5 w-3.5" />
              Move
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              {selectedIds.size === 1 && demoContent.find(i => i.id === selectedIds.values().next().value)?.is_favorite ? (
                <StarOff className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Star className="mr-1.5 h-3.5 w-3.5" />
              )}
              Favorite
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No content found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? "Try a different search term" : "Start creating to build your library"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={() => toggleSelect(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* List header */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-1" />
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Tags</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {filtered.map((item) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={() => toggleSelect(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentCard({ item, selected, onSelect }: {
  item: ContentItem
  selected: boolean
  onSelect: () => void
}) {
  const Icon = typeIcons[item.type]
  const color = typeColors[item.type]

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md cursor-pointer",
        selected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect() }}
        className={cn(
          "absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border transition-opacity",
          selected
            ? "border-primary bg-primary text-primary-foreground opacity-100"
            : "border-border/50 bg-background/80 opacity-0 group-hover:opacity-100"
        )}
      >
        {selected && <Check className="h-3 w-3" />}
      </button>

      {/* Favorite */}
      {item.is_favorite && (
        <Star className="absolute right-2 top-2 z-10 h-4 w-4 fill-amber-400 text-amber-400" />
      )}

      {/* Thumbnail area */}
      <div className={cn(
        "flex h-40 items-center justify-center bg-gradient-to-br",
        color,
        "text-white/80"
      )}>
        <Icon className="h-12 w-12 opacity-60" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="truncate text-sm font-medium">{item.title || "Untitled"}</h4>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
          {item.width && item.height && (
            <span className="text-xs text-muted-foreground">{item.width}×{item.height}</span>
          )}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function ContentRow({ item, selected, onSelect }: {
  item: ContentItem
  selected: boolean
  onSelect: () => void
}) {
  const Icon = typeIcons[item.type]

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-center gap-4 rounded-lg px-3 py-2 transition-colors cursor-pointer hover:bg-accent/50",
        selected && "bg-primary/5"
      )}
      onClick={onSelect}
    >
      <div className="col-span-1">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded border",
            selected ? "border-primary bg-primary text-primary-foreground" : "border-border/50"
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </button>
      </div>
      <div className="col-span-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{item.title || "Untitled"}</span>
        {item.is_favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
      </div>
      <div className="col-span-2 text-xs capitalize text-muted-foreground">{item.type}</div>
      <div className="col-span-2 flex gap-1">
        {item.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
      <div className="col-span-2 text-xs text-muted-foreground">
        {new Date(item.created_at).toLocaleDateString()}
      </div>
      <div className="col-span-1 flex justify-end">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
