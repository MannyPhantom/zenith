# Supabase File Storage Setup Guide

This guide explains how to set up and use the file upload functionality with Supabase Storage for your project management system.

## What's Been Implemented

### 1. **Database Schema Updates**
- Added `file_url` column to `project_files` table to store Supabase Storage URLs

### 2. **Storage Functions** (`src/lib/supabase-api.ts`)
- `uploadFileToStorage()` - Upload files to Supabase Storage
- `downloadFileFromStorage()` - Download files from storage
- `deleteProjectFile()` - Delete files from both database and storage
- Updated `getProjectFiles()` and `addProjectFile()` to handle file URLs

### 3. **Upload Dialog Component** (`src/components/projects/upload-file-dialog.tsx`)
- Drag-and-drop file upload interface
- Multiple file selection support
- Upload progress indicator
- File type detection and validation
- Visual feedback for upload status

### 4. **Enhanced File Management** (`src/components/projects/file-management.tsx`)
- Real-time file list updates
- Download functionality
- Delete functionality with confirmation
- Grid and list view modes
- Search/filter capabilities
- File statistics dashboard

### 5. **Data Layer Integration** (`src/lib/project-data-supabase.ts`)
- Exported file operation functions
- Cache invalidation on file changes
- Event-driven updates

## Setup Instructions

### Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Add file_url column to project_files table
ALTER TABLE project_files 
ADD COLUMN IF NOT EXISTS file_url TEXT;
```

### Step 2: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **Create bucket**
3. Configure the bucket:
   - **Name**: `project-files`
   - **Public**: Set to `true` (for easy file access) or `false` (for private files with signed URLs)
   - **File size limit**: Set as needed (e.g., 10MB)
   - **Allowed MIME types**: Leave empty for all types, or specify allowed types

### Step 3: Set Up Storage Policies

1. Go to **Storage** → **Policies** → Select `project-files` bucket
2. Create the following policies:

#### Policy 1: Allow File Uploads
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'project-files');
```

#### Policy 2: Allow File Downloads
```sql
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-files');
```

#### Policy 3: Allow File Deletions
```sql
CREATE POLICY "Allow public deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'project-files');
```

**Note**: These policies allow public access. For production, you should restrict them based on authentication:

```sql
-- Example: Only authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');
```

### Step 4: Verify Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 5: Test the Implementation

1. **Start your development server**: `npm run dev`
2. **Navigate to a project** → Click **Files** tab
3. **Click "Upload Files"** button
4. **Test drag-and-drop** or click to browse
5. **Upload a file** and verify it appears in the list
6. **Test download** by clicking the download button
7. **Test delete** by clicking the menu → Delete

## File Upload Features

### Supported Features
- ✅ Drag-and-drop upload
- ✅ Multiple file selection
- ✅ Upload progress indicator
- ✅ File type detection (images, documents, code files)
- ✅ File size display
- ✅ Download files
- ✅ Delete files (with confirmation)
- ✅ Search/filter files
- ✅ Grid and list view modes
- ✅ Real-time file statistics

### File Type Icons
The system automatically detects and displays appropriate icons for:
- **Images**: jpg, jpeg, png, gif, svg, webp
- **Documents**: pdf, doc, docx, txt, rtf
- **Code**: js, ts, jsx, tsx, css, html, json, xml
- **Generic**: All other file types

## Usage

### Uploading Files

```typescript
// The upload dialog handles everything automatically
<UploadFileDialog
  open={uploadDialogOpen}
  onOpenChange={setUploadDialogOpen}
  projectId={project.id}
  onFileUploaded={handleFileUploaded}
/>
```

### Programmatic File Upload

```typescript
import { uploadFileToStorage, addProjectFile } from '@/lib/supabase-api'

// 1. Upload to storage
const result = await uploadFileToStorage(projectId, file)

// 2. Save metadata to database
if (result) {
  const fileId = await addProjectFile(projectId, {
    name: file.name,
    type: 'document',
    uploadedBy: 'User Name',
    uploadedAt: new Date().toISOString(),
    size: '2.5 MB',
    url: result.url,
  })
}
```

### Downloading Files

```typescript
import { downloadFileFromStorage } from '@/lib/supabase-api'

// Download file
const blob = await downloadFileFromStorage(filePath)
if (blob) {
  // Create download link
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
}
```

### Deleting Files

```typescript
import { deleteProjectFile } from '@/lib/supabase-api'

// Delete from both storage and database
const success = await deleteProjectFile(fileId, fileUrl)
```

## Security Considerations

### For Production

1. **Implement Authentication**
   - Restrict storage policies to authenticated users
   - Add user-specific access controls

2. **File Validation**
   - Validate file types on the server
   - Scan files for malware
   - Enforce file size limits

3. **Storage Policies**
   - Use Row Level Security (RLS)
   - Create policies based on project membership
   - Implement role-based access control

Example authenticated policy:
```sql
CREATE POLICY "Users can only access their project files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] IN (
    SELECT project_id::text 
    FROM projects 
    WHERE user_id = auth.uid()
  )
);
```

4. **File Organization**
   - Files are stored in folders by project ID: `{projectId}/{timestamp}-{random}.{ext}`
   - This prevents naming conflicts and organizes files by project

## Troubleshooting

### Files not uploading
- ✓ Check Supabase Storage policies are configured
- ✓ Verify bucket name is `project-files`
- ✓ Check browser console for errors
- ✓ Ensure file size is within limits

### Files not appearing in list
- ✓ Check `file_url` column exists in database
- ✓ Verify database policies allow reading
- ✓ Check browser console for API errors
- ✓ Refresh the page to clear cache

### Downloads not working
- ✓ Check storage policies allow SELECT
- ✓ Verify file URL is valid
- ✓ Check browser's download settings
- ✓ For private buckets, use signed URLs

### Policy errors
```
Error: new row violates row-level security policy
```
- This means RLS policies are blocking the operation
- Check and update your storage policies
- For development, you can use the public policies above
- For production, implement proper authentication-based policies

## Database Schema

### project_files Table
```sql
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  size TEXT NOT NULL,
  file_url TEXT,  -- NEW: Stores Supabase Storage URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Next Steps

1. **Add Authentication**
   - Implement user authentication with Supabase Auth
   - Update storage policies to use `auth.uid()`
   - Track which user uploaded each file

2. **File Previews**
   - Add image preview for uploaded images
   - PDF preview for documents
   - Syntax highlighting for code files

3. **File Versioning**
   - Track file version history
   - Allow file replacement
   - Restore previous versions

4. **Sharing & Permissions**
   - Share files with team members
   - Set file-level permissions
   - Generate temporary access links

5. **Advanced Features**
   - File compression
   - Automatic image optimization
   - Virus scanning
   - OCR for documents
   - Full-text search

## API Reference

### File Operations

```typescript
// Get all files for a project
getProjectFiles(projectId: string): Promise<ProjectFile[]>

// Upload file to storage
uploadFileToStorage(
  projectId: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | null>

// Add file metadata to database
addProjectFile(
  projectId: string, 
  file: Omit<ProjectFile, 'id'>
): Promise<string | null>

// Delete file (from storage and database)
deleteProjectFile(
  fileId: string, 
  fileUrl?: string
): Promise<boolean>

// Download file from storage
downloadFileFromStorage(
  filePath: string
): Promise<Blob | null>
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase dashboard for storage and database issues
3. Review the Supabase logs in the dashboard
4. Check network tab in browser dev tools for failed requests

## Success! 🎉

Your file upload system is now fully integrated with Supabase Storage. Users can:
- Upload files with drag-and-drop
- View files in grid or list mode
- Download files
- Delete files
- Search and filter files
- See real-time file statistics

All files are securely stored in Supabase and persist across sessions!

















