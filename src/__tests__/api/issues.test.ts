import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    issue: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    issueHistory: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    sprint: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'

const mockIssue = {
  id: 'issue-1',
  key: 'FT-101',
  title: 'Test Issue',
  description: 'A test issue',
  type: 'task',
  priority: 'high',
  status: 'todo',
  estimate: 5,
  sprintId: 'sprint-1',
  reporterId: 'user-1',
  assigneeId: 'user-2',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

const mockIssueWithRelations = {
  ...mockIssue,
  reporter: { id: 'user-1', name: 'John Doe', initials: 'JD', avatarColor: '#667eea' },
  assignee: { id: 'user-2', name: 'Alice Smith', initials: 'AS', avatarColor: '#48bb78' },
  sprint: { id: 'sprint-1', name: 'Sprint 24' },
  _count: { comments: 2, timeLogs: 1 },
}

describe('API: Issues - GET /api/issues', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return list of issues with 200', async () => {
    vi.mocked(db.issue.findMany).mockResolvedValue([mockIssueWithRelations] as any)
    const { GET } = await import('@/app/api/issues/route')
    const req = new Request('http://localhost/api/issues')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.issues).toHaveLength(1)
  })

  it('should filter issues by status', async () => {
    vi.mocked(db.issue.findMany).mockResolvedValue([] as any)
    const { GET } = await import('@/app/api/issues/route')
    const req = new Request('http://localhost/api/issues?status=todo')
    await GET(req as any)
    expect(db.issue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'todo' }) })
    )
  })

  it('should filter issues by sprint', async () => {
    vi.mocked(db.issue.findMany).mockResolvedValue([] as any)
    const { GET } = await import('@/app/api/issues/route')
    const req = new Request('http://localhost/api/issues?sprint=sprint-1')
    await GET(req as any)
    expect(db.issue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ sprintId: 'sprint-1' }) })
    )
  })

  it('should search issues by title', async () => {
    vi.mocked(db.issue.findMany).mockResolvedValue([] as any)
    const { GET } = await import('@/app/api/issues/route')
    const req = new Request('http://localhost/api/issues?search=auth')
    await GET(req as any)
    expect(db.issue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([expect.objectContaining({ title: { contains: 'auth' } })]),
        }),
      })
    )
  })
})

describe('API: Issues - POST /api/issues', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return 400 if title is missing', async () => {
    const { POST } = await import('@/app/api/issues/route')
    const req = new Request('http://localhost/api/issues', {
      method: 'POST',
      body: JSON.stringify({ title: '', reporterId: 'user-1' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('should create an issue and return 201', async () => {
    vi.mocked(db.issue.count).mockResolvedValue(0)
    vi.mocked(db.issue.create).mockResolvedValue(mockIssueWithRelations as any)
    vi.mocked(db.issueHistory.create).mockResolvedValue({} as any)
    const { POST } = await import('@/app/api/issues/route')
    const req = new Request('http://localhost/api/issues', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Issue',
        description: 'Desc',
        type: 'bug',
        priority: 'high',
        sprintId: 'sprint-1',
        assigneeId: 'user-2',
        estimate: 5,
        reporterId: 'user-1',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.issue.key).toBe('FT-101')
    expect(db.issueHistory.create).toHaveBeenCalled()
  })
})

describe('API: Issues - PUT /api/issues/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return 404 if issue not found', async () => {
    vi.mocked(db.issue.findUnique).mockResolvedValue(null)
    const { PUT } = await import('@/app/api/issues/[id]/route')
    const req = new Request('http://localhost/api/issues/nonexistent', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    // Next.js 16 uses Promise<{id: string}> for params
    const res = await PUT(req as any, { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })

  it('should update an issue and return 200', async () => {
    vi.mocked(db.issue.findUnique).mockResolvedValue(mockIssue as any)
    vi.mocked(db.issue.update).mockResolvedValue({ ...mockIssueWithRelations, title: 'Updated Title' } as any)
    const { PUT } = await import('@/app/api/issues/[id]/route')
    const req = new Request('http://localhost/api/issues/issue-1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req as any, { params: Promise.resolve({ id: 'issue-1' }) })
    expect(res.status).toBe(200)
  })
})

describe('API: Issues - DELETE /api/issues/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should delete an issue and return 200 (even if not found)', async () => {
    // Note: the actual implementation does not check if issue exists before deleting
    vi.mocked(db.issue.delete).mockResolvedValue(mockIssue as any)
    const { DELETE } = await import('@/app/api/issues/[id]/route')
    const res = await DELETE({} as any, { params: Promise.resolve({ id: 'issue-1' }) })
    expect(res.status).toBe(200)
    expect(db.issue.delete).toHaveBeenCalledWith({ where: { id: 'issue-1' } })
  })
})

describe('API: Issues - PATCH /api/issues/[id]/status', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return 404 if issue not found', async () => {
    vi.mocked(db.issue.findUnique).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/issues/[id]/status/route')
    const req = new Request('http://localhost/api/issues/issue-1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'inprogress' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })

  it('should update issue status and create history entry', async () => {
    vi.mocked(db.issue.findUnique).mockResolvedValue(mockIssue as any)
    vi.mocked(db.issue.update).mockResolvedValue({ ...mockIssueWithRelations, status: 'inprogress' } as any)
    vi.mocked(db.issueHistory.create).mockResolvedValue({} as any)
    const { PATCH } = await import('@/app/api/issues/[id]/status/route')
    const req = new Request('http://localhost/api/issues/issue-1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'inprogress' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: 'issue-1' }) })
    expect(res.status).toBe(200)
    expect(db.issue.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'inprogress' } })
    )
    expect(db.issueHistory.create).toHaveBeenCalled()
  })
})
