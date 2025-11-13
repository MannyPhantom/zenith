# Supabase Setup Guide for Zenith SaaS

This guide will help you set up Supabase as the backend database for the Project Management module.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- The Supabase JS client library (already installed)

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: `zenith-saas` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select closest to your users
4. Wait for the project to be provisioned (usually 1-2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from the project root
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. You should see success messages confirming table creation

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

3. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Migrate Initial Data

1. Open your browser console in the app
2. Run the migration function:
   ```javascript
   import { migrateInitialData } from './src/lib/migrate-data'
   migrateInitialData()
   ```

   Or create a temporary migration page:
   ```tsx
   // Add to src/pages/MigratePage.tsx
   import { migrateInitialData } from '@/lib/migrate-data'
   import { Button } from '@/components/ui/button'
   
   export default function MigratePage() {
     const handleMigrate = async () => {
       const result = await migrateInitialData()
       alert(result.success ? 'Migration successful!' : 'Migration failed')
     }
     
     return (
       <div className="p-8">
         <h1>Data Migration</h1>
         <Button onClick={handleMigrate}>Migrate Data</Button>
       </div>
     )
   }
   ```

## Step 5: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. Check that you see all tables with data:
   - `projects` (5 rows)
   - `tasks` (5 rows for first project)
   - `team_members` (4 rows for first project)
   - `milestones` (3 rows for first project)
   - `project_files` (2 rows)
   - `activities` (2 rows)

## Step 6: Start Using Supabase

The application is now configured to use Supabase! The following files have been updated:

- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/supabase-api.ts` - API functions for all database operations
- `src/lib/project-data.ts` - Updated to use Supabase API

## Database Schema Overview

### Tables

1. **projects** - Main project records
2. **tasks** - Project tasks with status, priority, assignees
3. **milestones** - Project milestones and deadlines
4. **team_members** - Team members assigned to projects
5. **project_files** - Files associated with projects
6. **activities** - Activity log for projects
7. **milestone_tasks** - Junction table for milestone-task relationships

### Key Features

- **Automatic timestamps** - `created_at` and `updated_at` managed automatically
- **Cascading deletes** - Deleting a project removes all related data
- **Task counts** - Automatically updated when tasks change
- **Indexes** - Optimized for common query patterns
- **Row Level Security** - Enabled (currently allows all operations)

## Security Notes

⚠️ **Important**: The current RLS policies allow all operations for demonstration purposes.

For production, you should:

1. Set up Supabase Auth
2. Update RLS policies to restrict access based on user authentication
3. Add user ownership/permission checks

Example policy for authenticated users:
```sql
-- Only allow users to see their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the complete schema SQL in Supabase
- Check that all tables were created successfully

### Error: "Invalid API key"
- Verify your `.env` file has the correct anon key
- Restart the development server after updating `.env`

### Error: "fetch failed"
- Check that your Supabase URL is correct
- Verify your project is running and not paused

### Data not appearing
- Check browser console for errors
- Verify data exists in Supabase Table Editor
- Confirm environment variables are loaded

## Development vs Production

**Development:**
- Use `.env` file for local development
- Data is stored in your Supabase project

**Production (Netlify/Vercel):**
1. Add environment variables in your hosting dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Redeploy your application

## Next Steps

1. ✅ Schema created
2. ✅ Data migrated
3. ✅ Application configured
4. 🔲 Add authentication (optional)
5. 🔲 Customize RLS policies (recommended for production)
6. 🔲 Add real-time subscriptions (optional)
7. 🔲 Set up database backups

## Useful Supabase Commands

```javascript
// Get all projects
import { supabase } from './src/lib/supabase'
const { data } = await supabase.from('projects').select('*')

// Add a new project
const { data } = await supabase.from('projects').insert({
  name: 'New Project',
  status: 'active',
  progress: 0,
  deadline: '2025-12-31',
  total_tasks: 0,
  completed_tasks: 0
})

// Update a task
const { data } = await supabase
  .from('tasks')
  .update({ status: 'done' })
  .eq('id', 'task-id')
```

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: Create an issue in your repository

---

**Ready to start building!** 🚀













