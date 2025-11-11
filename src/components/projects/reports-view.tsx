import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Project } from "@/lib/project-data"
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Users,
  Target,
  Activity,
} from "lucide-react"

interface ReportsViewProps {
  project: Project
}

export function ReportsView({ project }: ReportsViewProps) {
  // Calculate metrics
  const completionRate = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0

  const tasksByStatus = {
    todo: project.tasks.filter(t => t.status === 'todo').length,
    inProgress: project.tasks.filter(t => t.status === 'in-progress').length,
    done: project.tasks.filter(t => t.status === 'done').length,
    blocked: project.tasks.filter(t => t.status === 'blocked').length,
  }

  const tasksByPriority = {
    high: project.tasks.filter(t => t.priority === 'high').length,
    medium: project.tasks.filter(t => t.priority === 'medium').length,
    low: project.tasks.filter(t => t.priority === 'low').length,
  }

  // Calculate overdue tasks
  const today = new Date()
  const overdueTasks = project.tasks.filter(task => {
    if (!task.deadline || task.status === 'done') return false
    const deadline = new Date(task.deadline)
    return deadline < today
  }).length

  // Calculate upcoming deadlines (next 7 days)
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  const upcomingDeadlines = project.tasks.filter(task => {
    if (!task.deadline || task.status === 'done') return false
    const deadline = new Date(task.deadline)
    return deadline >= today && deadline <= nextWeek
  }).length

  // Team statistics
  const teamSize = project.team.length
  const taskAssignments = project.tasks.filter(t => t.assignee).length
  const unassignedTasks = project.totalTasks - taskAssignments

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {project.completedTasks} of {project.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksByStatus.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {tasksByStatus.todo} tasks in backlog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {upcomingDeadlines} due this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamSize}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {unassignedTasks} unassigned tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status & Priority Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Distribution of tasks across workflow stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-sm">To Do</span>
                </div>
                <span className="font-semibold">{tasksByStatus.todo}</span>
              </div>
              <Progress value={(tasksByStatus.todo / project.totalTasks) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-semibold">{tasksByStatus.inProgress}</span>
              </div>
              <Progress value={(tasksByStatus.inProgress / project.totalTasks) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Done</span>
                </div>
                <span className="font-semibold">{tasksByStatus.done}</span>
              </div>
              <Progress value={(tasksByStatus.done / project.totalTasks) * 100} className="h-2" />
            </div>

            {tasksByStatus.blocked > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Blocked</span>
                  </div>
                  <span className="font-semibold">{tasksByStatus.blocked}</span>
                </div>
                <Progress value={(tasksByStatus.blocked / project.totalTasks) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Priority distribution across all tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">High Priority</span>
                </div>
                <span className="font-semibold">{tasksByPriority.high}</span>
              </div>
              <Progress value={(tasksByPriority.high / project.totalTasks) * 100} className="h-2 [&>div]:bg-red-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Medium Priority</span>
                </div>
                <span className="font-semibold">{tasksByPriority.medium}</span>
              </div>
              <Progress value={(tasksByPriority.medium / project.totalTasks) * 100} className="h-2 [&>div]:bg-yellow-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Low Priority</span>
                </div>
                <span className="font-semibold">{tasksByPriority.low}</span>
              </div>
              <Progress value={(tasksByPriority.low / project.totalTasks) * 100} className="h-2 [&>div]:bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Task completion by team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.team.map((member) => {
              const memberTasks = project.tasks.filter(t => t.assignee?.name === member.name)
              const completedTasks = memberTasks.filter(t => t.status === 'done').length
              const totalTasks = memberTasks.length
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <div key={member.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{completedTasks}/{totalTasks}</p>
                      <p className="text-xs text-muted-foreground">{completionRate}%</p>
                    </div>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Tasks */}
      {(overdueTasks > 0 || tasksByPriority.high > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Attention Required</CardTitle>
            <CardDescription>High priority and overdue tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.tasks
                .filter(task => {
                  const isOverdue = task.deadline && new Date(task.deadline) < today && task.status !== 'done'
                  const isHighPriority = task.priority === 'high' && task.status !== 'done'
                  return isOverdue || isHighPriority
                })
                .slice(0, 10)
                .map(task => {
                  const isOverdue = task.deadline && new Date(task.deadline) < today
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{task.title}</p>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                          {task.priority === 'high' && (
                            <Badge variant="outline" className="text-xs border-red-500 text-red-600">High Priority</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {task.assignee && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {task.assignee.name}
                            </span>
                          )}
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

