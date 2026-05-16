import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await db.comment.findMany({
      where: { issueId: id },
      include: { author: { select: { id: true, name: true, initials: true, avatarColor: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { body, authorId } = await request.json()

    if (!body || !authorId) {
      return NextResponse.json({ error: 'Body and authorId are required' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: { body, authorId, issueId: id },
      include: { author: { select: { id: true, name: true, initials: true, avatarColor: true } } },
    })

    // Add history entry
    await db.issueHistory.create({
      data: {
        action: 'comment_added',
        toValue: 'New comment',
        issueId: id,
        userId: authorId,
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
