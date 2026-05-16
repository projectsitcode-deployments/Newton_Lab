'use client'

import { useEffect, useState } from 'react'
import { useAppStore, TimeLog, Issue, User } from '@/lib/store'
import { Plus, Trash2, Bot, Loader2, Clock } from 'lucide-react'

export function TimeTracking() {
  const { setLogTimeOpen } = useAppStore()
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchTimeLogs()
    fetchIssues()
    fetchUsers()
  }, [])

  const fetchTimeLogs = async () => {
    try {
      const res = await fetch('/api/timelogs')
      const data = await res.json()
      setTimeLogs(data.timeLogs)
    } catch { /* ignore */ }
  }

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues')
      const data = await res.json()
      setIssues(data.issues)
    } catch { /* ignore */ }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users)
    } catch { /* ignore */ }
  }

  const deleteTimeLog = async (id: string) => {
    try {
      await fetch(`/api/timelogs/${id}`, { method: 'DELETE' })
      fetchTimeLogs()
    } catch { /* ignore */ }
  }

  const getAiUtilization = async () => {
    setAiLoading(true)
    try {
      const totalHours = timeLogs.reduce((sum, tl) => sum + tl.hours, 0)
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Our team has logged ${totalHours} hours total across ${timeLogs.length} entries. Time logs: ${timeLogs.map(tl => `${t.user.name}: ${tl.hours}h on ${tl.issue.key} "${tl.issue.title}"`).join(', ')}. Give brief utilization insights and suggestions.`,
        }),
      })
      const data = await res.json()
      setAiInsight(data.response)
    } catch {
      setAiInsight('Unable to generate insights.')
    } finally {
      setAiLoading(false)
    }
  }

  const totalHours = timeLogs.reduce((sum, tl) => sum + tl.hours, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text)]">Time Tracking</h2>
          <p className="text-sm text-[var(--neu-text-muted)]">{totalHours}h logged across {timeLogs.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={getAiUtilization}
            disabled={aiLoading}
            className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            AI Insights
          </button>
          <button
            onClick={() => setLogTimeOpen(true)}
            className="neu-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground"
          >
            <Plus size={14} /> Log Time
          </button>
        </div>
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div className="neu-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">AI Utilization Insights</span>
          </div>
          <p className="text-sm text-[var(--neu-text-muted)]">{aiInsight}</p>
        </div>
      )}

      {/* Time Logs Table */}
      <div className="neu-card overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left text-xs font-medium text-[var(--neu-text-muted)] px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-[var(--neu-text-muted)] px-4 py-3">Issue</th>
                <th className="text-left text-xs font-medium text-[var(--neu-text-muted)] px-4 py-3">Hours</th>
                <th className="text-left text-xs font-medium text-[var(--neu-text-muted)] px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs font-medium text-[var(--neu-text-muted)] px-4 py-3 hidden md:table-cell">Note</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {timeLogs.map((tl) => (
                <tr key={tl.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: tl.user.avatarColor }}
                      >
                        {tl.user.initials}
                      </div>
                      <span className="text-sm text-[var(--neu-text)]">{tl.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-primary">{tl.issue.key}</span>
                    <p className="text-sm text-[var(--neu-text)] truncate max-w-[200px]">{tl.issue.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-[var(--neu-text-muted)]" />
                      <span className="text-sm font-medium text-[var(--neu-text)]">{tl.hours}h</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-[var(--neu-text-muted)]">
                      {new Date(tl.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-[var(--neu-text-muted)] truncate block max-w-[200px]">{tl.note || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteTimeLog(tl.id)}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-[var(--neu-text-muted)] hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {timeLogs.length === 0 && (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-8">No time logs yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
