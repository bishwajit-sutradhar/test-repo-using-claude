import { supabaseAdmin } from '../lib/supabaseAdmin'
import { ToggleChecklistItemInput } from '../schemas/checklist.schema'

export async function getProgress(userId: string, kitId: string) {
  const { data, error } = await supabaseAdmin
    .from('checklist_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('kit_id', kitId)

  if (error) throw error
  return data
}

export async function toggleItem(userId: string, kitId: string, input: ToggleChecklistItemInput) {
  const { data, error } = await supabaseAdmin
    .from('checklist_progress')
    .upsert(
      {
        user_id: userId,
        kit_id: kitId,
        section: input.section,
        phase_index: input.phase_index,
        task_index: input.task_index,
        completed: input.completed,
        completed_at: input.completed ? new Date().toISOString() : null,
      },
      { onConflict: 'kit_id,section,phase_index,task_index' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
