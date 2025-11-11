import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import { supabase } from '@/lib/supabase'
import * as api from '@/lib/customer-success-api'

export default function MigrateCustomerSuccessPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }

  const runMigration = async () => {
    setIsRunning(true)
    setStatus('running')
    setLogs([])

    try {
      addLog('🚀 Starting Customer Success data migration...')

      // Check if clients already exist (main data check)
      const existingClients = await api.getAllClients()
      
      if (existingClients.length > 0) {
        addLog(`✅ Data already exists (${existingClients.length} clients found), skipping migration`)
        addLog('🎉 Customer Success data migration completed successfully!')
        setStatus('success')
        setIsRunning(false)
        return
      }

      // Get or create CSM users
      let csmUsers = await api.getAllCSMUsers()
      
      if (csmUsers.length === 0) {
        addLog('📝 Creating CSM users...')
        
        // Create CSM users
        const { data: csm1, error: error1 } = await supabase
          .from('csm_users')
          .insert({
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
          })
          .select()
          .single()

        if (error1) throw new Error(`Failed to create CSM user 1: ${error1.message}`)

        const { data: csm2, error: error2 } = await supabase
          .from('csm_users')
          .insert({
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
          })
          .select()
          .single()

        if (error2) throw new Error(`Failed to create CSM user 2: ${error2.message}`)

        const { data: csm3, error: error3 } = await supabase
          .from('csm_users')
          .insert({
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@company.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
          })
          .select()
          .single()

        if (error3) throw new Error(`Failed to create CSM user 3: ${error3.message}`)

        addLog('✅ CSM users created')

        if (!csm1 || !csm2 || !csm3) {
          throw new Error('Failed to create CSM users')
        }

        // Create sample clients
        addLog('📝 Creating sample clients...')

        const { data: client1, error: clientError1 } = await supabase
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

        if (clientError1) throw new Error(`Failed to create client 1: ${clientError1.message}`)

        const { data: client2, error: clientError2 } = await supabase
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

        if (clientError2) throw new Error(`Failed to create client 2: ${clientError2.message}`)

        const { data: client3, error: clientError3 } = await supabase
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

        if (clientError3) throw new Error(`Failed to create client 3: ${clientError3.message}`)

        const { data: client4, error: clientError4 } = await supabase
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

        if (clientError4) throw new Error(`Failed to create client 4: ${clientError4.message}`)

        const { data: client5, error: clientError5 } = await supabase
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

        if (clientError5) throw new Error(`Failed to create client 5: ${clientError5.message}`)

        addLog('✅ Sample clients created (5 clients)')

        if (!client1 || !client2 || !client3 || !client4 || !client5) {
          throw new Error('Failed to create clients')
        }

        // Create sample tasks
        addLog('📝 Creating sample tasks...')

        const { error: tasksError } = await supabase.from('cs_tasks').insert([
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

        if (tasksError) throw new Error(`Failed to create tasks: ${tasksError.message}`)

        addLog('✅ Sample tasks created (6 tasks)')

        // Create sample milestones
        addLog('📝 Creating sample milestones...')

        const { error: milestonesError } = await supabase.from('cs_milestones').insert([
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

        if (milestonesError) throw new Error(`Failed to create milestones: ${milestonesError.message}`)

        addLog('✅ Sample milestones created (5 milestones)')

        // Create sample interactions
        addLog('📝 Creating sample interactions...')

        const { error: interactionsError } = await supabase.from('cs_interactions').insert([
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

        if (interactionsError) throw new Error(`Failed to create interactions: ${interactionsError.message}`)

        addLog('✅ Sample interactions created (3 interactions)')
      } else {
        addLog(`✅ CSM users already exist (${csmUsers.length} users), using existing users`)
        
        // Use existing CSM users for creating clients
        const csm1 = csmUsers[0]
        const csm2 = csmUsers[1] || csmUsers[0]
        const csm3 = csmUsers[2] || csmUsers[0]

        // Create sample clients with existing CSM users
        addLog('📝 Creating sample clients...')

        const { data: client1, error: clientError1 } = await supabase
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

        if (clientError1) throw new Error(`Failed to create client 1: ${clientError1.message}`)

        const { data: client2, error: clientError2 } = await supabase
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

        if (clientError2) throw new Error(`Failed to create client 2: ${clientError2.message}`)

        const { data: client3, error: clientError3 } = await supabase
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

        if (clientError3) throw new Error(`Failed to create client 3: ${clientError3.message}`)

        const { data: client4, error: clientError4 } = await supabase
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

        if (clientError4) throw new Error(`Failed to create client 4: ${clientError4.message}`)

        const { data: client5, error: clientError5 } = await supabase
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

        if (clientError5) throw new Error(`Failed to create client 5: ${clientError5.message}`)

        addLog('✅ Sample clients created (5 clients)')

        if (!client1 || !client2 || !client3 || !client4 || !client5) {
          throw new Error('Failed to create clients')
        }

        // Create sample tasks
        addLog('📝 Creating sample tasks...')

        const { error: tasksError } = await supabase.from('cs_tasks').insert([
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

        if (tasksError) throw new Error(`Failed to create tasks: ${tasksError.message}`)

        addLog('✅ Sample tasks created (6 tasks)')

        // Create sample milestones
        addLog('📝 Creating sample milestones...')

        const { error: milestonesError } = await supabase.from('cs_milestones').insert([
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

        if (milestonesError) throw new Error(`Failed to create milestones: ${milestonesError.message}`)

        addLog('✅ Sample milestones created (5 milestones)')

        // Create sample interactions
        addLog('📝 Creating sample interactions...')

        const { error: interactionsError } = await supabase.from('cs_interactions').insert([
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

        if (interactionsError) throw new Error(`Failed to create interactions: ${interactionsError.message}`)

        addLog('✅ Sample interactions created (3 interactions)')
      }

      addLog('🎉 Customer Success data migration completed successfully!')
      setStatus('success')
    } catch (error) {
      console.error('Migration error:', error)
      addLog(`❌ Error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setStatus('error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Customer Success Data Migration</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Run this migration once to populate your Supabase database with sample customer success data.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Before Running:
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Ensure you've run the <code className="bg-muted px-1 py-0.5 rounded">customer-success-schema.sql</code> in Supabase SQL Editor</li>
                <li>Verify your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file has correct Supabase credentials</li>
                <li>This migration is safe to run multiple times (it checks for existing data)</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runMigration} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Migration...
                  </>
                ) : (
                  <>
                    {status === 'success' ? 'Run Again' : 'Start Migration'}
                  </>
                )}
              </Button>
              
              {status === 'success' && (
                <Button variant="outline" onClick={() => window.location.href = '/customer-success'}>
                  Go to Customer Success Dashboard
                </Button>
              )}
            </div>

            {/* Migration Log */}
            {logs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {status === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    Migration Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/90 text-white p-4 rounded-lg font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                    {logs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {status === 'success' && (
              <div className="p-4 border border-green-500/20 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-500 font-semibold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Migration Completed Successfully!
                </div>
                <p className="text-sm text-muted-foreground">
                  Your database has been populated with sample data. You can now navigate to the Customer Success dashboard to see it in action.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
                  <XCircle className="w-5 h-5" />
                  Migration Failed
                </div>
                <p className="text-sm text-muted-foreground">
                  Check the migration log above for details. Common issues:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc mt-2">
                  <li>Database schema not created (run customer-success-schema.sql first)</li>
                  <li>Invalid Supabase credentials in .env file</li>
                  <li>Network connection issues</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

