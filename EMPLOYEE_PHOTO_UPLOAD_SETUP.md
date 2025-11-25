# Employee Photo File Upload Setup

## Overview
You can now upload employee photos directly as files (JPEG, PNG, etc.) instead of entering URLs. The files are stored in Supabase Storage.

## Setup Instructions

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Configure:
   - **Name**: `employee-photos`
   - **Public bucket**: ✅ **Yes** (checked)
   - Click **"Create bucket"**

### Step 2: Set Storage Policies

In Supabase Dashboard → Storage → employee-photos → Policies, add these policies:

**Option A: Public Access (Easier for testing)**
```sql
-- Allow public read access
CREATE POLICY "Allow public read access to employee photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'employee-photos');

-- Allow public upload
CREATE POLICY "Allow public upload employee photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'employee-photos');

-- Allow public delete
CREATE POLICY "Allow public delete employee photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'employee-photos');
```

**Option B: Authenticated Users Only (Recommended for production)**
```sql
-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read employee photos" 
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'employee-photos');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload employee photos" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'employee-photos');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete employee photos" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'employee-photos');
```

Or run the SQL file: `employee-photos-storage-setup.sql`

## How to Use

### Adding Employee with Photo

1. Navigate to **HR** page (`/hr`)
2. Click **"Add Employee"** button
3. Fill in employee details
4. In the **"Employee Photo"** section:
   - Click the file input
   - Select an image file (JPEG, PNG, WebP - max 5MB)
   - You'll see a preview of the selected photo
   - To remove: Click the X button on the preview
5. Alternatively, you can still enter a photo URL manually
6. Click **"Add Employee"**
7. The photo will be uploaded automatically and the URL saved to the database

### Photo Requirements

- **Formats**: JPEG (.jpg, .jpeg), PNG (.png), WebP (.webp)
- **Max Size**: 5MB per file
- **Recommended**: 200x200px or larger (will be cropped to circle)
- **Storage**: Files are stored in Supabase Storage bucket `employee-photos`

## Features

✅ **File Upload**: Direct file selection from your computer
✅ **Photo Preview**: See the photo before submitting
✅ **File Validation**: Automatic validation of file type and size
✅ **URL Fallback**: Still supports manual URL entry
✅ **Automatic Upload**: Photos are uploaded to Supabase Storage automatically
✅ **Public URLs**: Photos get public URLs stored in the database

## File Storage Structure

Photos are stored in Supabase Storage with this structure:
```
employee-photos/
  ├── 1234567890-abc123.jpg
  ├── 1234567891-def456.png
  └── ...
```

Each file gets a unique name based on timestamp and random string to avoid conflicts.

## Troubleshooting

### "Failed to upload photo" Error

1. **Check Storage Bucket**: Make sure `employee-photos` bucket exists
2. **Check Policies**: Verify storage policies are set correctly
3. **Check File Size**: Ensure file is under 5MB
4. **Check File Type**: Only image files are accepted

### Photo Not Displaying

1. **Check Database**: Verify `photo_url` is saved in `hr_employees` table
2. **Check URL**: The URL should be a Supabase Storage public URL
3. **Check Bucket**: Ensure bucket is set to "Public"

### Storage Bucket Not Found

If you see "bucket not found" error:
1. Go to Supabase Dashboard → Storage
2. Create bucket named exactly: `employee-photos`
3. Set it as Public
4. Refresh the page and try again

## Migration from URLs

If you have existing employees with photo URLs, they will continue to work. The system supports both:
- **File uploads** (new photos)
- **URLs** (existing photos or external URLs)



