'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitCode(teamId: string, roundId: string, problemId: string, code: string, language: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Optionally run the code against hidden test cases here.
  // For the MVP, we will simulate a judge that randomly gives points
  // based on successful compilation.
  const score = Math.floor(Math.random() * 20) + 80; // random score between 80-100

  // 2. Insert submission into the database
  const { error } = await supabase
    .from('submissions')
    .insert({
      team_id: teamId,
      user_id: user.id,
      problem_id: problemId,
      language: language,
      code: code,
      score: score,
      status: 'accepted'
    })

  if (error) {
    console.error("Submission error:", error)
    return { error: 'Failed to record submission' }
  }

  // We revalidate the dashboard so the leaderboard updates
  revalidatePath('/dashboard')
  revalidatePath('/arena')
  
  return { success: true, score }
}

export async function logCheatAttempt(teamId: string, roundId: string, eventType: string, metadata: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('logs')
    .insert({
      user_id: user.id,
      round_id: roundId,
      event_type: eventType,
      metadata: metadata
    })
}
