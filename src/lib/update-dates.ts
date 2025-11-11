import { supabase } from './supabase'

/**
 * Clear all deadlines from tasks and projects in the database
 */
export async function clearAllDeadlines() {
  console.log('Clearing all task and project deadlines...')
  
  try {
    // Clear all task deadlines
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ deadline: null })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all tasks
    
    if (taskError) {
      console.error('Error clearing task deadlines:', taskError)
      return { success: false, error: taskError }
    }
    
    // Clear all project deadlines
    const { error: projectError } = await supabase
      .from('projects')
      .update({ deadline: null })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all projects
    
    if (projectError) {
      console.error('Error clearing project deadlines:', projectError)
      return { success: false, error: projectError }
    }
    
    console.log('Successfully cleared all deadlines')
    return { success: true }
  } catch (err) {
    console.error('Error:', err)
    return { success: false, error: err }
  }
}

/**
 * Update all tasks in database to have today's date (kept for backwards compatibility)
 */
export async function updateAllTaskDatesToToday() {
  return clearAllDeadlines()
}

