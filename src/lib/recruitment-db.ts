// Recruitment Database Functions
// Handles job postings and applications with Supabase

import { supabase } from './supabase'

export interface Job {
  id: string
  title: string
  department: string
  location: string
  type: "full-time" | "part-time" | "contract" | "internship"
  level: "entry" | "mid" | "senior" | "lead"
  salary: string
  postedDate: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
  applicationCount?: number
  is_active?: boolean | string
}

export interface JobApplication {
  id?: string
  anonymousId?: string
  jobId: string
  jobTitle?: string
  department?: string
  status?: "new" | "reviewing" | "interview-scheduled" | "interviewed" | "offer" | "rejected" | "withdrawn"
  appliedDate?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  resumeFileName?: string | null
  resumeUrl?: string | null
  coverLetter: string
  linkedin?: string | null
  portfolio?: string | null
  isRevealed?: boolean
  revealedAt?: string | null
  revealedBy?: string | null
  notes?: string | null
  rating?: number | null
  interviewDate?: string | null
}

/**
 * Fetch all active job postings
 */
export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('posted_date', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return data.map(job => ({
    id: job.id,
    title: job.title,
    department: job.department,
    location: job.location,
    type: job.type,
    level: job.level,
    salary: job.salary,
    postedDate: job.posted_date,
    description: job.description,
    responsibilities: job.responsibilities,
    qualifications: job.qualifications,
    benefits: job.benefits,
    applicationCount: job.application_count,
    is_active: job.is_active,
  }))
}

/**
 * Fetch a single job posting by ID
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    department: data.department,
    location: data.location,
    type: data.type,
    level: data.level,
    salary: data.salary,
    postedDate: data.posted_date,
    description: data.description,
    responsibilities: data.responsibilities,
    qualifications: data.qualifications,
    benefits: data.benefits,
    applicationCount: data.application_count,
  }
}

/**
 * Filter jobs by search query, location, and department
 */
export async function searchJobs(
  searchQuery?: string,
  location?: string,
  department?: string
): Promise<Job[]> {
  let query = supabase
    .from('job_postings')
    .select('*')
    .eq('is_active', true)

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,department.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  if (location && location !== 'all') {
    query = query.ilike('location', `%${location}%`)
  }

  if (department && department !== 'all') {
    query = query.eq('department', department)
  }

  const { data, error } = await query.order('posted_date', { ascending: false })

  if (error) {
    console.error('Error searching jobs:', error)
    return []
  }

  return data.map(job => ({
    id: job.id,
    title: job.title,
    department: job.department,
    location: job.location,
    type: job.type,
    level: job.level,
    salary: job.salary,
    postedDate: job.posted_date,
    description: job.description,
    responsibilities: job.responsibilities,
    qualifications: job.qualifications,
    benefits: job.benefits,
    applicationCount: job.application_count,
  }))
}

/**
 * Submit a new job application
 */
export async function submitJobApplication(application: JobApplication): Promise<boolean> {
  // Generate anonymous ID if not provided
  const anonymousId = application.anonymousId || generateAnonymousId()
  
  const { error } = await supabase
    .from('job_applications')
    .insert({
      anonymous_id: anonymousId,
      job_id: application.jobId,
      status: 'new',
      first_name: application.firstName,
      last_name: application.lastName,
      email: application.email,
      phone: application.phone,
      location: application.location,
      resume_file_name: application.resumeFileName || null,
      resume_url: application.resumeUrl || null,
      cover_letter: application.coverLetter,
      linkedin: application.linkedin || null,
      portfolio: application.portfolio || null,
      is_revealed: false,
    })

  if (error) {
    console.error('Error submitting application:', error)
    return false
  }

  return true
}

// Helper function to generate anonymous ID
function generateAnonymousId(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `APL-${year}-${timestamp}-${random}`
}

/**
 * Get all job applications (for HR/recruiter dashboard)
 */
export async function getAllApplications(): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_postings (
        title,
        department
      )
    `)
    .order('applied_date', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return []
  }

  return data.map((app: any) => ({
    id: app.id,
    anonymousId: app.anonymous_id,
    jobId: app.job_id,
    jobTitle: app.job_postings?.title || '',
    department: app.job_postings?.department || '',
    status: app.status,
    appliedDate: app.applied_date,
    firstName: app.first_name,
    lastName: app.last_name,
    email: app.email,
    phone: app.phone,
    location: app.location,
    resumeFileName: app.resume_file_name,
    resumeUrl: app.resume_url,
    coverLetter: app.cover_letter,
    linkedin: app.linkedin,
    portfolio: app.portfolio,
    isRevealed: app.is_revealed,
    revealedAt: app.revealed_at,
    revealedBy: app.revealed_by,
    notes: app.notes,
    rating: app.rating,
    interviewDate: app.interview_date,
  }))
}

/**
 * Get applications for a specific job
 */
export async function getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_postings (
        title,
        department
      )
    `)
    .eq('job_id', jobId)
    .order('applied_date', { ascending: false })

  if (error) {
    console.error('Error fetching applications for job:', error)
    return []
  }

  return data.map((app: any) => ({
    id: app.id,
    anonymousId: app.anonymous_id,
    jobId: app.job_id,
    jobTitle: app.job_postings?.title || '',
    department: app.job_postings?.department || '',
    status: app.status,
    appliedDate: app.applied_date,
    firstName: app.first_name,
    lastName: app.last_name,
    email: app.email,
    phone: app.phone,
    location: app.location,
    resumeFileName: app.resume_file_name,
    resumeUrl: app.resume_url,
    coverLetter: app.cover_letter,
    linkedin: app.linkedin,
    portfolio: app.portfolio,
    isRevealed: app.is_revealed,
    revealedAt: app.revealed_at,
    revealedBy: app.revealed_by,
    notes: app.notes,
    rating: app.rating,
    interviewDate: app.interview_date,
  }))
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: "new" | "reviewing" | "interview-scheduled" | "interviewed" | "offer" | "rejected" | "withdrawn"
): Promise<boolean> {
  // Determine if identity should be hidden based on status
  const revealAllowedStatuses = ['interviewed', 'offer']
  const shouldHideIdentity = !revealAllowedStatuses.includes(status)
  
  const updateData: any = { status }
  
  // If changing to a status that doesn't allow reveal, hide identity
  if (shouldHideIdentity) {
    updateData.is_revealed = false
    updateData.revealed_at = null
    updateData.revealed_by = null
  }
  
  const { error } = await supabase
    .from('job_applications')
    .update(updateData)
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating application status:', error)
    return false
  }

  return true
}

/**
 * Reveal applicant information
 */
export async function revealApplicantInfo(
  applicationId: string,
  recruiterName: string
): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .update({
      is_revealed: true,
      revealed_at: new Date().toISOString(),
      revealed_by: recruiterName,
    })
    .eq('id', applicationId)

  if (error) {
    console.error('Error revealing applicant info:', error)
    return false
  }

  return true
}

/**
 * Delete an application
 */
export async function deleteApplication(applicationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', applicationId)

  if (error) {
    console.error('Error deleting application:', error)
    return false
  }

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent('applicationUpdated'))

  return true
}

/**
 * Add or update notes for an application
 */
export async function updateApplicationNotes(
  applicationId: string,
  notes: string
): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .update({ notes })
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating application notes:', error)
    return false
  }

  return true
}

/**
 * Rate an application
 */
export async function rateApplication(
  applicationId: string,
  rating: number
): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .update({ rating })
    .eq('id', applicationId)

  if (error) {
    console.error('Error rating application:', error)
    return false
  }

  return true
}

/**
 * Create a new job posting
 */
export async function createJob(job: Omit<Job, 'id' | 'applicationCount'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      level: job.level,
      salary: job.salary,
      posted_date: job.postedDate,
      description: job.description,
      responsibilities: job.responsibilities,
      qualifications: job.qualifications,
      benefits: job.benefits,
      is_active: true,
      application_count: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating job:', error)
    return null
  }

  return data.id
}

/**
 * Schedule an interview for an application
 */
export async function scheduleInterview(
  applicationId: string,
  interviewDate: string,
  notes?: string
): Promise<boolean> {
  const updateData: any = {
    status: 'interview-scheduled',
    interview_date: interviewDate,
  }
  
  if (notes) {
    updateData.notes = notes
  }
  
  const { error } = await supabase
    .from('job_applications')
    .update(updateData)
    .eq('id', applicationId)

  if (error) {
    console.error('Error scheduling interview:', error)
    return false
  }

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent('applicationUpdated'))

  return true
}

/**
 * Get job statistics
 */
export async function getJobStatistics() {
  const { data: jobsData } = await supabase
    .from('job_postings')
    .select('id, application_count')
    .eq('is_active', true)

  const { data: applicationsData } = await supabase
    .from('job_applications')
    .select('status')

  const totalJobs = jobsData?.length || 0
  const totalApplications = applicationsData?.length || 0
  const newApplications = applicationsData?.filter(app => app.status === 'new').length || 0
  const reviewing = applicationsData?.filter(app => app.status === 'reviewing').length || 0
  const interviewed = applicationsData?.filter(app => app.status === 'interviewed').length || 0

  return {
    totalJobs,
    totalApplications,
    newApplications,
    reviewing,
    interviewed,
  }
}


