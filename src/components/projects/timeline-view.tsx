"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project, Task } from "@/lib/project-data"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

interface TimelineViewProps {
  project: Project
}

const statusConfig = [
  { key: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { key: 'todo', label: 'To Do', color: 'bg-yellow-500' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { key: 'review', label: 'Review', color: 'bg-purple-500' },
  { key: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { key: 'done', label: 'Done', color: 'bg-green-500' },
]

export function TimelineView({ project }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate timeline range
  const { startDate, endDate, months } = useMemo(() => {
    if (!project.tasks || project.tasks.length === 0) {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      return { startDate: start, endDate: end, months: [] }
    }

    const dates = project.tasks.map(t => new Date(t.deadline))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    // Add padding
    const start = new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1)
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0)

    // Generate months
    const monthsList = []
    let current = new Date(start)
    while (current <= end) {
      monthsList.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      })
      current.setMonth(current.getMonth() + 1)
    }

    return { startDate: start, endDate: end, months: monthsList }
  }, [project.tasks])

  // Group tasks by assignee
  const tasksByAssignee = useMemo(() => {
    const groups: Record<string, Task[]> = {}

    project.tasks.forEach(task => {
      const assigneeName = task.assignee.name
      if (!groups[assigneeName]) {
        groups[assigneeName] = []
      }
      groups[assigneeName].push(task)
    })

    return groups
  }, [project.tasks])

  // Get unique team members
  const teamMembers = useMemo(() => {
    return Object.keys(tasksByAssignee).map(name => {
      const firstTask = tasksByAssignee[name][0]
      return {
        name,
        avatar: firstTask.assignee.avatar,
        role: name.toLowerCase().includes('designer') ? 'designer' : 'developer'
      }
    })
  }, [tasksByAssignee])

  // Calculate task position
  const getTaskPosition = (task: Task) => {
    const taskDate = new Date(task.deadline)
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (taskDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const left = (daysFromStart / totalDays) * 100
    return Math.max(0, Math.min(left, 100))
  }

  // Get status color for a task
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'review': return 'bg-purple-500'
      case 'blocked': return 'bg-red-500'
      case 'todo': return 'bg-yellow-500'
      case 'backlog': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Timeline Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Project Roadmap</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Timeline view of all project tasks • {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Timeline Swimlanes */}
        {project.tasks.length > 0 ? (
          <div className="space-y-4">
            {/* Month Headers */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-0 min-w-full">
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="flex-1 text-center py-2 px-4 bg-muted/30 border-r border-border/40 last:border-r-0"
                      style={{ minWidth: `${100 / months.length}%` }}
                    >
                      <div className="text-sm font-semibold text-foreground">{month.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Team Member Swimlanes */}
            <div className="space-y-2">
              {teamMembers.map(member => {
                const tasks = tasksByAssignee[member.name]

                return (
                  <div key={member.name} className="border border-border/40 rounded-lg overflow-hidden bg-card">
                    {/* Lane Header */}
                    <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">({tasks.length})</span>
                      </div>
                    </div>

                    {/* Lane Content */}
                    <div className="relative min-h-[120px] bg-muted/5" style={{ height: 'auto' }}>
                      {/* Timeline Grid */}
                      <div className="absolute inset-0 flex">
                        {months.map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-border/20 last:border-r-0"
                            style={{ minWidth: `${100 / months.length}%` }}
                          />
                        ))}
                      </div>

                      {/* Task Cards */}
                      <div className="relative" style={{ paddingBottom: '8px', paddingTop: '8px' }}>
                        {tasks.map((task, i) => {
                          const position = getTaskPosition(task)
                          const statusColor = getStatusColor(task.status)
                          
                          // Calculate row based on overlaps
                          let row = 0
                          const cardWidth = 140
                          const cardStartPos = position - (cardWidth / 2)
                          const cardEndPos = position + (cardWidth / 2)
                          
                          // Check previous tasks for overlaps
                          for (let j = 0; j < i; j++) {
                            const prevTask = tasks[j]
                            const prevPosition = getTaskPosition(prevTask)
                            const prevStartPos = prevPosition - (cardWidth / 2)
                            const prevEndPos = prevPosition + (cardWidth / 2)
                            
                            // If there's overlap, check next row
                            if (!(cardEndPos < prevStartPos || cardStartPos > prevEndPos)) {
                              row++
                            }
                          }

                          const topPosition = 8 + (row * 90) // 90px per row (80px card + 10px gap)

                          return (
                            <div
                              key={task.id}
                              className={`absolute h-20 px-3 py-2 rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer ${statusColor} text-white group`}
                              style={{
                                left: `${position}%`,
                                transform: 'translateX(-50%)',
                                width: '140px',
                                top: `${topPosition}px`
                              }}
                              title={task.title}
                            >
                              <div className="flex flex-col h-full">
                                <div className="text-xs font-semibold truncate">{task.title}</div>
                                <div className="text-[10px] opacity-90 mt-1 capitalize">{task.status.replace('-', ' ')}</div>
                                <div className="mt-auto flex items-center gap-2">
                                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-white/70 rounded-full transition-all"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] opacity-90">{task.progress}%</span>
                                </div>
                              </div>

                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border border-border min-w-[200px]">
                                  <div className="text-sm font-semibold">{task.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    Status: {task.status.replace('-', ' ')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No tasks to display
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border flex items-center gap-6 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          {statusConfig.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-xs text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground">{project.tasks.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {project.tasks.filter((t) => t.status === "done").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {project.tasks.filter((t) => t.status === "in-progress").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Milestones - Only show if project has milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Project Milestones</h3>
          </div>
          <div className="space-y-3">
            {project.milestones.map((milestone, i) => (
              <div
                key={milestone.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/20 transition-all"
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${
                      milestone.status === "completed"
                        ? "bg-green-500/20 text-green-500"
                        : milestone.status === "in-progress"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-blue-500/20 text-blue-500"
                    }
                  `}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{milestone.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(milestone.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    milestone.status === "completed"
                      ? "border-green-500/50 text-green-500"
                      : milestone.status === "in-progress"
                        ? "border-yellow-500/50 text-yellow-500"
                        : "border-blue-500/50 text-blue-500"
                  }`}
                >
                  {milestone.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
