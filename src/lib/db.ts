import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  // On Vercel, use /tmp for SQLite (only writable directory)
  // Locally, use the default from .env
  const envUrl = process.env.DATABASE_URL
  if (envUrl) {
    if (envUrl.startsWith('file:')) {
      // Remap local paths to /tmp on Vercel
      if (process.env.VERCEL) {
        return 'file:/tmp/flowtrack.db'
      }
    }
    return envUrl
  }
  // Fallback
  return process.env.VERCEL ? 'file:/tmp/flowtrack.db' : 'file:./dev.db'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Auto-seed helper: call this to seed the database if it's empty
export async function ensureSeeded() {
  try {
    const userCount = await db.user.count()
    if (userCount === 0) {
      console.log('Database is empty, seeding...')
      await seedDatabase()
      console.log('Database seeded successfully!')
    }
  } catch (error) {
    console.error('Failed to check/seed database:', error)
  }
}

async function seedDatabase() {
  // Create users
  const john = await db.user.create({
    data: {
      name: 'John Doe',
      email: 'john@flowtrack.com',
      password: 'password123',
      initials: 'JD',
      role: 'project lead',
      avatarColor: '#667eea',
    },
  })

  const alice = await db.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@flowtrack.com',
      password: 'password123',
      initials: 'AS',
      role: 'senior developer',
      avatarColor: '#f093fb',
    },
  })

  const bob = await db.user.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob@flowtrack.com',
      password: 'password123',
      initials: 'BJ',
      role: 'developer',
      avatarColor: '#4facfe',
    },
  })

  const mike = await db.user.create({
    data: {
      name: 'Mike Kim',
      email: 'mike@flowtrack.com',
      password: 'password123',
      initials: 'MK',
      role: 'designer',
      avatarColor: '#43e97b',
    },
  })

  // Create sprints
  const sprint24 = await db.sprint.create({
    data: {
      name: 'Sprint 24',
      goal: 'Complete user authentication and dashboard redesign',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-29'),
      status: 'active',
    },
  })

  const sprint25 = await db.sprint.create({
    data: {
      name: 'Sprint 25',
      goal: 'API optimization and mobile responsiveness',
      startDate: new Date('2024-01-29'),
      endDate: new Date('2024-02-12'),
      status: 'planned',
    },
  })

  // Create issues
  const issuesData = [
    {
      key: 'FT-101',
      title: 'Implement user authentication with JWT tokens',
      description: 'Set up secure JWT-based authentication with refresh tokens, including login, registration, and password reset flows.',
      type: 'story',
      priority: 'high',
      status: 'done',
      estimate: 8,
      sprintId: sprint24.id,
      reporterId: john.id,
      assigneeId: alice.id,
    },
    {
      key: 'FT-102',
      title: 'Design new dashboard layout with widgets',
      description: 'Create a responsive dashboard layout with customizable widget panels for stats, charts, and recent activity.',
      type: 'story',
      priority: 'high',
      status: 'inreview',
      estimate: 5,
      sprintId: sprint24.id,
      reporterId: john.id,
      assigneeId: mike.id,
    },
    {
      key: 'FT-103',
      title: 'Fix pagination bug in issue list',
      description: 'The issue list pagination shows incorrect page counts when filters are applied.',
      type: 'bug',
      priority: 'high',
      status: 'inprogress',
      estimate: 3,
      sprintId: sprint24.id,
      reporterId: bob.id,
      assigneeId: bob.id,
    },
    {
      key: 'FT-104',
      title: 'Add drag-and-drop to sprint board',
      description: 'Implement drag-and-drop functionality for moving issues between columns on the kanban board.',
      type: 'task',
      priority: 'medium',
      status: 'inprogress',
      estimate: 5,
      sprintId: sprint24.id,
      reporterId: alice.id,
      assigneeId: alice.id,
    },
    {
      key: 'FT-105',
      title: 'Set up CI/CD pipeline with GitHub Actions',
      description: 'Configure automated testing, linting, and deployment pipeline using GitHub Actions.',
      type: 'task',
      priority: 'medium',
      status: 'todo',
      estimate: 3,
      sprintId: sprint24.id,
      reporterId: john.id,
      assigneeId: bob.id,
    },
    {
      key: 'FT-106',
      title: 'Optimize API response times',
      description: 'Profile and optimize slow API endpoints. Target <200ms response time for all endpoints.',
      type: 'story',
      priority: 'high',
      status: 'todo',
      estimate: 8,
      sprintId: sprint25.id,
      reporterId: john.id,
      assigneeId: alice.id,
    },
    {
      key: 'FT-107',
      title: 'Mobile responsive navigation',
      description: 'Make the sidebar and topbar fully responsive for mobile and tablet devices.',
      type: 'story',
      priority: 'medium',
      status: 'todo',
      estimate: 5,
      sprintId: sprint25.id,
      reporterId: mike.id,
      assigneeId: mike.id,
    },
    {
      key: 'FT-108',
      title: 'Add real-time notifications system',
      description: 'Implement WebSocket-based real-time notifications for issue updates, comments, and mentions.',
      type: 'epic',
      priority: 'low',
      status: 'backlog',
      estimate: 13,
      sprintId: null as string | null,
      reporterId: john.id,
      assigneeId: null as string | null,
    },
    {
      key: 'FT-109',
      title: 'Write API documentation with OpenAPI',
      description: 'Create comprehensive API documentation using OpenAPI/Swagger specification.',
      type: 'task',
      priority: 'low',
      status: 'backlog',
      estimate: 3,
      sprintId: null as string | null,
      reporterId: alice.id,
      assigneeId: null as string | null,
    },
    {
      key: 'FT-110',
      title: 'Implement dark mode theme',
      description: 'Add dark mode support with smooth theme switching and persistence of user preference.',
      type: 'story',
      priority: 'medium',
      status: 'inprogress',
      estimate: 3,
      sprintId: sprint24.id,
      reporterId: mike.id,
      assigneeId: mike.id,
    },
  ]

  const createdIssues = []
  for (const issue of issuesData) {
    const created = await db.issue.create({ data: issue })
    createdIssues.push(created)
  }

  // Create comments
  await db.comment.createMany({
    data: [
      { body: "I've implemented the JWT logic with refresh token rotation. Please review the auth middleware.", authorId: alice.id, issueId: createdIssues[0].id },
      { body: 'Looks good! Just need to add rate limiting on the login endpoint.', authorId: john.id, issueId: createdIssues[0].id },
      { body: "Dashboard mockups are ready in Figma. I've used a grid-based layout for widgets.", authorId: mike.id, issueId: createdIssues[1].id },
      { body: "Found the root cause - the count query wasn't applying filters. Fixing now.", authorId: bob.id, issueId: createdIssues[2].id },
      { body: 'Using @dnd-kit/core for the drag implementation. It works well with React 19.', authorId: alice.id, issueId: createdIssues[3].id },
    ],
  })

  // Create time logs
  await db.timeLog.createMany({
    data: [
      { hours: 4, date: new Date('2024-01-16'), note: 'JWT implementation', userId: alice.id, issueId: createdIssues[0].id },
      { hours: 3, date: new Date('2024-01-17'), note: 'Refresh token rotation', userId: alice.id, issueId: createdIssues[0].id },
      { hours: 2, date: new Date('2024-01-18'), note: 'Dashboard wireframes', userId: mike.id, issueId: createdIssues[1].id },
      { hours: 3, date: new Date('2024-01-18'), note: 'Bug investigation', userId: bob.id, issueId: createdIssues[2].id },
      { hours: 2.5, date: new Date('2024-01-19'), note: 'DnD setup', userId: alice.id, issueId: createdIssues[3].id },
      { hours: 1.5, date: new Date('2024-01-19'), note: 'Dark mode CSS variables', userId: mike.id, issueId: createdIssues[9].id },
    ],
  })

  // Create issue history
  await db.issueHistory.createMany({
    data: [
      { action: 'created', toValue: 'todo', issueId: createdIssues[0].id, userId: john.id },
      { action: 'status_changed', fromValue: 'todo', toValue: 'inprogress', issueId: createdIssues[0].id, userId: john.id },
      { action: 'assigned', fromValue: '', toValue: 'Alice Smith', issueId: createdIssues[0].id, userId: john.id },
      { action: 'status_changed', fromValue: 'inprogress', toValue: 'inreview', issueId: createdIssues[0].id, userId: alice.id },
      { action: 'status_changed', fromValue: 'inreview', toValue: 'done', issueId: createdIssues[0].id, userId: john.id },
      { action: 'created', toValue: 'todo', issueId: createdIssues[1].id, userId: john.id },
      { action: 'assigned', fromValue: '', toValue: 'Mike Kim', issueId: createdIssues[1].id, userId: john.id },
      { action: 'status_changed', fromValue: 'todo', toValue: 'inprogress', issueId: createdIssues[1].id, userId: mike.id },
      { action: 'status_changed', fromValue: 'inprogress', toValue: 'inreview', issueId: createdIssues[1].id, userId: mike.id },
    ],
  })

  // Create chat messages
  await db.chatMessage.createMany({
    data: [
      { body: "Hey team, Sprint 24 is going well! We're on track for the Jan 29 deadline.", isAI: false, authorId: john.id },
      { body: "I should finish the auth module by end of day. The JWT implementation passed all tests.", isAI: false, authorId: alice.id },
      { body: "Great progress Alice! Based on the current sprint velocity, the team has completed 60% of planned story points. At this rate, Sprint 24 should finish on schedule.", isAI: true, authorId: alice.id },
      { body: 'The dashboard design is coming along. I\'m working on the widget layout now.', isAI: false, authorId: mike.id },
      { body: "I found the pagination bug - it was a filter query issue. Should have a fix soon.", isAI: false, authorId: bob.id },
    ],
  })

  // Create automations
  await db.automation.createMany({
    data: [
      { name: 'Auto-assign high priority bugs', description: 'When a high priority bug is created, automatically assign it to the lead developer', trigger: 'issue_created', action: 'auto_assign_lead', enabled: true, icon: 'bug', color: '#ef4444' },
      { name: 'Sprint status summary', description: 'Send daily sprint progress summary to the team', trigger: 'daily', action: 'send_summary', enabled: true, icon: 'calendar', color: '#f59e0b' },
      { name: 'Stale issue reminder', description: "Notify assignee when an issue hasn't been updated in 3 days", trigger: 'scheduled', action: 'send_reminder', enabled: false, icon: 'clock', color: '#8b5cf6' },
    ],
  })

  // Create initiatives
  await db.initiative.createMany({
    data: [
      { name: 'Platform Security', progress: 75, items: 12 },
      { name: 'UX Redesign', progress: 40, items: 8 },
      { name: 'API v2 Migration', progress: 15, items: 15 },
      { name: 'Mobile App', progress: 5, items: 20 },
    ],
  })

  // Create app settings
  await db.appSetting.createMany({
    data: [
      { key: 'default_sprint_duration', value: '14' },
      { key: 'working_hours_per_day', value: '8' },
      { key: 'theme', value: 'light' },
    ],
  })
}
