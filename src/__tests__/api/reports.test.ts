import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    issue: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    sprint: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    comment: {
      count: vi.fn(),
    },
    timeLog: {
      aggregate: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'

describe('API: Reports - GET /api/reports/stats', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return dashboard stats with 200', async () => {
    vi.mocked(db.issue.count).mockResolvedValue(10)
    vi.mocked(db.issue.aggregate).mockResolvedValue({ _sum: { estimate: 45 } })
    vi.mocked(db.user.count).mockResolvedValue(4)
    vi.mocked(db.sprint.count).mockResolvedValue(1)
    vi.mocked(db.comment.count).mockResolvedValue(15)
    vi.mocked(db.timeLog.aggregate).mockResolvedValue({ _sum: { hours: 42 } })

    const { GET } = await import('@/app/api/reports/stats/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('totalIssues')
    expect(data).toHaveProperty('doneIssues')
    expect(data).toHaveProperty('inProgress')
    expect(data).toHaveProperty('highPriority')
    expect(data).toHaveProperty('totalStoryPoints')
    expect(data).toHaveProperty('completionRate')
    expect(data).toHaveProperty('totalTimeLogged')
  })
})

describe('API: Reports - GET /api/reports/velocity', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return velocity data with 200', async () => {
    vi.mocked(db.sprint.findMany).mockResolvedValue([
      {
        id: 's1',
        name: 'Sprint 24',
        createdAt: '2024-01-15',
        issues: [
          { status: 'done', estimate: 8, type: 'story', createdAt: '2024-01-15' },
          { status: 'done', estimate: 3, type: 'bug', createdAt: '2024-01-16' },
          { status: 'todo', estimate: 5, type: 'task', createdAt: '2024-01-17' },
        ],
      },
    ] as any)

    const { GET } = await import('@/app/api/reports/velocity/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('velocity')
    expect(data.velocity).toBeInstanceOf(Array)
    expect(data.velocity[0]).toHaveProperty('name')
    expect(data.velocity[0]).toHaveProperty('completedPoints')
    expect(data.velocity[0]).toHaveProperty('totalPoints')
  })
})

describe('API: Reports - GET /api/reports/workload', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return workload data with 200', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: 'u1',
        name: 'John Doe',
        initials: 'JD',
        avatarColor: '#667eea',
        role: 'Project Lead',
        assignedIssues: [
          { id: 'i1', status: 'inprogress', priority: 'high', estimate: 8 },
          { id: 'i2', status: 'todo', priority: 'medium', estimate: 3 },
        ],
        timeLogs: [{ hours: 12 }, { hours: 8 }],
      },
    ] as any)

    const { GET } = await import('@/app/api/reports/workload/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('workload')
    expect(data.workload).toBeInstanceOf(Array)
    expect(data.workload[0]).toHaveProperty('name')
    expect(data.workload[0]).toHaveProperty('assignedIssues')
    expect(data.workload[0]).toHaveProperty('totalHoursLogged')
    expect(data.workload[0]).toHaveProperty('utilization')
  })
})
