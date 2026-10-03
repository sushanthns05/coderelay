import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold text-neon-green">DASHBOARD</h1>
            <p className="text-gray-400">Welcome, {profile?.full_name || user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="px-4 py-2 text-sm border border-white/10 rounded-md hover:bg-white/5 transition-colors">
              LOGOUT
            </button>
          </form>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {/* Team Status Card */}
          <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
            <h2 className="text-xl font-mono font-bold mb-4 text-neon-blue">TEAM STATUS</h2>
            <p className="text-gray-400 text-sm mb-6">You are not currently assigned to a team.</p>
            <div className="flex gap-4">
              <button className="bg-neon-blue text-black px-4 py-2 rounded font-bold text-sm hover:bg-neon-blue/80 transition-colors">
                Create Team
              </button>
              <button className="border border-neon-blue text-neon-blue px-4 py-2 rounded font-bold text-sm hover:bg-neon-blue/10 transition-colors">
                Join with Code
              </button>
            </div>
          </div>

          {/* Active Round Card */}
          <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl opacity-50">
            <h2 className="text-xl font-mono font-bold mb-4 text-white">ACTIVE ROUND</h2>
            <p className="text-gray-400 text-sm">Waiting for administrator to start the event...</p>
          </div>
        </section>
      </div>
    </main>
  )
}
