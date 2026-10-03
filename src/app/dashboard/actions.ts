'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateJoinCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const teamName = formData.get('team_name') as string
  if (!teamName || teamName.length < 3) {
    return { error: 'Team name must be at least 3 characters.' }
  }

  const joinCode = generateJoinCode()
  
  let roster = []
  try {
    roster = JSON.parse(formData.get('roster') as string || '[]')
  } catch(e) {}

  // Start transaction effectively by inserting team then member
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: teamName,
      join_code: joinCode,
      leader_id: user.id,
      roster: roster
    })
    .select()
    .single()

  if (teamError) {
    if (teamError.code === '23505') return { error: 'Team name already exists.' }
    return { error: teamError.message }
  }

  // Add creator as team member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id
    })

  if (memberError) {
    // In a real prod environment we might want to clean up the orphaned team here, 
    // but the DB constraint allows it. 
    return { error: memberError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function joinTeam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const joinCode = formData.get('join_code') as string
  if (!joinCode) return { error: 'Please enter a join code.' }

  // Find the team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id')
    .eq('join_code', joinCode.toUpperCase())
    .single()

  if (teamError || !team) {
    return { error: 'Invalid join code or team does not exist.' }
  }

  // Check if they are already in a team (they can only be in one)
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    return { error: 'You are already in a team.' }
  }

  // Join team
  const { error: joinError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id
    })

  if (joinError) {
    return { error: joinError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

// TEMP DEV HELPER: Remove before production!
export async function makeMeAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
    revalidatePath('/')
  }
}
