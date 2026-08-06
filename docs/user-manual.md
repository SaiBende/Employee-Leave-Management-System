# User Manual

## Introduction

The Employee Leave Management System allows employees to apply for leave and managers to approve or reject requests. It features role-based dashboards, leave history tracking, and team management.

## Getting Started

### Accessing the Application

1. Start the backend server and frontend dev server as described in the root README.md
2. Open `http://localhost:5173` in your browser
3. You will see the landing page with application overview

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | (first registration — see First-Time Setup) |
| Manager | alice@company.com | password123 |
| Employee | charlie@company.com | password123 |

---

## Employee Guide

### 1. Login

- Navigate to the Login page from the landing page
- Enter your email and password
- Click **Sign In**
- You will be redirected to your Employee Dashboard

### 2. Dashboard

The Employee Dashboard displays:
- **Leave Statistics**: Total, approved, pending, and rejected leave counts
- **Leave Balances**: Progress cards showing remaining Annual, Sick, and Personal leave days
- **Recent Activity**: Timeline of your recent leave requests with status updates

### 3. Apply for Leave

1. Click **Apply Leave** in the sidebar
2. Select **Leave Type** (Annual, Sick, Personal, Maternity, Paternity, Other)
3. Select **Start Date** and **End Date**
4. Enter a **Reason** for the leave
5. Click **Submit Application**
6. The leave will appear in Pending status on your dashboard

### 4. View Leave History

1. Click **Leave History** in the sidebar
2. View all your past and current leaves in a table
3. Use the **Status** dropdown to filter (All, Pending, Approved, Rejected, Cancelled)

### 5. View Leave Details

- Click the **Eye** icon on any leave entry to see full details
- Shows leave type, dates, reason, status, manager comments, who approved/rejected it, and timestamps
- Below the request information is the **Discussion** thread

### 6. Discussion on a Leave

- Every leave request has its own comment thread, available at **any status** (Pending, Approved, or Rejected)
- Post questions, clarifications, or notes — your manager and admins can reply
- The thread is independent of the approve/reject decision
- Approve/Reject/Cancel actions automatically add a system note like `APPROVED - ...`, `REJECTED - ...`, or `CANCELLED - ...` to the thread
- Click the comment bubble count next to a request to expand/read the thread

### 7. Edit a Pending Leave

1. From Leave Details, click **Edit**
2. Update the leave type, dates, or reason
3. Click **Save Changes**
4. Note: Only leaves with PENDING status can be edited

### 8. Cancel a Leave

- **Pending leaves**: From Leave Details, click **Cancel Request** — the leave becomes Cancelled
- **Approved leaves**: From Leave Details, click **Cancel Approved Leave** — confirm the dialog, and the leave becomes Cancelled with your leave balance **restored** for those days
- Note: Leaves that were rejected cannot be cancelled

### 9. View Leave Balances

1. Click **Leave Balances** in the sidebar (or view on the Dashboard)
2. See your remaining leave days for each leave type (Annual, Sick, Personal)
3. Each card shows: remaining days, total days, used days, and a progress bar
4. Your remaining days increase automatically when you cancel an approved leave

### 10. View the Calendar

- Click **Calendar** in the sidebar to see a month view of leaves
- Day cells show colored dots/entries by status (approved/pending/rejected/cancelled)
- Click any day to see the leave details for that day
- What you see depends on your role:
  - **Employee**: your own leaves
  - **Manager**: your team's leaves
  - **Admin**: every leave in the organization

### 11. View Profile

1. Click **Profile** in the sidebar
2. View your name, email, department, role, and account creation date

---

## Manager Guide

### 1. Login

- Login using manager credentials (alice@company.com)
- You will be redirected to the Manager Dashboard

### 2. Manager Dashboard

The Manager Dashboard displays:
- **Team Overview**: Total employees, pending approvals, approved/rejected leaves this month
- **Recent Activity**: Leave requests from your team members

### 3. Approve or Reject Leave Requests

1. Click **Pending Approvals** in the sidebar
2. View all pending leave requests from your team members
3. For each request:
   - Read the employee's reason and the current **Discussion** thread
   - Post clarifying questions on the thread at any time — this does **not** decide the leave
   - Optional: Type a **Decision Note** that is attached to your Approve/Reject action
   - Click **Approve** (green) or **Reject** (red)
4. Approved/rejected leaves are removed from the pending list; a system comment (`APPROVED - ...` / `REJECTED - ...`) is added to the thread

### 4. View Team Members

1. Click **My Team** in the sidebar
2. View all employees under your management
3. Shows each employee's name, email, department, and role

### 5. View Employee Leave History

1. From **My Team**, click the **Eye** icon next to any employee
2. View that employee's complete leave history (including approved/rejected ones)
3. See leave type, dates, reason, status, who approved/rejected, and the comment count
4. Click any request to expand its **Discussion** thread and add comments — even after the decision

### 5. Approve as Admin (Extra Access)

- Admins see the **Pending Approvals** view for the entire organization
- Admins can approve/reject any team's leave requests

### 6. Add a New Employee

1. Click **Add Employee** in the sidebar
2. Fill in the form:
   - **Full Name**: Employee's name
   - **Email**: Employee's email address
   - **Password**: Initial password
   - **Department**: Select from the dropdown
   - **Role**: Employee or Manager
3. Click **Add Employee**
4. The new employee can now login with the provided credentials

### 7. Manage Leave Balances

1. Click **Leave Balances** in the sidebar
2. View all team members and their current leave balances
3. Click the **chevron** to expand a team member's details
4. Click **Edit** to update total or used days for any leave type
5. Changes take effect immediately — the employee will see updated balances

### 8. Register a New Manager

- Anyone can register as a manager from the Register page (after admin exists)
- Fill in name, email, password, select department
- New managers do not have any employees assigned initially

### 9. First-Time Setup (Admin Registration)

- When the system has **no users**, the first registration creates a **System Admin**
- The Register page will show an amber banner: "First registration — you will be the System Admin"
- Admin can then manage departments, employees, and view all data
- After admin exists, subsequent registrations create MANAGER accounts

---

## Admin Guide

### 1. Login

- Login using admin credentials (the first user who registered is the System Admin)
- If starting from a fresh DB, see **First-Time Setup** in the Manager Guide above
- You will be redirected to the Admin Dashboard

### 2. Admin Dashboard

The Admin Dashboard displays organization-wide statistics:
- **Total Employees**, **Total Leaves**, **Pending Approvals**, **Approved**, **Rejected**
- **Recent Activities**: All leave requests across the organization

### 3. Pending Approvals (Org-wide)

1. Click **Pending Approvals** in the sidebar
2. Review every pending leave request in the organization, with each employee's manager shown
3. Read the discussion thread and reply with comments independently of the decision
4. Approve or Reject with an optional **Decision Note** (admin has same rights as a manager here)

### 4. All Leaves

1. Click **All Leaves** in the sidebar
2. See every leave request across the organization, newest first
3. Filter by status (All / Pending / Approved / Rejected / Cancelled)
4. Expand any request to read/post in its discussion thread — at any time, regardless of decision

### 5. Manage Employees

1. Click **All Employees** in the sidebar
2. View all employees with their name, email, department, role, and manager
3. Click the **Edit** icon to modify an employee's details
4. Click the **Delete** icon to remove an employee

### 6. Manage Departments

1. Click **Departments** in the sidebar
2. View all departments
3. Add a new department by typing the name and clicking **Add**
4. Delete a department by clicking the **Trash** icon

### 7. View All Leave Balances

- Navigate to **Leave Balances** in the sidebar (shared with Manager)
- Admins can see and edit leave balances for every employee in the organization

### 8. View the Calendar

- Click **Calendar** in the sidebar for an org-wide month view of every team's leaves

---

## Navigation

### Sidebar (Desktop)
- The sidebar shows different menu items based on your role
- **Admin Menu**: Dashboard, Pending Approvals, All Leaves, All Employees, Add Employee, Departments, Calendar, Profile
- **Employee Menu**: Dashboard, Apply Leave, Leave History, Calendar, Leave Balances, Profile
- **Manager Menu**: Dashboard, Pending Approvals, My Team, Add Employee, Leave Balances, Calendar, Profile

### Mobile
- The sidebar is hidden by default on mobile
- Tap the **hamburger menu** (top-left) to open the sidebar
- Tap outside the sidebar or the **chevron** button to close it

### Logout
- Click **Logout** at the bottom of the sidebar
- You will be redirected to the Login page

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot login | Check email and password are correct. Ensure backend is running. |
| Cannot see leaves | Make sure you are logged in as the correct user. |
| Cannot approve leaves | MANAGER and ADMIN roles can approve. Login with the right credentials. |
| Comments not posting | You must be the leave owner, their manager, or an admin to comment. |
| Approved leave rejected when cancelling | Only pending or approved leaves can be cancelled; rejected leaves stay as-is. |
| Page not found | Check the URL. Use the sidebar navigation instead of manual URLs. |
| Blank page | Check browser console for errors. Restart the frontend dev server. |
