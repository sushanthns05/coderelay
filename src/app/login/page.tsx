'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const result = isLogin ? await login(formData) : await signup(formData)
    
    if (result?.error) {
      // If the error is about email verification, it's technically a success state from the user's POV
      if (result.error.includes("check your email")) {
        setMessage({ text: result.error, type: 'success' })
      } else {
        setMessage({ text: result.error, type: 'error' })
      }
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white selection:bg-neon-green/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-green/10 via-black to-black -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-mono font-bold tracking-tighter text-white inline-block hover:scale-105 transition-transform">
            <span className="text-neon-green">CODE</span>_RELAY
          </Link>
          <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest uppercase">
            Official Competitor Portal
          </p>
        </div>

        <Card className="bg-black/80 border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(57,255,20,0.05)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-mono tracking-wide text-white">
              {isLogin ? 'Authentication' : 'Competitor Registration'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin 
                ? 'Enter your assigned credentials to access the arena dashboard.' 
                : 'Register your details to officially enter the competition.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white/70">Full Name</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    placeholder="e.g. Ada Lovelace"
                    required 
                    className="bg-white/5 border-white/10 focus-visible:ring-neon-green text-white placeholder:text-gray-600" 
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="competitor@domain.com"
                  required 
                  className="bg-white/5 border-white/10 focus-visible:ring-neon-green text-white placeholder:text-gray-600" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/70">Password</Label>
                  {isLogin && (
                    <Link href="#" className="text-xs text-neon-green hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  placeholder="••••••••"
                  required 
                  className="bg-white/5 border-white/10 focus-visible:ring-neon-green text-white placeholder:text-gray-600" 
                />
              </div>
              
              {message && (
                <div className={`p-3 text-sm font-medium border rounded-md ${
                  message.type === 'error' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-neon-green/10 border-neon-green/20 text-neon-green'
                }`}>
                  {message.text}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-bold tracking-wider mt-2"
              >
                {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN' : 'COMPLETE REGISTRATION'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <div className="text-sm text-gray-400">
              {isLogin ? "New to Code Relay? " : "Already registered? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setMessage(null); }} 
                className="text-neon-green hover:underline focus:outline-none font-medium"
              >
                {isLogin ? 'Create an account' : 'Sign in to dashboard'}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
