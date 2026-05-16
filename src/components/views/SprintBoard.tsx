'use client'

import { useEffect, useState } from 'react'
import { useAppStore, Issue } from '@/lib/store'
import { Plus, Bot, Loader2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const columns = [
  { id: 'todo', label: 'To Do', color: '#94a3b8' },
  { id: 'inprogress', label: 'In Progress', color: '#f59e0b' },
  { id: 'inreview', label: 'In Review', color: '#6c63ff' },
  { id: 'done', label: 'Done', color: '#43e97b' },
]

function IssueCard({ issue }: { issue: Issue }) {
  const { setSelectedIssue, setIssueDetailOpen } = useAppStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { status: issue.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className="neu-card p-3 mb-2 cursor-pointer hover:neu-flat transition-all"
        onClick={() => {
          setSelectedIssue(issue)
          setIssueDetailOpen(true)
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1 text-[var(--neu-text-muted)]">
            <GripVertical size={12} className="cursor-grab" {...listeners} />
            <span className="text-xs font-mono">{issue.key}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full type-${issue.type}`}>{issue.type}</span>
        </div>
        <p className="text-sm font-medium text-[var(--neu-text)] mt-1 leading-snug">{issue.title}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full priority-dot-${issue.priority}`} />
            <span className="text-[10px] text-[var(--neu-text-muted)] capitalize">{issue.priority}</span>
          </div>
          <div className="flex items-center gap-1">
            {issue.estimate > 0 && (
              <span className="text-[10px] text-[var(--neu-text-muted)]">{issue.estimate} SP</span>
            )}
            {issue._count && issue._count.comments > 0 && (
              <span className="text-[10px] text-[var(--neu-text-muted)]">💬 {issue._count.comments}</span>
            )}
            {issue.assignee && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: issue.assignee.avatarColor }}
              >
                {issue.assignee.initials}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SprintBoard() {
  const { setCreateIssueOpen } = useAppStore()
  const [issues, setIssues] = useState<Issue[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [activeSprint, setActiveSprint] = useState<string>('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    fetchSprints()
  }, [])

  useEffect(() => {
    if (activeSprint) {
      fetchIssues()
    } else {
      fetchIssues()
    }
  }, [activeSprint])

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints')
      const data = await res.json()
      setSprints(data.sprints)
      const active = data.sprints.find((s: any) => s.status === 'active')
      if (active) setActiveSprint(active.id)
    } catch { /* ignore */ }
  }

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams()
      if (activeSprint) params.set('sprint', activeSprint)
      params.set('status', 'todo')
      const res = await fetch(`/api/issues?${params.toString()}`)
      const todoData = await res.json()
      
      const params2 = new URLSearchParams()
      if (activeSprint) params2.set('sprint', activeSprint)
      params2.set('status', 'inprogress')
      const res2 = await fetch(`/api/issues?${params2.toString()}`)
      const ipData = await res2.json()

      const params3 = new URLSearchParams()
      if (activeSprint) params3.set('sprint', activeSprint)
      params3.set('status', 'inreview')
      const res3 = await fetch(`/api/issues?${params3.toString()}`)
      const irData = await res3.json()

      const params4 = new URLSearchParams()
      if (activeSprint) params4.set('sprint', activeSprint)
      params4.set('status', 'done')
      const res4 = await fetch(`/api/issues?${params4.toString()}`)
      const doneData = await res4.json()

      setIssues([...todoData.issues, ...ipData.issues, ...irData.issues, ...doneData.issues])
    } catch { /* ignore */ }
  }

  const getAiSuggestions = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Looking at my sprint board, what suggestions do you have? Issues: ${issues.map(i => `${i.key}(${i.status},${i.priority},${i.type}): ${i.title}`).join('; ')}. Give brief actionable suggestions.`,
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const issue = issues.find(i => i.id === active.id)
    if (!issue) return

    const targetColumn = columns.find(c => c.id === over.id || issues.find(i => i.id === over.id)?.status === c.id)
    if (!targetColumn) return

    const newStatus = targetColumn.id
    if (newStatus === issue.status) return

    try {
      await fetch(`/api/issues/${issue.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchIssues()
    } catch { /* ignore */ }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const getColumnIssues = (status: string) => issues.filter(i => i.status === status)

  const activeIssue = activeId ? issues.find(i => i.id === activeId) : null

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[var(--neu-text)]">Sprint Board</h2>
          {sprints.length > 0 && (
            <select
              value={activeSprint}
              onChange={(e) => setActiveSprint(e.target.value)}
              className="neu-input px-3 py-1.5 rounded-xl text-sm"
            >
              <option value="">All Issues</option>
              {sprints.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
              ))}
            </select>
          )}
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
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="neu-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">AI Suggestion</span>
          </div>
          <p className="text-sm text-[var(--neu-text-muted)]">{aiSuggestion}</p>
        </div>
      )}

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colIssues = getColumnIssues(col.id)
            return (
              <div key={col.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="text-sm font-semibold text-[var(--neu-text)]">{col.label}</h3>
                    <span className="text-xs text-[var(--neu-text-muted)] neu-subtle px-2 py-0.5 rounded-full">{colIssues.length}</span>
                  </div>
                  <button
                    onClick={() => setCreateIssueOpen(true)}
                    className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-[var(--neu-text-muted)] hover:text-primary"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex-1 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar rounded-2xl p-2 neu-pressed">
                  <SortableContext items={colIssues.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {colIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </SortableContext>
                  {colIssues.length === 0 && (
                    <p className="text-xs text-[var(--neu-text-muted)] text-center py-8">No issues</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <DragOverlay>
          {activeIssue && (
            <div className="neu-card p-3 opacity-80 rotate-2">
              <p className="text-sm font-medium">{activeIssue.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
