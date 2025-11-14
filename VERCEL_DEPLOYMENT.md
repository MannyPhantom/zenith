# Vercel Deployment Guide for Zenith SaaS

## 🚀 Quick Fix for "No Customer Success Data Found" Error

This error occurs when environment variables are not configured in Vercel. Follow these steps:

---

## Step 1: Configure Environment Variables in Vercel

### Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Settings** (⚙️) → **API**
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Found under "Project API keys"

### Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `zenith-saas` project
3. Navigate to **Settings** → **Environment Variables**
4. Add these two variables:

   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-public-key
   ```

5. **Important**: Select **All** environments (Production, Preview, Development)
6. Click **Save**

### Redeploy

After adding environment variables, you must redeploy:

**Option A: Trigger Redeploy**
1. Go to **Deployments** tab
2. Click `...` menu on latest deployment
3. Click **Redeploy**

**Option B: Push New Commit**
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

---

## Step 2: Set Up Supabase Database

### Run Database Schema

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy entire contents of `customer-success-schema.sql`
4. Click **Run**
5. Verify success messages

### Verify Tables Created

Go to **Table Editor** and confirm these tables exist:
- ✅ `csm_users`
- ✅ `cs_clients`
- ✅ `cs_health_history`
- ✅ `cs_tasks`
- ✅ `cs_milestones`
- ✅ `cs_interactions`

---

## Step 3: Populate Sample Data

### Option A: Use Migration Page (Recommended)

1. Visit: `https://your-app.vercel.app/migrate-customer-success`
2. Click **"Start Migration"**
3. Wait for completion
4. Click **"Go to Customer Success Dashboard"**

### Option B: Manual SQL Insert

See `CUSTOMER_SUCCESS_SETUP.md` for manual SQL insert commands.

---

## Verification Checklist

After deployment, verify:

- [ ] Environment variables are set in Vercel
- [ ] Database schema is created in Supabase
- [ ] Sample data is populated
- [ ] CSP page shows client list (not "No Data Found")
- [ ] Other modules load correctly

---

## Common Issues & Solutions

### Issue: Still seeing "No Customer Success Data Found"

**Causes:**
1. Environment variables not set
2. Wrong Supabase URL/key
3. Database schema not run
4. No data in database

**Solutions:**
```bash
# 1. Check browser console for errors
# 2. Verify Network tab shows Supabase requests
# 3. Confirm env vars in Vercel Settings
# 4. Check Supabase Table Editor for data
```

### Issue: "Failed to fetch" errors

**Solution:**
- Verify Supabase project is active (not paused)
- Check Supabase API settings allow anonymous access
- Confirm RLS policies are set correctly

### Issue: Environment variables not working

**Solution:**
- Must redeploy after adding env vars
- Variable names must match exactly: `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- No quotes needed in Vercel env var values

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | `eyJhbGc...` |

### Where to Find

- **Supabase Dashboard** → Settings → API
- Project URL is at the top
- Anon key is under "Project API keys"

---

## Local Development Setup

For local development, create `.env` file:

```bash
# .env (DO NOT COMMIT)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then:
```bash
npm run dev
```

---

## Production Deployment Workflow

```bash
# 1. Set up Supabase (one-time)
# - Create project at supabase.com
# - Run customer-success-schema.sql
# - Note URL and anon key

# 2. Configure Vercel (one-time)
# - Add VITE_SUPABASE_URL
# - Add VITE_SUPABASE_ANON_KEY
# - Set for all environments

# 3. Deploy
git push origin main

# 4. Populate data (one-time)
# Visit: https://your-app.vercel.app/migrate-customer-success
```

---

## Security Notes

⚠️ **Current RLS Policies**: Open for all operations (development mode)

**For Production**: Update policies in Supabase SQL Editor:

```sql
-- Drop open policies
DROP POLICY "Enable all operations for all users" ON cs_clients;

-- Add authenticated policies
CREATE POLICY "Authenticated users can view clients"
  ON cs_clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "CSMs can update assigned clients"
  ON cs_clients FOR UPDATE
  USING (csm_id = auth.uid());
```

---

## Support

- 📖 [Supabase Documentation](https://supabase.com/docs)
- 📖 [Vercel Documentation](https://vercel.com/docs)
- 📖 See `CUSTOMER_SUCCESS_SETUP.md` for detailed setup

---

## Quick Test

After deployment, test the connection:

1. Open browser console on your deployed app
2. Run:
   ```javascript
   console.log('Supabase configured:', 
     import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
   )
   ```
3. Should log `true` if configured correctly


