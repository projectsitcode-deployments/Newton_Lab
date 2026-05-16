import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET() {
  try {
    await ensureSeeded()
    const messages = await db.chatMessage.findMany({
      include: { author: { select: { id: true, name: true, initials: true, avatarColor: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { body, authorId, isAI } = await request.json()
    if (!body || !authorId) {
      return NextResponse.json({ error: 'Body and authorId are required' }, { status: 400 })
    }

    const message = await db.chatMessage.create({
      data: { body, authorId, isAI: isAI || false },
      include: { author: { select: { id: true, name: true, initials: true, avatarColor: true } } },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
