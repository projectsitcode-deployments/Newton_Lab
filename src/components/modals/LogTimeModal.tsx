'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function LogTimeModal() {
  const { logTimeOpen, setLogTimeOpen, user } = useAppStore()
  const [hours, setHours] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [issueId, setIssueId] = useState('')
  const [issues, setIssues] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (logTimeOpen) fetchIssues()
  }, [logTimeOpen])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues')
      const data = await res.json()
      setIssues(data.issues)
    } catch { /* ignore */ }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!hours || parseFloat(hours) <= 0) newErrors.hours = 'Valid hours required'
    if (!date) newErrors.date = 'Date required'
    if (!issueId) newErrors.issueId = 'Issue required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !user || loading) return
    setLoading(true)
    try {
      await fetch('/api/timelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: parseFloat(hours),
          date,
          note,
          userId: user.id,
          issueId,
        }),
      })
      closeModal()
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const closeModal = () => {
    setHours('')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
    setIssueId('')
    setErrors({})
    setLogTimeOpen(false)
  }

  return (
    <Dialog open={logTimeOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="neu-dialog max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-semibold text-[var(--neu-text)]">Log Time</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div>
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Issue *</Label>
            <select
              value={issueId}
              onChange={(e) => { setIssueId(e.target.value); setErrors(prev => ({ ...prev, issueId: '' })) }}
              className={`neu-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.issueId ? 'ring-2 ring-destructive' : ''}`}
            >
              <option value="">Select an issue...</option>
              {issues.map(i => (
                <option key={i.id} value={i.id}>{i.key} - {i.title}</option>
              ))}
            </select>
            {errors.issueId && <p className="text-xs text-destructive mt-1">{errors.issueId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Hours *</Label>
              <input
                type="number"
                value={hours}
                onChange={(e) => { setHours(e.target.value); setErrors(prev => ({ ...prev, hours: '' })) }}
                placeholder="e.g., 2.5"
                min="0.25"
                step="0.25"
                className={`neu-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.hours ? 'ring-2 ring-destructive' : ''}`}
              />
              {errors.hours && <p className="text-xs text-destructive mt-1">{errors.hours}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Date *</Label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })) }}
                className={`neu-input w-full px-3 py-2.5 rounded-xl text-sm ${errors.date ? 'ring-2 ring-destructive' : ''}`}
              />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-[var(--neu-text)] mb-1 block">Note</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you work on?"
              rows={2}
              className="neu-input w-full px-3 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button onClick={closeModal} className="neu-btn px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="neu-btn px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Time'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
