import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET() {
  try {
    await ensureSeeded()
    const timeLogs = await db.timeLog.findMany({
      include: {
        user: { select: { id: true, name: true, initials: true, avatarColor: true } },
        issue: { select: { id: true, key: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ timeLogs })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hours, date, note, userId, issueId } = body

    if (!hours || !date || !userId || !issueId) {
      return NextResponse.json({ error: 'Hours, date, userId, and issueId are required' }, { status: 400 })
    }

    const timeLog = await db.timeLog.create({
      data: {
        hours: parseFloat(hours),
        date: new Date(date),
        note: note || '',
        userId,
        issueId,
      },
      include: {
        user: { select: { id: true, name: true, initials: true, avatarColor: true } },
        issue: { select: { id: true, key: true, title: true } },
      },
    })

    return NextResponse.json({ timeLog }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
