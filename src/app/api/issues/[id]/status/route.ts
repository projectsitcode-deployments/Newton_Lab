import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, userId } = await request.json()

    const issue = await db.issue.findUnique({ where: { id } })
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    await db.issueHistory.create({
      data: {
        action: 'status_changed',
        fromValue: issue.status,
        toValue: status,
        issueId: id,
        userId: userId || issue.reporterId,
      },
    })

    const updated = await db.issue.update({
      where: { id },
      data: { status },
      include: {
        reporter: { select: { id: true, name: true, initials: true, avatarColor: true } },
        assignee: { select: { id: true, name: true, initials: true, avatarColor: true } },
        sprint: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ issue: updated })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
