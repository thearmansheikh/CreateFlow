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
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"]
type Folder = Database["public"]["Tables"]["folders"]["Row"]

const typeIcons = {
  image: Image,
  video: Video,
  music: Music,
  copy: FileText,
  upload: FolderOpen,
}

const typeColors: Record<string, string> = {
  image: "from-blue-500 to-cyan-500",
  video: "from-violet-500 to-purple-500",
  music: "from-pink-500 to-rose-500",
  copy: "from-amber-500 to-orange-500",
  upload: "from-emerald-500 to-teal-500",
}

export function LibraryClient({
  contentItems,
  folders,
}: {
  contentItems: ContentItem[]
  folders: Folder[]
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchesType = typeFilter === "all" || item.type === typeFilter
      const matchesFolder = !activeFolder || item.folder_id === activeFolder
      return matchesSearch && matchesType && matchesFolder
    })
  }, [search, typeFilter, activeFolder, contentItems])

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
      setSelectedIds(new Set(filtered.map((i) => i.id!)))
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return then.toLocaleDateString()
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Folder sidebar */}
      <div className="hidden w-64 shrink-0 border-r bg-card/50 p-4 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Folders</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant={!activeFolder ? "secondary" : "ghost"}
          size="sm"
          className="mb-1 w-full justify-start"
          onClick={() => setActiveFolder(null)}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          All Content
          <span className="ml-auto text-xs text-muted-foreground">{contentItems.length}</span>
        </Button>

        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={activeFolder === folder.id ? "secondary" : "ghost"}
            size="sm"
            className="mb-1 w-full justify-start"
            onClick={() => setActiveFolder(folder.id ?? null)}
          >
            <span className="mr-2">{folder.icon || "📁"}</span>
            {folder.name}
          </Button>
        ))}

        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <Star className="mr-2 h-4 w-4 text-amber-400" />
            Favorites
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b bg-card/50 p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={typeFilter === "all" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
            >
              All
            </Button>
            <Button
              variant={typeFilter === "image" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("image")}
            >
              <Image className="mr-1 h-3.5 w-3.5" />
              Image
            </Button>
            <Button
              variant={typeFilter === "video" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("video")}
            >
              <Video className="mr-1 h-3.5 w-3.5" />
              Video
            </Button>
            <Button
              variant={typeFilter === "music" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("music")}
            >
              <Music className="mr-1 h-3.5 w-3.5" />
              Music
            </Button>
            <Button
              variant={typeFilter === "copy" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("copy")}
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              Copy
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FolderInput className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedIds(new Set())}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>

            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No content yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start creating to fill your library"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((item) => (
                <ContentGridCard
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id!)}
                  onToggle={() => toggleSelect(item.id!)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <ContentListRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id!)}
                  onToggle={() => toggleSelect(item.id!)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentGridCard({
  item,
  isSelected,
  onToggle,
}: {
  item: ContentItem
  isSelected: boolean
  onToggle: () => void
}) {
  const Icon = typeIcons[item.type as keyof typeof typeIcons] || FolderOpen
  const color = typeColors[item.type] || "from-gray-500 to-gray-600"

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:border-primary/50 hover:shadow-md",
        isSelected && "border-primary ring-1 ring-primary"
      )}
      onClick={onToggle}
    >
      {isSelected && (
        <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Placeholder thumbnail */}
      <div className={cn("flex aspect-square items-center justify-center bg-gradient-to-br", color)}>
        <Icon className="h-10 w-10 text-white/80" />
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium">{item.title || "Untitled"}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
      </div>
    </div>
  )
}

function ContentListRow({
  item,
  isSelected,
  onToggle,
}: {
  item: ContentItem
  isSelected: boolean
  onToggle: () => void
}) {
  const Icon = typeIcons[item.type as keyof typeof typeIcons] || FolderOpen
  const color = typeColors[item.type] || "from-gray-500 to-gray-600"

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-3 transition-all hover:border-primary/50",
        isSelected && "border-primary ring-1 ring-primary"
      )}
      onClick={onToggle}
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded bg-gradient-to-br", color)}>
        <Icon className="h-6 w-6 text-white/80" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{item.title || "Untitled"}</p>
        <p className="text-xs text-muted-foreground">
          {item.type.toUpperCase()} {item.mime_type ? `• ${item.mime_type}` : ""} {item.width ? `• ${item.width}x${item.height}` : ""}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  )
}

function timeAgo(date: string) {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}
