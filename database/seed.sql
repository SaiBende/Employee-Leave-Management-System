-- Optional development seed: one company with the six default departments.
-- Accounts are intentionally not seeded here because passwords must be BCrypt
-- hashes created by the application. Use /setup and /signup, or run the backend
-- with the `dev` profile to get the Java demo seeder accounts.

INSERT INTO companies (name, slug, active) VALUES
    ('Demo Company', 'demo-company', TRUE);

INSERT INTO departments (name, company_id) VALUES
    ('General', (SELECT id FROM companies WHERE slug = 'demo-company')),
    ('Engineering', (SELECT id FROM companies WHERE slug = 'demo-company')),
    ('Human Resources', (SELECT id FROM companies WHERE slug = 'demo-company')),
    ('Marketing', (SELECT id FROM companies WHERE slug = 'demo-company')),
    ('Finance', (SELECT id FROM companies WHERE slug = 'demo-company')),
    ('Operations', (SELECT id FROM companies WHERE slug = 'demo-company'));
