import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  FolderKanban,
  Package,
  Users,
  Briefcase,
  UserCheck,
  Factory,
  Bot,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Settings,
} from 'lucide-react'
import * as ProjectData from '@/lib/project-data-supabase'
import type { Project } from '@/lib/project-data'
import * as CSApi from '@/lib/customer-success-api'
import * as HRApi from '@/lib/hr-api'
import { getAllJobs, getAllApplications } from '@/lib/recruitment-db'
import { useAuth } from '@/contexts/AuthContext'

export default function HubPage() {
  const { loading: authLoading, user } = useAuth()
  const [timeRange, setTimeRange] = useState('7d')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [createType, setCreateType] = useState('')
  const [createTitle, setCreateTitle] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [csClients, setCSClients] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [performanceReviews, setPerformanceReviews] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [jobApplications, setJobApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load all data from Supabase - but only after auth is ready
  useEffect(() => {
    // Don't load data while auth is still loading
    if (authLoading) {
      return
    }

    const loadAllData = async () => {
      try {
        setLoading(true)
        
        // Use Promise.allSettled to prevent one failure from blocking others
        // Also add timeouts to prevent hanging
        const timeout = (ms: number) => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), ms)
        )
        
        const withTimeout = <T,>(promise: Promise<T>, ms: number = 5000): Promise<T> => 
          Promise.race([promise, timeout(ms)]) as Promise<T>
        
        // Load all data in parallel with timeouts
        const [
          projectsResult,
          clientsResult,
          employeesResult,
          reviewsResult,
          goalsResult,
          jobsResult,
          appsResult
        ] = await Promise.allSettled([
          withTimeout(ProjectData.getAllProjects()),
          withTimeout(CSApi.getAllClients()),
          withTimeout(HRApi.getAllEmployees()),
          withTimeout(HRApi.getAllPerformanceReviews()),
          withTimeout(HRApi.getAllGoals()),
          withTimeout(getAllJobs()),
          withTimeout(getAllApplications()),
        ])
        
        // Set data for successful fetches, use empty arrays for failures
        if (projectsResult.status === 'fulfilled') setProjects(projectsResult.value)
        if (clientsResult.status === 'fulfilled') setCSClients(clientsResult.value)
        if (employeesResult.status === 'fulfilled') setEmployees(employeesResult.value)
        if (reviewsResult.status === 'fulfilled') setPerformanceReviews(reviewsResult.value)
        if (goalsResult.status === 'fulfilled') setGoals(goalsResult.value)
        if (jobsResult.status === 'fulfilled') setJobPostings(jobsResult.value)
        if (appsResult.status === 'fulfilled') setJobApplications(appsResult.value)
        
        // Log any failures for debugging
        const failures = [projectsResult, clientsResult, employeesResult, reviewsResult, goalsResult, jobsResult, appsResult]
          .filter(r => r.status === 'rejected')
        if (failures.length > 0) {
          console.warn('Some data failed to load:', failures)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()

    // Listen for updates
    const handleProjectUpdate = () => loadAllData()
    const handleAppUpdate = () => loadAllData()
    
    window.addEventListener('projectDataUpdated', handleProjectUpdate)
    window.addEventListener('applicationSubmitted', handleAppUpdate)
    window.addEventListener('applicationUpdated', handleAppUpdate)
    
    return () => {
      window.removeEventListener('projectDataUpdated', handleProjectUpdate)
      window.removeEventListener('applicationSubmitted', handleAppUpdate)
      window.removeEventListener('applicationUpdated', handleAppUpdate)
    }
  }, [authLoading, user])

  // Calculate real project metrics
  const projectMetrics = useMemo(() => {
    if (projects.length === 0) {
      return {
        completionRate: 0,
        overdueTasks: 0,
        totalTasks: 0,
        completedTasks: 0,
      }
    }

    const totalTasks = projects.reduce((sum, p) => sum + p.totalTasks, 0)
    const completedTasks = projects.reduce((sum, p) => sum + p.completedTasks, 0)
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate overdue tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueTasks = projects.reduce((count, project) => {
      return count + project.tasks.filter(task => {
        if (!task.deadline || task.status === 'done') return false
        const taskDeadline = new Date(task.deadline)
        taskDeadline.setHours(0, 0, 0, 0)
        return taskDeadline < today
      }).length
    }, 0)

    return {
      completionRate,
      overdueTasks,
      totalTasks,
      completedTasks,
    }
  }, [projects])

  // Calculate Customer Success metrics
  const csMetrics = useMemo(() => {
    if (csClients.length === 0) {
      return {
        avgHealthScore: 0,
        atRiskClients: 0,
        upcomingRenewals: 0,
        avgNPS: 0,
      }
    }

    const totalHealth = csClients.reduce((sum, c) => sum + (c.health_score || 0), 0)
    const avgHealthScore = Math.round(totalHealth / csClients.length)
    
    const atRiskClients = csClients.filter(c => c.status === 'at-risk').length
    
    // Count renewals in next 60 days
    const today = new Date()
    const sixtyDaysLater = new Date(today)
    sixtyDaysLater.setDate(today.getDate() + 60)
    const upcomingRenewals = csClients.filter(c => {
      if (!c.renewal_date) return false
      const renewalDate = new Date(c.renewal_date)
      return renewalDate >= today && renewalDate <= sixtyDaysLater
    }).length
    
    const totalNPS = csClients.reduce((sum, c) => sum + (c.nps_score || 0), 0)
    const avgNPS = Math.round(totalNPS / csClients.length)

    return {
      avgHealthScore,
      atRiskClients,
      upcomingRenewals,
      avgNPS,
    }
  }, [csClients])

  // Calculate HR metrics
  const hrMetrics = useMemo(() => {
    // Case-insensitive status check
    const activeEmployees = employees.filter(e => e.status?.toLowerCase() === 'active').length
    
    // Reviews due in next 30 days
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(today.getDate() + 30)
    const reviewsDue = employees.filter(e => {
      if (!e.next_review_date) return false
      const reviewDate = new Date(e.next_review_date)
      return reviewDate >= today && reviewDate <= thirtyDaysLater
    }).length
    
    // Open job positions (handle TRUE as string from database)
    const openPositions = jobPostings.filter(j => 
      j.is_active === true || j.is_active === 'TRUE' || j.is_active === 'true'
    ).length
    
    // New applications (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    const newApplications = jobApplications.filter(a => {
      const appliedDate = new Date(a.applied_date)
      return appliedDate >= sevenDaysAgo
    }).length
    
    // Calculate average performance score
    const employeesWithScore = employees.filter(e => e.performance_score)
    const avgPerformance = employeesWithScore.length > 0
      ? employeesWithScore.reduce((sum, e) => sum + (e.performance_score || 0), 0) / employeesWithScore.length
      : 0

    return {
      activeEmployees,
      reviewsDue,
      openPositions,
      newApplications,
      avgPerformance: Math.round(avgPerformance * 10) / 10,
    }
  }, [employees, performanceReviews, jobPostings, jobApplications])

  const kpis = [
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'active').length.toString(),
      trend: '+12%',
      trendUp: true,
      icon: FolderKanban,
      color: 'text-blue-500',
    },
    {
      title: 'Open Tasks',
      value: (projectMetrics.totalTasks - projectMetrics.completedTasks).toString(),
      trend: '-8%',
      trendUp: false,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Active Clients',
      value: csClients.filter(c => c.status !== 'at-risk').length.toString(),
      trend: csMetrics.atRiskClients > 0 ? `-${csMetrics.atRiskClients}` : '+5%',
      trendUp: csMetrics.atRiskClients === 0,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Team Members',
      value: hrMetrics.activeEmployees.toString(),
      trend: '+0',
      trendUp: true,
      icon: UserCheck,
      color: 'text-orange-500',
    },
    {
      title: 'Inventory Value',
      value: '$2.4M',
      trend: '+15%',
      trendUp: true,
      icon: Package,
      color: 'text-emerald-500',
    },
    {
      title: 'Manufacturing OEE',
      value: '87%',
      trend: '+3%',
      trendUp: true,
      icon: Factory,
      color: 'text-cyan-500',
    },
    {
      title: 'Job Applications',
      value: hrMetrics.newApplications.toString(),
      trend: '+28%',
      trendUp: true,
      icon: Bot,
      color: 'text-pink-500',
    },
  ]

  const modules = [
    {
      name: 'Project Management',
      shortName: 'PM',
      icon: FolderKanban,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      metrics: [
        { label: 'Completion', value: `${projectMetrics.completionRate}%`, progress: projectMetrics.completionRate },
        { label: 'Overdue Tasks', value: projectMetrics.overdueTasks.toString(), status: projectMetrics.overdueTasks > 0 ? 'warning' : 'success' },
        { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length.toString(), status: 'info' },
      ],
      href: '/projects',
    },
    {
      name: 'Inventory',
      shortName: 'INV',
      icon: Package,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      metrics: [
        { label: 'Stock Level', value: 'Good', status: 'success' },
        { label: 'Low Stock Alerts', value: '3', status: 'warning' },
        { label: 'PO Status', value: '8 pending', status: 'info' },
      ],
      href: '/inventory',
    },
    {
      name: 'Customer Success',
      shortName: 'CSP',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      metrics: [
        { label: 'Avg Health Score', value: `${csMetrics.avgHealthScore}%`, progress: csMetrics.avgHealthScore },
        { label: 'At-Risk Clients', value: csMetrics.atRiskClients.toString(), status: csMetrics.atRiskClients > 0 ? 'warning' : 'success' },
        { label: 'Renewals (60d)', value: csMetrics.upcomingRenewals.toString(), status: 'info' },
      ],
      href: '/customer-success',
    },
    {
      name: 'Workforce Management',
      shortName: 'WFM',
      icon: Briefcase,
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      metrics: [
        { label: 'Active Jobs', value: '28', status: 'success' },
        { label: 'Technicians Online', value: '18/22', progress: 82 },
        { label: 'Schedule Adherence', value: '94%', progress: 94 },
      ],
      href: '/workforce',
    },
    {
      name: 'Human Resources',
      shortName: 'HR',
      icon: UserCheck,
      color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      metrics: [
        { label: 'Active Employees', value: hrMetrics.activeEmployees.toString(), status: 'success' },
        { label: 'Reviews Due (30d)', value: hrMetrics.reviewsDue.toString(), status: hrMetrics.reviewsDue > 0 ? 'warning' : 'success' },
        { label: 'Open Positions', value: hrMetrics.openPositions.toString(), status: 'info' },
      ],
      href: '/hr',
    },
    {
      name: 'Manufacturing Ops',
      shortName: 'Z-MO',
      icon: Factory,
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      metrics: [
        { label: 'Machine Status', value: '12/14 running', progress: 86 },
        { label: 'Production Rate', value: '245/hr', status: 'success' },
        { label: 'Downtime', value: '2.3%', status: 'success' },
      ],
      href: '/manufacturing',
    },
    {
      name: 'Automation',
      shortName: 'AUTO',
      icon: Bot,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      metrics: [
        { label: 'Bot Activity', value: '342 jobs', status: 'success' },
        { label: 'Success Rate', value: '98.5%', progress: 98.5 },
        { label: 'Processing', value: '1.2k docs/day', status: 'info' },
      ],
      href: '/automation',
    },
  ]

  const activities = [
    {
      type: 'success',
      module: 'PM',
      message: "Project 'Website Redesign' completed",
      time: '2 min ago',
    },
    {
      type: 'warning',
      module: 'INV',
      message: 'Low stock alert: Widget A below threshold',
      time: '15 min ago',
    },
    {
      type: 'info',
      module: 'CSP',
      message: 'New client onboarded: Acme Corp',
      time: '1 hour ago',
    },
    {
      type: 'success',
      module: 'AUTO',
      message: 'Automation job completed: Invoice processing',
      time: '2 hours ago',
    },
    {
      type: 'warning',
      module: 'Z-MO',
      message: 'Machine M-04 scheduled maintenance due',
      time: '3 hours ago',
    },
  ]

  // Show loading state while auth is loading or data is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Hub data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Katana Hub</h1>
            <p className="text-muted-foreground">BusinessOps Platform - Central Command Center</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2">
              <Activity className="h-3 w-3" />
              System Healthy
            </Badge>
            <Badge variant="secondary">Last sync: 2 min ago</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Quick Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Search</DialogTitle>
                <DialogDescription>Search across all modules and data</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-query">Search Query</Label>
                  <Input 
                    id="search-query"
                    placeholder="Search projects, tasks, clients, inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (searchQuery.trim()) {
                        alert(`Searching for: "${searchQuery}"`)
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }
                    }}
                  >
                    Search
                  </Button>
                  <Button variant="outline" onClick={() => setIsSearchOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Quick Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Create</DialogTitle>
                <DialogDescription>Create a new item in any module</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-type">Type</Label>
                  <Select value={createType} onValueChange={setCreateType}>
                    <SelectTrigger id="create-type">
                      <SelectValue placeholder="Select what to create" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="inventory">Inventory Item</SelectItem>
                      <SelectItem value="job">Workforce Job</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-title">Title/Name</Label>
                  <Input 
                    id="create-title"
                    placeholder="Enter title or name"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (createType && createTitle.trim()) {
                        alert(`Creating ${createType}: "${createTitle}"`)
                        setCreateType('')
                        setCreateTitle('')
                        setIsCreateOpen(false)
                      } else {
                        alert('Please select a type and enter a title')
                      }
                    }}
                  >
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hub Settings</DialogTitle>
                <DialogDescription>Configure your hub preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Dashboard Layout</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Layout</SelectItem>
                      <SelectItem value="compact">Compact View</SelectItem>
                      <SelectItem value="detailed">Detailed View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Time Range</Label>
                  <Select defaultValue="7d">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Refresh Interval</Label>
                  <Select defaultValue="2min">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">1 minute</SelectItem>
                      <SelectItem value="2min">2 minutes</SelectItem>
                      <SelectItem value="5min">5 minutes</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      alert('Settings saved successfully!')
                      setIsSettingsOpen(false)
                    }}
                  >
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant={timeRange === '24h' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('24h')}>
              24h
            </Button>
            <Button variant={timeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('7d')}>
              7d
            </Button>
            <Button variant={timeRange === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('30d')}>
              30d
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                  <div className="flex items-center gap-1 text-sm">
                    {kpi.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={kpi.trendUp ? 'text-green-500' : 'text-red-500'}>{kpi.trend}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.title}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Module Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, index) => {
              const Icon = module.icon
              return (
                <Link key={index} to={module.href}>
                  <Card className={`border-2 ${module.color} hover:shadow-lg transition-all cursor-pointer`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${module.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{module.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {module.shortName}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {module.metrics.map((metric, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{metric.label}</span>
                            <span className="font-medium">{metric.value}</span>
                          </div>
                          {metric.progress !== undefined && <Progress value={metric.progress} className="h-1" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === 'success'
                        ? 'bg-green-500/10 text-green-500'
                        : activity.type === 'warning'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {activity.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : activity.type === 'warning' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.module}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm">{activity.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Efficiency</span>
                  <span className="font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Resource Utilization</span>
                  <span className="font-medium">73%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
