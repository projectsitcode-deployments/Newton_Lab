'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore, ChatMessage } from '@/lib/store'
import { Send, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TeamChat() {
  const { user } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      setMessages(data.messages)
    } catch { /* ignore */ }
  }

  const sendMessage = async () => {
    if (!input.trim() || !user || loading) return
    const msg = input.trim()
    setInput('')

    try {
      // Save user message
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: msg, authorId: user.id }),
      })

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        body: msg,
        isAI: false,
        createdAt: new Date().toISOString(),
        author: { id: user.id, name: user.name, initials: user.initials, avatarColor: user.avatarColor },
      }])

      // Check if it needs AI response
      const needsAI = msg.toLowerCase().includes('ai') ||
        msg.toLowerCase().includes('help') ||
        msg.toLowerCase().includes('suggest') ||
        msg.toLowerCase().includes('analyze') ||
        msg.toLowerCase().includes('what') ||
        msg.toLowerCase().includes('how')

      if (needsAI) {
        setLoading(true)
        try {
          const res = await fetch('/api/chat/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg }),
          })
          const data = await res.json()
          const aiMsg = data.response

          // Save AI message
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: aiMsg, authorId: user.id, isAI: true }),
          })

          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            body: aiMsg,
            isAI: true,
            createdAt: new Date().toISOString(),
            author: { id: user.id, name: user.name, initials: user.initials, avatarColor: user.avatarColor },
          }])
        } catch { /* ignore */ }
        finally { setLoading(false) }
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.isAI ? 'justify-start' : 'justify-end')}
          >
            {msg.isAI && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={cn('max-w-[75%]', msg.isAI ? '' : 'order-first')}>
              <div className="flex items-center gap-2 mb-1">
                {!msg.isAI && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: msg.author.avatarColor }}
                  >
                    {msg.author.initials}
                  </div>
                )}
                <span className={cn('text-xs', msg.isAI ? 'text-primary font-medium' : 'text-[var(--neu-text-muted)]')}>
                  {msg.isAI ? 'FlowTrack AI' : msg.author.name}
                </span>
                <span className="text-[10px] text-[var(--neu-text-muted)]">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={cn(
                  'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  msg.isAI
                    ? 'neu-subtle text-[var(--neu-text)] rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                )}
              >
                {msg.body}
              </div>
            </div>
            {!msg.isAI && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: msg.author.avatarColor }}
              >
                {msg.author.initials}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Loader2 size={14} className="text-white animate-spin" />
            </div>
            <div className="neu-subtle px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--neu-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--neu-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--neu-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message... (mention AI for smart responses)"
          className="neu-input flex-1 px-4 py-3 rounded-2xl text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="neu-btn w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
