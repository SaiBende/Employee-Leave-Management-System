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
- Shows leave type, dates, reason, status, manager comments, and timestamps

### 6. Edit a Pending Leave

1. From Leave Details, click **Edit**
2. Update the leave type, dates, or reason
3. Click **Save Changes**
4. Note: Only leaves with PENDING status can be edited

### 7. Cancel a Leave

- From Leave Details, click **Delete/Cancel**
- Confirm the cancellation
- The leave status changes to Cancelled

### 8. View Leave Balances

1. Click **Leave Balances** in the sidebar (or view on the Dashboard)
2. See your remaining leave days for each leave type (Annual, Sick, Personal)
3. Each card shows: remaining days, total days, used days, and a progress bar

### 9. View Profile

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
   - Read the employee's reason
   - Optional: Add a comment in the text field
   - Click **Approve** (green) or **Reject** (red)
4. Approved/rejected leaves are removed from the pending list

### 4. View Team Members

1. Click **My Team** in the sidebar
2. View all employees under your management
3. Shows each employee's name, email, department, and role

### 5. View Employee Leave History

1. From **My Team**, click the **Eye** icon next to any employee
2. View that employee's complete leave history
3. See leave type, dates, reason, status, and manager comments

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

- Anyone can register as a manager from the Register page
- Fill in name, email, password, select department, and role as Manager
- New managers do not have any employees assigned initially

---

## Navigation

### Sidebar (Desktop)
- The sidebar shows different menu items based on your role
- **Employee Menu**: Dashboard, Apply Leave, Leave History, Leave Balances, Profile
- **Manager Menu**: Dashboard, Pending Approvals, My Team, Add Employee, Leave Balances, Profile

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
| Cannot approve leaves | Only MANAGER role users can approve. Login with manager credentials. |
| Page not found | Check the URL. Use the sidebar navigation instead of manual URLs. |
| Blank page | Check browser console for errors. Restart the frontend dev server. |
