import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Server, Trophy, Play } from 'lucide-react'
import { InitializeEventButton, RoundCard } from './event-controls'
import { Leaderboard } from '@/components/leaderboard'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Fetch some basic stats
  const { count: teamCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Fetch active event
  const { data: activeEvent } = await supabase
    .from('events')
    .select('*')
    .in('status', ['draft', 'active'])
    .single()

  // Fetch rounds if event exists
  let rounds: any[] = []
  let activeRound = null
  
  if (activeEvent) {
    const { data: eventRounds } = await supabase
      .from('rounds')
      .select('*')
      .eq('event_id', activeEvent.id)
      .order('order_index', { ascending: true })
      
    rounds = eventRounds || []
    activeRound = rounds.find(r => r.status === 'active')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-white mb-2">SYSTEM OVERVIEW</h1>
        <p className="text-gray-400">Manage the live Code Relay event and monitor incoming teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">Total Teams</CardTitle>
            <Users size={16} className="text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">{teamCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">Registered Users</CardTitle>
            <Server size={16} className="text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">{userCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">Active Round</CardTitle>
            <Trophy size={16} className="text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-white">
              {activeRound ? activeRound.type.replace('_', ' ') : 'None'}
            </div>
            {activeEvent && (
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{activeEvent.name}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold font-mono text-white mb-6 border-b border-white/10 pb-2">EVENT CONTROLS</h2>
        
        {!activeEvent ? (
          <div className="p-12 border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center">
            <p className="text-gray-400 mb-6 text-center max-w-md">
              No active event is currently running. Initialize a new event to automatically generate the 4 Relay rounds and prepare the system.
            </p>
            <InitializeEventButton />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 border border-neon-green/20 rounded-xl bg-neon-green/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neon-green mb-1 flex items-center gap-2">
                  <Play size={16} className="animate-pulse" /> {activeEvent.name} is LIVE
                </h3>
                <p className="text-gray-400 text-sm">Control the flow of the active rounds below.</p>
              </div>
              <div className="flex items-center gap-2">
                <form action={async () => {
                  'use server'
                  const { seedDatabase } = await import('./actions')
                  const res = await seedDatabase()
                  if (res.error) console.error("Seed error:", res.error)
                }}>
                  <button type="submit" className="px-4 py-2 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 font-mono text-sm font-bold border border-yellow-500/50 rounded transition-colors">
                    SEED MOCK DATA
                  </button>
                </form>

                <form action={async () => {
                  'use server'
                  const { deleteSeedData } = await import('./actions')
                  const res = await deleteSeedData()
                  if (res.error) console.error("Delete seed error:", res.error)
                }}>
                  <button type="submit" className="px-4 py-2 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 font-mono text-sm font-bold border border-orange-500/50 rounded transition-colors">
                    CLEAR SEED DATA
                  </button>
                </form>

                <form action={async () => {
                  'use server'
                  const { resetSystem } = await import('./actions')
                  const res = await resetSystem()
                  if (res.error) console.error("Reset error:", res.error)
                }}>
                  <button type="submit" className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 font-mono text-sm font-bold border border-red-500/50 rounded transition-colors">
                    RESET SYSTEM
                  </button>
                </form>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rounds.map(round => (
                <RoundCard key={round.id} round={round} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold font-mono text-white mb-6 border-b border-white/10 pb-2">LIVE LEADERBOARD</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}
