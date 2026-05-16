'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function CreateAutomationModal() {
  const { createAutomationOpen, setCreateAutomationOpen } = useAppStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState('issue_created')
  const [action, setAction] = useState('auto_assign')
  const [icon, setIcon] = useState('zap')
  const [color, setColor] = useState('#6c63ff')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || loading) return
    setLoading(true)
    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, trigger, action, icon, color }),
      })
      closeModal()
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const closeModal = () => {
    setName('')
    setDescription('')
    setTrigger('issue_created')
    setAction('auto_assign')
    setIcon('zap')
    setColor('#6c63ff')
    setErrors({})
    setCreateAutomationOpen(false)
  }

  return (
    <Dialog open={createAutomationOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="neu-dialog max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-semibold text-[var(--neu-text)]">Create Automation Rule</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div>
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Rule Name *</Label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })) }}
              placeholder="e.g., Auto-assign high priority bugs"
              className={`neu-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.name ? 'ring-2 ring-destructive' : ''}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this automation does..."
              rows={2}
              className="neu-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Trigger</Label>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="issue_created">Issue Created</option>
                <option value="issue_updated">Issue Updated</option>
                <option value="status_changed">Status Changed</option>
                <option value="daily">Daily</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Action</Label>
              <select value={action} onChange={(e) => setAction(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="auto_assign">Auto-Assign</option>
                <option value="send_notification">Send Notification</option>
                <option value="update_status">Update Status</option>
                <option value="add_label">Add Label</option>
                <option value="send_summary">Send Summary</option>
                <option value="send_reminder">Send Reminder</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Icon</Label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className="neu-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="zap">⚡ Zap</option>
                <option value="calendar">📅 Calendar</option>
                <option value="clock">🕐 Clock</option>
                <option value="bug">🐛 Bug</option>
                <option value="shield">🛡️ Shield</option>
                <option value="bell">🔔 Bell</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="neu-input flex-1 px-3 py-2.5 rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button onClick={closeModal} className="neu-btn px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="neu-btn px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Rule'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
