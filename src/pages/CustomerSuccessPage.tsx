import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus,
  Mail,
  Download,
  CheckCircle2,
  Circle,
  AlertCircle,
  Brain,
  Target,
  BarChart3,
  TrendingDown,
  DollarSign,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Phone,
  Building,
  User,
  FileText,
  Clock,
  ChevronRight,
  Trash2,
} from "lucide-react"

export default function CustomerSuccessPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [clientSearchQuery, setClientSearchQuery] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientIndustry, setNewClientIndustry] = useState("")
  const [newClientCSM, setNewClientCSM] = useState("")
  const [newClientARR, setNewClientARR] = useState("")
  const [newClientRenewalDate, setNewClientRenewalDate] = useState("")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [phoneNotes, setPhoneNotes] = useState("")
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [taskFilter, setTaskFilter] = useState("all")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskClient, setNewTaskClient] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium")
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [editTaskTitle, setEditTaskTitle] = useState("")
  const [editTaskClient, setEditTaskClient] = useState("")
  const [editTaskDueDate, setEditTaskDueDate] = useState("")
  const [editTaskPriority, setEditTaskPriority] = useState("")
  const [editTaskStatus, setEditTaskStatus] = useState("")
  const [isNewMilestoneOpen, setIsNewMilestoneOpen] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneClient, setNewMilestoneClient] = useState("")
  const [newMilestoneTargetDate, setNewMilestoneTargetDate] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [isLogInteractionOpen, setIsLogInteractionOpen] = useState(false)
  const [interactionFilter, setInteractionFilter] = useState("all")
  const [newInteractionType, setNewInteractionType] = useState("")
  const [newInteractionClient, setNewInteractionClient] = useState("")
  const [newInteractionSubject, setNewInteractionSubject] = useState("")
  const [newInteractionDescription, setNewInteractionDescription] = useState("")

  const [clients, setClients] = useState([
    {
      id: 1,
      name: "Acme Corp",
      industry: "Technology",
      healthScore: 85,
      status: "healthy",
      lastContact: "3 days",
      tasksCompleted: 12,
      tasksTotal: 15,
      milestonesCompleted: 4,
      milestonesTotal: 5,
      churnRisk: 15,
      churnTrend: "down",
      npsScore: 9,
      arr: 120000,
      renewalDate: "2025-06-15",
      csm: "Sarah Johnson",
      engagementScore: 92,
      healthTrend: [75, 78, 82, 85, 85],
    },
    {
      id: 2,
      name: "Beta Solutions",
      industry: "Manufacturing",
      healthScore: 45,
      status: "at-risk",
      lastContact: "12 days",
      tasksCompleted: 5,
      tasksTotal: 18,
      milestonesCompleted: 2,
      milestonesTotal: 6,
      churnRisk: 78,
      churnTrend: "up",
      npsScore: 4,
      arr: 85000,
      renewalDate: "2025-04-20",
      csm: "Michael Chen",
      engagementScore: 38,
      healthTrend: [68, 62, 55, 48, 45],
    },
    {
      id: 3,
      name: "Gamma Industries",
      industry: "Healthcare",
      healthScore: 72,
      status: "moderate",
      lastContact: "2 days",
      tasksCompleted: 8,
      tasksTotal: 12,
      milestonesCompleted: 3,
      milestonesTotal: 4,
      churnRisk: 35,
      churnTrend: "stable",
      npsScore: 7,
      arr: 95000,
      renewalDate: "2025-08-10",
      csm: "Sarah Johnson",
      engagementScore: 68,
      healthTrend: [70, 71, 70, 72, 72],
    },
    {
      id: 4,
      name: "Delta Systems",
      industry: "Finance",
      healthScore: 91,
      status: "healthy",
      lastContact: "1 day",
      tasksCompleted: 14,
      tasksTotal: 15,
      milestonesCompleted: 5,
      milestonesTotal: 5,
      churnRisk: 8,
      churnTrend: "down",
      npsScore: 10,
      arr: 250000,
      renewalDate: "2025-12-01",
      csm: "Emily Rodriguez",
      engagementScore: 95,
      healthTrend: [88, 89, 90, 91, 91],
    },
    {
      id: 5,
      name: "Epsilon Tech",
      industry: "Retail",
      healthScore: 58,
      status: "moderate",
      lastContact: "7 days",
      tasksCompleted: 6,
      tasksTotal: 14,
      milestonesCompleted: 2,
      milestonesTotal: 5,
      churnRisk: 52,
      churnTrend: "up",
      npsScore: 6,
      arr: 72000,
      renewalDate: "2025-05-15",
      csm: "Michael Chen",
      engagementScore: 55,
      healthTrend: [65, 62, 60, 58, 58],
    },
  ])

  const [tasks, setTasks] = useState([
    {
      id: "1-1",
      client: "Acme Corp",
      task: "Complete onboarding documentation",
      status: "completed",
      dueDate: "2025-01-20",
      priority: "high",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "1-2", 
      client: "Acme Corp",
      task: "Schedule quarterly business review",
      status: "active",
      dueDate: "2025-01-30",
      priority: "medium",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "2-1",
      client: "Beta Solutions",
      task: "Address technical concerns",
      status: "overdue",
      dueDate: "2025-01-18",
      priority: "high",
      assignedTo: "Michael Chen",
    },
    {
      id: "2-2",
      client: "Beta Solutions", 
      task: "Review usage analytics",
      status: "active",
      dueDate: "2025-01-28",
      priority: "medium",
      assignedTo: "Michael Chen",
    },
    {
      id: "3-1",
      client: "Gamma Industries",
      task: "Product training session",
      status: "completed",
      dueDate: "2025-01-15",
      priority: "medium",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "4-1",
      client: "Delta Systems",
      task: "Upsell premium features",
      status: "active", 
      dueDate: "2025-02-05",
      priority: "low",
      assignedTo: "Emily Rodriguez",
    },
  ])

  const [milestones, setMilestones] = useState([
    {
      id: "m1-1",
      client: "Acme Corp",
      title: "Initial Setup Complete",
      description: "Complete platform setup and configuration",
      status: "completed",
      targetDate: "2024-10-15",
      completedDate: "2024-10-12",
    },
    {
      id: "m1-2",
      client: "Acme Corp", 
      title: "Team Training Finished",
      description: "Train all team members on platform usage",
      status: "completed",
      targetDate: "2024-11-01",
      completedDate: "2024-10-28",
    },
    {
      id: "m1-3",
      client: "Acme Corp",
      title: "First Value Milestone",
      description: "Achieve first measurable business value",
      status: "in-progress",
      targetDate: "2025-02-15",
      completedDate: null,
    },
    {
      id: "m2-1",
      client: "Beta Solutions",
      title: "Initial Setup Complete", 
      description: "Complete platform setup and configuration",
      status: "completed",
      targetDate: "2024-09-20",
      completedDate: "2024-09-25",
    },
    {
      id: "m2-2",
      client: "Beta Solutions",
      title: "Team Training Finished",
      description: "Train all team members on platform usage", 
      status: "in-progress",
      targetDate: "2025-01-30",
      completedDate: null,
    },
  ])

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getHealthBadge = (status: string) => {
    if (status === "healthy")
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Healthy</Badge>
    if (status === "moderate")
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Moderate</Badge>
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">At Risk</Badge>
  }

  const getChurnRiskBadge = (risk: number) => {
    if (risk < 25)
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <TrendingDown className="w-3 h-3 mr-1" />
          Low Risk
        </Badge>
      )
    if (risk < 60)
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Activity className="w-3 h-3 mr-1" />
          Medium Risk
        </Badge>
      )
    return (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
        <TrendingUp className="w-3 h-3 mr-1" />
        High Risk
      </Badge>
    )
  }

  const handleViewClient = (client: any) => {
    setSelectedClient(client)
    setIsClientModalOpen(true)
  }

  const handleAddClient = () => {
    if (!newClientName || !newClientIndustry || !newClientCSM || !newClientARR || !newClientRenewalDate) {
      alert("Please fill in all required fields")
      return
    }

    const maxId = Math.max(...clients.map(c => c.id))
    const newClient = {
      id: maxId + 1,
      name: newClientName,
      industry: newClientIndustry,
      healthScore: 75, // Default starting health score
      status: "moderate",
      lastContact: "0 days",
      tasksCompleted: 0,
      tasksTotal: 5, // Default starting tasks
      milestonesCompleted: 0,
      milestonesTotal: 3, // Default starting milestones
      churnRisk: 25, // Default low risk
      churnTrend: "stable",
      npsScore: 7, // Default neutral score
      arr: parseInt(newClientARR),
      renewalDate: newClientRenewalDate,
      csm: newClientCSM,
      engagementScore: 50, // Default starting engagement
      healthTrend: [75, 75, 75, 75, 75], // Default stable trend
    }

    setClients([...clients, newClient])
    
    // Reset form
    setNewClientName("")
    setNewClientIndustry("")
    setNewClientCSM("")
    setNewClientARR("")
    setNewClientRenewalDate("")
    setIsAddClientOpen(false)
  }

  const handleSendEmail = () => {
    if (!emailSubject || !emailMessage) {
      alert("Please fill in both subject and message")
      return
    }

    // Simulate sending email
    alert(`Email sent to ${selectedClient?.name}!\n\nSubject: ${emailSubject}\n\nThis would integrate with your email system.`)
    
    // Reset form and close
    setEmailSubject("")
    setEmailMessage("")
    setIsEmailDialogOpen(false)
  }

  const handleLogCall = () => {
    if (!phoneNotes) {
      alert("Please add some notes about the call")
      return
    }

    // Simulate logging call
    alert(`Call logged for ${selectedClient?.name}!\n\nNotes: ${phoneNotes}\n\nThis would be added to the interaction history.`)
    
    // Reset form and close
    setPhoneNotes("")
    setIsPhoneDialogOpen(false)
  }

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskClient || !newTaskDueDate) {
      alert("Please fill in all required fields")
      return
    }

    const maxId = Math.max(...tasks.map(t => parseInt(t.id.split('-')[1])))
    const clientId = clients.find(c => c.name === newTaskClient)?.id || 1
    const newTask = {
      id: `${clientId}-${maxId + 1}`,
      client: newTaskClient,
      task: newTaskTitle,
      status: "active",
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      assignedTo: clients.find(c => c.name === newTaskClient)?.csm || "Unassigned",
    }

    setTasks([...tasks, newTask])
    
    // Reset form
    setNewTaskTitle("")
    setNewTaskClient("")
    setNewTaskDueDate("")
    setNewTaskPriority("medium")
    setIsNewTaskOpen(false)
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "completed" ? "active" : "completed" }
        : task
    ))
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setEditTaskTitle(task.task)
    setEditTaskClient(task.client)
    setEditTaskDueDate(task.dueDate)
    setEditTaskPriority(task.priority)
    setEditTaskStatus(task.status)
    setIsEditTaskOpen(true)
  }

  const handleSaveTask = () => {
    if (!editTaskTitle || !editTaskClient || !editTaskDueDate) {
      alert("Please fill in all required fields")
      return
    }

    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id 
        ? {
            ...task,
            task: editTaskTitle,
            client: editTaskClient,
            dueDate: editTaskDueDate,
            priority: editTaskPriority,
            status: editTaskStatus,
            assignedTo: clients.find(c => c.name === editTaskClient)?.csm || task.assignedTo,
          }
        : task
    )

    setTasks(updatedTasks)
    
    // Reset form
    setEditingTask(null)
    setEditTaskTitle("")
    setEditTaskClient("")
    setEditTaskDueDate("")
    setEditTaskPriority("")
    setEditTaskStatus("")
    setIsEditTaskOpen(false)
  }

  const handleAddMilestone = () => {
    if (!newMilestoneTitle || !newMilestoneClient || !newMilestoneTargetDate) {
      alert("Please fill in all required fields")
      return
    }

    const clientMilestones = milestones.filter(m => m.client === newMilestoneClient)
    const maxId = clientMilestones.length > 0 
      ? Math.max(...clientMilestones.map(m => parseInt(m.id.split('-')[1])))
      : 0
    const clientId = clients.find(c => c.name === newMilestoneClient)?.id || 1
    
    const newMilestone = {
      id: `m${clientId}-${maxId + 1}`,
      client: newMilestoneClient,
      title: newMilestoneTitle,
      description: newMilestoneDescription,
      status: "in-progress",
      targetDate: newMilestoneTargetDate,
      completedDate: null,
    }

    setMilestones([...milestones, newMilestone])
    
    // Reset form
    setNewMilestoneTitle("")
    setNewMilestoneClient("")
    setNewMilestoneTargetDate("")
    setNewMilestoneDescription("")
    setIsNewMilestoneOpen(false)
  }

  const [interactions, setInteractions] = useState([
    {
      id: "int1",
      type: "email",
      client: "Acme Corp",
      subject: "Quarterly Review Invitation",
      description: "Sent quarterly business review invitation to Acme Corp",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      csm: "Sarah Johnson",
    },
    {
      id: "int2",
      type: "call",
      client: "Beta Solutions",
      subject: "Technical Support Call",
      description: "Discussed technical concerns and provided solutions",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      csm: "Michael Chen",
    },
    {
      id: "int3",
      type: "meeting",
      client: "Delta Systems",
      subject: "Strategy Planning Meeting",
      description: "Discussed Q1 goals and feature roadmap",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      csm: "Emily Rodriguez",
    },
  ])

  const handleLogInteraction = () => {
    if (!newInteractionType || !newInteractionClient || !newInteractionSubject || !newInteractionDescription) {
      alert("Please fill in all required fields")
      return
    }

    const newInteraction = {
      id: `int${interactions.length + 1}`,
      type: newInteractionType,
      client: newInteractionClient,
      subject: newInteractionSubject,
      description: newInteractionDescription,
      timestamp: new Date(),
      csm: clients.find(c => c.name === newInteractionClient)?.csm || "Unassigned",
    }

    setInteractions([newInteraction, ...interactions]) // Add to beginning for most recent first
    
    // Reset form
    setNewInteractionType("")
    setNewInteractionClient("")
    setNewInteractionSubject("")
    setNewInteractionDescription("")
    setIsLogInteractionOpen(false)
  }

  // Filtered clients for dashboard tab
  const dashboardFilteredClients = clients.filter((client) => {
    const statusMatch = filterStatus === "all" || client.status === filterStatus
    const searchMatch = searchQuery === "" || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.csm.toLowerCase().includes(searchQuery.toLowerCase())
    return statusMatch && searchMatch
  })

  // Filtered clients for clients tab
  const clientsTabFilteredClients = clients.filter((client) => {
    const searchMatch = clientSearchQuery === "" ||
      client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.csm.toLowerCase().includes(clientSearchQuery.toLowerCase())
    return searchMatch
  })

  // Filtered tasks based on current filter
  const filteredTasks = tasks.filter((task) => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    switch (taskFilter) {
      case "overdue":
        return task.status !== "completed" && daysDiff < 0
      case "due-soon":
        return task.status !== "completed" && daysDiff >= 0 && daysDiff <= 7
      case "completed":
        return task.status === "completed"
      case "active":
        return task.status === "active"
      default:
        return true
    }
  })

  // Filtered interactions based on current filter
  const filteredInteractions = interactions.filter((interaction) => {
    return interactionFilter === "all" || interaction.type === interactionFilter
  })

  const atRiskCount = clients.filter((c) => c.status === "at-risk").length
  const avgHealthScore = Math.round(clients.reduce((sum, c) => sum + c.healthScore, 0) / clients.length)
  const avgDaysSinceTouch = Math.round(
    clients.reduce((sum, c) => sum + Number.parseInt(c.lastContact), 0) / clients.length,
  )
  const totalARR = clients.reduce((sum, c) => sum + c.arr, 0)
  const avgNPS = Math.round(clients.reduce((sum, c) => sum + c.npsScore, 0) / clients.length)
  const highChurnRiskCount = clients.filter((c) => c.churnRisk > 60).length

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6 mb-6">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Customer Success Platform</span>
              </div>
              
              {/* Title with Icon */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Customer Success Platform</h1>
              </div>
              
              <p className="text-muted-foreground mt-2">Zenith Success - Proactive customer engagement</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Client
              </Button>
                </DialogTrigger>
              </Dialog>
              <Button 
                variant="outline"
                onClick={() => {
                  alert("Send bulk email to all clients:\n\n• Newsletter\n• Product updates\n• Health check surveys\n• Renewal reminders\n\nThis would open a bulk email composer.")
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Export client data as CSV
                  try {
                    const headers = ['Client ID', 'Name', 'Industry', 'Health Score', 'Status', 'CSM', 'ARR', 'Renewal Date', 'Last Contact', 'Churn Risk']
                    const csvData = [
                      headers.join(','),
                      ...clients.map(client => [
                        client.id,
                        `"${client.name}"`,
                        `"${client.industry}"`,
                        client.healthScore,
                        client.status,
                        `"${client.csm}"`,
                        client.arr,
                        client.renewalDate,
                        `"${client.lastContact}"`,
                        client.churnRisk
                      ].join(','))
                    ].join('\n')

                    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
                    const link = document.createElement('a')
                    const url = URL.createObjectURL(blob)
                    link.setAttribute('href', url)
                    link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`)
                    link.style.visibility = 'hidden'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } catch (error) {
                    console.error('Error exporting clients:', error)
                    alert('Failed to export client data. Please try again.')
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold">{clients.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Active client accounts</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Churn Risk</p>
                <p className="text-3xl font-bold text-red-500">{highChurnRiskCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Predicted churn &gt;60%</p>
              </div>
              <Brain className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ARR</p>
                <p className="text-3xl font-bold">${(totalARR / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground mt-1">Annual recurring revenue</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg NPS Score</p>
                <p className="text-3xl font-bold">{avgNPS}</p>
                <p className="text-xs text-muted-foreground mt-1">Net Promoter Score</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Client List</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant={filterStatus === "at-risk" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("at-risk")}
                      >
                        At Risk
                      </Button>
                      <Button
                        variant={filterStatus === "moderate" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("moderate")}
                      >
                        Moderate
                      </Button>
                      <Button
                        variant={filterStatus === "healthy" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("healthy")}
                      >
                        Healthy
                      </Button>
                    </div>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by name, industry, or CSM..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardFilteredClients.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No clients found matching your search.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setSearchQuery("")
                            setFilterStatus("all")
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      dashboardFilteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{client.name}</h3>
                            {getHealthBadge(client.status)}
                            {getChurnRiskBadge(client.churnRisk)}
                          </div>
                          <p className="text-sm text-muted-foreground">{client.industry}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Last contact: {client.lastContact} ago</span>
                            <span>
                              Tasks: {client.tasksCompleted}/{client.tasksTotal}
                            </span>
                            <span>
                              Milestones: {client.milestonesCompleted}/{client.milestonesTotal}
                            </span>
                            <span>ARR: ${(client.arr / 1000).toFixed(0)}K</span>
                            <span>Renewal: {new Date(client.renewalDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Health Trend:</span>
                            <div className="flex items-end gap-0.5 h-6">
                              {client.healthTrend.map((score, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 rounded-t ${
                                    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ height: `${(score / 100) * 100}%` }}
                                />
                              ))}
                            </div>
                            {client.churnTrend === "up" && <ArrowUpRight className="w-4 h-4 text-red-500" />}
                            {client.churnTrend === "down" && <ArrowDownRight className="w-4 h-4 text-green-500" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Health Score</p>
                            <p className={`text-2xl font-bold ${getHealthColor(client.healthScore)}`}>
                              {client.healthScore}%
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewClient(client)}>
                            View
                          </Button>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats & Activity */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Task Progress</span>
                      <span className="text-sm font-semibold">75%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">45/60 completed</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Milestone Progress</span>
                      <span className="text-sm font-semibold">80%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">12/15 completed</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">5 tasks overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">2 milestones overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">3 clients need follow-up</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">New task added for Acme Corp</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">Milestone completed for Beta Solutions</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">Health score updated for Gamma Industries</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Circle className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">Client portal accessed by Delta Systems</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Directory</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                    <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Export filtered client data as CSV
                      try {
                        const headers = ['Client ID', 'Name', 'Industry', 'Health Score', 'Status', 'CSM', 'ARR', 'Renewal Date']
                        const csvData = [
                          headers.join(','),
                          ...clientsTabFilteredClients.map(client => [
                            client.id,
                            `"${client.name}"`,
                            `"${client.industry}"`,
                            client.healthScore,
                            client.status,
                            `"${client.csm}"`,
                            client.arr,
                            client.renewalDate
                          ].join(','))
                        ].join('\n')

                        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
                        const link = document.createElement('a')
                        const url = URL.createObjectURL(blob)
                        link.setAttribute('href', url)
                        link.setAttribute('download', `filtered_clients_export_${new Date().toISOString().split('T')[0]}.csv`)
                        link.style.visibility = 'hidden'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      } catch (error) {
                        console.error('Error exporting clients:', error)
                        alert('Failed to export client data. Please try again.')
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search clients..." 
                    className="pl-10"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientsTabFilteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No clients found matching your search.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setClientSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  clientsTabFilteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewClient(client)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        {getHealthBadge(client.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="font-medium">{client.industry}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">CSM</p>
                          <p className="font-medium">{client.csm}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ARR</p>
                          <p className="font-medium">${(client.arr / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Renewal</p>
                          <p className="font-medium">{new Date(client.renewalDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Health</p>
                        <p className={`text-2xl font-bold ${getHealthColor(client.healthScore)}`}>
                          {client.healthScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Management</CardTitle>
                <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
                  <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant={taskFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTaskFilter("all")}
                >
                  All Tasks
                </Button>
                <Button 
                  variant={taskFilter === "overdue" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTaskFilter("overdue")}
                >
                  Overdue
                </Button>
                <Button 
                  variant={taskFilter === "due-soon" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTaskFilter("due-soon")}
                >
                  Due Soon
                </Button>
                <Button 
                  variant={taskFilter === "completed" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTaskFilter("completed")}
                >
                  Completed
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tasks found for the selected filter.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setTaskFilter("all")}
                    >
                      Show All Tasks
                    </Button>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const today = new Date()
                    const dueDate = new Date(task.dueDate)
                    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
                    
                    let dueDateText = ""
                    if (task.status === "completed") {
                      dueDateText = "Completed"
                    } else if (daysDiff < 0) {
                      dueDateText = `${Math.abs(daysDiff)} days overdue`
                    } else if (daysDiff === 0) {
                      dueDateText = "Due today"
                    } else if (daysDiff === 1) {
                      dueDateText = "Due tomorrow"
                    } else {
                      dueDateText = `Due in ${daysDiff} days`
                    }

                    return (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="hover:scale-110 transition-transform"
                        >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        )}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.task}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{task.client}</span>
                            <span className={daysDiff < 0 && task.status !== "completed" ? "text-red-500 font-medium" : ""}>
                              {dueDateText}
                            </span>
                            <span>Assigned to: {task.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            task.priority === "high"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : task.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Milestone Tracking</CardTitle>
                <Dialog open={isNewMilestoneOpen} onOpenChange={setIsNewMilestoneOpen}>
                  <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Milestone
                </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => {
                  const clientMilestones = milestones.filter(m => m.client === client.name)
                  const completedCount = clientMilestones.filter(m => m.status === "completed").length
                  
                  return (
                  <div key={client.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.industry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-xl font-bold">
                            {completedCount}/{clientMilestones.length}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                            width: `${clientMilestones.length > 0 ? (completedCount / clientMilestones.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                        {clientMilestones.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">No milestones yet</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => {
                                setNewMilestoneClient(client.name)
                                setIsNewMilestoneOpen(true)
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add First Milestone
                            </Button>
                      </div>
                        ) : (
                          clientMilestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              {milestone.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <div className="flex-1">
                                <span className={milestone.status === "completed" ? "text-foreground" : "text-muted-foreground"}>
                                  {milestone.title}
                                </span>
                                {milestone.status === "in-progress" && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Due: {new Date(milestone.targetDate).toLocaleDateString()})
                                  </span>
                                )}
                      </div>
                        </div>
                          ))
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Communication History</CardTitle>
                <Dialog open={isLogInteractionOpen} onOpenChange={setIsLogInteractionOpen}>
                  <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Interaction
                </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant={interactionFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInteractionFilter("all")}
                >
                  All
                </Button>
                <Button 
                  variant={interactionFilter === "email" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInteractionFilter("email")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant={interactionFilter === "call" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInteractionFilter("call")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant={interactionFilter === "meeting" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInteractionFilter("meeting")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Meeting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredInteractions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No interactions found for the selected filter.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setInteractionFilter("all")}
                    >
                      Show All Interactions
                    </Button>
                  </div>
                ) : (
                  filteredInteractions.map((interaction) => {
                    const timeAgo = () => {
                      const now = new Date()
                      const diff = now.getTime() - interaction.timestamp.getTime()
                      const hours = Math.floor(diff / (1000 * 60 * 60))
                      const days = Math.floor(hours / 24)
                      
                      if (days > 0) {
                        return `${days} day${days > 1 ? 's' : ''} ago`
                      } else if (hours > 0) {
                        return `${hours} hour${hours > 1 ? 's' : ''} ago`
                      } else {
                        return "Just now"
                      }
                    }

                    return (
                    <div
                      key={interaction.id}
                      className="flex gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          interaction.type === "email"
                            ? "bg-blue-500/10"
                            : interaction.type === "call"
                              ? "bg-green-500/10"
                              : "bg-purple-500/10"
                        }`}
                      >
                        {interaction.type === "email" && <Mail className="w-5 h-5 text-blue-500" />}
                        {interaction.type === "call" && <Phone className="w-5 h-5 text-green-500" />}
                        {interaction.type === "meeting" && <Users className="w-5 h-5 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="font-semibold">{interaction.subject}</h4>
                            <p className="text-sm text-muted-foreground">{interaction.client}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {interaction.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{interaction.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {interaction.csm}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo()}
                          </span>
                        </div>
                      </div>
                    </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Executive Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Executive Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold text-green-500">94%</p>
                    <p className="text-xs text-muted-foreground mt-1">+2% from last quarter</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Expansion Revenue</p>
                    <p className="text-2xl font-bold text-primary">$125K</p>
                    <p className="text-xs text-muted-foreground mt-1">+18% from last quarter</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg NPS</p>
                    <p className="text-2xl font-bold">{avgNPS}</p>
                    <p className="text-xs text-muted-foreground mt-1">Promoter score</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-green-500">4.6/5</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on surveys</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CSM Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  CSM Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">2 clients • Avg Health: 79%</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Michael Chen</p>
                      <p className="text-xs text-muted-foreground">2 clients • Avg Health: 52%</p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Needs Support</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Emily Rodriguez</p>
                      <p className="text-xs text-muted-foreground">1 client • Avg Health: 91%</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Outstanding</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Churn Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Churn Prediction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Low Risk (0-25%)</span>
                      <span className="text-sm font-semibold">2 clients</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Medium Risk (25-60%)</span>
                      <span className="text-sm font-semibold">2 clients</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">High Risk (60%+)</span>
                      <span className="text-sm font-semibold">1 client</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Key Churn Indicators:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Low engagement score (&lt;50)</li>
                      <li>• Missed milestones (2+ overdue)</li>
                      <li>• No contact in 10+ days</li>
                      <li>• Declining health trend</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  ROI & Revenue Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-500/5">
                    <p className="text-sm text-muted-foreground">Prevented Churn Value</p>
                    <p className="text-2xl font-bold text-green-500">$340K</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 12 months</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <p className="text-sm text-muted-foreground">Expansion Revenue</p>
                    <p className="text-2xl font-bold text-primary">$125K</p>
                    <p className="text-xs text-muted-foreground mt-1">Upsells & cross-sells</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Platform ROI</p>
                    <p className="text-2xl font-bold">385%</p>
                    <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Detail Modal */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-3 border-b flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl mb-2 truncate">{selectedClient?.name}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedClient && getHealthBadge(selectedClient.status)}
                  {selectedClient && getChurnRiskBadge(selectedClient.churnRisk)}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  className="mx-0 my-3.5 bg-transparent" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEmailDialogOpen(true)}
                  title="Send Email"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button 
                  className="my-3.5 bg-transparent" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPhoneDialogOpen(true)}
                  title="Log Phone Call"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedClient && (
            <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 flex-shrink-0">
                <TabsTrigger
                  value="overview"
                  className="border-b-2 border-transparent data-[state=active]:border-primary text-sm rounded-lg"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="health"
                  className="border-b-2 border-transparent data-[state=active]:border-primary text-sm rounded-lg"
                >
                  Health
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="border-b-2 border-transparent data-[state=active]:border-primary text-sm rounded-lg"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="border-b-2 border-transparent data-[state=active]:border-primary text-sm rounded-lg"
                >
                  Activity
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto pt-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <div className={`text-2xl font-bold mb-1 ${getHealthColor(selectedClient.healthScore)}`}>
                          {selectedClient.healthScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">Health Score</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <div className="text-2xl font-bold mb-1">${(selectedClient.arr / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Annual ARR</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <div className="text-2xl font-bold mb-1">{selectedClient.npsScore}/10</div>
                        <p className="text-xs text-muted-foreground">NPS Score</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <div className="text-2xl font-bold mb-1">{selectedClient.engagementScore}%</div>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Client Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Industry</p>
                            <p className="text-sm font-medium truncate">{selectedClient.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">CSM</p>
                            <p className="text-sm font-medium truncate">{selectedClient.csm}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Renewal Date</p>
                            <p className="text-sm font-medium truncate">
                              {new Date(selectedClient.renewalDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Last Contact</p>
                            <p className="text-sm font-medium truncate">{selectedClient.lastContact} ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Task Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold">{selectedClient.tasksCompleted}</span>
                          <span className="text-sm text-muted-foreground">of {selectedClient.tasksTotal}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${(selectedClient.tasksCompleted / selectedClient.tasksTotal) * 100}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Milestone Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold">{selectedClient.milestonesCompleted}</span>
                          <span className="text-sm text-muted-foreground">of {selectedClient.milestonesTotal}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(selectedClient.milestonesCompleted / selectedClient.milestonesTotal) * 100}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Health Score Trend</CardTitle>
                      <p className="text-xs text-muted-foreground">Last 5 periods</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-3 h-40 px-2">
                        {selectedClient.healthTrend.map((score: number, idx: number) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full">
                              <div
                                className={`w-full rounded-t transition-all ${
                                  score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ height: `${(score / 100) * 120}px` }}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold">{score}%</p>
                              <p className="text-[10px] text-muted-foreground">P{idx + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                        {selectedClient.churnTrend === "up" && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Declining
                          </Badge>
                        )}
                        {selectedClient.churnTrend === "down" && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                            Improving
                          </Badge>
                        )}
                        {selectedClient.churnTrend === "stable" && (
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
                            <Activity className="w-3 h-3 mr-1" />
                            Stable
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Churn Risk Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-3">
                          <div
                            className={`text-3xl font-bold mb-2 ${selectedClient.churnRisk > 60 ? "text-red-500" : selectedClient.churnRisk > 25 ? "text-yellow-500" : "text-green-500"}`}
                          >
                            {selectedClient.churnRisk}%
                          </div>
                          {getChurnRiskBadge(selectedClient.churnRisk)}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p className="text-muted-foreground font-medium">Risk Factors:</p>
                          <ul className="space-y-1">
                            {selectedClient.churnRisk > 60 && (
                              <>
                                <li className="flex items-center gap-1.5">
                                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                  <span className="truncate">Low engagement</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                  <span className="truncate">Declining trend</span>
                                </li>
                              </>
                            )}
                            {selectedClient.lastContact.includes("12") && (
                              <li className="flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                <span className="truncate">No recent contact</span>
                              </li>
                            )}
                            {selectedClient.churnRisk < 25 && (
                              <li className="flex items-center gap-1.5 text-green-500">
                                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">All indicators healthy</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Engagement Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Overall Score</span>
                            <span className="text-sm font-bold">{selectedClient.engagementScore}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${selectedClient.engagementScore}%` }}
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Portal Logins</span>
                            <span className="font-medium">24</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Feature Usage</span>
                            <span className="font-medium">High</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Support Tickets</span>
                            <span className="font-medium">3</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Active Tasks</CardTitle>
                        <Button size="sm">
                          <Plus className="w-3 h-3 mr-1" />
                          <span className="text-xs">Add</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2.5 border rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Complete onboarding documentation</p>
                            <p className="text-xs text-muted-foreground">Due: 2 days ago</p>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs flex-shrink-0">
                            Done
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 border rounded-lg">
                          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Schedule quarterly business review</p>
                            <p className="text-xs text-muted-foreground">Due: In 5 days</p>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs flex-shrink-0">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 border rounded-lg">
                          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Review feature adoption metrics</p>
                            <p className="text-xs text-muted-foreground">Due: In 10 days</p>
                          </div>
                          <Badge className="text-xs flex-shrink-0">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2.5 border rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Initial Setup Complete</p>
                            <p className="text-xs text-muted-foreground">Completed 3 months ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 border rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Team Training Finished</p>
                            <p className="text-xs text-muted-foreground">Completed 2 months ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 border rounded-lg">
                          <Circle className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">First Value Milestone</p>
                            <p className="text-xs text-muted-foreground">Target: Next month</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2.5 pb-3 border-b last:border-0">
                          <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-3.5 h-3.5 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Quarterly Review Invitation</p>
                            <p className="text-xs text-muted-foreground truncate">Sent by {selectedClient.csm}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2.5 pb-3 border-b last:border-0">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Documentation review completed</p>
                            <p className="text-xs text-muted-foreground truncate">Marked complete by client</p>
                            <p className="text-xs text-muted-foreground mt-0.5">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2.5 pb-3 border-b last:border-0">
                          <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Monthly check-in call</p>
                            <p className="text-xs text-muted-foreground truncate">Duration: 45 minutes</p>
                            <p className="text-xs text-muted-foreground mt-0.5">3 days ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2.5 pb-3 border-b last:border-0">
                          <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Q1 Report uploaded</p>
                            <p className="text-xs text-muted-foreground truncate">Uploaded by client</p>
                            <p className="text-xs text-muted-foreground mt-0.5">5 days ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Create a new client account in the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-name">Client Name *</Label>
              <Input 
                id="client-name"
                placeholder="Enter client name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client-industry">Industry *</Label>
              <Select value={newClientIndustry} onValueChange={setNewClientIndustry}>
                <SelectTrigger id="client-industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-csm">Customer Success Manager *</Label>
              <Select value={newClientCSM} onValueChange={setNewClientCSM}>
                <SelectTrigger id="client-csm">
                  <SelectValue placeholder="Assign CSM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                  <SelectItem value="Emily Rodriguez">Emily Rodriguez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-arr">Annual Recurring Revenue (ARR) *</Label>
              <Input 
                id="client-arr"
                type="number"
                placeholder="Enter ARR amount"
                value={newClientARR}
                onChange={(e) => setNewClientARR(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client-renewal">Renewal Date *</Label>
              <Input 
                id="client-renewal"
                type="date"
                value={newClientRenewalDate}
                onChange={(e) => setNewClientRenewalDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleAddClient}>
                Create Client
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddClientOpen(false)
                setNewClientName("")
                setNewClientIndustry("")
                setNewClientCSM("")
                setNewClientARR("")
                setNewClientRenewalDate("")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {selectedClient?.name}</DialogTitle>
            <DialogDescription>Compose and send an email to the client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input 
                id="email-to"
                value={`${selectedClient?.name} <contact@${selectedClient?.name.toLowerCase().replace(/\s+/g, '')}.com>`}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject *</Label>
              <Input 
                id="email-subject"
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message *</Label>
              <Textarea 
                id="email-message"
                placeholder="Enter your message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSendEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEmailDialogOpen(false)
                setEmailSubject("")
                setEmailMessage("")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Call Dialog */}
      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Phone Call - {selectedClient?.name}</DialogTitle>
            <DialogDescription>Record details about your phone conversation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input 
                id="phone-number"
                value={`+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="call-duration">Call Duration</Label>
              <Select defaultValue="15min">
                <SelectTrigger id="call-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5min">5 minutes</SelectItem>
                  <SelectItem value="15min">15 minutes</SelectItem>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="45min">45 minutes</SelectItem>
                  <SelectItem value="60min">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="call-notes">Call Notes *</Label>
              <Textarea 
                id="call-notes"
                placeholder="What was discussed during the call?"
                value={phoneNotes}
                onChange={(e) => setPhoneNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleLogCall}>
                <Phone className="w-4 h-4 mr-2" />
                Log Call
              </Button>
              <Button variant="outline" onClick={() => {
                setIsPhoneDialogOpen(false)
                setPhoneNotes("")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task for client success management</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input 
                id="task-title"
                placeholder="Enter task description"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-client">Assign to Client *</Label>
              <Select value={newTaskClient} onValueChange={setNewTaskClient}>
                <SelectTrigger id="task-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-priority">Priority *</Label>
              <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-due-date">Due Date *</Label>
              <Input 
                id="task-due-date"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleAddTask}>
                Create Task
              </Button>
              <Button variant="outline" onClick={() => {
                setIsNewTaskOpen(false)
                setNewTaskTitle("")
                setNewTaskClient("")
                setNewTaskDueDate("")
                setNewTaskPriority("medium")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and assignment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-task-title">Task Title *</Label>
              <Input 
                id="edit-task-title"
                placeholder="Enter task description"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-task-client">Assign to Client *</Label>
              <Select value={editTaskClient} onValueChange={setEditTaskClient}>
                <SelectTrigger id="edit-task-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-priority">Priority *</Label>
                <Select value={editTaskPriority} onValueChange={setEditTaskPriority}>
                  <SelectTrigger id="edit-task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-status">Status *</Label>
                <Select value={editTaskStatus} onValueChange={setEditTaskStatus}>
                  <SelectTrigger id="edit-task-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-task-due-date">Due Date *</Label>
              <Input 
                id="edit-task-due-date"
                type="date"
                value={editTaskDueDate}
                onChange={(e) => setEditTaskDueDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSaveTask}>
                Save Changes
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${editTaskTitle}"?`)) {
                    setTasks(tasks.filter(t => t.id !== editingTask.id))
                    setIsEditTaskOpen(false)
                    setEditingTask(null)
                    setEditTaskTitle("")
                    setEditTaskClient("")
                    setEditTaskDueDate("")
                    setEditTaskPriority("")
                    setEditTaskStatus("")
                  }
                }}
              >
                Delete
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditTaskOpen(false)
                setEditingTask(null)
                setEditTaskTitle("")
                setEditTaskClient("")
                setEditTaskDueDate("")
                setEditTaskPriority("")
                setEditTaskStatus("")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Milestone Dialog */}
      <Dialog open={isNewMilestoneOpen} onOpenChange={setIsNewMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Milestone</DialogTitle>
            <DialogDescription>Add a new milestone for client success tracking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="milestone-title">Milestone Title *</Label>
              <Input 
                id="milestone-title"
                placeholder="Enter milestone name"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="milestone-client">Assign to Client *</Label>
              <Select value={newMilestoneClient} onValueChange={setNewMilestoneClient}>
                <SelectTrigger id="milestone-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea 
                id="milestone-description"
                placeholder="Describe what this milestone represents..."
                value={newMilestoneDescription}
                onChange={(e) => setNewMilestoneDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="milestone-target-date">Target Date *</Label>
              <Input 
                id="milestone-target-date"
                type="date"
                value={newMilestoneTargetDate}
                onChange={(e) => setNewMilestoneTargetDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleAddMilestone}>
                Create Milestone
              </Button>
              <Button variant="outline" onClick={() => {
                setIsNewMilestoneOpen(false)
                setNewMilestoneTitle("")
                setNewMilestoneClient("")
                setNewMilestoneTargetDate("")
                setNewMilestoneDescription("")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Interaction Dialog */}
      <Dialog open={isLogInteractionOpen} onOpenChange={setIsLogInteractionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Interaction</DialogTitle>
            <DialogDescription>Record a communication with a client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="interaction-type">Interaction Type *</Label>
              <Select value={newInteractionType} onValueChange={setNewInteractionType}>
                <SelectTrigger id="interaction-type">
                  <SelectValue placeholder="Select interaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interaction-client">Client *</Label>
              <Select value={newInteractionClient} onValueChange={setNewInteractionClient}>
                <SelectTrigger id="interaction-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interaction-subject">Subject/Title *</Label>
              <Input 
                id="interaction-subject"
                placeholder="Enter subject or title"
                value={newInteractionSubject}
                onChange={(e) => setNewInteractionSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="interaction-description">Description *</Label>
              <Textarea 
                id="interaction-description"
                placeholder="Describe what was discussed or communicated..."
                value={newInteractionDescription}
                onChange={(e) => setNewInteractionDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleLogInteraction}>
                Log Interaction
              </Button>
              <Button variant="outline" onClick={() => {
                setIsLogInteractionOpen(false)
                setNewInteractionType("")
                setNewInteractionClient("")
                setNewInteractionSubject("")
                setNewInteractionDescription("")
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
