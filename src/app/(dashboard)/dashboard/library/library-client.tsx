"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
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
  Eye,
  Loader2,
  AlertCircle,
  Copy,
  Download,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface ContentItem {
  id: string
  workspace_id: string
  user_id: string | null
  type: "image" | "video" | "music" | "copy" | "upload"
  title: string | null
  description: string | null
  file_url: string | null
  thumbnail_url: string | null
  file_size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  duration: number | null
  tags: string[]
  folder_id: string | null
  brand_profile_id: string | null
  is_favorite: boolean
  ai_model_used: string | null
  original_prompt: string | null
  created_at: string
  updated_at: string
}

interface Folder {
  id: string
  workspace_id: string
  name: string
  color: string | null
  icon: string | null
  parent_folder_id: string | null
  created_at: string
}

const typeIcons: Record<string, typeof Image> = {
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

const folderIcons = ["📁", "🎨", "📸", "🎵", "🎬", "📝", "⭐", "💼", "📦", "🏷️"]

export function LibraryClient({
  contentItems: initialItems,
  folders: initialFolders,
}: {
  contentItems: ContentItem[]
  folders: Folder[]
}) {
  const [contentItems, setContentItems] = useState(initialItems)
  const [folders, setFolders] = useState(initialFolders)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderIcon, setNewFolderIcon] = useState("📁")
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedDropFolder, setSelectedDropFolder] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  // Get workspace ID on mount
  useEffect(() => {
    const fetchWorkspace = async () => {
      const supabase = createClient()
      const { data } = await (supabase.from("workspaces") as any).select("id").limit(1).single()
      if (data) setWorkspaceId(data.id)
    }
    fetchWorkspace()
  }, [])

  // ─── Drag & drop ──────────────────────────────────────────
  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const onDragLeave = (e: DragEvent) => { if (!el.contains(e.relatedTarget as Node)) setIsDragging(false) }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer?.files?.length) {
        handleUpload(e.dataTransfer.files)
      }
    }
    el.addEventListener("dragover", onDragOver)
    el.addEventListener("dragleave", onDragLeave)
    el.addEventListener("drop", onDrop)
    return () => { el.removeEventListener("dragover", onDragOver); el.removeEventListener("dragleave", onDragLeave); el.removeEventListener("drop", onDrop) }
  }, [])

  // ─── Folder creation ───────────────────────────────────────
  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim() || !workspaceId) return
    const supabase = createClient()

    const { data, error } = await (supabase
      .from("folders") as any)
      .insert({ name: newFolderName.trim(), icon: newFolderIcon, workspace_id: workspaceId })
      .select()
      .single()

    if (error) { console.error("Folder creation failed:", error); return }
    setFolders(prev => [...prev, data])
    setNewFolderName("")
    setNewFolderIcon("📁")
    setShowFolderModal(false)
  }, [newFolderName, newFolderIcon])

  // ─── File upload ───────────────────────────────────────────
  const handleUpload = useCallback(async (files: FileList) => {
    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    setUploadSuccessCount(0)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); setUploadError("Not authenticated"); return }
    if (!workspaceId) { setUploading(false); setUploadError("No workspace"); return }

    const storageKey = `content/${workspaceId}`
    let successCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(Math.round(((i) / files.length) * 100))

      const fileExt = file.name.split(".").pop()?.toLowerCase() || ""
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${storageKey}/${fileName}`

      // Determine type
      let type: ContentItem["type"] = "upload"
      if (file.type.startsWith("image/")) type = "image"
      else if (file.type.startsWith("video/")) type = "video"
      else if (file.type.startsWith("audio/")) type = "music"
      else if (file.type.startsWith("text/") || fileExt === "md" || fileExt === "txt") type = "copy"

      // Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from("content")
        .upload(filePath, file, { contentType: file.type })

      if (uploadErr) {
        setUploadError(`"${file.name}": ${uploadErr.message}`)
        continue
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("content")
        .getPublicUrl(filePath)

      // Insert content item (only use columns that exist in the DB)
      const { data: item, error: dbErr } = await (supabase
        .from("content_items") as any)
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ""),
          type,
          mime_type: file.type,
          file_url: publicUrl,
          file_size: file.size,
          folder_id: activeFolder,
          workspace_id: workspaceId,
          user_id: user.id,
        })
        .select()
        .single()

      if (dbErr) {
        console.error("DB insert failed:", dbErr)
        setUploadError(`"${file.name}": ${dbErr.message}`)
        continue
      }

      setContentItems(prev => [...prev, item])
      successCount++
    }

    setUploadProgress(100)
    setUploadSuccessCount(successCount)
    setUploading(false)
    if (successCount > 0 && !uploadError) {
      setTimeout(() => { setShowUploadModal(false); setUploadSuccessCount(0) }, 800)
    }
  }, [activeFolder, uploadError])

  // ─── Multi-select actions ─────────────────────────────────
  const handleBulkStar = useCallback(async () => {
    setActionLoading(true)
    const supabase = createClient()
    const { error } = await (supabase.from("content_items") as any)
      .update({ is_favorite: true })
      .in("id", Array.from(selectedIds))
    if (!error) setContentItems(prev => prev.map(i => selectedIds.has(i.id!) ? { ...i, is_favorite: true } : i))
    setActionLoading(false)
    setSelectedIds(new Set())
  }, [selectedIds])

  const handleBulkDelete = useCallback(async () => {
    if (!confirm(`Delete ${selectedIds.size} items? This cannot be undone.`)) return
    setActionLoading(true)
    const supabase = createClient()
    const toDelete = contentItems.filter(i => selectedIds.has(i.id!))
    const { error } = await (supabase.from("content_items") as any)
      .delete()
      .in("id", Array.from(selectedIds))
    if (!error) {
      for (const item of toDelete) {
        if (item.file_url) {
          const urlPath = item.file_url.split("/").slice(3).join("/")
          await supabase.storage.from("content").remove([urlPath]).catch(() => {})
        }
      }
      setContentItems(prev => prev.filter(i => !selectedIds.has(i.id!)))
    }
    setActionLoading(false)
    setSelectedIds(new Set())
  }, [selectedIds, contentItems])

  const handleBulkMove = useCallback(async (targetFolderId: string | null) => {
    setActionLoading(true)
    const supabase = createClient()
    const { error } = await (supabase.from("content_items") as any)
      .update({ folder_id: targetFolderId })
      .in("id", Array.from(selectedIds))
    if (!error) setContentItems(prev => prev.map(i => selectedIds.has(i.id!) ? { ...i, folder_id: targetFolderId } : i))
    setActionLoading(false)
    setSelectedIds(new Set())
    setShowMoveModal(false)
  }, [selectedIds])

  const handleToggleStar = useCallback(async (item: ContentItem) => {
    const supabase = createClient()
    const newStarred = !item.is_favorite
    const { error } = await (supabase.from("content_items") as any).update({ is_favorite: newStarred }).eq("id", item.id!)
    if (!error) setContentItems(prev => prev.map(i => i.id === item.id ? { ...i, is_favorite: newStarred } : i))
  }, [])

  const handleDeleteSingle = useCallback(async (item: ContentItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return
    const supabase = createClient()
    const { error } = await (supabase.from("content_items") as any).delete().eq("id", item.id!)
    if (!error && item.file_url) {
      const urlPath = item.file_url.split("/").slice(3).join("/")
      await supabase.storage.from("content").remove([urlPath]).catch(() => {})
    }
    setContentItems(prev => prev.filter(i => i.id !== item.id))
    if (selectedItem?.id === item.id) { setSelectedItem(null); setShowDetailModal(false) }
  }, [selectedItem])

  // ─── Filtering ─────────────────────────────────────────────
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

  const openDetail = (item: ContentItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div ref={dropRef} className="flex h-[calc(100vh-4rem)] relative">
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary m-4 rounded-xl">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-3" />
            <p className="text-lg font-semibold text-primary">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Folder sidebar */}
      <div className="hidden w-64 shrink-0 border-r bg-card/50 p-4 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Folders</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowFolderModal(true)}>
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleBulkStar()} disabled={actionLoading}>
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowMoveModal(true)} disabled={actionLoading}>
                  <FolderInput className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleBulkDelete()} disabled={actionLoading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedIds(new Set())}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => { setShowUploadModal(true); setUploadError(null); setUploadSuccessCount(0) }}>
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
                  onSelect={() => openDetail(item)}
                  onStar={() => handleToggleStar(item)}
                  onDelete={() => handleDeleteSingle(item)}
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
                  onSelect={() => openDetail(item)}
                  onStar={() => handleToggleStar(item)}
                  onDelete={() => handleDeleteSingle(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Upload Modal ─────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Files</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer?.files?.length) handleUpload(e.dataTransfer.files) }}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Images, video, audio, documents</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files?.length) handleUpload(e.target.files) }}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {uploadSuccessCount > 0 && !uploading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
                <Check className="h-4 w-4" />
                {uploadSuccessCount} file{uploadSuccessCount > 1 ? "s" : ""} uploaded successfully
              </div>
            )}

            {uploadError && (
              <div className="mt-4 flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── New Folder Modal ─────────────────────────────── */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}>
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Folder</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFolderModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Folder name</label>
                <Input
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="e.g. Brand Assets"
                  onKeyDown={e => { if (e.key === "Enter") handleCreateFolder() }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {folderIcons.map(icon => (
                    <button
                      key={icon}
                      className={cn(
                        "w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all",
                        newFolderIcon === icon ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setNewFolderIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowFolderModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create Folder</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─────────────────────────────────── */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}>
          <div className="w-full max-w-2xl rounded-xl border bg-card shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = typeIcons[selectedItem.type as keyof typeof typeIcons] || FolderOpen
                  const color = typeColors[selectedItem.type] || "from-gray-500 to-gray-600"
                  return (
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br", color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  )
                })()}
                <div>
                  <h3 className="font-semibold">{selectedItem.title || "Untitled"}</h3>
                  <p className="text-xs text-muted-foreground">{selectedItem.type?.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleToggleStar(selectedItem)}>
                  {selectedItem.is_favorite ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSingle(selectedItem)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="aspect-video bg-black/20 flex items-center justify-center">
              {selectedItem.type === "image" && selectedItem.file_url ? (
                <img src={selectedItem.file_url} alt={selectedItem.title || ""} className="max-h-full max-w-full object-contain" />
              ) : selectedItem.type === "video" && selectedItem.file_url ? (
                <video src={selectedItem.file_url} controls className="max-h-full max-w-full" />
              ) : selectedItem.type === "music" && selectedItem.file_url ? (
                <div className="text-center">
                  <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <audio src={selectedItem.file_url} controls className="w-80" />
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No preview available</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-4 border-t">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size</span>
                  <p className="font-medium">{formatFileSize(selectedItem.file_size)}</p>
                </div>
                {selectedItem.mime_type && (
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{selectedItem.mime_type}</p>
                  </div>
                )}
                {selectedItem.width && selectedItem.height && (
                  <div>
                    <span className="text-muted-foreground">Dimensions</span>
                    <p className="font-medium">{selectedItem.width} × {selectedItem.height}</p>
                  </div>
                )}
              </div>

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mt-3 flex gap-1.5 flex-wrap">
                  {selectedItem.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t">
                {selectedItem.file_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Open Original
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(selectedItem.file_url || ""); }}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy URL
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Move to Folder Modal ─────────────────────────── */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowMoveModal(false)}>
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Move {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMoveModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1 max-h-64 overflow-auto">
              <button
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedDropFolder === null ? "bg-secondary" : "hover:bg-secondary/50"
                )}
                onClick={() => setSelectedDropFolder(null)}
              >
                <FolderOpen className="inline h-4 w-4 mr-2" />
                All Content (no folder)
              </button>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedDropFolder === folder.id ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                  onClick={() => setSelectedDropFolder(folder.id ?? null)}
                >
                  <span className="mr-2">{folder.icon || "📁"}</span>
                  {folder.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowMoveModal(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={() => handleBulkMove(selectedDropFolder)}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Move Here
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ContentGridCard({
  item,
  isSelected,
  onToggle,
  onSelect,
  onStar,
  onDelete,
}: {
  item: ContentItem
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  onStar: () => void
  onDelete: () => void
}) {
  const Icon = typeIcons[item.type as keyof typeof typeIcons] || FolderOpen
  const color = typeColors[item.type] || "from-gray-500 to-gray-600"

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card transition-all hover:border-primary/50 hover:shadow-md",
        isSelected && "border-primary ring-1 ring-primary"
      )}
    >
      {isSelected && (
        <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Thumbnail */}
      <div
        className={cn("flex aspect-square items-center justify-center bg-gradient-to-br cursor-pointer", color)}
        onClick={onSelect}
      >
        {item.type === "image" && item.file_url ? (
          <img src={item.file_url} alt={item.title || ""} className="w-full h-full object-cover" />
        ) : (
          <Icon className="h-10 w-10 text-white/80" />
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium cursor-pointer" onClick={onSelect}>{item.title || "Untitled"}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
      </div>

      {/* Quick actions overlay */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
          onClick={e => { e.stopPropagation(); onStar() }}
        >
          {item.is_favorite ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : <StarOff className="h-3.5 w-3.5 text-white/80" />}
        </button>
      </div>
      <div className="absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/80 transition-colors"
          onClick={e => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 className="h-3.5 w-3.5 text-white/80" />
        </button>
      </div>

      {/* Selection checkbox */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
            isSelected ? "border-primary bg-primary" : "border-white/60 bg-black/20"
          )}
          onClick={e => { e.stopPropagation(); onToggle() }}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </button>
      </div>
    </div>
  )
}

function ContentListRow({
  item,
  isSelected,
  onToggle,
  onSelect,
  onStar,
  onDelete,
}: {
  item: ContentItem
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  onStar: () => void
  onDelete: () => void
}) {
  const Icon = typeIcons[item.type as keyof typeof typeIcons] || FolderOpen
  const color = typeColors[item.type] || "from-gray-500 to-gray-600"

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-3 transition-all hover:border-primary/50",
        isSelected && "border-primary ring-1 ring-primary"
      )}
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br cursor-pointer", color)} onClick={onSelect}>
        {item.type === "image" && item.file_url ? (
          <img src={item.file_url} alt={item.title || ""} className="w-full h-full object-cover rounded" />
        ) : (
          <Icon className="h-6 w-6 text-white/80" />
        )}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{item.title || "Untitled"}</p>
          {item.is_favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground">
          {item.type?.toUpperCase()} {item.mime_type ? `• ${item.mime_type}` : ""} {item.width ? `• ${item.width}x${item.height}` : ""}
        </p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.created_at)}</span>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onStar() }}>
          {item.is_favorite ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onDelete() }}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onToggle() }}>
          {isSelected ? <Check className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />}
        </Button>
      </div>
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
