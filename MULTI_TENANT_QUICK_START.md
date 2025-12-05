# 🚀 Multi-Tenant Microsoft 365 SSO - Quick Start Guide

Get your multi-tenant Zenith SaaS application running with Microsoft 365 authentication in **15 minutes**!

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Configure Azure AD (5 minutes)

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Fill in:
   - **Name**: `Zenith SaaS`
   - **Account types**: `Accounts in any organizational directory (Multitenant)`
   - **Redirect URI**: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy the **Application (client) ID** and **Directory (tenant) ID**
5. Go to **Certificates & secrets** → **New client secret** → Copy the **Value**
6. Go to **API permissions** → Add `openid`, `email`, `profile`, `User.Read`

### Step 2: Configure Supabase (5 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Open `multi-tenant-schema.sql` and run it
4. Go to **Authentication** → **Providers** → Enable **Azure (Microsoft)**
5. Paste your Azure credentials:
   - **Client ID**: (from Azure)
   - **Client Secret**: (from Azure)
   - **Tenant ID**: Use `common` for multi-tenant
6. Go to **Settings** → **API** → Copy your **Project URL** and **anon key**

### Step 3: Configure Your App (5 minutes)

1. Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Install dependencies and run:

```bash
npm install
npm run dev
```

3. Open `http://localhost:5173` and click **"Sign in with Microsoft"**

**Done!** 🎉

---

## 🏢 How Multi-Tenancy Works

### Automatic Organization Creation

```
User signs in with john@acme.com
  ↓
System extracts domain: "acme.com"
  ↓
Creates organization "acme.com" (if not exists)
  ↓
Adds john as "owner" (first user) or "member"
  ↓
User can only see their organization's data
```

### Data Isolation

Every table has `organization_id`:
```sql
-- Your projects table
SELECT * FROM projects 
WHERE organization_id = 'user-org-id'  -- Automatic via RLS!
```

**Row-Level Security (RLS)** handles this automatically - no manual filtering needed!

### User Roles

- **Owner**: First user, full control
- **Admin**: Can manage users and settings
- **Member**: Standard access
- **Viewer**: Read-only

---

## 📊 Database Schema

### Core Tables

```
organizations
├── id (UUID)
├── name (text)
├── domain (text) - e.g., "acme.com"
├── slug (text) - e.g., "acme-com"
├── subscription_tier
└── max_users

user_profiles
├── id (UUID) → auth.users
├── organization_id → organizations
├── email
├── full_name
├── role
└── avatar_url

All existing tables now have:
├── organization_id → organizations
```

---

## 🔒 Security Features

✅ **Row-Level Security (RLS)**: Database-level data isolation  
✅ **Automatic tenant filtering**: No manual WHERE clauses needed  
✅ **Domain-based assignment**: Users auto-join their org  
✅ **Role-based access**: Owner, Admin, Member, Viewer  
✅ **Secure OAuth flow**: No passwords stored

---

## 🧪 Testing Multi-Tenancy

Test with users from different domains:

```
User 1: john@acme.com
  → Creates organization "acme.com"
  → Becomes owner
  → Creates projects, tasks, etc.

User 2: jane@acme.com
  → Joins organization "acme.com"
  → Becomes member
  → Can see John's projects ✅

User 3: bob@techcorp.com
  → Creates organization "techcorp.com"
  → Cannot see acme.com data ✅
```

---

## 💻 Using Auth in Your Code

### In Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, profile, organization, signOut, hasRole } = useAuth()

  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <h1>Welcome, {profile?.full_name}!</h1>
      <p>Organization: {organization?.name}</p>
      <p>Role: {profile?.role}</p>
      
      {hasRole(['owner', 'admin']) && (
        <button>Admin Action</button>
      )}
      
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/contexts/AuthContext'

<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### Tenant Context Utilities

```typescript
import { 
  getCurrentOrganizationId, 
  hasRole,
  getOrganizationUsers,
  inviteUserToOrganization
} from '@/lib/tenant-context'

// Get current org ID
const orgId = await getCurrentOrganizationId()

// Check role
const isAdmin = await hasRole(['owner', 'admin'])

// Get org users
const users = await getOrganizationUsers(orgId)

// Invite user
await inviteUserToOrganization('newuser@acme.com', 'member')
```

---

## 🎨 UI Components

### Microsoft Login Button (Already Added!)

The header component now includes:
- Microsoft login button with icon
- User avatar dropdown
- Organization name display
- Sign out functionality

### Onboarding Flow

Navigate users to `/onboarding` after first login to set up their organization.

---

## 📈 Scaling to 7,000+ Users

### Performance Tips

1. **Indexes are already created** on all `organization_id` columns
2. **RLS policies use indexes** for fast filtering
3. **Supabase handles connection pooling** automatically
4. **Add caching** for frequently accessed data

### Recommended Supabase Plan

- **0-100 users**: Free tier
- **100-1,000 users**: Pro plan ($25/mo)
- **1,000-7,000 users**: Pro plan (monitor resources)
- **7,000+ users**: Team/Enterprise plan

### Monitoring

1. Supabase Dashboard → **Database** → **Usage**
2. Watch connection count
3. Monitor query performance
4. Set up alerts

---

## 🔧 Common Operations

### Add Organization Logo

```typescript
const { error } = await supabase
  .from('organizations')
  .update({ 
    settings: { 
      ...organization.settings, 
      logo_url: 'https://...' 
    } 
  })
  .eq('id', organization.id)
```

### Update User Role

```typescript
import { updateUserRole } from '@/lib/tenant-context'

await updateUserRole(userId, 'admin')
```

### Get Organization Stats

```typescript
import { getOrganizationStats } from '@/lib/tenant-context'

const stats = await getOrganizationStats(organizationId)
// { userCount: 15, projectCount: 42, taskCount: 156 }
```

---

## 🐛 Troubleshooting

### Issue: Login button doesn't work

**Check:**
1. `.env` file has correct Supabase URL and key
2. Azure redirect URI matches exactly
3. Browser console for errors

### Issue: User not in organization

**Check:**
```sql
SELECT * FROM user_profiles WHERE email = 'user@example.com';
SELECT * FROM organizations WHERE domain = 'example.com';
```

The `handle_new_user()` trigger should create both automatically.

### Issue: Can't see data after login

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

Should see policies like `"Users can view projects in their organization"`

### Issue: Multiple orgs for same domain

**Check:**
```sql
SELECT * FROM organizations WHERE domain = 'example.com';
```

Should only be one. The trigger prevents duplicates with `LIMIT 1`.

---

## 📚 File Structure

```
zenith-saas/
├── multi-tenant-schema.sql              # Database migration
├── MICROSOFT_SSO_SETUP.md              # Detailed setup guide
├── MULTI_TENANT_QUICK_START.md         # This file!
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx             # Auth state & hooks
│   ├── hooks/
│   │   └── useAuth.ts                  # Auth hook export
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client
│   │   └── tenant-context.ts           # Tenant utilities
│   ├── components/
│   │   ├── header.tsx                  # Microsoft login button
│   │   └── onboarding/
│   │       └── OrganizationSetup.tsx   # Onboarding flow
│   └── pages/
│       └── OnboardingPage.tsx          # Onboarding page
```

---

## 🎯 Next Steps

### Immediate

- [ ] Run the migration in Supabase
- [ ] Configure Azure AD
- [ ] Test login with Microsoft 365 account
- [ ] Verify organization auto-creation

### Soon

- [ ] Customize organization onboarding
- [ ] Add organization settings page
- [ ] Implement user management UI
- [ ] Add billing integration
- [ ] Set up email invitations

### Later

- [ ] Add organization branding (logo, colors)
- [ ] Create admin dashboard
- [ ] Implement audit logs
- [ ] Add usage analytics
- [ ] Set up monitoring alerts

---

## 🆘 Need Help?

### Resources

- **Detailed Setup**: See `MICROSOFT_SSO_SETUP.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Azure AD Docs**: https://docs.microsoft.com/azure/active-directory/
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

### Common Questions

**Q: Can users be in multiple organizations?**  
A: Currently no, but you can modify the schema to support this.

**Q: How do I restrict by email domain?**  
A: Already implemented! Users auto-join orgs by email domain.

**Q: Can I use other OAuth providers?**  
A: Yes! Supabase supports Google, GitHub, GitLab, etc. Same pattern applies.

**Q: How do I migrate existing data?**  
A: Add `organization_id` to existing rows:
```sql
UPDATE projects SET organization_id = 'org-id' WHERE ...;
```

**Q: What happens when an employee leaves?**  
A: Deactivate them:
```sql
UPDATE user_profiles SET is_active = false WHERE id = 'user-id';
```

---

## ✅ Implementation Checklist

- [x] Multi-tenant database schema
- [x] Organizations and user profiles tables
- [x] Row-Level Security (RLS) policies
- [x] Automatic organization creation trigger
- [x] Auth context with SSO support
- [x] Microsoft login button in header
- [x] User profile dropdown with org info
- [x] Tenant isolation utilities
- [x] Organization onboarding flow
- [x] Protected route component
- [ ] Configure your Azure AD (your turn!)
- [ ] Configure your Supabase (your turn!)
- [ ] Test with real Microsoft 365 accounts

---

**You're all set!** 🚀 Your multi-tenant SaaS with Microsoft 365 SSO is ready to scale to 7,000+ users!

**Happy coding!** 💻✨







