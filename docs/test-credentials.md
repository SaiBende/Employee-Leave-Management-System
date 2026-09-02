# Test Credentials

## Demo Accounts (seeded database)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@company.com | Admin@123 |
| Manager | alice@company.com | password123 |
| Manager | bob@company.com | password123 |
| Employee | charlie@company.com | password123 |
| Employee | diana@company.com | password123 |

## Manager-Employee Mapping

- **Alice** (Manager) → manages **Charlie** (Engineering)
- **Bob** (Manager) → manages **Diana** (Engineering)

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose -f backend/docker-compose.yml up -d

# 2. Start Backend (from backend/)
.\mvnw.cmd spring-boot:run
# or run the jar:
# java -jar target/backend-0.0.1-SNAPSHOT.jar

# 3. Start Frontend (from frontend/)
npm run dev

# 4. Open http://localhost:5173
```

## Key URLs

| Page | Role | Path |
|------|------|------|
| Dashboard | All | `/employee/dashboard`, `/manager/dashboard`, `/admin/dashboard` |
| Apply Leave | Employee, Manager | `/employee/leaves/apply` |
| Leave History | Employee | `/employee/leaves` |
| My Leave Balances | Employee | `/employee/balances` |
| Pending Approvals | Manager | `/manager/pending` |
| My Team | Manager | `/manager/employees` |
| Team Leave Balances | Manager | `/manager/balances` |
| Org-Wide Pending Approvals | Admin | `/admin/pending` |
| All Leaves (with discussions) | Admin | `/admin/leaves` |
| All Employees | Admin | `/admin/employees` |
| Departments | Admin | `/admin/departments` |
| Calendar (role-scoped) | All | `/calendar` |
| Profile | All | `/employee/profile` |

## Admin-Only Notes

- The first user to register on a fresh DB becomes the **System Admin** automatically.
- In the seeded demo DB, the admin is `admin@company.com` / `Admin@123`.
- Admin can approve/reject **any** leave request (including other managers').
- Managers can apply for leave too — their requests go to the Admin for approval.