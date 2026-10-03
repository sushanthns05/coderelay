import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, Users, Settings, Activity } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('code_relay_admin')?.value === 'authenticated'

  if (!isAdmin) {
    redirect('/admin-login')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neon-purple font-mono font-bold tracking-widest text-lg">
            <ShieldAlert size={20} />
            <span>ADMIN_CONSOLE</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-mono text-gray-400">
            <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-2">
              <Activity size={16} /> Overview
            </Link>
            <Link href="/admin/teams" className="hover:text-white transition-colors flex items-center gap-2">
              <Users size={16} /> Teams
            </Link>
            <Link href="/admin/settings" className="hover:text-white transition-colors flex items-center gap-2">
              <Settings size={16} /> Event Config
            </Link>
            <form action={async () => {
              'use server';
              const { cookies } = await import('next/headers');
              const { redirect } = await import('next/navigation');
              const cookieStore = await cookies();
              cookieStore.delete('code_relay_admin');
              redirect('/admin-login');
            }} className="ml-4 pl-4 border-l border-white/10">
              <button type="submit" className="hover:text-red-400 transition-colors">
                LOGOUT
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}
