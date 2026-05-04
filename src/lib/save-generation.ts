import { createAdminClient } from './supabase/admin'

export interface SaveGenerationInput {
  userId: string
  workspaceId: string
  type: 'image' | 'video' | 'music' | 'copy'
  title: string
  prompt: string
  outputUrl?: string
  outputText?: string
  modelUsed: string
  mimeType?: string
  fileSize?: number
  width?: number
  height?: number
  duration?: number
  brandProfileId?: string
  folderId?: string
  tags?: string[]
}

export async function saveGeneration(input: SaveGenerationInput) {
  // Admin client: callers have already verified user auth + workspace ownership.
  // Avoids RLS evaluation on every save (and dodges the workspaces policy
  // recursion bug that breaks anon-key writes).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  // Resolve workspace_id if the caller didn't pass one. Some client code
  // paths submit generations before the workspace selector has hydrated;
  // generation_tasks.workspace_id is NOT NULL so we'd fail the insert.
  let workspaceId = input.workspaceId
  if (!workspaceId) {
    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (!member?.workspace_id) {
      console.error('Generation save: no workspace for user', input.userId)
      return { success: false, error: 'No workspace found for user' }
    }
    workspaceId = member.workspace_id
  }

  // 1. Save to generation_tasks table
  const { data: generation, error: genError } = await supabase
    .from('generation_tasks')
    .insert({
      user_id: input.userId,
      workspace_id: workspaceId,
      type: input.type,
      prompt: input.prompt,
      model_used: input.modelUsed,
      result_url: input.outputUrl,
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
      parameters: {
        width: input.width,
        height: input.height,
        duration: input.duration,
        mime_type: input.mimeType,
        file_size: input.fileSize,
        output_text: input.outputText,
        brand_profile_id: input.brandProfileId,
        folder_id: input.folderId,
        tags: input.tags,
      },
    })
    .select()
    .single()

  if (genError) {
    console.error('Generation save error:', genError)
    return { success: false, error: genError.message }
  }

  // 2. Create content_item for the library
  const contentTypes: Record<string, 'image' | 'video' | 'music' | 'copy'> = {
    image: 'image',
    video: 'video',
    music: 'music',
    copy: 'copy',
  }

  const { error: contentError } = await supabase
    .from('content_items')
    .insert({
      user_id: input.userId,
      workspace_id: workspaceId,
      type: contentTypes[input.type] ?? 'upload',
      title: input.title,
      description: input.prompt,
      file_url: input.outputUrl,
      mime_type: input.mimeType,
      file_size: input.fileSize,
      width: input.width,
      height: input.height,
      duration: input.duration,
      folder_id: input.folderId,
      brand_profile_id: input.brandProfileId,
      tags: input.tags,
      ai_model_used: input.modelUsed,
      original_prompt: input.prompt,
    })

  if (contentError) {
    console.error('Content item save error:', contentError)
    // Generation was saved, just log the content error
    return { success: true, generationId: generation.id, contentError: contentError.message }
  }

  return { success: true, generationId: generation.id }
}
