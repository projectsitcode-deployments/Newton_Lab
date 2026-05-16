'use client'

import { useAppStore } from '@/lib/store'
import { CheckCircle2, LayoutDashboard, Bug, Code, Rocket, FileText, Layers, GitBranch, ShoppingCart, Shield, Smartphone } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  issues: { title: string; type: string; priority: string; estimate: number }[]
  icon: React.ReactNode
  color: string
}

const templates: Template[] = [
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Ready-to-use sprint template with user stories, tasks, and bug tracking items.',
    category: 'Sprint',
    issues: [
      { title: 'Define sprint goal and acceptance criteria', type: 'task', priority: 'high', estimate: 2 },
      { title: 'Break down epic into user stories', type: 'story', priority: 'high', estimate: 3 },
      { title: 'Estimate story points for all items', type: 'task', priority: 'medium', estimate: 2 },
      { title: 'Assign stories to team members', type: 'task', priority: 'medium', estimate: 1 },
      { title: 'Set up CI/CD for sprint deliverables', type: 'task', priority: 'low', estimate: 3 },
      { title: 'Create sprint retrospective document', type: 'task', priority: 'low', estimate: 1 },
    ],
    icon: <LayoutDashboard size={24} />,
    color: '#6c63ff',
  },
  {
    id: 'bug-fixing',
    name: 'Bug Fix Sprint',
    description: 'Focused template for triaging and resolving reported bugs.',
    category: 'Quality',
    issues: [
      { title: 'Triage and prioritize bug backlog', type: 'task', priority: 'high', estimate: 2 },
      { title: 'Fix critical login authentication bug', type: 'bug', priority: 'high', estimate: 5 },
      { title: 'Resolve data export formatting issue', type: 'bug', priority: 'high', estimate: 3 },
      { title: 'Fix mobile responsive layout breaks', type: 'bug', priority: 'medium', estimate: 3 },
      { title: 'Address slow query performance', type: 'bug', priority: 'medium', estimate: 5 },
      { title: 'Verify all fixes with regression tests', type: 'task', priority: 'low', estimate: 2 },
    ],
    icon: <Bug size={24} />,
    color: '#ef4444',
  },
  {
    id: 'feature-dev',
    name: 'Feature Development',
    description: 'Full feature lifecycle from design to deployment.',
    category: 'Development',
    issues: [
      { title: 'Create feature specification document', type: 'story', priority: 'high', estimate: 3 },
      { title: 'Design UI mockups and prototypes', type: 'story', priority: 'high', estimate: 5 },
      { title: 'Implement core backend API endpoints', type: 'task', priority: 'high', estimate: 8 },
      { title: 'Build frontend components', type: 'task', priority: 'medium', estimate: 5 },
      { title: 'Write unit and integration tests', type: 'task', priority: 'medium', estimate: 3 },
      { title: 'Update documentation', type: 'task', priority: 'low', estimate: 2 },
    ],
    icon: <Code size={24} />,
    color: '#43e97b',
  },
  {
    id: 'release',
    name: 'Release Checklist',
    description: 'Pre-release checklist ensuring quality and smooth deployment.',
    category: 'Release',
    issues: [
      { title: 'Run full test suite', type: 'task', priority: 'high', estimate: 2 },
      { title: 'Update changelog and release notes', type: 'task', priority: 'high', estimate: 1 },
      { title: 'Security audit and vulnerability scan', type: 'task', priority: 'high', estimate: 3 },
      { title: 'Database migration scripts ready', type: 'task', priority: 'high', estimate: 2 },
      { title: 'Deploy to staging environment', type: 'task', priority: 'medium', estimate: 1 },
      { title: 'Smoke test on staging', type: 'task', priority: 'medium', estimate: 2 },
      { title: 'Deploy to production', type: 'task', priority: 'high', estimate: 1 },
      { title: 'Monitor production metrics', type: 'task', priority: 'medium', estimate: 1 },
    ],
    icon: <Rocket size={24} />,
    color: '#f093fb',
  },
  {
    id: 'api-design',
    name: 'API Design',
    description: 'Template for designing and implementing RESTful APIs.',
    category: 'Development',
    issues: [
      { title: 'Define API endpoints and data models', type: 'story', priority: 'high', estimate: 3 },
      { title: 'Set up OpenAPI/Swagger documentation', type: 'task', priority: 'medium', estimate: 2 },
      { title: 'Implement authentication middleware', type: 'task', priority: 'high', estimate: 3 },
      { title: 'Add rate limiting and caching', type: 'task', priority: 'medium', estimate: 3 },
      { title: 'Write API integration tests', type: 'task', priority: 'low', estimate: 3 },
    ],
    icon: <Layers size={24} />,
    color: '#4facfe',
  },
  {
    id: 'code-review',
    name: 'Code Review Process',
    description: 'Structured code review workflow for pull requests.',
    category: 'Quality',
    issues: [
      { title: 'Set up PR review checklist', type: 'task', priority: 'high', estimate: 1 },
      { title: 'Review architecture and design patterns', type: 'story', priority: 'high', estimate: 2 },
      { title: 'Check code style and best practices', type: 'task', priority: 'medium', estimate: 2 },
      { title: 'Verify error handling and edge cases', type: 'task', priority: 'medium', estimate: 2 },
      { title: 'Performance review and optimization', type: 'task', priority: 'low', estimate: 2 },
    ],
    icon: <GitBranch size={24} />,
    color: '#f59e0b',
  },
  {
    id: 'onboarding',
    name: 'New Team Onboarding',
    description: 'Template to onboard new team members with structured tasks.',
    category: 'Team',
    issues: [
      { title: 'Set up development environment', type: 'task', priority: 'high', estimate: 2 },
      { title: 'Review project architecture documentation', type: 'story', priority: 'high', estimate: 3 },
      { title: 'Complete coding standards walkthrough', type: 'task', priority: 'medium', estimate: 1 },
      { title: 'Shadow senior developer for a sprint', type: 'story', priority: 'medium', estimate: 8 },
      { title: 'Complete first solo bug fix', type: 'task', priority: 'low', estimate: 3 },
    ],
    icon: <Shield size={24} />,
    color: '#8b5cf6',
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Sprint',
    description: 'Tasks specific to mobile app development and testing.',
    category: 'Mobile',
    issues: [
      { title: 'Design mobile-first UI components', type: 'story', priority: 'high', estimate: 5 },
      { title: 'Implement push notification system', type: 'task', priority: 'high', estimate: 5 },
      { title: 'Add offline data synchronization', type: 'task', priority: 'medium', estimate: 5 },
      { title: 'Test on multiple device sizes', type: 'task', priority: 'medium', estimate: 3 },
      { title: 'Submit to app stores', type: 'task', priority: 'low', estimate: 2 },
    ],
    icon: <Smartphone size={24} />,
    color: '#ec4899',
  },
]

export function Templates() {
  const { setCreateIssueOpen, user } = useAppStore()

  const applyTemplate = async (template: Template) => {
    if (!user) return
    try {
      for (const issue of template.issues) {
        await fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: issue.title,
            type: issue.type,
            priority: issue.priority,
            estimate: issue.estimate,
            reporterId: user.id,
          }),
        })
      }
    } catch { /* ignore */ }
  }

  const categories = [...new Set(templates.map(t => t.category))]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[var(--neu-text)]">Templates</h2>
        <p className="text-sm text-[var(--neu-text-muted)]">Apply templates to quickly create pre-defined issue sets</p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-[var(--neu-text-muted)] uppercase tracking-wider mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates
              .filter(t => t.category === category)
              .map((template) => (
                <div key={template.id} className="neu-card p-5 hover:neu-flat transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: template.color }}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--neu-text)]">{template.name}</h4>
                      <span className="text-[10px] text-[var(--neu-text-muted)]">{template.issues.length} items</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-4 leading-relaxed">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.issues.slice(0, 3).map((issue, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded type-${issue.type}`}>{issue.type}</span>
                    ))}
                    {template.issues.length > 3 && (
                      <span className="text-[10px] text-[var(--neu-text-muted)]">+{template.issues.length - 3} more</span>
                    )}
                  </div>
                  <button
                    onClick={() => applyTemplate(template)}
                    className="w-full neu-btn px-3 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CheckCircle2 size={12} className="inline mr-1" />
                    Apply Template
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
