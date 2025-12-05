# 👥 Role Management Guide

## ✅ What's New

You can now manage user roles in your organization! Owners and admins can promote users to owner, admin, member, or viewer.

---

## 🚀 How to Access

### Option 1: From Header Dropdown
1. Sign in to your app
2. Click your profile picture in the top right
3. Click **"Organization Settings"** from the dropdown menu

### Option 2: Direct URL
Navigate to: `http://localhost:5173/settings/organization`

---

## 📋 Setup (One-Time)

If you already ran the main migration, you need to add one more policy to allow role updates:

### Step 1: Run Additional Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **SQL Editor**
3. Click **New query**
4. Open the file: `add-admin-role-update-policy.sql`
5. Copy all contents
6. Paste into Supabase SQL Editor
7. Click **Run**
8. You should see a table showing your RLS policies

**That's it!** The policy is now active.

---

## 👤 User Roles Explained

### 🟣 Owner
- **Full control** of the organization
- Can manage billing and subscription
- Can promote/demote other users (including making other owners)
- Can delete the organization
- **First user** from each domain automatically becomes owner

### 🔵 Admin
- Can manage users and change their roles
- Can create and delete projects
- Can manage organization settings
- **Cannot** manage billing or delete organization

### 🟢 Member
- Can create and manage projects
- Can view all organization data
- Can collaborate with team members
- **Cannot** change user roles or organization settings

### ⚪ Viewer
- **Read-only** access to all projects and data
- Can view reports and dashboards
- **Cannot** create or modify any data

---

## 🔄 How to Change User Roles

### As an Owner or Admin:

1. Navigate to **Organization Settings**
2. Search for the user (by name, email, or current role)
3. Click the **⋯** (three dots) next to their name
4. Click **"Change Role"**
5. Select new role:
   - Owner
   - Admin
   - Member
   - Viewer
6. Click **"Update Role"**

**Done!** The user's role is updated immediately.

---

## 🎯 Common Scenarios

### Scenario 1: Make a Co-Founder an Owner

**Problem:** Jane joined after me, but she's also a founder and needs full access.

**Solution:**
1. Go to Organization Settings
2. Find Jane in the user list
3. Click ⋯ → Change Role
4. Select **Owner**
5. Click Update Role

**Result:** Jane now has full owner permissions!

---

### Scenario 2: Promote a Team Lead to Admin

**Problem:** Bob manages a team and needs to add/remove members.

**Solution:**
1. Go to Organization Settings
2. Find Bob
3. Change role to **Admin**

**Result:** Bob can now manage users and organization settings (but not billing).

---

### Scenario 3: Add a Contractor as Viewer

**Problem:** Need to give a consultant read-only access.

**Solution:**
1. Invite them to sign in with their Microsoft account
2. They'll automatically join as **Member**
3. Go to Organization Settings
4. Find them and change role to **Viewer**

**Result:** They can view everything but can't modify data.

---

### Scenario 4: Remove Owner Privileges

**Problem:** A co-founder left the company, need to demote them.

**Solution:**
1. Go to Organization Settings
2. Find the user
3. Change their role to **Member** or **Viewer**
4. (Optional) Admins can also set `is_active` to false in database

**Result:** They lose owner privileges immediately.

---

## 🛡️ Security & Best Practices

### Multiple Owners
✅ **Recommended:** Have 2-3 owners for redundancy
- If one owner leaves, others can still manage the organization
- Distribute administrative burden

### Principle of Least Privilege
✅ **Recommended:** Give users the minimum role they need
- Most users should be **Members**
- Only promote to Admin when necessary
- Reserve Owner for founders/executives

### Regular Audits
✅ **Recommended:** Review user roles quarterly
- Remove access for users who left
- Adjust roles as responsibilities change
- Check for inactive accounts

---

## 🔒 Permission Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View all data | ✅ | ✅ | ✅ | ✅ |
| Create projects | ✅ | ✅ | ✅ | ❌ |
| Manage projects | ✅ | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ |
| Organization settings | ✅ | ✅ | ❌ | ❌ |
| Manage billing | ✅ | ❌ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |

---

## 📊 Organization Settings Page Features

### Dashboard Overview
- Count of users by role (Owners, Admins, Members, Viewers)
- Visual role badges with icons
- Role permission descriptions

### User List
Shows for each user:
- Full name and avatar
- Email address
- Current role with color-coded badge
- Job title and department
- Last active date
- "You" badge for your own account

### Search & Filter
- Search by name, email, role, or department
- Real-time filtering
- Instant results

### Role Management
- Click ⋯ menu next to any user
- Change role dialog with descriptions
- Instant updates
- Toast notifications for success/errors

---

## 🧪 Testing Role Management

### Test 1: Make Another Owner
1. Sign in as the first owner
2. Add a second user from your domain
3. Go to Organization Settings
4. Change their role to "Owner"
5. Sign in as that user (incognito window)
6. Verify they can access Organization Settings

### Test 2: Admin Can Change Roles
1. Promote a user to Admin
2. Sign in as that admin user
3. They should be able to change other users' roles
4. They should NOT be able to change their own role

### Test 3: Member Cannot Access Settings
1. Sign in as a Member
2. Try to access Organization Settings
3. They should see: "Only owners and admins can change user roles"
4. They can VIEW the list but cannot change roles

---

## 🆘 Troubleshooting

### Issue: Can't see "Change Role" button

**Possible causes:**
1. You're not an Owner or Admin
2. You're trying to change your own role (not allowed)

**Fix:**
- Ask an existing Owner or Admin to change your role first

---

### Issue: "Unauthorized: Only admins can update user roles"

**Fix:**
1. Make sure you ran the `add-admin-role-update-policy.sql` migration
2. Check Supabase → Database → Policies
3. Verify policy "Admins can update user profiles in their organization" exists

---

### Issue: Can't access Organization Settings page

**Fix:**
1. Make sure you're signed in
2. Check that the route was added to `App.tsx`
3. Clear browser cache and refresh

---

## 💡 Pro Tips

### Tip 1: Use Role Badges as Quick Reference
The color-coded badges make it easy to identify user roles at a glance:
- 🟣 Purple = Owner
- 🔵 Blue = Admin  
- 🟢 Green = Member
- ⚪ Gray = Viewer

### Tip 2: Invite Users First, Assign Roles Later
1. Have users sign in with Microsoft first
2. They'll auto-join as Members
3. Then promote them to the appropriate role

### Tip 3: Multiple Owners for Redundancy
Always have at least 2 owners to avoid being locked out if one owner leaves or loses access.

### Tip 4: Document Your Role Assignment Process
Create internal documentation for:
- Who can approve Owner promotions
- Criteria for Admin role
- When to use Viewer role

---

## 🎉 Summary

You now have full role management capabilities:

✅ Owners and admins can change any user's role  
✅ Beautiful UI with search and filtering  
✅ Color-coded role badges  
✅ Permission descriptions  
✅ Secure database-level enforcement  
✅ Real-time updates  

**Next Steps:**
1. Run the additional migration if you haven't
2. Sign in and test the Organization Settings page
3. Promote your first admin or co-owner!

---

## 📚 Related Documentation

- `START_HERE_SSO.md` - Initial SSO setup
- `MICROSOFT_SSO_SETUP.md` - Detailed Azure configuration
- `MULTI_TENANT_QUICK_START.md` - Multi-tenancy overview
- `multi-tenant-schema.sql` - Full database schema

---

**Need help?** Check the troubleshooting section above or review the code in:
- `src/pages/OrganizationSettingsPage.tsx` - UI component
- `src/lib/tenant-context.ts` - Role management functions
- `multi-tenant-schema.sql` - Database policies





