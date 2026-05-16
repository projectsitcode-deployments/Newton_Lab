'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function CreateIssueModal() {
  const { createIssueOpen, setCreateIssueOpen, user } = useAppStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('task')
  const [priority, setPriority] = useState('medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [sprintId, setSprintId] = useState('')
  const [estimate, setEstimate] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (createIssueOpen) {
      fetchUsers()
      fetchSprints()
    }
  }, [createIssueOpen])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users)
    } catch { /* ignore */ }
  }

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints')
      const data = await res.json()
      setSprints(data.sprints)
    } catch { /* ignore */ }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !user || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description,
          type,
          priority,
          assigneeId: assigneeId || null,
          sprintId: sprintId || null,
          estimate: parseInt(estimate) || 0,
          reporterId: user.id,
        }),
      })
      if (res.ok) {
        closeModal()
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const closeModal = () => {
    setTitle('')
    setDescription('')
    setType('task')
    setPriority('medium')
    setAssigneeId('')
    setSprintId('')
    setEstimate('')
    setErrors({})
    setCreateIssueOpen(false)
  }

  return (
    <Dialog open={createIssueOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="neu-dialog max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-semibold text-[var(--neu-text)]">Create New Issue</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Title */}
          <div>
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Title *</Label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })) }}
              placeholder="Issue title..."
              className={`neu-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.title ? 'ring-2 ring-destructive' : ''}`}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="neu-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="story">Story</option>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="epic">Epic</option>
                <option value="subtask">Subtask</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Priority</Label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Assignee</Label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Sprint</Label>
              <select value={sprintId} onChange={(e) => setSprintId(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="">No Sprint</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimate */}
          <div className="w-1/2">
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Estimate (Story Points)</Label>
            <input
              type="number"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              placeholder="0"
              min="0"
              className="neu-input w-full px-3 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button onClick={closeModal} className="neu-btn px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="neu-btn px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Issue'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
