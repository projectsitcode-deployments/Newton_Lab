'use client'

import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Bot, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, aiPanelOpen, setAiPanelOpen } = useAppStore()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300')}>
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
      {aiPanelOpen && <AIPanel />}
    </div>
  )
}

function AIPanel() {
  const { setAiPanelOpen } = useAppStore()
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I\'m FlowTrack AI. I can help with sprint planning, prioritize issues, analyze team workload, or suggest improvements. What would you like to know?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 h-screen sticky top-0 neu-sidebar flex flex-col z-40 animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <button onClick={() => setAiPanelOpen(false)} className="neu-btn p-1.5 rounded-lg text-[var(--neu-text-muted)]">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[90%] px-3 py-2 rounded-xl text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'neu-subtle text-[var(--neu-text)] rounded-bl-sm'
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="neu-subtle px-4 py-2 rounded-xl text-sm text-[var(--neu-text-muted)]">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI anything..."
            className="neu-input flex-1 px-3 py-2 rounded-xl text-sm text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)]"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="neu-btn px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
