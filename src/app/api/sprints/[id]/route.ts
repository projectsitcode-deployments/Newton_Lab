import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const sprint = await db.sprint.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ sprint })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
