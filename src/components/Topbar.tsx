'use client'

import { useAppStore } from '@/lib/store'
import { Plus, Bot, Bell, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Topbar() {
  const { setCreateIssueOpen, toggleSidebar, setAiPanelOpen, setNotificationsOpen, notificationsOpen, user } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const viewLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    backlog: 'Backlog',
    board: 'Sprint Board',
    roadmap: 'Roadmap',
    reports: 'Reports',
    timetracking: 'Time Tracking',
    chat: 'Team Chat',
    automations: 'Automations',
    templates: 'Templates',
  }

  return (
    <header className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden neu-btn p-2 rounded-xl text-[var(--neu-text-muted)]"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">
          {viewLabels[useAppStore.getState().activeView]}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setAiPanelOpen(true)}
          className="neu-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary"
        >
          <Bot size={16} />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="neu-btn p-2 rounded-xl text-[var(--neu-text-muted)] relative"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="neu-btn p-2 rounded-xl text-[var(--neu-text-muted)]"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <button
          onClick={() => setCreateIssueOpen(true)}
          className="neu-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          style={{ boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Create Issue</span>
        </button>

        {user && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ml-1 flex-shrink-0"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.initials}
          </div>
        )}
      </div>
    </header>
  )
}
