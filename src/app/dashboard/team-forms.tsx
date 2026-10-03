'use client'

import { useState } from 'react'
import { createTeam, joinTeam } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

export function TeamForms() {
  const [activeForm, setActiveForm] = useState<'create' | 'join' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Dynamic roster for Create Team
  const [members, setMembers] = useState([{ name: '', usn: '' }])

  const addMember = () => setMembers([...members, { name: '', usn: '' }])
  
  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index))
    }
  }

  const updateMember = (index: number, field: 'name' | 'usn', value: string) => {
    const newMembers = [...members]
    newMembers[index][field] = value
    setMembers(newMembers)
  }

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // Pass the dynamic members as a JSON string
    formData.append('roster', JSON.stringify(members))
    
    const res = await createTeam(formData)
    if (res?.error) setError(res.error)
    setLoading(false)
  }

  async function handleJoin(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await joinTeam(formData)
    if (res?.error) setError(res.error)
    setLoading(false)
  }

  if (activeForm === 'create') {
    return (
      <form action={handleCreate} className="mt-6 space-y-6 max-w-md bg-white/[0.02] p-4 rounded-lg border border-white/5">
        <div className="space-y-2">
          <Label htmlFor="team_name" className="text-white/70">Team Name</Label>
          <Input 
            id="team_name" 
            name="team_name" 
            required 
            placeholder="e.g. Code Monkeys"
            className="bg-black border-white/10 text-white focus-visible:ring-neon-blue" 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white/70">Team Members Details</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMember} className="h-7 text-xs border-white/10 bg-black hover:bg-white/5">
              <Plus size={14} className="mr-1" /> Add Member
            </Button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {members.map((m, index) => (
              <div key={index} className="flex gap-2 items-start bg-black/50 p-3 rounded-md border border-white/5">
                <div className="flex-1 space-y-3">
                  <Input 
                    placeholder="Full Name" 
                    value={m.name}
                    required
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    className="bg-black border-white/10 h-8 text-sm text-white focus-visible:ring-neon-blue" 
                  />
                  <Input 
                    placeholder="USN / Roll Number" 
                    value={m.usn}
                    required
                    onChange={(e) => updateMember(index, 'usn', e.target.value)}
                    className="bg-black border-white/10 h-8 text-sm text-white focus-visible:ring-neon-blue uppercase" 
                  />
                </div>
                {members.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(index)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30">
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Button type="submit" disabled={loading} className="bg-neon-blue text-black hover:bg-neon-blue/80 font-bold flex-1">
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setActiveForm(null)} className="border-white/10 text-white bg-transparent hover:bg-white/5">
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  if (activeForm === 'join') {
    return (
      <form action={handleJoin} className="mt-6 space-y-4 max-w-sm">
        <div className="space-y-2">
          <Label htmlFor="join_code" className="text-white/70">Team Join Code</Label>
          <Input 
            id="join_code" 
            name="join_code" 
            required 
            placeholder="e.g. A1B2C3"
            className="bg-black border-white/10 text-white focus-visible:ring-neon-blue uppercase" 
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-neon-blue text-black hover:bg-neon-blue/80 font-bold">
            {loading ? 'Joining...' : 'Join Team'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setActiveForm(null)} className="border-white/10 text-white bg-transparent hover:bg-white/5">
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex gap-4 mt-6">
      <Button onClick={() => setActiveForm('create')} className="bg-neon-blue text-black font-bold hover:bg-neon-blue/80 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
        Create a New Team
      </Button>
      <Button onClick={() => setActiveForm('join')} variant="outline" className="border-neon-blue text-neon-blue font-bold bg-transparent hover:bg-neon-blue/10">
        Join with Code
      </Button>
    </div>
  )
}
