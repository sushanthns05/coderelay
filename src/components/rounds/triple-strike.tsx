'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Play, CheckSquare, Clock, AlertTriangle } from 'lucide-react'
import { submitCode } from '@/app/arena/actions'
import { createClient } from '@/lib/supabase/client'

export function TripleStrike({ round, teamId, problem }: { round: any, teamId: string, problem: any }) {
  const [code, setCode] = useState<string>('// TRIPLE STRIKE ROUND\n// You have exactly 3 attempts to solve this.\n\nfunction solve() {\n  \n}')
  const [language, setLanguage] = useState('javascript')
  const [submitting, setSubmitting] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  
  const [isRunning, setIsRunning] = useState(false)
  
  const [attempts, setAttempts] = useState(0)
  const MAX_ATTEMPTS = 3
  
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial attempts
    const fetchAttempts = async () => {
      const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('problem_id', problem.id)
      
      setAttempts(count || 0)
    }
    fetchAttempts()
  }, [supabase, teamId, problem.id])

  const handleRunCode = async () => {
    setIsRunning(true)
    setOutput('Running code in secure sandbox...\n')
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, source: code })
      })
      
      const data = await res.json()
      
      if (data.error) {
        setOutput(`Execution Error: ${data.error}`)
      } else {
        setOutput(`Status: ${data.status.toUpperCase()}\n\nOutput:\n${data.output || 'No output generated.'}`)
      }
    } catch (err) {
      setOutput('Failed to reach execution engine.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (attempts >= MAX_ATTEMPTS) return

    setSubmitting(true)
    setOutput(`Submitting Attempt ${attempts + 1} of ${MAX_ATTEMPTS}...`)
    
    try {
      const res = await submitCode(teamId, round.id, problem.id, code, language)
      if (res.error) {
        setOutput(`Submission Failed: ${res.error}`)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setOutput(`Submission Accepted!\nScore Awarded: ${res.score} PTS\n\n[LOCKED] You have used all 3 attempts.`)
        } else {
          setOutput(`Submission Accepted!\nScore Awarded: ${res.score} PTS\n\nYou have ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
        }
      }
    } catch (e) {
      setOutput('Error connecting to grading server.')
    }
    
    setSubmitting(false)
  }

  const isLocked = attempts >= MAX_ATTEMPTS

  return (
    <div className="flex flex-col h-screen">
      {/* Arena Header */}
      <header className="h-14 border-b border-red-500/20 bg-black flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-red-500 font-mono font-bold tracking-widest uppercase flex items-center gap-2">
            <AlertTriangle size={18} />
            Round 02: Triple Strike
          </span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
            TEAM: {teamId.split('-')[0]}...
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Strikes Counter */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((strike) => (
              <div 
                key={strike} 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                  attempts >= strike 
                    ? 'bg-red-500 border-red-500 text-black' 
                    : 'border-red-500/30 text-red-500/30'
                }`}
              >
                X
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-lg bg-red-500/10 px-4 py-1 rounded border border-red-500/20">
            <Clock size={18} />
            30:00
          </div>
        </div>
      </header>

      {/* Arena Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/3 border-r border-white/10 bg-black/50 p-6 overflow-y-auto relative">
          {isLocked && (
            <div className="absolute inset-0 bg-red-950/80 z-10 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
              <AlertTriangle size={64} className="text-red-500 mb-4" />
              <h2 className="text-3xl font-bold font-mono text-white mb-2">LOCKED OUT</h2>
              <p className="text-gray-300">Your team has used all 3 strikes for this problem. No further submissions are allowed.</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-mono">{problem.title}</h1>
            <span className="text-xs uppercase tracking-widest font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
              {problem.points} PTS
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none font-sans text-gray-300">
            <p className="whitespace-pre-wrap">{problem.description}</p>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-2/3 flex flex-col bg-[#1e1e1e] relative">
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
          )}
          
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-white/5 bg-black flex items-center justify-between px-4">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLocked}
              className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-red-500 font-mono disabled:opacity-50"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java</option>
            </select>
            
            <div className="flex gap-2">
              <Button onClick={handleRunCode} disabled={isRunning || isLocked} variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:text-white hover:bg-white/10 font-mono">
                <Play size={14} className="mr-2" /> {isRunning ? 'RUNNING...' : 'RUN CODE'}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || isLocked} size="sm" className="bg-red-600 text-white hover:bg-red-500 font-bold tracking-wide font-mono shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                <CheckSquare size={14} className="mr-2" /> 
                {submitting ? 'SUBMITTING...' : 'SUBMIT ATTEMPT'}
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
              onChange={(value) => setCode(value || '')}
              options={{
                readOnly: isLocked,
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
          <div className="h-48 border-t border-white/10 bg-black flex flex-col z-20">
            <div className="h-8 border-b border-white/5 flex items-center px-4 justify-between">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Console Output</span>
              {isLocked && <span className="text-xs font-mono text-red-500 font-bold uppercase tracking-widest animate-pulse">SYSTEM LOCKED</span>}
            </div>
            <div className={`flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap ${isLocked ? 'text-red-400' : 'text-gray-300'}`}>
              {output || <span className="text-gray-600 italic">Run your code to see the output here...</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
