/**
 * Customer Success Data Migration Script
 * Run this once to populate initial data in your Supabase database
 */

import { supabase } from './supabase'
import * as api from './customer-success-api'

export async function migrateCustomerSuccessData() {
  console.log('🚀 Starting Customer Success data migration...')

  try {
    // First, check if CSM users exist
    const csmUsers = await api.getAllCSMUsers()
    
    if (csmUsers.length === 0) {
      console.log('📝 Creating CSM users...')
      
      // Create CSM users
      const { data: csm1 } = await supabase
        .from('csm_users')
        .insert({
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        })
        .select()
        .single()

      const { data: csm2 } = await supabase
        .from('csm_users')
        .insert({
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
        })
        .select()
        .single()

      const { data: csm3 } = await supabase
        .from('csm_users')
        .insert({
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
        })
        .select()
        .single()

      console.log('✅ CSM users created')

      if (!csm1 || !csm2 || !csm3) {
        console.error('❌ Failed to create CSM users')
        return
      }

      // Create sample clients
      console.log('📝 Creating sample clients...')

      const { data: client1 } = await supabase
        .from('cs_clients')
        .insert({
          name: 'Acme Corp',
          industry: 'Technology',
          health_score: 85,
          last_contact_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          churn_risk: 15,
          churn_trend: 'down',
          nps_score: 9,
          arr: 120000,
          renewal_date: '2025-06-15',
          csm_id: csm1.id,
          engagement_score: 92,
          portal_logins: 45,
          feature_usage: 'High',
          support_tickets: 2
        })
        .select()
        .single()

      const { data: client2 } = await supabase
        .from('cs_clients')
        .insert({
          name: 'Beta Solutions',
          industry: 'Manufacturing',
          health_score: 45,
          last_contact_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          churn_risk: 78,
          churn_trend: 'up',
          nps_score: 4,
          arr: 85000,
          renewal_date: '2025-04-20',
          csm_id: csm2.id,
          engagement_score: 38,
          portal_logins: 12,
          feature_usage: 'Low',
          support_tickets: 8
        })
        .select()
        .single()

      const { data: client3 } = await supabase
        .from('cs_clients')
        .insert({
          name: 'Gamma Industries',
          industry: 'Healthcare',
          health_score: 72,
          last_contact_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          churn_risk: 35,
          churn_trend: 'stable',
          nps_score: 7,
          arr: 95000,
          renewal_date: '2025-08-10',
          csm_id: csm1.id,
          engagement_score: 68,
          portal_logins: 28,
          feature_usage: 'Medium',
          support_tickets: 4
        })
        .select()
        .single()

      const { data: client4 } = await supabase
        .from('cs_clients')
        .insert({
          name: 'Delta Systems',
          industry: 'Finance',
          health_score: 91,
          last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          churn_risk: 8,
          churn_trend: 'down',
          nps_score: 10,
          arr: 250000,
          renewal_date: '2025-12-01',
          csm_id: csm3.id,
          engagement_score: 95,
          portal_logins: 67,
          feature_usage: 'High',
          support_tickets: 1
        })
        .select()
        .single()

      const { data: client5 } = await supabase
        .from('cs_clients')
        .insert({
          name: 'Epsilon Tech',
          industry: 'Retail',
          health_score: 58,
          last_contact_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          churn_risk: 52,
          churn_trend: 'up',
          nps_score: 6,
          arr: 72000,
          renewal_date: '2025-05-15',
          csm_id: csm2.id,
          engagement_score: 55,
          portal_logins: 18,
          feature_usage: 'Medium',
          support_tickets: 5
        })
        .select()
        .single()

      console.log('✅ Sample clients created')

      if (!client1 || !client2 || !client3 || !client4 || !client5) {
        console.error('❌ Failed to create clients')
        return
      }

      // Create sample tasks
      console.log('📝 Creating sample tasks...')

      await supabase.from('cs_tasks').insert([
        {
          client_id: client1.id,
          title: 'Complete onboarding documentation',
          status: 'completed',
          due_date: '2025-01-20',
          priority: 'high',
          assigned_to: csm1.id
        },
        {
          client_id: client1.id,
          title: 'Schedule quarterly business review',
          status: 'active',
          due_date: '2025-01-30',
          priority: 'medium',
          assigned_to: csm1.id
        },
        {
          client_id: client2.id,
          title: 'Address technical concerns',
          status: 'overdue',
          due_date: '2025-01-18',
          priority: 'high',
          assigned_to: csm2.id
        },
        {
          client_id: client2.id,
          title: 'Review usage analytics',
          status: 'active',
          due_date: '2025-01-28',
          priority: 'medium',
          assigned_to: csm2.id
        },
        {
          client_id: client3.id,
          title: 'Product training session',
          status: 'completed',
          due_date: '2025-01-15',
          priority: 'medium',
          assigned_to: csm1.id
        },
        {
          client_id: client4.id,
          title: 'Upsell premium features',
          status: 'active',
          due_date: '2025-02-05',
          priority: 'low',
          assigned_to: csm3.id
        }
      ])

      console.log('✅ Sample tasks created')

      // Create sample milestones
      console.log('📝 Creating sample milestones...')

      await supabase.from('cs_milestones').insert([
        {
          client_id: client1.id,
          title: 'Initial Setup Complete',
          description: 'Complete platform setup and configuration',
          status: 'completed',
          target_date: '2024-10-15',
          completed_date: '2024-10-12'
        },
        {
          client_id: client1.id,
          title: 'Team Training Finished',
          description: 'Train all team members on platform usage',
          status: 'completed',
          target_date: '2024-11-01',
          completed_date: '2024-10-28'
        },
        {
          client_id: client1.id,
          title: 'First Value Milestone',
          description: 'Achieve first measurable business value',
          status: 'in-progress',
          target_date: '2025-02-15'
        },
        {
          client_id: client2.id,
          title: 'Initial Setup Complete',
          description: 'Complete platform setup and configuration',
          status: 'completed',
          target_date: '2024-09-20',
          completed_date: '2024-09-25'
        },
        {
          client_id: client2.id,
          title: 'Team Training Finished',
          description: 'Train all team members on platform usage',
          status: 'in-progress',
          target_date: '2025-01-30'
        }
      ])

      console.log('✅ Sample milestones created')

      // Create sample interactions
      console.log('📝 Creating sample interactions...')

      await supabase.from('cs_interactions').insert([
        {
          client_id: client1.id,
          type: 'email',
          subject: 'Quarterly Review Invitation',
          description: 'Sent quarterly business review invitation to Acme Corp',
          csm_id: csm1.id,
          interaction_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          client_id: client2.id,
          type: 'call',
          subject: 'Technical Support Call',
          description: 'Discussed technical concerns and provided solutions',
          csm_id: csm2.id,
          interaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          client_id: client4.id,
          type: 'meeting',
          subject: 'Strategy Planning Meeting',
          description: 'Discussed Q1 goals and feature roadmap',
          csm_id: csm3.id,
          interaction_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ])

      console.log('✅ Sample interactions created')
    } else {
      console.log('✅ CSM users already exist, skipping migration')
    }

    console.log('🎉 Customer Success data migration completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Error during migration:', error)
    return false
  }
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  (window as any).migrateCustomerSuccessData = migrateCustomerSuccessData
}



