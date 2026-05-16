'use client'

import { useEffect, useState } from 'react'
import { useAppStore, Initiative } from '@/lib/store'
import { Plus, Bot, Loader2, Target, Rocket, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const milestones = [
  { date: 'Jan 15', title: 'Sprint 24 Start', done: true },
  { date: 'Jan 22', title: 'Auth Module Complete', done: true },
  { date: 'Jan 29', title: 'Sprint 24 End', done: false },
  { date: 'Jan 29', title: 'Sprint 25 Start', done: false },
  { date: 'Feb 5', title: 'API Optimization', done: false },
  { date: 'Feb 12', title: 'Sprint 25 End', done: false },
  { date: 'Mar 1', title: 'Mobile Responsive', done: false },
  { date: 'Mar 15', title: 'v2.0 Beta Release', done: false },
]

const initiativeIcons: Record<string, React.ReactNode> = {
  'Platform Security': <Zap size={20} />,
  'UX Redesign': <Rocket size={20} />,
  'API v2 Migration': <Globe size={20} />,
  'Mobile App': <Target size={20} />,
}

export function Roadmap() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [newName, setNewName] = useState('')
  const [newItems, setNewItems] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [aiPlan, setAiPlan] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchInitiatives()
  }, [])

  const fetchInitiatives = async () => {
    try {
      const res = await fetch('/api/initiatives')
      const data = await res.json()
      setInitiatives(data.initiatives)
    } catch { /* ignore */ }
  }

  const createInitiative = async () => {
    if (!newName.trim()) return
    try {
      await fetch('/api/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, items: parseInt(newItems) || 0 }),
      })
      setNewName('')
      setNewItems('')
      setShowCreate(false)
      fetchInitiatives()
    } catch { /* ignore */ }
  }

  const updateProgress = async (id: string, progress: number) => {
    try {
      await fetch(`/api/initiatives/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      })
      fetchInitiatives()
    } catch { /* ignore */ }
  }

  const deleteInitiative = async (id: string) => {
    try {
      await fetch(`/api/initiatives/${id}`, { method: 'DELETE' })
      fetchInitiatives()
    } catch { /* ignore */ }
  }

  const getAiPlan = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on these initiatives: ${initiatives.map(i => `${i.name}: ${i.progress}% (${i.items} items)`).join(', ')}, provide a brief scenario analysis for the next quarter. What should we focus on? What are the risks?`,
        }),
      })
      const data = await res.json()
      setAiPlan(data.response)
    } catch {
      setAiPlan('Unable to generate plan.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text)]">Roadmap</h2>
          <p className="text-sm text-[var(--neu-text-muted)]">Track initiatives and milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={getAiPlan}
            disabled={aiLoading}
            className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            AI Scenario Planning
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground"
          >
            <Plus size={14} /> Add Initiative
          </button>
        </div>
      </div>

      {/* AI Plan */}
      {aiPlan && (
        <div className="neu-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">AI Scenario Analysis</span>
          </div>
          <p className="text-sm text-[var(--neu-text-muted)] whitespace-pre-wrap">{aiPlan}</p>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="neu-card p-4 animate-fade-in">
          <h3 className="font-semibold text-sm mb-3 text-[var(--neu-text)]">New Initiative</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Initiative name"
              className="neu-input flex-1 px-3 py-2 rounded-xl text-sm"
            />
            <input
              value={newItems}
              onChange={(e) => setNewItems(e.target.value)}
              placeholder="Number of items"
              type="number"
              className="neu-input w-32 px-3 py-2 rounded-xl text-sm"
            />
            <div className="flex gap-2">
              <button onClick={createInitiative} className="neu-btn px-4 py-2 rounded-xl text-sm bg-primary text-primary-foreground">Create</button>
              <button onClick={() => setShowCreate(false)} className="neu-btn px-4 py-2 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initiatives.map((initiative) => (
          <div key={initiative.id} className="neu-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {initiativeIcons[initiative.name] || <Target size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--neu-text)]">{initiative.name}</h3>
                  <p className="text-xs text-[var(--neu-text-muted)]">{initiative.items} items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateProgress(initiative.id, Math.min(100, initiative.progress + 10))}
                  className="neu-btn w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary"
                >
                  +
                </button>
                <button
                  onClick={() => deleteInitiative(initiative.id)}
                  className="neu-btn w-6 h-6 rounded-lg flex items-center justify-center text-[10px] text-destructive"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="w-full h-3 neu-pressed rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${initiative.progress}%`,
                  backgroundColor: initiative.progress >= 75 ? '#43e97b' : initiative.progress >= 50 ? '#f59e0b' : '#6c63ff',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--neu-text-muted)]">
              <span>Progress</span>
              <span className="font-medium">{initiative.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="neu-card p-5">
        <h3 className="font-semibold text-[var(--neu-text)] mb-4">Timeline</h3>
        <div className="relative">
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />
          <div className="space-y-4">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex items-start gap-4 relative">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-[var(--neu-bg)]',
                    milestone.done ? 'bg-primary text-white' : 'neu-flat text-[var(--neu-text-muted)]'
                  )}
                >
                  {milestone.done ? '✓' : i + 1}
                </div>
                <div className="pt-1">
                  <p className={cn('text-sm font-medium', milestone.done ? 'text-[var(--neu-text)]' : 'text-[var(--neu-text-muted)]')}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-[var(--neu-text-muted)]">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
