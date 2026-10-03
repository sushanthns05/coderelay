'use client'

import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Users, Hand, Play, CheckSquare, Clock } from 'lucide-react'
import { submitCode } from '@/app/arena/actions'
import { createClient } from '@/lib/supabase/client'

export function RelayFinale({ round, teamId, problem }: { round: any, teamId: string, problem: any }) {
  const supabase = createClient()
  
  const [code, setCode] = useState<string>('// RELAY FINALE\n// Work together! Only one person can type at a time.\n\nfunction solve() {\n  \n}')
  const [language, setLanguage] = useState('javascript')
  const [submitting, setSubmitting] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [activeCoderId, setActiveCoderId] = useState<string | null>(null)
  const [activeCoderName, setActiveCoderName] = useState<string | null>(null)
  
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // 1. Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        setUserName(profile?.full_name || 'Hacker')
      }
    }
    getUser()

    // 2. Setup Supabase Realtime Channel for Team Sync
    const channel = supabase.channel(`relay-team-${teamId}`, {
      config: { broadcast: { self: false } }
    })

    channelRef.current = channel

    channel
      .on('broadcast', { event: 'code_update' }, (payload) => {
        setCode(payload.payload.code)
      })
      .on('broadcast', { event: 'baton_pass' }, (payload) => {
        setActiveCoderId(payload.payload.newCoderId)
        setActiveCoderName(payload.payload.newCoderName)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, teamId])

  const iAmActive = userId === activeCoderId
  const isLocked = !iAmActive && activeCoderId !== null

  const handleEditorChange = (value: string | undefined) => {
    if (!iAmActive) return // Failsafe
    
    const newCode = value || ''
    setCode(newCode)
    
    // Broadcast to teammates
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'code_update',
        payload: { code: newCode },
      })
    }
  }

  const handleTakeBaton = () => {
    setActiveCoderId(userId)
    setActiveCoderName(userName)
    
    // Broadcast that I took the baton
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'baton_pass',
        payload: { newCoderId: userId, newCoderName: userName },
      })
    }
  }

  const handleDropBaton = () => {
    setActiveCoderId(null)
    setActiveCoderName(null)
    
    // Broadcast that baton is free
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'baton_pass',
        payload: { newCoderId: null, newCoderName: null },
      })
    }
  }

  const handleRunCode = async () => {
    setOutput('Running code in secure sandbox...\n')
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, source: code })
      })
      const data = await res.json()
      
      if (data.error) setOutput(`Execution Error: ${data.error}`)
      else setOutput(`Status: ${data.status.toUpperCase()}\n\nOutput:\n${data.output || 'No output generated.'}`)
    } catch (err) {
      setOutput('Failed to reach execution engine.')
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await submitCode(teamId, round.id, problem.id, code, language)
      if (res.error) {
        setOutput(`Submission Failed: ${res.error}`)
      } else {
        setOutput(`Final Submission Accepted!\nScore Awarded: ${res.score} PTS`)
      }
    } catch (e) {
      setOutput('Error connecting to grading server.')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Arena Header */}
      <header className="h-14 border-b border-cyan-500/20 bg-black flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 font-mono font-bold tracking-widest uppercase flex items-center gap-2">
            <Users size={18} />
            Round 04: Relay Finale
          </span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
            TEAM: {teamId.split('-')[0]}...
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Baton Status */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Active Coder:</span>
            {activeCoderId ? (
              <span className={`px-3 py-1 rounded border text-xs font-bold font-mono ${iAmActive ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 animate-pulse' : 'bg-white/10 border-white/20 text-white'}`}>
                {iAmActive ? 'YOU' : activeCoderName}
              </span>
            ) : (
              <span className="px-3 py-1 rounded border border-gray-600 bg-gray-800 text-gray-400 text-xs font-bold font-mono">
                NO ONE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-lg bg-cyan-400/10 px-4 py-1 rounded border border-cyan-400/20">
            <Clock size={18} />
            60:00
          </div>
        </div>
      </header>

      {/* Arena Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Problem Description & Relay Controls */}
        <div className="w-1/3 flex flex-col border-r border-white/10 bg-black/50">
          
          {/* Relay Controls */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-br from-cyan-950/40 to-black">
            <h2 className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-4">Relay Baton Control</h2>
            
            {!activeCoderId ? (
              <Button onClick={handleTakeBaton} className="w-full h-12 bg-cyan-500 text-black hover:bg-cyan-400 font-bold font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Hand size={18} className="mr-2" /> TAKE THE BATON
              </Button>
            ) : iAmActive ? (
              <Button onClick={handleDropBaton} variant="outline" className="w-full h-12 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-bold font-mono">
                PASS THE BATON
              </Button>
            ) : (
              <Button disabled className="w-full h-12 bg-white/5 border-white/10 text-gray-500 font-bold font-mono">
                WAITING FOR {activeCoderName}...
              </Button>
            )}
            
            <p className="text-xs text-gray-500 mt-4 font-sans text-center">
              Only the active coder can write and submit code. Pass the baton when you are stuck!
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold font-mono">{problem.title}</h1>
              <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                {problem.points} PTS
              </span>
            </div>
            <div className="prose prose-invert max-w-none font-sans text-gray-300">
              <p className="whitespace-pre-wrap">{problem.description}</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-2/3 flex flex-col bg-[#1e1e1e] relative">
          
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-white/5 bg-black flex items-center justify-between px-4 z-10">
            <div className="flex items-center gap-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={!iAmActive}
                className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-50"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
              </select>
              
              {!iAmActive && activeCoderId && (
                <span className="text-xs font-mono text-cyan-500 animate-pulse">
                  Viewing {activeCoderName}'s screen...
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleRunCode} disabled={!iAmActive} variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:text-white hover:bg-white/10 font-mono">
                <Play size={14} className="mr-2" /> RUN CODE
              </Button>
              <Button onClick={handleSubmit} disabled={!iAmActive || submitting} size="sm" className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold tracking-wide font-mono shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <CheckSquare size={14} className="mr-2" /> 
                {submitting ? 'SUBMITTING...' : 'FINAL SUBMIT'}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                readOnly: !iAmActive,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-geist-mono), monospace',
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true
              }}
            />
          </div>
          
          {/* Output Console (Bottom Panel) */}
          <div className="h-48 border-t border-white/10 bg-black flex flex-col z-10">
            <div className="h-8 border-b border-white/5 flex items-center px-4">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Console Output</span>
            </div>
            <div className="flex-1 p-4 font-mono text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap">
              {output || <span className="text-gray-600 italic">Run your code to see the output here...</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
