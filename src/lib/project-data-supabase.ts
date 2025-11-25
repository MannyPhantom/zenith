/**
 * Supabase-powered Project Data Layer
 * This replaces the mock data with real database operations
 */

import * as api from './supabase-api'
import type { Project, Task, Milestone, TeamMember } from './project-data'

// Configuration flag - set to true to use Supabase, false for mock data
const USE_SUPABASE = import.meta.env.VITE_SUPABASE_URL ? true : false

// Cache for projects data
let projectsCache: Project[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5000 // 5 seconds

// ==================== PUBLIC API ====================

export async function getAllProjects(): Promise<Project[]> {
  if (!USE_SUPABASE) {
    // Fallback to mock data if Supabase not configured
    const { mockProjects } = await import('./project-data')
    return mockProjects
  }

  // Check cache
  const now = Date.now()
  if (projectsCache && now - cacheTimestamp < CACHE_DURATION) {
    return projectsCache
  }

  const projects = await api.getAllProjects()
  
  // Calculate progress for all projects dynamically
  const projectsWithProgress = await Promise.all(
    projects.map(project => getProjectWithProgress(project))
  )
  
  projectsCache = projectsWithProgress
  cacheTimestamp = now
  
  return projectsWithProgress
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  if (!USE_SUPABASE) {
    const { mockProjects } = await import('./project-data')
    return mockProjects.find((p) => p.id === id)
  }

  const project = await api.getProjectById(id)
  if (!project) return undefined
  
  // Calculate progress dynamically
  return await getProjectWithProgress(project)
}

export async function createProject(projectData: {
  name: string
  status: 'active' | 'completed' | 'on-hold'
  deadline: string
}): Promise<string | null> {
  if (!USE_SUPABASE) {
    // For mock data, handle in the calling component
    return null
  }

  const projectId = await api.createProject({
    name: projectData.name,
    status: projectData.status,
    progress: 0,
    deadline: projectData.deadline,
    totalTasks: 0,
    completedTasks: 0,
    starred: false,
  })

  // Clear cache to force refresh
  projectsCache = null

  return projectId
}

export async function deleteProject(projectId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    // For mock data, handle in the calling component
    return false
  }

  const success = await api.deleteProject(projectId)

  // Clear cache to force refresh
  projectsCache = null

  // Emit event to refresh project lists
  window.dispatchEvent(new CustomEvent('projectDataUpdated', { 
    detail: { projectId } 
  }))

  return success
}

export async function updateTaskStatus(projectId: string, taskId: string, newStatus: Task['status']): Promise<void> {
  if (!USE_SUPABASE) {
    const { updateTaskStatus: mockUpdate } = await import('./project-data')
    return mockUpdate(projectId, taskId, newStatus)
  }

  await api.updateTask(taskId, { status: newStatus })
  
  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  if (!USE_SUPABASE) {
    const { deleteTask: mockDelete } = await import('./project-data')
    return mockDelete(projectId, taskId)
  }

  // Get task info before deleting
  const project = await api.getProjectById(projectId)
  const task = project?.tasks.find((t) => t.id === taskId)
  
  await api.deleteTask(taskId)
  
  // Log activity
  if (task) {
    await api.addActivity(projectId, {
      type: 'task_deleted',
      description: `Deleted task "${task.title}"`,
      user: 'You',
      timestamp: 'Just now',
    })
  }
  
  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }
}

export async function getProjectTeamMembers(projectId: string): Promise<TeamMember[]> {
  if (!USE_SUPABASE) {
    const { getProjectTeamMembers: mockGet } = await import('./project-data')
    return mockGet(projectId)
  }

  return api.getProjectTeam(projectId)
}

export async function updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  if (!USE_SUPABASE) {
    const { updateTask: mockUpdate } = await import('./project-data')
    return mockUpdate(projectId, taskId, updates)
  }

  // If progress is being updated, automatically update status to match (unless status is explicitly provided)
  let autoUpdatedStatus = false
  if (updates.progress !== undefined && updates.status === undefined) {
    // Get current task to check if status should be auto-updated
    const project = await api.getProjectById(projectId)
    const task = project?.tasks.find((t) => t.id === taskId)
    
    // Only auto-update status if it's not 'blocked' or 'backlog' (user-controlled states)
    if (task && task.status !== 'blocked' && task.status !== 'backlog') {
      const newStatus = getStatusFromProgress(updates.progress)
      if (newStatus !== task.status) {
        updates.status = newStatus
        autoUpdatedStatus = true
        console.log(`[updateTask] Auto-updating task status from "${task.status}" to "${newStatus}" based on ${updates.progress}% progress`)
      }
    }
  }

  await api.updateTask(taskId, updates)
  
  // Log activity for status changes
  if (updates.status === 'done') {
    const project = await api.getProjectById(projectId)
    const task = project?.tasks.find((t) => t.id === taskId)
    if (task) {
      await api.addActivity(projectId, {
        type: 'task_completed',
        description: `Completed task "${task.title}"`,
        user: 'You',
        timestamp: 'Just now',
      })
    }
  }
  
  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    console.log('[updateTask] Dispatching projectDataUpdated event for project:', projectId)
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId, autoUpdatedStatus } }))
  }
}

export async function addTask(projectId: string, taskData: Omit<Task, 'id'>): Promise<Task | null> {
  if (!USE_SUPABASE) {
    const { addTask: mockAdd } = await import('./project-data')
    return mockAdd(projectId, taskData)
  }

  const taskId = await api.createTask(projectId, taskData)
  if (!taskId) return null

  // Log activity
  await api.addActivity(projectId, {
    type: 'task_created',
    description: `Created task "${taskData.title}"`,
    user: 'You',
    timestamp: 'Just now',
  })

  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }

  // Return the created task
  const project = await api.getProjectById(projectId)
  return project?.tasks.find((t) => t.id === taskId) || null
}

export async function getProjectWithProgress(project: Project): Promise<Project> {
  // Calculate progress based on sum of all task progress percentages
  const totalTasks = project.tasks.length
  const completedTasks = project.tasks.filter((t) => t.status === 'done').length
  
  // Sum of all task progress divided by number of tasks
  const totalProgress = project.tasks.reduce((sum, task) => sum + (task.progress || 0), 0)
  const progress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0

  return {
    ...project,
    progress,
    totalTasks,
    completedTasks,
  }
}

export async function reorderTasks(projectId: string, taskId: string, newIndex: number): Promise<void> {
  if (!USE_SUPABASE) {
    const { reorderTasks: mockReorder } = await import('./project-data')
    return mockReorder(projectId, taskId, newIndex)
  }

  await api.reorderTask(taskId, newIndex)
  
  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }
}

export async function getOverdueTasks(): Promise<number> {
  if (!USE_SUPABASE) {
    const { getOverdueTasks: mockGet } = await import('./project-data')
    return mockGet()
  }

  return api.getOverdueTasks()
}

export async function getUpcomingDeadlines(): Promise<number> {
  if (!USE_SUPABASE) {
    const { getUpcomingDeadlines: mockGet } = await import('./project-data')
    return mockGet()
  }

  return api.getUpcomingDeadlines()
}

// ==================== UTILITY FUNCTIONS ====================

export function invalidateCache(): void {
  projectsCache = null
  cacheTimestamp = 0
}

export function isUsingSupabase(): boolean {
  return USE_SUPABASE
}

/**
 * Helper function to automatically determine task status based on progress percentage
 * @param progress - Task progress percentage (0-100)
 * @returns Appropriate task status
 */
export function getStatusFromProgress(progress: number): Task['status'] {
  if (progress === 0) return 'todo'
  if (progress === 100) return 'done'
  if (progress >= 75) return 'review'
  if (progress >= 1) return 'in-progress'
  return 'todo'
}

// ==================== MILESTONE FUNCTIONS ====================

export async function addMilestone(projectId: string, milestoneData: Omit<Milestone, 'id'>): Promise<Milestone | null> {
  if (!USE_SUPABASE) {
    const { addMilestone: mockAdd } = await import('./project-data-milestones')
    return mockAdd(projectId, milestoneData)
  }

  const milestoneId = await api.createMilestone(projectId, milestoneData)
  if (!milestoneId) return null

  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }

  // Return the created milestone
  return {
    id: milestoneId,
    name: milestoneData.name,
    date: milestoneData.date,
    status: milestoneData.status,
    description: milestoneData.description,
    taskIds: milestoneData.taskIds || [],
  }
}

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  if (!USE_SUPABASE) {
    const { getProjectMilestones: mockGet } = await import('./project-data-milestones')
    return mockGet(projectId)
  }

  return api.getProjectMilestones(projectId)
}

export async function updateMilestone(projectId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void> {
  if (!USE_SUPABASE) {
    const { updateMilestone: mockUpdate } = await import('./project-data-milestones')
    mockUpdate(projectId, milestoneId, updates)
    return
  }

  await api.updateMilestone(milestoneId, updates)
  
  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }
}

export async function deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
  if (!USE_SUPABASE) {
    const { deleteMilestone: mockDelete } = await import('./project-data-milestones')
    mockDelete(projectId, milestoneId)
    return
  }

  await api.deleteMilestone(milestoneId)
  
  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }
}

// ==================== ACTIVITY FUNCTIONS ====================

export async function addTeamMember(projectId: string, member: Omit<TeamMember, 'id'>): Promise<string | null> {
  if (!USE_SUPABASE) {
    return null
  }

  const memberId = await api.addTeamMember(projectId, member)

  // Clear cache to force refresh
  projectsCache = null

  // Emit event to refresh project data
  window.dispatchEvent(new CustomEvent('projectDataUpdated', { 
    detail: { projectId } 
  }))

  return memberId
}

export async function updateTeamMember(memberId: string, updates: Partial<Omit<TeamMember, 'id'>>): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.updateTeamMember(memberId, updates)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function deleteTeamMember(memberId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.deleteTeamMember(memberId)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function addActivity(projectId: string, activity: { type: string; description: string; user: string }): Promise<void> {
  if (!USE_SUPABASE) {
    // For mock data, activity is not implemented yet
    return
  }

  // Get relative timestamp
  const timestamp = 'Just now'
  
  await api.addActivity(projectId, {
    type: activity.type,
    description: activity.description,
    user: activity.user,
    timestamp: timestamp,
  })

  // Clear cache and dispatch event
  projectsCache = null
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
  }
}

// Re-export types
export type { Project, Task, Milestone, TeamMember } from './project-data'

// ==================== SPRINT FUNCTIONS ====================

export async function getProjectSprints(projectId: string): Promise<import('./project-data').Sprint[]> {
  if (!USE_SUPABASE) {
    return []
  }

  return await api.getProjectSprints(projectId)
}

export async function createSprint(projectId: string, sprint: Omit<import('./project-data').Sprint, 'id' | 'taskIds'>): Promise<string | null> {
  if (!USE_SUPABASE) {
    console.warn('[createSprint] Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
    throw new Error('Supabase is not configured')
  }

  const sprintId = await api.createSprint(projectId, sprint)

  // Clear cache to force refresh
  projectsCache = null

  // Emit event to refresh project data
  window.dispatchEvent(new CustomEvent('projectDataUpdated', { 
    detail: { projectId } 
  }))

  return sprintId
}

export async function updateSprint(sprintId: string, updates: Partial<Omit<import('./project-data').Sprint, 'id' | 'taskIds'>>): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.updateSprint(sprintId, updates)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function deleteSprint(sprintId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.deleteSprint(sprintId)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function addTaskToSprint(sprintId: string, taskId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.addTaskToSprint(sprintId, taskId)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function removeTaskFromSprint(sprintId: string, taskId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.removeTaskFromSprint(sprintId, taskId)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function startSprint(sprintId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.startSprint(sprintId)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function completeSprint(sprintId: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.completeSprint(sprintId)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

// ==================== FILE OPERATIONS ====================

export async function getProjectFiles(projectId: string) {
  if (!USE_SUPABASE) {
    return []
  }

  return await api.getProjectFiles(projectId)
}

export async function addProjectFile(projectId: string, file: any) {
  if (!USE_SUPABASE) {
    return null
  }

  const fileId = await api.addProjectFile(projectId, file)

  // Clear cache to force refresh
  projectsCache = null

  // Emit event to refresh project data
  window.dispatchEvent(new CustomEvent('projectDataUpdated', { 
    detail: { projectId } 
  }))

  return fileId
}

export async function deleteProjectFile(fileId: string, fileUrl?: string) {
  if (!USE_SUPABASE) {
    return false
  }

  const success = await api.deleteProjectFile(fileId, fileUrl)

  // Clear cache to force refresh
  projectsCache = null

  return success
}

export async function uploadFileToStorage(projectId: string, file: File, onProgress?: (progress: number) => void) {
  if (!USE_SUPABASE) {
    return null
  }

  return await api.uploadFileToStorage(projectId, file, onProgress)
}

export async function downloadFileFromStorage(filePath: string) {
  if (!USE_SUPABASE) {
    return null
  }

  return await api.downloadFileFromStorage(filePath)
}

