# System Architecture

## Overview

The Employee Leave Management System follows a modern three-tier architecture with a decoupled frontend and backend communicating via REST APIs.

```
┌─────────────┐     HTTP/JSON     ┌──────────────┐     JDBC      ┌────────────┐
│   React SPA  │ ──────────────> │ Spring Boot  │ ───────────> │ PostgreSQL  │
│  (Vite + TS) │ <────────────── │   Backend    │ <─────────── │  Database   │
└─────────────┘    Bearer JWT    └──────────────┘              └────────────┘
       │                                │
   Port 5173                         Port 8080
   (dev proxy: /api)                 (CORS disabled)
```

## Frontend Architecture

### Tech Stack
- **React 19** with TypeScript for type safety
- **Vite 8** as build tool and dev server
- **Tailwind CSS v4** for utility-first styling with oklch color palette
- **React Router v7** for client-side routing with protected routes
- **Lucide React** for iconography

### Component Structure
```
pages/         → Route-level components (one per route)
components/    → Reusable UI primitives (Button, Card, Badge, Input, Select)
components/    → Shared feature components (LeaveCommentThread, ApproverNote, StatCard)
layouts/       → AppLayout (sidebar), AuthLayout (centered card)
context/       → AuthContext (user state, JWT persistence)
api/           → Fetch wrapper with automatic token injection
types/         → TypeScript interfaces matching backend DTOs
```

### Routing
- **Public routes**: Home, Login, Register, 404
- **Protected routes**: All other pages require valid JWT
- **Role-based navigation**: Sidebar shows different menu items for ADMIN, MANAGER, and EMPLOYEE roles
- **Route protection**: `ProtectedRoute` component redirects to `/login` if no token

### State Management
- Auth state managed via React Context (AuthContext)
- JWT stored in localStorage, auto-injected in Authorization header
- Component-local state with `useState` and `useEffect`

## Backend Architecture

### Tech Stack
- **Spring Boot 3.5** with Java 17
- **Spring Security** for authentication and authorization
- **Spring Data JPA** with Hibernate for ORM
- **JWT (jjwt 0.12.6)** for stateless authentication
- **SpringDoc OpenAPI 2.8.6** for API documentation

### Layered Architecture
```
Controller   → HTTP layer, request validation, response wrapping (Leave, Manager, Admin, Dashboard, Calendar)
Service      → Business logic, transaction management (LeaveService, ManagerService, AdminService)
Repository   → Data access via Spring Data JPA
Entity       → JPA entity mapping to database tables (Departments, Employees, Leaves, LeaveBalances, LeaveComments)
DTO          → Request/Response objects for API communication (LeaveResponse, LeaveCommentResponse, DepartmentResponse)
Security     → JWT filter, authentication provider, current user resolver
Config       → Security rules, OpenAPI config, web config, database seeder
```

### Security Flow
```
1. Client sends POST /api/auth/login with email + password
2. Server validates credentials via UserDetailsService (BCrypt)
3. Server generates JWT with userId, email, role embedded
4. Client stores token in localStorage
5. Subsequent requests include Authorization: Bearer <token>
6. JwtAuthenticationFilter extracts and validates token on every request
7. SecurityConfig enforces role-based access:
   - /api/auth/** → permit all
   - /api/admin/** → ADMIN only
   - /api/manager/** → ADMIN or MANAGER
   - /api/employees/** → ADMIN/MANAGER/EMPLOYEE with granular controller-level checks
   - /api/leave-balances/me → all authenticated roles
   - /api/leave-balances/** → ADMIN or MANAGER
   - Everything else → authenticated
```

> **Note:** API responses always wrap `Leave` entities in `LeaveResponse` DTOs. This avoids the Hibernate lazy-proxy serialization bug that previously caused empty-body 403 responses (which the frontend must not treat as auth failures).

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| JWT over sessions | Stateless, scales horizontally, no server-side session store |
| BCrypt for passwords | Industry standard, adaptive cost factor, built-in salt |
| PostgreSQL | Robust, free, great JSON support,成熟的 relational DB |
| Vite over CRA | Faster dev server, better HMR, native ESM |
| Tailwind CSS | Utility-first, rapid prototyping, small production bundle |
| Spring Data JPA | Reduces boilerplate, repository pattern, pagination support |

## Role Hierarchy

```
ADMIN (org-wide access)
  └── Can manage all employees, departments, and leave balances
  └── Can view/approve/reject any leave request, comment on any discussion
  └── Has a dedicated All Leaves view with status filters
  └── Cannot apply for leave (not an employee role)

MANAGER (team-level access)
  └── Can manage direct reports only
  └── Can approve/reject team leaves, edit team balances
  └── Can view team member profiles and history
  └── Can comment on any team leave thread at any status

EMPLOYEE (self-only access)
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
Manager/Admin → GET /api/manager/pending-leaves → sees request (team vs org-wide by role)
    ↓
Manager/Admin → PUT /api/manager/leaves/{id}/approve (optional decision note)
    ↓
ManagerService updates status to APPROVED, records decidedBy + decidedAt
    ↓
ManagerService.deductBalance() deducts leave days from employee's balance
    ↓
System comment "APPROVED - <note>" added to the leave discussion thread
    ↓
Employee dashboard now shows updated leave balance and approved leave count
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
LeaveService.cancelLeave() sets status CANCELLED
    ↓
If the leave was APPROVED: restoreBalance() adds days back to used_days
    ↓
System comment "CANCELLED - cancelled by <name>" added to the thread
```
