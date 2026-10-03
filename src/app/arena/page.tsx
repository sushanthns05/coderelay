import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CodeIQ } from '@/components/rounds/code-iq'
import { TripleStrike } from '@/components/rounds/triple-strike'
import { CodeAuction } from '@/components/rounds/code-auction'
import { RelayFinale } from '@/components/rounds/relay-finale'
import { AlertCircle } from 'lucide-react'

export default async function ArenaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is in a team
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single()

  if (!teamMember) redirect('/dashboard')

  // Fetch active event and round
  const { data: activeEvent } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .single()

  let activeRound = null
  if (activeEvent) {
    const { data: round } = await supabase
      .from('rounds')
      .select('*')
      .eq('event_id', activeEvent.id)
      .eq('status', 'active')
      .single()
    activeRound = round
  }

  let activeProblem = null
  if (activeRound) {
    // Check if problem exists
    const { data: problems } = await supabase
      .from('problems')
      .select('*')
      .eq('round_id', activeRound.id)
      .limit(1)

    if (problems && problems.length > 0) {
      activeProblem = problems[0]
    } else {
      // Seed a dummy problem so referential integrity works for submissions
      const { data: newProblem } = await supabase
        .from('problems')
        .insert({
          round_id: activeRound.id,
          title: 'Warmup: Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
          config: { points: 100 }
        })
        .select()
        .single()
      activeProblem = newProblem
    }
  }

  if (!activeRound || !activeProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-yellow-500" />
          <h1 className="text-2xl font-mono font-bold">ARENA CLOSED</h1>
          <p className="text-gray-400">There is no active round running right now. Please return to the dashboard.</p>
        </div>
      </div>
    )
  }

  // Render the appropriate round component based on type
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {activeRound.type === 'CODE_IQ' && <CodeIQ round={activeRound} teamId={teamMember.team_id} problem={activeProblem} />}
      {activeRound.type === 'TRIPLE_STRIKE' && <TripleStrike round={activeRound} teamId={teamMember.team_id} problem={activeProblem} />}
      {activeRound.type === 'CODE_AUCTION' && <CodeAuction round={activeRound} teamId={teamMember.team_id} problem={activeProblem} />}
      {activeRound.type === 'RELAY_FINALE' && <RelayFinale round={activeRound} teamId={teamMember.team_id} problem={activeProblem} />}
    </main>
  )
}
