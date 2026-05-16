import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Ensure database is seeded before any login attempt
    await ensureSeeded()

    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const { password: _, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser })
    response.cookies.set('auth-token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
