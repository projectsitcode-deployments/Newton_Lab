'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { AppLayout } from '@/components/AppLayout'
import { useAppStore } from '@/lib/store'
import { Dashboard } from '@/components/views/Dashboard'
import { Backlog } from '@/components/views/Backlog'
import { SprintBoard } from '@/components/views/SprintBoard'
import { Roadmap } from '@/components/views/Roadmap'
import { Reports } from '@/components/views/Reports'
import { TimeTracking } from '@/components/views/TimeTracking'
import { TeamChat } from '@/components/views/TeamChat'
import { Automations } from '@/components/views/Automations'
import { Templates } from '@/components/views/Templates'
import { CreateIssueModal } from '@/components/modals/CreateIssueModal'
import { IssueDetailModal } from '@/components/modals/IssueDetailModal'
import { CreateAutomationModal } from '@/components/modals/CreateAutomationModal'
import { LogTimeModal } from '@/components/modals/LogTimeModal'

function AppContent() {
  const { activeView, user, setUser } = useAppStore()

  useEffect(() => {
    // Auto-login as John Doe for demo
    async function autoLogin() {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'john@flowtrack.com', password: 'password123' }),
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch {
        // ignore
      }
    }
    autoLogin()
  }, [setUser])

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />
      case 'backlog': return <Backlog />
      case 'board': return <SprintBoard />
      case 'roadmap': return <Roadmap />
      case 'reports': return <Reports />
      case 'timetracking': return <TimeTracking />
      case 'chat': return <TeamChat />
      case 'automations': return <Automations />
      case 'templates': return <Templates />
      default: return <Dashboard />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppLayout>
        {renderView()}
      </AppLayout>

      {/* Modals */}
      <CreateIssueModal />
      <IssueDetailModal />
      <CreateAutomationModal />
      <LogTimeModal />
    </ThemeProvider>
  )
}

export default function Home() {
  return <AppContent />
}
