'use client'

import { useState } from 'react'
import { adminLoginAction } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await adminLoginAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white selection:bg-neon-purple/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neon-purple/10 via-black to-black -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ShieldAlert size={48} className="mx-auto text-neon-purple mb-4" />
          <h1 className="text-3xl font-mono font-bold tracking-tighter text-white inline-block">
            <span className="text-neon-purple">ADMIN</span>_PORTAL
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest uppercase">
            Restricted Access Only
          </p>
        </div>

        <Card className="bg-black/80 border-neon-purple/30 backdrop-blur-xl shadow-[0_0_40px_rgba(188,19,254,0.1)]">
          <CardHeader className="space-y-1 text-center border-b border-white/5 pb-6">
            <CardTitle className="text-xl font-mono tracking-wide text-white">
              System Authentication
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your master credentials to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/70">Admin Username</Label>
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="Enter username"
                  required 
                  className="bg-white/5 border-white/10 focus-visible:ring-neon-purple text-white placeholder:text-gray-600" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Master Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  placeholder="••••••••"
                  required 
                  className="bg-white/5 border-white/10 focus-visible:ring-neon-purple text-white placeholder:text-gray-600" 
                />
              </div>
              
              {error && (
                <div className="p-3 text-sm font-medium border rounded-md bg-red-500/10 border-red-500/20 text-red-400 text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-neon-purple text-white hover:bg-neon-purple/90 font-bold tracking-wider mt-4 shadow-[0_0_15px_rgba(188,19,254,0.4)]"
              >
                {loading ? 'AUTHENTICATING...' : 'ACCESS CONSOLE'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <Link href="/login" className="text-sm font-mono text-gray-500 hover:text-white transition-colors">
            &larr; Return to Competitor Login
          </Link>
        </div>
      </div>
    </main>
  )
}
