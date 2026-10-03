'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Play, CheckSquare, Clock } from 'lucide-react'
import { submitCode } from '@/app/arena/actions'

export function CodeIQ({ round, teamId, problem }: { round: any, teamId: string, problem: any }) {
  const [code, setCode] = useState<string>('function solve() {\n  // Write your code here\n  console.log("Hello, World!");\n}\n\nsolve();')
  const [language, setLanguage] = useState('javascript')
  const [submitting, setSubmitting] = useState(false)
  const [output, setOutput] = useState<string | null>(null)

  const [isRunning, setIsRunning] = useState(false)

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
    setSubmitting(true)
    setOutput('Submitting code for final evaluation...')
    
    try {
      const res = await submitCode(teamId, round.id, problem.id, code, language)
      if (res.error) {
        setOutput(`Submission Failed: ${res.error}`)
      } else {
        setOutput(`Submission Accepted!\n\nScore Awarded: ${res.score} PTS\nView your standing on the Dashboard.`)
      }
    } catch (e) {
      setOutput('Error connecting to grading server.')
    }
    
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Arena Header */}
      <header className="h-14 border-b border-white/10 bg-black flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-neon-purple font-mono font-bold tracking-widest uppercase">Round 01: Code IQ</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
            TEAM: {teamId.split('-')[0]}...
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-neon-green font-mono font-bold text-lg bg-neon-green/10 px-4 py-1 rounded border border-neon-green/20">
          <Clock size={18} />
          45:00
        </div>
      </header>

      {/* Arena Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/3 border-r border-white/10 bg-black/50 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-mono">{problem.title}</h1>
            <span className="text-xs uppercase tracking-widest font-bold text-neon-blue bg-neon-blue/10 px-2 py-1 rounded border border-neon-blue/20">
              {problem.points} PTS
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none font-sans text-gray-300">
            <p className="whitespace-pre-wrap">{problem.description}</p>
            
            <h3 className="text-white font-mono mt-8 mb-2">Example 1:</h3>
            <pre className="bg-white/5 p-4 rounded border border-white/10 font-mono text-sm">
              Input: nums = [2,7,11,15], target = 9{'\n'}
              Output: [0,1]{'\n'}
              Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
            </pre>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-2/3 flex flex-col bg-[#1e1e1e]">
          
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-white/5 bg-black flex items-center justify-between px-4">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-neon-purple font-mono"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java</option>
            </select>
            
            <div className="flex gap-2">
              <Button onClick={handleRunCode} disabled={isRunning} variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:text-white hover:bg-white/10 font-mono">
                <Play size={14} className="mr-2" /> {isRunning ? 'RUNNING...' : 'RUN CODE'}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} size="sm" className="bg-neon-green text-black hover:bg-neon-green/80 font-bold tracking-wide font-mono shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                <CheckSquare size={14} className="mr-2" /> 
                {submitting ? 'SUBMITTING...' : 'SUBMIT'}
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
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-geist-mono), monospace',
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on'
              }}
            />
          </div>
          
          {/* Output Console (Bottom Panel) */}
          <div className="h-48 border-t border-white/10 bg-black flex flex-col">
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
