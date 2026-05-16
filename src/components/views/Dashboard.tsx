'use client'

import { useEffect, useState } from 'react'
import { useAppStore, Issue, Sprint } from '@/lib/store'
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Users, Activity, ArrowRight, Bot, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function Dashboard() {
  const { setActiveView, setSelectedIssue, setIssueDetailOpen } = useAppStore()
  const [stats, setStats] = useState<any>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchSprints()
    fetchRecentIssues()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reports/stats')
      const data = await res.json()
      setStats(data)
    } catch { /* ignore */ }
  }

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints')
      const data = await res.json()
      setSprints(data.sprints)
    } catch { /* ignore */ }
  }

  const fetchRecentIssues = async () => {
    try {
      const res = await fetch('/api/issues?search=')
      const data = await res.json()
      setRecentIssues(data.issues.slice(0, 5))
    } catch { /* ignore */ }
  }

  const getAiInsight = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Give me a brief project health assessment. Stats: ${stats ? JSON.stringify(stats) : 'loading'}`,
        }),
      })
      const data = await res.json()
      setAiInsight(data.response)
    } catch {
      setAiInsight('Unable to generate insights at this time.')
    } finally {
      setAiLoading(false)
    }
  }

  const statCards = stats ? [
    { label: 'Total Issues', value: stats.totalIssues, icon: <Activity size={20} />, color: '#6c63ff' },
    { label: 'Completed', value: stats.doneIssues, icon: <CheckCircle2 size={20} />, color: '#43e97b' },
    { label: 'In Progress', value: stats.inProgress + stats.inReview, icon: <Clock size={20} />, color: '#f59e0b' },
    { label: 'High Priority', value: stats.highPriority, icon: <AlertTriangle size={20} />, color: '#ef4444' },
    { label: 'Story Points', value: `${stats.doneStoryPoints}/${stats.totalStoryPoints}`, icon: <TrendingUp size={20} />, color: '#f093fb' },
    { label: 'Team Size', value: stats.teamSize, icon: <Users size={20} />, color: '#4facfe' },
  ] : []

  const activeSprint = sprints.find(s => s.status === 'active')
  const sprintDone = activeSprint?.issues.filter(i => i.status === 'done').length || 0
  const sprintTotal = activeSprint?.issues.length || 0
  const sprintProgress = sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0

  const pieData = stats ? [
    { name: 'Done', value: stats.doneIssues, color: '#43e97b' },
    { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
    { name: 'In Review', value: stats.inReview, color: '#6c63ff' },
    { name: 'To Do', value: stats.todo, color: '#94a3b8' },
    { name: 'Backlog', value: stats.backlog, color: '#64748b' },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="neu-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '20', color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--neu-text)]">{card.value}</p>
            <p className="text-xs text-[var(--neu-text-muted)]">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sprint Progress */}
        <div className="neu-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--neu-text)]">Sprint Progress</h3>
            <button
              onClick={() => setActiveView('board')}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              View Sprint <ArrowRight size={12} />
            </button>
          </div>
          {activeSprint ? (
            <>
              <p className="text-sm font-medium text-[var(--neu-text)] mb-1">{activeSprint.name}</p>
              <p className="text-xs text-[var(--neu-text-muted)] mb-3">{activeSprint.goal}</p>
              <div className="w-full h-3 neu-pressed rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${sprintProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--neu-text-muted)]">
                <span>{sprintDone} / {sprintTotal} issues</span>
                <span>{sprintProgress}%</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)]">No active sprint</p>
          )}
        </div>

        {/* Issue Distribution */}
        <div className="neu-card p-5">
          <h3 className="font-semibold text-[var(--neu-text)] mb-4">Issue Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)]">No data</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map(d => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-[var(--neu-text-muted)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="neu-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--neu-text)] flex items-center gap-2">
              <Bot size={16} className="text-primary" /> AI Insights
            </h3>
            <button
              onClick={getAiInsight}
              disabled={aiLoading}
              className="text-xs text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : 'Analyze'}
            </button>
          </div>
          {aiInsight ? (
            <p className="text-sm text-[var(--neu-text-muted)] leading-relaxed">{aiInsight}</p>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)]">Click &quot;Analyze&quot; to get AI-powered project insights based on your current data.</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="neu-card p-5">
        <h3 className="font-semibold text-[var(--neu-text)] mb-4">Recent Issues</h3>
        <div className="space-y-2">
          {recentIssues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => {
                setSelectedIssue(issue)
                setIssueDetailOpen(true)
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl neu-subtle hover:neu-flat transition-all text-left"
            >
              <span className="text-xs font-mono text-[var(--neu-text-muted)] w-14 flex-shrink-0">{issue.key}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 priority-dot-${issue.priority}`} />
              <span className="text-sm text-[var(--neu-text)] flex-1 truncate">{issue.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full type-${issue.type} flex-shrink-0`}>{issue.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full neu-subtle text-[var(--neu-text-muted)] capitalize flex-shrink-0">{issue.status.replace('inprogress', 'in progress').replace('inreview', 'in review')}</span>
              {issue.assignee && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: issue.assignee.avatarColor }}
                >
                  {issue.assignee.initials}
                </div>
              )}
            </button>
          ))}
          {recentIssues.length === 0 && (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-4">No issues found</p>
          )}
        </div>
      </div>
    </div>
  )
}
