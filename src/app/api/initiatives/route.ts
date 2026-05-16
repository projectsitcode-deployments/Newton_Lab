import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET() {
  try {
    await ensureSeeded()
    const initiatives = await db.initiative.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ initiatives })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, progress, items } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const initiative = await db.initiative.create({
      data: {
        name,
        progress: progress || 0,
        items: items || 0,
      },
    })

    return NextResponse.json({ initiative }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
