# Employee Photo Implementation Guide

## Overview
This implementation replaces pixelated placeholder icons with JPEG images from the employee portal for managers and employees.

## Changes Made

### 1. Database Schema
- Added `photo_url` field to `hr_employees` table
- Migration file: `add-employee-photo-migration.sql`
- Updated base schema: `hr-schema.sql`

### 2. Type Definitions
- Updated `Employee` interface in `src/lib/hr-api.ts` to include `photo_url?: string | null`
- API functions now properly fetch and return manager photos

### 3. UI Components
- Created reusable `EmployeeAvatar` component (`src/components/ui/employee-avatar.tsx`)
  - Supports JPEG images with fallback to initials
  - Handles image loading errors gracefully
  - Supports different sizes (sm, md, lg)
  - Optional status indicator

### 4. Updated Pages
- **Employee Directory** (`src/pages/employee/EmployeeDirectoryPage.tsx`)
  - Displays JPEG photos instead of placeholder SVGs
  - Falls back to initials if photo fails to load
  - Works in both grid and list views

- **Employee Portal** (`src/pages/employee/EmployeePortalPage.tsx`)
  - Updated welcome header to show employee photo

## Setup Instructions

### Step 1: Run Database Migration
```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE hr_employees 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_hr_employees_photo_url 
ON hr_employees(photo_url) WHERE photo_url IS NOT NULL;
```

Or use the migration file:
```bash
# In Supabase SQL Editor, run:
# add-employee-photo-migration.sql
```

### Step 2: Update Employee Data
Update employee records with JPEG photo URLs:

```sql
-- Example: Update employee photos
UPDATE hr_employees 
SET photo_url = 'https://your-employee-portal.com/photos/employee-id.jpg'
WHERE id = 'employee-uuid-here';
```

### Step 3: Photo URL Format
Photos should be:
- JPEG format (.jpg or .jpeg)
- Accessible via URL
- Recommended size: 200x200px or larger (will be cropped to circle)
- Stored in employee portal or CDN

## Usage

### Using EmployeeAvatar Component
```tsx
import { EmployeeAvatar } from '@/components/ui/employee-avatar'

<EmployeeAvatar
  name="John Doe"
  photoUrl={employee.photo_url}
  size="md"
  showStatus={true}
  status="active"
/>
```

### Displaying Manager Photos
When fetching employees with managers:
```tsx
const employees = await getAllEmployees()
employees.forEach(employee => {
  if (employee.manager?.photo_url) {
    // Manager photo is available
    console.log(employee.manager.photo_url)
  }
})
```

## Features

1. **Automatic Fallback**: If photo fails to load or is missing, displays initials
2. **Error Handling**: Gracefully handles broken image URLs
3. **Performance**: Only loads images when photo_url is provided
4. **Consistent Styling**: Maintains consistent avatar appearance across the app

## Notes

- Photos are displayed as circular avatars
- Placeholder SVG images (`/placeholder.svg?height=100&width=100`) are automatically replaced
- The system checks for valid photo URLs before attempting to display images
- Manager photos are automatically included when fetching employee data with manager relationships



