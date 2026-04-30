import { createClient } from './supabase/server'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  // 1. Save to generations table
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      user_id: input.userId,
      workspace_id: input.workspaceId,
      type: input.type,
      prompt: input.prompt,
      model_used: input.modelUsed,
      output_url: input.outputUrl,
      output_text: input.outputText,
      brand_profile_id: input.brandProfileId,
      folder_id: input.folderId,
      tags: input.tags,
      status: 'completed',
      parameters: {
        width: input.width,
        height: input.height,
        duration: input.duration,
        mime_type: input.mimeType,
        file_size: input.fileSize,
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
      workspace_id: input.workspaceId,
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
