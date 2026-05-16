import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET() {
  try {
    await ensureSeeded()
    const sprints = await db.sprint.findMany({
      include: {
        issues: { select: { id: true, status: true, estimate: true } },
        _count: { select: { issues: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ sprints })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded()
    const body = await request.json()
    const { name, goal, startDate, endDate, status } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Name, start date, and end date are required' }, { status: 400 })
    }

    const sprint = await db.sprint.create({
      data: {
        name,
        goal: goal || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'planned',
      },
    })

    return NextResponse.json({ sprint }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
