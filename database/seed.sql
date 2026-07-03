-- Seed data for development

-- Departments
INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Marketing'),
    ('Finance'),
    ('Operations');

-- Managers (password: admin123 -> BCrypt hash)
INSERT INTO employees (name, email, password, department_id, role) VALUES
    ('Alice Manager', 'alice@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     (SELECT id FROM departments WHERE name = 'Engineering'), 'MANAGER'),
    ('Bob Manager', 'bob@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     (SELECT id FROM departments WHERE name = 'Human Resources'), 'MANAGER');

-- Employees
INSERT INTO employees (name, email, password, department_id, role, manager_id) VALUES
    ('Charlie Employee', 'charlie@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     (SELECT id FROM departments WHERE name = 'Engineering'), 'EMPLOYEE',
     (SELECT id FROM employees WHERE email = 'alice@company.com')),
    ('Diana Employee', 'diana@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     (SELECT id FROM departments WHERE name = 'Marketing'), 'EMPLOYEE',
     (SELECT id FROM employees WHERE email = 'bob@company.com'));

-- Sample leave requests
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
VALUES
    ((SELECT id FROM employees WHERE email = 'charlie@company.com'), 'ANNUAL', '2026-07-10', '2026-07-12', 'Family vacation', 'PENDING'),
    ((SELECT id FROM employees WHERE email = 'diana@company.com'), 'SICK', '2026-07-05', '2026-07-06', 'Feeling unwell', 'APPROVED');
