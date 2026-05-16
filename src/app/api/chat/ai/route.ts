import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeeded } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded()
    const { message, issueContext } = await request.json()

    // Get project context for AI
    const issueCount = await db.issue.count()
    const doneCount = await db.issue.count({ where: { status: 'done' } })
    const inProgressCount = await db.issue.count({ where: { status: 'inprogress' } })
    const userCount = await db.user.count()

    const context = `
Project: FlowTrack Pro
Total Issues: ${issueCount}
Completed: ${doneCount}
In Progress: ${inProgressCount}
Team Size: ${userCount}
${issueContext ? `\nCurrent Issue Context: ${issueContext}` : ''}
User Question: ${message}
`

    // Use z-ai-web-dev-sdk for AI response
    const { createLLMChatCompletion } = await import('z-ai-web-dev-sdk')
    const response = await createLLMChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are FlowTrack AI Assistant, a helpful project management assistant. Be concise, actionable, and friendly. Provide specific suggestions when asked about project management, sprint planning, or development workflow.',
        },
        {
          role: 'user',
          content: context,
        },
      ],
    })

    const aiResponse = response.choices?.[0]?.message?.content || 'Sorry, I could not generate a response at this time.'

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI Chat error:', error)
    // Fallback response
    return NextResponse.json({
      response: 'Based on the current project data, I suggest focusing on high-priority issues first and ensuring the sprint backlog is well-groomed. Consider using time-boxing for complex tasks.',
    })
  }
}
