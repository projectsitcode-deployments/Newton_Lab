import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sprint = searchParams.get('sprint')
    const priority = searchParams.get('priority')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (sprint) where.sprintId = sprint
    if (priority) where.priority = priority
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { key: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const issues = await db.issue.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, initials: true, avatarColor: true } },
        assignee: { select: { id: true, name: true, initials: true, avatarColor: true } },
        sprint: { select: { id: true, name: true } },
        _count: { select: { comments: true, timeLogs: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ issues })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, type, priority, sprintId, assigneeId, estimate, reporterId } = body

    if (!title || !reporterId) {
      return NextResponse.json({ error: 'Title and reporter are required' }, { status: 400 })
    }

    // Generate issue key
    const count = await db.issue.count()
    const key = `FT-${101 + count}`

    const issue = await db.issue.create({
      data: {
        key,
        title,
        description: description || '',
        type: type || 'task',
        priority: priority || 'medium',
        status: 'todo',
        estimate: estimate || 0,
        sprintId: sprintId || null,
        reporterId,
        assigneeId: assigneeId || null,
      },
      include: {
        reporter: { select: { id: true, name: true, initials: true, avatarColor: true } },
        assignee: { select: { id: true, name: true, initials: true, avatarColor: true } },
        sprint: { select: { id: true, name: true } },
      },
    })

    // Create history entry
    await db.issueHistory.create({
      data: {
        action: 'created',
        toValue: 'todo',
        issueId: issue.id,
        userId: reporterId,
      },
    })

    return NextResponse.json({ issue }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
