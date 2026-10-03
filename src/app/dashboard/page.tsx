import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TeamForms } from './team-forms'
import { Users, Code, Trophy } from 'lucide-react'
import { Leaderboard } from '@/components/leaderboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is in a team
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single()

  let team = null
  let teammates: any[] = []

  if (teamMember) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamMember.team_id)
      .single()
    
    team = teamData

    const { data: members } = await supabase
      .from('team_members')
      .select('user_id, profiles(full_name, email, usn)')
      .eq('team_id', team.id)
    
    teammates = members || []
  }

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

  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <div className="container mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold text-neon-green">ARENA_DASHBOARD</h1>
            <p className="text-gray-400 mt-1">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <div className="flex gap-4">
            <form action={async () => {
              'use server';
              const { makeMeAdmin } = await import('./actions');
              await makeMeAdmin();
            }}>
              <button type="submit" className="px-4 py-2 text-sm border border-neon-purple text-neon-purple rounded-md hover:bg-neon-purple/10 transition-colors font-mono">
                UPGRADE TO ADMIN
              </button>
            </form>
            <form action="/auth/signout" method="post">
              <button type="submit" className="px-4 py-2 text-sm border border-white/10 rounded-md hover:bg-white/5 transition-colors font-mono">
                LOGOUT
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {/* Team Status Card (takes up 2 columns) */}
          <div className="md:col-span-2 p-6 bg-white/[0.02] border border-white/10 rounded-xl relative overflow-hidden shadow-lg">
            {team ? (
              <>
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Users size={120} />
                </div>
                <h2 className="text-xl font-mono font-bold mb-1 text-neon-blue">TEAM STATUS</h2>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold">{team.name}</span>
                  {!team.is_qualified && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold uppercase">Eliminated</span>}
                </div>
                
                <div className="mb-6 p-4 bg-black/50 border border-white/5 rounded-lg inline-block">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Invite Code</p>
                  <p className="text-xl font-mono font-bold tracking-widest text-white">{team.join_code}</p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-3">Roster ({(team.roster && team.roster.length > 0) ? team.roster.length : teammates.length})</h3>
                  <ul className="space-y-2">
                    {team.roster && team.roster.length > 0 ? (
                      // Show the dynamic roster stored on the team
                      team.roster.map((member: any, index: number) => (
                        <li key={index} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            {member.usn && (
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{member.usn}</p>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      // Fallback to the individual registered accounts (the old way)
                      teammates.map((member: any) => (
                        <li key={member.user_id} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded">
                          <div>
                            <p className="font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                            {member.profiles?.usn && (
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{member.profiles.usn}</p>
                            )}
                          </div>
                          {member.user_id === team.leader_id && (
                            <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-1 rounded font-bold uppercase">Leader</span>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-mono font-bold mb-2 text-neon-blue flex items-center gap-2">
                  <Users size={20} />
                  TEAM STATUS
                </h2>
                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                  You are a lone wolf. To participate in the Code Relay, you must either join a squad using an invite code or create your own team and invite others.
                </p>
                <TeamForms />
              </>
            )}
          </div>

          {/* Side Cards */}
          <div className="space-y-6 md:col-span-1">
            {/* Active Round Card */}
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl shadow-lg relative overflow-hidden h-full flex flex-col justify-between group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Code size={100} />
              </div>
              <div>
                <h2 className="text-lg font-mono font-bold mb-2 text-white">ACTIVE ROUND</h2>
                {activeRound ? (
                  <>
                    <p className="text-neon-green font-bold text-xl mb-1">{activeRound.type.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-sm mb-4">The arena is now open. Coordinate with your team and proceed.</p>
                    <Link href={`/arena`} className="block w-full py-3 text-center bg-neon-green text-black font-bold rounded hover:bg-neon-green/90 transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                      ENTER ARENA
                    </Link>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Waiting for administrator to begin the event. Stay tuned to the terminal.
                  </p>
                )}
              </div>
              <div className="mt-8 pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                  {activeRound ? (
                    <span className="text-neon-green animate-pulse flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neon-green inline-block"></span>
                      Event Live
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-500 inline-block"></span>
                      System Standing By
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Real-time Leaderboard */}
            <Leaderboard />
          </div>
        </section>
      </div>
    </main>
  )
}
