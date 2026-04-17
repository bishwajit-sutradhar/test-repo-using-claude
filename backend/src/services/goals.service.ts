import { supabaseAdmin } from '../lib/supabaseAdmin'
import { CreateGoalsInput, GenerateRoadmapInput } from '../schemas/goals.schema'
import { runRoadmapAgent } from './agents/roadmap.agent'
import { LLMOptions } from '../types'

export async function getGoals(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('career_goals')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = row not found
  return data ?? null
}

export async function upsertGoals(userId: string, input: CreateGoalsInput) {
  // Fetch artist id first
  const { data: artist, error: artistErr } = await supabaseAdmin
    .from('artists')
    .select('id')
    .eq('user_id', userId)
    .single()
  if (artistErr || !artist) throw new Error('Artist profile not found. Create your profile first.')

  const { data, error } = await supabaseAdmin
    .from('career_goals')
    .upsert(
      { user_id: userId, artist_id: artist.id, ...input },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function generateRoadmap(userId: string, input: GenerateRoadmapInput) {
  // Get or create goals first
  const goals = await upsertGoals(userId, {
    goal_1: input.goal_1,
    goal_2: input.goal_2,
    goal_3: input.goal_3,
  })

  // Fetch artist profile for context
  const { data: artist, error: artistErr } = await supabaseAdmin
    .from('artists')
    .select('stage_name, genre, location, years_active')
    .eq('user_id', userId)
    .single()
  if (artistErr || !artist) throw new Error('Artist profile not found')

  const llmOptions: LLMOptions = {
    provider: input.provider,
    model: input.model,
    json_mode: true,
    max_tokens: 4096,
  }

  const roadmapContent = await runRoadmapAgent(artist, goals, llmOptions)

  const { data, error } = await supabaseAdmin
    .from('roadmap_plans')
    .insert({
      user_id: userId,
      career_goal_id: goals.id,
      content: roadmapContent,
      llm_provider: input.provider,
      llm_model: input.model,
    })
    .select()
    .single()
  if (error) throw error

  return data
}

export async function getLatestRoadmap(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('roadmap_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}
