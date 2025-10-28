"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project, Task } from "@/lib/project-data"
import { updateTaskStatus, reorderTasks } from "@/lib/project-data"
import { GripVertical, Plus } from "lucide-react"

interface KanbanBoardProps {
  project: Project
  onAddTask?: (defaultStatus?: Task["status"]) => void
  onTaskClick?: (task: Task) => void
}

interface DragData {
  task: Task
  sourceColumnId: string
}

const statusColumns = [
  { id: "backlog", label: "Backlog", color: "bg-muted" },
  { id: "todo", label: "To Do", color: "bg-blue-500/10" },
  { id: "in-progress", label: "In Progress", color: "bg-yellow-500/10" },
  { id: "review", label: "Review", color: "bg-purple-500/10" },
  { id: "blocked", label: "Blocked", color: "bg-red-500/10" },
  { id: "done", label: "Done", color: "bg-green-500/10" },
] as const

function TaskCard({ 
  task, 
  onDragStart, 
  onClick,
  onDragOver,
  isDraggedOver,
  isBeingDragged
}: { 
  task: Task
  onDragStart: (task: Task) => void
  onClick: (task: Task) => void
  onDragOver: () => void
  isDraggedOver: boolean
  isBeingDragged: boolean
}) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-red-500/50 text-red-500 bg-red-500/10"
      case "medium":
        return "border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
      case "low":
        return "border-green-500/50 text-green-500 bg-green-500/10"
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="relative">
      {isDraggedOver && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full shadow-lg shadow-primary/50 z-10 animate-pulse" />
      )}
      <Card
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move"
          e.dataTransfer.setData("text/plain", task.id)
          onDragStart(task)
          console.log("[v0] Started dragging:", task.title)
        }}
        onDragEnd={() => {
          console.log("[v0] Drag ended")
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDragOver()
        }}
        onClick={() => onClick(task)}
        className={`p-3 cursor-pointer hover:shadow-lg transition-all group ${
          isBeingDragged ? 'opacity-40 scale-95' : 'active:opacity-50'
        } ${
          isDraggedOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]' : ''
        }`}
      >
      <div className="flex items-start gap-2">
        <div className="cursor-grab active:cursor-grabbing mt-0.5">
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-medium text-foreground leading-tight">{task.title}</h4>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
              {task.assignee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
            <span
              className={`text-xs ${
                isOverdue(task.deadline) && task.status !== "done"
                  ? "text-red-500 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {task.deadline}
            </span>
          </div>

          {task.status !== "done" && task.progress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{task.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
    </div>
  )
}

function Column({
  column,
  tasks,
  onDrop,
  onDragStart,
  onAddTask,
  onTaskClick,
  onReorder,
  projectId,
  draggedTaskId,
}: {
  column: (typeof statusColumns)[number]
  tasks: Task[]
  onDrop: (status: Task["status"]) => void
  onDragStart: (task: Task, columnId: string) => void
  onAddTask?: (defaultStatus?: Task["status"]) => void
  onTaskClick: (task: Task) => void
  onReorder: (taskId: string, targetIndex: number) => void
  projectId: string
  draggedTaskId: string | null
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)

  const handleTaskDragOver = (taskId: string) => {
    setDragOverTaskId(taskId)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setIsDragOver(true)
      }}
      onDragLeave={() => {
        setIsDragOver(false)
        setDragOverTaskId(null)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        setDragOverTaskId(null)
        
        const taskId = e.dataTransfer.getData("text/plain")
        const draggedTask = tasks.find(t => t.id === taskId)
        
        // Check if we dropped on a specific task
        if (dragOverTaskId && draggedTask) {
          const targetIndex = tasks.findIndex(t => t.id === dragOverTaskId)
          if (targetIndex !== -1) {
            onReorder(taskId, targetIndex)
            return
          }
        }
        
        // Otherwise, just change the status
        onDrop(column.id as Task["status"])
        console.log("[v0] Dropped on column:", column.label)
      }}
      className={`
        flex flex-col rounded-lg border border-border/40 transition-all min-h-[400px]
        ${isDragOver ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]" : ""}
      `}
    >
      <div className={`p-3 rounded-t-lg ${column.color} border-b border-border/40`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">{column.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={(t) => onDragStart(t, column.id)} 
            onClick={onTaskClick}
            onDragOver={() => handleTaskDragOver(task.id)}
            isDraggedOver={dragOverTaskId === task.id}
            isBeingDragged={draggedTaskId === task.id}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            {isDragOver ? "Drop here" : "No tasks"}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border/40">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={() => onAddTask?.(column.id as Task["status"])}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add task
        </Button>
      </div>
    </div>
  )
}

export function KanbanBoard({ project, onAddTask, onTaskClick }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(project.tasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null)

  // Update tasks whenever project.tasks changes
  useEffect(() => {
    console.log("[KanbanBoard] Project tasks updated:", project.tasks.length, "tasks")
    setTasks(project.tasks)
  }, [project.tasks])

  // Listen for project data updates
  useEffect(() => {
    const handleProjectUpdate = (event: CustomEvent) => {
      console.log("[KanbanBoard] Project data updated event received for project:", event.detail.projectId)
      if (event.detail.projectId === project.id) {
        // The parent will re-render with new project data
        console.log("[KanbanBoard] Refreshing tasks for project:", project.id)
      }
    }

    window.addEventListener('projectDataUpdated', handleProjectUpdate as EventListener)
    return () => window.removeEventListener('projectDataUpdated', handleProjectUpdate as EventListener)
  }, [project.id])

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task)
    setSourceColumnId(columnId)
    console.log("[v0] Started dragging:", task.title, "from column:", columnId)
  }

  const handleDrop = (newStatus: Task["status"]) => {
    if (!draggedTask) {
      console.log("[v0] No dragged task found!")
      return
    }

    console.log("[v0] Moving task", draggedTask.title, "to", newStatus)
    console.log("[v0] Project ID:", project.id, "Task ID:", draggedTask.id)

    // Update global data store
    updateTaskStatus(project.id, draggedTask.id, newStatus)

    // Update local state
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === draggedTask.id ? { ...task, status: newStatus } : task)),
    )

    setDraggedTask(null)
    setSourceColumnId(null)
  }

  const handleReorder = (taskId: string, targetIndex: number) => {
    if (!draggedTask) {
      console.log("[v0] No dragged task found for reorder!")
      return
    }

    console.log("[v0] Reordering task", taskId, "to index", targetIndex)

    // Get all tasks in the same status as the dragged task
    const tasksInColumn = tasks.filter(t => t.status === draggedTask.status)
    const currentIndex = tasksInColumn.findIndex(t => t.id === draggedTask.id)
    
    if (currentIndex === targetIndex) {
      console.log("[v0] Task is already at target position")
      setDraggedTask(null)
      setSourceColumnId(null)
      return
    }

    // Calculate the global index in the tasks array
    let globalTargetIndex = 0
    let countInStatus = 0
    
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].status === draggedTask.status) {
        if (countInStatus === targetIndex) {
          globalTargetIndex = i
          break
        }
        countInStatus++
      }
    }

    // Call reorder function
    reorderTasks(project.id, draggedTask.id, globalTargetIndex)

    // Update local state optimistically
    const newTasks = [...tasks]
    const draggedIndex = newTasks.findIndex(t => t.id === draggedTask.id)
    const [removed] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(globalTargetIndex, 0, removed)
    setTasks(newTasks)

    setDraggedTask(null)
    setSourceColumnId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Kanban Board</h2>
        <Button size="sm" onClick={() => onAddTask?.()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id as Task["status"])

          return (
            <Column
              key={column.id}
              column={column}
              tasks={columnTasks}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick || (() => {})}
              onReorder={handleReorder}
              projectId={project.id}
              draggedTaskId={draggedTask?.id || null}
            />
          )
        })}
      </div>
    </div>
  )
}
