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

**First-time setup:** When the database is empty, the first person to register automatically becomes **System Admin**. No hardcoded admin credentials needed.

After the seeder runs (fresh DB), these demo accounts are created:

| Role | Email | Password |
|------|-------|----------|
| Manager | alice@company.com | password123 |
| Employee | charlie@company.com | password123 |

## API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **Import into Postman**: Import → Link → `http://localhost:8080/v3/api-docs`

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register manager |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/setup` | No | Check if system needs initial setup |
| POST | `/api/auth/logout` | Yes | Logout |
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
| PUT | `/api/leaves/{id}` | All | Edit leave |
| DELETE | `/api/leaves/{id}` | All | Cancel leave |
| GET | `/api/manager/pending-leaves` | Manager | Pending approvals |
| PUT | `/api/manager/leaves/{id}/approve` | Manager | Approve leave |
| PUT | `/api/manager/leaves/{id}/reject` | Manager | Reject leave |
| GET | `/api/manager/employees` | Manager | Team members |
| GET | `/api/manager/employees/{id}/leaves` | Manager | Employee leave history |
| GET | `/api/leave-balances/me` | All | My leave balances |
| GET | `/api/leave-balances/team` | Manager/Admin | Team leave balances |
| GET | `/api/leave-balances/employee/{id}` | Manager/Admin | Employee leave balances |
| GET | `/api/leave-balances/all` | Admin | All leave balances |
| PUT | `/api/leave-balances/{id}` | Manager/Admin | Update leave balance |
| GET | `/api/admin/dashboard` | Admin | Admin dashboard stats |
| GET | `/api/admin/employees` | Admin | All employees |
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
│   │   ├── components/         # UI components (Button, Card, Badge, Input, Select)
│   │   ├── context/            # AuthContext
│   │   ├── layouts/            # AppLayout, AuthLayout
│   │   ├── pages/              # All route pages
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── admin/          # Dashboard, Employees, Departments
│   │   │   ├── employee/       # Dashboard, ApplyLeave, Leaves, Profile, MyBalances
│   │   │   └── manager/        # Dashboard, PendingApprovals, Team, AddEmployee, TeamBalances
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
    └── .gitkeep
```

## Features

- **Role-based access** — Admin, Manager, and Employee roles with distinct dashboards and permissions
- **JWT authentication** — Secure token-based auth with automatic refresh flow
- **Leave lifecycle** — Apply, edit, cancel, approve, reject with status tracking
- **Leave Balance Tracking** — Track remaining leave days (Annual, Sick, Personal) per employee per year, auto-deduct on approval
- **Manager workflows** — View team, approve/reject with comments, audit employee history, edit leave balances
- **Admin workflows** — Manage all employees, departments, leave balances; org-wide dashboard
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
Then restart the backend — DatabaseSeeder will auto-populate data.

## License

MIT
