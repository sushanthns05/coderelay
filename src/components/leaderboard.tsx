'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy } from 'lucide-react'

export function Leaderboard() {
  const supabase = createClient()
  const [teams, setTeams] = useState<any[]>([])

  useEffect(() => {
    // 1. Initial Fetch
    const fetchLeaderboard = async () => {
      // Get all teams
      const { data: teamsData } = await supabase.from('teams').select('id, name')
      // Get all submissions
      const { data: subsData } = await supabase.from('submissions').select('team_id, score')

      if (teamsData && subsData) {
        const scoresByTeam = subsData.reduce((acc: any, sub: any) => {
          acc[sub.team_id] = (acc[sub.team_id] || 0) + (sub.score || 0)
          return acc
        }, {})

        const leaderboard = teamsData.map(t => ({
          ...t,
          score: scoresByTeam[t.id] || 0
        })).sort((a, b) => b.score - a.score)

        setTeams(leaderboard)
      }
    }

    fetchLeaderboard()

    // 2. Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
        },
        (payload) => {
          const newSub = payload.new
          setTeams(currentTeams => {
            return currentTeams.map(t => {
              if (t.id === newSub.team_id) {
                return { ...t, score: t.score + (newSub.score || 0) }
              }
              return t
            }).sort((a, b) => b.score - a.score)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-black/40">
        <Trophy size={18} className="text-neon-purple" />
        <h2 className="text-sm font-mono font-bold text-white tracking-widest uppercase">Live Leaderboard</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {teams.length === 0 ? (
          <p className="text-gray-500 text-sm font-mono text-center mt-4">Waiting for contenders...</p>
        ) : (
          teams.map((team, index) => (
            <div 
              key={team.id} 
              className={`flex items-center justify-between p-3 rounded border transition-colors ${
                index === 0 ? 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple' :
                index === 1 ? 'bg-white/10 border-white/20' :
                index === 2 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                'bg-white/5 border-transparent text-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold opacity-50 w-4 text-right">{index + 1}</span>
                <span className="font-bold">{team.name}</span>
              </div>
              <div className="font-mono font-bold tracking-widest">
                {team.score} <span className="text-[10px] opacity-50">PTS</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
