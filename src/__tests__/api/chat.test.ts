import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    chatMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'

const mockMessage = {
  id: 'msg-1',
  body: 'Hello team!',
  isAI: false,
  authorId: 'user-1',
  createdAt: '2024-01-15T10:30:00Z',
  author: { id: 'user-1', name: 'John Doe', initials: 'JD', avatarColor: '#667eea' },
}

describe('API: Chat - GET /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return list of messages with 200', async () => {
    vi.mocked(db.chatMessage.findMany).mockResolvedValue([mockMessage] as any)
    const { GET } = await import('@/app/api/chat/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.messages).toHaveLength(1)
    expect(data.messages[0].body).toBe('Hello team!')
  })

  it('should call findMany with correct orderBy and take', async () => {
    vi.mocked(db.chatMessage.findMany).mockResolvedValue([] as any)
    const { GET } = await import('@/app/api/chat/route')
    await GET()
    expect(db.chatMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'asc' },
        take: 100,
      })
    )
  })
})

describe('API: Chat - POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if body or authorId is missing', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ body: '' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('should create a message and return 201', async () => {
    vi.mocked(db.chatMessage.create).mockResolvedValue(mockMessage as any)
    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ body: 'Hello!', authorId: 'user-1' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.message.body).toBe('Hello team!')
  })

  it('should create an AI message when isAI is true', async () => {
    const aiMessage = { ...mockMessage, body: 'AI response', isAI: true }
    vi.mocked(db.chatMessage.create).mockResolvedValue(aiMessage as any)
    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ body: 'AI response', authorId: 'user-1', isAI: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    expect(db.chatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isAI: true }) })
    )
  })
})
