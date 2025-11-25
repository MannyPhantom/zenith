import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { updateTask, deleteTask, getProjectTeamMembers, getStatusFromProgress, type Task, type TeamMember } from "@/lib/project-data-supabase"
import { Edit, Trash2, Calendar, User, Flag, CheckCircle, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect } from "react"
import { EmployeeAvatar } from "@/components/ui/employee-avatar"

interface TaskDetailsDialogProps {
  projectId: string
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsDialog({ 
  projectId, 
  task,
  open, 
  onOpenChange 
}: TaskDetailsDialogProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Task | null>(task)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      const members = await getProjectTeamMembers(projectId)
      setTeamMembers(members)
    }
    if (open) {
      loadTeamMembers()
    }
  }, [projectId, open])

  // Update formData when task changes
  if (task && formData?.id !== task.id) {
    setFormData(task)
    setMode('view')
  }

  if (!task || !formData) return null

  const handleSave = async () => {
    if (!formData.title.trim()) return

    console.log('[TaskDetailsDialog] Saving task with progress:', formData.progress)
    
    // Build updates object - only include status if it was manually changed
    // (not auto-calculated from progress)
    const updates: Partial<Task> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assignee: formData.assignee,
      deadline: formData.deadline,
      progress: formData.progress,
    }
    
    // Only include status if user manually changed it from a non-auto-updated state
    // OR if task is blocked/backlog (user-controlled states)
    if (formData.status === 'blocked' || formData.status === 'backlog' || 
        task.status === 'blocked' || task.status === 'backlog') {
      updates.status = formData.status
      console.log('[TaskDetailsDialog] Including manual status:', formData.status)
    } else {
      console.log('[TaskDetailsDialog] Letting progress auto-determine status')
    }

    await updateTask(projectId, task.id, updates)

    setMode('view')
    onOpenChange(false)
  }

  const handleDelete = async () => {
    await deleteTask(projectId, task.id)
    setDeleteDialogOpen(false)
    onOpenChange(false)
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-500/10 border-red-500"
      case "medium":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500"
      case "low":
        return "text-green-600 bg-green-500/10 border-green-500"
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "text-green-600 bg-green-500/10 border-green-500"
      case "in-progress":
        return "text-blue-600 bg-blue-500/10 border-blue-500"
      case "review":
        return "text-purple-600 bg-purple-500/10 border-purple-500"
      case "blocked":
        return "text-red-600 bg-red-500/10 border-red-500"
      case "todo":
        return "text-gray-600 bg-gray-500/10 border-gray-500"
      default:
        return "text-gray-600 bg-gray-500/10 border-gray-500"
    }
  }

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline set'
    const date = new Date(deadline)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{mode === 'view' ? 'Task Details' : 'Edit Task'}</DialogTitle>
            <div className="absolute right-14 top-4 flex gap-2">
              {mode === 'view' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('edit')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(task)
                      setMode('view')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              {mode === 'view' ? (
                // View Mode
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Status:</span>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Flag className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Priority:</span>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Assignee:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EmployeeAvatar
                          name={task.assignee.name}
                          photoUrl={task.assignee.avatar && task.assignee.avatar !== "/placeholder.svg?height=32&width=32" ? task.assignee.avatar : undefined}
                          size="sm"
                        />
                        <p className="text-sm">{task.assignee.name}</p>
                      </div>
                    </div>

                    {task.deadline && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Deadline:</span>
                        </div>
                        <p className="text-sm">{formatDeadline(task.deadline)}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Progress
                      </span>
                      <span className="text-lg font-semibold text-primary">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary rounded-full h-2.5 transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    {task.status !== 'blocked' && task.status !== 'backlog' && task.progress !== 100 && task.progress !== 0 && (
                      <p className="text-xs text-muted-foreground">
                        Progress updates will auto-adjust task status
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Task Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter task title..."
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter task description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as Task["status"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-assignee">Assignee</Label>
                      <Select
                        value={formData.assignee.name}
                        onValueChange={(value) => {
                          const member = teamMembers.find(m => m.name === value)
                          if (member) {
                            setFormData({ 
                              ...formData, 
                              assignee: { name: member.name, avatar: member.avatar }
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                  {member.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm">{member.name}</span>
                                  <span className="text-xs text-muted-foreground">{member.role}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
                      <Input
                        id="edit-deadline"
                        type="date"
                        value={formData.deadline || ''}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-progress" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Progress
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            setFormData({ ...formData, progress: value })
                          }}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-sm font-medium">%</span>
                      </div>
                    </div>
                    <Slider
                      id="edit-progress"
                      min={0}
                      max={100}
                      step={5}
                      value={[formData.progress]}
                      onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                      className="w-full"
                    />
                    {formData.status !== 'blocked' && formData.status !== 'backlog' && (
                      <p className="text-xs text-muted-foreground">
                        Status will auto-update: {formData.progress === 0 && 'To Do'}{formData.progress > 0 && formData.progress < 75 && 'In Progress'}{formData.progress >= 75 && formData.progress < 100 && 'Review'}{formData.progress === 100 && 'Done'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                Activity history coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

