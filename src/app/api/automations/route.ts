import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function GET() {
  try {
    await ensureSeeded()
    const automations = await db.automation.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ automations })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, trigger, action, icon, color } = body

    if (!name || !trigger || !action) {
      return NextResponse.json({ error: 'Name, trigger, and action are required' }, { status: 400 })
    }

    const automation = await db.automation.create({
      data: {
        name,
        description: description || '',
        trigger,
        action,
        icon: icon || 'zap',
        color: color || '#667eea',
      },
    })

    return NextResponse.json({ automation }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
