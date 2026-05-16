import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded()
    const { id } = await params
    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, initials: true, avatarColor: true } },
        assignee: { select: { id: true, name: true, initials: true, avatarColor: true } },
        sprint: { select: { id: true, name: true, goal: true } },
        comments: {
          include: { author: { select: { id: true, name: true, initials: true, avatarColor: true } } },
          orderBy: { createdAt: 'asc' },
        },
        timeLogs: {
          include: { user: { select: { id: true, name: true, initials: true } } },
          orderBy: { createdAt: 'desc' },
        },
        history: {
          include: { user: { select: { id: true, name: true, initials: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ issue })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded()
    const { id } = await params

    const issue = await db.issue.findUnique({ where: { id } })
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Track history for status changes
    if (body.status && body.status !== issue.status) {
      await db.issueHistory.create({
        data: {
          action: 'status_changed',
          fromValue: issue.status,
          toValue: body.status,
          issueId: id,
          userId: body.userId || issue.reporterId,
        },
      })
    }

    // Track history for assignee changes
    if (body.assigneeId !== undefined && body.assigneeId !== issue.assigneeId) {
      if (body.assigneeId) {
        const newAssignee = await db.user.findUnique({ where: { id: body.assigneeId } })
        await db.issueHistory.create({
          data: {
            action: 'assigned',
            fromValue: issue.assigneeId || 'Unassigned',
            toValue: newAssignee?.name || 'Unknown',
            issueId: id,
            userId: body.userId || issue.reporterId,
          },
        })
      }
    }

    const updated = await db.issue.update({
      where: { id },
      data: body,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.issue.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
