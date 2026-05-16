import { NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET() {
  try {
    await ensureSeeded()
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true, initials: true, role: true, avatarColor: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
