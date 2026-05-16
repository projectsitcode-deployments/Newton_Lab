import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'

// Mock zustand store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}))

import { useAppStore } from '@/lib/store'

describe('Sidebar Component', () => {
  const defaultState = {
    activeView: 'dashboard' as const,
    sidebarCollapsed: false,
    setActiveView: vi.fn(),
    toggleSidebar: vi.fn(),
    createIssueOpen: false,
    issueDetailOpen: false,
    selectedIssue: null,
    createAutomationOpen: false,
    logTimeOpen: false,
    setCreateIssueOpen: vi.fn(),
    setIssueDetailOpen: vi.fn(),
    setSelectedIssue: vi.fn(),
    setCreateAutomationOpen: vi.fn(),
    setLogTimeOpen: vi.fn(),
    user: null,
    setUser: vi.fn(),
    aiPanelOpen: false,
    setAiPanelOpen: vi.fn(),
    notificationsOpen: false,
    setNotificationsOpen: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppStore).mockReturnValue(defaultState)
  })

  it('should render the FlowTrack logo', () => {
    render(<Sidebar />)
    expect(screen.getByText('FT')).toBeDefined()
    expect(screen.getByText('FlowTrack')).toBeDefined()
    expect(screen.getByText('Project Management')).toBeDefined()
  })

  it('should render all 9 navigation items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Backlog')).toBeDefined()
    expect(screen.getByText('Sprint Board')).toBeDefined()
    expect(screen.getByText('Roadmap')).toBeDefined()
    expect(screen.getByText('Reports')).toBeDefined()
    expect(screen.getByText('Time Tracking')).toBeDefined()
    expect(screen.getByText('Team Chat')).toBeDefined()
    expect(screen.getByText('Automations')).toBeDefined()
    expect(screen.getByText('Templates')).toBeDefined()
  })

  it('should highlight active view', () => {
    render(<Sidebar />)
    const dashboardBtn = screen.getByText('Dashboard').closest('button')
    expect(dashboardBtn?.className).toContain('neu-pressed')
  })

  it('should call setActiveView when nav item is clicked', () => {
    render(<Sidebar />)
    const backlogBtn = screen.getByText('Backlog').closest('button')
    fireEvent.click(backlogBtn!)
    expect(defaultState.setActiveView).toHaveBeenCalledWith('backlog')
  })

  it('should render collapse button', () => {
    render(<Sidebar />)
    expect(screen.getByText('Collapse')).toBeDefined()
  })

  it('should call toggleSidebar when collapse is clicked', () => {
    render(<Sidebar />)
    const collapseBtn = screen.getByText('Collapse').closest('button')
    fireEvent.click(collapseBtn!)
    expect(defaultState.toggleSidebar).toHaveBeenCalled()
  })

  it('should hide labels when sidebar is collapsed', () => {
    vi.mocked(useAppStore).mockReturnValue({
      ...defaultState,
      sidebarCollapsed: true,
    })
    render(<Sidebar />)
    expect(screen.queryByText('Dashboard')).toBeNull()
    expect(screen.queryByText('Collapse')).toBeNull()
  })
})
