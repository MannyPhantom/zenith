import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { calculateZenithMatchScore, defaultJobRequirements } from "@/lib/zenith-matching"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as hrApi from '@/lib/hr-api'
import type { Employee, PerformanceReview, Goal, Feedback360, Mentorship, Recognition, LearningPath, CareerPath } from '@/lib/hr-api'
import { getAllCSMUsers, type CSMUser } from '@/lib/customer-success-api'
import {
  Users,
  Star,
  Briefcase,
  Search,
  Plus,
  BarChart3,
  Calendar,
  FileText,
  Target,
  Download,
  X,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Brain,
  Award,
  UserPlus,
  MessageSquare,
  Sparkles,
  Shield,
  Heart,
  BookOpen,
  Filter,
  FileCheck,
  AlertTriangle,
  ThumbsUp,
  Lightbulb,
  Rocket,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  UserCog,
  Mail,
  Phone,
  Building,
  User,
  Activity,
  Eye,
  Trash2,
} from "lucide-react"
import { AddEmployeeDialog } from "@/components/hr/add-employee-dialog"
import { AddReviewDialog } from "@/components/hr/add-review-dialog"
import { AddGoalDialog } from "@/components/hr/add-goal-dialog"
import { AddCandidateDialog } from "@/components/hr/add-candidate-dialog"
import { RecruitmentDashboard } from "@/components/hr/recruitment-dashboard"
import { getAllApplications, scheduleInterview, getAllJobs } from "@/lib/recruitment-db"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function HRPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [candidateStageFilter, setCandidateStageFilter] = useState("All")
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [goalProgress, setGoalProgress] = useState<number>(0)
  
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [feedback360, setFeedback360] = useState<Feedback360[]>([])
  const [mentorships, setMentorships] = useState<Mentorship[]>([])
  const [recognitions, setRecognitions] = useState<Recognition[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([])
  const [csmUsers, setCSMUsers] = useState<CSMUser[]>([])
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onboardingEmployees: 0,
    avgPerformanceScore: 0,
    totalGoals: 0,
    onTrackGoals: 0,
    behindGoals: 0,
    completeGoals: 0,
    upcomingReviews: 0,
    overdueReviews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Recruitment data
  const [applications, setApplications] = useState<any[]>([])
  const [openPositions, setOpenPositions] = useState<number>(0)
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    new: 0,
    reviewing: 0,
    interviewed: 0,
    offers: 0
  })
  
  // Employee management state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false)
  
  // Performance review dialogs state
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)
  const [isReviewDetailsOpen, setIsReviewDetailsOpen] = useState(false)
  const [isAddReviewDialogOpen, setIsAddReviewDialogOpen] = useState(false)
  const [isReviewHistoryOpen, setIsReviewHistoryOpen] = useState(false)
  
  // Goal dialogs state
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isGoalDetailsOpen, setIsGoalDetailsOpen] = useState(false)
  const [isAddCommentOpen, setIsAddCommentOpen] = useState(false)
  const [goalComment, setGoalComment] = useState('')
  
  // Development tab state
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false)
  const [isGiveRecognitionOpen, setIsGiveRecognitionOpen] = useState(false)
  
  // Quick Actions state
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false)
  const [isSend360FeedbackOpen, setIsSend360FeedbackOpen] = useState(false)
  const [isApproveTimeOffOpen, setIsApproveTimeOffOpen] = useState(false)
  const [isAssignTrainingOpen, setIsAssignTrainingOpen] = useState(false)
  
  // Employee selection and deletion state
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Interview scheduling state
  const [interviewCandidate, setInterviewCandidate] = useState<string>('')
  const [interviewDate, setInterviewDate] = useState<string>('')
  const [interviewTime, setInterviewTime] = useState<string>('')
  const [interviewType, setInterviewType] = useState<string>('')
  const [interviewNotes, setInterviewNotes] = useState<string>('')
  
  // Candidate details state
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isCandidateDetailsOpen, setIsCandidateDetailsOpen] = useState(false)

  // Load all data from Supabase
  useEffect(() => {
    loadData()
    
    // Listen for employee added events
    const handleEmployeeAdded = () => {
      loadData()
    }
    
    const handleApplicationUpdated = async () => {
      // Refresh recruitment data when applications change
      const recruitmentApps = await getAllApplications()
      setApplications(recruitmentApps)
      
      // Calculate application stats
      const recruitmentStats = {
        total: recruitmentApps.length,
        new: recruitmentApps.filter(app => app.status === 'new').length,
        reviewing: recruitmentApps.filter(app => app.status === 'reviewing').length,
        interviewed: recruitmentApps.filter(app => app.status === 'interviewed' || app.status === 'interview-scheduled').length,
        offers: recruitmentApps.filter(app => app.status === 'offer').length,
      }
      setApplicationStats(recruitmentStats)
    }
    
    window.addEventListener('employeeAdded', handleEmployeeAdded)
    window.addEventListener('applicationSubmitted', handleApplicationUpdated)
    window.addEventListener('applicationUpdated', handleApplicationUpdated)
    
    return () => {
      window.removeEventListener('employeeAdded', handleEmployeeAdded)
      window.removeEventListener('applicationSubmitted', handleApplicationUpdated)
      window.removeEventListener('applicationUpdated', handleApplicationUpdated)
    }
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel
      const [
        employeesData,
        reviewsData,
        goalsData,
        feedback360Data,
        mentorshipsData,
        recognitionsData,
        learningPathsData,
        careerPathsData,
        statsData,
        csmUsersData,
      ] = await Promise.all([
        hrApi.getAllEmployees(),
        hrApi.getAllPerformanceReviews(),
        hrApi.getAllGoals(),
        hrApi.getAll360Feedback(),
        hrApi.getAllMentorships(),
        hrApi.getAllRecognitions(),
        hrApi.getAllLearningPaths(),
        hrApi.getAllCareerPaths(),
        hrApi.getHRStats(),
        getAllCSMUsers(),
      ])

      setEmployees(employeesData)
      setPerformanceReviews(reviewsData)
      setGoals(goalsData)
      setFeedback360(feedback360Data)
      setMentorships(mentorshipsData)
      setRecognitions(recognitionsData)
      setLearningPaths(learningPathsData)
      setCareerPaths(careerPathsData)
      setStats(statsData)
      setCSMUsers(csmUsersData)
      
      // Load recruitment data from database
      const recruitmentApps = await getAllApplications()
      setApplications(recruitmentApps)
      
      // Load open positions
      const jobPostings = await getAllJobs()
      setOpenPositions(jobPostings.length)
      
      // Calculate application stats
      const recruitmentStats = {
        total: recruitmentApps.length,
        new: recruitmentApps.filter(app => app.status === 'new').length,
        reviewing: recruitmentApps.filter(app => app.status === 'reviewing').length,
        interviewed: recruitmentApps.filter(app => app.status === 'interviewed' || app.status === 'interview-scheduled').length,
        offers: recruitmentApps.filter(app => app.status === 'offer').length,
      }
      setApplicationStats(recruitmentStats)
    } catch (error) {
      console.error('Error loading HR data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate days until/since review
  const getDaysUntilReview = (reviewDate: string | null | undefined) => {
    if (!reviewDate) return "Not scheduled"
    const today = new Date()
    const review = new Date(reviewDate)
    const diffTime = review.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `In ${diffDays} days`
    } else if (diffDays === 0) {
      return "Today"
    } else {
      return `${Math.abs(diffDays)} days overdue`
    }
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Onboarding":
        return "secondary"
      case "Inactive":
        return "outline"
      default:
        return "default"
    }
  }

  // Get stage badge variant
  const getStageVariant = (stage: string) => {
    switch (stage) {
      case "Applied":
        return "secondary"
      case "Reviewed":
        return "default"
      case "Interviewed":
        return "outline"
      case "Offered":
        return "default"
      default:
        return "secondary"
    }
  }

  // Get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Applied":
        return "text-blue-500"
      case "Reviewed":
        return "text-yellow-500"
      case "Interviewed":
        return "text-orange-500"
      case "Offered":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handler for selecting/deselecting individual employees
  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // Handler for select all/deselect all
  const handleToggleAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id))
    }
  }

  // Handler for deleting selected employees
  const handleDeleteSelected = async () => {
    try {
      // Delete employees from database
      for (const employeeId of selectedEmployees) {
        await hrApi.deleteEmployee(employeeId)
      }
      // Refresh data
      await loadData()
      setSelectedEmployees([])
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting employees:', error)
      alert('Failed to delete employees. Please try again.')
    }
  }

  // Helper function to calculate overall rating
  const calculateOverallRating = (review: PerformanceReview) => {
    return ((review.collaboration + review.accountability + review.trustworthy + review.leadership) / 4).toFixed(1)
  }

  // Helper function to get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-yellow-500"
    return "text-red-500"
  }

  // Helper function to get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Helper function to get review status badge
  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case "on-time":
        return <Badge variant="default">On Time</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get goal status color
  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "Behind":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "Complete":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  // Helper function to get goal status icon
  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case "On Track":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Behind":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "Complete":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  // Helper function to calculate days until due date
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays} days left`
    } else if (diffDays === 0) {
      return "Due today"
    } else {
      return `${Math.abs(diffDays)} days overdue`
    }
  }

  // Goal statistics calculations
  const totalGoals = stats.totalGoals
  const onTrackGoals = stats.onTrackGoals
  const behindGoals = stats.behindGoals
  const completeGoals = stats.completeGoals

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
                <span className="text-foreground">Human Resources</span>
              </div>
              
              {/* Title with Icon */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <UserCog className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Human Resources</h1>
              </div>
              
              <p className="text-muted-foreground mt-2">ZHire - Zenith-Powered Human Capital Management</p>
            </div>
            <div className="flex gap-2">
              <AddEmployeeDialog />
              <AddReviewDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="border-none border-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="insights">Zenith Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                    {stats.onboardingEmployees} onboarding
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{stats.overdueReviews}</div>
                  <p className="text-xs text-muted-foreground">Reviews overdue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgPerformanceScore.toFixed(2)}/5</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                    Across {stats.totalEmployees} employees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openPositions}</div>
                  <p className="text-xs text-muted-foreground">
                    {applicationStats.total > 0 ? `${applicationStats.total} applications` : 'Actively hiring'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common HR tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setIsScheduleInterviewOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setIsSend360FeedbackOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send 360° Feedback
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setIsGiveRecognitionOpen(true)}>
                    <Award className="mr-2 h-4 w-4" />
                    Give Recognition
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setIsApproveTimeOffOpen(true)}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Approve Time Off
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setIsAssignTrainingOpen(true)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Assign Training
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Employee Directory */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Employee Directory</CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search employees..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{employee.name}</h3>
                              <Badge variant={getStatusVariant(employee.status)}>{employee.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {employee.position} • {employee.department}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              Next Review: {getDaysUntilReview(employee.next_review_date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recruitment">
            {/* Sub-tabs for different recruitment views */}
            <Tabs defaultValue="pipeline" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Recruitment Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage candidates from applications to offers
                  </p>
                </div>
              </div>

              <TabsList>
                <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
                <TabsTrigger value="applications">Job Applications</TabsTrigger>
              </TabsList>

              {/* Original Recruitment Pipeline */}
              <TabsContent value="pipeline">
                {/* Quick Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Recruitment Pipeline</h3>
                    <p className="text-sm text-muted-foreground">
                      Anonymous, bias-free hiring with Zenith-powered matching
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <AddCandidateDialog />
                  </div>
                </div>

                {/* Anonymous Info Badge - Compact */}
                <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Anonymous Mode:</strong> All candidates identified by ID only. No personal information displayed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{applicationStats.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {applicationStats.new > 0 && (
                          <>
                            <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                            {applicationStats.new} new
                          </>
                        )}
                        {applicationStats.new === 0 && 'No new applications'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{applicationStats.interviewed}</div>
                      <p className="text-xs text-muted-foreground">
                        {applicationStats.interviewed > 0 ? 'Candidates interviewed' : 'No interviews yet'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* All Candidates - Organized by Stage */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Candidates by Stage</CardTitle>
                        <CardDescription>View and manage candidates at each hiring stage</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Stage Tabs/Filters */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                      <Button 
                        variant={candidateStageFilter === "All" ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setCandidateStageFilter("All")}
                      >
                        All Candidates
                        <Badge variant="secondary" className="ml-1">{applicationStats.total}</Badge>
                      </Button>
                      <Button 
                        variant={candidateStageFilter === "Applied" ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setCandidateStageFilter("Applied")}
                      >
                        Applied
                        <Badge variant="secondary" className="ml-1">{applicationStats.new}</Badge>
                      </Button>
                      <Button 
                        variant={candidateStageFilter === "Reviewed" ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setCandidateStageFilter("Reviewed")}
                      >
                        Reviewed
                        <Badge variant="secondary" className="ml-1">{applicationStats.reviewing}</Badge>
                      </Button>
                      <Button 
                        variant={candidateStageFilter === "Interviewed" ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setCandidateStageFilter("Interviewed")}
                      >
                        Interviewed
                        <Badge variant="secondary" className="ml-1">{applicationStats.interviewed}</Badge>
                      </Button>
                      <Button 
                        variant={candidateStageFilter === "Offered" ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setCandidateStageFilter("Offered")}
                      >
                        Offered
                        <Badge variant="secondary" className="ml-1">{applicationStats.offers}</Badge>
                      </Button>
                    </div>

                    {/* Candidate List */}
                    <div className="space-y-3">
                      {applications
                        .filter(app => candidateStageFilter === "All" || 
                          (candidateStageFilter === "Applied" && app.status === 'new') ||
                          (candidateStageFilter === "Reviewed" && app.status === 'reviewing') ||
                          (candidateStageFilter === "Interviewed" && (app.status === 'interviewed' || app.status === 'interview-scheduled')) ||
                          (candidateStageFilter === "Offered" && app.status === 'offer')
                        ).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium mb-1">No candidates in this stage</p>
                          <p className="text-sm">
                            {applications.length === 0 
                              ? 'Candidates will appear here once applications are received'
                              : 'Try selecting a different stage filter'}
                          </p>
                        </div>
                      ) : (
                        applications
                          .filter(app => candidateStageFilter === "All" || 
                            (candidateStageFilter === "Applied" && app.status === 'new') ||
                            (candidateStageFilter === "Reviewed" && app.status === 'reviewing') ||
                            (candidateStageFilter === "Interviewed" && (app.status === 'interviewed' || app.status === 'interview-scheduled')) ||
                            (candidateStageFilter === "Offered" && app.status === 'offer')
                          )
                          .map((app) => (
                            <div key={app.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold">{app.anonymousId}</h3>
                                    <Badge variant={
                                      app.status === 'new' ? 'secondary' :
                                      app.status === 'reviewing' ? 'default' :
                                      app.status === 'interviewed' ? 'outline' :
                                      app.status === 'offer' ? 'default' :
                                      'secondary'
                                    }>
                                      {app.status.replace('-', ' ')}
                                    </Badge>
                                    {app.rating && (
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: app.rating }).map((_, i) => (
                                          <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {app.jobTitle} • {app.department}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>
                                      <Calendar className="inline h-3 w-3 mr-1" />
                                      Applied: {new Date(app.appliedDate).toLocaleDateString()}
                                    </span>
                                    {app.isRevealed && (
                                      <Badge variant="outline" className="text-xs">
                                        <Eye className="w-3 h-3 mr-1" />
                                        Revealed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCandidate(app)
                                      setIsCandidateDetailsOpen(true)
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Job Applications System */}
              <TabsContent value="applications">
                <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>External Applications:</strong> Applications from public careers page. Personal info hidden until revealed.
                  </p>
                </div>
                <RecruitmentDashboard />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="employees">
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <AddEmployeeDialog />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">Across {new Set(employees.map(e => e.department)).size} departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
                  <UserPlus className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.onboardingEmployees}</div>
                  <p className="text-xs text-muted-foreground">New hires this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {employees.length > 0 
                      ? `${(employees.reduce((acc, emp) => {
                          const years = new Date().getFullYear() - new Date(emp.hire_date).getFullYear();
                          return acc + years;
                        }, 0) / employees.length).toFixed(1)} yrs`
                      : '0 yrs'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Company average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {employees.length > 0 && stats.avgPerformanceScore > 0 
                      ? `${stats.avgPerformanceScore.toFixed(1)}/5`
                      : 'N/A'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Avg performance score</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>Comprehensive employee information and management</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    {filteredEmployees.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                          onCheckedChange={handleToggleAll}
                        />
                        <span className="text-sm text-muted-foreground">
                          Select All ({selectedEmployees.length} selected)
                        </span>
                      </div>
                    )}
                    {selectedEmployees.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedEmployees.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleToggleEmployee(employee.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{employee.name}</h3>
                          <Badge variant={getStatusVariant(employee.status)}>{employee.status}</Badge>
                          {employee.performance_score && employee.performance_score >= 4.5 && (
                            <Badge variant="outline" className="gap-1 text-yellow-500 border-yellow-500">
                              <Star className="h-3 w-3 fill-yellow-500" />
                              Top Performer
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} • {employee.department}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            <Calendar className="inline h-3 w-3 mr-1" />
                            Next Review: {getDaysUntilReview(employee.next_review_date)}
                          </span>
                          {employee.performance_score && (
                            <span>
                              <Star className="inline h-3 w-3 mr-1" />
                              Score: {employee.performance_score.toFixed(1)}/5.0
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setIsFeedbackDialogOpen(true)
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Feedback
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setIsGoalsDialogOpen(true)
                          }}
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Goals
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setIsProfileDialogOpen(true)
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Review Score</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgPerformanceScore.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">Across all employees</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceReviews.length}</div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviews Overdue</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overdueReviews}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingReviews}</div>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Reviews Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Performance Reviews</CardTitle>
                    <CardDescription>Track and manage employee performance ratings</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceReviews.map((review) => {
                    const overallRating = calculateOverallRating(review)
                    return (
                      <div key={review.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{review.employee?.name || 'Unknown Employee'}</h3>
                              {getReviewStatusBadge(review.status)}
                              {getTrendIcon(review.trend)}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.employee?.department || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getRatingColor(Number(overallRating))}`}>
                              {overallRating}
                            </div>
                            <p className="text-xs text-muted-foreground">Overall Rating</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Collaboration</p>
                            <div className="flex items-center gap-2">
                              <div className={`text-lg font-semibold ${getRatingColor(review.collaboration)}`}>
                                {review.collaboration}
                              </div>
                              <div className="text-xs text-muted-foreground">/5</div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Accountability</p>
                            <div className="flex items-center gap-2">
                              <div className={`text-lg font-semibold ${getRatingColor(review.accountability)}`}>
                                {review.accountability}
                              </div>
                              <div className="text-xs text-muted-foreground">/5</div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Trustworthy</p>
                            <div className="flex items-center gap-2">
                              <div className={`text-lg font-semibold ${getRatingColor(review.trustworthy)}`}>
                                {review.trustworthy}
                              </div>
                              <div className="text-xs text-muted-foreground">/5</div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Leadership</p>
                            <div className="flex items-center gap-2">
                              <div className={`text-lg font-semibold ${getRatingColor(review.leadership)}`}>
                                {review.leadership}
                              </div>
                              <div className="text-xs text-muted-foreground">/5</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span>Review Date: {new Date(review.review_date).toLocaleDateString()}</span>
                          <span>Period: {review.review_period}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review)
                              setIsReviewDetailsOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review)
                              setIsAddReviewDialogOpen(true)
                            }}
                          >
                            Add Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review)
                              setIsReviewHistoryOpen(true)
                            }}
                          >
                            View History
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            {/* Goal Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGoals}</div>
                  <p className="text-xs text-muted-foreground">Active employee goals</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Track</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {onTrackGoals} ({Math.round((onTrackGoals / totalGoals) * 100)}%)
                  </div>
                  <p className="text-xs text-muted-foreground">Progressing well</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Behind</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {behindGoals} ({Math.round((behindGoals / totalGoals) * 100)}%)
                  </div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Complete</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    {completeGoals} ({Math.round((completeGoals / totalGoals) * 100)}%)
                  </div>
                  <p className="text-xs text-muted-foreground">Achieved goals</p>
                </CardContent>
              </Card>
            </div>

            {/* Goals List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Goals</CardTitle>
                    <CardDescription>Track and manage employee goals and progress</CardDescription>
                  </div>
                  <AddGoalDialog />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{goal.goal}</h3>
                            <Badge className={getGoalStatusColor(goal.status)}>
                              {getGoalStatusIcon(goal.status)}
                              <span className="ml-1">{goal.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="font-medium">{goal.employee?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{goal.employee?.department || 'N/A'}</span>
                            <span>•</span>
                            <span className="text-xs bg-accent px-2 py-1 rounded">{goal.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{goal.progress}%</div>
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Due: {new Date(goal.due_date).toLocaleDateString()} ({getDaysUntilDue(goal.due_date)})
                        </span>
                        <span>Created: {new Date(goal.created_date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingGoal(goal.id)
                            setGoalProgress(goal.progress)
                          }}
                        >
                          Update Progress
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedGoal(goal)
                            setGoalComment('')
                            setIsAddCommentOpen(true)
                          }}
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Update Progress Dialog */}
            <Dialog open={editingGoal !== null} onOpenChange={(open) => !open && setEditingGoal(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Goal Progress</DialogTitle>
                  <DialogDescription>
                    {editingGoal && goals.find(g => g.id === editingGoal)?.goal}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="progress">Progress</Label>
                      <span className="text-2xl font-bold text-primary">{goalProgress}%</span>
                    </div>
                    <Slider
                      id="progress"
                      value={[goalProgress]}
                      onValueChange={(value) => setGoalProgress(value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Progress Bar Preview */}
                  <div className="space-y-2">
                    <Label>Progress Preview</Label>
                    <Progress value={goalProgress} className="h-3" />
                  </div>

                  {/* Status Based on Progress */}
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">New Status:</span>
                      {goalProgress === 100 ? (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : goalProgress >= 70 ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          On Track
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Needs Attention
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingGoal(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    if (editingGoal) {
                      hrApi.updateGoal(editingGoal, { progress: goalProgress }).then(() => {
                        loadData()
                        setEditingGoal(null)
                      })
                    }
                  }}>
                    Save Progress
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                      {stats.onboardingEmployees > 0 ? `+${stats.onboardingEmployees} onboarding` : 'Stable headcount'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {employees.filter(e => e.status === 'Inactive').length > 0 
                        ? `${((employees.filter(e => e.status === 'Inactive').length / stats.totalEmployees) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
                      Low turnover rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {employees.length > 0 
                        ? `${(employees.reduce((acc, emp) => {
                            const years = new Date().getFullYear() - new Date(emp.hire_date).getFullYear();
                            return acc + years;
                          }, 0) / employees.length).toFixed(1)} yrs`
                        : '0 yrs'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Average employee tenure</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalGoals > 0 
                        ? `${Math.round((stats.completeGoals / stats.totalGoals) * 100)}%`
                        : '0%'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                      +7% from last quarter
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Diversity & Inclusion Metrics</CardTitle>
                  </div>
                  <CardDescription>Workforce diversity and representation tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Gender Distribution</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Male</span>
                            <span className="text-sm font-medium">-</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Female</span>
                            <span className="text-sm font-medium">-</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Non-Binary</span>
                            <span className="text-sm font-medium">-</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Diversity Scores</h3>
                      <div className="space-y-4">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Hiring Diversity</span>
                            <span className="text-lg font-bold text-muted-foreground">-</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Leadership Diversity</span>
                            <span className="text-lg font-bold text-muted-foreground">-</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recruitment Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Analytics</CardTitle>
                  <CardDescription>Hiring trends and source effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Application Sources */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Application Sources</h3>
                      <div className="space-y-3">
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No application source data available</p>
                          <p className="text-xs mt-1">Data will appear here as applications are received</p>
                        </div>
                      </div>
                    </div>

                    {/* Time to Hire by Department */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Average Time to Hire (Days)</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hiring data available</p>
                        <p className="text-xs mt-1">Time to hire metrics will appear here as positions are filled</p>
                      </div>
                    </div>

                    {/* Offer Acceptance Rate */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Offer Acceptance Rate</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No offer data available</p>
                        <p className="text-xs mt-1">Acceptance rate will appear here as offers are made</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Employee performance trends and department comparisons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Department Performance */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Average Performance Score by Department</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No performance data available</p>
                        <p className="text-xs mt-1">Department performance will appear here as reviews are completed</p>
                      </div>
                    </div>

                    {/* Review Completion Rate */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Review Completion Rate</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No review completion data available</p>
                        <p className="text-xs mt-1">Review completion rates will appear here as reviews are conducted</p>
                      </div>
                    </div>

                    {/* Performance Trends */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Performance Trends</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No performance trend data available</p>
                        <p className="text-xs mt-1">Performance trends will appear here as review data accumulates</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Analytics</CardTitle>
                  <CardDescription>Workforce composition and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Headcount by Department */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Headcount by Department</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {new Set(employees.map(e => e.department)).size > 0 ? (
                          Array.from(new Set(employees.map(e => e.department))).map(dept => {
                            const deptCount = employees.filter(e => e.department === dept).length;
                            const percentage = ((deptCount / employees.length) * 100).toFixed(0);
                            return (
                              <div key={dept} className="p-3 border rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">{dept}</p>
                                <p className="text-2xl font-bold">{deptCount}</p>
                                <p className="text-xs text-muted-foreground">{percentage}%</p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-full text-center py-8 text-muted-foreground">
                            <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No department data available</p>
                            <p className="text-xs mt-1">Department breakdown will appear here as employees are added</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tenure Distribution */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Tenure Distribution</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tenure data available</p>
                        <p className="text-xs mt-1">Tenure distribution will appear here as employees are added</p>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Engagement Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Goal Completion</p>
                          <p className="text-2xl font-bold text-green-500">
                            {stats.totalGoals > 0 ? `${Math.round((stats.completeGoals / stats.totalGoals) * 100)}%` : '0%'}
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Avg Performance</p>
                          <p className="text-2xl font-bold text-green-500">
                            {stats.avgPerformanceScore > 0 ? stats.avgPerformanceScore.toFixed(1) : 'N/A'}
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Learning Paths</p>
                          <p className="text-2xl font-bold">{learningPaths.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="development">
            <div className="space-y-6">
              {/* Career Path Visualization */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    <CardTitle>Career Path Planning</CardTitle>
                  </div>
                  <CardDescription>Employee career progression and development tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {careerPaths.map((path) => (
                      <div key={path.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold mb-1">{path.employee?.name || 'Unknown'}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{path.current_role_name}</span>
                              <ArrowRight className="h-4 w-4" />
                              <span className="font-medium text-foreground">{path.next_role}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{path.time_to_promotion}</Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Promotion Readiness</span>
                            <span className="text-sm font-bold">{path.readiness}%</span>
                          </div>
                          <Progress value={path.readiness} className="h-2" />
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {path.required_skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mentorship Program */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Mentorship Program</CardTitle>
                    </div>
                    <Button onClick={() => setIsCreateMatchOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Match
                    </Button>
                  </div>
                  <CardDescription>Zenith-powered mentor-mentee matching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentorships.map((match) => (
                      <div key={match.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{match.mentor?.name || 'Unknown'}</h4>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-semibold">{match.mentee?.name || 'Unknown'}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Focus: {match.focus}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="gap-1">
                              <Sparkles className="h-3 w-3" />
                              {match.match_score}% match
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Started: {new Date(match.start_date).toLocaleDateString()}</span>
                          <Badge variant="secondary">{match.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning & Development */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle>Learning & Development</CardTitle>
                  </div>
                  <CardDescription>Training programs and skill development tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningPaths.map((learning) => (
                      <div key={learning.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{learning.employee?.name || 'Unknown'}</h4>
                            <p className="text-sm text-muted-foreground">{learning.course}</p>
                          </div>
                          <Badge variant={learning.status === "completed" ? "secondary" : "default"}>
                            {learning.status === "completed" ? (
                              <>
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Completed
                              </>
                            ) : (
                              "In Progress"
                            )}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm font-bold">{learning.progress}%</span>
                          </div>
                          <Progress value={learning.progress} className="h-2" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(learning.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recognition Platform */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <CardTitle>Recognition & Achievements</CardTitle>
                    </div>
                    <Button onClick={() => setIsGiveRecognitionOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Give Recognition
                    </Button>
                  </div>
                  <CardDescription>Peer and manager recognition tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recognitions.map((recognition) => (
                      <div key={recognition.id} className="p-4 border rounded-lg bg-accent/30">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ThumbsUp className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{recognition.from_name}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{recognition.to_name}</span>
                              <Badge variant="outline">{recognition.category}</Badge>
                            </div>
                            <p className="text-sm mb-2">{recognition.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(recognition.recognition_date).toLocaleDateString()} • {recognition.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              {/* Predictive Analytics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Predictive Analytics Dashboard</CardTitle>
                  </div>
                  <CardDescription>Zenith-powered workforce insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold">Retention Risks</h3>
                      </div>
                      <div className="text-3xl font-bold text-yellow-500 mb-1">
                        {employees.filter(e => e.performance_score && e.performance_score < 3).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Employees at risk</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Rocket className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">High Performers</h3>
                      </div>
                      <div className="text-3xl font-bold text-green-500 mb-1">
                        {employees.filter(e => e.performance_score && e.performance_score >= 4.5).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Ready for promotion</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">Skill Gaps</h3>
                      </div>
                      <div className="text-3xl font-bold text-blue-500 mb-1">
                        {learningPaths.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Active learning paths</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Detailed Insights</h3>
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading insights...</div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium mb-1">No insights available</p>
                        <p className="text-sm">Insights will appear here as data is analyzed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 360° Feedback Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>360° Feedback System</CardTitle>
                  </div>
                  <CardDescription>Multi-source performance feedback and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>
                    ) : feedback360.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium mb-1">No 360° feedback available</p>
                        <p className="text-sm">Feedback will appear here once collected</p>
                      </div>
                    ) : (
                      feedback360.map((feedback) => (
                        <div key={feedback.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold mb-1">{feedback.employee?.name || 'Unknown Employee'}</h3>
                              <p className="text-sm text-muted-foreground">{feedback.feedback_count} feedback responses</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-500">{feedback.overall_score?.toFixed(2) || 'N/A'}</div>
                              <p className="text-xs text-muted-foreground">Overall Score</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Self Rating</p>
                              <p className="text-lg font-bold">{feedback.self_rating?.toFixed(1) || 'N/A'}</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Manager</p>
                              <p className="text-lg font-bold">{feedback.manager_rating?.toFixed(1) || 'N/A'}</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Peers</p>
                              <p className="text-lg font-bold">{feedback.peer_rating?.toFixed(1) || 'N/A'}</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Direct Reports</p>
                              <p className="text-lg font-bold">{feedback.direct_report_rating?.toFixed(1) || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Request Feedback
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Workforce Planning */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle>Workforce Planning & Forecasting</CardTitle>
                  </div>
                  <CardDescription>Headcount forecasting and resource planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Hiring Forecast (Next 6 Months)</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hiring forecast available</p>
                        <p className="text-xs mt-1">Hiring forecasts will appear here as workforce planning data is available</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Predicted Attrition Risk</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No attrition risk data available</p>
                        <p className="text-xs mt-1">Attrition predictions will appear here as employee data accumulates</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Employee Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-6">
            <DialogHeader className="pb-4 border-b flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-2xl mb-2 truncate">{selectedEmployee?.name}</DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedEmployee && <Badge variant={getStatusVariant(selectedEmployee.status)}>{selectedEmployee.status}</Badge>}
                    {selectedEmployee && selectedEmployee.performanceScore && selectedEmployee.performanceScore >= 4.5 && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
                        <Star className="h-4 w-4 fill-yellow-500 mr-1" />
                        Top Performer
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button className="mx-0 my-3.5 bg-transparent" variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button className="my-3.5 bg-transparent" variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button className="my-3.5" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {selectedEmployee && (
              <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col mt-2">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 flex-shrink-0 mb-2">
                  <TabsTrigger
                    value="overview"
                    className="border-b-2 border-transparent data-[state=active]:border-primary text-base rounded-lg px-4"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="performance"
                    className="border-b-2 border-transparent data-[state=active]:border-primary text-base rounded-lg px-4"
                  >
                    Performance
                  </TabsTrigger>
                  <TabsTrigger
                    value="goals"
                    className="border-b-2 border-transparent data-[state=active]:border-primary text-base rounded-lg px-4"
                  >
                    Goals
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="border-b-2 border-transparent data-[state=active]:border-primary text-base rounded-lg px-4"
                  >
                    History
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 px-1">

                  <TabsContent value="overview" className="mt-0 space-y-5">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="min-w-0">
                        <CardContent className="pt-5 pb-5 text-center px-3">
                          <div className="text-2xl font-bold mb-1">
                            {selectedEmployee.performanceScore ? `${selectedEmployee.performanceScore}/5.0` : 'N/A'}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-nowrap">Performance</p>
                        </CardContent>
                      </Card>
                      <Card className="min-w-0">
                        <CardContent className="pt-5 pb-5 text-center px-3">
                          <div className="text-2xl font-bold mb-1">
                            {goals.filter(g => g.employee_id === selectedEmployee.id && g.status === 'Complete').length}/
                            {goals.filter(g => g.employee_id === selectedEmployee.id).length}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-nowrap">Goals</p>
                        </CardContent>
                      </Card>
                      <Card className="min-w-0">
                        <CardContent className="pt-5 pb-5 text-center px-3">
                          <div className="text-2xl font-bold mb-1 whitespace-nowrap">-</div>
                          <p className="text-sm text-muted-foreground whitespace-nowrap">Tenure</p>
                        </CardContent>
                      </Card>
                      <Card className="min-w-0">
                        <CardContent className="pt-5 pb-5 text-center px-3">
                          <div className="text-xl font-bold mb-1">{getDaysUntilReview(selectedEmployee.next_review_date)}</div>
                          <p className="text-sm text-muted-foreground whitespace-nowrap">Next Review</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Employee Details */}
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Employee Information</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                          <div className="flex items-start gap-3 min-w-0">
                            <Building className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Department</p>
                              <p className="text-base font-medium break-words">{selectedEmployee.department}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 min-w-0">
                            <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Position</p>
                              <p className="text-base font-medium break-words">{selectedEmployee.position}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                              <p className="text-base font-medium">EMP-{selectedEmployee.id.toString().padStart(4, '0')}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 min-w-0">
                            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Employment Type</p>
                              <p className="text-base font-medium">Full-time</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 min-w-0">
                            <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Manager</p>
                              <p className="text-base font-medium break-words">{selectedEmployee.manager?.name || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 min-w-0">
                            <Building className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Location</p>
                              <p className="text-base font-medium break-words">-</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                          <div className="flex items-start gap-3 min-w-0">
                            <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Email</p>
                              <p className="text-base font-medium break-all">{selectedEmployee.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 min-w-0">
                            <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Phone</p>
                              <p className="text-base font-medium">{selectedEmployee.phone || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Performance Reviews</CardTitle>
                        <p className="text-sm text-muted-foreground">Historical performance data</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {performanceReviews
                          .filter(review => review.employee_id === selectedEmployee.id)
                          .length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No performance reviews yet</p>
                          </div>
                        ) : (
                          performanceReviews
                            .filter(review => review.employee_id === selectedEmployee.id)
                            .map((review) => (
                              <div key={review.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <p className="text-base font-medium">Review Period: {review.review_period}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(review.review_date).toLocaleDateString()}</p>
                                  </div>
                                  <Badge variant={review.status === 'on-time' ? 'default' : 'secondary'} className="text-sm flex-shrink-0">
                                    {review.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Collaboration</p>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: review.collaboration }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Accountability</p>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: review.accountability }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Leadership</p>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: review.leadership }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Trustworthy</p>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: review.trustworthy }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="goals" className="mt-0 space-y-4">
                    {goals
                      .filter(goal => goal.employee_id === selectedEmployee.id)
                      .length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No goals assigned yet</p>
                      </div>
                    ) : (
                      goals
                        .filter(goal => goal.employee_id === selectedEmployee.id)
                        .map((goal) => (
                          <Card key={goal.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base truncate">{goal.goal}</CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1 truncate">{goal.category}</p>
                                </div>
                                <Badge 
                                  variant="outline"
                                  className={`flex-shrink-0 text-sm ${
                                    goal.status === 'On Track' ? 'border-green-500 text-green-600 bg-green-500/10' :
                                    goal.status === 'Complete' ? 'border-blue-500 text-blue-600 bg-blue-500/10' :
                                    goal.status === 'Behind' ? 'border-red-500 text-red-600 bg-red-500/10' :
                                    ''
                                  }`}
                                >
                                  {goal.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium text-base">{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                                <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
                                  <span className="truncate">Due: {new Date(goal.due_date).toLocaleDateString()}</span>
                                  <span className="truncate">Created: {new Date(goal.created_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Review History</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-base">
                          <span className="text-muted-foreground">Last Review</span>
                          <span className="font-medium">{selectedEmployee.last_review_date ? new Date(selectedEmployee.last_review_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-muted-foreground">Next Review</span>
                          <span className="font-medium">{selectedEmployee.next_review_date ? new Date(selectedEmployee.next_review_date).toLocaleDateString() : 'Not scheduled'}</span>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-muted-foreground">Review Cycle</span>
                          <span className="font-medium">Quarterly</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Employee Feedback Dialog */}
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Give Feedback</DialogTitle>
              <DialogDescription>
                Provide feedback for {selectedEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback-type">Feedback Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recognition">Recognition</SelectItem>
                      <SelectItem value="improvement">Area for Improvement</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feedback-message">Feedback Message</Label>
                  <Textarea 
                    id="feedback-message"
                    placeholder="Write your feedback here..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Visibility</Label>
                  <Select defaultValue="manager">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Visible to Employee</SelectItem>
                      <SelectItem value="manager">Manager Only</SelectItem>
                      <SelectItem value="hr">HR Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    alert("Feedback submitted successfully!")
                    setIsFeedbackDialogOpen(false)
                  }}>
                    Submit Feedback
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Employee Goals Dialog */}
        <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto border-4">
            <DialogHeader>
              <DialogTitle>Employee Goals</DialogTitle>
              <DialogDescription>
                View and manage goals for {selectedEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                {goals
                  .filter(goal => goal.employee_id === selectedEmployee.id)
                  .length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No goals assigned yet</p>
                  </div>
                ) : (
                  goals
                    .filter(goal => goal.employee_id === selectedEmployee.id)
                    .map((goal) => (
                      <Card key={goal.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{goal.goal}</CardTitle>
                              <CardDescription className="mt-1">{goal.employee?.department || 'N/A'} • {goal.category}</CardDescription>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={
                                goal.status === 'On Track' ? 'border-green-500 text-green-600 bg-green-500/10' :
                                goal.status === 'Complete' ? 'border-blue-500 text-blue-600 bg-blue-500/10' :
                                goal.status === 'Behind' ? 'border-red-500 text-red-600 bg-red-500/10' :
                                ''
                              }
                            >
                              {goal.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                              <span>
                                <Calendar className="inline h-3 w-3 mr-1" />
                                Due: {new Date(goal.due_date).toLocaleDateString()}
                              </span>
                              <span className="capitalize">{goal.category}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={() => setIsGoalsDialogOpen(false)}>Close</Button>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Goal
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Details Dialog */}
        <Dialog open={isReviewDetailsOpen} onOpenChange={setIsReviewDetailsOpen}>
          <DialogContent className="max-w-3x1 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Performance Review Details</DialogTitle>
              <DialogDescription>
                Detailed performance review for {selectedReview?.employee?.name || 'Unknown Employee'}
              </DialogDescription>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-6">
                {/* Employee Info */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedReview.employee?.name || 'Unknown Employee'}</h3>
                        <p className="text-sm text-muted-foreground">{selectedReview.employee?.department || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getRatingColor(Number(calculateOverallRating(selectedReview)))}`}>
                          {calculateOverallRating(selectedReview)}
                        </div>
                        <p className="text-xs text-muted-foreground">Overall Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Ratings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Collaboration</p>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${getRatingColor(selectedReview.collaboration)}`}>
                            {selectedReview.collaboration}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < selectedReview.collaboration ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Accountability</p>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${getRatingColor(selectedReview.accountability)}`}>
                            {selectedReview.accountability}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < selectedReview.accountability ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Trustworthy</p>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${getRatingColor(selectedReview.trustworthy)}`}>
                            {selectedReview.trustworthy}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < selectedReview.trustworthy ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Leadership</p>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${getRatingColor(selectedReview.leadership)}`}>
                            {selectedReview.leadership}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < selectedReview.leadership ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Review Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Latest Review</span>
                      <span className="text-sm font-medium">{new Date(selectedReview.review_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Review Period</span>
                      <span className="text-sm font-medium">{selectedReview.review_period}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getReviewStatusBadge(selectedReview.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trend</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(selectedReview.trend)}
                        <span className="text-sm capitalize">{selectedReview.trend}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDetailsOpen(false)}>Close</Button>
              <Button onClick={() => {
                setIsReviewDetailsOpen(false)
                setIsAddReviewDialogOpen(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Review Dialog */}
        <Dialog open={isAddReviewDialogOpen} onOpenChange={setIsAddReviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Performance Review</DialogTitle>
              <DialogDescription>
                Create a new performance review for {selectedReview?.employee?.name || selectedEmployee?.name || 'Employee'}
              </DialogDescription>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-6">
                {/* Review Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="review-period">Review Period</Label>
                    <Select defaultValue="q4-2024">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="q4-2024">Q4 2024</SelectItem>
                        <SelectItem value="q1-2025">Q1 2025</SelectItem>
                        <SelectItem value="annual-2024">Annual 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="review-type">Review Type</Label>
                    <Select defaultValue="quarterly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        <SelectItem value="annual">Annual Review</SelectItem>
                        <SelectItem value="probation">Probation Review</SelectItem>
                        <SelectItem value="promotion">Promotion Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Performance Ratings */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Ratings (1-5)</h3>
                  
                  <div>
                    <Label htmlFor="collaboration">Collaboration</Label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Exceptional</SelectItem>
                        <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                        <SelectItem value="3">3 - Meets Expectations</SelectItem>
                        <SelectItem value="2">2 - Needs Improvement</SelectItem>
                        <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accountability">Accountability</Label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Exceptional</SelectItem>
                        <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                        <SelectItem value="3">3 - Meets Expectations</SelectItem>
                        <SelectItem value="2">2 - Needs Improvement</SelectItem>
                        <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="trustworthy">Trustworthy</Label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Exceptional</SelectItem>
                        <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                        <SelectItem value="3">3 - Meets Expectations</SelectItem>
                        <SelectItem value="2">2 - Needs Improvement</SelectItem>
                        <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="leadership">Leadership</Label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Exceptional</SelectItem>
                        <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                        <SelectItem value="3">3 - Meets Expectations</SelectItem>
                        <SelectItem value="2">2 - Needs Improvement</SelectItem>
                        <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <Label htmlFor="strengths">Strengths & Achievements</Label>
                  <Textarea 
                    id="strengths"
                    placeholder="Highlight key strengths and notable achievements during this period..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="improvements">Areas for Improvement</Label>
                  <Textarea 
                    id="improvements"
                    placeholder="Identify areas where the employee can improve and grow..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="goals">Goals for Next Period</Label>
                  <Textarea 
                    id="goals"
                    placeholder="Set clear, actionable goals for the next review period..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddReviewDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                alert("Performance review submitted successfully!")
                setIsAddReviewDialogOpen(false)
              }}>
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review History Dialog */}
        <Dialog open={isReviewHistoryOpen} onOpenChange={setIsReviewHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review History</DialogTitle>
              <DialogDescription>
                Complete performance review history for {selectedReview?.employee?.name || 'Employee'}
              </DialogDescription>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                {/* Historical reviews */}
                {performanceReviews
                  .filter(review => review.employee_id === selectedReview.employee_id)
                  .length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No historical reviews available</p>
                  </div>
                ) : (
                  performanceReviews
                    .filter(review => review.employee_id === selectedReview.employee_id)
                    .map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold">{review.review_period}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(review.review_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getRatingColor(Number(review.overall_rating))}`}>
                                {review.overall_rating?.toFixed(1)}
                              </div>
                              <p className="text-xs text-muted-foreground">Overall</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-3 border rounded-lg">
                              <div className={`text-xl font-bold ${getRatingColor(review.collaboration)}`}>
                                {review.collaboration}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Collaboration</p>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className={`text-xl font-bold ${getRatingColor(review.accountability)}`}>
                                {review.accountability}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Accountability</p>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className={`text-xl font-bold ${getRatingColor(review.trustworthy)}`}>
                                {review.trustworthy}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Trustworthy</p>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className={`text-xl font-bold ${getRatingColor(review.leadership)}`}>
                                {review.leadership}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Leadership</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setIsReviewHistoryOpen(false)
                                setIsReviewDetailsOpen(true)
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Full Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewHistoryOpen(false)}>Close</Button>
              <Button onClick={() => {
                setIsReviewHistoryOpen(false)
                setIsAddReviewDialogOpen(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Goal Details Dialog */}
        <Dialog open={isGoalDetailsOpen} onOpenChange={setIsGoalDetailsOpen}>
          <DialogContent className="w-[96vw] max-w-none max-h-[95vh] overflow-y-auto overflow-x-hidden p-8">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl">Goal Details</DialogTitle>
              <DialogDescription>
                Detailed information and progress tracking for this goal
              </DialogDescription>
            </DialogHeader>
            {selectedGoal && (
              <div className="space-y-6 overflow-x-hidden">
                {/* Goal Header */}
                <Card className="border-2 min-w-0">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between gap-6 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold mb-3 break-words">{selectedGoal.goal}</h3>
                        <div className="flex items-center gap-4 text-base text-muted-foreground flex-wrap">
                          <span className="font-medium">{selectedGoal.employee?.name || 'Unknown Employee'}</span>
                          <span>•</span>
                          <span>{selectedGoal.employee?.department || 'N/A'}</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-sm">{selectedGoal.category}</Badge>
                        </div>
                      </div>
                      <Badge className={getGoalStatusColor(selectedGoal.status) + " text-base px-4 py-2 flex-shrink-0"}>
                        {getGoalStatusIcon(selectedGoal.status)}
                        <span className="ml-2 whitespace-nowrap">{selectedGoal.status}</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-6 min-w-0 overflow-hidden">
                  {/* Left Column */}
                  <div className="space-y-6 min-w-0">
                    {/* Progress Card */}
                    <Card className="min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <span className="text-base text-muted-foreground whitespace-nowrap">Current Progress</span>
                          <span className="text-5xl font-bold">{selectedGoal.progress}%</span>
                        </div>
                        <Progress value={selectedGoal.progress} className="h-4" />
                        <div className="grid grid-cols-2 gap-4 pt-3 min-w-0">
                          <div className="p-4 border rounded-lg min-w-0">
                            <p className="text-sm text-muted-foreground mb-2">Created</p>
                            <p className="text-base font-medium break-words">{new Date(selectedGoal.created_date).toLocaleDateString()}</p>
                          </div>
                          <div className="p-4 border rounded-lg min-w-0">
                            <p className="text-sm text-muted-foreground mb-2">Due Date</p>
                            <p className="text-base font-medium break-words">{new Date(selectedGoal.due_date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground mt-1 break-words">{getDaysUntilDue(selectedGoal.due_date)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Goal Timeline */}
                    <Card className="min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">Timeline & Milestones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-5">
                          {/* Timeline */}
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base break-words">Goal Created</h4>
                              <p className="text-base text-muted-foreground break-words">{new Date(selectedGoal.created_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Timeline milestones will appear here as progress is tracked
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="min-w-0">
                    {/* Comments Section */}
                    <Card className="h-full min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">Comments & Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Comments */}
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No comments yet</p>
                            <p className="text-xs mt-1">Comments will appear here as progress is tracked</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="default" 
                            className="w-full mt-4"
                            onClick={() => {
                              setIsGoalDetailsOpen(false)
                              setIsAddCommentOpen(true)
                            }}
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Comment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-3">
              <Button variant="outline" size="lg" onClick={() => setIsGoalDetailsOpen(false)}>Close</Button>
              <Button size="lg" onClick={() => {
                setIsGoalDetailsOpen(false)
                setEditingGoal(selectedGoal.id)
                setGoalProgress(selectedGoal.progress)
              }}>
                <Target className="mr-2 h-5 w-5" />
                Update Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Comment Dialog */}
        <Dialog open={isAddCommentOpen} onOpenChange={setIsAddCommentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Add a comment or note about this goal
              </DialogDescription>
            </DialogHeader>
            {selectedGoal && (
              <div className="space-y-4">
                {/* Goal Summary */}
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-1">{selectedGoal.goal}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedGoal.employeeName}</span>
                      <span>•</span>
                      <Badge className={getGoalStatusColor(selectedGoal.status)} variant="outline">
                        {selectedGoal.status}
                      </Badge>
                      <span>•</span>
                      <span>{selectedGoal.progress}% complete</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Comment Input */}
                <div>
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea 
                    id="comment"
                    placeholder="Add your comment or notes here..."
                    rows={6}
                    value={goalComment}
                    onChange={(e) => setGoalComment(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This comment will be visible to the employee and their manager.
                  </p>
                </div>

                {/* Comment Type */}
                <div>
                  <Label htmlFor="comment-type">Comment Type</Label>
                  <Select defaultValue="general">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Update</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="milestone">Milestone Achieved</SelectItem>
                      <SelectItem value="concern">Concern/Blocker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddCommentOpen(false)
                setGoalComment('')
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (goalComment.trim()) {
                    alert("Comment added successfully!")
                    setIsAddCommentOpen(false)
                    setGoalComment('')
                  } else {
                    alert("Please enter a comment before submitting.")
                  }
                }}
                disabled={!goalComment.trim()}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Mentorship Match Dialog */}
        <Dialog open={isCreateMatchOpen} onOpenChange={setIsCreateMatchOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Mentorship Match</DialogTitle>
              <DialogDescription>
                Use Zenith AI to find the best mentor-mentee matches
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mentor">Select Mentor</Label>
                <Select>
                  <SelectTrigger id="mentor">
                    <SelectValue placeholder="Choose mentor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>No employees available</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mentee">Select Mentee</Label>
                <Select>
                  <SelectTrigger id="mentee">
                    <SelectValue placeholder="Choose mentee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>No employees available</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="focus-area">Focus Area</Label>
                <Select>
                  <SelectTrigger id="focus-area">
                    <SelectValue placeholder="Select focus area..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Skills</SelectItem>
                    <SelectItem value="leadership">Leadership Development</SelectItem>
                    <SelectItem value="communication">Communication Skills</SelectItem>
                    <SelectItem value="career">Career Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateMatchOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert("Mentorship match created successfully!")
                setIsCreateMatchOpen(false)
              }}>
                Create Match
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Give Recognition Dialog */}
        <Dialog open={isGiveRecognitionOpen} onOpenChange={setIsGiveRecognitionOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Give Recognition</DialogTitle>
              <DialogDescription>
                Recognize team members for their contributions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Select>
                  <SelectTrigger id="from">
                    <SelectValue placeholder="Select your name..." />
                  </SelectTrigger>
                  <SelectContent>
                    {csmUsers.length === 0 ? (
                      <SelectItem value="none" disabled>No users available</SelectItem>
                    ) : (
                      csmUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Select>
                  <SelectTrigger id="to">
                    <SelectValue placeholder="Select recipient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>No employees available</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recognition-type">Recognition Type</Label>
                <Select>
                  <SelectTrigger id="recognition-type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peer">Peer Recognition</SelectItem>
                    <SelectItem value="manager">Manager Recognition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="excellence">Excellence</SelectItem>
                    <SelectItem value="teamwork">Teamwork</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="dedication">Dedication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Recognition Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write a meaningful recognition message..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="p-4 border rounded-lg bg-accent/30">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                  <p className="text-sm">
                    Recognition will be visible to the recipient and their manager
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGiveRecognitionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert("Recognition sent successfully!")
                setIsGiveRecognitionOpen(false)
              }}>
                <Award className="mr-2 h-4 w-4" />
                Send Recognition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Interview Dialog */}
        <Dialog open={isScheduleInterviewOpen} onOpenChange={(open) => {
          setIsScheduleInterviewOpen(open)
          if (!open) {
            // Reset form when closing
            setInterviewCandidate('')
            setInterviewDate('')
            setInterviewTime('')
            setInterviewType('')
            setInterviewNotes('')
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Schedule an interview with a candidate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div>
                <Label htmlFor="candidate">Select Candidate</Label>
                <Select value={interviewCandidate} onValueChange={setInterviewCandidate}>
                  <SelectTrigger id="candidate">
                    <SelectValue placeholder="Choose candidate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.length === 0 ? (
                      <SelectItem value="none" disabled>No candidates available</SelectItem>
                    ) : (
                      applications.map((app) => (
                        <SelectItem key={app.id} value={app.id || ''}>
                          {app.anonymousId} - {app.jobTitle}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interview-type">Interview Type</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger id="interview-type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Screen</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="final">Final Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interview-date">Date</Label>
                  <Input 
                    id="interview-date" 
                    type="date" 
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="interview-time">Time</Label>
                  <Input 
                    id="interview-time" 
                    type="time" 
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="interview-notes">Notes</Label>
                <Textarea
                  id="interview-notes"
                  placeholder="Add interview type, interviewer name, and any special instructions..."
                  rows={3}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleInterviewOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!interviewCandidate || !interviewDate) {
                    alert("Please select a candidate and date")
                    return
                  }
                  
                  try {
                    // Combine notes with interview details
                    const fullNotes = `Interview Type: ${interviewType || 'Not specified'}\nTime: ${interviewTime || 'Not specified'}\n\n${interviewNotes}`
                    
                    const success = await scheduleInterview(interviewCandidate, interviewDate, fullNotes)
                    
                    if (success) {
                      alert("Interview scheduled successfully!")
                      await loadData() // Refresh the data
                      setIsScheduleInterviewOpen(false)
                    } else {
                      alert("Failed to schedule interview. Please try again.")
                    }
                  } catch (error) {
                    console.error('Error scheduling interview:', error)
                    alert("An error occurred. Please try again.")
                  }
                }}
                disabled={!interviewCandidate || !interviewDate}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send 360° Feedback Dialog */}
        <Dialog open={isSend360FeedbackOpen} onOpenChange={setIsSend360FeedbackOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send 360° Feedback Request</DialogTitle>
              <DialogDescription>
                Request comprehensive feedback from multiple sources
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div>
                <Label htmlFor="feedback-subject">Feedback Subject</Label>
                <Select>
                  <SelectTrigger id="feedback-subject">
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>No employees available</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Feedback Providers</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="manager" className="rounded" />
                    <Label htmlFor="manager">Manager</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="peers" className="rounded" />
                    <Label htmlFor="peers">Peers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="direct-reports" className="rounded" />
                    <Label htmlFor="direct-reports">Direct Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="self" className="rounded" />
                    <Label htmlFor="self">Self Assessment</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="feedback-deadline">Deadline</Label>
                <Input id="feedback-deadline" type="date" />
              </div>
              <div>
                <Label htmlFor="feedback-instructions">Instructions</Label>
                <Textarea
                  id="feedback-instructions"
                  placeholder="Provide instructions or context for feedback providers..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSend360FeedbackOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert("360° feedback request sent successfully!")
                setIsSend360FeedbackOpen(false)
              }}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Time Off Dialog */}
        <Dialog open={isApproveTimeOffOpen} onOpenChange={setIsApproveTimeOffOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Approve Time Off Request</DialogTitle>
              <DialogDescription>
                Review and approve pending time off requests
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Engineering</p>
                  </div>
                  <Badge>Pending</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">Vacation</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">5 days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">Jan 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">Jan 19, 2025</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm">Family vacation to Hawaii</p>
                </div>
              </div>
              <div>
                <Label htmlFor="approval-notes">Manager Notes (Optional)</Label>
                <Textarea
                  id="approval-notes"
                  placeholder="Add any notes about this approval..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveTimeOffOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                alert("Time off request denied")
                setIsApproveTimeOffOpen(false)
              }}>
                Deny
              </Button>
              <Button onClick={() => {
                alert("Time off request approved successfully!")
                setIsApproveTimeOffOpen(false)
              }}>
                <FileCheck className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Training Dialog */}
        <Dialog open={isAssignTrainingOpen} onOpenChange={setIsAssignTrainingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Training</DialogTitle>
              <DialogDescription>
                Assign training courses to employees
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div>
                <Label htmlFor="training-employee">Select Employee</Label>
                <Select>
                  <SelectTrigger id="training-employee">
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>No employees available</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="training-course">Select Training Course</Label>
                <Select>
                  <SelectTrigger id="training-course">
                    <SelectValue placeholder="Choose course..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course1">Advanced React Development</SelectItem>
                    <SelectItem value="course2">Leadership Fundamentals</SelectItem>
                    <SelectItem value="course3">Product Management 101</SelectItem>
                    <SelectItem value="course4">Data Analytics with Python</SelectItem>
                    <SelectItem value="course5">Communication Skills</SelectItem>
                    <SelectItem value="course6">Agile Methodology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="training-priority">Priority</Label>
                <Select>
                  <SelectTrigger id="training-priority">
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Required</SelectItem>
                    <SelectItem value="medium">Medium - Recommended</SelectItem>
                    <SelectItem value="low">Low - Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="training-deadline">Completion Deadline</Label>
                <Input id="training-deadline" type="date" />
              </div>
              <div>
                <Label htmlFor="training-notes">Notes for Employee</Label>
                <Textarea
                  id="training-notes"
                  placeholder="Add any context or instructions for this training assignment..."
                  rows={3}
                />
              </div>
              <div className="p-4 border rounded-lg bg-accent/30">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <p className="text-sm">
                    Employee will receive email notification and calendar invite
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignTrainingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert("Training assigned successfully!")
                setIsAssignTrainingOpen(false)
              }}>
                <BookOpen className="mr-2 h-4 w-4" />
                Assign Training
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Employees?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedEmployees.length} employee(s)? This action cannot be undone and will permanently remove their records from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Candidate Details Dialog */}
        <Dialog open={isCandidateDetailsOpen} onOpenChange={setIsCandidateDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Status</DialogTitle>
              <DialogDescription>
                {selectedCandidate?.anonymousId} - {selectedCandidate?.jobTitle}
              </DialogDescription>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant={
                      selectedCandidate.status === 'new' ? 'secondary' :
                      selectedCandidate.status === 'reviewing' ? 'default' :
                      selectedCandidate.status === 'interviewed' || selectedCandidate.status === 'interview-scheduled' ? 'outline' :
                      selectedCandidate.status === 'offer' ? 'default' :
                      'secondary'
                    }
                    className="text-base px-3 py-1"
                  >
                    {selectedCandidate.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Anonymous ID</Label>
                    <p className="text-base font-medium mt-1">{selectedCandidate.anonymousId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Position Applied</Label>
                    <p className="text-base font-medium mt-1">{selectedCandidate.jobTitle}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Department</Label>
                    <p className="text-base font-medium mt-1">{selectedCandidate.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Applied Date</Label>
                    <p className="text-base font-medium mt-1">
                      {new Date(selectedCandidate.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedCandidate.interviewDate && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Interview Date</Label>
                      <p className="text-base font-medium mt-1">
                        {new Date(selectedCandidate.interviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedCandidate.rating && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Rating</Label>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: selectedCandidate.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCandidateDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
