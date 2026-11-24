# Employee Leave Management System

A full-stack web application for managing employee leave requests with role-based access control. Built with Spring Boot 3.5, React 19, and PostgreSQL 16.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA, Hibernate |
| Database | PostgreSQL 16 (Docker) |
| Auth | JWT (jjwt 0.12.6), BCrypt |
| API Docs | SpringDoc OpenAPI 2.8.6 (Swagger UI) |

## Prerequisites

- **Java 17+** (JDK 26 compatible with `--release 17`)
- **Maven 3.9+** (uses Maven Wrapper `mvnw.cmd`)
- **Node.js 22+** and **npm**
- **Docker Desktop** (for PostgreSQL)

## Quick Start

### 1. Start Database

```bash
docker compose -f backend/docker-compose.yml up -d
```

### 2. Run Backend

```bash
cd backend
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

Backend starts at `http://localhost:8080`.

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173` (proxies `/api` to backend).

## Setup & Credentials

The app is a multi-company SaaS platform. A fresh database has no accounts:

1. **Platform setup** — open `/setup` and create the platform `SUPER_ADMIN`. This can only be done once. Sign in later at `/platform/login`.
2. **Company signup** — open `/signup` to create a company workspace and its first `ADMIN`, who chooses their own password. Six default departments and default leave balances are created automatically.
3. **Company staffing** — the company admin signs in at `/admin/login` and creates managers and employees with temporary passwords. Managers sign in at `/manager/login`, employees at `/employee/login`, and both must change the temporary password on first sign-in.
4. **Platform oversight** — the super admin can create, suspend, and reactivate companies at `/platform/companies`. Suspension blocks existing tokens immediately.

There is no email service; temporary passwords are shared directly by the person who creates the account.

**Demo accounts (optional):** run the backend with the `dev` profile to seed `platform@demo.com` / `Platform@123`, `admin@demo.com` / `Admin@123`, and the `@demo.com` manager/employee accounts (`password123`). The seeder is disabled in production and only runs when the `companies` table is empty.

## API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **Import into Postman**: Import → Link → `http://localhost:8080/v3/api-docs`

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/setup` | No | Check whether the platform super admin exists |
| POST | `/api/auth/setup` | No (one time) | Create the platform SUPER_ADMIN |
| POST | `/api/auth/signup-company` | No | Create a company and its first ADMIN |
| POST | `/api/auth/login` | No | Portal-aware login (`portal`: PLATFORM/ADMIN/MANAGER/EMPLOYEE), returns JWT |
| POST | `/api/auth/change-password` | Yes | Change own password and clear `mustChangePassword` |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/platform/dashboard` | SUPER_ADMIN | Platform-wide totals |
| GET | `/api/platform/companies` | SUPER_ADMIN | List all companies |
| POST | `/api/platform/companies` | SUPER_ADMIN | Create a company with a temporary admin password |
| PUT | `/api/platform/companies/{id}/status` | SUPER_ADMIN | Suspend or reactivate a company |
| GET | `/api/departments` | All | List departments |
| POST | `/api/departments` | Admin | Create department |
| DELETE | `/api/departments/{id}` | Admin | Delete department |
| GET | `/api/employees/me` | All | Current user profile |
| GET | `/api/employees` | Manager/Admin | All employees (Admin) or team (Manager) |
| GET | `/api/employees/{id}` | All | Employee by ID (own profile, team, or admin) |
| POST | `/api/employees` | Manager/Admin | Create employee |
| PUT | `/api/employees/{id}` | Admin | Update employee |
| DELETE | `/api/employees/{id}` | Admin | Delete employee |
| POST | `/api/leaves` | All | Apply leave |
| GET | `/api/leaves` | All | My leaves |
| GET | `/api/leaves/{id}` | All | Leave details (own, team, or org-wide) |
| GET | `/api/leaves/calendar` | All | Role-scoped calendar feed (own / team / org-wide) |
| GET | `/api/leaves/search` | All | Search my leaves by type/status |
| PUT | `/api/leaves/{id}` | All | Edit leave |
| DELETE | `/api/leaves/{id}` | All | Cancel leave (pending or approved — approved restores balance) |
| POST | `/api/leaves/{id}/comments` | All | Add a comment to the leave discussion thread |
| GET | `/api/manager/pending-leaves` | Manager/Admin | Pending approvals (team for manager, org-wide for admin) |
| PUT | `/api/manager/leaves/{id}/approve` | Manager/Admin | Approve leave (optional decision note) |
| PUT | `/api/manager/leaves/{id}/reject` | Manager/Admin | Reject leave (optional decision note) |
| GET | `/api/manager/employees` | Manager | Team members |
| GET | `/api/manager/employees/{id}/leaves` | Manager | Employee leave history |
| GET | `/api/leave-balances/me` | All | My leave balances |
| GET | `/api/leave-balances/team` | Manager/Admin | Team leave balances |
| GET | `/api/leave-balances/employee/{id}` | Manager/Admin | Employee leave balances |
| GET | `/api/leave-balances/all` | Admin | All leave balances |
| PUT | `/api/leave-balances/{id}` | Manager/Admin | Update leave balance |
| GET | `/api/admin/dashboard` | Admin | Admin dashboard stats |
| GET | `/api/admin/employees` | Admin | All employees |
| GET | `/api/admin/leaves` | Admin | All leave requests org-wide (with discussions) |
| GET | `/api/admin/departments` | Admin | All departments |
| POST | `/api/admin/departments` | Admin | Create department |
| DELETE | `/api/admin/departments/{id}` | Admin | Delete department |
| GET | `/api/dashboard/employee` | All | Employee dashboard stats |
| GET | `/api/dashboard/manager` | Manager | Manager dashboard stats |

## Project Structure

```
Employee Leave Management System/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/leavemanagement/
│   │   ├── config/             # Security, Web, OpenAPI, DatabaseSeeder
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── enums/              # Role, LeaveStatus, LeaveType
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # JWT filter, CurrentUser resolver, UserDetailsService
│   │   └── service/            # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── docker-compose.yml
│   └── pom.xml
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── api/                # HTTP client with JWT
│   │   ├── components/         # UI components + shared LeaveCommentThread, ApproverNote
│   │   ├── context/            # AuthContext
│   │   ├── layouts/            # AppLayout, AuthLayout
│   │   ├── pages/              # All route pages
│   │   │   ├── auth/           # Portal chooser, portal logins, setup, company signup, change password
│   │   │   ├── platform/       # Super admin dashboard and company management
│   │   │   ├── admin/          # Dashboard, Employees, Departments, Pending Approvals, All Leaves
│   │   │   ├── employee/       # Dashboard, ApplyLeave, Leaves, Details, Profile, MyBalances
│   │   │   ├── manager/        # Dashboard, PendingApprovals, Team, AddEmployee, TeamBalances, History
│   │   │   └── Calendar.tsx    # Org/team calendar view
│   │   ├── types/              # TypeScript interfaces
│   │   └── lib/                # Utility functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── database/
│   ├── schema.sql              # Full DDL with constraints, indexes, triggers
│   └── seed.sql                # Sample data
├── openapi/
│   └── README.md               # OpenAPI import instructions
└── docs/
    ├── user-manual.md          # Role-based user guide
    ├── architecture.md         # System architecture & data flows
    └── database.md             # Schema, tables, constraints
```

## Features

- **Multi-company SaaS** — Public company signup, platform super admin console, isolated tenant data, and suspension controls
- **Four login portals** — Dedicated sign-in for platform owner, company admin, manager, and employee
- **Temporary-password onboarding** — Platform/company-created accounts must change their password on first sign-in
- **Role-based access** — Super Admin, Company Admin, Manager, and Employee roles with distinct dashboards and permissions
- **JWT authentication** — Secure token-based auth with automatic refresh flow
- **Leave lifecycle** — Apply, edit, cancel, approve, reject with status tracking; approved leaves can be cancelled by the employee with automatic balance restore
- **Leave Balance Tracking** — Track remaining leave days (Annual, Sick, Personal) per employee per year, auto-deduct on approval and auto-restore on cancellation
- **Calendar View** — Month-grid calendar of leaves (own for employees, team for managers, org-wide for admins) with status colors and day details
- **Discussion threads** — Comment on any leave request at any status; independent of the approval decision, with automatic system comments on approve/reject/cancel
- **Approver tracking** — Every decided leave shows who approved/rejected it and when
- **Manager workflows** — View team, approve/reject with comments, audit employee history, edit leave balances
- **Admin workflows** — Manage all employees, departments, leave balances; org-wide pending approvals and all-leaves view
- **Dashboard analytics** — Stats cards with leave breakdown, recent activity feed, leave balance progress bars
- **Responsive UI** — Mobile-friendly sidebar, gradient theme, Tailwind CSS v4

## Building for Production

```bash
# Backend
cd backend
.\mvnw.cmd clean package -DskipTests
java -jar target/*.jar

# Frontend
cd frontend
npm run build
# Output in frontend/dist/
```

## Troubleshooting

**Port 8080 in use:**
```powershell
Get-NetTCPConnection -LocalPort 8080 | Select -ExpandProperty OwningProcess | Stop-Process
```

**Reset database:**
```bash
docker compose -f backend/docker-compose.yml down -v
docker compose -f backend/docker-compose.yml up -d
```
Then restart the backend. With the `dev` profile the demo seeder repopulates data; otherwise open `/setup` to create the platform owner and `/signup` to create a company.

## License

MIT
