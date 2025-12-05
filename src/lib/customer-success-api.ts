/**
 * Customer Success Supabase API Layer
 * All database operations for customer success management
 */

import { supabase } from './supabase'
import { withTimeout } from './timeout-wrapper'

// ==================== TYPE DEFINITIONS ====================

export interface CSMUser {
  id: string
  name: string
  email: string
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  industry: string
  health_score: number
  status: 'healthy' | 'moderate' | 'at-risk'
  last_contact_date: string
  churn_risk: number
  churn_trend: 'up' | 'down' | 'stable'
  nps_score: number
  arr: number
  renewal_date: string
  csm_id: string | null
  engagement_score: number
  portal_logins: number
  feature_usage: string
  support_tickets: number
  created_at: string
  updated_at: string
  csm?: CSMUser
}

export interface ClientTask {
  id: string
  client_id: string
  title: string
  status: 'active' | 'completed' | 'overdue'
  due_date: string
  priority: 'low' | 'medium' | 'high'
  assigned_to: string | null
  created_at: string
  updated_at: string
  client?: Client
  csm?: CSMUser
}

export interface ClientMilestone {
  id: string
  client_id: string
  title: string
  description?: string
  status: 'completed' | 'in-progress' | 'upcoming'
  target_date: string
  completed_date?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface ClientInteraction {
  id: string
  client_id: string
  type: 'email' | 'call' | 'meeting'
  subject: string
  description: string
  csm_id: string | null
  interaction_date: string
  created_at: string
  client?: Client
  csm?: CSMUser
}

export interface HealthHistory {
  id: string
  client_id: string
  health_score: number
  recorded_at: string
}

// ==================== CSM USERS ====================

export async function getAllCSMUsers(): Promise<CSMUser[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('csm_users').select('*').order('name'),
      { timeoutMs: 3000, errorMessage: 'getAllCSMUsers timeout', fallbackValue: { data: [], error: null } }
    )

    if (error) {
      console.error('Error fetching CSM users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Timeout fetching CSM users:', error)
    return []
  }
}

export async function getCSMUserById(id: string): Promise<CSMUser | null> {
  const { data, error } = await supabase
    .from('csm_users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching CSM user:', error)
    return null
  }

  return data
}

export async function createCSMUser(user: Omit<CSMUser, 'id' | 'created_at' | 'updated_at'>): Promise<CSMUser | null> {
  const { data, error } = await supabase
    .from('csm_users')
    .insert(user)
    .select('*')
    .single()

  if (error) {
    console.error('Error creating CSM user:', error)
    return null
  }

  return data
}

export async function updateCSMUser(id: string, updates: Partial<CSMUser>): Promise<CSMUser | null> {
  const { data, error } = await supabase
    .from('csm_users')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating CSM user:', error)
    return null
  }

  return data
}

export async function deleteCSMUser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('csm_users')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting CSM user:', error)
    return false
  }

  return true
}

// ==================== CLIENTS ====================

export async function getAllClients(): Promise<Client[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('cs_clients')
        .select(`
          *,
          csm:csm_users(*)
        `)
        .order('name'),
      { timeoutMs: 3000, errorMessage: 'getAllClients timeout' }
    )

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Timeout fetching clients:', error)
    return []
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('cs_clients')
    .select(`
      *,
      csm:csm_users(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  return data
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'csm'>): Promise<Client | null> {
  const { data, error } = await supabase
    .from('cs_clients')
    .insert(client)
    .select(`
      *,
      csm:csm_users(*)
    `)
    .single()

  if (error) {
    console.error('Error creating client:', error)
    return null
  }

  return data
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  const { data, error } = await supabase
    .from('cs_clients')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      csm:csm_users(*)
    `)
    .single()

  if (error) {
    console.error('Error updating client:', error)
    return null
  }

  return data
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('cs_clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    return false
  }

  return true
}

// ==================== CLIENT TASKS ====================

export async function getAllTasks(): Promise<ClientTask[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('cs_tasks')
        .select(`
          *,
          client:cs_clients(*),
          csm:csm_users(*)
        `)
        .order('due_date'),
      { timeoutMs: 3000, errorMessage: 'getAllTasks timeout' }
    )

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Timeout fetching tasks:', error)
    return []
  }
}

export async function getTasksByClientId(clientId: string): Promise<ClientTask[]> {
  const { data, error } = await supabase
    .from('cs_tasks')
    .select(`
      *,
      client:cs_clients(*),
      csm:csm_users(*)
    `)
    .eq('client_id', clientId)
    .order('due_date')

  if (error) {
    console.error('Error fetching client tasks:', error)
    return []
  }

  return data || []
}

export async function createTask(task: Omit<ClientTask, 'id' | 'created_at' | 'updated_at' | 'client' | 'csm'>): Promise<ClientTask | null> {
  const { data, error } = await supabase
    .from('cs_tasks')
    .insert(task)
    .select(`
      *,
      client:cs_clients(*),
      csm:csm_users(*)
    `)
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return null
  }

  return data
}

export async function updateTask(id: string, updates: Partial<ClientTask>): Promise<ClientTask | null> {
  const { data, error } = await supabase
    .from('cs_tasks')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      client:cs_clients(*),
      csm:csm_users(*)
    `)
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return null
  }

  return data
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('cs_tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }

  return true
}

// ==================== CLIENT MILESTONES ====================

export async function getAllMilestones(): Promise<ClientMilestone[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('cs_milestones')
        .select(`
          *,
          client:cs_clients(*)
        `)
        .order('target_date'),
      { timeoutMs: 3000, errorMessage: 'getAllMilestones timeout' }
    )

    if (error) {
      console.error('Error fetching milestones:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Timeout fetching milestones:', error)
    return []
  }
}

export async function getMilestonesByClientId(clientId: string): Promise<ClientMilestone[]> {
  const { data, error } = await supabase
    .from('cs_milestones')
    .select(`
      *,
      client:cs_clients(*)
    `)
    .eq('client_id', clientId)
    .order('target_date')

  if (error) {
    console.error('Error fetching client milestones:', error)
    return []
  }

  return data || []
}

export async function createMilestone(milestone: Omit<ClientMilestone, 'id' | 'created_at' | 'updated_at' | 'client'>): Promise<ClientMilestone | null> {
  const { data, error } = await supabase
    .from('cs_milestones')
    .insert(milestone)
    .select(`
      *,
      client:cs_clients(*)
    `)
    .single()

  if (error) {
    console.error('Error creating milestone:', error)
    return null
  }

  return data
}

export async function updateMilestone(id: string, updates: Partial<ClientMilestone>): Promise<ClientMilestone | null> {
  const { data, error } = await supabase
    .from('cs_milestones')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      client:cs_clients(*)
    `)
    .single()

  if (error) {
    console.error('Error updating milestone:', error)
    return null
  }

  return data
}

export async function deleteMilestone(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('cs_milestones')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting milestone:', error)
    return false
  }

  return true
}

// ==================== CLIENT INTERACTIONS ====================

export async function getAllInteractions(): Promise<ClientInteraction[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('cs_interactions')
        .select(`
          *,
          client:cs_clients(*),
          csm:csm_users(*)
        `)
        .order('interaction_date', { ascending: false }),
      { timeoutMs: 3000, errorMessage: 'getAllInteractions timeout' }
    )

    if (error) {
      console.error('Error fetching interactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Timeout fetching interactions:', error)
    return []
  }
}

export async function getInteractionsByClientId(clientId: string): Promise<ClientInteraction[]> {
  const { data, error } = await supabase
    .from('cs_interactions')
    .select(`
      *,
      client:cs_clients(*),
      csm:csm_users(*)
    `)
    .eq('client_id', clientId)
    .order('interaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching client interactions:', error)
    return []
  }

  return data || []
}

export async function createInteraction(interaction: Omit<ClientInteraction, 'id' | 'created_at' | 'client' | 'csm'>): Promise<ClientInteraction | null> {
  const { data, error } = await supabase
    .from('cs_interactions')
    .insert(interaction)
    .select(`
      *,
      client:cs_clients(*),
      csm:csm_users(*)
    `)
    .single()

  if (error) {
    console.error('Error creating interaction:', error)
    return null
  }

  return data
}

export async function updateInteraction(id: string, updates: Partial<ClientInteraction>): Promise<ClientInteraction | null> {
  // Remove read-only fields from updates
  const { id: _, created_at, client, csm, ...updateData } = updates as any

  const { data, error } = await supabase
    .from('cs_interactions')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      client:cs_clients(*),
      csm:csm_users(*)
    `)
    .single()

  if (error) {
    console.error('Error updating interaction:', error)
    return null
  }

  return data
}

export async function deleteInteraction(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('cs_interactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting interaction:', error)
    return false
  }

  return true
}

// ==================== HEALTH HISTORY ====================

export async function getHealthHistory(clientId: string, limit: number = 5): Promise<HealthHistory[]> {
  const { data, error } = await supabase
    .from('cs_health_history')
    .select('*')
    .eq('client_id', clientId)
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching health history:', error)
    return []
  }

  // Reverse to get oldest to newest for trend display
  return (data || []).reverse()
}

// ==================== UTILITY FUNCTIONS ====================

export async function getClientStats() {
  try {
    const [clients, tasks] = await Promise.all([
      withTimeout(getAllClients(), { timeoutMs: 3000, fallbackValue: [] }),
      withTimeout(getAllTasks(), { timeoutMs: 3000, fallbackValue: [] }),
    ])

  const totalClients = clients.length
  const atRiskCount = clients.filter((c) => c.status === 'at-risk').length
  const avgHealthScore = clients.length > 0
    ? Math.round(clients.reduce((sum, c) => sum + c.health_score, 0) / clients.length)
    : 0
  const totalARR = clients.reduce((sum, c) => sum + c.arr, 0)
  const avgNPS = clients.length > 0
    ? Math.round(clients.reduce((sum, c) => sum + c.nps_score, 0) / clients.length)
    : 0
  const highChurnRiskCount = clients.filter((c) => c.health_score < 60).length

  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const totalTasks = tasks.length
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false
    const dueDate = new Date(t.due_date)
    return dueDate < new Date()
  }).length

    return {
      totalClients,
      atRiskCount,
      avgHealthScore,
      totalARR,
      avgNPS,
      highChurnRiskCount,
      completedTasks,
      totalTasks,
      overdueTasks,
    }
  } catch (error) {
    console.error('Timeout or error in getClientStats:', error)
    return {
      totalClients: 0,
      atRiskCount: 0,
      avgHealthScore: 0,
      totalARR: 0,
      avgNPS: 0,
      highChurnRiskCount: 0,
      completedTasks: 0,
      totalTasks: 0,
      overdueTasks: 0,
    }
  }
}

export async function updateLastContactDate(clientId: string): Promise<void> {
  await updateClient(clientId, {
    last_contact_date: new Date().toISOString(),
  })
}



