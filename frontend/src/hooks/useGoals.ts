import { useState, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { CareerGoals, RoadmapPlan } from '../types'

export interface CreateGoalsPayload {
  goal_1: string
  goal_2?: string
  goal_3?: string
}

export function useGoals() {
  const [goals, setGoals] = useState<CareerGoals | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapPlan | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    const [goalsRes, roadmapRes] = await Promise.all([
      apiClient.get<CareerGoals | null>('/api/goals').catch(() => ({ data: null })),
      apiClient.get<RoadmapPlan | null>('/api/goals/roadmap/latest').catch(() => ({ data: null })),
    ])
    setGoals(goalsRes.data)
    setRoadmap(roadmapRes.data)
    setLoading(false)
  }, [])

  const saveGoals = useCallback(async (data: CreateGoalsPayload): Promise<CareerGoals> => {
    const res = await apiClient.post<CareerGoals>('/api/goals', data)
    setGoals(res.data)
    return res.data
  }, [])

  const generateRoadmap = useCallback(async (
    data: CreateGoalsPayload,
    provider: string,
    model: string
  ): Promise<RoadmapPlan> => {
    setGenerating(true)
    const res = await apiClient.post<RoadmapPlan>('/api/goals/roadmap', { ...data, provider, model })
      .finally(() => setGenerating(false))
    setRoadmap(res.data)
    return res.data
  }, [])

  return { goals, roadmap, generating, loading, fetchGoals, saveGoals, generateRoadmap }
}
