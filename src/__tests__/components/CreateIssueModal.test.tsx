import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock fetch globally
global.fetch = vi.fn()

// Mock zustand store
const mockSetCreateIssueOpen = vi.fn()
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}))

import { useAppStore } from '@/lib/store'

const mockUsers = [
  { id: 'u1', name: 'John Doe', initials: 'JD', avatarColor: '#667eea' },
  { id: 'u2', name: 'Alice Smith', initials: 'AS', avatarColor: '#48bb78' },
]

const mockSprints = [
  { id: 'sprint-1', name: 'Sprint 24', status: 'active' },
]

const defaultState = {
  activeView: 'dashboard' as const,
  sidebarCollapsed: false,
  setActiveView: vi.fn(),
  toggleSidebar: vi.fn(),
  createIssueOpen: true,
  issueDetailOpen: false,
  selectedIssue: null,
  createAutomationOpen: false,
  logTimeOpen: false,
  setCreateIssueOpen: mockSetCreateIssueOpen,
  setIssueDetailOpen: vi.fn(),
  setSelectedIssue: vi.fn(),
  setCreateAutomationOpen: vi.fn(),
  setLogTimeOpen: vi.fn(),
  user: { id: 'u1', name: 'John Doe', email: 'john@test.com', initials: 'JD', role: 'Project Lead', avatarColor: '#667eea' },
  setUser: vi.fn(),
  aiPanelOpen: false,
  setAiPanelOpen: vi.fn(),
  notificationsOpen: false,
  setNotificationsOpen: vi.fn(),
}

describe('CreateIssueModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppStore).mockReturnValue(defaultState)
    ;(fetch as any).mockReset()
  })

  it('should render the modal when createIssueOpen is true', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ users: mockUsers }),
    }).mockResolvedValueOnce({
      json: () => Promise.resolve({ sprints: mockSprints }),
    })

    const { CreateIssueModal } = await import('@/components/modals/CreateIssueModal')
    render(<CreateIssueModal />)
    await waitFor(() => {
      expect(screen.getByText('Create New Issue')).toBeDefined()
    })
  })

  it('should render form fields', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ users: mockUsers }),
    }).mockResolvedValueOnce({
      json: () => Promise.resolve({ sprints: mockSprints }),
    })

    const { CreateIssueModal } = await import('@/components/modals/CreateIssueModal')
    render(<CreateIssueModal />)
    await waitFor(() => {
      expect(screen.getByText('Title *')).toBeDefined()
      expect(screen.getByText('Description')).toBeDefined()
      expect(screen.getByText('Estimate (Story Points)')).toBeDefined()
    })
  })

  it('should call setCreateIssueOpen(false) when Cancel is clicked', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ users: mockUsers }),
    }).mockResolvedValueOnce({
      json: () => Promise.resolve({ sprints: mockSprints }),
    })

    const { CreateIssueModal } = await import('@/components/modals/CreateIssueModal')
    render(<CreateIssueModal />)
    await waitFor(() => {
      const cancelBtn = screen.getByText('Cancel')
      fireEvent.click(cancelBtn)
    })
    expect(mockSetCreateIssueOpen).toHaveBeenCalledWith(false)
  })
})
