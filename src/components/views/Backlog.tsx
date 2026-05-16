'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore, Issue } from '@/lib/store'
import { Bot, ArrowUpDown, Plus, Search, Loader2 } from 'lucide-react'

export function Backlog() {
  const { setSelectedIssue, setIssueDetailOpen, setCreateIssueOpen } = useAppStore()
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [search, setSearch] = useState('')
  const [sprintFilter, setSprintFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'estimate'>('priority')
  const [sprints, setSprints] = useState<any[]>([])
  const [aiPrioritized, setAiPrioritized] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchIssues()
    fetchSprints()
  }, [])

  useEffect(() => {
    let filtered = [...issues]

    if (search) {
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.key.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (sprintFilter !== 'all') {
      filtered = filtered.filter(i => i.sprintId === sprintFilter)
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(i => i.type === typeFilter)
    }

    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      filtered.sort((a, b) => order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order])
    } else if (sortBy === 'estimate') {
      filtered.sort((a, b) => b.estimate - a.estimate)
    }

    setFilteredIssues(filtered)
  }, [issues, search, sprintFilter, typeFilter, sortBy])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues')
      const data = await res.json()
      setIssues(data.issues)
    } catch { /* ignore */ }
  }

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints')
      const data = await res.json()
      setSprints(data.sprints)
    } catch { /* ignore */ }
  }

  const aiPrioritize = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I have these issues in my backlog: ${issues.map(i => `${i.key}(${i.priority},${i.type},${i.status}): ${i.title}`).join('; ')}. Please analyze and tell me which ones should be prioritized first, considering urgency, dependencies, and impact. Just return the issue keys in priority order, separated by commas.`,
        }),
      })
      const data = await res.json()
      const keys = data.response.match(/FT-\d+/g)
      if (keys) {
        const keyOrder = keys.reduce((acc: Record<string, number>, key: string, i: number) => {
          acc[key] = i
          return acc
        }, {})
        const reordered = [...issues].sort((a, b) => (keyOrder[a.key] ?? 999) - (keyOrder[b.key] ?? 999))
        setFilteredIssues(reordered)
        setAiPrioritized(true)
      }
    } catch { /* ignore */ }
    finally { setAiLoading(false) }
  }

  const openIssue = (issue: Issue) => {
    setSelectedIssue(issue)
    setIssueDetailOpen(true)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text)]">Backlog</h2>
          <p className="text-sm text-[var(--neu-text-muted)]">{filteredIssues.length} issues</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={aiPrioritize}
            disabled={aiLoading}
            className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            AI Prioritize
          </button>
          <button
            onClick={() => setCreateIssueOpen(true)}
            className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground"
          >
            <Plus size={14} /> Create Issue
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="neu-card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="neu-input w-full pl-9 pr-3 py-2 rounded-xl text-sm"
          />
        </div>
        <select
          value={sprintFilter}
          onChange={(e) => setSprintFilter(e.target.value)}
          className="neu-input px-3 py-2 rounded-xl text-sm"
        >
          <option value="all">All Sprints</option>
          {sprints.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="__none__">No Sprint</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="neu-input px-3 py-2 rounded-xl text-sm"
        >
          <option value="all">All Types</option>
          <option value="story">Story</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="epic">Epic</option>
        </select>
        <button
          onClick={() => setSortBy(sortBy === 'priority' ? 'estimate' : sortBy === 'estimate' ? 'created' : 'priority')}
          className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
        >
          <ArrowUpDown size={14} />
          {sortBy === 'priority' ? 'Priority' : sortBy === 'estimate' ? 'Estimate' : 'Created'}
        </button>
      </div>

      {/* Issue List */}
      <div className="neu-card overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          {sprintFilter === '__none__' || sprintFilter === 'all' ? (
            filteredIssues
              .filter(i => sprintFilter === '__none__' ? !i.sprintId : true)
              .map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => openIssue(issue)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[var(--accent)] transition-colors border-b border-[var(--border)] last:border-0 text-left"
                >
                  <span className="text-xs font-mono text-[var(--neu-text-muted)] w-14 flex-shrink-0">{issue.key}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 priority-dot-${issue.priority}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full type-${issue.type} flex-shrink-0`}>{issue.type}</span>
                  <span className="text-sm text-[var(--neu-text)] flex-1 truncate">{issue.title}</span>
                  {issue.estimate > 0 && (
                    <span className="text-xs text-[var(--neu-text-muted)] flex-shrink-0">{issue.estimate} SP</span>
                  )}
                  {issue.assignee && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: issue.assignee.avatarColor }}
                    >
                      {issue.assignee.initials}
                    </div>
                  )}
                </button>
              ))
          ) : (
            filteredIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => openIssue(issue)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--accent)] transition-colors border-b border-[var(--border)] last:border-0 text-left"
              >
                <span className="text-xs font-mono text-[var(--neu-text-muted)] w-14 flex-shrink-0">{issue.key}</span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 priority-dot-${issue.priority}`} />
                <span className={`text-xs px-2 py-0.5 rounded-full type-${issue.type} flex-shrink-0`}>{issue.type}</span>
                <span className="text-sm text-[var(--neu-text)] flex-1 truncate">{issue.title}</span>
                {issue.estimate > 0 && (
                  <span className="text-xs text-[var(--neu-text-muted)] flex-shrink-0">{issue.estimate} SP</span>
                )}
                {issue.assignee && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: issue.assignee.avatarColor }}
                  >
                    {issue.assignee.initials}
                  </div>
                )}
              </button>
            ))
          )}
          {filteredIssues.length === 0 && (
            <p className="text-sm text-[var(--neu-text-muted)] text-center py-8">No issues match your filters</p>
          )}
        </div>
      </div>
    </div>
  )
}
