# Database Schema

## Overview

PostgreSQL 16 database with six tables: `companies`, `departments`, `employees`,
`leaves`, `leave_balances`, and `leave_comments`. Uses ENUM types for roles, leave
statuses, and leave types.

Every company-owned row is linked to a company through `company_id`. The only
account without a company is the platform `SUPER_ADMIN`. Tenant scoping is enforced
in the service layer and repository queries, not only in the UI.

## Entity Relationship Diagram

```
┌──────────────────────┐
│      companies       │
├──────────────────────┤
│ PK id (BIGSERIAL)    │
│    name              │
│    slug (UNIQUE)     │
│    active            │
│    created_at        │
│    updated_at        │
└─────────┬────────────┘
          │ 1
          ├──────────────────────────────┐
          │ *                            │ *
┌─────────┴────────────┐      ┌──────────┴─────────┐
│     departments      │      │     employees      │
├──────────────────────┤      ├────────────────────┤
│ PK id                │      │ PK id              │
│    name              │      │    name            │
│ FK company_id        │      │    email (UNIQUE)  │
│    created_at        │      │    password        │
│    updated_at        │      │ FK company_id      │
└─────────┬────────────┘      │ FK department_id   │
          │ 1                 │    role (ENUM)     │
          │                   │    must_change_password │
          │ *                 │ FK manager_id      │
          └──────────────────>│    created_at      │
                              │    updated_at      │
                              └─────────┬──────────┘
                                        │ 1
                                        │ *
                              ┌─────────┴──────────┐
                              │       leaves       │
                              ├────────────────────┤
                              │ PK id              │
                              │ FK employee_id     │
                              │    leave_type      │
                              │    start_date      │
                              │    end_date        │
                              │    reason          │
                              │    status (ENUM)   │
                              │    manager_comments│
                              │ FK decided_by_id   │
                              │    decided_at      │
                              │ FK cancelled_by_id │
                              │    cancelled_at    │
                              │    created_at      │
                              │    updated_at      │
                              └────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│   leave_comments     │        │    leave_balances    │
├──────────────────────┤        ├──────────────────────┤
│ PK id                │        │ PK id                │
│ FK leave_id          │        │ FK employee_id       │
│ FK author_id         │        │    leave_type        │
│    comment           │        │    total_days        │
│    created_at        │        │    used_days         │
└──────────────────────┘        │    year              │
                                │    created_at        │
                                │    updated_at        │
                                └──────────────────────┘
                     UNIQUE(employee_id, leave_type, year)
```

## Tables

### companies

A tenant. Created through public company signup or the platform console.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(150) | NOT NULL |
| slug | VARCHAR(180) | NOT NULL, UNIQUE |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

Suspending a company (`active = false`) blocks existing JWTs and new logins for all
of its users immediately. The platform super admin is not a member of any company.

### departments

Departments are company-scoped. Each new company receives six defaults: General,
Engineering, Human Resources, Marketing, Finance, and Operations.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| company_id | BIGINT | FK → companies.id (CASCADE on delete) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

**Unique Constraint:** `(company_id, name)` — department names only need to be unique
inside a company.

### employees

Stores all users: the platform super admin, company admins, managers, and employees.
The self-reference models the manager hierarchy.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE (global login identity) |
| password | VARCHAR(255) | NOT NULL (BCrypt hash) |
| company_id | BIGINT | FK → companies.id; NULL only for SUPER_ADMIN |
| department_id | BIGINT | FK → departments.id; NULL for SUPER_ADMIN |
| role | employee_role | NOT NULL, DEFAULT 'EMPLOYEE' |
| must_change_password | BOOLEAN | NOT NULL, DEFAULT FALSE |
| manager_id | BIGINT | FK → employees.id (self-reference, SET NULL on delete) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

Company admins, managers, and employees must have a `company_id`. The tenant layer
rejects cross-company department ids, employee ids, and leave ids.

`must_change_password` is set for:
- company admins created from the platform console
- every manager/employee created by a company admin or manager

Self-signup company admins choose their own password and start with the flag off.

### leaves

Stores all leave requests submitted by employees and managers.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| employee_id | BIGINT | NOT NULL, FK → employees.id |
| leave_type | leave_type | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| reason | TEXT | NOT NULL |
| status | leave_status | NOT NULL, DEFAULT 'PENDING' |
| manager_comments | TEXT | NULLABLE (decision note attached to approve/reject) |
| decided_by_id | BIGINT | FK → employees.id (who approved/rejected; SET NULL on delete) |
| decided_at | TIMESTAMP WITH TIME ZONE | NULLABLE (when the decision was made) |
| cancelled_by_id | BIGINT | FK → employees.id (who cancelled; SET NULL on delete) |
| cancelled_at | TIMESTAMP WITH TIME ZONE | NULLABLE (when the leave was cancelled) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

### leave_comments

Discussion-thread comments on a leave request. Comments are independent of the leave
status — they can be posted before, during, or after the decision. System comments
(`APPROVED - ...`, `REJECTED - ...`, `CANCELLED - ...`) are also stored here.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| leave_id | BIGINT | NOT NULL, FK → leaves.id (CASCADE on delete) |
| author_id | BIGINT | NOT NULL, FK → employees.id (author of the comment) |
| comment | TEXT | NOT NULL |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

### leave_balances

Tracks available leave days per employee, per leave type, per year. Balance is
deducted when a leave is approved and restored when an approved leave is cancelled.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| employee_id | BIGINT | NOT NULL, FK → employees.id |
| leave_type | leave_type | NOT NULL |
| total_days | INTEGER | NOT NULL (total allocated days for the year) |
| used_days | INTEGER | NOT NULL, DEFAULT 0 (days consumed via approved leaves) |
| year | INTEGER | NOT NULL |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

**Unique Constraint:** `(employee_id, leave_type, year)` — one balance row per
employee per leave type per year.

New accounts receive ANNUAL 20, SICK 12, and PERSONAL 5 days for the current year.

## ENUM Types

### employee_role
- `SUPER_ADMIN` — Platform owner: manage companies, suspend/reactivate them, view
  platform-wide counts. No company leave/employee access.
- `ADMIN` — Company-wide access: manage that company's employees, departments, and
  all leave balances.
- `MANAGER` — Team-level access: manage direct reports, approve/reject team leaves,
  edit team balances.
- `EMPLOYEE` — Self-only access: apply for and manage own leaves.

### leave_status
- `PENDING` — Awaiting manager/admin approval
- `APPROVED` — Approved by manager/admin (records `decided_by_id` and `decided_at`)
- `REJECTED` — Rejected by manager/admin with optional comments
- `CANCELLED` — Cancelled by employee (pending or approved)

### leave_type
- `ANNUAL` — Paid time off
- `SICK` — Sick leave
- `PERSONAL` — Personal reasons
- `MATERNITY` — Maternity leave
- `PATERNITY` — Paternity leave
- `OTHER` — Other types

## Constraints and Indexes

### Foreign Keys
- `departments.company_id` → `companies.id` (CASCADE on delete)
- `employees.company_id` → `companies.id` (CASCADE on delete)
- `employees.department_id` → `departments.id` (RESTRICT on delete)
- `employees.manager_id` → `employees.id` (SET NULL on delete)
- `leaves.employee_id` → `employees.id` (CASCADE on delete)
- `leaves.decided_by_id` → `employees.id` (SET NULL on delete)
- `leaves.cancelled_by_id` → `employees.id` (SET NULL on delete)
- `leave_comments.leave_id` → `leaves.id` (CASCADE on delete)
- `leave_comments.author_id` → `employees.id` (CASCADE on delete)
- `leave_balances.employee_id` → `employees.id` (CASCADE on delete)

### Check Constraints
- `leaves`: `end_date >= start_date`

### Indexes
- `idx_companies_active` — Active-company filtering
- `idx_departments_name` — Fast lookup by name
- `idx_departments_company` — Tenant-scoped department lists
- `idx_employees_email` — Fast login by email
- `idx_employees_company` — Tenant-scoped employee lists
- `idx_employees_department` — Filter employees by department
- `idx_employees_manager` — Find team members
- `idx_employees_role` — Filter by role
- `idx_leaves_employee` — Find leaves by employee
- `idx_leaves_status` — Filter by status
- `idx_leaves_employee_status` — Composite: employee's leaves by status
- `idx_leaves_dates` — Date range queries
- `idx_leave_comments_leave` — Find comments for a leave (ordered by created_at)
- `idx_leave_balances_employee` — Find balances by employee
- `idx_leave_balances_year` — Filter balances by year

### Triggers
- `trg_companies_updated_at` — Auto-update `updated_at` on row modification
- `trg_departments_updated_at` — Same for departments
- `trg_employees_updated_at` — Same for employees
- `trg_leaves_updated_at` — Same for leaves
- `trg_leave_balances_updated_at` — Same for leave_balances

## Seed Data

Production starts empty. Accounts are created through:

1. `POST /api/auth/setup` — the platform `SUPER_ADMIN` (one time only)
2. `POST /api/auth/signup-company` — a company, its admin, six departments, and
   default balances
3. `POST /api/employees` — managers and employees added by admins/managers

The Java `DatabaseSeeder` is annotated `@Profile("dev")` and is disabled in
production. In the `dev` profile it seeds one demo company, a platform owner, an
admin, two managers, two employees, and default leave balances — only when the
`companies` table is empty.
