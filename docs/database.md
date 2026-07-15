# Database Schema

## Overview

PostgreSQL 16 database with four tables: `departments`, `employees`, `leaves`, and `leave_balances`. Uses ENUM types for roles, leave statuses, and leave types.

## Entity Relationship Diagram

```
┌────────────────────┐
│    departments     │
├────────────────────┤
│ PK  id (BIGSERIAL) │
│     name (UNIQUE)  │
│     created_at     │
│     updated_at     │
└────────┬───────────┘
         │ 1
         │
         │ *
┌────────┴───────────┐
│     employees      │
├────────────────────┤
│ PK  id (BIGSERIAL) │
│     name           │
│     email (UNIQUE) │
│     password       │
│ FK  department_id  │
│     role (ENUM)    │
│ FK  manager_id     │
│     created_at     │
│     updated_at     │
└────────┬───────────┘
         │ 1
         │
         │ *
┌────────┴───────────┐
│      leaves        │
├────────────────────┤
│ PK  id (BIGSERIAL) │
│ FK  employee_id    │
│     leave_type     │
│     start_date     │
│     end_date       │
│     reason         │
│     status (ENUM)  │
│     manager_comments
│     created_at     │
│     updated_at     │
└────────────────────┘

┌────────────────────┐
│   leave_balances   │
├────────────────────┤
│ PK  id (BIGSERIAL) │
│ FK  employee_id    │
│     leave_type     │
│     total_days     │
│     used_days      │
│     year           │
│     created_at     │
│     updated_at     │
└────────────────────┘
UNIQUE(employee_id, leave_type, year)
```

## Tables

### departments

Stores organizational departments.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

### employees

Stores all users (both managers and regular employees). Self-referencing for manager hierarchy.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt hash) |
| department_id | BIGINT | NOT NULL, FK → departments.id |
| role | employee_role | NOT NULL, DEFAULT 'EMPLOYEE' |
| manager_id | BIGINT | FK → employees.id (self-reference) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

### leaves

Stores all leave requests submitted by employees.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| employee_id | BIGINT | NOT NULL, FK → employees.id |
| leave_type | leave_type | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| reason | TEXT | NOT NULL |
| status | leave_status | NOT NULL, DEFAULT 'PENDING' |
| manager_comments | TEXT | NULLABLE |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() |

### leave_balances

Tracks available leave days per employee, per leave type, per year. Balance is deducted when a manager approves a leave.

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

**Unique Constraint:** `(employee_id, leave_type, year)` — one balance row per employee per leave type per year.

## ENUM Types

### employee_role
- `MANAGER` — Can manage team, approve/reject leaves
- `EMPLOYEE` — Can apply and manage own leaves

### leave_status
- `PENDING` — Awaiting manager approval
- `APPROVED` — Approved by manager
- `REJECTED` — Rejected by manager with optional comments
- `CANCELLED` — Cancelled by employee

### leave_type
- `ANNUAL` — Paid time off
- `SICK` — Sick leave
- `PERSONAL` — Personal reasons
- `MATERNITY` — Maternity leave
- `PATERNITY` — Paternity leave
- `OTHER` — Other types

## Constraints and Indexes

### Foreign Keys
- `employees.department_id` → `departments.id` (RESTRICT on delete)
- `employees.manager_id` → `employees.id` (SET NULL on delete)
- `leaves.employee_id` → `employees.id` (CASCADE on delete)
- `leave_balances.employee_id` → `employees.id` (CASCADE on delete)

### Check Constraints
- `leaves`: `end_date >= start_date`

### Indexes
- `idx_departments_name` — Fast lookup by name
- `idx_employees_email` — Fast login by email
- `idx_employees_department` — Filter employees by department
- `idx_employees_manager` — Find team members
- `idx_employees_role` — Filter by role
- `idx_leaves_employee` — Find leaves by employee
- `idx_leaves_status` — Filter by status
- `idx_leaves_employee_status` — Composite: employee's leaves by status
- `idx_leaves_dates` — Date range queries
- `idx_leave_balances_employee` — Find balances by employee
- `idx_leave_balances_year` — Filter balances by year

### Triggers
- `trg_departments_updated_at` — Auto-update `updated_at` on row modification
- `trg_employees_updated_at` — Same for employees
- `trg_leaves_updated_at` — Same for leaves
- `trg_leave_balances_updated_at` — Same for leave_balances

## Seed Data

The `DatabaseSeeder` (Java `CommandLineRunner`) auto-populates on startup when the database is empty:

- **5 departments**: Engineering, Human Resources, Marketing, Finance, Operations
- **4 employees**: 2 managers (Alice, Bob), 2 employees (Charlie, Diana)
- **0 leaves**: No seed leaves (created through the application)
- **Initial leave balances**: Each employee gets 20 Annual, 12 Sick, and 5 Personal days
