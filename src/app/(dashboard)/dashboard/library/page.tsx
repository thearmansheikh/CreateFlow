import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LibraryClient } from "./library-client"

interface Workspace { id: string }
interface Folder { id: string; name: string; color: string | null; icon: string | null; parent_folder_id: string | null }
interface ContentItem { id: string; workspace_id: string; user_id: string | null; type: string; title: string | null; description: string | null; file_url: string | null; thumbnail_url: string | null; file_size: number | null; mime_type: string | null; width: number | null; height: number | null; duration: number | null; tags: string[]; folder_id: string | null; brand_profile_id: string | null; is_favorite: boolean; ai_model_used: string | null; original_prompt: string | null; created_at: string; updated_at: string }

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  const workspaceResult = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)

  const workspace = workspaceResult.data?.[0] as Workspace | undefined

  if (!workspace) {
    redirect("/auth/sign-in")
  }

  const workspaceId = workspace.id

  const { data: contentItems } = await supabase
    .from("content_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  const { data: folders } = await supabase
    .from("folders")
    .select("id, name, color, icon, parent_folder_id")
    .eq("workspace_id", workspaceId)
    .order("name")

  return <LibraryClient contentItems={(contentItems || []) as ContentItem[]} folders={(folders || []) as Folder[]} />
}
