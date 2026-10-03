'use client'

import { useState } from 'react'
import { initializeEvent, updateRoundStatus } from './actions'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, CheckCircle, Clock } from 'lucide-react'

export function InitializeEventButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInitialize() {
    setLoading(true)
    setError(null)
    const res = await initializeEvent()
    if (res?.error) setError(res.error)
    setLoading(false)
  }

  return (
    <div className="text-center">
      <Button 
        onClick={handleInitialize} 
        disabled={loading}
        className="bg-neon-purple text-black px-6 py-6 h-auto text-lg rounded-md font-bold hover:bg-neon-purple/80 transition-colors shadow-[0_0_20px_rgba(188,19,254,0.3)]"
      >
        <Play size={24} className="mr-2" />
        {loading ? 'INITIALIZING...' : 'INITIALIZE NEW EVENT'}
      </Button>
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  )
}

export function RoundCard({ round }: { round: any }) {
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: 'pending' | 'active' | 'paused' | 'completed') {
    setLoading(true)
    await updateRoundStatus(round.id, status)
    setLoading(false)
  }

  const getStatusColor = () => {
    switch(round.status) {
      case 'active': return 'text-neon-green border-neon-green/30 bg-neon-green/5'
      case 'paused': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5'
      case 'completed': return 'text-gray-400 border-gray-600 bg-white/5'
      default: return 'text-neon-blue border-neon-blue/30 bg-neon-blue/5'
    }
  }

  const formatName = (type: string) => {
    return type.replace('_', ' ')
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()} transition-colors`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest opacity-70">Round {round.order_index}</span>
          <h3 className="text-lg font-bold font-mono">{formatName(round.type)}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-black/40">
          {round.status === 'active' && <Play size={12} className="animate-pulse" />}
          {round.status === 'pending' && <Clock size={12} />}
          {round.status === 'paused' && <Pause size={12} />}
          {round.status === 'completed' && <CheckCircle size={12} />}
          {round.status}
        </div>
      </div>

      <div className="flex gap-2">
        {round.status === 'pending' && (
          <Button 
            disabled={loading} 
            onClick={() => handleStatusChange('active')} 
            size="sm" 
            className="flex-1 bg-neon-green text-black hover:bg-neon-green/80"
          >
            <Play size={14} className="mr-1" /> START
          </Button>
        )}
        
        {round.status === 'active' && (
          <>
            <Button 
              disabled={loading} 
              onClick={() => handleStatusChange('paused')} 
              size="sm" 
              variant="outline"
              className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 bg-transparent"
            >
              <Pause size={14} className="mr-1" /> PAUSE
            </Button>
            <Button 
              disabled={loading} 
              onClick={() => handleStatusChange('completed')} 
              size="sm" 
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
            >
              <Square size={14} className="mr-1" /> END
            </Button>
          </>
        )}

        {round.status === 'paused' && (
          <>
            <Button 
              disabled={loading} 
              onClick={() => handleStatusChange('active')} 
              size="sm" 
              className="flex-1 bg-neon-green text-black hover:bg-neon-green/80"
            >
              <Play size={14} className="mr-1" /> RESUME
            </Button>
            <Button 
              disabled={loading} 
              onClick={() => handleStatusChange('pending')} 
              size="sm" 
              variant="outline"
              className="flex-1 border-gray-500 text-gray-500 hover:bg-gray-500/10 bg-transparent"
            >
              RESET
            </Button>
          </>
        )}

        {round.status === 'completed' && (
          <Button 
            disabled={loading} 
            onClick={() => handleStatusChange('pending')} 
            size="sm" 
            variant="outline"
            className="flex-1 border-gray-500 text-gray-500 hover:bg-gray-500/10 bg-transparent"
          >
            RESET ROUND
          </Button>
        )}
      </div>
    </div>
  )
}
