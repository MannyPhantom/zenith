import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Briefcase,
  Users,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Edit,
  UserPlus,
  Plus,
  ChevronRight,
  BarChart3,
  FileText,
  Settings,
  Trash2,
} from "lucide-react"

export default function WorkforcePage() {
  const [activePortal, setActivePortal] = useState<"admin" | "technician">("admin")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [technicianTab, setTechnicianTab] = useState("today")
  
  // State management for calendar and jobs
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewingCalendarJob, setViewingCalendarJob] = useState<any>(null)
  const [editingCalendarJob, setEditingCalendarJob] = useState<any>(null)
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [editingJob, setEditingJob] = useState<string | null>(null)
  const [viewingJobLocation, setViewingJobLocation] = useState<string | null>(null)
  
  // Edit form state for jobs
  const [editJobTitle, setEditJobTitle] = useState("")
  const [editJobTechnician, setEditJobTechnician] = useState("")
  const [editJobStartDate, setEditJobStartDate] = useState("")
  const [editJobEndDate, setEditJobEndDate] = useState("")
  const [editJobStatus, setEditJobStatus] = useState("")
  const [editJobLocation, setEditJobLocation] = useState("")
  const [editJobNotes, setEditJobNotes] = useState("")

  // Create job form state
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobDescription, setNewJobDescription] = useState("")
  const [newJobTechnician, setNewJobTechnician] = useState("")
  const [newJobStartDate, setNewJobStartDate] = useState("")
  const [newJobEndDate, setNewJobEndDate] = useState("")
  const [newJobStatus, setNewJobStatus] = useState("Assigned")

  // Create technician form state
  const [isAddTechnicianOpen, setIsAddTechnicianOpen] = useState(false)
  const [newTechName, setNewTechName] = useState("")
  const [newTechPhone, setNewTechPhone] = useState("")
  const [newTechEmail, setNewTechEmail] = useState("")

  // Edit technician form state
  const [editingTechnicianIndex, setEditingTechnicianIndex] = useState<number | null>(null)
  const [editTechName, setEditTechName] = useState("")
  const [editTechPhone, setEditTechPhone] = useState("")
  const [editTechEmail, setEditTechEmail] = useState("")
  const [editTechStatus, setEditTechStatus] = useState("")

  // Selection state for technicians
  const [selectedTechnicianIndices, setSelectedTechnicianIndices] = useState<number[]>([])

  // Timesheet state
  interface TimesheetEntry {
    id: string
    technician: string
    date: string
    jobId: string
    jobTitle: string
    clockIn: string
    clockOut: string
    hours: number
    status: string
    notes: string
  }

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([
    {
      id: "#TS001",
      technician: "John Smith",
      date: "Jan 22, 2025",
      jobId: "#101",
      jobTitle: "HVAC Repair",
      clockIn: "08:00 AM",
      clockOut: "04:30 PM",
      hours: 8.5,
      status: "Approved",
      notes: "Completed installation"
    },
    {
      id: "#TS002",
      technician: "Sarah Johnson",
      date: "Jan 22, 2025",
      jobId: "#102",
      jobTitle: "Electrical Work",
      clockIn: "09:00 AM",
      clockOut: "05:00 PM",
      hours: 8,
      status: "Pending",
      notes: ""
    },
    {
      id: "#TS003",
      technician: "Mike Davis",
      date: "Jan 22, 2025",
      jobId: "#103",
      jobTitle: "Plumbing Fix",
      clockIn: "07:30 AM",
      clockOut: "",
      hours: 0,
      status: "Active",
      notes: ""
    },
  ])

  const [isAddTimesheetOpen, setIsAddTimesheetOpen] = useState(false)
  const [newTimesheetTechnician, setNewTimesheetTechnician] = useState("")
  const [newTimesheetJob, setNewTimesheetJob] = useState("")
  const [newTimesheetDate, setNewTimesheetDate] = useState("")
  const [newTimesheetClockIn, setNewTimesheetClockIn] = useState("")
  const [newTimesheetClockOut, setNewTimesheetClockOut] = useState("")
  const [newTimesheetNotes, setNewTimesheetNotes] = useState("")

  const [editingTimesheetId, setEditingTimesheetId] = useState<string | null>(null)
  const [editTimesheetTechnician, setEditTimesheetTechnician] = useState("")
  const [editTimesheetJob, setEditTimesheetJob] = useState("")
  const [editTimesheetDate, setEditTimesheetDate] = useState("")
  const [editTimesheetClockIn, setEditTimesheetClockIn] = useState("")
  const [editTimesheetClockOut, setEditTimesheetClockOut] = useState("")
  const [editTimesheetStatus, setEditTimesheetStatus] = useState("")
  const [editTimesheetNotes, setEditTimesheetNotes] = useState("")

  const [selectedTimesheetIds, setSelectedTimesheetIds] = useState<string[]>([])

  // Technician portal state
  const [viewingTechJobDetails, setViewingTechJobDetails] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Sample data
  const [jobs, setJobs] = useState([
    {
      id: "#101",
      title: "HVAC Repair",
      technician: "John Smith",
      startDate: "Jan 15, 2025",
      endDate: "Jan 15, 2025",
      status: "In Progress",
    },
    {
      id: "#102",
      title: "Plumbing Check",
      technician: "Sarah Johnson",
      startDate: "Jan 16, 2025",
      endDate: "Jan 16, 2025",
      status: "Assigned",
    },
    {
      id: "#103",
      title: "Electrical Install",
      technician: "Mike Davis",
      startDate: "Jan 17, 2025",
      endDate: "Jan 17, 2025",
      status: "Completed",
    },
    {
      id: "#104",
      title: "Roof Inspection",
      technician: "John Smith",
      startDate: "Jan 18, 2025",
      endDate: "Jan 18, 2025",
      status: "Assigned",
    },
    {
      id: "#105",
      title: "Paint Job",
      technician: "Sarah Johnson",
      startDate: "Jan 19, 2025",
      endDate: "Jan 19, 2025",
      status: "Overdue",
    },
  ])

  const [technicians, setTechnicians] = useState([
    { name: "John Smith", phone: "(555) 123-4567", activeJobs: 2, status: "Active" },
    { name: "Sarah Johnson", phone: "(555) 234-5678", activeJobs: 2, status: "Active" },
    { name: "Mike Davis", phone: "(555) 345-6789", activeJobs: 1, status: "Active" },
  ])

  const recentActivity = [
    "Job #103 completed by Mike Davis",
    "New job #104 assigned to John Smith",
    "Sarah Johnson started job #102",
    "Technician login: Mike Davis at 8:30 AM",
  ]

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return jobs.filter(job => {
      const jobStartDate = job.startDate
      return jobStartDate === dateStr
    })
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // Job selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobIds(jobs.map(job => job.id))
    } else {
      setSelectedJobIds([])
    }
  }

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds([...selectedJobIds, jobId])
    } else {
      setSelectedJobIds(selectedJobIds.filter(id => id !== jobId))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedJobIds.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedJobIds.length} job(s)?`)) {
      const updatedJobs = jobs.filter(j => !selectedJobIds.includes(j.id))
      setJobs(updatedJobs)
      setSelectedJobIds([])
    }
  }

  // Job management handlers
  const handleSaveCalendarJob = () => {
    if (!editingCalendarJob) return

    const updatedJobs = jobs.map(job => {
      if (job.id === editingCalendarJob.id) {
        return {
          ...job,
          title: editJobTitle,
          technician: editJobTechnician,
          startDate: editJobStartDate,
          endDate: editJobEndDate,
          status: editJobStatus,
        }
      }
      return job
    })

    setJobs(updatedJobs)
    setEditingCalendarJob(null)
    
    setEditJobTitle("")
    setEditJobTechnician("")
    setEditJobStartDate("")
    setEditJobEndDate("")
    setEditJobStatus("")
    setEditJobLocation("")
    setEditJobNotes("")
  }

  const handleCreateJob = () => {
    if (!newJobTitle || !newJobStartDate || !newJobEndDate) {
      alert("Please fill in all required fields (Title, Start Date, End Date)")
      return
    }

    const maxId = Math.max(...jobs.map(j => parseInt(j.id.slice(1))))
    const newId = `#${maxId + 1}`

    const formattedStartDate = new Date(newJobStartDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    const formattedEndDate = new Date(newJobEndDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })

    const newJob = {
      id: newId,
      title: newJobTitle,
      technician: newJobTechnician || "Unassigned",
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: newJobStatus,
    }

    setJobs([...jobs, newJob])
    
    setNewJobTitle("")
    setNewJobDescription("")
    setNewJobTechnician("")
    setNewJobStartDate("")
    setNewJobEndDate("")
    setNewJobStatus("Assigned")
    setIsCreateJobOpen(false)
  }

  // Technician management handlers
  const handleAddTechnician = () => {
    if (!newTechName || !newTechPhone) {
      alert("Please fill in all required fields (Name and Phone)")
      return
    }

    const newTechnician = {
      name: newTechName,
      phone: newTechPhone,
      activeJobs: 0,
      status: "Active",
    }

    setTechnicians([...technicians, newTechnician])
    
    setNewTechName("")
    setNewTechPhone("")
    setNewTechEmail("")
    setIsAddTechnicianOpen(false)
  }

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '')
    
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setNewTechPhone(formatted)
  }

  const handleEditPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setEditTechPhone(formatted)
  }

  const handleEditTechnician = (index: number) => {
    const tech = technicians[index]
    setEditingTechnicianIndex(index)
    setEditTechName(tech.name)
    setEditTechPhone(tech.phone)
    setEditTechEmail("")
    setEditTechStatus(tech.status)
  }

  const handleSaveTechnician = () => {
    if (!editTechName || !editTechPhone) {
      alert("Please fill in all required fields (Name and Phone)")
      return
    }

    if (editingTechnicianIndex === null) return

    const updatedTechnicians = [...technicians]
    updatedTechnicians[editingTechnicianIndex] = {
      ...updatedTechnicians[editingTechnicianIndex],
      name: editTechName,
      phone: editTechPhone,
      status: editTechStatus,
    }

    setTechnicians(updatedTechnicians)
    
    setEditingTechnicianIndex(null)
    setEditTechName("")
    setEditTechPhone("")
    setEditTechEmail("")
    setEditTechStatus("")
  }

  const handleSelectAllTechnicians = (checked: boolean) => {
    if (checked) {
      setSelectedTechnicianIndices(technicians.map((_, index) => index))
    } else {
      setSelectedTechnicianIndices([])
    }
  }

  const handleSelectTechnician = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedTechnicianIndices([...selectedTechnicianIndices, index])
    } else {
      setSelectedTechnicianIndices(selectedTechnicianIndices.filter(i => i !== index))
    }
  }

  const handleDeleteSelectedTechnicians = () => {
    if (selectedTechnicianIndices.length === 0) return
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedTechnicianIndices.length} technician(s)?`
    )
    
    if (confirmDelete) {
      const updatedTechnicians = technicians.filter((_, index) => !selectedTechnicianIndices.includes(index))
      setTechnicians(updatedTechnicians)
      setSelectedTechnicianIndices([])
    }
  }

  // Timesheet management handlers
  const calculateHours = (clockIn: string, clockOut: string) => {
    if (!clockIn || !clockOut) return 0
    
    const [inTime, inPeriod] = clockIn.split(' ')
    const [outTime, outPeriod] = clockOut.split(' ')
    
    let [inHour, inMin] = inTime.split(':').map(Number)
    let [outHour, outMin] = outTime.split(':').map(Number)
    
    if (inPeriod === 'PM' && inHour !== 12) inHour += 12
    if (inPeriod === 'AM' && inHour === 12) inHour = 0
    if (outPeriod === 'PM' && outHour !== 12) outHour += 12
    if (outPeriod === 'AM' && outHour === 12) outHour = 0
    
    const inMinutes = inHour * 60 + inMin
    const outMinutes = outHour * 60 + outMin
    
    return Number(((outMinutes - inMinutes) / 60).toFixed(1))
  }

  const handleAddTimesheet = () => {
    if (!newTimesheetTechnician || !newTimesheetJob || !newTimesheetDate || !newTimesheetClockIn) {
      alert("Please fill in all required fields")
      return
    }

    const maxId = Math.max(...timesheets.map(t => parseInt(t.id.slice(3))))
    const newId = `#TS${String(maxId + 1).padStart(3, '0')}`

    const hours = calculateHours(newTimesheetClockIn, newTimesheetClockOut)
    const status = newTimesheetClockOut ? "Pending" : "Active"

    const selectedJob = jobs.find(j => j.id === newTimesheetJob)

    const newTimesheet: TimesheetEntry = {
      id: newId,
      technician: newTimesheetTechnician,
      date: new Date(newTimesheetDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      jobId: newTimesheetJob,
      jobTitle: selectedJob?.title || "",
      clockIn: newTimesheetClockIn,
      clockOut: newTimesheetClockOut,
      hours: hours,
      status: status,
      notes: newTimesheetNotes,
    }

    setTimesheets([...timesheets, newTimesheet])
    
    setNewTimesheetTechnician("")
    setNewTimesheetJob("")
    setNewTimesheetDate("")
    setNewTimesheetClockIn("")
    setNewTimesheetClockOut("")
    setNewTimesheetNotes("")
    setIsAddTimesheetOpen(false)
  }

  const handleEditTimesheet = (id: string) => {
    const timesheet = timesheets.find(t => t.id === id)
    if (!timesheet) return

    setEditingTimesheetId(id)
    setEditTimesheetTechnician(timesheet.technician)
    setEditTimesheetJob(timesheet.jobId)
    setEditTimesheetDate(timesheet.date)
    setEditTimesheetClockIn(timesheet.clockIn)
    setEditTimesheetClockOut(timesheet.clockOut)
    setEditTimesheetStatus(timesheet.status)
    setEditTimesheetNotes(timesheet.notes)
  }

  const handleSaveTimesheet = () => {
    if (!editTimesheetTechnician || !editTimesheetJob || !editTimesheetClockIn) {
      alert("Please fill in all required fields")
      return
    }

    const hours = calculateHours(editTimesheetClockIn, editTimesheetClockOut)
    const selectedJob = jobs.find(j => j.id === editTimesheetJob)

    const updatedTimesheets = timesheets.map(t => 
      t.id === editingTimesheetId 
        ? {
            ...t,
            technician: editTimesheetTechnician,
            jobId: editTimesheetJob,
            jobTitle: selectedJob?.title || t.jobTitle,
            clockIn: editTimesheetClockIn,
            clockOut: editTimesheetClockOut,
            hours: hours,
            status: editTimesheetStatus,
            notes: editTimesheetNotes,
          }
        : t
    )

    setTimesheets(updatedTimesheets)
    
    setEditingTimesheetId(null)
    setEditTimesheetTechnician("")
    setEditTimesheetJob("")
    setEditTimesheetDate("")
    setEditTimesheetClockIn("")
    setEditTimesheetClockOut("")
    setEditTimesheetStatus("")
    setEditTimesheetNotes("")
  }

  const handleSelectAllTimesheets = (checked: boolean) => {
    if (checked) {
      setSelectedTimesheetIds(timesheets.map(t => t.id))
    } else {
      setSelectedTimesheetIds([])
    }
  }

  const handleSelectTimesheet = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTimesheetIds([...selectedTimesheetIds, id])
    } else {
      setSelectedTimesheetIds(selectedTimesheetIds.filter(i => i !== id))
    }
  }

  const handleDeleteSelectedTimesheets = () => {
    if (selectedTimesheetIds.length === 0) return
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedTimesheetIds.length} timesheet(s)?`
    )
    
    if (confirmDelete) {
      const updatedTimesheets = timesheets.filter(t => !selectedTimesheetIds.includes(t.id))
      setTimesheets(updatedTimesheets)
      setSelectedTimesheetIds([])
    }
  }

  const getTimesheetStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Approved":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Google Maps initialization using traditional JavaScript API
  const initTechnicianMap = () => {
    console.log('Initializing technician map with traditional JavaScript API...');
    
    const jobLocations = [
      { lat: 40.7128, lng: -74.0060, title: "HVAC Repair", status: "assigned", id: "#101" },
      { lat: 40.7589, lng: -73.9851, title: "Plumbing Check", status: "in-progress", id: "#102" },
      { lat: 40.7505, lng: -73.9934, title: "Electrical Install", status: "completed", id: "#103" }
    ];

    const mapElement = mapContainerRef.current;
    console.log('Map element found:', !!mapElement);
    console.log('Google available:', !!(window as any).google);
    console.log('Google Maps available:', !!(window as any).google?.maps);
    
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }
    
    if (!(window as any).google || !(window as any).google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    try {
      // Don't clear innerHTML - let Google Maps handle the content
      
      // Create the map
      const map = new (window as any).google.maps.Map(mapElement, {
        zoom: 12,
        center: { lat: 40.7128, lng: -74.0060 },
        mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      // Store map instance in ref for later use
      mapInstanceRef.current = map;
      
      console.log('Map object created:', map);
      
      // Add markers for each job
      jobLocations.forEach(location => {
        // Create custom marker icon
        const markerIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3C10.03 3 6 7.03 6 12c0 7.5 9 15 9 15s9-7.5 9-15c0-4.97-4.03-9-9-9z" 
                    fill="${
                      location.status === 'in-progress' ? '#eab308' :
                      location.status === 'completed' ? '#22c55e' :
                      location.status === 'overdue' ? '#ef4444' : '#3b82f6'
                    }" 
                    stroke="white" 
                    stroke-width="2"/>
              <circle cx="15" cy="12" r="3" fill="white"/>
            </svg>
          `)}`,
          scaledSize: new (window as any).google.maps.Size(30, 30),
          anchor: new (window as any).google.maps.Point(15, 30)
        };

        const marker = new (window as any).google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: `${location.title} (${location.id})`,
          icon: markerIcon
        });

        // Create info window
        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${location.title}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Job ID: ${location.id}</p>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">123 Main St, City, State 12345</p>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button onclick="window.open('https://maps.google.com/maps?daddr=${location.lat},${location.lng}', '_blank')" 
                        style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  Get Directions
                </button>
                <button onclick="alert('Starting job: ${location.title}')" 
                        style="background: #22c55e; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  Start Job
                </button>
              </div>
            </div>
          `
        });

        // Add click listener
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        console.log(`Marker created for ${location.title} at ${location.lat}, ${location.lng}`);
      });
      
      // Add user location marker if geolocation is available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          const userMarker = new (window as any).google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Your Current Location',
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#1f2937" stroke="white" stroke-width="2"/>
                  <circle cx="10" cy="10" r="3" fill="white"/>
                </svg>
              `)}`,
              scaledSize: new (window as any).google.maps.Size(20, 20),
              anchor: new (window as any).google.maps.Point(10, 10)
            }
          });
          
          console.log('User location marker added');
        }, (error) => {
          console.log('Geolocation error:', error);
        });
      }
      
      console.log('Map initialization completed successfully');
      
    } catch (error) {
      console.error('Error initializing map:', error);
      
      // Show error message by keeping loading state
      console.log('Map initialization failed, keeping loading state');
      // Don't set mapLoaded to true, so loading message stays visible
    }
  };

  // Load Google Maps API
  useEffect(() => {
    console.log('useEffect triggered:', { activePortal, technicianTab, mapLoaded });
    
    if (activePortal === "technician" && technicianTab === "map" && !mapLoaded) {
      console.log('✅ Conditions met - Loading Google Maps API...');
      
      const loadGoogleMaps = () => {
        // Remove any existing scripts first
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        existingScripts.forEach(script => script.remove());
        
        // Use the working callback method
        console.log('Loading Google Maps API...');
        
        // Create a global callback
        (window as any).initMapCallback = () => {
          console.log('✅ Google Maps API loaded successfully');
          
          // Check for Google Maps errors
          if ((window as any).google && (window as any).google.maps) {
            console.log('Google Maps object is available');
            
            // Add error listener for Google Maps
            (window as any).google.maps.event.addDomListener(window, 'load', () => {
              console.log('Google Maps DOM loaded');
            });
            
            setTimeout(() => {
              try {
                initTechnicianMap();
                setMapLoaded(true);
              } catch (error) {
                console.error('Error in initTechnicianMap:', error);
                // Keep loading state to show error
              }
            }, 100);
          } else {
            console.error('Google Maps API loaded but google.maps not available');
          }
        };
        
        // Add global error handler for Google Maps
        (window as any).gm_authFailure = () => {
          console.error('Google Maps authentication failed!');
          alert('Google Maps authentication failed. Please check your API key and billing settings.');
        };
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBmTP5DHw2aeXLtzoU2bMFTwjxS0U_g2nI&libraries=places&callback=initMapCallback`;
        script.async = true;
        script.defer = true;
        
        script.onerror = (error) => {
          console.error('❌ Failed to load Google Maps JavaScript API:', error);
          console.log('API Key might be invalid or restricted');
          
          const mapElement = document.getElementById('google-map');
          if (mapElement) {
            mapElement.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
                  <h3 style="margin: 0 0 8px 0; color: #dc2626;">Google Maps API Error</h3>
                  <p style="margin: 0 0 4px 0; color: #7f1d1d; font-size: 14px;">API key might be invalid or restricted</p>
                  <p style="margin: 0; color: #7f1d1d; font-size: 12px;">Check browser console for details</p>
                  <button onclick="window.location.reload()" style="margin-top: 12px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry
                  </button>
                </div>
              </div>
            `;
          }
        };
        
        // Add timeout in case callback never fires
        setTimeout(() => {
          if (!(window as any).google && (window as any).__gmapsCallback) {
            console.error('⏰ Timeout: Google Maps API failed to load within 10 seconds');
            delete (window as any).__gmapsCallback;
            
            const mapElement = document.getElementById('google-map');
            if (mapElement && mapElement.innerHTML.includes('Loading Map')) {
              mapElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
                  <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⏱️</div>
                    <h3 style="margin: 0 0 8px 0; color: #92400e;">Loading Timeout</h3>
                    <p style="margin: 0 0 4px 0; color: #78350f; font-size: 14px;">Google Maps API took too long to load</p>
                    <p style="margin: 0; color: #78350f; font-size: 12px;">Check your internet connection</p>
                    <button onclick="window.location.reload()" style="margin-top: 12px; padding: 8px 16px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer;">
                      Retry
                    </button>
                  </div>
                </div>
              `;
            }
          }
        }, 10000); // 10 second timeout
        
        document.head.appendChild(script);
      };

      loadGoogleMaps();
    }
  }, [activePortal, technicianTab, mapLoaded]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any global callbacks when component unmounts
      if ((window as any).initMapCallback) {
        delete (window as any).initMapCallback;
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Overdue":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 border-0">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6 mb-6">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Workforce Management</span>
              </div>
              
              {/* Title with Icon */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Workforce Management</h1>
              </div>
              
              <p className="text-muted-foreground mt-2">TaskBeacon - Field service management</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={activePortal === "admin" ? "default" : "outline"}
                onClick={() => setActivePortal("admin")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Console
              </Button>
              <Button
                variant={activePortal === "technician" ? "default" : "outline"}
                onClick={() => setActivePortal("technician")}
              >
                <Users className="h-4 w-4 mr-2" />
                Technician Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Portal */}
      {activePortal === "admin" && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">24</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Total Jobs</p>
                <p className="text-xs text-muted-foreground">All jobs in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">8</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Active Technicians</p>
                <p className="text-xs text-muted-foreground">Available field techs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">12</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Assigned Jobs</p>
                <p className="text-xs text-muted-foreground">Jobs ready to start</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">8</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-xs text-muted-foreground">Currently being worked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">15</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Completed This Week</p>
                <p className="text-xs text-muted-foreground">Finished jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-500">3</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Overdue Jobs</p>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="technicians">Technicians</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Jobs Management Table */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Jobs Management</CardTitle>
                      <div className="flex gap-2">
                        {selectedJobIds.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={handleDeleteSelected}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete ({selectedJobIds.length})
                          </Button>
                        )}
                        <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              New Job
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Job</DialogTitle>
                              <DialogDescription>Add a new job to the system</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="job-title">Job Title *</Label>
                                <Input 
                                  id="job-title" 
                                  placeholder="Enter job title"
                                  value={newJobTitle}
                                  onChange={(e) => setNewJobTitle(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="job-description">Description</Label>
                                <Textarea 
                                  id="job-description" 
                                  placeholder="Enter job description"
                                  value={newJobDescription}
                                  onChange={(e) => setNewJobDescription(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="dashboard-job-technician">Assign Technician</Label>
                                <Select value={newJobTechnician} onValueChange={setNewJobTechnician}>
                                  <SelectTrigger id="dashboard-job-technician">
                                    <SelectValue placeholder="Select technician" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                    {technicians.map((tech) => (
                                      <SelectItem key={tech.name} value={tech.name}>
                                        {tech.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="start-date">Start Date *</Label>
                                  <Input 
                                    id="start-date" 
                                    type="date"
                                    value={newJobStartDate}
                                    onChange={(e) => setNewJobStartDate(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="end-date">End Date *</Label>
                                  <Input 
                                    id="end-date" 
                                    type="date"
                                    value={newJobEndDate}
                                    onChange={(e) => setNewJobEndDate(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="job-status">Status</Label>
                                <Select value={newJobStatus} onValueChange={setNewJobStatus}>
                                  <SelectTrigger id="job-status">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Assigned">Assigned</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button className="w-full" onClick={handleCreateJob}>Create Job</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedJobIds.length === jobs.length && jobs.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Technician</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedJobIds.includes(job.id)}
                                onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{job.id}</TableCell>
                            <TableCell>{job.title}</TableCell>
                            <TableCell>{job.technician}</TableCell>
                            <TableCell>{job.startDate}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Jobs This Week</span>
                        <span className="font-bold">15</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Jobs This Month</span>
                        <span className="font-bold">45</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Top Performers</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Mike Davis (8 jobs)</div>
                          <div>Sarah Johnson (6 jobs)</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">3 jobs need attention</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span>{activity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Schedule Calendar</CardTitle>
                      <CardDescription>View and manage job schedules</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={previousMonth}>
                        ← Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextMonth}>
                        Next →
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-center">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {(() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
                      const days = []
                      
                      // Empty cells for days before month starts
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(
                          <div key={`empty-${i}`} className="min-h-24 p-2 border rounded-lg bg-muted/20" />
                        )
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        const dayJobs = getJobsForDate(date)
                        const isToday = new Date().toDateString() === date.toDateString()
                        
                        days.push(
                          <div
                            key={day}
                            className={`min-h-24 p-2 border rounded-lg hover:bg-accent transition-colors ${
                              isToday ? 'border-primary bg-primary/5' : ''
                            }`}
                          >
                            <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayJobs.slice(0, 2).map((job) => (
                                <div
                                  key={job.id}
                                  className={`text-xs p-1 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                    job.status === 'In Progress' ? 'bg-yellow-400 text-yellow-900' :
                                    job.status === 'Completed' ? 'bg-green-400 text-green-900' :
                                    job.status === 'Overdue' ? 'bg-red-400 text-red-900' : 
                                    'bg-blue-400 text-blue-900'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingCalendarJob(job)
                                  }}
                                >
                                  {job.title}
                                </div>
                              ))}
                              {dayJobs.length > 2 && (
                                <div 
                                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedDate(date)
                                  }}
                                >
                                  +{dayJobs.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      
                      return days
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Job Detail Dialog */}
              <Dialog open={!!viewingCalendarJob} onOpenChange={() => setViewingCalendarJob(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{viewingCalendarJob?.title}</DialogTitle>
                    <DialogDescription>Job Details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Job ID</Label>
                        <p className="font-medium">{viewingCalendarJob?.id}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className={getStatusColor(viewingCalendarJob?.status || '')}>
                            {viewingCalendarJob?.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Assigned Technician</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{viewingCalendarJob?.technician}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Start Date</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{viewingCalendarJob?.startDate}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">End Date</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{viewingCalendarJob?.endDate}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">123 Main St, City, State 12345</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          const job = viewingCalendarJob
                          setEditingCalendarJob(job)
                          setEditJobTitle(job.title)
                          setEditJobTechnician(job.technician)
                          setEditJobStartDate(job.startDate)
                          setEditJobEndDate(job.endDate)
                          setEditJobStatus(job.status)
                          setEditJobLocation("123 Main St, City, State 12345")
                          setEditJobNotes("")
                          setViewingCalendarJob(null)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Job
                      </Button>
                      <Button variant="outline" onClick={() => setViewingCalendarJob(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Job Dialog */}
              <Dialog open={!!editingCalendarJob} onOpenChange={() => setEditingCalendarJob(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Job - {editingCalendarJob?.id}</DialogTitle>
                    <DialogDescription>Update job details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-cal-job-title">Job Title</Label>
                      <Input 
                        id="edit-cal-job-title" 
                        value={editJobTitle}
                        onChange={(e) => setEditJobTitle(e.target.value)}
                        placeholder="Enter job title" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cal-job-technician">Assigned Technician</Label>
                      <Select value={editJobTechnician} onValueChange={setEditJobTechnician}>
                        <SelectTrigger id="edit-cal-job-technician">
                          <SelectValue placeholder="Select technician" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unassigned">Unassigned</SelectItem>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.name} value={tech.name}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-cal-start-date">Start Date</Label>
                        <Input 
                          id="edit-cal-start-date" 
                          value={editJobStartDate}
                          onChange={(e) => setEditJobStartDate(e.target.value)}
                          placeholder="Enter start date"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-cal-end-date">End Date</Label>
                        <Input 
                          id="edit-cal-end-date" 
                          value={editJobEndDate}
                          onChange={(e) => setEditJobEndDate(e.target.value)}
                          placeholder="Enter end date"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-cal-job-status">Status</Label>
                      <Select value={editJobStatus} onValueChange={setEditJobStatus}>
                        <SelectTrigger id="edit-cal-job-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Assigned">Assigned</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-cal-job-location">Location</Label>
                      <Input 
                        id="edit-cal-job-location" 
                        value={editJobLocation}
                        onChange={(e) => setEditJobLocation(e.target.value)}
                        placeholder="Enter location" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cal-job-notes">Notes</Label>
                      <Textarea 
                        id="edit-cal-job-notes" 
                        value={editJobNotes}
                        onChange={(e) => setEditJobNotes(e.target.value)}
                        placeholder="Add any additional notes"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" onClick={handleSaveCalendarJob}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCalendarJob(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* All Jobs for Date Dialog */}
              <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Jobs for {selectedDate?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </DialogTitle>
                    <DialogDescription>All scheduled jobs for this date</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedDate && getJobsForDate(selectedDate).length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No jobs scheduled for this date
                      </p>
                    ) : (
                      selectedDate && getJobsForDate(selectedDate).map((job) => (
                        <Card 
                          key={job.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedDate(null)
                            setViewingCalendarJob(job)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{job.title}</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    <span>{job.technician}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{job.id}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={() => setSelectedDate(null)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Jobs</CardTitle>
                      <CardDescription>Manage all jobs in the system</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedJobIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete ({selectedJobIds.length})
                        </Button>
                      )}
                      <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Job
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Job</DialogTitle>
                            <DialogDescription>Add a new job to the system</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="jobs-tab-title">Job Title *</Label>
                              <Input 
                                id="jobs-tab-title" 
                                placeholder="Enter job title"
                                value={newJobTitle}
                                onChange={(e) => setNewJobTitle(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="jobs-tab-description">Description</Label>
                              <Textarea 
                                id="jobs-tab-description" 
                                placeholder="Enter job description"
                                value={newJobDescription}
                                onChange={(e) => setNewJobDescription(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="jobs-tab-technician">Assign Technician</Label>
                              <Select value={newJobTechnician} onValueChange={setNewJobTechnician}>
                                <SelectTrigger id="jobs-tab-technician">
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                                  {technicians.map((tech) => (
                                    <SelectItem key={tech.name} value={tech.name}>
                                      {tech.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="jobs-tab-start-date">Start Date *</Label>
                                <Input 
                                  id="jobs-tab-start-date" 
                                  type="date"
                                  value={newJobStartDate}
                                  onChange={(e) => setNewJobStartDate(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="jobs-tab-end-date">End Date *</Label>
                                <Input 
                                  id="jobs-tab-end-date" 
                                  type="date"
                                  value={newJobEndDate}
                                  onChange={(e) => setNewJobEndDate(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="jobs-tab-status">Status</Label>
                              <Select value={newJobStatus} onValueChange={setNewJobStatus}>
                                <SelectTrigger id="jobs-tab-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Assigned">Assigned</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button className="w-full" onClick={handleCreateJob}>Create Job</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedJobIds.length === jobs.length && jobs.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedJobIds.includes(job.id)}
                              onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{job.id}</TableCell>
                          <TableCell>{job.title}</TableCell>
                          <TableCell>{job.technician}</TableCell>
                          <TableCell>{job.startDate}</TableCell>
                          <TableCell>{job.endDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingJob(job.id)
                                  setEditJobTitle(job.title)
                                  setEditJobTechnician(job.technician)
                                  setEditJobStartDate(job.startDate)
                                  setEditJobEndDate(job.endDate)
                                  setEditJobStatus(job.status)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setViewingJobLocation(job.id)}
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Edit Job Dialog */}
                  <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Job</DialogTitle>
                        <DialogDescription>Update job information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-job-title">Job Title *</Label>
                          <Input 
                            id="edit-job-title" 
                            value={editJobTitle}
                            onChange={(e) => setEditJobTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-job-technician">Assign Technician</Label>
                          <Select value={editJobTechnician} onValueChange={setEditJobTechnician}>
                            <SelectTrigger id="edit-job-technician">
                              <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Unassigned">Unassigned</SelectItem>
                              {technicians.map((tech) => (
                                <SelectItem key={tech.name} value={tech.name}>
                                  {tech.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-job-start">Start Date *</Label>
                            <Input 
                              id="edit-job-start" 
                              value={editJobStartDate}
                              onChange={(e) => setEditJobStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-job-end">End Date *</Label>
                            <Input 
                              id="edit-job-end" 
                              value={editJobEndDate}
                              onChange={(e) => setEditJobEndDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="edit-job-status">Status</Label>
                          <Select value={editJobStatus} onValueChange={setEditJobStatus}>
                            <SelectTrigger id="edit-job-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Assigned">Assigned</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            if (!editJobTitle || !editJobStartDate || !editJobEndDate) {
                              alert("Please fill in all required fields")
                              return
                            }
                            
                            const updatedJobs = jobs.map(j => 
                              j.id === editingJob 
                                ? { ...j, title: editJobTitle, technician: editJobTechnician, startDate: editJobStartDate, endDate: editJobEndDate, status: editJobStatus }
                                : j
                            )
                            setJobs(updatedJobs)
                            setEditingJob(null)
                            setEditJobTitle("")
                            setEditJobTechnician("")
                            setEditJobStartDate("")
                            setEditJobEndDate("")
                            setEditJobStatus("")
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* View Location Dialog */}
                  <Dialog open={!!viewingJobLocation} onOpenChange={(open) => !open && setViewingJobLocation(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Job Location</DialogTitle>
                        <DialogDescription>View job location on map</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {viewingJobLocation && jobs.find(j => j.id === viewingJobLocation) && (
                          <>
                            <div>
                              <p className="text-sm font-medium">Job: {jobs.find(j => j.id === viewingJobLocation)?.title}</p>
                              <p className="text-sm text-muted-foreground">ID: {viewingJobLocation}</p>
                            </div>
                            <div className="bg-muted rounded-lg p-8 text-center">
                              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Map integration would show here</p>
                              <p className="text-xs text-muted-foreground mt-2">Location: 123 Main St, City, State</p>
                            </div>
                            <Button className="w-full" onClick={() => setViewingJobLocation(null)}>
                              Close
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technicians">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Technician Management</CardTitle>
                      <CardDescription>Manage your field technicians</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTechnicianIndices.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelectedTechnicians}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete ({selectedTechnicianIndices.length})
                        </Button>
                      )}
                      <Dialog open={isAddTechnicianOpen} onOpenChange={setIsAddTechnicianOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Technician
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Technician</DialogTitle>
                            <DialogDescription>Create a new technician account</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="tech-name">Full Name *</Label>
                              <Input 
                                id="tech-name" 
                                placeholder="Enter full name"
                                value={newTechName}
                                onChange={(e) => setNewTechName(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="tech-phone">Phone *</Label>
                              <Input 
                                id="tech-phone" 
                                placeholder="(555) 123-4567"
                                value={newTechPhone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                maxLength={14}
                              />
                            </div>
                            <div>
                              <Label htmlFor="tech-email">Email</Label>
                              <Input 
                                id="tech-email" 
                                type="email" 
                                placeholder="email@example.com"
                                value={newTechEmail}
                                onChange={(e) => setNewTechEmail(e.target.value)}
                              />
                            </div>
                            <Button className="w-full" onClick={handleAddTechnician}>Create Technician</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedTechnicianIndices.length === technicians.length && technicians.length > 0}
                            onCheckedChange={handleSelectAllTechnicians}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Active Jobs</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technicians.map((tech, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTechnicianIndices.includes(index)}
                              onCheckedChange={(checked) => handleSelectTechnician(index, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{tech.name}</TableCell>
                          <TableCell>{tech.phone}</TableCell>
                          <TableCell>{tech.activeJobs}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              {tech.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTechnician(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Edit Technician Dialog */}
                  <Dialog open={editingTechnicianIndex !== null} onOpenChange={(open) => !open && setEditingTechnicianIndex(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Technician</DialogTitle>
                        <DialogDescription>Update technician information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-tech-name">Full Name *</Label>
                          <Input 
                            id="edit-tech-name" 
                            placeholder="Enter full name"
                            value={editTechName}
                            onChange={(e) => setEditTechName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-tech-phone">Phone *</Label>
                          <Input 
                            id="edit-tech-phone" 
                            placeholder="(555) 123-4567"
                            value={editTechPhone}
                            onChange={(e) => handleEditPhoneChange(e.target.value)}
                            maxLength={14}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-tech-status">Status</Label>
                          <Select value={editTechStatus} onValueChange={setEditTechStatus}>
                            <SelectTrigger id="edit-tech-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="On Leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleSaveTechnician}>Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timesheets">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Time Tracking</CardTitle>
                      <CardDescription>Monitor technician hours and timesheets</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTimesheetIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelectedTimesheets}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete ({selectedTimesheetIds.length})
                        </Button>
                      )}
                      <Dialog open={isAddTimesheetOpen} onOpenChange={setIsAddTimesheetOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Entry
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Timesheet Entry</DialogTitle>
                            <DialogDescription>Record time for a technician</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="timesheet-tech">Technician *</Label>
                              <Select value={newTimesheetTechnician} onValueChange={setNewTimesheetTechnician}>
                                <SelectTrigger id="timesheet-tech">
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map((tech, index) => (
                                    <SelectItem key={index} value={tech.name}>{tech.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="timesheet-job">Job *</Label>
                              <Select value={newTimesheetJob} onValueChange={setNewTimesheetJob}>
                                <SelectTrigger id="timesheet-job">
                                  <SelectValue placeholder="Select job" />
                                </SelectTrigger>
                                <SelectContent>
                                  {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.title}>{job.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="timesheet-date">Date *</Label>
                              <Input 
                                id="timesheet-date" 
                                type="date"
                                value={newTimesheetDate}
                                onChange={(e) => setNewTimesheetDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="timesheet-clock-in">Clock In *</Label>
                              <Input 
                                id="timesheet-clock-in" 
                                type="time"
                                value={newTimesheetClockIn}
                                onChange={(e) => setNewTimesheetClockIn(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="timesheet-clock-out">Clock Out</Label>
                              <Input 
                                id="timesheet-clock-out" 
                                type="time"
                                value={newTimesheetClockOut}
                                onChange={(e) => setNewTimesheetClockOut(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="timesheet-notes">Notes</Label>
                              <Textarea 
                                id="timesheet-notes" 
                                placeholder="Additional notes"
                                value={newTimesheetNotes}
                                onChange={(e) => setNewTimesheetNotes(e.target.value)}
                              />
                            </div>
                            <Button className="w-full" onClick={handleAddTimesheet}>Add Entry</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {timesheets.filter(t => t.status === 'Clocked In').length}
                        </div>
                        <p className="text-sm text-muted-foreground">Active Clock-ins</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {timesheets
                            .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
                            .reduce((sum, t) => sum + calculateHours(t.clockIn, t.clockOut), 0)
                            .toFixed(1)}
                        </div>
                        <p className="text-sm text-muted-foreground">Hours Today</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {timesheets.reduce((sum, t) => sum + calculateHours(t.clockIn, t.clockOut), 0).toFixed(1)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-500">
                          {timesheets.filter(t => t.status === 'Pending Approval').length}
                        </div>
                        <p className="text-sm text-muted-foreground">Pending Approval</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedTimesheetIds.length === timesheets.length && timesheets.length > 0}
                            onCheckedChange={handleSelectAllTimesheets}
                          />
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheets.map((timesheet) => (
                        <TableRow key={timesheet.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTimesheetIds.includes(timesheet.id)}
                              onCheckedChange={(checked) => handleSelectTimesheet(timesheet.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>{new Date(timesheet.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{timesheet.technician}</TableCell>
                          <TableCell>{timesheet.jobTitle}</TableCell>
                          <TableCell>{timesheet.clockIn}</TableCell>
                          <TableCell>{timesheet.clockOut || '-'}</TableCell>
                          <TableCell>{calculateHours(timesheet.clockIn, timesheet.clockOut).toFixed(1)}h</TableCell>
                          <TableCell>
                            <Badge className={getTimesheetStatusColor(timesheet.status)}>
                              {timesheet.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTimesheet(timesheet.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Edit Timesheet Dialog */}
                  <Dialog open={editingTimesheetId !== null} onOpenChange={(open) => !open && setEditingTimesheetId(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Timesheet Entry</DialogTitle>
                        <DialogDescription>Update timesheet information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-timesheet-tech">Technician</Label>
                          <Input 
                            id="edit-timesheet-tech" 
                            value={editTimesheetTechnician}
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-timesheet-job">Job</Label>
                          <Input 
                            id="edit-timesheet-job" 
                            value={editTimesheetJob}
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-timesheet-date">Date</Label>
                          <Input 
                            id="edit-timesheet-date" 
                            type="date"
                            value={editTimesheetDate}
                            onChange={(e) => setEditTimesheetDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-timesheet-clock-in">Clock In</Label>
                          <Input 
                            id="edit-timesheet-clock-in" 
                            type="time"
                            value={editTimesheetClockIn}
                            onChange={(e) => setEditTimesheetClockIn(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-timesheet-clock-out">Clock Out</Label>
                          <Input 
                            id="edit-timesheet-clock-out" 
                            type="time"
                            value={editTimesheetClockOut}
                            onChange={(e) => setEditTimesheetClockOut(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-timesheet-status">Status</Label>
                          <Select value={editTimesheetStatus} onValueChange={setEditTimesheetStatus}>
                            <SelectTrigger id="edit-timesheet-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Clocked In">Clocked In</SelectItem>
                              <SelectItem value="Clocked Out">Clocked Out</SelectItem>
                              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-timesheet-notes">Notes</Label>
                          <Textarea 
                            id="edit-timesheet-notes" 
                            value={editTimesheetNotes}
                            onChange={(e) => setEditTimesheetNotes(e.target.value)}
                          />
                        </div>
                        <Button className="w-full" onClick={handleSaveTimesheet}>Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-6">
                {/* Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Key metrics for workforce performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-green-500">
                            {((jobs.filter(j => j.status === 'Completed').length / jobs.length) * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {timesheets.reduce((sum, t) => sum + calculateHours(t.clockIn, t.clockOut), 0).toFixed(1)}h
                          </div>
                          <p className="text-sm text-muted-foreground">Total Hours Logged</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {(timesheets.reduce((sum, t) => sum + calculateHours(t.clockIn, t.clockOut), 0) / jobs.length).toFixed(1)}h
                          </div>
                          <p className="text-sm text-muted-foreground">Avg Hours per Job</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-blue-500">
                            {technicians.filter(t => t.status === 'Active').length}
                          </div>
                          <p className="text-sm text-muted-foreground">Active Technicians</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Technician Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technician Performance</CardTitle>
                    <CardDescription>Individual performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Technician</TableHead>
                          <TableHead>Jobs Completed</TableHead>
                          <TableHead>Total Hours</TableHead>
                          <TableHead>Avg Hours/Job</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {technicians.map((tech, index) => {
                          const techJobs = jobs.filter(j => j.technician === tech.name);
                          const completedJobs = techJobs.filter(j => j.status === 'Completed').length;
                          const techTimesheets = timesheets.filter(t => t.technician === tech.name);
                          const totalHours = techTimesheets.reduce((sum, t) => sum + calculateHours(t.clockIn, t.clockOut), 0);
                          const avgHours = completedJobs > 0 ? totalHours / completedJobs : 0;
                          const performance = completedJobs > 0 ? (completedJobs / techJobs.length) * 100 : 0;

                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{tech.name}</TableCell>
                              <TableCell>{completedJobs}/{techJobs.length}</TableCell>
                              <TableCell>{totalHours.toFixed(1)}h</TableCell>
                              <TableCell>{avgHours.toFixed(1)}h</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500" 
                                      style={{ width: `${performance}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{performance.toFixed(0)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Job Status Breakdown & Timesheet Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            {jobs.filter(j => j.status === 'Pending').length}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">In Progress</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {jobs.filter(j => j.status === 'In Progress').length}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            {jobs.filter(j => j.status === 'Completed').length}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overdue</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                            {jobs.filter(j => j.status === 'Overdue').length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Timesheet Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Clocked In</span>
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {timesheets.filter(t => t.status === 'Clocked In').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Clocked Out</span>
                        <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                          {timesheets.filter(t => t.status === 'Clocked Out').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Approval</span>
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          {timesheets.filter(t => t.status === 'Pending Approval').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Approved</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          {timesheets.filter(t => t.status === 'Approved').length}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>Download reports and data exports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Export Jobs (CSV)
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Export Timesheets (CSV)
                      </Button>
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export Performance (PDF)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Technician Portal */}
      {activePortal === "technician" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">3</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Jobs Today</p>
                <p className="text-xs text-muted-foreground">Assigned to you</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-bold">HVAC Repair at 2:00 PM</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Next Job</p>
                <p className="text-xs text-muted-foreground">Starting soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">32.5</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Hours This Week</p>
                <p className="text-xs text-muted-foreground">Time logged</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={technicianTab} onValueChange={setTechnicianTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              {jobs.slice(0, 3).map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>
                          {job.id} • {job.startDate}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>123 Main St, City, State 12345</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>(555) 987-6543</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">Start Job</Button>
                      <Button variant="outline" onClick={() => setViewingTechJobDetails(job)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Jobs</CardTitle>
                  <CardDescription>Your scheduled jobs for the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setViewingTechJobDetails(job)}
                      >
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.startDate}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Calendar</CardTitle>
                      <CardDescription>Monthly view of your assignments</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={previousMonth}>
                        ← Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextMonth}>
                        Next →
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-center">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {(() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
                      const days = []
                      
                      // Empty cells for days before month starts
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(
                          <div key={`empty-${i}`} className="min-h-24 p-2 border rounded-lg bg-muted/20" />
                        )
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        const dayJobs = getJobsForDate(date).filter(job => job.technician === "John Smith") // Filter for current technician
                        const isToday = new Date().toDateString() === date.toDateString()
                        
                        days.push(
                          <div
                            key={day}
                            className={`min-h-24 p-2 border rounded-lg hover:bg-accent transition-colors ${
                              isToday ? 'border-primary bg-primary/5' : ''
                            }`}
                          >
                            <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayJobs.slice(0, 2).map((job) => (
                                <div
                                  key={job.id}
                                  className={`text-xs p-1 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                    job.status === 'In Progress' ? 'bg-yellow-400 text-yellow-900' :
                                    job.status === 'Completed' ? 'bg-green-400 text-green-900' :
                                    job.status === 'Overdue' ? 'bg-red-400 text-red-900' : 
                                    'bg-blue-400 text-blue-900'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingTechJobDetails(job)
                                  }}
                                >
                                  {job.title}
                                </div>
                              ))}
                              {dayJobs.length > 2 && (
                                <div 
                                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedDate(date)
                                  }}
                                >
                                  +{dayJobs.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      
                      return days
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* All Jobs for Date Dialog - Reuse from admin portal but filter for technician */}
              <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      My Jobs for {selectedDate?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </DialogTitle>
                    <DialogDescription>All your scheduled jobs for this date</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedDate && getJobsForDate(selectedDate).filter(job => job.technician === "John Smith").length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No jobs scheduled for this date
                      </p>
                    ) : (
                      selectedDate && getJobsForDate(selectedDate).filter(job => job.technician === "John Smith").map((job) => (
                        <Card 
                          key={job.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedDate(null)
                            setViewingTechJobDetails(job)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{job.title}</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{job.id}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>123 Main St, City, State</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={() => setSelectedDate(null)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Locations</CardTitle>
                      <CardDescription>Map view of your assigned jobs</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (navigator.geolocation) {
                            console.log('Getting current location...');
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                console.log('Location found:', position.coords);
                                const userLocation = {
                                  lat: position.coords.latitude,
                                  lng: position.coords.longitude
                                };
                                
                                // Center the map on user location
                                if (mapInstanceRef.current) {
                                  console.log('Centering map on user location');
                                  mapInstanceRef.current.setCenter(userLocation);
                                  mapInstanceRef.current.setZoom(15); // Zoom in closer to user
                                  
                                  // Optionally add/update user location marker
                                  const userMarker = new (window as any).google.maps.Marker({
                                    position: userLocation,
                                    map: mapInstanceRef.current,
                                    title: 'Your Current Location',
                                    icon: {
                                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="white" stroke-width="3"/>
                                          <circle cx="12" cy="12" r="4" fill="white"/>
                                        </svg>
                                      `)}`,
                                      scaledSize: new (window as any).google.maps.Size(24, 24),
                                      anchor: new (window as any).google.maps.Point(12, 12)
                                    }
                                  });
                                  
                                  console.log('✅ Map centered on your location');
                                } else {
                                  console.log('Map instance not available, reinitializing...');
                                  initTechnicianMap();
                                }
                              },
                              (error) => {
                                console.error('Geolocation error:', error);
                                let message = 'Unable to get your location. ';
                                switch(error.code) {
                                  case error.PERMISSION_DENIED:
                                    message += 'Please allow location access and try again.';
                                    break;
                                  case error.POSITION_UNAVAILABLE:
                                    message += 'Location information is unavailable.';
                                    break;
                                  case error.TIMEOUT:
                                    message += 'Location request timed out.';
                                    break;
                                  default:
                                    message += 'An unknown error occurred.';
                                    break;
                                }
                                alert(message);
                              },
                              {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 60000
                              }
                            );
                          } else {
                            alert('Geolocation is not supported by this browser.');
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Current Location
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Google Maps Container */}
                  <div className="relative">
                    <div className="w-full h-96 rounded-lg border bg-muted relative" style={{ minHeight: '400px' }}>
                      <div 
                        ref={mapContainerRef}
                        className="w-full h-full rounded-lg"
                      />
                      {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                          <div className="text-center">
                            <MapPin className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                            <p className="text-sm font-medium">Loading Map...</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Initializing Google Maps API
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Check browser console for details
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-3"
                              onClick={() => {
                                console.log('=== GOOGLE MAPS DEBUG INFO ===');
                                console.log('Google available:', !!(window as any).google);
                                console.log('Google Maps available:', !!(window as any).google?.maps);
                                console.log('Map container ref:', !!mapContainerRef.current);
                                console.log('Active portal:', activePortal);
                                console.log('Active technician tab:', technicianTab);
                                console.log('Map loaded state:', mapLoaded);
                                
                                // Check for scripts
                                const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
                                console.log('Google Maps scripts:', scripts.length);
                                scripts.forEach((script, i) => {
                                  const scriptElement = script as HTMLScriptElement;
                                  console.log(`Script ${i + 1}:`, scriptElement.src);
                                });
                                
                                // Try to force initialize
                                if ((window as any).google?.maps && mapContainerRef.current) {
                                  console.log('Forcing map initialization...');
                                  initTechnicianMap();
                                  setMapLoaded(true);
                                }
                              }}
                            >
                              Debug Info
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Map Controls Overlay */}
                    <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Assigned Jobs</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>In Progress</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Overdue</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job List Below Map */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Today's Jobs</h4>
                    <div className="space-y-3">
                      {jobs.filter(job => job.technician === "John Smith").slice(0, 3).map((job, index) => (
                        <div 
                          key={job.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => setViewingTechJobDetails(job)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              job.status === 'In Progress' ? 'bg-yellow-500' :
                              job.status === 'Completed' ? 'bg-green-500' :
                              job.status === 'Overdue' ? 'bg-red-500' : 
                              'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  123 Main St, City, State
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  (555) 987-6543
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input id="profile-name" defaultValue="John Smith" />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input id="profile-phone" defaultValue="(555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" type="email" defaultValue="john.smith@example.com" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Job Details Dialog for Technician Portal */}
          <Dialog open={!!viewingTechJobDetails} onOpenChange={() => setViewingTechJobDetails(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {viewingTechJobDetails?.title}
                </DialogTitle>
                <DialogDescription>Job Details and Instructions</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Job ID</Label>
                    <p className="font-medium">{viewingTechJobDetails?.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(viewingTechJobDetails?.status || '')}>
                        {viewingTechJobDetails?.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{viewingTechJobDetails?.startDate}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{viewingTechJobDetails?.endDate}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Contact */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">123 Main St, City, State 12345</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Customer Contact</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">(555) 987-6543</p>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <Label className="text-muted-foreground">Job Description</Label>
                  <div className="mt-1 p-3 bg-background rounded-lg border">
                    <p className="text-sm">
                      {viewingTechJobDetails?.title === "HVAC Repair" && 
                        "Diagnose and repair HVAC system issues. Customer reports that the heating unit is not working properly. Check filters, inspect ductwork, and test thermostat functionality."
                      }
                      {viewingTechJobDetails?.title === "Plumbing Check" && 
                        "Routine plumbing inspection and maintenance. Check for leaks, test water pressure, inspect pipes and fixtures. Customer requested preventive maintenance."
                      }
                      {viewingTechJobDetails?.title === "Electrical Install" && 
                        "Install new electrical outlets and switches in kitchen renovation. Follow electrical code requirements and test all connections for safety."
                      }
                      {(!["HVAC Repair", "Plumbing Check", "Electrical Install"].includes(viewingTechJobDetails?.title)) &&
                        "Complete the assigned maintenance or repair task according to company standards and safety protocols."
                      }
                    </p>
                  </div>
                </div>

                {/* Required Tools/Equipment */}
                <div>
                  <Label className="text-muted-foreground">Required Tools & Equipment</Label>
                  <div className="mt-1 p-3 bg-background rounded-lg border">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {viewingTechJobDetails?.title === "HVAC Repair" && (
                        <>
                          <div>• Multimeter</div>
                          <div>• HVAC gauges</div>
                          <div>• Screwdriver set</div>
                          <div>• Replacement filters</div>
                        </>
                      )}
                      {viewingTechJobDetails?.title === "Plumbing Check" && (
                        <>
                          <div>• Pipe wrench set</div>
                          <div>• Pressure gauge</div>
                          <div>• Leak detection kit</div>
                          <div>• Basic plumbing supplies</div>
                        </>
                      )}
                      {viewingTechJobDetails?.title === "Electrical Install" && (
                        <>
                          <div>• Wire strippers</div>
                          <div>• Voltage tester</div>
                          <div>• Outlet boxes</div>
                          <div>• Electrical wire</div>
                        </>
                      )}
                      {(!["HVAC Repair", "Plumbing Check", "Electrical Install"].includes(viewingTechJobDetails?.title)) && (
                        <>
                          <div>• Standard tool kit</div>
                          <div>• Safety equipment</div>
                          <div>• Measuring tools</div>
                          <div>• Replacement parts</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <Label className="text-muted-foreground">Special Instructions</Label>
                  <div className="mt-1 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">Important Notes:</p>
                        <ul className="mt-1 space-y-1 text-muted-foreground">
                          <li>• Customer will be home during service window</li>
                          <li>• Use protective floor coverings</li>
                          <li>• Take before/after photos for documentation</li>
                          <li>• Call dispatch if additional parts needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Start Job
                  </Button>
                  <Button variant="outline" onClick={() => setViewingTechJobDetails(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
