import { useState, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { ChecklistProgressRecord } from '../types'

function upsertRecord(
  prev: ChecklistProgressRecord[],
  update: Omit<ChecklistProgressRecord, 'id' | 'user_id' | 'completed_at'>
): ChecklistProgressRecord[] {
  const idx = prev.findIndex(
    (r) => r.section === update.section &&
      r.phase_index === update.phase_index &&
      r.task_index === update.task_index
  )
  const now = update.completed ? new Date().toISOString() : undefined
  const updated = { ...update, id: '', user_id: '', completed_at: now } as ChecklistProgressRecord
  if (idx === -1) return [...prev, updated]
  const next = [...prev]
  next[idx] = { ...next[idx], completed: update.completed, completed_at: now }
  return next
}

export function useChecklist(kitId: string) {
  const [progress, setProgress] = useState<ChecklistProgressRecord[]>([])

  const fetchProgress = useCallback(async () => {
    const res = await apiClient.get<ChecklistProgressRecord[]>(`/api/checklist/${kitId}`)
    setProgress(res.data)
  }, [kitId])

  const toggleItem = useCallback(async (
    section: 'pre_release' | 'post_release',
    phaseIndex: number | null,
    taskIndex: number,
    completed: boolean
  ) => {
    // Optimistic update
    setProgress((prev) => upsertRecord(prev, { kit_id: kitId, section, phase_index: phaseIndex, task_index: taskIndex, completed }))
    await apiClient.post(`/api/checklist/${kitId}/toggle`, {
      section,
      phase_index: phaseIndex,
      task_index: taskIndex,
      completed,
    }).catch(() => {
      // Rollback on error
      setProgress((prev) => upsertRecord(prev, { kit_id: kitId, section, phase_index: phaseIndex, task_index: taskIndex, completed: !completed }))
    })
  }, [kitId])

  return { progress, fetchProgress, toggleItem }
}
