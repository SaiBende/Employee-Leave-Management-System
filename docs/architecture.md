# System Architecture

## Overview

The Employee Leave Management System is a multi-company SaaS application. A platform
owner oversees tenants, each company has an isolated workspace, and company users are
separated into admin, manager, and employee portals. The frontend and backend are
decoupled and communicate via REST APIs.

```
┌──────────────────┐     HTTP/JSON     ┌──────────────────┐     JDBC      ┌────────────┐
│    React SPA     │ ────────────────> │  Spring Boot     │ ────────────> │ PostgreSQL │
│  (Vite + TS)     │ <──────────────── │    Backend       │ <──────────── │  Database  │
└──────────────────┘    Bearer JWT     └──────────────────┘               └────────────┘
        │                                      │
    Port 5173                              Port 8080
    (dev proxy: /api)                      (CORS disabled)
```

## Multi-Tenancy Model

| Role | Scope | Can do |
|------|-------|--------|
| `SUPER_ADMIN` | Platform | Create companies, suspend/reactivate companies, view platform counts |
| `ADMIN` | One company | Manage that company's employees, departments, balances, and all company leaves |
| `MANAGER` | One company / team | Manage direct reports, approve team leaves, edit team balances |
| `EMPLOYEE` | Self | Apply for, edit, cancel own leaves; view own profile and balances |

- Every company-owned row carries a `company_id`.
- The platform super admin has no `company_id` and cannot call company endpoints.
- Company admins/managers cannot read or mutate rows belonging to another company.
- Suspending a company blocks existing JWTs immediately and rejects new logins.
- Company selection is derived from the authenticated user, never from a client
  parameter, so there is no tenant header to spoof.

### Company Lifecycle

```
Fresh database
  └── GET /api/auth/setup            → needsSetup = true
  └── POST /api/auth/setup           → one SUPER_ADMIN (platform owner)
  └── GET /api/auth/setup            → needsSetup = false

Company onboarding
  ├── Public: POST /api/auth/signup-company
  │     creates company + ADMIN (password chosen by the customer)
  │     + six default departments + default leave balances
  └── Platform: POST /api/platform/companies
        creates company + ADMIN with a temporary password
        (admin must change it on first login)

Company administration
  ├── ADMIN creates MANAGER and EMPLOYEE accounts (temporary passwords)
  ├── MANAGER creates EMPLOYEE accounts only (temporary passwords)
  └── Platform: PUT /api/platform/companies/{id}/status → suspend / reactivate
```

## Frontend Architecture

### Tech Stack
- **React 19** with TypeScript for type safety
- **Vite 8** as build tool and dev server
- **Tailwind CSS v4** for utility-first styling
- **React Router v7** for client-side routing with protected routes
- **TanStack Query** for server state
- **Lucide React** for iconography

### Component Structure
```
pages/         → Route-level components (one per route)
components/    → Reusable UI primitives (Button, Card, Badge, Input, Select)
components/    → Shared feature components (LeaveCommentThread, ApproverNote, StatCard)
layouts/       → AppLayout (sidebar), AuthLayout (centered card)
context/       → AuthContext (user state, JWT persistence, portal login)
api/           → Fetch wrapper with automatic token injection
hooks/         → TanStack Query hooks (leaves, employees, admin, platform)
types/         → TypeScript interfaces matching backend DTOs
lib/           → Portal metadata, role home paths, utilities
```

### Routing
- **Public routes**: `/` (marketing home), `/login` (portal chooser), `/setup`,
  `/signup`, and the four portal logins:
  - `/platform/login`
  - `/admin/login`
  - `/manager/login`
  - `/employee/login`
- **Authenticated routes**: `/change-password` plus the role dashboards.
- **Protected routes**: `ProtectedRoute` redirects unauthenticated users to `/login`
  and enforces allowed roles per route group.
- **Forced password change**: if `mustChangePassword` is true, every protected route
  redirects to `/change-password`.
- **Role-based navigation**: the sidebar renders a platform menu for `SUPER_ADMIN`,
  admin menu for `ADMIN`, manager menu for `MANAGER`, and employee menu for `EMPLOYEE`.
- `/register` redirects to `/signup` for backwards compatibility.

### State Management
- Auth state managed via React Context (`AuthContext`)
- JWT stored in localStorage, auto-injected in the Authorization header
- Failed requests with 401 clear the session; 403 does not (it is a real permission
  denial, not an expired token)
- Server state cached and invalidated with TanStack Query

## Backend Architecture

### Tech Stack
- **Spring Boot 3.5** with Java 17
- **Spring Security** for authentication and authorization
- **Spring Data JPA** with Hibernate for ORM
- **JWT (jjwt 0.12.6)** for stateless authentication
- **SpringDoc OpenAPI 2.8.6** for API documentation

### Layered Architecture
```
Controller   → HTTP layer, request validation, response wrapping
               (Auth, Admin, Manager, Employee, Leave, Department, LeaveBalance,
                Dashboard, Calendar, Company)
Service      → Business logic, tenant scoping, transaction management
               (AuthService, CompanyService, AdminService, ManagerService,
                EmployeeService, LeaveService, LeaveBalanceService)
Repository   → Data access via Spring Data JPA; company-scoped query methods
Entity       → Company, Department, Employee, Leave, LeaveBalance, LeaveComment
DTO          → Request/Response objects (CompanyResponse, SetupRequest,
               CompanySignupRequest, AuthResponse, LeaveResponse, ...)
Security     → JWT filter (live DB role + company-active checks), authentication
               provider, current user resolver
Config       → Security rules, OpenAPI config, web config, dev-only database seeder
```

### Security Flow
```
1. Client sends POST /api/auth/login with email + password + portal
2. Server authenticates via UserDetailsService (BCrypt)
3. Server rejects a portal mismatch (403) and returns the correct portal path
4. Suspended companies are rejected before a token is issued
5. Server generates a JWT with userId, email, and role
6. Client stores the token in localStorage
7. Subsequent requests include Authorization: Bearer <token>
8. JwtAuthenticationFilter re-loads the user from the database on every request:
   - role changes take effect immediately
   - suspended companies are blocked immediately
   - deleted users lose access immediately
9. SecurityConfig enforces route-level access:
   - /api/auth/setup, /api/auth/signup-company, /api/auth/login → public
   - /api/auth/** (except public endpoints) → authenticated
   - /api/platform/** → SUPER_ADMIN only
   - /api/admin/** → ADMIN only
   - /api/manager/** → ADMIN or MANAGER
   - /api/employees/** → ADMIN/MANAGER/EMPLOYEE with controller-level checks
   - /api/leave-balances/me → all company roles
   - /api/leave-balances/** → ADMIN or MANAGER
   - everything else → authenticated
```

> **Role assignment:** public company signup always creates an `ADMIN` for the new
> company. After that, company admins create managers/employees and managers create
> employees only. The server ignores client-supplied roles outside those rules and
> downgrades manager-created accounts to `EMPLOYEE`.

> **Tenant enforcement:** services resolve the caller's company from the JWT-backed
> user and scope every repository query by it. Cross-company ids return 403 rather
> than leaking whether the row exists.

> **Note:** API responses always wrap `Leave` entities in `LeaveResponse` DTOs. This
> avoids the Hibernate lazy-proxy serialization bug that previously caused empty-body
> 403 responses (which the frontend must not treat as auth failures).

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Shared schema with `company_id` | Simple, migration-friendly tenancy for this scale |
| JWT over sessions | Stateless, scales horizontally, no server-side session store |
| Live role checks in the JWT filter | Role changes and suspensions take effect immediately |
| BCrypt for passwords | Industry standard, adaptive cost factor, built-in salt |
| PostgreSQL | Robust, free, great relational support |
| Vite over CRA | Faster dev server, better HMR, native ESM |
| Tailwind CSS | Utility-first, rapid prototyping, small production bundle |
| Spring Data JPA | Reduces boilerplate, repository pattern, pagination support |

## Role Hierarchy

```
SUPER_ADMIN (platform-wide)
  └── Creates companies and their first admin
  └── Views platform totals and company lists
  └── Suspends/reactivates companies (blocks tokens and logins immediately)
  └── Has no access to company employee/leave endpoints

ADMIN (company-wide)
  └── Can manage all company employees, departments, and leave balances
  └── Can view/approve/reject any company leave request, comment on any thread
  └── Has a dedicated All Leaves view with status filters
  └── Can create managers and employees, never another admin
  └── Cannot apply for leave (not an employee role)

MANAGER (team-level within one company)
  └── Can manage direct reports only
  └── Can approve/reject team leaves, edit team balances
  └── Can view team member profiles and history
  └── Can comment on any team leave thread at any status
  └── Can apply for leave; requests go to the company admin

EMPLOYEE (self-only within one company)
  └── Can apply, edit, cancel own leaves (pending or approved)
  └── Cancelling an approved leave restores the used balance days
  └── Can view own profile, balances, and leave history
  └── Can comment on own leave threads at any status
```

## Data Flow: Leave Application & Approval

```
Employee → POST /api/leaves → LeaveController → LeaveService
    ↓
LeaveRepository.save(leave) ← Leave entity with status=PENDING
    ↓
Return LeaveResponse DTO with employee name and status
    ↓
Employee sees "Pending" status in dashboard
    ↓
Manager/Admin → GET /api/manager/pending-leaves → sees request (team vs company by role)
    ↓
Manager/Admin → PUT /api/manager/leaves/{id}/approve (optional decision note)
    ↓
ManagerService verifies the request belongs to the same company and team scope
    ↓
Status becomes APPROVED, decidedBy + decidedAt recorded
    ↓
ManagerService.deductBalance() deducts leave days from the employee's balance
    ↓
System comment "APPROVED - <note>" added to the leave discussion thread
    ↓
Employee dashboard shows updated balance and approved leave count
```

## Data Flow: Discussion Threads & Cancellation

```
Any authorized user → POST /api/leaves/{id}/comments (owner, their manager, or admin)
    ↓
LeaveService.addComment() — no status restriction; thread is independent of the decision
    ↓
LeaveComment persisted to leave_comments, returned with LeaveResponse.comments

Employee → DELETE /api/leaves/{id} (PENDING or APPROVED only)
    ↓
LeaveService.cancelLeave() verifies ownership and company, sets status CANCELLED
    ↓
If the leave was APPROVED: restoreBalance() adds days back to used_days
    ↓
System comment "CANCELLED - cancelled by <name>" added to the thread
```

## Deployment Topology

```
GitHub main push
    ↓
GitHub Actions builds backend + frontend images (GHCR)
    ↓
EC2 ~/ems: docker compose pulls images
    ↓
Caddy terminates TLS:
    https://ems.saibende.in      → frontend nginx, /api → backend
    https://api-ems.saibende.in  → backend
    ↓
PostgreSQL 16 in the `ems_postgres_data` volume
```

Any push to `main` auto-deploys production, so Phase 1 remains local until explicitly
approved.
