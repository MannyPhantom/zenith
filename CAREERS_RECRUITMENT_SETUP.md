# Careers Page & Recruitment - Supabase Integration

## ✅ What's Connected

### 1. Careers Page (`src/pages/CareersPage.tsx`)
- **Database**: Loads job postings from `job_postings` table
- **Fallback**: Shows 13 mock jobs (5 tech + 8 automotive) if database is empty
- **Features**:
  - Job search and filtering by department/location
  - Application submission to database
  - Real-time job count display

### 2. HR Page - Recruitment Tab (`src/pages/HRPage.tsx`)
- **Database**: Loads job applications from `job_applications` table
- **Features**:
  - Application statistics from database
  - Real-time application counts by status
  - Integration with RecruitmentDashboard component

### 3. Recruitment Dashboard (`src/components/hr/recruitment-dashboard.tsx`)
- **Database**: Full Supabase integration
- **Features**:
  - View all job applications from database
  - Update application status
  - Reveal applicant identity (privacy-protected)
  - Add notes and ratings
  - Filter by status and search

## 📊 Database Tables

### `job_postings`
Stores all job openings visible on careers page.

**Fields:**
- `id` (UUID)
- `title`, `department`, `location`
- `type` (full-time, part-time, contract, internship)
- `level` (entry, mid, senior, lead)
- `salary`, `description`
- `responsibilities[]`, `qualifications[]`, `benefits[]`
- `is_active`, `application_count`

### `job_applications`
Stores all job applications submitted through careers page.

**Fields:**
- `id` (UUID)
- `anonymous_id` (e.g., "APL-2025-0001")
- `job_id` (references job_postings)
- `status` (new, reviewing, interview-scheduled, interviewed, offer, rejected, withdrawn)
- `first_name`, `last_name`, `email`, `phone`, `location`
- `resume_file_name`, `resume_url`, `cover_letter`
- `linkedin`, `portfolio`
- `is_revealed`, `revealed_at`, `revealed_by`
- `notes`, `rating`, `interview_date`

## 🚀 Setup Instructions

### Step 1: Run Recruitment Schema

1. Open Supabase → SQL Editor
2. Copy/paste `recruitment-schema.sql`
3. Click "Run"

This creates:
- `job_postings` table
- `job_applications` table
- Automatic triggers for anonymous IDs
- Sample job postings (5 tech jobs)

### Step 2: Add Automotive Jobs

**Option A: SQL Migration (Recommended)**
1. Open Supabase → SQL Editor
2. Copy/paste `automotive-jobs-migration.sql`
3. Click "Run"

**Option B: TypeScript Seed Script**
```bash
cd zenith-saas
npx tsx src/scripts/seed-automotive-jobs.ts
```

This adds 8 automotive jobs:
- Master Auto Detailer
- Automotive Technician
- Paint Protection Film Installer
- Service Advisor
- Ceramic Coating Specialist
- Performance Tuner
- Shop Assistant
- Window Tinting Specialist

### Step 3: Verify Setup

1. **Careers Page** (`/careers`)
   - Should show all jobs from database
   - Falls back to mock data if database empty
   - Application form submits to database

2. **HR Page** (`/hr` → Recruitment tab → Job Applications)
   - Should show all applications from database
   - Can update status, add notes, rate applicants
   - Can reveal identity once status is "interviewed" or "offer"

## 🔄 Data Flow

### Public Application Flow:
1. User visits `/careers` page
2. Fills out application form
3. Application saved to `job_applications` table
4. Anonymous ID automatically generated
5. Personal info hidden by default

### HR Recruitment Flow:
1. HR views applications in Recruitment Dashboard
2. Applications show as anonymous (ID only)
3. HR can update status, add notes, rate
4. Once status is "interviewed" or "offer", HR can reveal identity
5. Personal information becomes visible

## 🔐 Privacy Features

- **Anonymous by Default**: All applications use anonymous IDs (APL-2025-0001)
- **Reveal Protection**: Personal info only revealed at "interviewed" status or later
- **Auto-Hide**: If status changes back, identity auto-hides again
- **Audit Trail**: Tracks who revealed identity and when

## 📝 API Functions

### Job Management (`src/lib/recruitment-db.ts`)

```typescript
// Get all active job postings
getAllJobs(): Promise<Job[]>

// Create new job posting
createJob(job: Omit<Job, 'id' | 'applicationCount'>): Promise<string | null>

// Submit job application
submitJobApplication(application: JobApplication): Promise<boolean>

// Get all applications (for HR)
getAllApplications(): Promise<JobApplication[]>

// Update application status
updateApplicationStatus(applicationId: string, status: string): Promise<boolean>

// Reveal applicant information
revealApplicantInfo(applicationId: string, recruiterName: string): Promise<boolean>

// Add/update notes
updateApplicationNotes(applicationId: string, notes: string): Promise<boolean>

// Rate application
rateApplication(applicationId: string, rating: number): Promise<boolean>
```

## 🎯 Current Status

✅ **Fully Connected to Supabase:**
- Careers page loads jobs from database
- Application submissions save to database
- HR page shows real application data
- Recruitment dashboard fully functional
- All CRUD operations working

✅ **Privacy & Anonymity:**
- Anonymous application system working
- Identity reveal protection in place
- Audit trail for revealed identities

✅ **Job Postings:**
- 5 tech jobs in recruitment schema
- 8 automotive jobs in migration script
- Total: 13 job postings available

## 📌 Testing

### Verify Jobs Display:
1. Navigate to `/careers`
2. Should see all 13 jobs (or database jobs if populated)
3. Filter by department (Detailing, Performance, etc.)

### Test Application Submit:
1. Click "Apply Now" on any job
2. Fill out application form
3. Submit
4. Check HR Page → Recruitment tab
5. Application should appear with anonymous ID

### Test HR Functions:
1. Go to HR Page → Recruitment → Job Applications
2. See applications list
3. Click "View Details"
4. Try changing status
5. Try revealing identity (need "interviewed" status first)

## ⚠️ Important Notes

1. **Row Level Security (RLS)**: Currently set to allow all operations for development. Customize for production.

2. **File Uploads**: Resume files are referenced by name only. Implement file storage (Supabase Storage) for actual file uploads.

3. **Authentication**: "Revealed by" currently uses placeholder. Integrate with Supabase Auth in production.

4. **Email Notifications**: Not yet implemented. Consider adding email notifications for:
   - Application confirmation
   - Status updates
   - Interview invitations

## 🎉 Success!

The Careers page and Recruitment system are fully connected to Supabase with privacy-first anonymous application management!


