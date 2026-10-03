'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gavel, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CodeAuction({ round, teamId, problem }: { round: any, teamId: string, problem: any }) {
  const supabase = createClient()
  
  const [bids, setBids] = useState<any[]>([])
  const [myPoints, setMyPoints] = useState(250) // Mock starting points if they have none
  const [bidAmount, setBidAmount] = useState(50)
  const [placing, setPlacing] = useState(false)

  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0
  const highestBidderId = bids.length > 0 ? bids.find(b => b.amount === highestBid)?.team_id : null

  useEffect(() => {
    // Fetch user's actual points from leaderboard
    const fetchPoints = async () => {
      const { data: subs } = await supabase.from('submissions').select('score').eq('team_id', teamId)
      if (subs && subs.length > 0) {
        const total = subs.reduce((acc, sub) => acc + (sub.score || 0), 0)
        setMyPoints(total > 0 ? total : 250)
      }
    }
    fetchPoints()

    // Fetch existing bids
    const fetchBids = async () => {
      const { data } = await supabase
        .from('bids')
        .select('*, teams(name)')
        .eq('problem_id', problem.id)
        .order('amount', { ascending: false })
      
      if (data) setBids(data)
    }
    fetchBids()

    // Realtime subscription for bids
    const channel = supabase
      .channel('bids-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `problem_id=eq.${problem.id}` },
        async (payload) => {
          // Fetch the team name for the new bid
          const { data: teamData } = await supabase.from('teams').select('name').eq('id', payload.new.team_id).single()
          const newBid = { ...payload.new, teams: teamData }
          setBids(current => [newBid, ...current].sort((a, b) => b.amount - a.amount))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, problem.id, teamId])

  const handleBid = async () => {
    if (bidAmount <= highestBid) {
      alert("Bid must be higher than current highest bid!")
      return
    }
    if (bidAmount > myPoints) {
      alert("You don't have enough points!")
      return
    }

    setPlacing(true)
    
    // Insert bid
    const { error } = await supabase
      .from('bids')
      .insert({
        round_id: round.id,
        team_id: teamId,
        problem_id: problem.id,
        amount: bidAmount
      })

    if (error) {
      alert("Failed to place bid!")
    } else {
      setBidAmount(bidAmount + 10)
    }
    
    setPlacing(false)
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Arena Header */}
      <header className="h-14 border-b border-yellow-500/20 bg-black flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-yellow-500 font-mono font-bold tracking-widest uppercase flex items-center gap-2">
            <Gavel size={18} />
            Round 03: Code Auction
          </span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
            TEAM: {teamId.split('-')[0]}...
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-yellow-500 font-mono font-bold text-lg bg-yellow-500/10 px-4 py-1 rounded border border-yellow-500/20">
            <DollarSign size={18} />
            {myPoints} PTS AVAILABLE
          </div>
        </div>
      </header>

      {/* Auction Block */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black">
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Problem Details */}
          <div className="space-y-6">
            <div className="p-8 bg-white/[0.02] border border-yellow-500/20 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.05)] relative overflow-hidden">
              <div className="absolute -right-8 -top-8 opacity-5">
                <Gavel size={200} />
              </div>
              <h2 className="text-xs font-mono text-yellow-500 tracking-widest uppercase mb-4 animate-pulse">On The Block</h2>
              <h1 className="text-4xl font-bold font-mono mb-4">{problem.title}</h1>
              <p className="text-gray-400 font-sans leading-relaxed mb-6">
                {problem.description.substring(0, 150)}...
                <br /><br />
                <span className="italic text-yellow-500/70">Win this auction to unlock the full problem and submit code for exclusive points!</span>
              </p>
              
              <div className="flex items-end gap-4 p-6 bg-black/50 border border-white/5 rounded-xl">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-widest block mb-2">Your Bid (PTS)</label>
                  <input 
                    type="number" 
                    value={bidAmount}
                    onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                    min={highestBid + 10}
                    step={10}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-2xl font-mono focus:outline-none focus:border-yellow-500 text-white"
                  />
                </div>
                <Button 
                  onClick={handleBid}
                  disabled={placing || bidAmount <= highestBid || bidAmount > myPoints}
                  className="h-[60px] px-8 bg-yellow-500 text-black hover:bg-yellow-400 font-bold text-lg tracking-wider font-mono shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50"
                >
                  PLACE BID
                </Button>
              </div>
            </div>
          </div>

          {/* Live Bid Feed */}
          <div className="flex flex-col h-[500px] border border-white/10 bg-black/40 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <h3 className="font-mono font-bold text-gray-300 flex items-center gap-2">
                <TrendingUp size={18} className="text-yellow-500" /> Live Action
              </h3>
              <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                Highest: {highestBid} PTS
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {bids.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm">
                  Waiting for opening bid...
                </div>
              ) : (
                bids.map((bid, i) => (
                  <div 
                    key={bid.id} 
                    className={`p-4 rounded-lg flex items-center justify-between transition-all ${
                      i === 0 
                        ? 'bg-yellow-500/20 border border-yellow-500/50 scale-100 shadow-lg' 
                        : 'bg-white/5 border border-white/5 scale-[0.98] opacity-70'
                    }`}
                  >
                    <div>
                      <p className={`font-bold ${i === 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
                        {bid.teams?.name || 'Unknown Team'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {new Date(bid.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={`font-mono text-2xl font-bold ${i === 0 ? 'text-white' : 'text-gray-400'}`}>
                      {bid.amount} <span className="text-xs opacity-50">PTS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
