import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const totalIssues = await db.issue.count()
    const doneIssues = await db.issue.count({ where: { status: 'done' } })
    const inProgress = await db.issue.count({ where: { status: 'inprogress' } })
    const inReview = await db.issue.count({ where: { status: 'inreview' } })
    const todo = await db.issue.count({ where: { status: 'todo' } })
    const backlog = await db.issue.count({ where: { status: 'backlog' } })
    const highPriority = await db.issue.count({ where: { priority: 'high', status: { not: 'done' } } })
    const bugs = await db.issue.count({ where: { type: 'bug', status: { not: 'done' } } })
    const totalStoryPoints = await db.issue.aggregate({ _sum: { estimate: true } })
    const doneStoryPoints = await db.issue.aggregate({ where: { status: 'done' }, _sum: { estimate: true } })
    const teamSize = await db.user.count()
    const activeSprints = await db.sprint.count({ where: { status: 'active' } })
    const totalComments = await db.comment.count()
    const totalTimeLogged = await db.timeLog.aggregate({ _sum: { hours: true } })

    return NextResponse.json({
      totalIssues,
      doneIssues,
      inProgress,
      inReview,
      todo,
      backlog,
      highPriority,
      bugs,
      totalStoryPoints: totalStoryPoints._sum.estimate || 0,
      doneStoryPoints: doneStoryPoints._sum.estimate || 0,
      teamSize,
      activeSprints,
      totalComments,
      totalTimeLogged: totalTimeLogged._sum.hours || 0,
      completionRate: totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
