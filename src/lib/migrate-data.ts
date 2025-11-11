import { supabase } from './supabase'

/**
 * Migration script to populate Supabase with initial mock data
 * Run this once after setting up your Supabase database
 */

export async function migrateInitialData() {
  console.log('🚀 Starting data migration...')

  try {
    // Project 1: Website Redesign (full data)
    const { data: project1, error: p1Error } = await supabase
      .from('projects')
      .insert({
        name: 'Website Redesign',
        status: 'active',
        progress: 65,
        deadline: '2025-03-15',
        total_tasks: 5,
        completed_tasks: 1,
        starred: false,
      })
      .select()
      .single()

    if (p1Error) throw p1Error
    console.log('✅ Created project: Website Redesign')

    // Tasks for project 1
    const tasks1 = [
      {
        project_id: project1.id,
        title: 'Design homepage mockup',
        status: 'done',
        priority: 'high',
        assignee_name: 'Sarah Chen',
        assignee_avatar: '/placeholder.svg?height=32&width=32',
        start_date: '2025-01-15',
        deadline: '2025-02-20',
        progress: 100,
        description: null,
        milestone_id: null,
        order_index: 0,
      },
      {
        project_id: project1.id,
        title: 'Implement responsive navigation',
        status: 'in-progress',
        priority: 'high',
        assignee_name: 'Mike Johnson',
        assignee_avatar: '/placeholder.svg?height=32&width=32',
        start_date: '2025-02-10',
        deadline: '2025-02-25',
        progress: 60,
        description: null,
        milestone_id: null,
        order_index: 1,
      },
      {
        project_id: project1.id,
        title: 'Create product page templates',
        status: 'review',
        priority: 'medium',
        assignee_name: 'Emily Davis',
        assignee_avatar: '/placeholder.svg?height=32&width=32',
        start_date: '2025-02-15',
        deadline: '2025-02-28',
        progress: 90,
        description: null,
        milestone_id: null,
        order_index: 2,
      },
      {
        project_id: project1.id,
        title: 'Setup analytics tracking',
        status: 'todo',
        priority: 'low',
        assignee_name: 'Alex Kim',
        assignee_avatar: '/placeholder.svg?height=32&width=32',
        start_date: '2025-02-20',
        deadline: '2025-03-05',
        progress: 0,
        description: null,
        milestone_id: null,
        order_index: 3,
      },
      {
        project_id: project1.id,
        title: 'Optimize image loading',
        status: 'blocked',
        priority: 'medium',
        assignee_name: 'Sarah Chen',
        assignee_avatar: '/placeholder.svg?height=32&width=32',
        start_date: '2025-02-18',
        deadline: '2025-02-22',
        progress: 30,
        description: null,
        milestone_id: null,
        order_index: 4,
      },
    ]

    const { error: tasksError } = await supabase.from('tasks').insert(tasks1)
    if (tasksError) throw tasksError
    console.log('✅ Created 5 tasks for Website Redesign')

    // Team members for project 1
    const team1 = [
      {
        project_id: project1.id,
        name: 'Sarah Chen',
        role: 'Lead Designer',
        avatar: '/placeholder.svg?height=40&width=40',
        capacity: 40,
      },
      {
        project_id: project1.id,
        name: 'Mike Johnson',
        role: 'Frontend Dev',
        avatar: '/placeholder.svg?height=40&width=40',
        capacity: 35,
      },
      {
        project_id: project1.id,
        name: 'Emily Davis',
        role: 'UI Designer',
        avatar: '/placeholder.svg?height=40&width=40',
        capacity: 30,
      },
      {
        project_id: project1.id,
        name: 'Alex Kim',
        role: 'Backend Dev',
        avatar: '/placeholder.svg?height=40&width=40',
        capacity: 38,
      },
    ]

    const { error: teamError } = await supabase.from('team_members').insert(team1)
    if (teamError) throw teamError
    console.log('✅ Created 4 team members for Website Redesign')

    // Files for project 1
    const files1 = [
      {
        project_id: project1.id,
        name: 'design-system.fig',
        type: 'Figma',
        uploaded_by: 'Sarah Chen',
        uploaded_at: '2025-02-10',
        size: '2.4 MB',
      },
      {
        project_id: project1.id,
        name: 'wireframes.pdf',
        type: 'PDF',
        uploaded_by: 'Emily Davis',
        uploaded_at: '2025-02-12',
        size: '1.8 MB',
      },
    ]

    const { error: filesError } = await supabase.from('project_files').insert(files1)
    if (filesError) throw filesError
    console.log('✅ Created 2 files for Website Redesign')

    // Activities for project 1
    const activities1 = [
      {
        project_id: project1.id,
        type: 'task_completed',
        description: 'Design homepage mockup completed',
        user: 'Sarah Chen',
        timestamp: '2 hours ago',
      },
      {
        project_id: project1.id,
        type: 'comment',
        description: 'Added feedback on navigation design',
        user: 'Mike Johnson',
        timestamp: '5 hours ago',
      },
    ]

    const { error: activitiesError } = await supabase.from('activities').insert(activities1)
    if (activitiesError) throw activitiesError
    console.log('✅ Created 2 activities for Website Redesign')

    // Milestones for project 1
    const milestones1 = [
      {
        project_id: project1.id,
        name: 'Project Kickoff',
        date: '2025-01-15',
        status: 'completed',
        description: 'Initial project setup and team alignment',
      },
      {
        project_id: project1.id,
        name: 'Design Phase Complete',
        date: '2025-02-28',
        status: 'in-progress',
        description: 'All design mockups and wireframes completed',
      },
      {
        project_id: project1.id,
        name: 'Development Complete',
        date: '2025-04-30',
        status: 'upcoming',
        description: 'All features implemented and tested',
      },
    ]

    const { error: milestonesError } = await supabase.from('milestones').insert(milestones1)
    if (milestonesError) throw milestonesError
    console.log('✅ Created 3 milestones for Website Redesign')

    // Additional projects (simplified)
    const additionalProjects = [
      {
        name: 'Mobile App Development',
        status: 'active',
        progress: 42,
        deadline: '2025-04-20',
        total_tasks: 36,
        completed_tasks: 15,
        starred: false,
      },
      {
        name: 'Marketing Campaign',
        status: 'active',
        progress: 78,
        deadline: '2025-02-28',
        total_tasks: 18,
        completed_tasks: 14,
        starred: true,
      },
      {
        name: 'API Integration',
        status: 'on-hold',
        progress: 25,
        deadline: '2025-05-10',
        total_tasks: 22,
        completed_tasks: 6,
        starred: false,
      },
      {
        name: 'Database Migration',
        status: 'active',
        progress: 88,
        deadline: '2025-02-15',
        total_tasks: 12,
        completed_tasks: 11,
        starred: true,
      },
    ]

    const { error: additionalError } = await supabase.from('projects').insert(additionalProjects)
    if (additionalError) throw additionalError
    console.log('✅ Created 4 additional projects')

    console.log('🎉 Data migration completed successfully!')
    return { success: true, message: 'All data migrated successfully' }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return { success: false, error }
  }
}

// Optional: Clear all data (use with caution!)
export async function clearAllData() {
  console.log('⚠️  Clearing all data...')
  
  try {
    // Delete in order due to foreign key constraints
    await supabase.from('milestone_tasks').delete().neq('milestone_id', '')
    await supabase.from('activities').delete().neq('id', '')
    await supabase.from('project_files').delete().neq('id', '')
    await supabase.from('team_members').delete().neq('id', '')
    await supabase.from('milestones').delete().neq('id', '')
    await supabase.from('tasks').delete().neq('id', '')
    await supabase.from('projects').delete().neq('id', '')
    
    console.log('✅ All data cleared')
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to clear data:', error)
    return { success: false, error }
  }
}





