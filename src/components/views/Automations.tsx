'use client'

import { useEffect, useState } from 'react'
import { useAppStore, Automation } from '@/lib/store'
import { Plus, Bot, Loader2, Pencil, Trash2, Zap, Calendar, Clock, Bug, Shield, AlertCircle, Bell, GitBranch, ArrowRightLeft } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap size={20} />,
  calendar: <Calendar size={20} />,
  clock: <Clock size={20} />,
  bug: <Bug size={20} />,
  shield: <Shield size={20} />,
  alert: <AlertCircle size={20} />,
  bell: <Bell size={20} />,
  git: <GitBranch size={20} />,
  'arrow-right-left': <ArrowRightLeft size={20} />,
}

export function Automations() {
  const { setCreateAutomationOpen } = useAppStore()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchAutomations()
  }, [])

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/automations')
      const data = await res.json()
      setAutomations(data.automations)
    } catch { /* ignore */ }
  }

  const toggleAutomation = async (id: string) => {
    try {
      await fetch(`/api/automations/${id}`, { method: 'PATCH' })
      fetchAutomations()
    } catch { /* ignore */ }
  }

  const deleteAutomation = async (id: string) => {
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' })
      fetchAutomations()
    } catch { /* ignore */ }
  }

  const getAiSuggestions = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Suggest 3 useful automation rules for a project management tool. For each, provide a name, description, trigger, and action in JSON format like: [{"name": "...", "description": "...", "trigger": "...", "action": "..."}]',
        }),
      })
      const data = await res.json()
      setAiSuggestion(data.response)
    } catch {
      setAiSuggestion('Unable to get suggestions.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text)]">Automations</h2>
          <p className="text-sm text-[var(--neu-text-muted)]">{automations.filter(a => a.enabled).length} active rules</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={getAiSuggestions}
            disabled={aiLoading}
            className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            AI Suggestions
          </button>
          <button
            onClick={() => setCreateAutomationOpen(true)}
            className="neu-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground"
          >
            <Plus size={14} /> Create Rule
          </button>
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="neu-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">AI Suggested Automations</span>
          </div>
          <p className="text-sm text-[var(--neu-text-muted)] whitespace-pre-wrap">{aiSuggestion}</p>
        </div>
      )}

      {/* Automation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automations.map((automation) => (
          <div key={automation.id} className={cn('neu-card p-5 transition-all', !automation.enabled && 'opacity-60')}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: automation.color }}
                >
                  {iconMap[automation.icon] || <Zap size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--neu-text)]">{automation.name}</h3>
                  <p className="text-xs text-[var(--neu-text-muted)] capitalize">
                    Trigger: {automation.trigger.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Switch
                checked={automation.enabled}
                onCheckedChange={() => toggleAutomation(automation.id)}
              />
            </div>
            <p className="text-sm text-[var(--neu-text-muted)] mb-3">{automation.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--neu-text-muted)] capitalize">
                Action: {automation.action.replace('_', ' ')}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg neu-btn text-[var(--neu-text-muted)] hover:text-primary">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteAutomation(automation.id)}
                  className="p-1.5 rounded-lg neu-btn text-[var(--neu-text-muted)] hover:text-destructive"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {automations.length === 0 && (
        <div className="neu-card p-8 text-center">
          <Zap size={40} className="mx-auto text-[var(--neu-text-muted)] mb-3" />
          <p className="text-[var(--neu-text-muted)]">No automation rules yet</p>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">Create rules to automate repetitive tasks</p>
        </div>
      )}
    </div>
  )
}
