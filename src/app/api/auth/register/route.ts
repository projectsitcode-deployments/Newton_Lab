import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, initials, role } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }
    const user = await db.user.create({
      data: {
        name,
        email,
        password,
        initials: initials || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        role: role || 'developer',
        avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      },
    })
    const response = NextResponse.json({ user })
    response.cookies.set('auth-token', user.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
