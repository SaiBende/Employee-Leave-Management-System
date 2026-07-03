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
layouts/       → AppLayout (sidebar), AuthLayout (centered card)
context/       → AuthContext (user state, JWT persistence)
api/           → Fetch wrapper with automatic token injection
types/         → TypeScript interfaces matching backend DTOs
```

### Routing
- **Public routes**: Home, Login, Register, 404
- **Protected routes**: All other pages require valid JWT
- **Role-based navigation**: Sidebar shows different menu items for MANAGER vs EMPLOYEE
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
Controller   → HTTP layer, request validation, response wrapping
Service      → Business logic, transaction management
Repository   → Data access via Spring Data JPA
Entity       → JPA entity mapping to database tables
DTO          → Request/Response objects for API communication
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
   - /api/employees → MANAGER only for POST, authenticated for GET
   - /api/manager/** → MANAGER only
   - Everything else → authenticated
```

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| JWT over sessions | Stateless, scales horizontally, no server-side session store |
| BCrypt for passwords | Industry standard, adaptive cost factor, built-in salt |
| PostgreSQL | Robust, free, great JSON support,成熟的 relational DB |
| Vite over CRA | Faster dev server, better HMR, native ESM |
| Tailwind CSS | Utility-first, rapid prototyping, small production bundle |
| Spring Data JPA | Reduces boilerplate, repository pattern, pagination support |

## Data Flow: Leave Application

```
Employee → POST /api/leaves → LeaveController → LeaveService
    ↓                                                        ↓
LeaveRepository.save(leave) ← Leave entity with status=PENDING
    ↓
Return LeaveResponse DTO with employee name and status
    ↓
Employee sees "Pending" status in dashboard
    ↓
Manager → GET /api/manager/pending-leaves → sees request
    ↓
Manager → PUT /api/manager/leaves/{id}/approve
    ↓
LeaveService updates status to APPROVED, sends response
    ↓
Employee dashboard now shows approved leave count
```
