import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sprints = await db.sprint.findMany({
      include: {
        issues: {
          select: { status: true, estimate: true, type: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const velocity = sprints.map(sprint => {
      const completedPoints = sprint.issues
        .filter(i => i.status === 'done')
        .reduce((sum, i) => sum + i.estimate, 0)
      const totalPoints = sprint.issues.reduce((sum, i) => sum + i.estimate, 0)
      const completedCount = sprint.issues.filter(i => i.status === 'done').length
      const totalCount = sprint.issues.length

      return {
        name: sprint.name,
        totalPoints,
        completedPoints,
        totalIssues: totalCount,
        completedIssues: completedCount,
        completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      }
    })

    return NextResponse.json({ velocity })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
