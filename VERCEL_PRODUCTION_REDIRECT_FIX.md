# 🔧 Fix Production Redirect URLs for Vercel

## Problem
Your members are logging in but getting "localhost refuses to connect" errors because redirect URLs are configured for localhost instead of your Vercel production URL.

## ✅ Solution: Update Redirect URLs in Supabase and Azure

### Step 1: Get Your Vercel Production URL

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `zenith-saas` project
3. Copy your production URL (e.g., `https://zenith-saas.vercel.app` or your custom domain)

### Step 2: Update Supabase Redirect URLs

**This is the most important step!**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration** (left sidebar)
4. Update these settings:

   **Site URL:**
   ```
   https://your-app.vercel.app
   ```
   (Replace with your actual Vercel URL)

   **Redirect URLs:**
   Add these URLs (one per line):
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app
   http://localhost:3000/**
   http://localhost:3000
   ```
   
   **Important:** Include both production and localhost URLs so you can test locally too.

5. Click **Save**

### Step 3: Update Azure Redirect URLs (Optional but Recommended)

While Azure redirects to Supabase first, it's good practice to include your production URL:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → Your app
3. Click **Authentication** (left sidebar)
4. Under **Redirect URIs**, make sure you have:
   - ✅ `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback` (required)
   - ✅ `https://your-app.vercel.app` (optional, for direct redirects)
   - ✅ `http://localhost:3000` (for local development)
5. Click **Save**

### Step 4: Verify Environment Variables in Vercel

Make sure your Vercel deployment has the correct environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Verify these are set:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Make sure they're set for **Production** environment
5. If you just added/changed them, **redeploy** your app

### Step 5: Redeploy Your Vercel App

After updating Supabase redirect URLs, trigger a new deployment:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click `...` menu on latest deployment
3. Click **Redeploy**

**Option B: Via Git**
```bash
git commit --allow-empty -m "Trigger redeploy after redirect URL fix"
git push
```

### Step 6: Test Authentication Flow

1. Visit your production URL: `https://your-app.vercel.app`
2. Click "Sign in with Microsoft"
3. Complete Microsoft authentication
4. You should be redirected back to: `https://your-app.vercel.app/hub`
5. **Not** to `localhost:3000` or `localhost:3001`

## 🔍 How Authentication Flow Works

```
User clicks "Sign in with Microsoft"
  ↓
Redirects to: Azure/Microsoft login
  ↓
User authenticates with Microsoft
  ↓
Microsoft redirects to: https://your-project.supabase.co/auth/v1/callback
  ↓
Supabase processes authentication
  ↓
Supabase redirects to: https://your-app.vercel.app/hub (from redirectTo in code)
```

The `redirectTo` in your code (`window.location.origin + '/hub'`) automatically uses the current domain, so it works for both:
- Local: `http://localhost:3000/hub`
- Production: `https://your-app.vercel.app/hub`

## ✅ Verification Checklist

- [ ] Supabase Site URL set to your Vercel production URL
- [ ] Supabase Redirect URLs include `https://your-app.vercel.app/**`
- [ ] Azure redirect URI includes Supabase callback URL
- [ ] Vercel environment variables are set correctly
- [ ] App has been redeployed after changes
- [ ] Members can log in without "localhost refuses to connect" errors

## 🆘 Still Having Issues?

### Issue: Still redirecting to localhost

**Check:**
1. Did you save the Supabase URL Configuration?
2. Did you redeploy your Vercel app after changes?
3. Clear browser cache and cookies
4. Try incognito/private browsing mode

### Issue: "Invalid redirect URI" error

**Fix:**
1. Make sure Supabase Redirect URLs includes: `https://your-app.vercel.app/**`
2. The `/**` wildcard is important - it allows all paths
3. No trailing slash on the base URL

### Issue: Authentication works but redirects to wrong page

**Check:**
1. The `redirectTo` in `AuthContext.tsx` uses `window.location.origin + '/hub'`
2. This should automatically use your production URL
3. If you want a different redirect, update line 164 in `src/contexts/AuthContext.tsx`

### Issue: Members see "localhost refuses to connect"

**This means:**
- Supabase is trying to redirect to localhost instead of your Vercel URL
- **Fix:** Update Supabase Site URL to your Vercel production URL (Step 2 above)

## 📝 Quick Reference

**Your Vercel URL:** `https://your-app.vercel.app` (replace with actual)

**Supabase Configuration:**
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

**Azure Configuration:**
- Redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**Code Configuration:**
- Already correct: Uses `window.location.origin` automatically




