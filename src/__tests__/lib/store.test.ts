import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock db module (required by store)
vi.mock('@/lib/db', () => ({
  db: {},
}))

describe('Zustand Store', () => {
  beforeEach(async () => {
    // Dynamically import to reset store state
    const { useAppStore } = await import('@/lib/store')
    useAppStore.setState({
      activeView: 'dashboard',
      sidebarCollapsed: false,
      createIssueOpen: false,
      issueDetailOpen: false,
      selectedIssue: null,
      createAutomationOpen: false,
      logTimeOpen: false,
      user: null,
      aiPanelOpen: false,
      notificationsOpen: false,
    })
  })

  it('should have correct initial state', async () => {
    const { useAppStore } = await import('@/lib/store')
    const state = useAppStore.getState()
    expect(state.activeView).toBe('dashboard')
    expect(state.sidebarCollapsed).toBe(false)
    expect(state.createIssueOpen).toBe(false)
    expect(state.issueDetailOpen).toBe(false)
    expect(state.selectedIssue).toBeNull()
    expect(state.user).toBeNull()
    expect(state.aiPanelOpen).toBe(false)
    expect(state.notificationsOpen).toBe(false)
  })

  it('should set active view', async () => {
    const { useAppStore } = await import('@/lib/store')
    useAppStore.getState().setActiveView('board')
    expect(useAppStore.getState().activeView).toBe('board')
  })

  it('should toggle sidebar', async () => {
    const { useAppStore } = await import('@/lib/store')
    expect(useAppStore.getState().sidebarCollapsed).toBe(false)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarCollapsed).toBe(true)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarCollapsed).toBe(false)
  })

  it('should open and close create issue modal', async () => {
    const { useAppStore } = await import('@/lib/store')
    useAppStore.getState().setCreateIssueOpen(true)
    expect(useAppStore.getState().createIssueOpen).toBe(true)
    useAppStore.getState().setCreateIssueOpen(false)
    expect(useAppStore.getState().createIssueOpen).toBe(false)
  })

  it('should set selected issue', async () => {
    const { useAppStore } = await import('@/lib/store')
    const mockIssue = {
      id: 'issue-1',
      key: 'FT-101',
      title: 'Test',
      description: '',
      type: 'task',
      priority: 'high',
      status: 'todo',
      estimate: 5,
      sprintId: null,
      reporter: { id: 'u1', name: 'John', initials: 'JD', avatarColor: '#667eea' },
      assignee: null,
      sprint: null,
    }
    useAppStore.getState().setSelectedIssue(mockIssue)
    expect(useAppStore.getState().selectedIssue).toEqual(mockIssue)
    useAppStore.getState().setSelectedIssue(null)
    expect(useAppStore.getState().selectedIssue).toBeNull()
  })

  it('should set user', async () => {
    const { useAppStore } = await import('@/lib/store')
    const mockUser = {
      id: 'u1',
      name: 'John Doe',
      email: 'john@test.com',
      initials: 'JD',
      role: 'Project Lead',
      avatarColor: '#667eea',
    }
    useAppStore.getState().setUser(mockUser)
    expect(useAppStore.getState().user).toEqual(mockUser)
  })

  it('should toggle AI panel', async () => {
    const { useAppStore } = await import('@/lib/store')
    useAppStore.getState().setAiPanelOpen(true)
    expect(useAppStore.getState().aiPanelOpen).toBe(true)
    useAppStore.getState().setAiPanelOpen(false)
    expect(useAppStore.getState().aiPanelOpen).toBe(false)
  })

  it('should toggle notifications', async () => {
    const { useAppStore } = await import('@/lib/store')
    useAppStore.getState().setNotificationsOpen(true)
    expect(useAppStore.getState().notificationsOpen).toBe(true)
  })

  it('should support all ViewType values', async () => {
    const { useAppStore } = await import('@/lib/store')
    const views = ['dashboard', 'backlog', 'board', 'roadmap', 'reports', 'timetracking', 'chat', 'automations', 'templates'] as const
    for (const view of views) {
      useAppStore.getState().setActiveView(view)
      expect(useAppStore.getState().activeView).toBe(view)
    }
  })
})
