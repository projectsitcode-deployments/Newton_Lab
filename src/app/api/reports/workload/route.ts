import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        assignedIssues: {
          where: { status: { not: 'done' } },
          select: { id: true, status: true, priority: true, estimate: true },
        },
        timeLogs: { select: { hours: true } },
      },
    })

    const workload = users.map(user => {
      const assignedCount = user.assignedIssues.length
      const highPriorityCount = user.assignedIssues.filter(i => i.priority === 'high').length
      const totalEstimate = user.assignedIssues.reduce((sum, i) => sum + i.estimate, 0)
      const totalHoursLogged = user.timeLogs.reduce((sum, tl) => sum + tl.hours, 0)
      const inProgressCount = user.assignedIssues.filter(i => i.status === 'inprogress').length

      return {
        id: user.id,
        name: user.name,
        initials: user.initials,
        avatarColor: user.avatarColor,
        role: user.role,
        assignedIssues: assignedCount,
        highPriorityIssues: highPriorityCount,
        inProgressIssues: inProgressCount,
        totalEstimate,
        totalHoursLogged,
        utilization: totalEstimate > 0 ? Math.min(100, Math.round((totalHoursLogged / totalEstimate) * 100)) : 0,
      }
    })

    return NextResponse.json({ workload })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
