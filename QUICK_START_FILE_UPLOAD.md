# Quick Start: File Upload with Supabase

## 🚀 5-Minute Setup

### 1. Database Migration (1 min)
In Supabase SQL Editor:
```sql
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS file_url TEXT;
```

### 2. Create Storage Bucket (2 min)
1. Supabase → Storage → Create bucket
2. Name: `project-files`
3. Public: `true`

### 3. Add Storage Policies (2 min)
In Supabase Storage → Policies:
```sql
-- Upload
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'project-files');

-- Download
CREATE POLICY "Allow downloads" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'project-files');

-- Delete
CREATE POLICY "Allow deletes" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'project-files');
```

### 4. Test (30 sec)
1. `npm run dev`
2. Go to any project → Files tab
3. Click "Upload Files"
4. Drag & drop a file
5. Done! 🎉

## ✅ What Works Now

- ✅ Drag-and-drop file upload
- ✅ Multiple file selection
- ✅ Upload progress indicator
- ✅ File download
- ✅ File delete
- ✅ Real-time file list updates
- ✅ Grid/List view toggle
- ✅ Search/filter files
- ✅ File statistics dashboard

## 📁 Files Created/Modified

**New Files:**
- `src/components/projects/upload-file-dialog.tsx` - Upload dialog with drag-and-drop
- `supabase-storage-setup.sql` - Database migration
- `FILE_UPLOAD_SETUP.md` - Complete documentation
- `QUICK_START.md` - This file

**Modified Files:**
- `src/lib/supabase-api.ts` - Added storage functions
- `src/lib/project-data.ts` - Added url field to ProjectFile
- `src/lib/project-data-supabase.ts` - Exported file operations
- `src/components/projects/file-management.tsx` - Full upload/download/delete support
- `src/components/projects/project-detail.tsx` - Pass onProjectUpdate prop

## 🔑 Key Functions

```typescript
// Upload file to storage
const result = await uploadFileToStorage(projectId, file)

// Save to database
await addProjectFile(projectId, {
  name: file.name,
  type: 'document',
  uploadedBy: 'User',
  uploadedAt: new Date().toISOString(),
  size: '2.5 MB',
  url: result.url
})

// Download file
const blob = await downloadFileFromStorage(filePath)

// Delete file
await deleteProjectFile(fileId, fileUrl)
```

## 🎯 Storage Structure

```
project-files/
├── {projectId}/
│   ├── {timestamp}-{random}.pdf
│   ├── {timestamp}-{random}.jpg
│   └── {timestamp}-{random}.docx
```

## 🐛 Troubleshooting

**Files not uploading?**
→ Check Storage policies in Supabase dashboard

**Downloads not working?**
→ Verify bucket is set to public

**Database errors?**
→ Run the ALTER TABLE migration

## 📚 Full Documentation

See `FILE_UPLOAD_SETUP.md` for:
- Security best practices
- Authentication setup
- Advanced features
- API reference
- Production considerations

---

**Status**: ✅ Ready to use!
**Setup Time**: ~5 minutes
**Difficulty**: Easy









