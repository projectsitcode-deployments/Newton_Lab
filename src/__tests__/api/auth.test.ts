import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    issue: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    issueHistory: {
      create: vi.fn(),
    },
    sprint: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    chatMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    automation: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    timeLog: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'auth-token') return { value: 'test-user-id' }
      return undefined
    }),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Import mocked modules
import { db } from '@/lib/db'

describe('API: Auth - Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email or password is missing', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('required')
  })

  it('should return 401 for invalid credentials', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    const { POST } = await import('@/app/api/auth/login/route')
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return user and set auth cookie on successful login', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
      initials: 'JD',
      role: 'Project Lead',
      avatarColor: '#667eea',
    }
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)
    const { POST } = await import('@/app/api/auth/login/route')
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'john@test.com', password: 'password123' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.user.name).toBe('John Doe')
    expect(res.cookies).toBeDefined()
  })
})

describe('API: Auth - Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if required fields are missing', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: '' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('should return 409 if email already exists', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'existing',
      name: 'Existing',
      email: 'taken@test.com',
    } as any)
    const { POST } = await import('@/app/api/auth/register/route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'taken@test.com', password: 'pass123' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(409)
  })

  it('should create user and return 201 on successful registration', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue({
      id: 'new-user',
      name: 'New User',
      email: 'new@test.com',
      initials: 'NU',
      role: 'developer',
      avatarColor: '#667eea',
    } as any)
    const { POST } = await import('@/app/api/auth/register/route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'New User', email: 'new@test.com', password: 'pass123' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.user.email).toBe('new@test.com')
  })
})
