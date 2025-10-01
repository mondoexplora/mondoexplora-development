# Content Creator Admin Guide

## 🎯 Overview

The Content Creator Admin System allows you to manage content creators, approve new registrations, and control access to your blog platform.

## 🔐 Accessing the Admin Dashboard

**URL**: `http://localhost:5000/creator/admin`

**⚠️ SECURE ACCESS**: The admin dashboard now requires authentication. Only authorized administrators can access this portal.

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `mondoexplora@gmail.com`

**⚠️ IMPORTANT**: Change the default password immediately after first login for security!

## 📊 Dashboard Features

### Statistics Overview
- **Total Creators**: All registered content creators
- **Pending Approval**: New registrations waiting for approval
- **Active Creators**: Approved and active content creators
- **Total Posts**: All blog posts across the platform

### Pending Approvals Section
Shows all new registrations that need your review:

**For each pending creator, you can see:**
- Full name and username
- Email address
- Nationality
- Registration date
- Current status (Pending)

**Actions available:**
- **View**: See detailed creator profile and posts
- **Approve**: Grant access to the content creator portal
- **Reject**: Deny access (account becomes inactive)

### Active Creators Section
Shows all approved and active content creators:

**For each active creator, you can see:**
- Full name and username
- Email address
- Number of posts published
- Join date
- Current status (Active)

**Actions available:**
- **View**: See detailed creator profile and posts
- **Deactivate**: Temporarily disable their account

## ✅ How to Approve New Registrations

### Step 1: Login to Admin Portal
1. Go to `http://localhost:5000/creator/admin`
2. Enter your admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign In"

### Step 2: Check Pending Approvals
1. Once logged in, you'll see the admin dashboard
2. Look at the "Pending Approvals" section
3. Review the creator's information

### Step 2: Review Creator Details
1. Click **"View"** to see the full creator profile
2. Check their:
   - Personal information
   - Bio and interests
   - Any existing posts
   - Registration date

### Step 3: Approve or Reject
**To Approve:**
1. Click the **"Approve"** button
2. The creator will immediately gain access to the portal
3. They can now log in and create content

**To Reject:**
1. Click the **"Reject"** button
2. Confirm the action
3. The creator's account becomes inactive

## 🎫 Managing Invitation Codes

### Creating New Invitation Codes
1. Scroll to the "Create Invitation Code" section
2. Enter a unique code (e.g., `CREATOR2024`, `TRAVELWRITER`)
3. Optionally set an expiration date
4. Click **"Create Invitation Code"**

### Viewing Active Codes
The "Active Invitation Codes" section shows:
- All active invitation codes
- Creation dates
- Expiration dates (if set)
- Usage status (Used/Active)

### Current Sample Codes
These codes are already created and ready to use:
- `CREATOR2024`
- `TRAVELWRITER`
- `BLOGGER2024`

## 👥 Sample Content Creators

For testing purposes, these accounts are already created:

### Approved Creators (Can log in immediately)
1. **Sarah Johnson** (Expert Level)
   - Email: `sarah@example.com`
   - Password: `password123`
   - Status: Active

2. **Mike Chen** (Intermediate Level)
   - Email: `mike@example.com`
   - Password: `password123`
   - Status: Active

### Registration Process
1. New users register with an invitation code
2. They appear in "Pending Approvals"
3. You review and approve/reject them
4. Approved users can log in and create content

## 🔄 Workflow Summary

### For New Content Creators:
1. **Register** → Use invitation code at `/creator/register`
2. **Wait for Approval** → Account shows as "Pending"
3. **Get Approved** → Admin approves via dashboard
4. **Start Creating** → Can log in and create posts

### For Admins:
1. **Monitor** → Check admin dashboard regularly
2. **Review** → View pending creator profiles
3. **Decide** → Approve or reject based on criteria
4. **Manage** → Deactivate creators if needed

## 🛡️ Security Features

- **Secure Admin Authentication**: Admin portal requires login credentials
- **Invitation-Only Registration**: Only invited users can register
- **Admin Approval Required**: All new creators need approval
- **Account Deactivation**: Admins can deactivate problematic accounts
- **Session Management**: Secure login/logout system
- **Role-Based Access**: Different admin roles (admin, super_admin)
- **Password Protection**: Hashed passwords with secure authentication

## 📱 Mobile Responsive

The admin dashboard works perfectly on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Quick Start Guide

1. **Login to Admin Portal**: 
   - Go to `http://localhost:5000/creator/admin`
   - Username: `admin`, Password: `admin123`
2. **Review Pending Approvals**: Check new registrations
3. **Approve Quality Creators**: Click "Approve" for good candidates
4. **Create Invitation Codes**: Generate codes for new creators
5. **Monitor Activity**: Check active creators and their posts
6. **Logout**: Click "Logout" when finished

## 📞 Support

If you need help with the admin system:
- Check the creator profiles for detailed information
- Use the "View" button to see full creator details
- Monitor the statistics for platform growth
- Create new invitation codes as needed

---

**Remember**: The admin dashboard is your control center for managing content creators. Regular monitoring ensures quality content and a healthy community! 