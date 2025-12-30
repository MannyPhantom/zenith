# Workforce Management (WFM) Module

## Overview
The WFM module provides complete workforce management functionality including:
- Technician management
- Job/Work order tracking
- Schedule management
- Timesheet tracking
- Real-time statistics and reporting

## Database Setup

### 1. Run the SQL Schema
Execute the `wfm-schema.sql` file in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste the contents of wfm-schema.sql
# Execute the script
```

Or use the Supabase CLI:
```bash
supabase db push wfm-schema.sql
```

### 2. Verify Tables Created
The following tables should be created:
- `wfm_technicians` - Technician/employee records
- `wfm_jobs` - Jobs/work orders
- `wfm_schedules` - Schedule assignments
- `wfm_timesheets` - Time tracking
- `wfm_job_notes` - Job comments/notes

### 3. Sample Data
The schema includes sample data for testing. After running the schema:
- 4 sample technicians will be created
- 2 sample jobs will be created

## Features

### Dashboard
- **KPI Stats**: Total technicians, active jobs, completed jobs, pending timesheets
- **Recent Jobs**: Quick view of latest work orders
- **Real-time Updates**: All data synced with Supabase

### Jobs Management
- ✅ Create, edit, delete jobs/work orders
- ✅ Assign technicians to jobs
- ✅ Track job status (assigned, in-progress, completed, on-hold, cancelled)
- ✅ Set priority levels (low, medium, high, urgent)
- ✅ Customer information tracking
- ✅ Location tracking
- ✅ Estimated and actual hours
- ✅ Bulk selection and deletion
- ✅ Auto-generated job numbers (#001, #002, etc.)

### Technician Management
- ✅ Add, edit, delete technicians
- ✅ Track technician status (active, inactive, on-leave)
- ✅ Role assignment (technician, lead, supervisor)
- ✅ Contact information (email, phone)
- ✅ Track active jobs per technician
- ✅ Bulk selection and deletion
- ✅ Skills and certifications tracking (database ready)
- ✅ Hourly rate tracking (database ready)

### Timesheets (Database Ready)
The database schema is ready for timesheet functionality:
- Clock in/out tracking
- Break duration tracking
- Automatic hour calculation
- Timesheet approval workflow
- Job-specific time tracking

### Schedules (Database Ready)
The database schema is ready for scheduling:
- Daily schedules per technician
- Job assignments
- Time slot management
- Schedule status tracking

## API Functions

All API functions are in `src/lib/wfm-api.ts`:

### Technicians
- `getTechnicians()` - Get all active technicians
- `getTechnician(id)` - Get single technician
- `createTechnician(data)` - Create new technician
- `updateTechnician(id, data)` - Update technician
- `deleteTechnician(id)` - Soft delete technician
- `getTechnicianActiveJobs(id)` - Get active job count

### Jobs
- `getJobs()` - Get all active jobs with technician info
- `getJob(id)` - Get single job
- `createJob(data)` - Create new job (auto-generates job number)
- `updateJob(id, data)` - Update job
- `deleteJob(id)` - Soft delete job

### Schedules
- `getSchedules(techId?, startDate?, endDate?)` - Get schedules
- `createSchedule(data)` - Create schedule
- `updateSchedule(id, data)` - Update schedule
- `deleteSchedule(id)` - Delete schedule

### Timesheets
- `getTimesheets(techId?, jobId?)` - Get timesheets
- `createTimesheet(data)` - Create timesheet
- `updateTimesheet(id, data)` - Update timesheet
- `deleteTimesheet(id)` - Delete timesheet
- `clockIn(techId, jobId?, notes?)` - Quick clock in
- `clockOut(timesheetId, notes?)` - Quick clock out

### Job Notes
- `getJobNotes(jobId)` - Get all notes for a job
- `createJobNote(data)` - Add note to job
- `deleteJobNote(id)` - Delete note

### Statistics
- `getWFMStats()` - Get dashboard statistics

## Database Features

### Automatic Calculations
- **Job Numbers**: Auto-generated sequential numbers (#001, #002, etc.)
- **Timesheet Hours**: Automatically calculated from clock in/out times and break duration
- **Updated Timestamps**: Auto-updated on all record changes

### Indexes
Optimized indexes for fast queries on:
- Technician status and active status
- Job status, technician, and dates
- Schedule dates and assignments
- Timesheet clock-in times

### Row Level Security (RLS)
- RLS is enabled on all tables
- Default policy allows all operations for authenticated users
- Customize policies based on your security requirements

## Usage Example

```typescript
import { getTechnicians, createJob } from '@/lib/wfm-api'

// Get all technicians
const technicians = await getTechnicians()

// Create a new job
const newJob = await createJob({
  title: 'HVAC Repair',
  description: 'Fix air conditioning unit',
  customer_name: 'John Doe',
  customer_phone: '(555) 123-4567',
  location: '123 Main St',
  status: 'assigned',
  priority: 'high',
  technician_id: technicians[0].id,
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  estimated_hours: 4.0,
  is_active: true,
})
```

## Next Steps

### Planned Features
1. **Calendar View**: Visual calendar for job scheduling
2. **Timesheet Management**: Complete time tracking UI
3. **Mobile App**: Technician mobile app for field work
4. **GPS Tracking**: Real-time technician location
5. **Photo Uploads**: Job site photos
6. **Signature Capture**: Customer sign-off
7. **Parts/Inventory Integration**: Link with inventory module
8. **Reporting**: Advanced analytics and reports
9. **Notifications**: Real-time job updates
10. **Customer Portal**: Customer view for job status

## Migration from Mock Data

The old WorkforcePage with mock data has been backed up to `WorkforcePage.old.tsx`. 
The new Supabase-connected version is now active.

### Key Changes:
- ❌ Removed all hardcoded mock data
- ✅ Connected to Supabase database
- ✅ Real-time data fetching
- ✅ CRUD operations for technicians and jobs
- ✅ Proper loading states
- ✅ Error handling
- ✅ Auto-refresh after changes

## Troubleshooting

### "Supabase Not Configured" Message
Ensure your `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Tables Not Found
Run the `wfm-schema.sql` in your Supabase SQL Editor.

### Sample Data Not Appearing
The schema includes `ON CONFLICT DO NOTHING` to prevent duplicate sample data.
If you want to reset, delete the records and re-run the INSERT statements.

## Support
For issues or questions, check:
1. Supabase logs (Dashboard > Logs)
2. Browser console for errors
3. Network tab for API calls






