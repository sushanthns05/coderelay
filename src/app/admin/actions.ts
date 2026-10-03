'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function initializeEvent() {
  const supabase = await createClient()
  
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('code_relay_admin')?.value === 'authenticated'
  if (!isAdmin) return { error: 'Unauthorized' }

  // Check if there's already an active or draft event
  const { data: existingEvent } = await supabase
    .from('events')
    .select('id')
    .in('status', ['draft', 'active'])
    .limit(1)
    
  if (existingEvent && existingEvent.length > 0) {
    return { error: 'An active or draft event already exists.' }
  }

  // Create the Event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: 'CODE RELAY - MAIN EVENT',
      status: 'active'
    })
    .select()
    .single()

  if (eventError || !event) {
    return { error: eventError?.message || 'Failed to create event' }
  }

  // Seed the 4 Rounds
  const roundsToCreate = [
    { event_id: event.id, type: 'CODE_IQ', order_index: 1, status: 'pending' },
    { event_id: event.id, type: 'TRIPLE_STRIKE', order_index: 2, status: 'pending' },
    { event_id: event.id, type: 'CODE_AUCTION', order_index: 3, status: 'pending' },
    { event_id: event.id, type: 'RELAY_FINALE', order_index: 4, status: 'pending' }
  ]

  const { error: roundsError } = await supabase
    .from('rounds')
    .insert(roundsToCreate)

  if (roundsError) {
    return { error: roundsError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateRoundStatus(roundId: string, status: 'pending' | 'active' | 'paused' | 'completed') {
  const supabase = await createClient()
  
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('code_relay_admin')?.value === 'authenticated'
  if (!isAdmin) return { error: 'Unauthorized' }

  // Update the round
  const updatePayload: any = { status }
  
  if (status === 'active') {
    updatePayload.start_time = new Date().toISOString()
  } else if (status === 'completed') {
    updatePayload.end_time = new Date().toISOString()
  }

  const { error } = await supabase
    .from('rounds')
    .update(updatePayload)
    .eq('id', roundId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function seedDatabase() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('code_relay_admin')?.value === 'authenticated'
  if (!isAdmin) return { error: 'Unauthorized' }

  // Check if we have an event
  const { data: event } = await supabase.from('events').select('id').limit(1).single()
  if (!event) return { error: 'Initialize an event first!' }

  // Get rounds
  const { data: rounds } = await supabase.from('rounds').select('id, type').eq('event_id', event.id)
  if (!rounds) return { error: 'Rounds not found' }

  const problemsToSeed = [
    {
      round_id: rounds.find(r => r.type === 'CODE_IQ')?.id,
      title: 'String Reversal Optimization',
      description: 'Write a highly optimized function to reverse a string in place without using built-in reverse methods. Memory constraints are strict.',
      config: { points: 150 }
    },
    {
      round_id: rounds.find(r => r.type === 'TRIPLE_STRIKE')?.id,
      title: 'The Cyber-Knapsack',
      description: 'You have a knapsack of capacity W and N items of varying weights and values. Find the maximum value you can carry. You have exactly 3 strikes to get this right.',
      config: { points: 300 }
    },
    {
      round_id: rounds.find(r => r.type === 'CODE_AUCTION')?.id,
      title: 'Zero-Day Exploit Pathing',
      description: 'Find the shortest path through a weighted graph representing a server network, avoiding nodes marked with intrusion detection systems.',
      config: { points: 1000 }
    },
    {
      round_id: rounds.find(r => r.type === 'RELAY_FINALE')?.id,
      title: 'The Turing Complete Sandbox',
      description: 'Build a small parser for a custom Brainfuck-like esoteric language. Your team must implement the tokenizer, AST builder, and evaluator in a relay format.',
      config: { points: 2000 }
    }
  ]

  // Insert problems
  for (const prob of problemsToSeed) {
    if (prob.round_id) {
      await supabase.from('problems').insert(prob)
    }
  }

  // Create some fake teams and submissions for the leaderboard
  const teamNames = ['ByteBandits', 'NullPointers', 'CyberSyndicate', 'SyntaxTerrors']
  for (const name of teamNames) {
    const { data: team } = await supabase.from('teams').insert({ name, join_code: Math.random().toString(36).substring(2, 8).toUpperCase(), is_qualified: true }).select('id').single()
    if (team && problemsToSeed[0].round_id) {
      // Find the first problem we inserted
      const { data: prob } = await supabase.from('problems').select('id').eq('round_id', problemsToSeed[0].round_id).limit(1).single()
      if (prob) {
        await supabase.from('submissions').insert({
          team_id: team.id,
          user_id: null,
          problem_id: prob.id,
          language: 'python',
          code: 'print("Fake Submission")',
          score: Math.floor(Math.random() * 500) + 100,
          status: 'accepted'
        })
      }
    }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function resetSystem() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('code_relay_admin')?.value === 'authenticated'
  if (!isAdmin) return { error: 'Unauthorized' }

  const { data: event } = await supabase.from('events').select('id').limit(1).single()
  if (event) {
    const { error } = await supabase.from('events').delete().eq('id', event.id)
    if (error) return { error: error.message }
  }

  const teamNames = ['ByteBandits', 'NullPointers', 'CyberSyndicate', 'SyntaxTerrors']
  for (const name of teamNames) {
    await supabase.from('teams').delete().eq('name', name)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/arena')
  
  return { success: true }
}

export async function deleteSeedData() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('code_relay_admin')?.value === 'authenticated'
  if (!isAdmin) return { error: 'Unauthorized' }

  const teamNames = ['ByteBandits', 'NullPointers', 'CyberSyndicate', 'SyntaxTerrors']
  for (const name of teamNames) {
    await supabase.from('teams').delete().eq('name', name)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/arena')
  
  return { success: true }
}
