-- Adds role support for existing users table.
-- Run once on already-provisioned databases.

SET @has_role := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'role'
);

SET @sql := IF(
  @has_role = 0,
  "ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' AFTER password_hash",
  "SELECT 'users.role already exists' AS message"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional: promote one account to admin (replace email first)
-- UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
