DELETE FROM users WHERE email = 'demo@example.com';
INSERT INTO users (name, email, password_hash, preferred_currency, role, created_at, updated_at, is_active)
VALUES ('Demo User', 'demo@example.com', '$2a$10$zXFZ6611U.a56zTt5NHf0.Lq881xvguUYGLR9BYBCXLMBCoRHDjj.', 'USD', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);
SELECT id, name, email, password_hash, role FROM users WHERE email = 'demo@example.com';
