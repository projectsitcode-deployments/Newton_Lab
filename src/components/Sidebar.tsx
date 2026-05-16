'use client'

import { useAppStore, ViewType } from '@/lib/store'
import {
  LayoutDashboard,
  List,
  Columns3,
  Map,
  BarChart3,
  Clock,
  MessageSquare,
  Zap,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { view: 'backlog', label: 'Backlog', icon: <List size={20} /> },
  { view: 'board', label: 'Sprint Board', icon: <Columns3 size={20} /> },
  { view: 'roadmap', label: 'Roadmap', icon: <Map size={20} /> },
  { view: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  { view: 'timetracking', label: 'Time Tracking', icon: <Clock size={20} /> },
  { view: 'chat', label: 'Team Chat', icon: <MessageSquare size={20} /> },
  { view: 'automations', label: 'Automations', icon: <Zap size={20} /> },
  { view: 'templates', label: 'Templates', icon: <FileText size={20} /> },
]

export function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'neu-sidebar h-screen sticky top-0 flex flex-col transition-all duration-300 z-30',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">FT</span>
        </div>
        {!sidebarCollapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-base text-[var(--neu-text)]">FlowTrack</h1>
            <p className="text-[10px] text-[var(--neu-text-muted)] -mt-0.5">Project Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeView === item.view
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'neu-pressed text-primary'
                  : 'text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] hover:neu-subtle'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={cn('flex-shrink-0', isActive && 'text-primary')}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <span className="animate-fade-in truncate">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl neu-btn text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] text-sm"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!sidebarCollapsed && <span className="animate-fade-in">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
