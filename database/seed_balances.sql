INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, year, created_at, updated_at)
SELECT id, 'ANNUAL', 20, 0, EXTRACT(YEAR FROM NOW())::int, NOW(), NOW() FROM employees
WHERE NOT EXISTS (
  SELECT 1 FROM leave_balances lb WHERE lb.employee_id = employees.id AND lb.leave_type = 'ANNUAL' AND lb.year = EXTRACT(YEAR FROM NOW())::int
);

INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, year, created_at, updated_at)
SELECT id, 'SICK', 12, 0, EXTRACT(YEAR FROM NOW())::int, NOW(), NOW() FROM employees
WHERE NOT EXISTS (
  SELECT 1 FROM leave_balances lb WHERE lb.employee_id = employees.id AND lb.leave_type = 'SICK' AND lb.year = EXTRACT(YEAR FROM NOW())::int
);

INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, year, created_at, updated_at)
SELECT id, 'PERSONAL', 5, 0, EXTRACT(YEAR FROM NOW())::int, NOW(), NOW() FROM employees
WHERE NOT EXISTS (
  SELECT 1 FROM leave_balances lb WHERE lb.employee_id = employees.id AND lb.leave_type = 'PERSONAL' AND lb.year = EXTRACT(YEAR FROM NOW())::int
);