# How to Add Employee Photos

## Where to Input Photos

### Option 1: Add Employee Dialog (Recommended)
1. Navigate to the **HR** page (`/hr`)
2. Click the **"Add Employee"** button
3. Fill in the employee details
4. In the **"Photo URL (JPEG)"** field, enter the URL to the employee's photo
   - Example: `https://your-employee-portal.com/photos/john-doe.jpg`
   - Or: `https://cdn.company.com/employees/12345.jpg`
5. Click **"Add Employee"**

### Option 2: Direct Database Update (For Existing Employees)
If you need to update photos for existing employees, you can use SQL:

```sql
-- Update a specific employee's photo
UPDATE hr_employees 
SET photo_url = 'https://your-employee-portal.com/photos/employee-id.jpg'
WHERE id = 'employee-uuid-here';

-- Update multiple employees
UPDATE hr_employees 
SET photo_url = 'https://your-employee-portal.com/photos/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
WHERE department = 'Engineering';
```

### Option 3: Bulk Import via CSV
1. Export your employee data
2. Add a `photo_url` column with the photo URLs
3. Import back into the database

## Photo Requirements

- **Format**: JPEG (.jpg or .jpeg) recommended
- **Size**: 200x200px or larger (will be automatically cropped to circle)
- **Accessibility**: Photos must be accessible via public URL
- **Storage**: Can be stored in:
  - Employee portal
  - CDN (CloudFront, Cloudflare, etc.)
  - Supabase Storage
  - Any public image hosting service

## Example Photo URLs

```
https://employee-portal.company.com/photos/john-doe.jpg
https://cdn.company.com/avatars/12345.jpg
https://storage.googleapis.com/company-employees/photos/sarah-johnson.jpeg
```

## Where Photos Are Displayed

Once added, employee photos will automatically appear in:
- ✅ Employee Directory (`/employee/directory`)
- ✅ Employee Portal welcome header
- ✅ Manager avatars (when viewing employee details)
- ✅ Any component using the `EmployeeAvatar` component

## Notes

- If a photo URL is invalid or fails to load, the system will automatically fall back to showing initials
- Photos are displayed as circular avatars
- The `photo_url` field is optional - employees without photos will show their initials



