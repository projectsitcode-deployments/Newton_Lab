import { create } from 'zustand'

export type ViewType =
  | 'dashboard'
  | 'backlog'
  | 'board'
  | 'roadmap'
  | 'reports'
  | 'timetracking'
  | 'chat'
  | 'automations'
  | 'templates'

export interface User {
  id: string
  name: string
  email: string
  initials: string
  role: string
  avatarColor: string
}

export interface Sprint {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  status: string
  issues: { id: string; status: string; estimate: number }[]
  _count?: { issues: number }
}

export interface Issue {
  id: string
  key: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  estimate: number
  sprintId: string | null
  reporter: { id: string; name: string; initials: string; avatarColor: string }
  assignee: { id: string; name: string; initials: string; avatarColor: string } | null
  sprint: { id: string; name: string } | null
  _count?: { comments: number; timeLogs: number }
  comments?: Comment[]
  timeLogs?: TimeLog[]
  history?: IssueHistory[]
}

export interface Comment {
  id: string
  body: string
  createdAt: string
  author: { id: string; name: string; initials: string; avatarColor: string }
}

export interface TimeLog {
  id: string
  hours: number
  date: string
  note: string
  user: { id: string; name: string; initials: string; avatarColor: string }
  issue: { id: string; key: string; title: string }
}

export interface IssueHistory {
  id: string
  action: string
  fromValue: string
  toValue: string
  createdAt: string
  user: { id: string; name: string; initials: string }
}

export interface Automation {
  id: string
  name: string
  description: string
  trigger: string
  action: string
  enabled: boolean
  icon: string
  color: string
}

export interface Initiative {
  id: string
  name: string
  progress: number
  items: number
}

export interface ChatMessage {
  id: string
  body: string
  isAI: boolean
  createdAt: string
  author: { id: string; name: string; initials: string; avatarColor: string }
}

interface AppState {
  // Navigation
  activeView: ViewType
  sidebarCollapsed: boolean
  setActiveView: (view: ViewType) => void
  toggleSidebar: () => void

  // Modals
  createIssueOpen: boolean
  issueDetailOpen: boolean
  selectedIssue: Issue | null
  createAutomationOpen: boolean
  logTimeOpen: boolean
  setCreateIssueOpen: (open: boolean) => void
  setIssueDetailOpen: (open: boolean) => void
  setSelectedIssue: (issue: Issue | null) => void
  setCreateAutomationOpen: (open: boolean) => void
  setLogTimeOpen: (open: boolean) => void

  // Data
  user: User | null
  setUser: (user: User | null) => void

  // AI Panel
  aiPanelOpen: boolean
  setAiPanelOpen: (open: boolean) => void

  // Notifications
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activeView: 'dashboard',
  sidebarCollapsed: false,
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Modals
  createIssueOpen: false,
  issueDetailOpen: false,
  selectedIssue: null,
  createAutomationOpen: false,
  logTimeOpen: false,
  setCreateIssueOpen: (open) => set({ createIssueOpen: open }),
  setIssueDetailOpen: (open) => set({ issueDetailOpen: open }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setCreateAutomationOpen: (open) => set({ createAutomationOpen: open }),
  setLogTimeOpen: (open) => set({ logTimeOpen: open }),

  // Data
  user: null,
  setUser: (user) => set({ user }),

  // AI Panel
  aiPanelOpen: false,
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),

  // Notifications
  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}))
