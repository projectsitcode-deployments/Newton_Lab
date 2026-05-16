'use client'

import { useEffect, useState } from 'react'
import { useAppStore, Issue } from '@/lib/store'
import { X, Send, Bot, Loader2, Clock, User as UserIcon, Tag, Flag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function IssueDetailModal() {
  const { issueDetailOpen, setIssueDetailOpen, selectedIssue, setSelectedIssue, user } = useAppStore()
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history' | 'ai'>('details')
  const [issue, setIssue] = useState<Issue | null>(null)
  const [status, setStatus] = useState('')
  const [comment, setComment] = useState('')
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (issueDetailOpen && selectedIssue) {
      setActiveTab('details')
      setComment('')
      setAiInsight('')
      fetchIssue(selectedIssue.id)
    }
  }, [issueDetailOpen, selectedIssue])

  const fetchIssue = async (id: string) => {
    try {
      const res = await fetch(`/api/issues/${id}`)
      const data = await res.json()
      setIssue(data.issue)
      setStatus(data.issue.status)
    } catch { /* ignore */ }
  }

  const updateStatus = async (newStatus: string) => {
    if (!issue || !user) return
    try {
      await fetch(`/api/issues/${issue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: user.id }),
      })
      setStatus(newStatus)
      fetchIssue(issue.id)
    } catch { /* ignore */ }
  }

  const addComment = async () => {
    if (!comment.trim() || !issue || !user) return
    setLoading(true)
    try {
      await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment, authorId: user.id }),
      })
      setComment('')
      fetchIssue(issue.id)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const getAiInsight = async () => {
    if (!issue) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this issue and give actionable suggestions: ${issue.key} - "${issue.title}" (${issue.type}, ${issue.priority} priority, ${issue.status}, ${issue.estimate} story points). Description: ${issue.description}. What should the team focus on?`,
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

  const closeModal = () => {
    setIssue(null)
    setSelectedIssue(null)
    setIssueDetailOpen(false)
  }

  if (!issue) return null

  return (
    <Dialog open={issueDetailOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="neu-dialog max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-primary font-medium">{issue.key}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full type-${issue.type}`}>{issue.type}</span>
              <span className={`w-2 h-2 rounded-full priority-dot-${issue.priority}`} />
            </div>
            <button onClick={closeModal} className="neu-btn p-1 rounded-lg text-[var(--neu-text-muted)]">
              <X size={16} />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-[var(--neu-text)] mt-2">{issue.title}</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4">
          {(['details', 'comments', 'history', 'ai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-[var(--neu-text-muted)] hover:bg-[var(--accent)]'
              )}
            >
              {tab === 'ai' ? '🤖 AI Insights' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--neu-text-muted)] mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="neu-input px-3 py-2 rounded-xl text-sm w-full"
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="inreview">In Review</option>
                  <option value="done">Done</option>
                  <option value="backlog">Backlog</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--neu-text-muted)] mb-1 block">Description</label>
                <div className="neu-pressed p-3 rounded-xl text-sm text-[var(--neu-text)]">
                  {issue.description || 'No description provided'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-[var(--neu-text-muted)]" />
                  <span className="text-xs text-[var(--neu-text-muted)]">Priority:</span>
                  <span className="text-xs font-medium text-[var(--neu-text)] capitalize">{issue.priority}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-[var(--neu-text-muted)]" />
                  <span className="text-xs text-[var(--neu-text-muted)]">Estimate:</span>
                  <span className="text-xs font-medium text-[var(--neu-text)]">{issue.estimate} SP</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-[var(--neu-text-muted)]" />
                  <span className="text-xs text-[var(--neu-text-muted)]">Reporter:</span>
                  <span className="text-xs font-medium text-[var(--neu-text)]">{issue.reporter.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-[var(--neu-text-muted)]" />
                  <span className="text-xs text-[var(--neu-text-muted)]">Assignee:</span>
                  {issue.assignee ? (
                    <span className="text-xs font-medium text-[var(--neu-text)]">{issue.assignee.name}</span>
                  ) : (
                    <span className="text-xs text-[var(--neu-text-muted)]">Unassigned</span>
                  )}
                </div>
                {issue.sprint && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--neu-text-muted)]" />
                    <span className="text-xs text-[var(--neu-text-muted)]">Sprint:</span>
                    <span className="text-xs font-medium text-[var(--neu-text)]">{issue.sprint.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {issue.comments && issue.comments.length > 0 ? (
                <div className="space-y-3">
                  {issue.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: c.author.avatarColor }}
                      >
                        {c.author.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[var(--neu-text)]">{c.author.name}</span>
                          <span className="text-[10px] text-[var(--neu-text-muted)]">
                            {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--neu-text)] mt-1">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--neu-text-muted)] text-center py-4">No comments yet</p>
              )}

              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  placeholder="Add a comment..."
                  className="neu-input flex-1 px-3 py-2 rounded-xl text-sm"
                />
                <button
                  onClick={addComment}
                  disabled={loading || !comment.trim()}
                  className="neu-btn px-3 py-2 rounded-xl text-sm bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {issue.history && issue.history.length > 0 ? (
                issue.history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-[var(--neu-text)]">
                        <span className="font-medium">{h.user.name}</span>{' '}
                        <span className="text-[var(--neu-text-muted)]">
                          {h.action.replace(/_/g, ' ')}
                          {h.fromValue && h.toValue && ` from "${h.fromValue}" to "${h.toValue}"`}
                          {h.action === 'created' && ' created this issue'}
                          {h.action === 'comment_added' && ' added a comment'}
                        </span>
                      </span>
                      <p className="text-[10px] text-[var(--neu-text-muted)] mt-0.5">
                        {new Date(h.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--neu-text-muted)] text-center py-4">No history</p>
              )}
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <button
                onClick={getAiInsight}
                disabled={aiLoading}
                className="neu-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-primary"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                Analyze Issue
              </button>
              {aiInsight ? (
                <div className="neu-pressed p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-primary" />
                    <span className="text-xs font-medium text-primary">AI Analysis</span>
                  </div>
                  <p className="text-sm text-[var(--neu-text-muted)] leading-relaxed">{aiInsight}</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--neu-text-muted)] text-center py-4">Click &quot;Analyze Issue&quot; to get AI-powered insights about this issue.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
