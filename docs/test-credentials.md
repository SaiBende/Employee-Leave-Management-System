# Test Credentials & Local Setup

There are no hard-coded production accounts. A fresh database is initialized through
the platform setup flow, and every company is created through public signup or the
platform console.

## Local Walkthrough

```bash
# 1. Start PostgreSQL
docker compose -f backend/docker-compose.yml up -d

# 2. Start the backend (from backend/)
.\mvnw.cmd spring-boot:run

# 3. Start the frontend (from frontend/)
npm run dev
```

Then open `http://localhost:5173` and follow this order:

1. **Platform setup** — `/setup` creates the platform `SUPER_ADMIN`. This is the
   only account that lives outside a company. Sign in later at `/platform/login`.
2. **Company signup** — `/signup` creates a company, its six default departments,
   default leave balances, and the first company `ADMIN`, who chooses their own
   password.
3. **Company admin portal** — `/admin/login`. From here the admin creates managers
   and employees, each with a temporary password.
4. **Manager and employee portals** — `/manager/login` and `/employee/login`.

Company users are forced to change a temporary password on first sign-in.
There is no email service; share temporary passwords directly with the new user.

## Seeded Demo Accounts (`dev` profile only)

Run the backend with `--spring.profiles.active=dev` (or set
`SPRING_PROFILES_ACTIVE=dev`) to seed a demo company. The seeder does nothing in
production, where all data comes from the setup/signup flows.

| Portal | Role | Email | Password |
|--------|------|-------|----------|
| Platform | SUPER_ADMIN | platform@demo.com | Platform@123 |
| Admin | ADMIN (Demo Company) | admin@demo.com | Admin@123 |
| Manager | MANAGER | alice@demo.com | password123 |
| Manager | MANAGER | bob@demo.com | password123 |
| Employee | EMPLOYEE | charlie@demo.com | password123 |
| Employee | EMPLOYEE | diana@demo.com | password123 |

Demo manager mapping:

- **Alice** manages **Charlie** (Engineering)
- **Bob** manages **Diana** (Engineering)

The demo seeder only runs when the `companies` table is empty. Delete the
`ems_postgres_data` (production) or `postgres_data` (local compose) volume to
start over.

## Key URLs

| Page | Role | Path |
|------|------|------|
| Portal chooser | Public | `/login` |
| Platform login | SUPER_ADMIN | `/platform/login` |
| Company admin login | ADMIN | `/admin/login` |
| Manager login | MANAGER | `/manager/login` |
| Employee login | EMPLOYEE | `/employee/login` |
| First-run platform setup | Public (one time) | `/setup` |
| Company signup | Public | `/signup` |
| Platform overview | SUPER_ADMIN | `/platform/dashboard` |
| Company management | SUPER_ADMIN | `/platform/companies` |
| Change password | All signed-in users | `/change-password` |
| Dashboard | ADMIN / MANAGER / EMPLOYEE | `/admin/dashboard`, `/manager/dashboard`, `/employee/dashboard` |
| Apply leave | EMPLOYEE / MANAGER | `/employee/leaves/apply` |
| Leave history | EMPLOYEE | `/employee/leaves` |
| My leave balances | EMPLOYEE | `/employee/balances` |
| Pending approvals | MANAGER | `/manager/pending` |
| My team | MANAGER | `/manager/employees` |
| Team leave balances | MANAGER | `/manager/balances` |
| Org-wide pending approvals | ADMIN | `/admin/pending` |
| All leaves (with discussions) | ADMIN | `/admin/leaves` |
| All employees | ADMIN | `/admin/employees` |
| Departments | ADMIN | `/admin/departments` |
| Calendar (role-scoped) | All company roles | `/calendar` |
| Profile | All company roles | `/employee/profile` |

## Role Rules

- A company admin can create managers and employees, never another admin.
- A manager can create employees only.
- The platform super admin manages companies but has no access to company leave
  or employee endpoints.
- Companies are suspended from the platform console. Suspension blocks existing
  tokens immediately and prevents new logins.
- Platform-created company admins and all newly created managers/employees get a
  temporary password and must change it on first sign-in.
- Self-signup company admins choose their own password and are not forced to
  change it.
