import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    automation: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'

const mockAutomation = {
  id: 'auto-1',
  name: 'Auto-assign bugs',
  description: 'Auto assign bugs to QA',
  trigger: 'type=bug',
  action: 'assign_qa',
  enabled: true,
  icon: 'zap',
  color: '#667eea',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

describe('API: Automations - GET /api/automations', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return list of automations with 200', async () => {
    vi.mocked(db.automation.findMany).mockResolvedValue([mockAutomation] as any)
    const { GET } = await import('@/app/api/automations/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.automations).toHaveLength(1)
  })
})

describe('API: Automations - POST /api/automations', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return 400 if required fields are missing', async () => {
    const { POST } = await import('@/app/api/automations/route')
    const req = new Request('http://localhost/api/automations', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('should create an automation and return 201', async () => {
    vi.mocked(db.automation.create).mockResolvedValue(mockAutomation as any)
    const { POST } = await import('@/app/api/automations/route')
    const req = new Request('http://localhost/api/automations', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Rule', trigger: 'status=done', action: 'notify_team' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
  })
})

describe('API: Automations - PUT /api/automations/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update an automation and return 200 (no 404 check in actual impl)', async () => {
    // Note: actual PUT implementation does not check if automation exists before updating
    vi.mocked(db.automation.update).mockResolvedValue({ ...mockAutomation, name: 'Updated' } as any)
    const { PUT } = await import('@/app/api/automations/[id]/route')
    const req = new Request('http://localhost/api/automations/auto-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req as any, { params: Promise.resolve({ id: 'auto-1' }) })
    expect(res.status).toBe(200)
  })

  it('should return 500 when update fails for non-existent automation', async () => {
    vi.mocked(db.automation.update).mockRejectedValue(new Error('Not found'))
    const { PUT } = await import('@/app/api/automations/[id]/route')
    const req = new Request('http://localhost/api/automations/nope', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req as any, { params: Promise.resolve({ id: 'nope' }) })
    expect(res.status).toBe(500)
  })
})

describe('API: Automations - PATCH /api/automations/[id] (toggle)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should toggle automation enabled state', async () => {
    vi.mocked(db.automation.findUnique).mockResolvedValue(mockAutomation as any)
    vi.mocked(db.automation.update).mockResolvedValue({ ...mockAutomation, enabled: false } as any)
    const { PATCH } = await import('@/app/api/automations/[id]/route')
    const res = await PATCH({} as any, { params: Promise.resolve({ id: 'auto-1' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.automation.enabled).toBe(false)
  })

  it('should return 404 if automation not found for toggle', async () => {
    vi.mocked(db.automation.findUnique).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/automations/[id]/route')
    const res = await PATCH({} as any, { params: Promise.resolve({ id: 'nope' }) })
    expect(res.status).toBe(404)
  })
})

describe('API: Automations - DELETE /api/automations/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should delete an automation and return 200', async () => {
    vi.mocked(db.automation.delete).mockResolvedValue(mockAutomation as any)
    const { DELETE } = await import('@/app/api/automations/[id]/route')
    const res = await DELETE({} as any, { params: Promise.resolve({ id: 'auto-1' }) })
    expect(res.status).toBe(200)
    expect(db.automation.delete).toHaveBeenCalledWith({ where: { id: 'auto-1' } })
  })
})
