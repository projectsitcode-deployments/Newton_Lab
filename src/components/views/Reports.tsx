'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Area, AreaChart } from 'recharts'
import { Download, TrendingUp, CheckCircle2, Clock, Users } from 'lucide-react'

export function Reports() {
  const [stats, setStats] = useState<any>(null)
  const [velocity, setVelocity] = useState<any[]>([])
  const [workload, setWorkload] = useState<any[]>([])
  const [issueByType, setIssueByType] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const [statsRes, velocityRes, workloadRes, issuesRes] = await Promise.all([
          fetch('/api/reports/stats'),
          fetch('/api/reports/velocity'),
          fetch('/api/reports/workload'),
          fetch('/api/issues'),
        ])
        setStats(await statsRes.json())
        const velData = await velocityRes.json()
        setVelocity(velData.velocity)
        const wlData = await workloadRes.json()
        setWorkload(wlData.workload)
        const issData = await issuesRes.json()
        const typeMap: Record<string, number> = {}
        issData.issues.forEach((i: { type: string }) => {
          typeMap[i.type] = (typeMap[i.type] || 0) + 1
        })
        setIssueByType(Object.entries(typeMap).map(([name, value]) => ({ name, value })))
      } catch { /* ignore */ }
    }
    void init()
  }, [])

  const exportCSV = () => {
    if (!stats) return
    const rows = [
      ['Metric', 'Value'],
      ['Total Issues', stats.totalIssues],
      ['Done', stats.doneIssues],
      ['In Progress', stats.inProgress],
      ['In Review', stats.inReview],
      ['To Do', stats.todo],
      ['Backlog', stats.backlog],
      ['High Priority', stats.highPriority],
      ['Bugs', stats.bugs],
      ['Total Story Points', stats.totalStoryPoints],
      ['Done Story Points', stats.doneStoryPoints],
      ['Team Size', stats.teamSize],
      ['Completion Rate', stats.completionRate + '%'],
      ['Total Time Logged (h)', stats.totalTimeLogged],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowtrack-report.csv'
    a.click()
  }

  const typeColors = ['#6c63ff', '#43e97b', '#ef4444', '#f093fb', '#f59e0b']

  // Burndown simulation
  const burndown = stats ? [
    { day: 'Day 1', ideal: stats.totalStoryPoints, actual: stats.totalStoryPoints },
    { day: 'Day 3', ideal: Math.round(stats.totalStoryPoints * 0.8), actual: Math.round(stats.totalStoryPoints * 0.85) },
    { day: 'Day 5', ideal: Math.round(stats.totalStoryPoints * 0.6), actual: Math.round(stats.totalStoryPoints * 0.65) },
    { day: 'Day 7', ideal: Math.round(stats.totalStoryPoints * 0.4), actual: Math.round(stats.totalStoryPoints * 0.5) },
    { day: 'Day 9', ideal: Math.round(stats.totalStoryPoints * 0.2), actual: Math.round(stats.totalStoryPoints * 0.35) },
    { day: 'Day 11', ideal: 0, actual: stats.totalStoryPoints - stats.doneStoryPoints },
  ] : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--neu-text)]">Reports</h2>
        <button
          onClick={exportCSV}
          className="neu-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="neu-card p-4">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <CheckCircle2 size={18} />
              <span className="text-xs">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold text-[var(--neu-text)]">{stats.completionRate}%</p>
          </div>
          <div className="neu-card p-4">
            <div className="flex items-center gap-2 mb-2 text-[#43e97b]">
              <TrendingUp size={18} />
              <span className="text-xs">Story Points Done</span>
            </div>
            <p className="text-2xl font-bold text-[var(--neu-text)]">{stats.doneStoryPoints}<span className="text-sm text-[var(--neu-text-muted)]">/{stats.totalStoryPoints}</span></p>
          </div>
          <div className="neu-card p-4">
            <div className="flex items-center gap-2 mb-2 text-[#f59e0b]">
              <Clock size={18} />
              <span className="text-xs">Time Logged</span>
            </div>
            <p className="text-2xl font-bold text-[var(--neu-text)]">{stats.totalTimeLogged}<span className="text-sm text-[var(--neu-text-muted)]">h</span></p>
          </div>
          <div className="neu-card p-4">
            <div className="flex items-center gap-2 mb-2 text-[#4facfe]">
              <Users size={18} />
              <span className="text-xs">Active Team</span>
            </div>
            <p className="text-2xl font-bold text-[var(--neu-text)]">{stats.teamSize}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Velocity Chart */}
        <div className="neu-card p-5">
          <h3 className="font-semibold text-[var(--neu-text)] mb-4">Sprint Velocity</h3>
          {velocity.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={velocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--neu-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--neu-text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--neu-bg)', border: 'none', borderRadius: 12, boxShadow: '4px 4px 8px var(--shadow-dark)' }} />
                <Bar dataKey="completedPoints" fill="#43e97b" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalPoints" fill="#6c63ff" name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-8">No velocity data</p>
          )}
        </div>

        {/* Issue Distribution */}
        <div className="neu-card p-5">
          <h3 className="font-semibold text-[var(--neu-text)] mb-4">Issue Distribution</h3>
          {issueByType.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={issueByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {issueByType.map((_, i) => (
                      <Cell key={i} fill={typeColors[i % typeColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {issueByType.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: typeColors[i % typeColors.length] }} />
                    <span className="text-sm text-[var(--neu-text)] capitalize">{d.name}</span>
                    <span className="text-sm text-[var(--neu-text-muted)]">({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-8">No data</p>
          )}
        </div>

        {/* Burndown */}
        <div className="neu-card p-5">
          <h3 className="font-semibold text-[var(--neu-text)] mb-4">Burndown Trend</h3>
          {burndown.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={burndown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--neu-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--neu-text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--neu-bg)', border: 'none', borderRadius: 12 }} />
                <Area type="monotone" dataKey="ideal" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.1} name="Ideal" />
                <Area type="monotone" dataKey="actual" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-8">No data</p>
          )}
        </div>

        {/* Team Workload */}
        <div className="neu-card p-5">
          <h3 className="font-semibold text-[var(--neu-text)] mb-4">Team Workload</h3>
          {workload.length > 0 ? (
            <div className="space-y-3">
              {workload.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--neu-text)] truncate">{member.name}</span>
                      <span className="text-xs text-[var(--neu-text-muted)]">{member.assignedIssues} issues</span>
                    </div>
                    <div className="w-full h-2 neu-pressed rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, member.utilization)}%`,
                          backgroundColor: member.utilization > 80 ? '#ef4444' : member.utilization > 50 ? '#f59e0b' : '#43e97b',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[var(--neu-text-muted)] w-10 text-right">{member.totalHoursLogged}h</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-8">No workload data</p>
          )}
        </div>
      </div>
    </div>
  )
}
