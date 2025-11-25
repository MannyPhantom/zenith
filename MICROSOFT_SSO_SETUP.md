# Microsoft 365 SSO Implementation Guide

This guide walks you through setting up Microsoft 365 (Azure AD) Single Sign-On with multi-tenant architecture for your Zenith SaaS application.

## 🎯 Architecture Overview

Your implementation includes:
- **Multi-tenant architecture**: Each organization gets isolated data
- **Automatic organization creation**: First user from a domain creates the org
- **Domain-based assignment**: Users auto-join their organization by email domain
- **Row-Level Security (RLS)**: Database-level data isolation
- **7,000+ user scalability**: Designed for enterprise-scale deployments

---

## 📋 Prerequisites

- Supabase project (get from https://supabase.com)
- Microsoft Azure account (free tier works)
- Node.js and npm installed

---

## Step 1: Set Up Microsoft Azure AD App

### 1.1 Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: `Zenith SaaS - Production`
   - **Supported account types**: Select **Accounts in any organizational directory (Any Azure AD directory - Multitenant)**
   - **Redirect URI**: 
     - Type: `Web`
     - URL: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
5. Click **Register**

### 1.2 Get Application Credentials

1. On the app overview page, copy these values:
   - **Application (client) ID** - you'll need this
   - **Directory (tenant) ID** - you'll need this

2. Go to **Certificates & secrets**
3. Click **New client secret**
4. Add description: "Supabase SSO"
5. Set expiration: 24 months (or as per your policy)
6. Click **Add**
7. **IMPORTANT**: Copy the secret **Value** immediately (it won't show again)

### 1.3 Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `openid`
   - `email`
   - `profile`
   - `User.Read`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

### 1.4 Configure Authentication

1. Go to **Authentication**
2. Under **Implicit grant and hybrid flows**, enable:
   - ✅ ID tokens (used for implicit and hybrid flows)
3. Click **Save**

---

## Step 2: Configure Supabase

### 2.1 Run Multi-Tenant Schema Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `multi-tenant-schema.sql`
4. Copy all contents and paste into SQL Editor
5. Click **Run**
6. Verify tables created:
   - `organizations`
   - `user_profiles`
   - `organization_invitations`

### 2.2 Enable Microsoft OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Azure (Microsoft)**
3. Enable the toggle
4. Fill in:
   - **Azure Client ID**: (from Step 1.2)
   - **Azure Secret**: (from Step 1.2)
   - **Azure Tenant ID**: Use `common` for multi-tenant or specific tenant ID
5. Click **Save**

### 2.3 Update Redirect URLs in Azure

1. Go back to Azure Portal → Your app → **Authentication**
2. Add these Redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)
3. Click **Save**

### 2.4 Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

---

## Step 3: Configure Your Application

### 3.1 Update Environment Variables

Create or update `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Microsoft OAuth (optional, for reference)
VITE_AZURE_CLIENT_ID=your_client_id
VITE_AZURE_TENANT_ID=common
```

### 3.2 Install Dependencies

The application already has `@supabase/supabase-js` installed. No additional dependencies needed!

---

## Step 4: Test the Implementation

### 4.1 Development Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173`

3. Click the **"Sign in with Microsoft"** button in the header

4. Sign in with a Microsoft 365 account

5. Verify:
   - User is redirected back to the app
   - Organization is auto-created (check Supabase database)
   - User profile is created
   - User can access protected routes

### 4.2 Multi-Tenant Testing

Test with multiple users from different domains:

1. **User 1**: `john@company1.com`
   - Should create organization "company1.com"
   - Becomes organization owner

2. **User 2**: `jane@company1.com`
   - Auto-joins "company1.com" organization
   - Becomes member

3. **User 3**: `bob@company2.com`
   - Creates new organization "company2.com"
   - Cannot see company1.com data

---

## 🔒 Security Features

### Row-Level Security (RLS)

All tables have RLS policies that ensure:
- Users only see data from their organization
- Data queries are automatically scoped by `organization_id`
- No manual filtering needed in application code

### Automatic Data Isolation

```sql
-- This query automatically filters by organization
SELECT * FROM projects;  -- Only returns current user's org projects
```

The RLS policies handle this automatically!

---

## 🏢 Organization Management

### Auto-Organization Creation

When a user signs in with Microsoft 365:
1. System extracts email domain (e.g., `@acme.com`)
2. Checks if organization exists for that domain
3. Creates new organization if needed
4. Assigns user to organization
5. First user becomes `owner`, others become `member`

### User Roles

- **Owner**: Full control, can manage organization settings
- **Admin**: Can manage users and data
- **Member**: Standard access
- **Viewer**: Read-only access

### Inviting Users

Users from the same email domain automatically join the same organization. You can also implement manual invitations using the `organization_invitations` table.

---

## 📊 Database Structure

### Key Tables

```
organizations (tenant root)
├── user_profiles (users in this org)
├── projects (org-specific projects)
├── tasks (org-specific tasks)
├── cs_clients (org-specific clients)
└── ... (all other data tables)
```

### Organization Fields

```typescript
{
  id: UUID,
  name: string,
  domain: string,  // e.g., "acme.com"
  slug: string,    // e.g., "acme-com"
  subscription_tier: "free" | "starter" | "professional" | "enterprise",
  max_users: number,
  settings: object
}
```

---

## 🚀 Scaling to 7,000+ Users

### Performance Optimizations

1. **Database Indexes**: All organization_id columns are indexed
2. **RLS Policies**: Use indexes for fast filtering
3. **Connection Pooling**: Supabase handles this automatically
4. **Caching**: Implement application-level caching for user profiles

### Supabase Plan Recommendations

For 7,000 users:
- **Pro Plan** ($25/mo): Up to 100,000 active users
- **Team Plan** ($599/mo): Better support and resources
- **Enterprise**: Custom pricing for >100K users

### Monitoring

1. Go to Supabase Dashboard → **Database** → **Roles**
2. Monitor connection count
3. Set up alerts for high usage
4. Use Supabase's built-in analytics

---

## 🔧 Troubleshooting

### Issue: "Invalid redirect URI"

**Solution**: Ensure redirect URIs match exactly in both Azure and Supabase:
- Azure: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- Supabase Provider Settings: Automatically configured

### Issue: "User not assigned to organization"

**Solution**: Check the `handle_new_user()` trigger:
```sql
SELECT * FROM public.user_profiles WHERE id = 'user-id';
```

### Issue: "Cannot see organization data"

**Solution**: Verify RLS policies are enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Issue: "Multiple organizations created for same domain"

**Solution**: The `handle_new_user()` function should prevent this. Check:
```sql
SELECT * FROM public.organizations WHERE domain = 'your-domain.com';
```

---

## 📝 Next Steps

1. ✅ **Customize Organization Settings**: Add logo, branding, etc.
2. ✅ **Implement User Management UI**: Create admin panel
3. ✅ **Add Billing Integration**: Connect with Stripe/PayPal
4. ✅ **Set up Email Notifications**: Welcome emails, invitations
5. ✅ **Create Analytics Dashboard**: Track organization usage
6. ✅ **Implement Audit Logs**: Track user actions

---

## 🆘 Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Microsoft Identity Docs**: https://docs.microsoft.com/en-us/azure/active-directory/
- **Your Implementation**: Check the auth context in `src/contexts/AuthContext.tsx`

---

## 📄 File Structure

```
zenith-saas/
├── multi-tenant-schema.sql          # Database schema
├── MICROSOFT_SSO_SETUP.md           # This guide
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── hooks/
│   │   └── useAuth.ts               # Auth hook
│   ├── lib/
│   │   └── supabase.ts              # Supabase client
│   └── components/
│       └── header.tsx               # Microsoft login button
```

---

**Congratulations!** 🎉 Your multi-tenant Microsoft 365 SSO is ready!



