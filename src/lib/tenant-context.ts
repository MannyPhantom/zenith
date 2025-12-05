/**
 * Tenant Context Utilities
 * Provides helper functions for multi-tenant operations
 */

import { supabase } from './supabase'

/**
 * Get the current user's organization ID
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return data?.organization_id || null
  } catch (error) {
    console.error('Error getting organization ID:', error)
    return null
  }
}

/**
 * Get organization details
 */
export async function getOrganization(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting organization:', error)
    return null
  }
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) throw error

    const userRole = data?.role
    if (!userRole) return false

    if (Array.isArray(role)) {
      return role.includes(userRole)
    }

    return userRole === role
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

/**
 * Get all users in the current organization
 */
export async function getOrganizationUsers(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting organization users:', error)
    return []
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Check if current user is admin or owner
    const isAdmin = await hasRole(['owner', 'admin'])
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admins can update user roles')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

/**
 * Invite user to organization
 */
export async function inviteUserToOrganization(email: string, role: string = 'member') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const organizationId = await getCurrentOrganizationId()
    if (!organizationId) throw new Error('No organization found')

    // Check if current user can invite
    const canInvite = await hasRole(['owner', 'admin'])
    if (!canInvite) {
      throw new Error('Unauthorized: Only admins can invite users')
    }

    const { data, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error inviting user:', error)
    throw error
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string) {
  try {
    // Get user count
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Get project count
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Get task count
    const { count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      taskCount: taskCount || 0,
    }
  } catch (error) {
    console.error('Error getting organization stats:', error)
    return {
      userCount: 0,
      projectCount: 0,
      taskCount: 0,
    }
  }
}

/**
 * Update organization settings
 */
export async function updateOrganizationSettings(
  organizationId: string,
  settings: Record<string, any>
) {
  try {
    // Check if current user is admin or owner
    const isAdmin = await hasRole(['owner', 'admin'])
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admins can update organization settings')
    }

    const { data, error } = await supabase
      .from('organizations')
      .update({ 
        settings,
        updated_at: new Date().toISOString() 
      })
      .eq('id', organizationId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating organization settings:', error)
    throw error
  }
}







